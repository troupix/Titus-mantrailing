const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const userRouter = require('./Router/user'); // adjust the path according to your project structure
const userManagementRouter = require('./Router/userManagement'); // adjust the path according to your project structure
const mantrailingRouter = require('./Router/mantrailing');
const hikeRouter = require('./Router/hike');
const trainerRouter = require('./Router/trainer');
const dogRouter = require('./Router/dog');
const canicrossRouter = require('./Router/canicross');
require('dotenv').config();


// When running behind a reverse proxy like Nginx, Express needs to be told to trust
// the X-Forwarded-* headers that Nginx adds to the request. This is crucial for
// security middleware like CORS and for correct IP address logging.
app.set('trust proxy', 1); // Trust the first proxy
app.use(express.json()); // Parse JSON request bodies

// CORS Configuration
const allowedOrigins = [
  'https://troupix.github.io',
  'https://maliemaxtitus.fr' // Allow the GitHub Pages origin
];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}
// Allow localhost for development environments
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(/http:\/\/localhost:\d+/);
}

app.use(cors({
  origin: allowedOrigins
}));

// API routes must be registered before the static file serving and catch-all route.
app.use('/api/user', userRouter);
app.use('/api/mantrailing', mantrailingRouter);
app.use('/api/hike', hikeRouter);
app.use('/api/users', userManagementRouter);
app.use('/api/trainer', trainerRouter);
app.use('/api/dog', dogRouter);
app.use('/api/canicross', canicrossRouter);
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });


module.exports = app;