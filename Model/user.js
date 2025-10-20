const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * User schema for storing user information.
 *
 * @typedef {Object} UserSchema
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {any} [additionalFields] - Additional fields as per your requirement.
 */
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    // add more fields as per your requirement
});

module.exports = mongoose.model('User', UserSchema);