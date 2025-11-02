const fs = require('fs');
const express = require('express');
const router = express.Router();
const Dog = require('../Model/dog');
const checkAuthToken = require('../utils/checkAuthToken');
const multer = require('multer');
const { uploadFile, generateSignedUrl } = require('../utils/r2');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomUUID();
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${fileExtension}`);
    },
});

const upload = multer({ storage: storage });

// Create a new dog
router.post('/', checkAuthToken, upload.single('photo'), async (req, res) => {
    try {
        const dog = new Dog({
            ...req.body,
            ownerIds: [req.user.id],
        });

        if (req.file) {
            const uploadedImage = await uploadFile(req.file);
            dog.photo = uploadedImage.Location;
            fs.unlinkSync(req.file.path); // Delete the temporary file
        }

        await dog.save();
        res.status(201).send(dog);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path); // Ensure temporary file is deleted on error
        }
        res.status(400).send(error);
    }
});

// Get all dogs for a user
router.get('/', checkAuthToken, async (req, res) => {
    try {
        const dogs = await Dog.find({ ownerIds: req.user.id });

        const dogsWithSignedUrls = await Promise.all(dogs.map(async (dog) => {
            if (dog.photo) {
                const fileName = dog.photo.split('/').pop();
                const signedUrl = await generateSignedUrl(fileName);
                return { ...dog.toObject(), photo: signedUrl };
            }
            return dog.toObject();
        }));

        res.send(dogsWithSignedUrls);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a dog by ID
router.get('/:id', checkAuthToken, async (req, res) => {
    try {
        const dog = await Dog.findOne({ _id: req.params.id, ownerIds: req.user.id });
        if (!dog) {
            return res.status(404).send();
        }

        if (dog.photo) {
            const fileName = dog.photo.split('/').pop();
            const signedUrl = await generateSignedUrl(fileName);
            return res.send({ ...dog.toObject(), photo: signedUrl });
        }

        res.send(dog);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a dog by ID
router.put('/:id', checkAuthToken, async (req, res) => {
    try {
        const dog = await Dog.findOneAndUpdate({ _id: req.params.id, ownerIds: req.user.id }, req.body, { new: true, runValidators: true });
        if (!dog) {
            return res.status(404).send();
        }
        res.send(dog);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a dog by ID
router.delete('/:id', checkAuthToken, async (req, res) => {
    try {
        const dog = await Dog.findOneAndDelete({ _id: req.params.id, ownerIds: req.user.id });
        if (!dog) {
            return res.status(404).send();
        }
        res.send(dog);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/upload-photo', checkAuthToken, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Assuming uploadFile takes a file object from multer (req.file)
        // and returns an object with a 'Location' property containing the URL
        const result = await uploadFile(req.file);
        const photoUrl = result.Location;

        res.status(200).json({ url: photoUrl });
    } catch (error) {
        console.error('Error uploading dog photo:', error);
        res.status(500).json({ message: 'Failed to upload photo.', error: error.message });
    }
});

module.exports = router;
