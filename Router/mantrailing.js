const express = require('express');
const Trail = require('../Model/trail');
const { getWeather } = require('../utils/weatherService');
const checkAuthToken = require('../utils/checkAuthToken');

const router = express.Router();


/**
 * @route GET /
 * @description Get all trails
 * @access Public
 */
router.get('/', checkAuthToken, (req, res) => {
    //get all trail
    Trail.find({userId: req.user.id}).populate('dog', '-ownerIds -__v').sort({ date: -1 })
        .then(trails => res.json(trails))
        .catch(err => res.status(500).json({ message: err.message }));
});

/**
 * @route POST /save
 * @description Save a new trail
 * @access Public
 * @param {object} req.body - The trail object to save
 * @param {string} req.body.dogId - The id of the dog
 * @param {string} req.body.handlerId - The id of the handler
 * @param {number} req.body.distance - The distance of the trail
 * @param {string} req.body.location - The location of the trail
 * @param {number} req.body.duration - The duration of the trail
 * @param {string} req.body.notes - Notes about the trail
 * @param {string} req.body.trailType - The type of the trail
 * @param {string} req.body.startType - The start type of the trail
 * @param {string} req.body.trainer - The trainer of the trail
 * @param {object} req.body.locationCoordinate - The coordinates of the location
 * @param {object[]} req.body.runnerTrace - The trace of the runner
 * @param {object[]} req.body.dogTrace - The trace of the dog
 * @returns {object} - The saved trail object
 */
router.post('/save', checkAuthToken, async (req, res) => {
    try {
        let weather = {};
        if (req.body.locationCoordinate && req.body.date) {
            weather = await getWeather(req.body.locationCoordinate[0], req.body.locationCoordinate[1], new Date(req.body.date).toISOString().split('T')[0]);
        }

        const newTrail = new Trail({
            userId: req.user.id,
            dogId: req.body.dogId,
            date: req.body.date,
            handlerName: req.body.handlerName,
            distance: req.body.distance,
            location: req.body.location,
            duration: req.body.duration,
            notes: req.body.notes,
            trailType: req.body.trailType,
            startType: req.body.startType,
            trainer: req.body.trainer,
            locationCoordinate: req.body.locationCoordinate,
            runnerTrace: req.body.runnerTrace,
            dogTrace: req.body.dogTrace,
            delay: req.body.delay,
            weather: weather
        });

        const trail = await newTrail.save();
        res.status(201).json(trail);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route POST /delete
 * @description Delete a trail
 * @access Public
 * @param {object} req.body - The request body
 * @param {string} req.body.id - The id of the trail to delete
 * @returns {object} - A success or error message
 */
router.post('/delete', checkAuthToken, (req, res) => {
    //delete the trail

    Trail.deleteOne({ _id: req.body.id, userId: req.user.id }).then(() => res.json({ success: true }))
        .catch(() => res.status(404).json({ success: false }));
}

);

/**
 * @route POST /update
 * @description Update a trail
 * @access Public
 * @param {object} req.body - The request body
 * @param {string} req.body.id - The id of the trail to update
 * @param {object} req.body.trail - The updated trail object
 * @returns {object} - A success or error message
 */
router.post('/update', checkAuthToken, async (req, res) => {
    //update the trail
    try {
        const trail = await Trail.findOne({ _id: req.body.id, userId: req.user.id });
        if (!trail) {
            return res.status(404).json({ success: false, message: "Trail not found" });
        }

        let weather = trail.weather;
        if (!weather && req.body.trail.locationCoordinate && req.body.trail.date) {
            weather = await getWeather(req.body.trail.locationCoordinate[0], req.body.trail.locationCoordinate[1], new Date(req.body.trail.date).toISOString().split('T')[0]);
        }

        const updateData = { ...req.body.trail, weather };

        await Trail.updateOne({ _id: req.body.id, userId: req.user.id }, updateData);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err });
    }
});

module.exports = router;