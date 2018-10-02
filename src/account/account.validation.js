/*
** See https://terrajs.org/mono/routes#validation
*/
const Joi = require('joi') // joi is a dependency of mono
const { findValidation } = require('mono-mongodb') // See https://github.com/terrajs/mono-mongodb#utils

exports.createNewAccount = {
	body: Joi.object().keys({
		email: Joi.string().email({ minDomainAtoms: 2 }).required(),
		password: Joi.string().min(1).required(),
		deviceId: Joi.string().min(1).required()
	})
}

exports.loginToAccount = {
    body: Joi.object().keys({
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(1).required(),
    })
}