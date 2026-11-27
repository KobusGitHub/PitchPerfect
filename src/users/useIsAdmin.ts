import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '../auth/useAuth';
import { db } from '../lib/firebase';

interface ProfileState {
  uid: string;
  isAdmin: boolean;
}

// Reads the signed-in user's own profile. Until it has loaded, the user is treated as not an admin.
export const useIsAdmin = (): { isAdmin: boolean; loading: boolean } => {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid;
  const [profile, setProfile] = useState<ProfileState | null>(null);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      doc(db, 'users', uid),
      (snapshot) => setProfile({ uid, isAdmin: snapshot.data()?.isAdmin === true }),
      () => setProfile({ uid, isAdmin: false }),
    );
  }, [uid]);

  const current = profile?.uid === uid ? profile : null;
  return {
    isAdmin: current?.isAdmin ?? false,
    loading: authLoading || (uid !== undefined && current === null),
  };
};
