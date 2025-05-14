const UserModel = require('../user.model');
const TokenServices = require('../../token/token.services')
const bcrypt = require("bcryptjs")
const bodyParser = require('body-parser');
const config = require('../../../config/config');
const Wallet = require('../../wallet/wallet.model');
const { mongo } = require('mongoose');
const { default: mongoose } = require('mongoose');
// Correctly import the DescopeClient
const DescopeClient = require('@descope/node-sdk').default;

const forgotPassword = async ({ body }) => {
    try {
        let jwtResponse;
        let userExists = await UserModel.findOne({ email: body?.loginId, active: true });
        let userExistsUserName = await UserModel.findOne({ userName: body?.loginId, active: true });

        if (userExists || userExistsUserName) {
            const existtedUser = userExistsUserName ? userExistsUserName : userExists;
            const descopeClient = DescopeClient({
                projectId: config?.DESCOPEP_PROJECT_ID,
                managementKey: config?.DESCOPE_MANAGEMENT_KEY,
            });

            const loginId = existtedUser?.email;
            console.log('Login ID:', loginId);

            if (body?.token) {
                jwtResponse = await descopeClient.magicLink.verify(body?.token);
            }



            const updateResp = await descopeClient.password.update(loginId, body.password, jwtResponse.data.refreshJwt);
            console.log('Update Response:', updateResp);

            if (updateResp.ok) {
                await UserModel.findOneAndUpdate(
                    { userName: body?.loginId, active: true },
                    { password: body?.password },
                    { new: true }
                )

                // updateResp.data.user.userName = existtedUser.userName;
                if (existtedUser?.isEmailVerified) {
                    return { data: updateResp, status: true, code: 200 };
                } else {
                    return { msg: 'Verify your email. A verification link has been sent to your email address.', status: false, code: 401 };
                }
            } else {
                return { msg: 'Failed to update password.', status: false, code: 400 };
            }
        } else {
            return { msg: 'Failed to initiate password reset.', status: false, code: 400 };
        }

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return { msg: error.message, status: false, code: 500 };
    }
};


module.exports = forgotPassword;