const { default: mongoose } = require('mongoose');
const Wallet = require('../wallet.model');

const getWalletBalanceByUserId = async ({ id }) => {
    try {

        // Check if the user object contains a valid UserId
        if (!id) {
            return { msg: "Unauthorized", status: false, code: 401, data: null };
        }

        // Retrieve the wallet using the provided userId (descopeId)
        const findWallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(id) });

        // Handle case where no wallet is found for the given user
        if (!findWallet) {
            return { msg: "Wallet Not Found", status: false, code: 400, data: null };
        }

        // Return the wallet data if a wallet is found
        return { msg: "Wallet details found.", status: true, code: 200, data: findWallet };
    } catch (error) {
        console.error("Error retrieving transactions: ", error);
        return { msg: "Internal server error.", status: false, code: 500 };
    }
};

module.exports = getWalletBalanceByUserId;
