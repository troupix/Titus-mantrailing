const app = require('./index');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => {
      app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
      })
    })
    .catch(err => console.error('Could not connect to MongoDB...', err));
}