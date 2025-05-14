const Settings = require('../settings.model');
const { default: mongoose } = require('mongoose');

const addUpdateSettings = async ({ body }) => {
    try {
        // Validate body data
        const { _id, ...settingsData } = body;
        if (!body) {
            return { msg: "Invalid input data", status: false, code: 400 };
        }

        if (_id) {
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                return { msg: "Invalid ID format", status: false, code: 400 };
            }

            const updatedSettings = await Settings.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(_id) },
                { $set: settingsData },
                { new: true, runValidators: true }
            );

            if (updatedSettings) {
                console.log('updatedSettings', updatedSettings);
                return { msg: "Settings Updated.", status: true, code: 200, data: updatedSettings };
            }

        } else {
            const createdSettings = await Settings.create(settingsData);

            if (createdSettings) {
                console.log('createdSettings', createdSettings);
                return { msg: "Settings Created.", status: true, code: 200, data: createdSettings };
            }
        }
        
        return { msg: "Settings not found", status: false, code: 404 };

    } catch (error) {
        console.error('Error in addUpdateSettings:', error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = addUpdateSettings;
