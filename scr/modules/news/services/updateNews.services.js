const mongoose = require('mongoose');
const newsModel = require('../news.model');

const updateNews = async (req) => {
    try {

        const body = req?.body;
        console.log('bd', body)

        const result = await newsModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(body?.id) },
            { title: body?.title, description: body?.description },
            { new: true }
        )

        if (result) {
            return {
                msg: "News Updated",
                data: result,
                status: true,
                code: 200,
            };
        } else {
            return {
                msg: "Failed To Update News",
                data: null,
                status: false,
                code: 400,
            };
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

module.exports = updateNews;