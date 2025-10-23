
import 'dotenv/config';
import { getTrails, updateTrail } from './api';
import { convertGpxToGeoJSON } from './migration';
import { MantrailingTrail } from '../types/trail';

async function runMigration() {
  console.log('Starting migration...');
  try {
    const trails = await getTrails() as any[];
    console.log(`Found ${trails.length} trails.`);
    const mantrailingTrails = trails.filter(t => t.dogTrace?.hasOwnProperty('trk') || t.runnerTrace?.hasOwnProperty('trk'));
    //  const mantrailingTrails = [] as MantrailingTrail[];

    for (const trail of mantrailingTrails) {
      console.log(`Processing trail ${trail._id}`);
      let updated = false;
      const newTrail = { ...trail };

      if (newTrail.dogTrace && !newTrail.dogTrace.type) {
        console.log(`  - Migrating dogTrace`);
        const geoJsonTrace = convertGpxToGeoJSON(newTrail.dogTrace);
        if (geoJsonTrace) {
          newTrail.dogTrace = geoJsonTrace;
          updated = true;
        }
      }

      if (newTrail.runnerTrace && !newTrail.runnerTrace.type) {
        console.log(`  - Migrating runnerTrace`);
        const geoJsonTrace = convertGpxToGeoJSON(newTrail.runnerTrace);
        if (geoJsonTrace) {
          newTrail.runnerTrace = geoJsonTrace;
          updated = true;
        }
      }

      if (updated) {
        console.log(`  - Updating trail in database`);
        await updateTrail(newTrail._id!, newTrail);
        console.log(`  - Trail ${newTrail._id} updated successfully.`);
      }
    }

    console.log('Migration finished.');
  } catch (error) {
    console.error('An error occurred during migration:', error);
  }
}

runMigration();
