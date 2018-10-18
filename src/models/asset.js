const mongoose = require('mongoose');

let assetScheme = new mongoose.Schema({
    "_id" : String,
        "data" : {
        "schema" : String,
            "id" : String
    },
    "id" : String
});

let Asset = mongoose.model('Asset', assetScheme);

module.exports = Asset;
