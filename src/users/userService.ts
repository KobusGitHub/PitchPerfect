import { collection, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { db, functions } from '../lib/firebase';

export interface AppUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  password?: string;
}

// Reads are direct from Firestore. Writes go through Cloud Functions, which hold the Admin SDK.
export const subscribeToUsers = (onChange: (users: AppUser[]) => void, onError: (error: Error) => void): Unsubscribe =>
  onSnapshot(
    query(collection(db, 'users'), orderBy('lastName')),
    (snapshot) =>
      onChange(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            firstName: String(data.firstName ?? ''),
            lastName: String(data.lastName ?? ''),
            email: String(data.email ?? ''),
            isAdmin: data.isAdmin === true,
          };
        }),
      ),
    onError,
  );

export const createUser = async (input: UserInput): Promise<void> => {
  await httpsCallable(functions, 'createUser')(input);
};

export const updateUser = async (uid: string, input: UserInput): Promise<void> => {
  await httpsCallable(functions, 'updateUser')({ uid, ...input });
};

export const deleteUser = async (uid: string): Promise<void> => {
  await httpsCallable(functions, 'deleteUser')({ uid });
};
