const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { roles } = require('../../config/enums');
// const counterIncrementor = require('../../utilities/counterIncrementor');
const mongoosePaginate = require('mongoose-paginate-v2');

const settingsSchema = new mongoose.Schema(
	{
		bannerImgs: {
			type: Array,
			default:[]
		},
		registrationBonus: {
			type: Number,
			default: 0,
		},
		seqId: {
			type: Number
		},
	},
	{
		timestamps: true,
	}
);

settingsSchema.virtual('publicProfile').get(function () {
	const { password, ...publicData } = this.toObject();
	return publicData;
});

// Encrypt password before saving
settingsSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	// Increment the counter of model documents
	if (this.role) {
		// this.seqId = await counterIncrementor('settings')
	} else {
		// this.seqId = await counterIncrementor(this.role)
	}
	next();
});
settingsSchema.plugin(mongoosePaginate)
const settings = mongoose.model('settings', settingsSchema);

module.exports = settings;