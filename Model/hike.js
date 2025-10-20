const mongoose = require('mongoose');

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

const hikeSchema = new mongoose.Schema({
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
    type: String, // Storing raw GPX/KML file content as a string
    default: ''
  },
  dogTrack: {
    type: String, // Storing raw GPX/KML file content as a string
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Hike = mongoose.model('Hike', hikeSchema);

module.exports = Hike;