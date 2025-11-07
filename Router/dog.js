const fs = require('fs');
const express = require('express');
const router = express.Router();
const Dog = require('../Model/dog');
const DogShareLink = require('../Model/dogShareLink');
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
            dog.profilePhoto = uploadedImage.Location;
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

// Generate a time-limited, activity-specific share token for a dog
router.post('/:dogId/share', checkAuthToken, async (req, res) => {
  try {
    const { dogId } = req.params;
    const { activities, expiresInHours = 24 } = req.body; // Default to 24 hours

    const dog = await Dog.findOne({ _id: dogId, ownerIds: req.user.id });
    if (!dog) {
      return res.status(404).send({ message: 'Dog not found or user not authorized.' });
    }

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return res.status(400).send({ message: 'Activities are required for sharing.' });
    }

    // Validate activities against enum in DogShareLink schema
    const validActivities = ['mantrailing', 'hiking', 'canicross']; // Should match schema enum
    const invalidActivities = activities.filter(activity => !validActivities.includes(activity));
    if (invalidActivities.length > 0) {
      return res.status(400).send({ message: `Invalid activities: ${invalidActivities.join(', ')}` });
    }

    const token = crypto.randomBytes(16).toString('hex'); // Generate a random token
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const dogShareLink = new DogShareLink({
      dogId,
      ownerId: req.user.id,
      token,
      activities,
      expiresAt,
    });

    await dogShareLink.save();
    res.status(201).send({ token });
  } catch (error) {
    console.error('Error generating dog share link:', error);
    res.status(500).send({ message: 'Failed to generate share link.', error: error.message });
  }
});

// Get all dogs for a user
router.get('/', checkAuthToken, async (req, res) => {
    try {
        const dogs = await Dog.find({ ownerIds: req.user.id }).populate('trainers.trainerId', 'username'); // Populate trainer username

        const dogsWithSignedUrls = await Promise.all(dogs.map(async (dog) => {
            let dogObject = dog.toObject();
            if (dog.profilePhoto) {
                const fileName = dog.profilePhoto.split('/').pop();
                const signedUrl = await generateSignedUrl(fileName);
                dogObject.profilePhoto = signedUrl;
            }
            if (dog.presentationPhoto) {
                const fileName = dog.presentationPhoto.split('/').pop();
                const signedUrl = await generateSignedUrl(fileName);
                dogObject.presentationPhoto = signedUrl;
            }
            return dogObject;
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

        let dogObject = dog.toObject();
        if (dog.profilePhoto) {
            const fileName = dog.profilePhoto.split('/').pop();
            const signedUrl = await generateSignedUrl(fileName);
            dogObject.profilePhoto = signedUrl;
        }
        if (dog.presentationPhoto) {
            const fileName = dog.presentationPhoto.split('/').pop();
            const signedUrl = await generateSignedUrl(fileName);
            dogObject.presentationPhoto = signedUrl;
        }

        res.send(dogObject);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/:id/presentation', checkAuthToken, upload.single('photo'), async (req, res) => {
    try {
        const { legend, presentation } = req.body;
        const dogId = req.params.id;

        const updateFields = { legend, presentation };

        if (req.file) {
            const uploadedImage = await uploadFile(req.file);
            updateFields.presentationPhoto = uploadedImage.Location;
            fs.unlinkSync(req.file.path); // Delete the temporary file
        }

        const dog = await Dog.findOneAndUpdate(
            { _id: dogId, ownerIds: req.user.id },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!dog) {
            return res.status(404).send({ message: 'Dog not found or user not authorized.' });
        }

        // Generate signed URL for the updated photo if it exists
        let dogResponse = dog.toObject();
        if (dog.profilePhoto) {
            const fileName = dog.profilePhoto.split('/').pop();
            const signedUrl = await generateSignedUrl(fileName);
            dogResponse.profilePhoto = signedUrl;
        }
        if (dog.presentationPhoto) {
            const fileName = dog.presentationPhoto.split('/').pop();
            const signedUrl = await generateSignedUrl(fileName);
            dogResponse.presentationPhoto = signedUrl;
        }

        res.send(dogResponse);
    } catch (error) {
        console.error('Error updating dog presentation:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path); // Ensure temporary file is deleted on error
        }
        res.status(400).send({ message: 'Failed to update dog presentation.', error: error.message });
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

router.post('/upload-profile-photo', checkAuthToken, upload.single('photo'), async (req, res) => {
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
