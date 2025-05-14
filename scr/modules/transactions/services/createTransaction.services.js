const { mongo, default: mongoose } = require('mongoose');
const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const Transaction = require('../transaction.model');
const Wallet = require('../../wallet/wallet.model');
const settings = require('../../settings/settings.model');


const createTransaction = async ({ user, body }) => {
	try {
		console.log("USER: ", user, body);


		if (user.token.UserId != null || user.token.UserId != '') {
			const findedUser = await User.findOne({ descopeId: user.token.UserId });
			if (findedUser) {
				const findedWallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(findedUser._id) })

				if ((findedUser && user.token.UserId) && findedWallet) {

					if (findedWallet.balance < body.transactionBalance) {
						return { msg: "Insufficient balance for transaction", status: false, code: 400, data: null };
					}
					const userId = new mongoose.Types.ObjectId(findedUser?._id);



					const updatedBalance = findedWallet.balance - body.transactionBalance
					const transactionCreated = await Transaction.create({
						userId,
						transactionBalance: body.transactionBalance,
						transactionStatus: body.status,
						transactionType: body.type,
						gameLevel: body.gameLevel
					})
					if (transactionCreated) {
						await Wallet.findOneAndUpdate(
							{ userId },
							{ balance: updatedBalance },
							{ new: true }
						)
						return { msg: "Transaction Created.", status: true, code: 201, data: transactionCreated };
					} else {
						return { msg: "Some thing When wrong", status: false, code: 500, data: null };
					}

				} else {
					if (!findedWallet && findedUser) {
						const settings = await settings.findOne();
						const userId = new mongoose.Types.ObjectId(findedUser?._id);
						await Wallet.create({ userId, balance: settings?.registrationBonus ? settings?.registrationBonus : 400, descopeId: findedUser?.descopeId })
						return { msg: "Insufficient balance for transaction", status: false, code: 400, data: null };
					} else {
						return { msg: "User Not Found", status: false, code: 400, data: null };
					}

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

module.exports = createTransaction;