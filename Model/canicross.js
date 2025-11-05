
const mongoose = require('mongoose');

const canicrossSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  duration: Number,
  distance: Number,
  avgSpeed: Number,
  maxSpeed: Number,
  avgPace: Number,
  positiveElevation: Number,
  negativeElevation: Number,
  terrain: String,
  weather: {
    temperature: Number,
    conditions: String,
    windDirection: String,
    windSpeed: Number,
    humidity: Number
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },
  pauseTime: Number,
  energyLevel: Number,
  notes: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog' }
});

const Canicross = mongoose.model('Canicross', canicrossSchema);

module.exports = Canicross;
