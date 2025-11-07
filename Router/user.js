const express = require('express');
const User = require('../Model/user');
const createAuthToken = require('../utils/createAuthToken');
const checkAuthToken = require('../utils/checkAuthToken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { uploadFile } = require('../utils/r2');
const Dog = require('../Model/dog'); // Import the Dog model

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @route POST /api/user/login
 * @description Authenticates a user and returns a JWT token.
 * @access Public
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @returns {Object} token - A JWT token.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Please enter all fields');
    }

    let user;
    try {
        user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        const token = createAuthToken(user);
        res.json({ token, user: { _id: user._id, email: user.email, username: user.username, role: user.role } });
    });
});

/**
 * @route POST /api/user/register
 * @description Registers a new user and returns a JWT token.
 * @access Public
 * @param {string} req.body.username - The user's username.
 * @param {string} req.body.password - The user's password.
 * @param {string} req.body.email - The user's email.
 * @returns {Object} token - A JWT token.
 */
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('Please enter all fields');
    }

    if (password.length < 8) {
        return res.status(400).send('Password must be at least 8 characters');
    }

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Invalid email format');
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).send('User already exists');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user = new User({
            email,
            username,
            password: hashedPassword
        });

        const savedUser = await user.save();

        const token = createAuthToken(savedUser);
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

/**
 * @route GET /api/user/check
 * @description Checks if a user is authenticated.
 * @access Private
 * @middleware checkAuthToken
 */
router.get('/check', checkAuthToken, (req, res) => {
    res.send(req.user);
});

/**
 * @route GET /api/user/dog-trainers/:dogId
 * @description Retrieves all trainers assigned to a specific dog.
 * @access Private
 * @middleware checkAuthToken
 * @param {string} req.params.dogId - The ID of the dog.
 * @returns {User[]} An array of trainer user objects.
 */
router.get('/dog-trainers/:dogId', checkAuthToken, async (req, res) => {
  try {
    const { dogId } = req.params;
    const dog = await Dog.findById(dogId);

    if (!dog) {
      return res.status(404).send({ message: 'Dog not found.' });
    }

    const trainerIds = dog.trainers.map(t => t.trainerId);
    
    const trainers = await User.find({ '_id': { $in: trainerIds } }).select('-password');
    res.status(200).send(trainers);
  } catch (error) {
    console.error('Error fetching trainers for dog:', error);
    res.status(500).send({ message: 'Failed to fetch trainers.', error: error.message });
  }
});





router.post('/picture', checkAuthToken, upload.single('picture'), async (req, res) => {
    try {
        const result = await uploadFile(req.file);
        const user = await User.findById(req.user.id);
        user.profilePicture = result.Location;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;