const { mongo, default: mongoose } = require('mongoose');
const User = require('../../user/user.model');
const Wallet = require('../wallet.model');
const Transaction = require('../../transactions/transaction.model');


const addBalanceInAdminWallet = async ({ balance, disc, adminId }) => {
    try {

        const id = new mongoose.Types.ObjectId(adminId);

        if (id != null || id != '') {
            const findedAdmin = await User.findOne({ _id: id });
            if (findedAdmin) {
                const findedWallet = await Wallet.findOne({ userId: id });

                if (findedWallet) {
                    const updatedBalance = Number(findedWallet?.balance) + Number(balance)
                    const updatedWallet = await Wallet.findOneAndUpdate(
                        { userId:id },
                        { balance: updatedBalance },
                        { new: true }
                    );
                    if (updatedWallet) {
                        await Transaction.create({
                            userId: id,
                            transactionBalance: balance,
                            transactionStatus: 'received',
                            transactionType: 'balance added',
                            gameLevel: '',
                            Description: disc
                        })
                        return { msg: "Balance Added.", status: true, code: 201, data: updatedWallet };
                    } else {
                        return { msg: "Some thing When wrong", status: false, code: 500, data: null };
                    }

                } else if (findedAdmin && id) {
                    const AddedBalance = await Wallet.create({ id, balance, })
                    if (AddedBalance) {
                        return { msg: "Balance Added.", status: true, code: 201, data: AddedBalance };
                    } else {
                        return { msg: "Some thing When wrong", status: false, code: 500, data: null };
                    }

                } else {
                    return { msg: "User Not Found", status: false, code: 400, data: null };

                }


            } else {
                return { msg: "User Not Found", status: false, code: 400, data: null };

            }
        } else {
            return { msg: "unauthorized", status: false, code: 401, data: null };

        }



    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = addBalanceInAdminWallet;