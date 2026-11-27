export interface StandValues {
  standNumber: string;
  rating: string;
  shadePercent: string;
  costPerNight: string;
  width: string;
  length: string;
}

const isInRange = (value: string, min: number, max: number): boolean => {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number >= min && number <= max;
};

const isBlankOrInRange = (value: string, min: number, max: number): boolean =>
  value.trim() === '' || isInRange(value, min, max);

export const parseOptionalNumber = (value: string): number | undefined =>
  value.trim() === '' ? undefined : Number(value);

export const canSaveStand = (values: StandValues): boolean =>
  values.standNumber.trim() !== '' &&
  isInRange(values.rating, 0, 10) &&
  isBlankOrInRange(values.shadePercent, 0, 100) &&
  isBlankOrInRange(values.costPerNight, 0, Number.POSITIVE_INFINITY) &&
  isBlankOrInRange(values.width, 0, Number.POSITIVE_INFINITY) &&
  isBlankOrInRange(values.length, 0, Number.POSITIVE_INFINITY);
