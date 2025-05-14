const Joi = require('joi');

const registerSchema = {
	body: Joi.object().keys({
		userName: Joi.string().trim().required().messages({
			"string.empty": `Username must contain value`,
			"any.required": `Username is a required field`,
		}),
		referralCode: Joi.string().allow(""),
		email: Joi.string().trim().email().required().messages({
			"string.empty": `Email must contain value`,
			"any.required": `Email is a required field`,
			"string.email": `Email must be a valid email`,
		}),
		password: Joi.string().trim().min(8).required().messages({
			"string.empty": `Password must contain value`,
			"any.required": `Password is a required field`,
			"string.min": `Password length must be at least 8 characters long`,
		}),
	})
};

const loginSchema = {
	body: Joi.object().keys({
		loginId: Joi.string().trim().required().messages({
			"string.empty": `loginId must contain value`,
			"any.required": `loginId is a required field`,
			"string.loginId": `loginId must be a valid loginId`,
		}),
		password: Joi.string().trim().min(8).required().messages({
			"string.empty": `Password must contain value`,
			"any.required": `Password is a required field`,
			"string.min": `Password length must be at least 8 characters long`,
		}),
	})
};

module.exports = {
	registerSchema,
	loginSchema,
};