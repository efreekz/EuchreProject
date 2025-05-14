const mongoose = require('mongoose');
const status = ['finding', 'playing', 'complete', 'shuffling', 'canceled'];
const limit = [4, 8, 16, 32, 64, 128, 256, 512];
const TournamentSchema = new mongoose.Schema(
    {

        tournamentName: {
            type: String,
            default: ""
        },
        gameId: {
            type: mongoose.Schema.Types.ObjectId, // Corrected type usage.
            required: true, // Consider marking userId as required if needed.
        },
        registeredUsers: {
            type: Array, // Corrected type usage.
            default: []
            // required: [], // Consider marking userId as required if needed.
        },
        countOfRegisteredUsers: {
            type: Number, // Corrected type usage.
            default: 0
            // required: [], // Consider marking userId as required if needed.
        },
        limitOfPlayers: {
            type: Number, // Corrected type usage.
            enum: limit, // Corrected type usage.
            default: 0
            // required: [], // Consider marking userId as required if needed.
        },
        countOfPlayingUsers: {
            type: Number, // Corrected type usage.
            default: 0
            // required: [], // Consider marking userId as required if needed.
        },
        countOfRemovedUsers: {
            type: Number, // Corrected type usage.
            default: 0
            // required: [], // Consider marking userId as required if needed.
        },
        title: {
            type: String,
            default: ''
        },
        totalMatches: {
            type: Number,
            default: 0
        },
        remainingMatches: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: status,
            default: 'finding',
        },
        startDateAndTime: {
            type: Date,
        },
        startTime: {
            type: Date,
            // default:""
        },
        isTournamentEnd: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);



// Encrypt password before saving
TournamentSchema.pre('save', async function (next) {
    next();
});

const Tournament = mongoose.model('Tournament', TournamentSchema);

module.exports = Tournament;