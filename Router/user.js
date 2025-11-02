const express = require('express');
const User = require('../Model/user');
const createAuthToken = require('../utils/createAuthToken');
const checkAuthToken = require('../utils/checkAuthToken');
const bcrypt = require('bcrypt');

const router = express.Router();

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
        res.json({ token });
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
    res.send('Check endpoint');
});



const multer = require('multer');
const { uploadFile } = require('../utils/r2');

const upload = multer({ dest: 'uploads/' });

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