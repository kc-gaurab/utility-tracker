import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import type { Reading, Bill, Settlement, AppState } from '../types';

// Collection names
const COLLECTIONS = {
  READINGS: 'readings',
  BILLS: 'bills',
  SETTLEMENTS: 'settlements',
} as const;

// ============================================================================
// READINGS
// ============================================================================

export const saveReading = async (reading: Reading): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.READINGS, reading.date);
  await setDoc(docRef, reading);
};

export const deleteReading = async (date: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.READINGS, date);
  await deleteDoc(docRef);
};

export const subscribeToReadings = (
  callback: (readings: Reading[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const collectionRef = collection(db, COLLECTIONS.READINGS);

  return onSnapshot(
    collectionRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const readings: Reading[] = snapshot.docs.map((doc) => doc.data() as Reading);
      callback(readings);
    },
    onError
  );
};

// ============================================================================
// BILLS
// ============================================================================

export const saveBill = async (bill: Bill): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BILLS, bill.id);
  await setDoc(docRef, bill);
};

export const deleteBill = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.BILLS, id);
  await deleteDoc(docRef);
};

export const subscribeToBills = (
  callback: (bills: Bill[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const collectionRef = collection(db, COLLECTIONS.BILLS);

  return onSnapshot(
    collectionRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const bills: Bill[] = snapshot.docs.map((doc) => doc.data() as Bill);
      callback(bills);
    },
    onError
  );
};

// ============================================================================
// SETTLEMENTS
// ============================================================================

export const saveSettlement = async (settlement: Settlement): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SETTLEMENTS, settlement.date);
  await setDoc(docRef, settlement);
};

export const deleteSettlement = async (date: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.SETTLEMENTS, date);
  await deleteDoc(docRef);
};

export const subscribeToSettlements = (
  callback: (settlements: Settlement[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const collectionRef = collection(db, COLLECTIONS.SETTLEMENTS);

  return onSnapshot(
    collectionRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const settlements: Settlement[] = snapshot.docs.map((doc) => doc.data() as Settlement);
      callback(settlements);
    },
    onError
  );
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const importAllData = async (data: AppState): Promise<void> => {
  const batch = writeBatch(db);

  // Import readings
  data.readings.forEach((reading) => {
    const docRef = doc(db, COLLECTIONS.READINGS, reading.date);
    batch.set(docRef, reading);
  });

  // Import bills
  data.bills.forEach((bill) => {
    const docRef = doc(db, COLLECTIONS.BILLS, bill.id);
    batch.set(docRef, bill);
  });

  // Import settlements
  data.settlements.forEach((settlement) => {
    const docRef = doc(db, COLLECTIONS.SETTLEMENTS, settlement.date);
    batch.set(docRef, settlement);
  });

  await batch.commit();
};
