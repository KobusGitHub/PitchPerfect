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

export interface CampSite {
  id: string;
  name: string;
  province: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface CampSiteInput {
  name: string;
  province: string;
  phone: string;
  email: string;
  logo?: string;
}

const campSitesCollection = collection(db, 'campSites');

export const subscribeToCampSites = (
  onChange: (sites: CampSite[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(campSitesCollection, orderBy('name')),
    (snapshot) =>
      onChange(
        snapshot.docs.map((snap) => {
          const data = snap.data();
          return {
            id: snap.id,
            name: String(data.name ?? ''),
            province: String(data.province ?? ''),
            phone: String(data.phone ?? ''),
            email: String(data.email ?? ''),
            logo: typeof data.logo === 'string' ? data.logo : undefined,
          };
        }),
      ),
    onError,
  );

export const addCampSite = async (input: CampSiteInput): Promise<void> => {
  await addDoc(campSitesCollection, input);
};

export const updateCampSite = async (id: string, input: CampSiteInput): Promise<void> => {
  // Clearing the logo must remove the field, not store undefined.
  await updateDoc(doc(db, 'campSites', id), { ...input, logo: input.logo ?? deleteField() });
};

export const deleteCampSite = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'campSites', id));
};
