const dataValidation = require('./data.validation')
const dataController = require('./data.controller');

module.exports = [
    {
        method: 'GET',
        path: '/data',
        validation: dataValidation.listDataEntries,
        handler: dataController.listDataEntries,
        doc: {
            name: 'Get all data entries from each device',
            description: 'Returns an array containing objects with "device" information, and a "transactionHistory" array.'
        }
    },
    {
        method: 'GET',
        path: '/transactions',
        validation: dataValidation.listTransactions,
        handler: dataController.listTransactions,
        doc: {
            name: 'Get all transactions',
            description: 'Returns an array containing all the transactions in the BigchainDB.'
        }
    }
]
