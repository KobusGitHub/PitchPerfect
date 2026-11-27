import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

export const MAX_STAND_IMAGES = 3;

export interface StandInput {
  standNumber: string;
  rating: number;
  shadePercent?: number;
  costPerNight?: number;
  width?: number;
  length?: number;
  notes?: string;
  images: string[];
}

export interface Stand extends StandInput {
  id: string;
}

const STAND_KEYS: (keyof StandInput)[] = [
  'standNumber',
  'rating',
  'shadePercent',
  'costPerNight',
  'width',
  'length',
  'notes',
  'images',
];

const standsCollection = (siteId: string) => collection(db, 'campSites', siteId, 'stands');

const optionalNumber = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined);

// Firestore rejects undefined. On update, a missing optional value clears the stored field.
const toData = (input: StandInput, clearMissing: boolean): Record<string, unknown> => {
  const data: Record<string, unknown> = {};
  for (const key of STAND_KEYS) {
    const value = input[key];
    if (value !== undefined) data[key] = value;
    else if (clearMissing) data[key] = deleteField();
  }
  return data;
};

export const subscribeToStands = (
  siteId: string,
  onChange: (stands: Stand[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(standsCollection(siteId), orderBy('rating', 'desc')),
    (snapshot) =>
      onChange(
        snapshot.docs.map((snap) => {
          const data = snap.data();
          return {
            id: snap.id,
            standNumber: String(data.standNumber ?? ''),
            rating: Number(data.rating ?? 0),
            shadePercent: optionalNumber(data.shadePercent),
            costPerNight: optionalNumber(data.costPerNight),
            width: optionalNumber(data.width),
            length: optionalNumber(data.length),
            notes: typeof data.notes === 'string' ? data.notes : undefined,
            images: Array.isArray(data.images)
              ? data.images.filter((img): img is string => typeof img === 'string')
              : [],
          };
        }),
      ),
    onError,
  );

export const addStand = async (siteId: string, input: StandInput): Promise<void> => {
  await addDoc(standsCollection(siteId), toData(input, false));
};

export const updateStand = async (siteId: string, standId: string, input: StandInput): Promise<void> => {
  await updateDoc(doc(db, 'campSites', siteId, 'stands', standId), toData(input, true));
};

export const deleteStand = async (siteId: string, standId: string): Promise<void> => {
  await deleteDoc(doc(db, 'campSites', siteId, 'stands', standId));
};
