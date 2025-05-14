const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utilities/apiErrors');
const { roleRights } = require('../config/enums');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {

	if (err || info || !user) {
		console.error("Authentication error:", err || info);
		return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
	}

	req.user = user;

	if (requiredRights.length) {
		const userRights = roleRights.get(user.role);
		if (!userRights) {
			console.error("Role rights not defined for role:", user.role);
			return reject(new ApiError(httpStatus.FORBIDDEN, 'Role rights not defined'));
		}

		const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
		if (!hasRequiredRights || (req.params.userId && req.params.userId !== user.id)) {
			console.error("This account don't have required rights or user mismatch:", { requiredRights, userRights, userId: req.params.userId, userIdFromToken: user.id });
			return reject(new ApiError(httpStatus.FORBIDDEN, "This account don't have required rights or user mismatch"));
		}
	}

	resolve();
};

const auth = (...requiredRights) => (req, res, next) => {
	return new Promise((resolve, reject) => {
		passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
	})
		.then(() => next())
		.catch((err) => {
			console.error("Error in auth middleware:", err);
			next(err);
		});
};

module.exports = auth;
