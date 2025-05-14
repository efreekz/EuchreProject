const { mongo, default: mongoose } = require('mongoose');
const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const Wallet = require('../wallet.model');
const Transaction = require('../../transactions/transaction.model');


const addBalanceFromAdmin = async ({ userId, balance, disc, id }) => {
    try {
        console.log("USER: ", typeof balance);
        const adminWallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(id), WalletType: "admin" }).sort({ createdAt: 1 });

        if (adminWallet?.balance <= balance) {
            return { msg: "Admin balance is not enough to transfer.", status: false, code: 400, data: null };
        }

        const UserId = new mongoose.Types.ObjectId(userId);

        if (UserId != null || UserId != '') {
            const findedUser = await User.findOne({ _id: UserId })
            if (findedUser) {
                const findedWallet = await Wallet.findOne({ userId })

                if (findedWallet) {
                    const updatedBalance = Number(findedWallet?.balance) + Number(balance)
                    const updatedWallet = await Wallet.findOneAndUpdate(
                        { userId },
                        { balance: updatedBalance },
                        { new: true }
                    );
                    const AdminupdatedBalance = Number(adminWallet?.balance) - Number(balance)
                    const updatedWalletadmin = await Wallet.findOneAndUpdate(
                        { userId: id },
                        { balance: AdminupdatedBalance },
                        { new: true }
                    );
                    if (updatedWallet && updatedWalletadmin) {
                        await Transaction.create({
                            userId,
                            transactionBalance: balance,
                            transactionStatus: 'received',
                            transactionType: 'balance added',
                            gameLevel: '',
                            Description: disc
                        })
                        await Transaction.create({
                            userId: id,
                            transactionBalance: balance,
                            transactionStatus: 'paid',
                            transactionType: 'balance added',
                            gameLevel: '',
                            Description: `Balance added for username ${findedUser?.userName}, amount: ${balance}`
                        })
                        return { msg: "Balance Added.", status: true, code: 201, data: updatedWallet };
                    } else {
                        return { msg: "Some thing When wrong", status: false, code: 500, data: null };
                    }

                } else if (findedUser && UserId) {
                    const AddedBalance = await Wallet.create({ userId, balance, descopeId: findedUser?.descopeId })
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

module.exports = addBalanceFromAdmin;