/*
** See https://terrajs.org/mono/routes#validation
*/
const Joi = require('joi') // joi is a dependency of mono
const { findValidation } = require('mono-mongodb') // See https://github.com/terrajs/mono-mongodb#utils

exports.listDataEntries = {
    query: Joi.object().keys({
        raw: Joi.boolean(),
        deviceId: Joi.string().min(1).alphanum(),
    })
}

exports.listTransactions = {
	query: Joi.object().keys({
		start: Joi.date(),
        end: Joi.date(),
	})
}
//
// exports.updateTodo = {
// 	params: Joi.object().keys({
// 		id: Joi.string().length(24).alphanum()
// 	}),
// 	body: Joi.object().keys({
// 		title: Joi.string().min(1).required()
// 	})
// }
//
// exports.deleteTodo = {
// 	params: Joi.object().keys({
// 		id: Joi.string().length(24).alphanum()
// 	})
// }
