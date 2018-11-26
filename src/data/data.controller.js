const axios = require('axios');
const {conf} = require('mono-core');
var moment = require('moment');

const oehuMongoDriver = require('./mongoDriver.js');
const mongoDriver = new oehuMongoDriver();

const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

exports.getAssetsWithMetadata = async (req, res) => {
    let result = [];
    let assets;

    let deviceId = req.query.deviceId;
    if (deviceId) {
        assets = await mongoDriver.getAssets(deviceId)
    } else {
        assets = await mongoDriver.getAssets()
    }

    // Loop over assets
    for (const asset of assets) {
        let transaction = await mongoDriver.getTransactions(asset.id, 1);
        if(transaction[0] && transaction[0].id) {
            let metadata = await mongoDriver.getMetadata(transaction[0].id);
            result.push({
                deviceId: asset.id,
                transaction: transaction,
                metadata: metadata
            });
        }
    }

    res.json(result);
}
exports.getStatistics = async (req, res) => {
    let assets;
    let statistics = {
        devicesConnected: 0,
        averageUseEnergy: 0,
        averageGeneratedEnergy: 0,
        averageUseGas: 0,
    };
    let averageUseEnergy = [];
    let averageGeneratedEnergy = [];
    let averageUseGas = [];

    let deviceId = req.query.deviceId;
    if (deviceId) {
        assets = await mongoDriver.getAssets(deviceId)
    } else {
        assets = await mongoDriver.getAssets()
    }

    yesterday = moment().subtract(1, 'day').valueOf();

    let promises = [];

    // Loop all devices
    assets.forEach(function (asset) {

        // For every device, get additional info 
        let promise = new Promise(resolve => {

            // Get yesterdays state
            let transactionPastPromise = mongoDriver.getTransactionFromTimestamp(asset.id, yesterday);

            // Get todays state
            let transactionNowPromise = mongoDriver.getTransactions(asset.id, 1);

            Promise.all([transactionPastPromise, transactionNowPromise]).then(function (values) {

                if (values[0].length === 1 && values[1].length === 1) {

                    // Get yesterdays metadata
                    let transactionPastMetadataPromise = mongoDriver.getMetadata(values[0][0].id);

                    // Get todays metadata
                    let transactionNowMetadataPromise = mongoDriver.getMetadata(values[1][0].id);

                    Promise.all([transactionPastMetadataPromise, transactionNowMetadataPromise]).then(function (values) {
                        // Only process metadata if there are actual values
                        if (values[0].metadata.electricityReceived !== undefined && values[1].metadata.electricityReceived !== undefined) {

                            // Calculate average electricity use
                            let totalElectricityReceivedPast = values[0].metadata.electricityReceived.total;
                            let totalElectricityReceivedNow = values[1].metadata.electricityReceived.total;
                            averageUseEnergy.push(totalElectricityReceivedNow - totalElectricityReceivedPast);

                            // Calculate average electricity production
                            let totalElectricityGeneratedPast = values[0].metadata.electricityDelivered.total;
                            let totalElectricityGeneratedNow = values[1].metadata.electricityDelivered.total;
                            averageGeneratedEnergy.push(totalElectricityGeneratedNow - totalElectricityGeneratedPast);

                            // Calculate average gas use
                            let totalGasReceivedPast = values[0].metadata.gasReceived;
                            let totalGasReceivedNow = values[1].metadata.gasReceived;
                            averageUseGas.push(totalGasReceivedNow - totalGasReceivedPast);

                            // Count device if this was active in the last 24 hours
                            // Only count device if total kWh use > 0.01 kWh
                            if(totalElectricityReceivedNow > 0.01)
                                statistics.devicesConnected += 1;

                            resolve();
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            });
        });
        promises.push(promise);
    });

    Promise.all(promises).then(function () {
        statistics.averageUseEnergy = average(averageUseEnergy);
        statistics.averageGeneratedEnergy = average(averageGeneratedEnergy);
        statistics.averageUseGas = average(averageUseGas);
        res.json(statistics);
    });
}
/**
 *
 * @param req (deviceId/raw)
 * @param res
 * @returns {Promise<void>}
 */
exports.listDataEntries = async (req, res) => {
    let assets = await mongoDriver.getAssets();
    assets = assets.reverse();

    if ( ! req.query.raw) {
        let simplifiedAssets = [];
        for (let key in assets) {
            let asset = assets[key];
        }
    }
    res.json(assets);
}

// getTransactionHistoryForAsset :: Int -> Object
const getTransactionHistoryForAsset = async function (assetId, precission) {

    let ret = [];

    // Get last X transactions
    let transactions = await mongoDriver.getTransactions(assetId, 24, precission);

    // Get metadata
    for (var i = 0; i <= transactions.length - 1; i++) {
        let transaction = transactions[i];
        let metadata = await mongoDriver.getMetadata(transactions[i].id);
        transaction.metadata = metadata;
        // Only process metadata if there are actual values
        if (metadata && metadata.metadata && metadata.metadata.electricityReceived !== undefined) { 
            ret.push(transaction);
        }
    }

    return ret;
}

exports.listTransactions = async (req, res) => {
    let deviceId = req.query.deviceId;
    let precission = req.query.precission;

    let assets = await mongoDriver.getAssets(deviceId ? deviceId : false);
    assets = assets.reverse();

    //TODO: check if this works, sort by date, implement start/end
    let allTransactions = [];
    for (var i = 0; i <= assets.length - 1; i++) {
        let transactions = await getTransactionHistoryForAsset(assets[i].id, precission);

        if ( req.query.raw) {
            transactions.forEach((transaction) => {
                allTransactions.push(transaction);
            });
        }
        // In non-raw version: only return metadata
        else {
            transactions.forEach((transaction) => {
                transaction = {
                    id: transaction.id,
                    metadata: transaction.metadata
                }
                allTransactions.push(transaction);
            });
        }
    };

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