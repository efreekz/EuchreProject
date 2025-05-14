const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const userService = require("../services");

const deleteUserById = catchAsync(async (req, res) => {
	let body = req?.body || {};

	let addResult = await userService.deleteUserById({ body })

	if (addResult?.status) {
		sendResponse(res,
			addResult?.code == 201 ? httpStatus.CREATED
				: httpStatus.OK, addResult?.data, addResult?.msg
		);
	}  else if(addResult?.code == 400){
		sendResponse(res,
			addResult?.code == 400 ? httpStatus.BAD_REQUEST
				: httpStatus.BAD_REQUEST,
			null,
			addResult?.data
		)
	} else  if(addResult?.code == 409){
		sendResponse(res,
			addResult?.code == 409 ? httpStatus.CONFLICT
				: httpStatus.BAD_REQUEST,
			null,
			addResult?.msg
		)
	}else {
		sendResponse(res,
			addResult?.code == 500 ? httpStatus.INTERNAL_SERVER_ERROR
				: httpStatus.BAD_REQUEST,
			null,
			addResult?.msg
		)
	}
});

module.exports = deleteUserById