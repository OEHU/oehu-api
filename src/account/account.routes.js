const accountValidation = require('./account.validation');
const accountController = require('./account.controller');

module.exports = [
    {
        method: 'POST',
        path: '/account/register',
        validation: accountValidation.createNewAccount,
        handler: accountController.createNewAccount,
        doc: {
            name: 'Register a new account',
            description: 'Returns account object when accepted'
        }
    },
    {
        method: 'POST',
        path: '/account/login',
        validation: accountValidation.loginToAccount,
        handler: accountController.loginToAccount,
        doc: {
            name: 'Login to your account',
            description: 'Returns object with email and array with devices'
        }
    },
    // {
    //     method: 'POST',
    //     path: '/account/addDevice',
    //     validation: accountValidation.loginToAccount,
    //     handler: accountController.loginToAccount,
    //     doc: {
    //         name: 'Login to your account',
    //         description: 'Returns object with email and array with devices'
    //     }
    // },
]