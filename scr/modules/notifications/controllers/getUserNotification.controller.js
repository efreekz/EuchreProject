const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const walletServices = require("../services");

const getUserNotification = catchAsync(async (req, res) => {
	let user = req.user;

	let result = await walletServices.getUserNotification({ user, req })
	if (result?.status) {
		sendResponse(res,
			result?.code == 201 ? httpStatus.CREATED
				: httpStatus.OK, result, null
		);
	} else if (result?.code == 400) {
		sendResponse(res,
			result?.code == 400 ? httpStatus.BAD_REQUEST
				: httpStatus.BAD_REQUEST,
			null,
			result
		)
	} else if (result?.code == 401) {
		sendResponse(res,
			result?.code == 401 ? httpStatus.UNAUTHORIZED
				: httpStatus.UNAUTHORIZED,
			null,
			result
		)
	} else if (result?.code == 409) {
		sendResponse(res,
			result?.code == 409 ? httpStatus.CONFLICT
				: httpStatus.BAD_REQUEST,
			null,
			result?.msg
		)
	} else if (result?.code == 200) {
		sendResponse(res,
			result?.code == 200 ? httpStatus.OK
				: httpStatus.BAD_REQUEST,
			null,
			result
		)
	} else {
		sendResponse(res,
			result?.code == 500 ? httpStatus.INTERNAL_SERVER_ERROR
				: httpStatus.BAD_REQUEST,
			null,
			result?.msg
		)
	}
});

module.exports = getUserNotification