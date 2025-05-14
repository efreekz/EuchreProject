const UserModel = require('../user.model');
const bcrypt = require("bcryptjs")
const bodyParser = require('body-parser');
const config = require('../../../config/config')
const verifyToken = require('../../../utilities/emailVerifyToken')
const DescopeClient = require('@descope/node-sdk').default;

const verifyEmail = async (token) => {
    try {
        const decoded = verifyToken(token)
        if (decoded.status == false) {
            return decoded
        }
        let userExists = await UserModel.findOne({ email: decoded?.email, active: true })
        if (userExists) {
            const descopeClient = DescopeClient({ projectId: config?.DESCOPEP_PROJECT_ID, managementKey: config?.DESCOPE_MANAGEMENT_KEY, });

            let updatedUser = await UserModel.findOneAndUpdate({ email: decoded?.email, active: true }, { isEmailVerified: true })

            // Call Descope's update method to verify the email
            const loginId = updatedUser?.email
            const updatedDescope = await descopeClient.management.user.update(
                loginId,
                {
                    verifiedEmail: true,
                    email: updatedUser?.email
                }
            );

            if (!updatedDescope.ok) {
                console.log('Failed to update email verification status in Descope:', updatedDescope.error);
                // You can return an error message or continue based on your application's needs
            } else {
                return { msg: 'Email Verification status updated', status: true, code: 200, data: updatedDescope?.data }
            }
        } else {
            return { msg: 'User does not exist.', status: false, code: 400 }
        }


    } catch (error) {

        return { msg: error.message, status: false, code: 500 };

    }
};

module.exports = verifyEmail;