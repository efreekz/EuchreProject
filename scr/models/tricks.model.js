const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling'];
const GameTrickSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Types.ObjectId,
            required:true
        },
        roundId: {
            type: mongoose.Types.ObjectId,
            required:true
        },
        players: {
            type: Array,
            default: []
        },
        teamOne:{
            type:Array,
            default:[]
        },
        teamTwo:{
            type:Array,
            default:[]
        },
        playedCards: { type: Array, default: [] },
        trumpSuit: { type: String, default: '' },
        active: {
            type: Boolean,
            default: true,
        },
        isTrickWinnerId: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: status,
            default: 'playing',
        },
    },
    {
        timestamps: true,
    }
);



// Encrypt password before saving
GameTrickSchema.pre('save', async function (next) {
    next();
});

const GameTrick = mongoose.model('GameTrick', GameTrickSchema);

module.exports = GameTrick;