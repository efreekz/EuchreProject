const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling', 'canceled'];
const playingroomSchema = new mongoose.Schema(
    {

        players: {
            type: Array,
            default: []
        },
        teamOne: {
            type: Array,
            default: []
        },
        teamOnePoints: {
            type: Object,
            default: {}
        },
        teamTwo: {
            type: Array,
            default: []
        },
        teamTwoPoints: {
            type: Object,
            default: {}
        },
        totalCards: { type: Array, default: ['9h', '10h', 'jh', 'qh', 'kh', 'ah', '9d', '10d', 'jd', 'qd', 'kd', 'ad', '9c', '10c', 'jc', 'qc', 'kc', 'ac', '9s', '10s', 'js', 'qs', 'ks', 'as'] },
        playedCards: { type: Array, default: [] },
        lastPlayedCards: { type: Array, default: [] },
        trumpSuit: { type: String, default: '' },
        isTrumpSelected: { type: Boolean, default: false },
        trumpRound: { type: Number, default: 0 },
        isStarted: { type: Boolean, default: false },
        handId: { type: mongoose.Types.ObjectId },
        entryFee: {
            type: String,
            default: ''
        },
        trumpMaker: {
            type: String,
            default: ''
        },
        gameLevel: {
            type: String,
            default: ''
        },
        active: {
            type: Boolean,
            default: true,
        },
        isWinner: {
            type: String,
            default: '',
        },
        gameId: {
            type: mongoose.Schema.Types.ObjectId, // Corrected type usage.
            required: true, // Consider marking userId as required if needed.
        },
        timeOut: {
            type: Number,
            default: 60
        },
        createrUserId: {
            type: String,
            default: ''
        },
        tableName: {
            type: String,
            default: ''
        },
        Description: {
            type: String,
            default: ''
        },

        status: {
            type: String,
            enum: status,
            default: 'finding',
        },
        roomType: {
            type: String,
            enum: ['private', 'public', 'tournament'],
            default: 'public',
        },
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        passKey: {
            type: String,
            minlength: [8, 'Password must be at least 8 characters long'],
            validate: {
                validator: function (value) {
                    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/.test(value);
                },
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
            }
        },
        validityDate: {
            type: Date,
        },
        dateOfCreation: {
            type: Date,
        },
        validityTime: {
            type: String,
        },
        isGameEnd: {
            type: Boolean,
            default: false,
        },
        isCanceled: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);



// Encrypt password before saving
playingroomSchema.pre('save', async function (next) {
    next();
});

const PlayingRoom = mongoose.model('PlayingRoom', playingroomSchema);

module.exports = PlayingRoom;