const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling'];
const GameRoundSchema = new mongoose.Schema(
    {

        roomId: {
            type: mongoose.Types.ObjectId,
            required:true
        },
        teamOne:{
            type:Array,
            default:[]
        },
        teamOnePoints:{
            type:Object,
            default:{}
        },
        teamTwo:{
            type:Array,
            default:[]
        },
        teamTwoPoints:{
            type:Object,
            default:{}
        },
        active: {
            type: Boolean,
            default: true,
        },
        isRoundWinner: {
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
GameRoundSchema.pre('save', async function (next) {
    next();
});

const GameRound = mongoose.model('GameRound', GameRoundSchema);

module.exports = GameRound;