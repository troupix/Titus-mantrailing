const mongoose = require('mongoose');

const TrailSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    trainer: {
        type: String,
        required: false
    },
    dogName: {
        type: String,
        required: true
    },
    handlerName: {
        type: String,
        required: true
    },
    distance: {
        type: Number,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number,
        required: false
    },
    notes: {
        type: String,
        default: '',
        required: false
    },
    trailType: {
        type: String,
        required: false
    },
    startType: {
        type: String,
        required: false,
        default: 'knowing'
    },
    locationCoordinate: {
        type: Array,
        required: false
    },
    runnerTrace: {
        type: Object,
        required: false
    },
    dogTrace: {
        type: Object,
        required: false
    }

});

module.exports = mongoose.model('Session', TrailSchema);