const axios = require('axios');
const {conf} = require('mono-core');
const R = require('ramda');

const oehuMongoDriver = require('./mongoDriver.js');
const mongoDriver = new oehuMongoDriver();

// const VehBigchainDriver = require('./driver.js');
// const vehDriver = new VehBigchainDriver({
//     network: 'http://188.166.15.225:9984/api/v1/'
// });

exports.getAssetsWithMetadata = async (req, res) => {
    let result = [];
    let assets;

    let deviceId = req.query.deviceId;
    if (deviceId) {
        assets = await mongoDriver.getAssets(deviceId)
    } else {
        assets = await mongoDriver.getAssets()
    }
    await assets.forEach(function(asset) {
        mongoDriver.getMetadata(asset.id).then((res, err) => {
            result.push({
                deviceId: asset.id,
                metadata: res.metadata
            });
        });
    });

    setTimeout(function(){
        res.json(result);
        }, 1000);
}
/**
 *
 * @param req (deviceId/raw)
 * @param res
 * @returns {Promise<void>}
 */
exports.listDataEntries = async (req, res) => {


    if (!req.query.raw) {
        let simplifiedAssets = [];
        for(let key in assets) {
            let asset = assets[key];
        }
    }
    res.json(assets);
}

exports.listTransactions = async (req, res) => {
    let assets = await mongoDriver.getAssets();
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

exports.getStatistics = async (req, res) => {
    // let test = await mongoDriver.test();
    // console.log(test);


    // res.json(test);
}

/*
  Cors middleware
  This needs to be more strict in production
 */
exports.cors = async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}