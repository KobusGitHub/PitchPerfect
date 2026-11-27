import { useEffect, useState } from 'react';

import { type CampSite, subscribeToCampSites } from './campSiteService';

export const useCampSites = (): { sites: CampSite[]; loading: boolean; error: string | null } => {
  const [sites, setSites] = useState<CampSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeToCampSites(
        (next) => {
          setSites(next);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      ),
    [],
  );

  return { sites, loading, error };
};
