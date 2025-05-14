const httpStatus = require('http-status');
const catchAsync = require('../../../utilities/catchAsync');
const sendResponse = require('../../../utilities/responseHandler');
const storeServices = require("../services");

const getStoreDataByType = catchAsync(async (req, res) => {
    let { type } = req?.params || {};
    
    let getResult = await storeServices.getStoreDataByType({ type })

    if (getResult?.code == 200 ) {
        sendResponse(res, httpStatus.OK, getResult?.data, null
        );
    } else {
        sendResponse(res,
            getResult?.code == 400 ? httpStatus.INTERNAL_SERVER_ERROR
                : httpStatus.BAD_REQUEST,
            null,
            addResult?.msg
        )
    }
});

module.exports = getStoreDataByType