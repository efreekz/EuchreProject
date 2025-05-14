const UserModel = require('../user.model');
const bodyParser = require('body-parser');
const DescopeClient = require('@descope/node-sdk').default;
const config = require('../../../config/config');
const sendVerificationEmail = require('../../../utilities/verificationMail');
const Wallet = require('../../wallet/wallet.model');
const { mongo, Mongoose } = require('mongoose');
const { default: mongoose } = require('mongoose');
const generateReferralCode = require('../../../utilities/generateReferralCode');
const Settings = require('../../settings/settings.model');

const registerUser = async ({ body }) => {
	try {
		let referDetails;
		console.log('body.referralCode', body.referralCode)
		if (body.referralCode) {
			referDetails = await UserModel.findOne({ referralCode: body?.referralCode });
			console.log('referDetails', referDetails)
			if (!referDetails) {
				return { message: "User not found with this referral code enter valid referral code.", status: false, code: 400 };
			}
			body.referredBy = new mongoose.Types.ObjectId(referDetails?._id);
		} else {
			delete body.referredBy;  // Remove the referredBy field if no referralCode is provided
		}

		let userExistsUsername = await UserModel.findOne({ userName: body?.userName, active: true });
		let userExists = await UserModel.findOne({ email: body?.email, active: true });

		if (userExists || userExistsUsername) {
			if (userExists) {
				return { message: "User already exists.", status: false, code: 400 };
			} else {
				return { message: "UserName already exists.", status: false, code: 400 };
			}
		}

		const descopeClient = DescopeClient({ projectId: config?.DESCOPEP_PROJECT_ID });
		const loginId = body?.email;
		const password = body?.password;
		const user = { email: body?.email };

		const resp = await descopeClient.password.signUp(loginId, password, user);
		if (!resp.ok) {
			return { message: resp.error.errorDescription, errorMsg: resp.error.errorMessage, data: resp, status: false, code: 400 };
		} else {
			if (resp?.data?.user?.userId) {
				body.descopeId = resp?.data?.user?.userId;
				const referralCode = await generateReferralCode(resp?.data?.user?.userId);
				const alreadyAddedReffal = await UserModel.findOne({ referralCode: referralCode });
				body.referralCode = alreadyAddedReffal ? await generateReferralCode(null) : referralCode;
			} else {
				body.referralCode = await generateReferralCode(null);
			}

			const newUser = await UserModel.create(body);

			if (newUser) {
				const settings = await Settings.findOne();
				await Wallet.create({ userId: new mongoose.Types.ObjectId(newUser._id), balance: settings?.registrationBonus ? settings?.registrationBonus : 400, descopeId: resp?.data?.user?.userId });
				await sendVerificationEmail(body?.email);
				return { message: "Registration successful.", status: true, code: 201, data: resp };
			} else {
				return { message: "Something went wrong, please try again.", status: false, code: 400 };
			}
		}
	} catch (error) {
		return { message: error.message, status: false, code: 500 };
	}
};

module.exports = registerUser;
