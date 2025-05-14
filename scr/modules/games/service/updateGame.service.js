const mongoose = require('mongoose');
const gameModel = require('../games.model');

const addGames = async (req) => {
    try {

        const body = req?.body;
        console.log('bd', body)

        const result = await gameModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(body?.id) },
            { entry: body?.entry, TotalPrizeAmount: body?.TotalPrizeAmount, gameName: body?.gameName, prize: body?.prize, winnerXp: body?.winnerXp, loserXp: body?.loserXp },
            { new: true }
        )

        if (result) {
            return {
                msg: "Game Updated",
                data: result,
                status: true,
                code: 200,
            };
        } else {
            return {
                msg: "Failed To Update Game",
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