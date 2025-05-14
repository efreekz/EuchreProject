const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const levelServices = require("../service");

const getAllGamesAdmin = catchAsync(async (req, res) => {
  
    let addResult = await levelServices.getAllGamesAdmin(req)

    if (addResult?.status) {
        sendResponse(res,
            addResult?.code == 201 ? httpStatus.CREATED
                : httpStatus.OK, addResult?.data, null
        );
    } else {
        sendResponse(res,
            addResult?.code == 500 ? httpStatus.INTERNAL_SERVER_ERROR
                : httpStatus.BAD_REQUEST,
            null,
            addResult?.msg
        )
    }
});

module.exports = getAllGamesAdmin