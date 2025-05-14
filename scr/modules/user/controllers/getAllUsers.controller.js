const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const userService = require("../services");

const getAllUsers = catchAsync(async (req, res) => {

	let addResult = await userService.getAllUsers(req)

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

module.exports = getAllUsers