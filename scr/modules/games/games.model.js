const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    gameName: {
        type: String,
        required: true,
    },
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    // },
    active: {
        type: Boolean,
        default: true,
    },
    prize: {
        type: Number,
        required: true
    },
    TotalPrizeAmount: {
        type: Number,
        required: true
    },
    loserPrize: {
        type: Number,
        // required: true
    },
    entry: {
        type: Number,
        required: true
    },
    winnerXp: {
        type: Number,
        required: true
    },
    loserXp: {
        type: Number,
        required: true
    },
    gameType: {
        type: String,
        enum: ['private', 'public'],
        default: 'public',
    },

}, {
    timestamps: true,
});


const GameDetails = mongoose.model('GameDetails', GameSchema);

module.exports = GameDetails;
