const express = require('express');
const router = express.Router();
const Dog = require('../Model/dog');
const DogShareLink = require('../Model/dogShareLink');
const checkAuthToken = require('../utils/checkAuthToken');
const MantrailingTrail = require('../Model/trail');
const HikingTrail = require('../Model/hike');
const CanicrossTrail = require('../Model/canicross');
const { generateSignedUrl } = require('../utils/r2');

/**
 * @route   GET /api/trainer/dogs
 * @desc    Get all dogs for a specific trainer, populating ownerIds and trainer details
 * @access  Private (Trainer only)
 */
router.get('/dogs', checkAuthToken, async (req, res) => {
  try {
    // Ensure the requesting user is a trainer
    if (!req.user.role.includes('trainer')) {
      return res.status(403).send({ message: 'Unauthorized access. Only trainers can view this resource.' });
    }

    const trainerId = req.user.id;
    const dogs = await Dog.find({ 'trainers.trainerId': trainerId }).lean()
      .populate('ownerIds', 'username email') // Populate owner details
      .populate('trainers.trainerId', 'username'); // Populate trainer username

    const dogsWithData = await Promise.all(dogs.map(async (dog) => {
        // Generate signed URLs for photos
        if (dog.profilePhoto) {
            const fileName = dog.profilePhoto.split('/').pop();
            dog.profilePhoto = await generateSignedUrl(fileName);
        }
        if (dog.presentationPhoto) {
            const fileName = dog.presentationPhoto.split('/').pop();
            dog.presentationPhoto = await generateSignedUrl(fileName);
        }

        // Find the trainer's specific assignment for this dog
        const trainerAssignment = dog.trainers.find(t => t.trainerId._id.toString() === trainerId);
        const assignedActivities = trainerAssignment ? trainerAssignment.activities : [];

        dog.trails = [];

        // Fetch trails based on assigned activities
        if (assignedActivities.includes('mantrailing')) {
            const mantrailingTrails = await MantrailingTrail.find({ dog: dog._id }).lean();
            dog.trails.push(...mantrailingTrails.map(t => ({ ...t, category: 'mantrailing' })));
        }

        // For hiking and canicross, we assume they are linked to the dog's owners
        const ownerIds = dog.ownerIds.map(owner => owner._id);

        if (assignedActivities.includes('hiking')) {
            const hikingTrails = await HikingTrail.find({ userId: { $in: ownerIds } }).lean();
            // const hikesWithSignedPhotos = await Promise.all(hikingTrails.map(async (hike) => {
            //     if (hike.photos && hike.photos.length > 0) {
            //         hike.photos = await Promise.all(
            //             hike.photos.map(async (photoUrl) => {
            //                 const fileName = photoUrl.split('/').pop();
            //                 return await generateSignedUrl(fileName);
            //             })
            //         );
            //     }
            //     return { ...hike, category: 'hiking' };
            // }));
            dog.trails.push(...hikingTrails);
        }

        if (assignedActivities.includes('canicross')) {
            const canicrossTrails = await CanicrossTrail.find({ userId: { $in: ownerIds } }).lean();
            dog.trails.push(...canicrossTrails.map(t => ({ ...t, category: 'canicross' })));
        }

        // Sort all trails by date descending
        dog.trails.sort((a, b) => new Date(b.date) - new Date(a.date));

        return dog;
    }));

    res.send(dogsWithData);
  } catch (error) {
    console.error('Error fetching dogs for trainer:', error);
    res.status(500).send({ message: 'Failed to fetch dogs for trainer.', error: error.message });
  }
});

/**
 * @route   POST /api/trainer/claim-dog
 * @desc    Trainer claims a dog using a share token
 * @access  Private (Trainer only)
 */
router.post('/claim-dog', checkAuthToken, async (req, res) => {
  // This is the implementation from your dog.js file.
  // For brevity, I'm showing it conceptually. The full implementation
  // from dog.js should be moved here.
  // ... (implementation of claim-dog)
});


module.exports = router;