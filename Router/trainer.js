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
      // Find the trainer's specific assignment for this dog
      const trainerAssignment = dog.trainers.find(t => t.trainerId._id.toString() === trainerId);
      const assignedActivities = trainerAssignment ? trainerAssignment.activities : [];

      dog.activityStats = {};

      // Fetch trails based on assigned activities
      if (assignedActivities.includes('mantrailing')) {
        dog.activityStats.mantrailing = await MantrailingTrail.countDocuments({ dog: dog._id });
        const lastTrail = await MantrailingTrail.findOne({ dog: dog._id }).sort({ date: -1 }).lean();
        if (lastTrail) {
          dog.lastTrailDate = lastTrail.date;
        }
      }

      // For hiking and canicross, we assume they are linked to the dog's owners
      const ownerIds = dog.ownerIds.map(owner => owner._id);

      if (assignedActivities.includes('hiking')) {
        dog.activityStats.hiking = await HikingTrail.countDocuments({ userId: { $in: ownerIds } });
        const lastTrail = await HikingTrail.findOne({ userId: { $in: ownerIds } }).sort({ date: -1 }).lean();
        if (lastTrail) {
          if (dog.lastTrailDate && dog.lastTrailDate < lastTrail.date) {
            dog.lastTrailDate = lastTrail.date;
          }
        }
      }

      if (assignedActivities.includes('canicross')) {
        dog.activityStats.canicross = await CanicrossTrail.countDocuments({ userId: { $in: ownerIds } });
      }

      // The 'trails' field is no longer needed for the overview
      delete dog.trails;
      const lastTrail = await MantrailingTrail.findOne({ dog: dog._id }).sort({ date: -1 }).lean();
      if (lastTrail) {
        if (dog.lastTrailDate && dog.lastTrailDate < lastTrail.date)
        dog.lastTrailDate = lastTrail.date;
      }
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
  try {
    if (!req.user.role.includes('trainer')) {
      return res.status(403).send({ message: 'Unauthorized access. Only trainers can perform this action.' });
    }

    const { shareToken } = req.body;
    if (!shareToken) {
      return res.status(400).send({ message: 'Share token is required.' });
    }

    const shareLink = await DogShareLink.findOne({ token: shareToken });

    if (!shareLink || shareLink.expiresAt < new Date()) {
      return res.status(404).send({ message: 'Share link is invalid or has expired.' });
    }

    const dog = await Dog.findById(shareLink.dogId);
    if (!dog) {
      return res.status(404).send({ message: 'Associated dog not found.' });
    }

    const trainerId = req.user.id;
    const trainerAssignment = dog.trainers.find(t => t.trainerId.toString() === trainerId);

    if (trainerAssignment) {
      // Trainer is already assigned, merge activities
      const newActivities = shareLink.activities.filter(activity => !trainerAssignment.activities.includes(activity));
      if (newActivities.length > 0) {
        trainerAssignment.activities.push(...newActivities);
      }
    } else {
      // Add new trainer to the dog
      dog.trainers.push({ trainerId: trainerId, activities: shareLink.activities });
    }

    await dog.save();
    await DogShareLink.deleteOne({ _id: shareLink._id }); // Invalidate the link after use

    res.status(200).send({ message: 'Dog successfully claimed.', dogId: dog._id });

  } catch (error) {
    console.error('Error claiming dog with share token:', error);
    res.status(500).send({ message: 'Failed to claim dog.', error: error.message });
  }
});

/**
 * @route   GET /api/trainer/dogs/:dogId/trails
 * @desc    Get all trails for a specific dog based on the trainer's assigned activities
 * @access  Private (Trainer only)
 */
