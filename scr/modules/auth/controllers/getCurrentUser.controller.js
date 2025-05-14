const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const authService = require("../services");

const getCurrentUser = catchAsync(async (req, res) => {
	let user = req.user || null;

	if (user) {
		sendResponse(res, httpStatus.OK, user.publicProfile, null);
	} else {
		sendResponse(res,
			httpStatus.UNAUTHORIZED,
			null,
			"Unauthorized"
		)
	}
	return
	let result = await authService.getCurrentUser({ token })

	if (result?.status) {
		sendResponse(res, httpStatus.OK, result?.data, null);
	} else {
		sendResponse(res,
			result?.code == 500 ? httpStatus.INTERNAL_SERVER_ERROR
				: result?.code == 401 ? httpStatus.UNAUTHORIZED
					: httpStatus.BAD_REQUEST,
			null,
			result?.msg
		)
	}
});

module.exports = getCurrentUser