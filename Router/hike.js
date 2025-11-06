const express = require('express');
const router = express.Router();
const Hike = require('../Model/hike'); // Assurez-vous que le chemin est correct
const { getWeather } = require('../utils/weatherService');
const checkAuthToken = require('../utils/checkAuthToken');
const multer = require('multer');
const { uploadFile, generateSignedUrl } = require('../utils/r2');
const crypto = require('crypto');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomUUID();
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${fileExtension}`);
    },
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/hike
 * @desc    Create a new hike
 * @access  Public (Should be private with authentication)
 * @param   {object} req.body - The hike data
 * @param   {string} req.body.name - The name of the hike
 * @param   {string} [req.body.description] - A description of the hike
 * @param   {string} [req.body.location] - A description of the hike's location
 * @param   {Array<number>} [req.body.locationCoordinate] - The geographical coordinates of the start
 * @param   {object} [req.body.startLocation] - The starting location of the hike as a GeoJSON point
 * @param   {number} [req.body.distance] - The distance of the hike in meters
 * @param   {number} [req.body.duration] - The duration of the hike in seconds
 * @param   {number} [req.body.elevationGain] - The total elevation gain in meters
 * @param   {string} [req.body.difficulty] - The difficulty of the hike
 * @param   {Array<string>} [req.body.photos] - An array of URLs to photos of the hike
 * @param   {object} [req.body.userTrack] - The user's track, e.g., from a GPX file
 * @param   {object} [req.body.dogTrack] - The dog's track, e.g., from a GPX file
 * @param   {Date} [req.body.date] - The date of the hike
 * @returns {object} 201 - The created hike object
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Server error
 */
router.post('/', checkAuthToken, async (req, res) => {
  try {
    // Ideally, userId should come from an authentication middleware
    // Create a new instance of Hike with all provided data
    const hikeData = { ...req.body, userId: req.user.id };
    delete hikeData.weather; // Remove weather from req.body to be safe

    if (req.body.startLocation && req.body.date) {
        const date = new Date(req.body.date);
        let hour = date.getHours();
        if((req.body.dogTrack && req.body.dogTrack?.features.length > 0) || (req.body.userTrack && req.body.userTrack?.features.length > 0)) {
            const track = req.body.dogTrack && req.body.dogTrack?.features.length > 0 ? req.body.dogTrack : req.body.userTrack;
            const trackStartTime = new Date(track.features[0].properties.timestamps[0]);
            hour = trackStartTime.getHours(); 
        }

        const weatherData = await getWeather(req.body.startLocation.coordinates[0], req.body.startLocation.coordinates[1], date.toISOString().split('T')[0], hour);
        if (weatherData && Object.values(weatherData).some(v => v !== undefined)) {
            hikeData.weather = weatherData;
        }
    }

    const hike = new Hike(hikeData);

    const savedHike = await hike.save();
    res.status(201).json(savedHike);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: 'Validation error.', error: error.message });
    }
    res.status(500).send({ message: 'Error creating the hike.', error: error.message });
  }
});

/**
 * @route   GET /api/hike
 * @desc    Get all hikes for a user
 * @access  Public (Ideally, filter by the authenticated user's userId)
 * @returns {Array<object>} 200 - An array of hike objects
 * @returns {object} 500 - Server error
 */
router.get('/', checkAuthToken, async (req, res) => {
  try {
    const hikes = await Hike.find({userId: req.user.id}).sort({ createdAt: -1 });

    const hikesWithSignedUrls = await Promise.all(hikes.map(async (hike) => {
        const hikeObject = hike.toObject();
        if (hikeObject.photos && hikeObject.photos.length > 0) {
            const signedPhotos = await Promise.all(hikeObject.photos.map(async (photoUrl) => {
                const fileName = photoUrl.split('/').pop();
                return await generateSignedUrl(fileName);
            }));
            hikeObject.photos = signedPhotos;
        }
        return hikeObject;
    }));

    res.json(hikesWithSignedUrls);
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving hikes.', error: error.message });
  }
});

/**
 * @route   GET /api/hike/:id
 * @desc    Get a hike by its ID
 * @access  Public
 * @param   {string} req.params.id - The ID of the hike
 * @returns {object} 200 - The hike object
 * @returns {object} 404 - Hike not found
 * @returns {object} 500 - Server error
 */
router.get('/:id', checkAuthToken, async (req, res) => {
  try {
    const hike = await Hike.findOne({ _id: req.params.id, userId: req.user.id });

    if (!hike) {
      return res.status(404).send({ message: 'Hike not found.' });
    }

    const hikeObject = hike.toObject();
    if (hikeObject.photos && hikeObject.photos.length > 0) {
        const signedPhotos = await Promise.all(hikeObject.photos.map(async (photoUrl) => {
            const fileName = photoUrl.split('/').pop();
            return await generateSignedUrl(fileName);
        }));
        hikeObject.photos = signedPhotos;
    }

    res.json(hikeObject);
  } catch (error) {
    // Handles errors like a malformed ID
    res.status(500).send({ message: 'Error retrieving the hike.', error: error.message });
  }
});

/**
 * @route   PUT /api/hike/:id
 * @desc    Update a hike
 * @access  Public (Ideally, verify that the user is the owner of the hike)
 * @param   {string} req.params.id - The ID of the hike to update
 * @param   {object} req.body - The fields to update
 * @returns {object} 200 - The updated hike object
 * @returns {object} 404 - Hike not found
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Server error
 */
router.put('/:id', checkAuthToken, async (req, res) => {
  try {
    const hike = await Hike.findOne({ _id: req.params.id, userId: req.user.id });

    if (!hike) {
      return res.status(404).send({ message: 'Hike not found.' });
    }

    // Create an object with only the allowed fields to be updated
    const allowedUpdates = [
      'name', 'description', 'startLocation', 'distance', 'duration', 'elevationGain',
      'difficulty', 'photos', 'userTrack', 'dogTrack', 'location',
      'locationCoordinate', 'date'
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        hike[key] = req.body[key];
      }
    });

    const weatherObject = hike.weather ? hike.weather.toObject() : null;
    const weatherIsMissing = !weatherObject || Object.keys(weatherObject).filter(k => weatherObject[k] !== undefined && weatherObject[k] !== null).length === 0;

    if (weatherIsMissing && hike.startLocation && hike.date) {
        const date = new Date(hike.date);
        let hour = 12;
        if((hike.dogTrack && hike.dogTrack?.features.length > 0) || (hike.userTrack && hike.userTrack?.features.length > 0)) {
            const track = hike.dogTrack && hike.dogTrack?.features.length > 0 ? hike.dogTrack : hike.userTrack;
            const trackStartTime = new Date(track.features[0].properties.timestamps[0]);
            hour = trackStartTime.getHours(); 
        }

        const weatherData = await getWeather(hike.startLocation.coordinates[0], hike.startLocation.coordinates[1], date.toISOString().split('T')[0], hour);
        if (weatherData && Object.values(weatherData).some(v => v !== undefined)) {
            hike.weather = weatherData;
        }
    }

    await hike.save();

    res.json(hike);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send({ message: 'Validation error during update.', error: error.message });
    }
    res.status(500).send({ message: 'Error updating the hike.', error: error.message });
  }
});

/**
 * @route   DELETE /api/hike/:id
 * @desc    Delete a hike
 * @access  Public (Ideally, verify that the user is the owner)
 * @param   {string} req.params.id - The ID of the hike to delete
 * @returns {object} 200 - Success message
 * @returns {object} 404 - Hike not found
 * @returns {object} 500 - Server error
 */
router.delete('/:id', checkAuthToken, async (req, res) => {
  try {
    const hike = await Hike.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!hike) {
      return res.status(404).send({ message: 'Hike not found.' });
    }

    res.json({ message: 'Hike successfully deleted.' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting the hike.', error: error.message });
  }
});



router.post('/:id/photos', checkAuthToken, upload.array('photos', 10), async (req, res) => {
    try {
        const hike = await Hike.findOne({ _id: req.params.id, userId: req.user.id });
        if (!hike) {
            return res.status(404).send({ message: 'Hike not found.' });
        }

        const photoUrls = [];
        for (const file of req.files) {
            const result = await uploadFile(file);
            photoUrls.push(result.Location);
            fs.unlinkSync(file.path); // Delete the temporary file
        }

        hike.photos.push(...photoUrls);
        await hike.save();

        res.status(200).send(hike);
    } catch (error) {
        if (req.files) {
            req.files.forEach(file => fs.unlinkSync(file.path)); // Ensure temporary files are deleted on error
        }
        res.status(500).send({ message: 'Error uploading photos.', error: error.message });
    }
});

module.exports = router;