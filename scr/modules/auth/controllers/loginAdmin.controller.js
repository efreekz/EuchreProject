const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const authService = require("../services");

const loginAdmin = catchAsync(async (req, res) => {
	let body = req?.body || {};

	let result = await authService.loginAdmin({ body })

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

module.exports = loginAdmin