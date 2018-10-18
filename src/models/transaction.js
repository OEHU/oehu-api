const mongoose = require('mongoose');

let transactionScheme = new mongoose.Schema({
    "_id": String,
    "id": String,
    "operation": String,
    "outputs": [
        {
            "condition": {
                "details": {
                    "type": String,
                    "public_key": String
                },
                "uri": String
            },
            "amount": String,
            "public_keys": [
                String
            ]
        }
    ],
    "inputs": [
        {
            "fulfillment": String,
            "fulfills": {
                "output_index": String,
                "transaction_id": String
            },
            "owners_before": [
                String
            ]
        }
    ],
    "asset": {
        "id": String
    },
    "version": String
});

let Transaction = mongoose.model('Transaction', transactionScheme);

module.exports = Transaction;
