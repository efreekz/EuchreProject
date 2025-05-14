const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
		PORT: Joi.number().default(3001),
		RESET_REDIREACT_LINK: Joi.string().required().description('redirect link'),
		FRONTEND_URL: Joi.string().uri().required().description('Mongo DB URL'),
		MONGODB_URL: Joi.string().uri().required().description('Mongo DB URL'),
		DESCOPEP_PROJECT_ID: Joi.string().required().description('Descope Project ID'),
		DESCOPE_MANAGEMENT_KEY: Joi.string().required().description('Descope Management ID'),
		EMAIL_HOST: Joi.string().required().description('host mail'),
		EMAIL_PORT: Joi.number().required().description('mail port'),
		EMAIL_SECURE: Joi.boolean().required().description('mail secoure'),
		EMAIL_USER: Joi.string().required().description('admin mail'),
		EMAIL_PASS: Joi.string().required().description('admin mail pass'),
		JWT_SECRET: Joi.string().required().description('JWT secret key'),
		JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(60).description('Minutes after which access tokens expire'),
		JWT_REFRESH_EXPIRATION_MINUTES: Joi.number().default(60).description('Minutes after which refresh tokens expire'),
		JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
			.default(10)
			.description('Minutes after which reset password token expires'),
		JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
			.default(10)
			.description('Minutes after which verify email token expires'),
		MIN_IO_SECRET_KEY: Joi.string().required().description('MIN IO secret key'),
		MIN_IO_ACCESS_KEY: Joi.string().required().description('MIN IO Access key'),
		MIN_IO_BASE_URL: Joi.string().required().description('MIN_IO_BASE_URL'),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	DESCOPEP_PROJECT_ID: envVars.DESCOPEP_PROJECT_ID,
	RESET_REDIREACT_LINK: envVars.RESET_REDIREACT_LINK,
	DESCOPE_MANAGEMENT_KEY: envVars.DESCOPE_MANAGEMENT_KEY,
	FRONTEND_URL: envVars.FRONTEND_URL,
	minIo: {
		secret: envVars.MIN_IO_SECRET_KEY,
		accessKey: envVars.MIN_IO_ACCESS_KEY,
		baseUrl: envVars.MIN_IO_BASE_URL,
	},
	mongoose: {
		url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
		options: {
			// useCreateIndex: true,
			// useNewUrlParser: true,
			// useUnifiedTopology: true,
		},
	},
	jwt: {
		secret: envVars.JWT_SECRET,
		accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
		refreshExpirationMinutes: envVars.JWT_REFRESH_EXPIRATION_MINUTES,
		resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
		verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
	},
	SMTP: {
		EMAIL_HOST: envVars.EMAIL_HOST,
		EMAIL_PORT: envVars.EMAIL_PORT,
		EMAIL_SECURE: envVars.EMAIL_SECURE,
		EMAIL_USER: envVars.EMAIL_USER,
		EMAIL_PASS: envVars.EMAIL_PASS
	}
};