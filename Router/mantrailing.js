const express = require('express');
const Trail = require('../Model/trail');

const router = express.Router();


/**
 * @route GET /
 * @description Get all trails
 * @access Public
 */
router.get('/', (req, res) => {
    //get all trail
    Trail.find()
        .then(trails => res.json(trails))
        .catch(err => res.status(400).json({ message: err }));
});

/**
 * @route POST /save
 * @description Save a new trail
 * @access Public
 * @param {object} req.body - The trail object to save
 * @param {string} req.body.dogName - The name of the dog
 * @param {string} req.body.handlerName - The name of the handler
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
router.post('/save', (req, res) => {
    //save the data to the database
    const newTrail = new Trail({
        dogName: req.body.dogName,
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
        delay: req.body.delay
    });
    newTrail.save()
        .then(trail => res.json(trail))
        .catch(err => res.status(400).json({ message: err }));
}
);

/**
 * @route POST /delete
 * @description Delete a trail
 * @access Public
 * @param {object} req.body - The request body
 * @param {string} req.body.id - The id of the trail to delete
 * @returns {object} - A success or error message
 */
router.post('/delete', (req, res) => {
    //delete the trail

    Trail.deleteOne({ _id: req.body.id }).then(() => res.json({ success: true }))
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
router.post('/update', (req, res) => {
    //update the trail
    Trail.updateOne({ _id: req.body.id }, {
        dogName: req.body.trail.dogName,
        date: req.body.trail.date,
        handlerName: req.body.trail.handlerName,
        distance: req.body.trail.distance,
        location: req.body.trail.location,
        duration: req.body.trail.duration,
        notes: req.body.trail.notes,
        trailType: req.body.trail.trailType,
        startType: req.body.trail.startType,
        trainer: req.body.trail.trainer,
        locationCoordinate: req.body.trail.locationCoordinate,
        runnerTrace: req.body.trail.runnerTrace,
        dogTrace: req.body.trail.dogTrace,
        delay: req.body.trail.delay
    }).then(() => res.json({ success: true }))
        .catch(() => res.status(404).json({ success: false }));
});

module.exports = router;