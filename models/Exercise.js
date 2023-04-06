const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

let Exercise = new mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;