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
  'https://troupix.github.io',
  'https://maximilien-api.com' // Allow the GitHub Pages origin
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

const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend', 'build')));


app.use('/api/user', userRouter);
app.use('/api/mantrailing', mantrailingRouter);
app.use('/api/hike', hikeRouter);
app.use('/api/users', userManagementRouter);
app.use('/api/dogs', dogRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

module.exports = app;