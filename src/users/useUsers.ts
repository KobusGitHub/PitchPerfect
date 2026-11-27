import { useEffect, useState } from 'react';

import { type AppUser, subscribeToUsers } from './userService';

export const useUsers = (): { users: AppUser[]; loading: boolean; error: string | null } => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeToUsers(
        (next) => {
          setUsers(next);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      ),
    [],
  );

  return { users, loading, error };
};
