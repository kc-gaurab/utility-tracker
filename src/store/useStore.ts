import { create } from 'zustand';
import type { AppState, Reading, Bill, Settlement } from '../types';
import { SEED_READINGS, SEED_BILLS, SEED_SETTLEMENTS } from '../utils/seedData';
import {
  saveReading,
  deleteReading as deleteReadingFromFirestore,
  saveBill,
  deleteBill as deleteBillFromFirestore,
  saveSettlement,
  deleteSettlement as deleteSettlementFromFirestore,
  subscribeToReadings,
  subscribeToBills,
  subscribeToSettlements,
  importAllData,
} from '../firebase/firestoreService';

interface Store extends AppState {
  // Firebase sync state
  isFirebaseSynced: boolean;
  setFirebaseSynced: (synced: boolean) => void;

  // Actions
  addReading: (reading: Reading) => void;
  updateReading: (originalDate: string, reading: Reading) => void;
  deleteReading: (date: string) => void;

  addBill: (bill: Bill) => void;
  updateBill: (id: string, bill: Bill) => void;
  deleteBill: (id: string) => void;

  addSettlement: (settlement: Settlement) => void;
  deleteSettlement: (date: string) => void;

  importData: (data: AppState) => void;
  exportData: () => AppState;
  resetData: () => void;

  // Firebase methods
  initializeFirebaseSync: () => void;
  uploadLocalDataToFirebase: () => Promise<void>;
}

const initialState: AppState = {
  readings: SEED_READINGS,
  bills: SEED_BILLS,
  settlements: SEED_SETTLEMENTS,
};

let unsubscribeReadings: (() => void) | null = null;
let unsubscribeBills: (() => void) | null = null;
let unsubscribeSettlements: (() => void) | null = null;

export const useStore = create<Store>()((set, get) => ({
  ...initialState,
  isFirebaseSynced: false,

  setFirebaseSynced: (synced: boolean) => set({ isFirebaseSynced: synced }),

  // Initialize Firebase real-time sync
  initializeFirebaseSync: () => {
    // Unsubscribe from any existing listeners
    if (unsubscribeReadings) unsubscribeReadings();
    if (unsubscribeBills) unsubscribeBills();
    if (unsubscribeSettlements) unsubscribeSettlements();

    // Subscribe to readings
    unsubscribeReadings = subscribeToReadings((readings) => {
      set({ readings, isFirebaseSynced: true });
    });

    // Subscribe to bills
    unsubscribeBills = subscribeToBills((bills) => {
      set({ bills, isFirebaseSynced: true });
    });

    // Subscribe to settlements
    unsubscribeSettlements = subscribeToSettlements((settlements) => {
      set({ settlements, isFirebaseSynced: true });
    });
  },

  // Upload local data to Firebase (useful for initial sync)
  uploadLocalDataToFirebase: async () => {
    const state = get();
    await importAllData({
      readings: state.readings,
      bills: state.bills,
      settlements: state.settlements,
    });
  },

  addReading: (reading) => {
    // Optimistic update
    set((state) => {
      const filtered = state.readings.filter((r) => r.date !== reading.date);
      return { readings: [...filtered, reading] };
    });

    // Sync to Firebase
    saveReading(reading).catch((error) => {
      console.error('Error saving reading to Firebase:', error);
    });
  },

  updateReading: (originalDate, reading) => {
    // Optimistic update
    set((state) => {
      const filtered = state.readings.filter(
        (r) => r.date !== originalDate && r.date !== reading.date
      );
      return { readings: [...filtered, reading] };
    });

    // Sync to Firebase
    Promise.all([
      originalDate !== reading.date ? deleteReadingFromFirestore(originalDate) : Promise.resolve(),
      saveReading(reading),
    ]).catch((error) => {
      console.error('Error updating reading in Firebase:', error);
    });
  },

  deleteReading: (date) => {
    // Optimistic update
    set((state) => ({
      readings: state.readings.filter((r) => r.date !== date),
    }));

    // Sync to Firebase
    deleteReadingFromFirestore(date).catch((error) => {
      console.error('Error deleting reading from Firebase:', error);
    });
  },

  addBill: (bill) => {
    // Optimistic update
    set((state) => ({ bills: [...state.bills, bill] }));

    // Sync to Firebase
    saveBill(bill).catch((error) => {
      console.error('Error saving bill to Firebase:', error);
    });
  },

  updateBill: (id, bill) => {
    // Optimistic update
    set((state) => {
      const filtered = state.bills.filter((b) => b.id !== id && b.id !== bill.id);
      return { bills: [...filtered, bill] };
    });

    // Sync to Firebase
    Promise.all([
      id !== bill.id ? deleteBillFromFirestore(id) : Promise.resolve(),
      saveBill(bill),
    ]).catch((error) => {
      console.error('Error updating bill in Firebase:', error);
    });
  },

  deleteBill: (id) => {
    // Optimistic update
    set((state) => ({
      bills: state.bills.filter((b) => b.id !== id),
    }));

    // Sync to Firebase
    deleteBillFromFirestore(id).catch((error) => {
      console.error('Error deleting bill from Firebase:', error);
    });
  },

  addSettlement: (settlement) => {
    // Optimistic update
    set((state) => {
      if (state.settlements.some((s) => s.date === settlement.date)) {
        return state;
      }
      return { settlements: [...state.settlements, settlement] };
    });

    // Sync to Firebase
    saveSettlement(settlement).catch((error) => {
      console.error('Error saving settlement to Firebase:', error);
    });
  },

  deleteSettlement: (date) => {
    // Optimistic update
    set((state) => ({
      settlements: state.settlements.filter((s) => s.date !== date),
    }));

    // Sync to Firebase
    deleteSettlementFromFirestore(date).catch((error) => {
      console.error('Error deleting settlement from Firebase:', error);
    });
  },

  importData: (data) => {
    set({
      readings: data.readings,
      bills: data.bills,
      settlements: data.settlements || [],
    });

    // Sync to Firebase
    importAllData(data).catch((error) => {
      console.error('Error importing data to Firebase:', error);
    });
  },

  exportData: () => {
    const state = get();
    return {
      readings: state.readings,
      bills: state.bills,
      settlements: state.settlements,
    };
  },

  resetData: () => set(initialState),
}));
