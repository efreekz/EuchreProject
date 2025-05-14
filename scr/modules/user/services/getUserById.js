const UserModel = require('../user.model');
const mongoose = require('mongoose');

const getUserById = async (req) => {
    const body = req?.body;

    try {
        // Find the user by ID and populate the referredBy field
        const user = await UserModel.findOne({ _id: new mongoose.Types.ObjectId(body?.id) }).populate('referredBy');

        return {
            msg: 'Fetched User',
            status: true,
            code: 200,
            data: user,
        };
    } catch (error) {
        console.error("Error:", error.message); // Debugging line
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getUserById;
