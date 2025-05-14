const UserModel = require('../user.model');
const TokenServices = require('../../token/token.services')
const bcrypt = require("bcryptjs")
const bodyParser = require('body-parser');
const config = require('../../../config/config');
const Wallet = require('../../wallet/wallet.model');
const { mongo } = require('mongoose');
const { default: mongoose } = require('mongoose');
const generateOTP = require('../../../utilities/generateOtp');
// Correctly import the DescopeClient
const DescopeClient = require('@descope/node-sdk').default;

const sendForgotOtp = async ({ body }) => {
    try {
        let userExists = await UserModel.findOne({ email: body?.loginId, active: true })

        let userExistsUserName = await UserModel.findOne({ userName: body?.loginId, active: true })

        if (userExists || userExistsUserName) {

            const existtedUser = userExistsUserName ? userExistsUserName : userExists;

            if (existtedUser) {
                // const otp = await generateOTP()
                const Token = await TokenServices.generateOTPToken();
                console.log('tokan', Token);
                return { data: Token, status: true, code: 200, msg: "OTP Sended On Your Registered Email!" }
            }


        } else {
            return { msg: "Incorrect login ID or password.", data: null, status: false, code: 400 }
        }

    } catch (error) {

        return { msg: error.message, status: false, code: 500 };

    }
};

module.exports = sendForgotOtp;