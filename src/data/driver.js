const Bigchaindb = require("bigchaindb-driver");
const Orm = require("bigchaindb-orm").default;

// class Device {
//     constructor(height, width) {
//         this.height = height;
//         this.width = width;
//     }
// }

class VehBigchainDriver {

    constructor(opts) {
        if (!opts) {
            opts = {};
        }
        //initialise orm
        this.orm = new Orm(opts.network || "https://test.bigchaindb.com/api/v1/",
            {
                app_id: opts.app_id || '3b959424',
                app_key: opts.app_key || '30c12a0e15343d705a7e7ccb6d75f1c0'
            });
        this.keyPair = opts.keyPair || new this.orm.driver.Ed25519Keypair();
        this.orm.define("devices", '');

        this.registerDevice = this.registerDevice.bind(this);
        this.getDeviceInfo = this.getDeviceInfo.bind(this);
        this.update = this.update.bind(this);

    }

    async registerDevice(_deviceType, _location, _locationAccuracy, _householdType, _occupants) {
        console.log("BEGINNING REGISTRATION...");
        let asset = await this.orm.models.devices.create({
            keypair: this.keyPair,
            data: {
                deviceType: _deviceType,
                location: {type: "Point", coordinates: [_location.lat, _location.long]}, //GEOJSON easy querying
                locationAccuracy: _locationAccuracy,
                householdType: _householdType,
                occupants: _occupants,
                //readings
                lastUpdate: 0,
                electricityReceived: {
                    total: 0,
                    tarrif1: 0,
                    tariff2: 0
                },
                electricityDelivered: {
                    total: 0,
                    tarrif1: 0,
                    tariff2: 0
                },
                gasReceived: 0
            }
        });

        return asset.id; //return the device id
    }

    async getDeviceInfo(deviceID) {
        let asset = await this.orm.models.devices.retrieve(deviceID);
        return asset[0];
    }

    async update(_deviceID, reading) {
        let asset = await this.getDeviceInfo(_deviceID);

        let updatedAsset = await asset.append({
            toPublicKey: this.keyPair.publicKey,
            keypair: this.keyPair,
            data: {
                ...asset.data,
                ...reading,
            },
        });

        return updatedAsset;
    }

    // getSimplifiedAssets :: void -> Object
    // Gets all assets from bigchaindb
    async getAssets() {
        let assets = this.orm.models.devices.retrieve();
        return assets;
    }

    async burn(_deviceID) {
        let asset = await this.getDeviceInfo(_deviceID);

        let burnedAsset = await asset.burn({
            keypair: this.keyPair
        });

        return burnedAsset;
    }

}

console.log(typeof VehBigchainDriver);

module.exports = VehBigchainDriver;
