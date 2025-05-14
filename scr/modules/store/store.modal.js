const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true
    },
    prize: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        default: null
    },
}, {
    timestamps: true,
});


const store = mongoose.model('store', storeSchema);

module.exports = store;
