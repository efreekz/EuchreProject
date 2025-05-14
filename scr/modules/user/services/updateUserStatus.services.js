const UserModel = require('../user.model');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');

const updateUserStatus = async ({ body }) => {
    try {
        // Validate the presence of the id field
        if (!body?.id) {
            return { msg: "ID is required", status: false, code: 400, data: null };
        }

        // Validate that the id is a valid MongoDB ObjectId
        if (!isValidObjectId(body.id)) {
            return { msg: "Invalid ID format", status: false, code: 400, data: null };
        }

        const userId = new mongoose.Types.ObjectId(body.id);

        // Find the user by id
        const findedUser = await UserModel.findById(userId);

        if (!findedUser) {
            return { msg: "User not found", status: false, code: 404, data: null };
        }

        // Toggle the user's active status
        const active = !findedUser?.active;
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { active },
            { new: true }
        );

        if (updatedUser) {
            return { msg: "User status updated successfully", status: true, code: 200, data: updatedUser };
        } else {
            return { msg: "Failed to update user status", status: false, code: 500, data: null };
        }

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error updating user status:", error);

        // Provide a general error message to the client
        return { msg: "An error occurred while updating user status", status: false, code: 500 };
    }
};

module.exports = updateUserStatus;
