const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Using bcrypt as per package.json
require('dotenv').config();

// Load models
const User = require('../Model/user');
const Dog = require('../Model/dog');

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    // Clear existing data (optional, for clean seeding)
    // await User.deleteMany({});
    // await Dog.deleteMany({});
    console.log('Cleared existing users and dogs.');

    // 1. Create Regular User
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const regularUser = new User({
      username: 'regularuser',
      email: 'regular@example.com',
      password: hashedPassword1,
      role: ['user'],
    });
    await regularUser.save();
    console.log('Regular user created:', regularUser.username);

    // 2. Create Trainer User
    const hashedPassword2 = await bcrypt.hash('trainerpass', 10);
    const trainerUser = new User({
      username: 'traineruser',
      email: 'trainer@example.com',
      password: hashedPassword2,
      role: ['user', 'trainer'],
    });
    await trainerUser.save();
    console.log('Trainer user created:', trainerUser.username);

    // 3. Create a Dog linked to both users
    const dog = new Dog({
      name: 'Buddy',
      breed: 'Golden Retriever',
      birthDate: new Date('2020-01-15'),
      ownerIds: [regularUser._id],
      trainerIds: [trainerUser._id],
      profilePhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Buddy',
      presentationPhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Buddy',
      legend: 'A friendly golden retriever.',
      presentation: 'Buddy loves long walks and playing fetch.',
    });
    await dog.save();
    console.log('Dog created:', dog.name);

    // Update users with dog references
    regularUser.dogs.push(dog._id);
    await regularUser.save();

    trainerUser.trainedDogs.push(dog._id);
    await trainerUser.save();

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedDatabase();