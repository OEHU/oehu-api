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

    let promises = [];
    assets.forEach(function (asset) {
        let promise = mongoDriver.getMetadata(asset.id).then((res, err) => {
            result.push({
                deviceId: asset.id,
                metadata: res.metadata
            });
        });
        promises.push(promise);
    });

    Promise.all(promises).then(function () {
        res.json(result);
    });
}
exports.getStatistics = async (req, res) => {
    let assets;
    let statistics = {
        devicesConnected: 0,
        averageUseEnergy: 0,
        averageGeneratedEnergy: 0,
        averageUseGas: 0,
    };

    let deviceId = req.query.deviceId;
    if (deviceId) {
        assets = await mongoDriver.getAssets(deviceId)
    } else {
        assets = await mongoDriver.getAssets()
    }

    let d = new Date(); // Today!
    let yesterday = d.setDate(d.getDate() - 1); // Yesterday!

    statistics.devicesConnected = assets.length;
    res.json('hi');

    let promises = [];
    assets.forEach(function (asset) {

        let transactionPastPromise = mongoDriver.getTransactionFromTimestamp(asset.id, yesterday);
        let transactionNowPromise = mongoDriver.getTransactions(asset.id, 1);
        let transactionPastMetadataPromise;
        let transactionNowMetadataPromise;

        transactionPastPromise.then(function (res) {
            if (!R.isEmpty(res)) {
                transactionPastMetadataPromise = mongoDriver.getMetadata(res[0].id);
            }
        });

        transactionNowPromise.then(function (res) {
            if (!R.isEmpty(res)) {
                transactionNowMetadataPromise = mongoDriver.getMetadata(res[0].id)
            }
        });

        //Because yay promises
        let promise = new Promise(resolve => {
            Promise.all([transactionPastPromise, transactionNowPromise]).then(function () {
                Promise.all([transactionPastMetadataPromise, transactionNowMetadataPromise]).then(function () {
                    transactionNowMetadataPromise.then(function (nowRes) {
                        transactionPastMetadataPromise.then(function (pastRes) {
                            console.log("_____");
                            console.log(nowRes);
                            console.log(pastRes);
                            console.log("_____");
                            resolve()
                        });
                    });
                });
            });
        });
        promises.push(promise);
    });

    Promise.all(promises).then(function () {

    });
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
        for (let key in assets) {
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

/*
  Cors middleware
  This needs to be more strict in production
 */
exports.cors = async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}