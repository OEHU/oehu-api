let cors = require('cors');
const dataValidation = require('./data.validation');
const dataController = require('./data.controller');

module.exports = [
    {
        method: 'GET',
        path: '/data',
        validation: dataValidation.listDataEntries,
        handler: [cors(), dataController.listDataEntries],
        doc: {
            name: 'Get all data entries from each device',
            description: 'Returns an array containing objects with "device" information, and a "transactionHistory" array.'
        }
    },
    {
        method: 'GET',
        path: '/transactions',
        validation: dataValidation.listTransactions,
        handler: [cors(), dataController.listTransactions],
        doc: {
            name: 'Get all transactions',
            description: 'Returns an array containing all the transactions in the BigchainDB.'
        }
    },
    {
        method: 'GET',
        path: '/transactionsCount',
        validation: dataValidation.getTransactionsCount,
        handler: [cors(), dataController.getTransactionsCount],
        doc: {
            name: 'Get number of transactions for a deviceId',
            description: 'Returns the number of transactions in the BigchainDB of a asset id'
        }
    },
    {
        method: 'GET',
        path: '/statistics',
        validation: dataValidation.listTransactions,
        handler: [cors(), dataController.getStatistics],
        doc: {
            name: 'Get some cool statistics',
            description: ''
        }
    },
    {
        method: 'GET',
        path: '/statistics/dashboard',
        validation: dataValidation.getDashboardStatistics,
        handler: [cors(), dataController.getDashboardStatistics],
        doc: {
            name: 'Returns dashboard statistics',
            description: ''
        }
    },
    {
        method: 'GET',
        path: '/devices',
        validation: dataValidation.getAssetsWithMetadata,
        handler: [cors(), dataController.getAssetsWithMetadata],
        doc: {
            name: 'Get objects with deviceId and metadata',
            description: ''
        }
    },
]
