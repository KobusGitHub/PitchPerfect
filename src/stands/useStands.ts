import { useEffect, useState } from 'react';

import { type Stand, subscribeToStands } from './standService';

export const useStands = (siteId: string | undefined): { stands: Stand[]; loading: boolean; error: string | null } => {
  const [stands, setStands] = useState<Stand[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId) return undefined;
    return subscribeToStands(
      siteId,
      (next) => {
        setStands(next);
        setLoaded(true);
      },
      (err) => {
        setError(err.message);
        setLoaded(true);
      },
    );
  }, [siteId]);

  if (!siteId) return { stands: [], loading: false, error: null };
  return { stands, loading: !loaded, error };
};
