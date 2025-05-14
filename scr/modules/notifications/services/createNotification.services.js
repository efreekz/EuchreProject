const { default: mongoose } = require('mongoose');
const User = require('../../user/user.model');
const Notification = require('../notification.model');

const createNotification = async ({ user, body }) => {
    try {
        console.log("USER: ", user, body);

        // Check if user has a valid token with UserId
        if (!user.token?.UserId) {
            return { msg: "Unauthorized - Missing UserId", status: false, code: 401, data: null };
        }

        // Check if the body contains the necessary information
        if (!body || !body.message || !body.type) {
            return { msg: "Invalid request body - Missing required fields", status: false, code: 400, data: null };
        }

        // Find the user by descopeId
        const findedUser = await User.findOne({ descopeId: user.token.UserId });

        // If user is not found
        if (!findedUser) {
            return { msg: "User Not Found", status: false, code: 404, data: null };
        }

        // Create the notification
        const createdNotification = await Notification.create({
            userId: new mongoose.Types.ObjectId(findedUser?._id),
            ...body
        });

        // If notification creation is successful
        return { msg: "Notification Created.", status: true, code: 201, data: createdNotification };

    } catch (error) {
        console.error("Error creating notification: ", error);
        return { msg: "Internal Server Error", status: false, code: 500, data: null };
    }
};

module.exports = createNotification;
