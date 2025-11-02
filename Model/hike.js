/**
 * @module models/hike
 * @description Defines the Mongoose schemas for a geographical point and a hike.
 */
const mongoose = require('mongoose');

/**
 * @typedef {object} Point
 * @property {string} type - The type of the point, must be 'Point'.
 * @property {Array<number>} coordinates - The coordinates of the point [longitude, latitude].
 */
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

/**
 * @typedef {object} HikeSchema
 * @property {mongoose.Schema.Types.ObjectId} _id - Unique identifier for the hike.
 * @property {string} name - The name of the hike.
 * @property {string} [description] - A description of the hike.
 * @property {string} [location] - A description of the hike's location.
 * @property {Array<number>} [locationCoordinate] - The geographical coordinates of the start.
 * @property {Point} [startLocation] - The starting location of the hike as a GeoJSON point.
 * @property {number} [distance=0] - The distance of the hike in meters.
 * @property {number} [duration=0] - The duration of the hike in seconds.
 * @property {number} [elevationGain=0] - The total elevation gain in meters.
 * @property {string} [difficulty='Moderate'] - The difficulty of the hike.
 * @property {Array<string>} [photos] - An array of URLs to photos of the hike.
 * @property {object} [userTrack] - The user's track, e.g., from a GPX file.
 * @property {object} [dogTrack] - The dog's track, e.g., from a GPX file.
 * @property {Date} createdAt - The date and time the hike was created.
 * @property {Date} date - The date of the hike.
 */
const hikeSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: false
  },
  locationCoordinate: {
    type: Array,
    required: false
  },
  // Location where the hike starts. Useful for map markers.
  startLocation: {
    type: pointSchema,
    index: '2dsphere' // Index for geospatial queries
  },
  distance: {
    type: Number, // in meters
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  elevationGain: {
    type: Number, // in meters
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Hard', 'Expert'],
    default: 'Moderate'
  },
  photos: {
    type: [String] // Array of image URLs
  },
  userTrack: {
    type: Object, // Storing raw GPX/KML file content as an object
    default: null // Changed default from '' to null for Object type
  },
  dogTrack: {
    type: Object, // Storing raw GPX/KML file content as an object
    default: null // Changed default from '' to null for Object type
  },
  dogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dog'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  date:{
    type: Date,
    default: Date.now
  },
  weather: {
    temperature: Number,
    conditions: String,
    windDirection: String,
    windSpeed: Number,
    humidity: Number
  }
});

const Hike = mongoose.model('Hike', hikeSchema);

module.exports = Hike;