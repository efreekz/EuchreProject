const mongoose = require('mongoose');
const StoreModel = require('../store.modal');

const getStoreDataByType = async ({ type }) => {
    try {

        if (!type) {
            return {
                message: "Type is required",
                success: false,
                code: 400,
            };
        }

        const result = await StoreModel.find({ type });

        return {
            message: result?.length ? "Packages retrieved successfully" : "No packages found",
            data: result,
            success: true,
            code: 200,
        };
    } catch (error) {
        console.error('Error retrieving store data by type:', error.message);
        return {
            message: "An error occurred while retrieving packages. Please try again later.",
            success: false,
            code: 500,
        };
    }
};

module.exports = getStoreDataByType;
