const mongoose = require('mongoose');

const status = ['received', 'paid', 'pending', 'failed', 'refunded']; // Note: This variable is not used in the schema but kept if needed elsewhere.

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Corrected type usage.
            required: true, // Consider marking userId as required if needed.
        },
        active: {
            type: Boolean,
            default: true,
        },
        transactionBalance: {
            type: Number,
            default: 0,
        },
        transactionStatus: {
            type: String,
            enum: status,
            default: 'pending',
        },
        transactionType: {
            type: String,
            enum: ['registration reward','Tournament Join', 'tournament full', 'game reward', 'purchase', 'subscription', 'game Lost', 'game play', 'winning prize', 'balance added'],
            required: true,
        },
        Description: {
            type: String,
            default: ''
        },
        gameLevel: {
            type: String,
            // enum: ['beginner', 'advanced', 'professional'],
            default: ''
        },
    },
    {
        timestamps: true,
    }
);

// Optional pre-save middleware - you can implement logic if needed
transactionSchema.pre('save', async function (next) {
    // Add logic for encryption or other processing if necessary
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
