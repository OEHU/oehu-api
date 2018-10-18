/**
 * MongoDB
 */
// const urlMongo = 'mongodb://188.166.15.225:27017/bigchaindb';
// const mongoose = require('mongoose');
// mongoose.connect(urlMongo, {useNewUrlParser: true});
// let x = require('./models/dataFieldTrigger');

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
            self.collection = self.db.collection('assets');
        });
    }

    async getAssets(req, res) {
        let self = this;
        return new Promise(resolve => {
            self.collection.find({
                // ...
            }).toArray(function (err, res) {
                assert.equal(err, null);
                // console.log("Found the following records");
                // console.log(res);
                resolve(res);
            });
        });
    }

    async test() {
        let assets = await this.collection.find({id: "id:3b959424:devices:891aa2df-9a28-409b-9902-d3d2040c9d85"});
        console.log(assets);
        while (assets.hasNext()) {
            console.log(assets.next());
        }
    }
}

module.exports = OehuMongoDriver;


// Match any of the search terms: 'word1 word2 word3'


// Using AND operator: ' "word1" "word2" '
// collection.find({ $text: { $search: ' "05/01/2016" "04:00" ' } } )
//     .toArray(function(err, docs) {
//         assert.equal(err, null);
//         console.log("Found the following records");
//         console.log(docs);
//     });

// Search for phrase: '"\"phrase to search\""'
// collection.find({ $text: { $search: '"\"coffee shop\""' } } )
//     .toArray(function(err, docs) {
//         assert.equal(err, null);
//         console.log("Found the following records");
//         console.log(docs);
//     });

// Exclude assets with value: '"coffee -shop"'
// collection.find({ $text: { $search: '"coffee -shop"' }})
//     .toArray(function(err, docs) {
//         assert.equal(err, null);
//         console.log("Found the following records");
//         console.log(docs);
//     });


