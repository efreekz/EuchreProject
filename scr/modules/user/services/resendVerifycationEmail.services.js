const UserModel = require('../user.model');
const bcrypt = require("bcryptjs")
const bodyParser = require('body-parser');
const config = require('../../../config/config')
const verifyToken = require('../../../utilities/emailVerifyToken');
const sendVerificationEmail = require('../../../utilities/verificationMail');
const DescopeClient = require('@descope/node-sdk').default;

const resendVerifycationEmail = async (token) => {
    try {
       
        const decoded = verifyToken(token, true)
        if (decoded.status == false) {
            return decoded
        }
        let userExists = await UserModel.findOne({ email: decoded?.email, active: true })
        if (userExists && userExists?.isEmailVerified == false) {
        const result = await sendVerificationEmail(decoded?.email)

            if (result.status) {
                return { msg: 'Email Verification status updated', status: true, code: 200, data: result }
            } else {
            }
        } else {
            return { msg: 'User does not exist.', status: false, code: 400 }
        }


    } catch (error) {

        return { msg: error.message, status: false, code: 500 };

    }
};

module.exports = resendVerifycationEmail;