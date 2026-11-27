import { describe, expect, it } from 'vitest';

import { canSaveCampSite, isValidEmail, isValidPhone } from '../campsites/validation';

const valid = { name: 'Riverside', province: 'Western Cape', phone: '+27 21 555 0100', email: 'site@example.com' };

describe('camp site validation', () => {
  it('accepts a complete camp site', () => {
    expect(canSaveCampSite(valid)).toBe(true);
  });

  it('accepts a camp site with only a name and province', () => {
    expect(canSaveCampSite({ name: 'Riverside', province: 'Western Cape', phone: '', email: '' })).toBe(true);
  });

  it('rejects a province outside the list', () => {
    expect(canSaveCampSite({ ...valid, province: 'Atlantis' })).toBe(false);
  });

  it('rejects a phone number that is too short', () => {
    expect(isValidPhone('12345')).toBe(false);
    expect(canSaveCampSite({ ...valid, phone: '12345' })).toBe(false);
  });

  it('rejects an email without a domain', () => {
    expect(isValidEmail('site@example')).toBe(false);
    expect(canSaveCampSite({ ...valid, email: 'site@example' })).toBe(false);
  });
});
