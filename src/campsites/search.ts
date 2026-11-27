import type { CampSite } from './campSiteService';

export const filterCampSites = (sites: CampSite[], query: string): CampSite[] => {
  const term = query.trim().toLowerCase();
  if (term === '') return sites;
  return sites.filter((site) => site.name.toLowerCase().includes(term) || site.province.toLowerCase().includes(term));
};
