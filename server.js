const app = require('./index');
const mongoose = require('mongoose');
// Explicitly load the .env file from the correct, absolute path.
// This removes any ambiguity about the current working directory.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  console.log("Attempting to connect to MongoDB...");
  mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => {
      console.log("Successfully connected to MongoDB.");
      app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
      });
    })
    .catch(err => console.error('Could not connect to MongoDB. Shutting down.', err));
}