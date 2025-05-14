const mongoose = require('mongoose');

const status = ['finding', 'playing', 'complete', 'shuffling']; // Note: This variable is not used in the schema but kept if needed elsewhere.

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Corrected type usage.
            required: true, // Consider marking userId as required if needed.
        },
        active: {
            type: Boolean,
            default: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        WalletType: {
            type: String,
            default: 'user',
            enum: ['admin', 'user'],

        },
        descopeId: {
            type: String,
            default: '',
            // required: true
        },
    },
    {
        timestamps: true,
    }
);

// Optional pre-save middleware - you can implement logic if needed
walletSchema.pre('save', async function (next) {
    // Add logic for encryption or other processing if necessary
    next();
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
