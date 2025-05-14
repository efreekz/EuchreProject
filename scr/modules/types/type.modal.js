const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        // enum: ['coins', 'gems', 'vipPass'],
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
});


const type = mongoose.model('type', typeSchema);

module.exports = type;
