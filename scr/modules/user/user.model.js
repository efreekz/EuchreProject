const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { roles } = require('../../config/enums');
// const counterIncrementor = require('../../utilities/counterIncrementor');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
			required: true,
		},
		referralCode: {
			type: String,
			default: "",
			required: true
		},
		referredBy: {
			type: mongoose.Schema.Types.ObjectId, ref: 'User'
		},
		descopeId: {
			type: String,
			default: ""
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Invalid email']
		},
		password: {
			type: String,
			required: true,
			minlength: [8, 'Password must be at least 8 characters long'],
			validate: {
				validator: function (value) {
					return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/.test(value);
				},
				message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
			}
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		active: {
			type: Boolean,
			default: true,
		},
		role: {
			type: String,
			enum: roles,
			default: 'user'
		},
		level: {
			type: Number,
			default: 1
		},
		XP: {
			type: Number,
			default: 0
		},
		Won: {
			type: Number,
			default: 0
		},
		Lost: {
			type: Number,
			default: 0
		},
		registeredTournaments: {
			type: Number,
			default: 0
		},
		seqId: {
			type: Number
		},
	},
	{
		timestamps: true,
	}
);

userSchema.virtual('publicProfile').get(function () {
	const { password, ...publicData } = this.toObject();
	return publicData;
});

// Encrypt password before saving
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	// Increment the counter of model documents
	if (this.role) {
		// this.seqId = await counterIncrementor('User')
	} else {
		// this.seqId = await counterIncrementor(this.role)
	}
	next();
});
userSchema.plugin(mongoosePaginate)
const User = mongoose.model('User', userSchema);

module.exports = User;