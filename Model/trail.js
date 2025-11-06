const mongoose = require('mongoose');

/**
 * @module models/trail
 * @description Defines the Mongoose schema for a mantrailing trail.
 * @property {mongoose.Schema.Types.ObjectId} _id - Unique identifier for the trail.
 * @property {string} [trainer] - The name of the trainer for the trail.
 * @property {string} dogName - The name of the dog.
 * @property {string} handlerName - The name of the handler.
 * @property {number} [distance] - The distance of the trail in meters.
 * @property {string} [location] - A description of the trail's location.
 * @property {Date} date - The date and time of the trail.
 * @property {number} [duration] - The duration of the trail in seconds.
 * @property {number} [delay=0] - The time delay in seconds before the dog starts.
 * @property {string} [notes=''] - Any notes related to the trail.
 * @property {string} [trailType] - The type of trail (e.g., urban, rural).
 * @property {string} [startType='knowing'] - The type of start for the trail.
 * @property {Array<number>} [locationCoordinate] - The geographical coordinates of the start.
 * @property {object} [runnerTrace] - GeoJSON or similar object representing the runner's path.
 * @property {object} [dogTrace] - GeoJSON or similar object representing the dog's path.
 */
const TrailSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainer: {
        type: String,
        required: false
    },
    dog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
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
    delay: {
        type: Number,
        required: false,
        default: 0
    },
    notes: {
        type: String,
        default: '',
        required: false
    },
    trainerComment: {
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
    },
    weather: {
        temperature: Number,
        conditions: String,
        windDirection: String,
        windSpeed: Number,
        humidity: Number
    }

});

module.exports = mongoose.model('Trails', TrailSchema);