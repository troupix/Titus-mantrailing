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
router.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        const user = new User({
            email,
            username,
            password: hashedPassword
        });

        user.save()
            .then(user => {
                const token = createAuthToken(user);
                res.json({ token });
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Server error');
            });
    });
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



module.exports = router;