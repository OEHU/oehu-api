const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const urlMongo = 'mongodb://188.166.15.225:27017'
const dbName = 'bigchain'

class OehuMongoDriver {

    constructor(opts) {
        if (!opts) {
            opts = {};
        }

        this.db = null;
        this.collection = null;

        MongoClient.connect(urlMongo, function (err, client) {
            assert.equal(null, err);
            console.log("Connected successfully to server");

            this.db = client.db(dbName);
            this.collection = this.db.collection('assets');
        });

    }

    async test() {
        this.collection.find({ $text: { $search: 'coffe chocolate two' } } )
            .toArray(function(err, docs) {
                assert.equal(err, null);
                console.log("Found the following records");
                console.log(docs);

                return docs;
            });
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


