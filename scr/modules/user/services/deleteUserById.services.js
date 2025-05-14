const config = require('../../../config/config');
const UserModel = require('../user.model');
const mongoose = require('mongoose');
const DescopeClient = require('@descope/node-sdk').default;

const deleteUserById = async (req) => {
    const body = req?.body;

    try {
        const descopeClient = DescopeClient({ projectId: config?.DESCOPEP_PROJECT_ID, managementKey: config?.DESCOPE_MANAGEMENT_KEY, });

        // Find the user by ID
        const user = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(body?.id) });

        if (!user) {
            return {
                msg: 'User not found',
                status: false,
                code: 404,
                data: null
            };
        }

        const loginId = user?.email;

        const resp = await descopeClient.management.user.delete(loginId);

        console.log('delete by descoe', resp)

        // Delete the user
        if(resp?.ok){
            await UserModel.deleteOne({ _id: user?._id });
            return {
                msg: 'User deleted successfully',
                status: true,
                code: 200,
                data: null,
            };
        }else{
            return {
                msg: 'Failed to delete user',
                status: false,
                code: 500,
                data: null,
            };
        }
    } catch (error) {
        console.error("Error:", error.message); // Debugging line
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = deleteUserById;
