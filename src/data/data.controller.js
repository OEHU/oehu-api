const axios = require('axios');
const {conf} = require('mono-core');
const R = require('ramda');

const VehBigchainDriver = require('./driver.js');
const vehDriver = new VehBigchainDriver({
    network: 'http://188.166.15.225:9984/api/v1/'
});

exports.listDataEntries = async (req, res) => {
    let assets = await vehDriver.getAssets();
    assets = assets.reverse();
    if (!req.query.raw) {
        let simplifiedAssets = [];
        assets.forEach((asset) => {
            let transactionHistory = [];
            let rawTransactionHistory = asset.transactionHistory;
            rawTransactionHistory.forEach((transaction) => {
                transactionHistory.push(transaction.metadata);
            });
            let device = asset.data;
            let id = asset.id;
            simplifiedAssets.push({id, device, transactionHistory});
            assets = simplifiedAssets;
        });
    }
    res.json(assets);
}

exports.listTransactions = async (req, res) => {
    let assets = await vehDriver.getAssets();
    assets = assets.reverse();

    //TODO: check if this works, sort by date, implement start/end
    let allTransactions = [];
    assets.forEach((asset) => {
        let transactions = asset.transactionHistory;

        if (!req.query.raw) {
            transactions.forEach((transaction) => {
                allTransactions.push(transaction.metadata);
            });
        }
    });

    allTransactions = allTransactions.sort(function (a, b) {
        return Date.parse(a.timestamp) - Date.parse(b.timestamp);
    });
    res.json(allTransactions);
}
