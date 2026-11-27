import { useEffect, useState } from 'react';

import { type CampSite, subscribeToCampSites } from './campSiteService';

export const useCampSites = (
  ownerUid: string | undefined,
): { sites: CampSite[]; loading: boolean; error: string | null } => {
  const [sites, setSites] = useState<CampSite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerUid) return undefined;
    return subscribeToCampSites(
      ownerUid,
      (next) => {
        setSites(next);
        setLoaded(true);
      },
      (err) => {
        setError(err.message);
        setLoaded(true);
      },
    );
  }, [ownerUid]);

  if (!ownerUid) return { sites: [], loading: false, error: null };
  return { sites, loading: !loaded, error };
};
