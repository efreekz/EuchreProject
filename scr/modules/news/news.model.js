const mongoose = require('mongoose');
const createNews = require('./controllers/createNews.controller');

const status = ['finding', 'playing', 'complete', 'shuffling']; // Note: This variable is not used in the schema but kept if needed elsewhere.

const NewsSchema = new mongoose.Schema(
    {
        active: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
            required: true
        },
    },
    {
        timestamps: true,
    }
);

// Optional pre-save middleware - you can implement logic if needed
NewsSchema.pre('save', async function (next) {
    // Add logic for encryption or other processing if necessary
    next();
});

const News = mongoose.model('News', NewsSchema);

module.exports = News;
