/**
 * MongoDB
 */
const {MongoClient, ObjectId} = require('mongodb'); // or ObjectID
const moment = require('moment');
const assert = require('assert');
const config = require('../../config.json');

const urlMongo = config.urlMongo;
const dbName = 'bigchain';

class OehuMongoDriver {

    constructor(opts) {
        let self = this;

        if (!opts) {
            opts = {};
        }

        this.db = null;
        this.collection = null;

        MongoClient.connect(urlMongo, function (err, client) {
            (err) ? console.log(err) : console.log('MongoClient successfully to server');

            self.db = client.db(dbName);
            self.assetCollection = self.db.collection('assets');
            self.metadataCollection = self.db.collection('metadata');
            self.transactionCollection = self.db.collection('transactions');
        });
    }

    async getAssets(deviceId = false) {
        let self = this;

        // Filter on deviceId if deviceId is given
        let query = deviceId ? {"data.id": deviceId} : {};

        return new Promise(resolve => {
            self.assetCollection.find(query)
            .toArray(function (err, res) {
                assert.equal(err, null);
                resolve(res);
            });
        });
    }
    async getMetadata(id) {
        let self = this;
        return new Promise(resolve => {
            let metadata = self.metadataCollection.findOne({"id": id});
            metadata.then(function(res) {
                resolve(res);
            })
        });
    }
    async getTransactions(assetId, limit = 100, presission) {

        let self = this;
        return new Promise(resolve => {
            // Basic projection: https://stackoverflow.com/a/38416467
            // Timestamp conversion: https://stackoverflow.com/a/39274563
            // Check https://dzone.com/articles/mongodb-aggregation-queries-for-counts-per-day-par
            self.transactionCollection.aggregate([{
              $project: {
                _id: 1,
                metadata: 1,
                $toDate: "$metadata.metadata.lastUpdate"
              },
              $project: {
                _id: 1,
                metadata: 1,
                day: {
                  "$dayOfMonth": "$metadata.metadata.lastUpdate"
                },
                month: {
                  "$month": "$metadata.metadata.lastUpdate"
                },
                year: {
                  "$year": "$metadata.metadata.lastUpdate"
                }
              }
            }, {
              $project: {
                _id: 1,
                metadata: 1,
                data: 1,
                eventDate: {
                  $concat: [{
                      $substr: ["$year", 0, 4]
                    },
                    "-", {
                      $substr: ["$month", 0, 2]
                    },
                    "-", {
                      $substr: ["$day", 0, 2]
                    }
                  ]
                }
              }
            }, {
              $group: {
                id: "$metadata.metadata.lastUpdate",
                eventDate: {
                  $first: "$metadata.metadata.lastUpdate"
                },
                metadata: {
                  $first: '$metadata'
                }
              }
            }, {
              $sort: {
                id: 1
              }
            }])
        })
        .toArray(function (err, res) {
            assert.equal(err, null);
            console.log('res')
            console.log(res)//should be {_id: .., metadata: {}}
            resolve(res);
        });

        // let self = this;
        // return new Promise(resolve => {
        //     self.transactionCollection.find({
        //         "asset.id": assetId
        //     })
        //     .sort({"_id": -1})
        //     .limit(limit)
        //     .toArray(function (err, res) {
        //         assert.equal(err, null);
        //         resolve(res);
        //     });
        // });
    }
    async getTransactionFromTimestamp(assetId, timestamp) {
        let self = this;
        return new Promise(resolve => {
            let objectId = Math.floor(timestamp / 1000).toString(16) + "0000000000000000";

            self.transactionCollection.find({"asset.id": assetId, _id: {$gt: ObjectId(objectId)}})
            .limit(1)
            .toArray(function (err, res) {
                assert.equal(err, null);
                resolve(res);
            });
        });
    }
}

module.exports = OehuMongoDriver;

