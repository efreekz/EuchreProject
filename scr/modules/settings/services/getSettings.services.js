const Settings = require('../settings.model');
const { default: mongoose } = require('mongoose');

const getSettings = async () => {
    try {
        // Fetch the settings from the database
        const foundSettings = await Settings.findOne();

        if (foundSettings) {
            console.log('Found settings:', foundSettings);
            return { msg: "Settings found.", status: true, code: 200, data: foundSettings };
        }

        // If no settings are found, return a not found message
        return { msg: "Settings not found.", status: false, code: 404 };

    } catch (error) {
        console.error('Error in getSettings:', error);
        return { msg: error.message, status: false, code: 500 };
    }
};

module.exports = getSettings;
