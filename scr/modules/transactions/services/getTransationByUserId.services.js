const mongoose = require('mongoose');
const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const Transaction = require('../transaction.model');

const getTransactionByUserId = async ({ user, body }) => {
    try {
        console.log("USER: ", user, body);

        // Validate user token's UserId
        if (!user?.token?.UserId) {
            return { msg: "Unauthorized", status: false, code: 401, data: null };
        }

        // Find the user by descopeId
        const foundUser = await User.findOne({ descopeId: user.token.UserId });
        if (!foundUser) {
            return { msg: "User Not Found", status: false, code: 400, data: null };
        }

        // Fetch transactions for the found user
        const userId = new mongoose.Types.ObjectId(foundUser._id);
        const foundTransactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

        // Return transactions or an appropriate message
        if (foundTransactions?.length > 0) {
            return { msg: "Transaction found.", status: true, code: 200, data: foundTransactions };
        } else {
            return { msg: "No transactions found.", status: false, code: 404, data: [] };
        }
    } catch (error) {
        console.error("Error retrieving transactions: ", error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getTransactionByUserId;
