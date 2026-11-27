import { describe, expect, it } from 'vitest';

import { canSaveStand, parseOptionalNumber, type StandValues } from './validation';

const valid: StandValues = {
  standNumber: 'A12',
  rating: '8',
  shadePercent: '',
  costPerNight: '',
  width: '',
  length: '',
};

describe('canSaveStand', () => {
  it('accepts a stand with only stand number and rating', () => {
    expect(canSaveStand(valid)).toBe(true);
  });

  it('requires a stand number and a rating', () => {
    expect(canSaveStand({ ...valid, standNumber: '  ' })).toBe(false);
    expect(canSaveStand({ ...valid, rating: '' })).toBe(false);
  });

  it('keeps the rating between 0 and 10', () => {
    expect(canSaveStand({ ...valid, rating: '0' })).toBe(true);
    expect(canSaveStand({ ...valid, rating: '10' })).toBe(true);
    expect(canSaveStand({ ...valid, rating: '10.1' })).toBe(false);
    expect(canSaveStand({ ...valid, rating: '-1' })).toBe(false);
  });

  it('keeps shade between 0 and 100 when given', () => {
    expect(canSaveStand({ ...valid, shadePercent: '100' })).toBe(true);
    expect(canSaveStand({ ...valid, shadePercent: '101' })).toBe(false);
  });
});

describe('parseOptionalNumber', () => {
  it('returns undefined for blank input', () => {
    expect(parseOptionalNumber('   ')).toBeUndefined();
  });

  it('parses a given number', () => {
    expect(parseOptionalNumber('350')).toBe(350);
  });
});
