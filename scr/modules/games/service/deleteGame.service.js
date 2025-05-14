const mongoose = require('mongoose');
const gameModel = require('../games.model');

const addGames = async (req) => {
    try {

        const body = req?.body;
        console.log('bd',body)

        const result = await gameModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(body?.id) })

        if (result) {
            return {
                msg: "Game Deleted",
                data: result,
                status: true,
                code: 200,
            };
        } else {
            return {
                msg: "Failed To Delete Game",
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

module.exports = addGames;