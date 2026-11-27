import { describe, expect, it } from 'vitest';

import type { CampSite } from './campSiteService';
import { filterCampSites } from './search';

const site = (id: string, name: string, province: string): CampSite =>
  ({ id, name, province, phone: '', email: '', address: '', ownerUid: 'u1' }) as CampSite;

const sites = [
  site('1', 'Blue Lagoon', 'Western Cape'),
  site('2', 'Kruger Gate', 'Limpopo'),
  site('3', 'Cape Point Camp', 'Western Cape'),
];

describe('filterCampSites', () => {
  it('returns every site for a blank query', () => {
    expect(filterCampSites(sites, '   ')).toEqual(sites);
  });

  it('matches any part of the name, ignoring case', () => {
    expect(filterCampSites(sites, 'GATE').map((s) => s.id)).toEqual(['2']);
    expect(filterCampSites(sites, 'lagoon').map((s) => s.id)).toEqual(['1']);
  });

  it('matches any part of the province', () => {
    expect(filterCampSites(sites, 'western').map((s) => s.id)).toEqual(['1', '3']);
  });
});
