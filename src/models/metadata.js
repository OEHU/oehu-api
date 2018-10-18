const mongoose = require('mongoose');

let metadataScheme = new mongoose.Schema({
    "_id": String,
    "id": String,
    "metadata": {
        "deviceType": String,
        "location": {
            "type": String,
            "coordinates": [
                Number,
                Number
            ]
        },
        "locationAccuracy": Number,
        "householdType": String,
        "occupants": Number,
        "lastUpdate": Number,
        "electricityReceived": {
            "total": Number,
            "tarrif1": Number,
            "tariff2": Number
        },
        "electricityDelivered": {
            "total": Number,
            "tarrif1": Number,
            "tariff2": Number
        },
        "gasReceived": Number
    }
});

let Metadata = mongoose.model('Metadata', metadataScheme);

module.exports = Metadata;
