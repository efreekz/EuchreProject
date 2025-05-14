const mongoose = require('mongoose');
const StoreModel = require('../store.modal');

const addPackage = async ({ user, body }) => {
    try {

        if (!user || !body) {
            throw new Error('Invalid input');
        }

        const result = await StoreModel.create({
            userId: user._id,
            type: body?.type,
            prize: body?.prize,
            quantity: body?.quantity,

        });

        if (result) {
            return {
                msg: "package added",
                data: result,
                status: true,
                code: 201,
            };
        } else {
            throw new Error('Failed to create package');
        }
    } catch (error) {
        console.error(error);
        return {
            msg: "Something went wrong, please try again.",
            status: false,
            code: 400,
        };
    }
};

module.exports = addPackage;