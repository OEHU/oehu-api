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
        statistics.averageUseEnergy = average(averageUseGas);
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