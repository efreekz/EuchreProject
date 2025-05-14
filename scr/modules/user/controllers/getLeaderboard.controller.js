const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const userService = require("../services");

const getLeaderboard = catchAsync(async (req, res) => {

	console.log('in get leadder board controller')
	let addResult = await userService.getLeaderboard(req)

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

module.exports = getLeaderboard