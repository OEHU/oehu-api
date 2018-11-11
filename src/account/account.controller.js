const { HttpError, conf } = require('mono-core');
const R = require('ramda');
const bcrypt = require('bcrypt');

const Accounts = require('./account.service');

const saltRounds = 10;

exports.createNewAccount = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const deviceId = req.body.deviceId;
    Accounts.get({email: email}).then((account)=>{
        if (account) {
            res.statusCode = 403;
            res.json({message: 'Account already exists'});
        } else { //can be nice
            bcrypt.hash(password, saltRounds, function (err, hash) {
                Accounts.create({email: email, hash: hash, devices: [deviceId]}).then((account)=>{
                    res.json({account});
                });
            });
        }
    });
}

exports.loginToAccount = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    Accounts.get({email: email}).then((account)=> {
        if (account) {
            bcrypt.compare(password, account.hash, function (err, authenticated) {
                if (authenticated === true) {
                    res.json({
                        email: account.email,
                        devices: account.devices
                    });
                } else {
                    res.statusCode = 401;
                    res.json({message: 'Invalid'})
                }
            });
        } else {
            res.json({message: 'Invalid'})
        }
    });
}
