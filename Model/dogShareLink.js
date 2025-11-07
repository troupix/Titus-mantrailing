const mongoose = require('mongoose');

const dogShareLinkSchema = new mongoose.Schema({
  dogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dog',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  activities: [{
    type: String,
    enum: ['mantrailing', 'hiking', 'canicross'],
    required: true
  }],
  expiresAt: {
    type: Date,
    required: true
  }
});

const DogShareLink = mongoose.model('DogShareLink', dogShareLinkSchema);

module.exports = DogShareLink;