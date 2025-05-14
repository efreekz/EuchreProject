const UserModel = require('../../user/user.model');
const TokenServices = require('../../token/token.services')
const bcrypt = require("bcryptjs")

const loginAdmin = async ({ body }) => {
	try {
		// check user exists
		let userExists = await UserModel.findOne({ email: body?.email, active: true })

		if (!userExists) {
			return { msg: "An record with this email not exists.", status: false, code: 404 }
		}
		let matchPassword = await bcrypt.compare(body.password, userExists?.password)
		if (!matchPassword) {
			return { msg: "Incorrect Password.", status: false, code: 401 }
		}
		if (userExists?.role !== "admin") {
			return { msg: "You do not have the necessary permissions to access this resource. Only admins are authorized.", status: false, code: 401 }
		}
		let tokens = await TokenServices.generateAuthTokens(userExists);
		if (Object.keys(tokens).length > 0) {
			return { data: { user: userExists.publicProfile, tokens }, status: true, code: 200 }
		} else {
			return { msg: "Something went wrong", status: false, code: 400 }
		}

	} catch (error) {
		console.error("Error while register admin:", error)
		return { msg: error.message, status: false, code: 500 };
	}
};

module.exports = loginAdmin;