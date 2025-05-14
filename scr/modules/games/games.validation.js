const Joi = require('joi');

const addGames = {
    body: Joi.object().keys({
        gameName: Joi.string().trim().required().messages({
            "string.empty": ` name is required and cannot be empty.`,
            "any.required": ` name is a mandatory field.`,
        }),
        gameType: Joi.string().trim().required().messages({
            "string.empty": `gameType is required and cannot be empty.`,
            "any.required": `gameType is a mandatory field.`,
        }),
        prize: Joi.number().required().messages({
            "number.base": `prize must be a valid number.`,
            "any.required": `prize is a mandatory field.`,
        }),
        TotalPrizeAmount: Joi.number().required().messages({
            "number.base": `TotalPrizeAmount must be a valid number.`,
            "any.required": `TotalPrizeAmount is a mandatory field.`,
        }),
        winnerXp: Joi.number().required().messages({
            "number.base": `winnerXp must be a valid number.`,
            "any.required": `winnerXp is a mandatory field.`,
        }),
        loserXp: Joi.number().required().messages({
            "number.base": `loserXp must be a valid number.`,
            "any.required": `loserXp is a mandatory field.`,
        }),
        entry: Joi.number().required().messages({
            "number.base": `Entry must be a valid number.`,
            "any.required": `Entry is a mandatory field.`,
        }),
    }),
};
const updateGame = {
    body: Joi.object().keys({
        id: Joi.string().trim().required().messages({
            "string.empty": ` name is required and cannot be empty.`,
            "any.required": ` name is a mandatory field.`,
        }),
        gameName: Joi.string().trim().required().messages({
            "string.empty": ` name is required and cannot be empty.`,
            "any.required": ` name is a mandatory field.`,
        }),
        gameType: Joi.string().trim().required().messages({
            "string.empty": `gameType is required and cannot be empty.`,
            "any.required": `gameType is a mandatory field.`,
        }),
        prize: Joi.number().required().messages({
            "number.base": `prize must be a valid number.`,
            "any.required": `prize is a mandatory field.`,
        }),
        TotalPrizeAmount: Joi.number().required().messages({
            "number.base": `TotalPrizeAmount must be a valid number.`,
            "any.required": `TotalPrizeAmount is a mandatory field.`,
        }),
        winnerXp: Joi.number().required().messages({
            "number.base": `winnerXp must be a valid number.`,
            "any.required": `winnerXp is a mandatory field.`,
        }),
        loserXp: Joi.number().required().messages({
            "number.base": `loserXp must be a valid number.`,
            "any.required": `loserXp is a mandatory field.`,
        }),
        entry: Joi.number().required().messages({
            "number.base": `Entry must be a valid number.`,
            "any.required": `Entry is a mandatory field.`,
        }),
    }),
};

module.exports = {
    addGames,
    updateGame
};
