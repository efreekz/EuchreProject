const mongoose = require('mongoose');
const typeModel = require('../type.modal');

const addType = async ({ user, body }) => {
    try {

        if (!user || !body) {
            throw new Error('Invalid input');
        }

        const result = await typeModel.create({
            userId: user._id,
            type: body?.type,
        });

        if (result) {
            return {
                msg: "type added",
                data: result,
                status: true,
                code: 201,
            };
        } else {
            throw new Error('Failed to create type');
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

module.exports = addType;