const mongoose = require('mongoose');
const levelModel = require('../games.model');

const addGames = async ({ user, body }) => {
    try {

        if (!user || !body || !body.gameName) {
            throw new Error('Invalid input: user, body, or gameName is missing');
        }

        const existingLevel = await levelModel.findOne({ gameName: body.gameName });
        if (existingLevel) {
            return {
                msg: `Game with name '${body.gameName}' already exists`,
                status: false,
                code: 400,
            };
        }

        const result = await levelModel.create({
            // userId: user._id,
            entry: body?.entry,
            gameName: body?.gameName,
            prize: body?.prize,
            winnerXp: body?.winnerXp,
            loserXp: body?.loserXp,
            gameType: body?.gameType,
            TotalPrizeAmount: body?.TotalPrizeAmount

        });

        if (result) {
            return {
                msg: "Game added",
                data: result,
                status: true,
                code: 201,
            };
        } else {
            throw new Error('Failed to create level');
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