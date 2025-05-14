const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const userService = require("../services");

const login = catchAsync(async (req, res) => {
	let body = req?.body || {};

	let addResult = await userService.login({ body })

	if (addResult?.status) {
		sendResponse(res, httpStatus.OK, addResult?.data, null
		);
	} else {
		sendResponse(res,
			addResult?.code == 500 ? httpStatus.INTERNAL_SERVER_ERROR
				: addResult?.code == 401 ? httpStatus.UNAUTHORIZED
					: httpStatus.BAD_REQUEST,
			null,
			addResult
		)
	}
});

module.exports = login