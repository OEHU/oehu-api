const axios = require('axios');
const {conf} = require('mono-core');
const R = require('ramda');

const oehuMongoDriver = require('./mongoDriver.js');
const mongoDriver = new oehuMongoDriver();

// const VehBigchainDriver = require('./driver.js');
// const vehDriver = new VehBigchainDriver({
//     network: 'http://188.166.15.225:9984/api/v1/'
// });

/**
 *
 * @param req (deviceId/raw)
 * @param res
 * @returns {Promise<void>}
 */
exports.listDataEntries = async (req, res) => {
    let assets = await mongoDriver.getAssets();

    if (req.query.deviceId) {
        let deviceId = req.query.deviceId;
        assets = [assets.find((element) => {
            return element.id === deviceId;
        })];
        //todo: return message if id not found
    } else {
        //todo: reverse / assets = assets.reverse();
        assets = assets;
    }

    if (!req.query.raw) {
        let simplifiedAssets = [];
        console.log('assets!', assets);
        for(let key in assets) {
            let asset = assets[key];
            console.log('ja')
        }
        // assets.forEach((asset) => {
        //     let device = asset.data;
        //     let id = asset.id;
        //     simplifiedAssets.push({id, device});
        //     assets = simplifiedAssets;
        // });
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