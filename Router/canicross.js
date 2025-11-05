
const express = require('express');
const router = express.Router();
const Canicross = require('../Model/canicross');
const { getWeather } = require('../utils/weatherService');
const checkAuthToken = require('../utils/checkAuthToken');

// Create a new canicross activity
router.post('/', checkAuthToken, async (req, res) => {
  try {
    let weather = {};
    if (req.body.location && req.body.location.coordinates && req.body.date) {
      weather = await getWeather(req.body.location.coordinates[1], req.body.location.coordinates[0], new Date(req.body.date).toISOString().split('T')[0]);
    }

    const canicross = new Canicross({ ...req.body, userId: req.user.id, weather });
    const savedCanicross = await canicross.save();
    res.status(201).json(savedCanicross);
  } catch (error) {
    res.status(500).send({ message: 'Error creating the canicross activity.', error: error.message });
  }
});

// Get all canicross activities for a user
router.get('/', checkAuthToken, async (req, res) => {
  try {
    const canicrossActivities = await Canicross.find({ userId: req.user.id })
      .populate('dogId', 'name photo')
      .populate('userId', 'username')
      .sort({ date: -1 });
    res.json(canicrossActivities);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving canicross activities.', error: error.message });
  }
});

// Get a canicross activity by ID
router.get('/:id', checkAuthToken, async (req, res) => {
  try {
    const canicross = await Canicross.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('dogId', 'name photo')
      .populate('userId', 'username');
    if (!canicross) {
      return res.status(404).send({ message: 'Canicross activity not found.' });
    }
    res.json(canicross);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving the canicross activity.', error: error.message });
  }
});

// Update a canicross activity
router.put('/:id', checkAuthToken, async (req, res) => {
  try {
    const canicrossToUpdate = await Canicross.findOne({ _id: req.params.id, userId: req.user.id });
    if (!canicrossToUpdate) {
      return res.status(404).send({ message: 'Canicross activity not found.' });
    }

    let weather = canicrossToUpdate.weather;
    if (req.body.location && req.body.location.coordinates && req.body.date) {
      weather = await getWeather(req.body.location.coordinates[1], req.body.location.coordinates[0], new Date(req.body.date).toISOString().split('T')[0]);
    }

    const updatedCanicross = await Canicross.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, weather },
      { new: true }
    );

    res.json(updatedCanicross);
  } catch (error) {
    res.status(500).send({ message: 'Error updating the canicross activity.', error: error.message });
  }
});

// Delete a canicross activity
router.delete('/:id', checkAuthToken, async (req, res) => {
  try {
    const canicross = await Canicross.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!canicross) {
      return res.status(404).send({ message: 'Canicross activity not found.' });
    }
    res.json({ message: 'Canicross activity successfully deleted.' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting the canicross activity.', error: error.message });
  }
});

module.exports = router;
