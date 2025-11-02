const express = require('express');
const router = express.Router();
const user = require('../Model/user'); // adjust the path according to your project structure
const bcrypt = require('bcrypt');

/**
 * Retrieves all users.
 * 
 * @returns {user[]} The list of all users.
 */
router.get('/', (req, res) => {
    user.find({}, { password: 0 }) // Exclude the password field from the response
        .then(users => res.json(users))
        .catch(err => res.status(400).json({ message: err }));
});

/**
 * Retrieves a user by ID.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the user.
 * @returns {user} The user object.
 */
router.get('/:id', (req, res) => {
    user.findById(req.params.id, { password: 0 }) // Exclude the password field from the response
        .then(user => res.json(user))
        .catch(err => res.status(400).json({ message: err }));
}

);

/**
 * Creates a new user.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.color - The color of the user.
 * @param {string|string[]} req.body.role - The role(s) of the user.
 * 
 * @returns {user} The newly created user object.
 */
router.post('/create', (req, res) => {
    const newUser = new user({
        username: req.body.username,
        password: bcrypt.hashSync('password', 10), // Set a default password
        email: req.body.email,
        color: req.body.color,
        role: req.body.role ? (Array.isArray(req.body.role) ? req.body.role : [req.body.role]) : ['user']
    });
    newUser.save({ password: 0 }) // Exclude the password field from the response
        .then(user => res.json(user))
        .catch(err => res.status(400).json({ message: err }));
}
);

/**
 * Updates a user by ID.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.color - The color of the user.
 * @param {string|string[]} req.body.role - The role(s) of the user.
 * 
 * @returns {user} The updated user object.
 */
router.put('/:id', (req, res) => {
    const updateFields = {
        username: req.body.name,
        email: req.body.mail,
        color: req.body.color,
    };

    if (req.body.role) {
        updateFields.role = Array.isArray(req.body.role) ? req.body.role : [req.body.role];
    }

    if (req.body.password) {
        updateFields.password = bcrypt.hashSync(req.body.password, 10);
    }

    user.findByIdAndUpdate(req.params.id, updateFields, { new: true, select: '-password' })
        .then(user => res.json(user))
        .catch(err => res.status(400).json({ message: err }));
});

/**
 * Deletes a user by ID.
 * 
 * @param {Object} req - The request object.
 * @param {string} req.params.id - The ID of the user.
 */
router.delete('/:id', (req, res) => {
    user.findByIdAndDelete(req.params.id)
        .then(() => res.json({ message: 'User deleted' }))
        .catch(err => res.status(400).json({ message: err }));
}
);



module.exports = router;