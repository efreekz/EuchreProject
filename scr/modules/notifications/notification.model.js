const mongoose = require('mongoose');

const status = ['received', 'paid', 'pending', 'failed', 'refunded']; // Note: This variable is not used in the schema but kept if needed elsewhere.

const NotificationsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        active: {
            type: Boolean,
            default: true,
        },
        message: {  // Added message field to schema
            type: String,
            required: true, // Make it required
        },
        type: {  // Added type field to schema
            type: String,
            required: true, // Make it required
        },
        isTournament: {
            type: Boolean,
            default: false
        },
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    {
        timestamps: true,
    }
);


// Optional pre-save middleware - you can implement logic if needed
NotificationsSchema.pre('save', async function (next) {
    // Add logic for encryption or other processing if necessary
    next();
});

const Notifications = mongoose.model('Notifications', NotificationsSchema);

module.exports = Notifications;
