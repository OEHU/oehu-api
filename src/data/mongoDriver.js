/**
 * MongoDB
 */
const {MongoClient, ObjectId} = require('mongodb'); // or ObjectID
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
    async getTransactions(assetId, limit = 100) {
        let self = this;
        return new Promise(resolve => {
            self.transactionCollection.find({"asset.id": assetId})
            .sort({"_id": -1})
            .limit(limit)
            .toArray(function (err, res) {
                assert.equal(err, null);
                resolve(res);
            });
        });
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

