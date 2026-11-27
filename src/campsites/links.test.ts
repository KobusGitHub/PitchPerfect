import { describe, expect, it } from 'vitest';

import { coordinatesQuery, mailHref, mapsHref, telHref } from './links';

describe('camp site links', () => {
  it('strips spaces and brackets from a telephone link', () => {
    expect(telHref('+27 (21) 555-0100')).toBe('tel:+27215550100');
  });

  it('builds a mailto link', () => {
    expect(mailHref(' site@example.com ')).toBe('mailto:site@example.com');
  });

  it('encodes an address for a map search', () => {
    expect(mapsHref('12 Main Rd, Cape Town')).toBe(
      'https://www.google.com/maps/search/?api=1&query=12%20Main%20Rd%2C%20Cape%20Town',
    );
  });

  it('uses latitude and longitude as the map query', () => {
    expect(coordinatesQuery(-33.9249, 18.4241)).toBe('-33.9249,18.4241');
  });
});
