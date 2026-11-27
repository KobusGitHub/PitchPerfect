import { initializeApp } from 'firebase-admin/app';
import { FirebaseAuthError, getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// Cost guardrail: never run more than 2 instances of any function at once.
setGlobalOptions({ region: 'us-central1', maxInstances: 2 });
initializeApp();

const USERS_COLLECTION = 'users';
const MIN_PASSWORD_LENGTH = 6;

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

const requireSignedIn = (uid: string | undefined): string => {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Sign in first.');
  }
  return uid;
};

// Only profiles with isAdmin === true may manage users.
const requireAdmin = async (uid: string | undefined): Promise<string> => {
  const callerUid = requireSignedIn(uid);
  const caller = await getFirestore().collection(USERS_COLLECTION).doc(callerUid).get();
  if (caller.data()?.isAdmin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can manage users.');
  }
  return callerUid;
};

const requireText = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpsError('invalid-argument', `${label} is required.`);
  }
  return value.trim();
};

const parseProfile = (data: Record<string, unknown>): ProfileData => {
  const email = requireText(data.email, 'Email').toLowerCase();
  if (!email.includes('@')) {
    throw new HttpsError('invalid-argument', 'Email is not valid.');
  }
  return {
    firstName: requireText(data.firstName, 'First name'),
    lastName: requireText(data.lastName, 'Last name'),
    email,
    isAdmin: data.isAdmin === true,
  };
};

const parsePassword = (value: unknown): string => {
  if (typeof value !== 'string' || value.length < MIN_PASSWORD_LENGTH) {
    throw new HttpsError('invalid-argument', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  return value;
};

// Translates Firebase Auth errors into client-friendly callable errors.
const rethrowAuthError = (error: unknown): never => {
  if (error instanceof FirebaseAuthError) {
    switch (error.code) {
      case 'auth/email-already-exists':
        throw new HttpsError('already-exists', 'A user with this email already exists.');
      case 'auth/user-not-found':
        throw new HttpsError('not-found', 'User not found.');
      case 'auth/invalid-email':
        throw new HttpsError('invalid-argument', 'Email is not valid.');
    }
  }
  throw error;
};

export const createUser = onCall(async (request) => {
  const callerUid = await requireAdmin(request.auth?.uid);
  const profile = parseProfile(request.data ?? {});
  const password = parsePassword(request.data?.password);
  const db = getFirestore();

  let uid: string;
  try {
    const record = await getAuth().createUser({
      email: profile.email,
      password,
      displayName: `${profile.firstName} ${profile.lastName}`,
    });
    uid = record.uid;
  } catch (error) {
    return rethrowAuthError(error);
  }

  try {
    await db
      .collection(USERS_COLLECTION)
      .doc(uid)
      .set({
        ...profile,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: callerUid,
      });
  } catch (error) {
    // Keep Auth and the profile in step: remove the login if the profile could not be saved.
    await getAuth().deleteUser(uid);
    throw error;
  }

  return { uid };
});

export const updateUser = onCall(async (request) => {
  const callerUid = await requireAdmin(request.auth?.uid);
  const uid = requireText(request.data?.uid, 'User');
  const profile = parseProfile(request.data ?? {});

  if (uid === callerUid && !profile.isAdmin) {
    throw new HttpsError('failed-precondition', 'You cannot remove admin rights from your own account.');
  }
  const hasNewPassword = request.data?.password !== undefined && request.data?.password !== '';
  const password = hasNewPassword ? parsePassword(request.data.password) : undefined;

  try {
    await getAuth().updateUser(uid, {
      email: profile.email,
      displayName: `${profile.firstName} ${profile.lastName}`,
      ...(password ? { password } : {}),
    });
  } catch (error) {
    return rethrowAuthError(error);
  }

  await getFirestore().collection(USERS_COLLECTION).doc(uid).set(profile, { merge: true });
  return {};
});

export const deleteUser = onCall(async (request) => {
  const callerUid = await requireAdmin(request.auth?.uid);
  const uid = requireText(request.data?.uid, 'User');

  if (uid === callerUid) {
    throw new HttpsError('failed-precondition', 'You cannot delete the account you are signed in with.');
  }

  try {
    await getAuth().deleteUser(uid);
  } catch (error) {
    // A login that is already gone should not stop the profile from being removed.
    if (!(error instanceof FirebaseAuthError && error.code === 'auth/user-not-found')) {
      rethrowAuthError(error);
    }
  }

  await getFirestore().collection(USERS_COLLECTION).doc(uid).delete();
  return {};
});
