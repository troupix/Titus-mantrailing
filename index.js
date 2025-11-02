const express = require('express');
const cors = require('cors');
const app = express();
const userRouter = require('./Router/user'); // adjust the path according to your project structure
const userManagementRouter = require('./Router/userManagement'); // adjust the path according to your project structure
const mantrailingRouter = require('./Router/mantrailing');
const hikeRouter = require('./Router/hike');
const dogRouter = require('./Router/dog');
require('dotenv').config();



app.use(express.json()); // Parse JSON request bodies

// CORS Configuration
const allowedOrigins = [
  'https://troupix.github.io' // Allow the GitHub Pages origin
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

const mongoose = require('mongoose');


app.use('/api/user', userRouter);
app.use('/api/mantrailing', mantrailingRouter);
app.use('/api/hike', hikeRouter);
app.use('/api/users', userManagementRouter);
app.use('/api/dogs', dogRouter);

module.exports = app;
