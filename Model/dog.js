const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  profilePhoto: {
    type: String, // URL to profile photo
  },
  presentationPhoto: {
    type: String, // URL to presentation photo
  },
  legend: {
    type: String,
  },
  presentation: {
    type: String,
  },
  ownerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  trainerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Dog = mongoose.model('Dog', dogSchema);

module.exports = Dog;
