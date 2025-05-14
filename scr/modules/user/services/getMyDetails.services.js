const UserModel = require('../user.model');
const mongoose = require('mongoose');

const getMyDetails = async (req) => {

    const userId = req?.user ? req?.user?.token?.UserId : null;
    try {
        const usersAggregation = await UserModel.findOne({ descopeId: userId });
        return {
            msg: 'Fetched Users',
            status: true,
            code: 200,
            data: usersAggregation,
        };
    } catch (error) {
        console.error("Error:", error.message); // Debugging line
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getMyDetails;
