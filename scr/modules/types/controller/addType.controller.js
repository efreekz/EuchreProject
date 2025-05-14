const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const typeServices = require("../services");

const addType = catchAsync(async (req, res) => {
    let body = req?.body || {};
    let user = req?.user
    let addResult = await typeServices.addtype({ user, body })

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

module.exports = addType