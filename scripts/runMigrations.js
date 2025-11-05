const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrationsDir = __dirname;

async function runMigrations() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in the environment.');
        }
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for migrations');

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.js') && file !== 'runMigrations.js')
            .sort(); // Ensure migrations run in order

        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);
            const migration = require(path.join(migrationsDir, file));
            if (typeof migration.up === 'function') {
                await migration.up();
                console.log(`Migration ${file} completed successfully.`);
            } else {
                console.warn(`Migration ${file} does not export an 'up' function. Skipping.`);
            }
        }

    } catch (error) {
        console.error('Error during migrations:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
}

runMigrations();
