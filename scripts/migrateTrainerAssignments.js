const mongoose = require('mongoose');
const Dog = require('../Model/dog'); // Adjust path as needed
const User = require('../Model/user'); // Adjust path as needed

// Replace with your MongoDB connection string
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maximilien'; // Assuming 'maximilien' as default DB name

async function migrateTrainerAssignments() {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected for migration');

    const dogsToMigrate = await Dog.find({ "trainerIds.0": { $exists: true } });

    if (dogsToMigrate.length === 0) {
      console.log('No dogs with old trainerIds found to migrate.');
      return;
    }

    console.log(`Found ${dogsToMigrate.length} dogs to migrate.`);

    let migratedCount = 0;
    for (const dog of dogsToMigrate) {
      const newTrainers = dog.trainerIds.map(trainerId => ({
        trainerId: trainerId,
        activities: ['mantrailing'] // Default activity
      }));

      await Dog.updateOne(
        { _id: dog._id },
        {
          $set: { trainers: newTrainers },
          $unset: { trainerIds: "" }
        }
      );
      migratedCount++;
    }

    console.log(`Successfully migrated ${migratedCount} dogs.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

// Check if the script is run directly
if (require.main === module) {
  console.log('Starting migration script for trainer assignments...');
  migrateTrainerAssignments();
}

module.exports = migrateTrainerAssignments;