router.get('/dogs/:dogId/trails', checkAuthToken, async (req, res) => {
  try {
    if (!req.user.role.includes('trainer')) {
      return res.status(403).send({ message: 'Unauthorized access. Only trainers can perform this action.' });
    }

    const { dogId } = req.params;
    const trainerId = req.user.id;

    const dog = await Dog.findById(dogId).populate('ownerIds', '_id');
    if (!dog) {
      return res.status(404).send({ message: 'Dog not found.' });
    }

    const trainerAssignment = dog.trainers.find(t => t.trainerId.toString() === trainerId);
    if (!trainerAssignment) {
      return res.status(403).send({ message: 'You are not assigned to this dog.' });
    }

    const assignedActivities = trainerAssignment.activities;
    const allTrails = [];

    // Fetch trails based on assigned activities
    if (assignedActivities.includes('mantrailing')) {
      const mantrailingTrails = await MantrailingTrail.find({ dog: dog._id }).lean();
      allTrails.push(...mantrailingTrails.map(t => ({ ...t, category: 'mantrailing' })));
    }

    const ownerIds = dog.ownerIds.map(owner => owner._id);

    if (assignedActivities.includes('hiking')) {
      const hikingTrails = await HikingTrail.find({ userId: { $in: ownerIds } }).lean();
      allTrails.push(...hikingTrails.map(t => ({ ...t, category: 'hiking' })));
    }

    if (assignedActivities.includes('canicross')) {
      const canicrossTrails = await CanicrossTrail.find({ userId: { $in: ownerIds } }).lean();
      allTrails.push(...canicrossTrails.map(t => ({ ...t, category: 'canicross' })));
    }

    // Sort all trails by date in descending order
    allTrails.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).send(allTrails);

  } catch (error) {
    console.error('Error fetching trails for dog:', error);
    res.status(500).send({ message: 'Failed to fetch trails.', error: error.message });
  }
});

/**
 * @route   GET /api/trainer/trails/:trailId
 * @desc    Get a single trail by its ID, verifying trainer access.
 * @access  Private (Trainer only)
 */
router.get('/trails/:trailId', checkAuthToken, async (req, res) => {
  try {
    if (!req.user.role.includes('trainer')) {
      return res.status(403).send({ message: 'Unauthorized access. Only trainers can perform this action.' });
    }

    const { trailId } = req.params;
    const trainerId = req.user.id;

    // We need to find which kind of trail it is. We can query all trail models.
    let trail = await MantrailingTrail.findById(trailId).lean();
    let trailCategory = 'mantrailing';

    if (!trail) {
      trail = await HikingTrail.findById(trailId).lean();
      trailCategory = 'hiking';
    }

    if (!trail) {
      trail = await CanicrossTrail.findById(trailId).lean();
      trailCategory = 'canicross';
    }

    if (!trail) {
      return res.status(404).send({ message: 'Trail not found.' });
    }

    // Now, verify trainer access to the dog associated with this trail.
    const dogId = trail.dog || (trail.userId ? (await Dog.findOne({ ownerIds: trail.userId }))._id : null);
    if (!dogId) {
        return res.status(404).send({ message: 'Could not determine the dog associated with this trail.' });
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return res.status(404).send({ message: 'Associated dog not found.' });
    }

    const trainerAssignment = dog.trainers.find(t => t.trainerId.toString() === trainerId);
    if (!trainerAssignment || !trainerAssignment.activities.includes(trailCategory)) {
      return res.status(403).send({ message: `You are not assigned to this dog for the '${trailCategory}' activity.` });
    }

    // Add category for the frontend
    trail.category = trailCategory;

    // If the trail is a hike and has photos, generate signed URLs
    if (trailCategory === 'hiking' && trail.photos && trail.photos.length > 0) {
      trail.photos = await Promise.all(
        trail.photos.map(async (photoUrl) => {
          const fileName = photoUrl.split('/').pop();
          return await generateSignedUrl(fileName);
        })
      );
    }

    res.status(200).send(trail);

  } catch (error) {
    console.error('Error fetching single trail for trainer:', error);
    res.status(500).send({ message: 'Failed to fetch trail.', error: error.message });
  }
});

module.exports = router;