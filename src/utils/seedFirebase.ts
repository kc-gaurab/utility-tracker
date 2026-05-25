import { importAllData } from '../firebase/firestoreService';
import { SEED_READINGS, SEED_BILLS, SEED_SETTLEMENTS } from './seedData';

/**
 * Uploads all seed data to Firebase
 * Run this once to initialize Firebase with your seed data
 */
export const seedFirebase = async (): Promise<void> => {
  console.log('Starting Firebase seed...');

  try {
    await importAllData({
      readings: SEED_READINGS,
      bills: SEED_BILLS,
      settlements: SEED_SETTLEMENTS,
    });

    console.log('✓ Firebase seeded successfully!');
    console.log(`- ${SEED_READINGS.length} readings uploaded`);
    console.log(`- ${SEED_BILLS.length} bills uploaded`);
    console.log(`- ${SEED_SETTLEMENTS.length} settlements uploaded`);
  } catch (error) {
    console.error('Error seeding Firebase:', error);
    throw error;
  }
};
