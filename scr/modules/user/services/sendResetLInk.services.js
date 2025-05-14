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

const sendResetLink = async ({ body }) => {
    try {
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

            // Step 1: Send reset password request
            const templateOptions = { "option": "Value1" }
            const resetResp = await descopeClient.password.sendReset(loginId, `${config.RESET_REDIREACT_LINK}?loginId=${loginId}`);
            console.log('Reset Response:', resetResp);

            if (resetResp.ok) {
                return { data: resetResp, status: true, code: 200, msg: "Link Sended To Your Registered Email." };
            }else{
                return { msg: "error from descope", data: resetResp, status: false, code: 400 };
            }
        } else {
            return { msg: "Incorrect login ID or password.", data: null, status: false, code: 400 };
        }
    } catch (error) {
        console.error('Error in sendResetLink:', error);
        return { msg: error.message, status: false, code: 500 };
    }
};


module.exports = sendResetLink;