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
  photo: {
    type: String, // URL to photo
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
