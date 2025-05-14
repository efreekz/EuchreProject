const dayjs = require("dayjs");
const config = require("../../config/config");
const { tokenTypes } = require("../../config/tokens");
const jwt = require("jsonwebtoken");
const TokenModel = require("../token/token.model");
const generateOTP = require("../../utilities/generateOtp")

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
	if (!Object.values(tokenTypes).includes(type)) {
		throw new Error('Invalid token type');
	}
	const payload = {
		sub: userId,
		iat: dayjs().unix(),
		exp: expires.unix(),
		type,
	};
	return jwt.sign(payload, secret);
};
const getRefreshToken = (userId, expires, type, secret = config.jwt.secret) => {
    if (!Object.values(tokenTypes).includes(type)) {
        throw new Error('Invalid token type');
    }
    const payload = {
        sub: userId,
        iat: dayjs().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
	try {
		const tokenDoc = await TokenModel.create({
			token,
			user: userId,
			expires: expires.toDate(),
			type,
			blacklisted,
		});
		return tokenDoc;
	} catch (error) {
		console.error('Failed to save tokens:', error);
		throw error;
	}
};

const generateAuthTokens = async (user) => {
	try {
		const accessTokenExpires = dayjs().add(config.jwt.accessExpirationMinutes, 'minute');
		const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

		const refreshTokenExpires = dayjs().add(config.jwt.refreshExpirationMinutes, 'minute');
		const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
		await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);
		return {
			access: {
				token: accessToken,
				expires: accessTokenExpires.toDate(),
			},
			refresh: {
				token: refreshToken,
				expires: refreshTokenExpires.toDate(),
			},
		};
	} catch (error) {
		console.error('Failed to generate tokens:', error);
		throw error;
	}
};
const generateOTPToken = async () => {
	try {
		const otp = await generateOTP()
		const accessTokenExpires = dayjs().add(config.jwt.accessExpirationMinutes, 'minute');
		const accessToken = generateToken(otp, accessTokenExpires, tokenTypes.ACCESS);

		const refreshTokenExpires = dayjs().add(config.jwt.refreshExpirationMinutes, 'minute');
		const refreshToken = generateToken(otp, refreshTokenExpires, tokenTypes.REFRESH);
		return {
			access: {
				token: accessToken,
				expires: accessTokenExpires.toDate(),
			},
			refresh: {
				token: refreshToken,
				expires: refreshTokenExpires.toDate(),
			},
		};
	} catch (error) {
		console.error('Failed to generate tokens:', error);
		throw error;
	}
};


const verifyToken = async (token, type) => {
	try {
		const payload = jwt.verify(token, config.jwt.secret);
		const tokenDoc = await TokenModel.findOne({ token, type, user: payload.sub, blacklisted: false });
		if (!tokenDoc) {
			throw new Error('Token not found');
		}
		return tokenDoc;
	} catch (error) {
		return { msg: error.message }
	}
};

const deleteToken = async (token, type) => {
	try {
		const payload = jwt.verify(token, config.jwt.secret);

		const tokenDoc = await TokenModel.findOne({ token, type, user: payload.sub, blacklisted: false });

		if (!tokenDoc) {
			throw new Error('Token not found');
		}

		await tokenDoc.remove();

		return { msg: 'Token successfully deleted' };
	} catch (error) {
		return { msg: error.message };
	}
};

module.exports = deleteToken;



module.exports = {
	generateToken,
	saveToken,
	generateAuthTokens,
	verifyToken,
	deleteToken,
	generateOTPToken,
	getRefreshToken
}