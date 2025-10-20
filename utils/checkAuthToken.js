const jwt = require('jsonwebtoken');
require('dotenv').config();

function checkAuthToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).send('Access Denied: No Authorization Header!');

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied: No Token Provided!');
    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('verified', verified)
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).send('Invalid Token');
    }
}

module.exports = checkAuthToken;