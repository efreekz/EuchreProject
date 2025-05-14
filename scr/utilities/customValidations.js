const mongoose = require('mongoose');

const objectId = (value, helpers) => {
	if (!mongoose.Types.ObjectId.isValid(value)) {
		return helpers.message(`Invalid ObjectId format`);
	}
	return value;
};

module.exports = {
	objectId
}