const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Creates an authentication token for the given user.
 * @param {object} user - The user object.
 * @param {string} user.id - The user's ID.
 * @param {string} user.username - The user's username.
 * @returns {string} - The authentication token.
 */
function createAuthToken(user) {
    const payload = {
        id: user._id,
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email
    };

    const secret = process.env.ACCESS_TOKEN_SECRET; // Replace with your actual secret key

    const options = {
        expiresIn: '36h' // Token will expire in 36 hours
    };

    return jwt.sign(payload, secret, options);
}

module.exports = createAuthToken;