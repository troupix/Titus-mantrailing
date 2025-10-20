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
        id: user.id,
        username: user.username
    };

    const secret = process.env.ACCESS_TOKEN_SECRET; // Replace with your actual secret key

    const options = {
        expiresIn: '1h' // Token will expire in 1 hour
    };

    return jwt.sign(payload, secret, options);
}

module.exports = createAuthToken;