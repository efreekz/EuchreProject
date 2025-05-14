const userServices = require("../../user/services");
const ApiError = require("../../../utilities/apiErrors");
const httpStatus = require("http-status");

const tokenService = require("../../token/token.services");
const { tokenTypes } = require("../../../config/tokens");


const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(
            refreshToken,
            tokenTypes.REFRESH
        );
        const user = await userServices.getUserById(refreshTokenDoc.user);

        if (!user) {
            throw new Error();
        }


        const refreshTokenDelete = await tokenService.verifyToken(
            refreshToken,
            tokenTypes.REFRESH
        );
        // await refreshTokenDoc.remove();

        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
    }
};

module.exports = refreshAuth;