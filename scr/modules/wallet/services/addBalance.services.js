const { mongo, default: mongoose } = require('mongoose');
const client = require('../../../utilities/redisClient');
const User = require('../../user/user.model');
const Wallet = require('../wallet.model');


const addBalanceInWallet = async ({ user, balance }) => {
	try {
		console.log("USER: ", user, typeof balance);


		if (user.token.UserId != null || user.token.UserId != '') {
			const findedUser = await User.findOne({ descopeId: user.token.UserId })
			if (findedUser) {
				const userId = new mongoose.Types.ObjectId(findedUser?._id);
				const findedWallet = await Wallet.findOne({ userId })

				if (findedWallet) {
					const updatedBalance = Number(findedWallet.balance) + Number(balance)
					const updatedWallet = await Wallet.findOneAndUpdate(
						{ userId },
						{ balance: updatedBalance },
						{ new: true }
					);
					if (updatedWallet) {
						return { msg: "Balance Added.", status: true, code: 201, data: updatedWallet };
					} else {
						return { msg: "Some thing When wrong", status: false, code: 500, data: null };
					}

				} else if (findedUser && user.token.UserId) {
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

module.exports = addBalanceInWallet;