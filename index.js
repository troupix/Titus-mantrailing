const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const userRouter = require('./Router/user'); // adjust the path according to your project structure
const userManagementRouter = require('./Router/userManagement'); // adjust the path according to your project structure
const mantrailingRouter = require('./Router/mantrailing');
const hikeRouter = require('./Router/hike');
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

// This block now handles both DB connection and server startup.
// It will only run when you start the app with `node index.js`.
// It will NOT run when imported by Jest.
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    })
  })
  .catch(err => console.error('Could not connect to MongoDB...', err));



module.exports = app;
