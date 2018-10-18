/**
 * MongoDB
 */
const MongoClient = require('mongodb').MongoClient;
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

        let query;
        if (deviceId) {
            query = {"data.id": deviceId}
        } else {
            query = {}
        }

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
            metadata.then(function(res, err) {
                resolve(res, err);
            })
        });
    }
    async getTransactions(assetId) {
        let self = this;
        return new Promise(resolve => {
            self.transactionCollection.find({"asset.id": assetId})
            .toArray(function (err, res) {
                assert.equal(err, null);
                resolve(res);
            });
        });
    }
}

module.exports = OehuMongoDriver;

