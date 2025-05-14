const Joi = require('joi');

const registerAdmin = {
	body: Joi.object().keys({
		userName: Joi.string().trim().required().messages({
			"string.empty": `Username is required and cannot be empty.`,
			"any.required": `Username is a mandatory field.`,
		}),
		referralCode: Joi.string().trim().required().messages({
			"string.empty": `referralCode is required and cannot be empty.`,
			"any.required": `referralCode is a mandatory field.`,
		}),
		email: Joi.string().trim().email().required().messages({
			"string.empty": `Email is required and cannot be empty.`,
			"any.required": `Email address is required.`,
			"string.email": `Email address must be a valid format.`,
		}),
		password: Joi.string().trim().min(8).required().messages({
			"string.empty": `Password is required and cannot be empty.`,
			"any.required": `Password is a mandatory field.`,
			"string.min": `Password must be at least 8 characters long.`,
		}),
	})
};

const loginAdmin = {
	body: Joi.object().keys({
		email: Joi.string().trim().email().required().messages({
			"string.empty": `Email is required and cannot be empty.`,
			"any.required": `Email address is required.`,
			"string.email": `Email address must be a valid format.`,
		}),
		password: Joi.string().trim().required().messages({
			"string.empty": `Password is required and cannot be empty.`,
			"any.required": `Password is a mandatory field.`,
		}),
	})
};
const getCurrentUser = {
	params: Joi.object().keys({
		token: Joi.string().trim().required().messages({
			"string.empty": `Access Token is required and cannot be empty.`,
			"any.required": `Access Token is a mandatory field.`,
		}),
	})
};

module.exports = {
	registerAdmin,
	loginAdmin,
	getCurrentUser
};
