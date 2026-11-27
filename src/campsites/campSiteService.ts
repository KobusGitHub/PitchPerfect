import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  type Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

export interface CampSite {
  id: string;
  name: string;
  province: string;
  phone: string;
  email: string;
  address: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
}

export interface CampSiteInput {
  name: string;
  province: string;
  phone: string;
  email: string;
  address: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
}

const campSitesCollection = collection(db, 'campSites');

export const subscribeToCampSites = (
  ownerUid: string,
  onChange: (sites: CampSite[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(campSitesCollection, where('ownerUid', '==', ownerUid)),
    (snapshot) =>
      onChange(
        snapshot.docs
          .map((snap) => {
            const data = snap.data();
            return {
              id: snap.id,
              name: String(data.name ?? ''),
              province: String(data.province ?? ''),
              phone: String(data.phone ?? ''),
              email: String(data.email ?? ''),
              address: String(data.address ?? ''),
              latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
              longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
              logo: typeof data.logo === 'string' ? data.logo : undefined,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name)),
      ),
    onError,
  );

export const addCampSite = async (ownerUid: string, input: CampSiteInput): Promise<void> => {
  // Firestore rejects undefined values, so optional fields that are not set are left out.
  const data = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
  await addDoc(campSitesCollection, { ...data, ownerUid });
};

export const updateCampSite = async (id: string, input: CampSiteInput): Promise<void> => {
  // Clearing an optional field must remove it, not store undefined.
  await updateDoc(doc(db, 'campSites', id), {
    ...input,
    logo: input.logo ?? deleteField(),
    latitude: input.latitude ?? deleteField(),
    longitude: input.longitude ?? deleteField(),
  });
};

export const deleteCampSite = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'campSites', id));
};
