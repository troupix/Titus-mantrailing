const express = require('express');
const Trail = require('../Model/trail');
const User = require('../Model/user');
const { getWeather } = require('../utils/weatherService');
const checkAuthToken = require('../utils/checkAuthToken');

const router = express.Router();


/**
 * @route GET /
 * @description Get all trails for a user, filtering trainer comments for non-trainers
 * @access Private
 */
router.get('/', checkAuthToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isTrainer = user.role.includes('trainer');

        let trails = await Trail.find({ userId: req.user.id }).populate('dog', '-ownerIds -__v').sort({ date: -1 }).lean();

        if (!isTrainer) {
            trails = trails.map(trail => {
                const { trainerComment, ...rest } = trail;
                return rest;
            });
        }

        res.json(trails);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route POST /save
 * @description Save a new trail, allowing trainer comments for trainers
 * @access Private
 */
router.post('/save', checkAuthToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isTrainer = user.role.includes('trainer');

        let weather = {};
        if (req.body.locationCoordinate && req.body.date) {
            weather = await getWeather(req.body.locationCoordinate[0], req.body.locationCoordinate[1], new Date(req.body.date).toISOString().split('T')[0]);
        }

        const newTrailData = {
            userId: req.user.id,
            dog: req.body.dogId,
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
        };

        if (isTrainer && req.body.trainerComment) {
            newTrailData.trainerComment = req.body.trainerComment;
        }

        const newTrail = new Trail(newTrailData);

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
 * @access Private
 */
router.post('/delete', checkAuthToken, (req, res) => {
    Trail.deleteOne({ _id: req.body.id, userId: req.user.id }).then(() => res.json({ success: true }))
        .catch(() => res.status(404).json({ success: false }));
});

/**
 * @route POST /update
 * @description Update a trail, allowing trainer comments for trainers
 * @access Private
 */
router.post('/update', checkAuthToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isTrainer = user.role.includes('trainer');

        const trail = await Trail.findOne({ _id: req.body.id, userId: req.user.id });
        if (!trail) {
            return res.status(404).json({ success: false, message: "Trail not found" });
        }

        let weather = trail.weather;
        if (!weather && req.body.trail.locationCoordinate && req.body.trail.date) {
            weather = await getWeather(req.body.trail.locationCoordinate[0], req.body.trail.locationCoordinate[1], new Date(req.body.trail.date).toISOString().split('T')[0]);
        }

        const updateData = { ...req.body.trail, weather };

        if (!isTrainer) {
            delete updateData.trainerComment;
        }

        await Trail.updateOne({ _id: req.body.id, userId: req.user.id }, updateData);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
