export const SOUTH_AFRICAN_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];

interface CampSiteValues {
  name: string;
  province: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

export const isValidPhone = (phone: string): boolean => PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ''));

export const isValidEmail = (email: string): boolean => EMAIL_PATTERN.test(email.trim());

const isInRange = (value: string, limit: number): boolean => {
  const number = Number(value.trim());
  return value.trim() !== '' && Number.isFinite(number) && Math.abs(number) <= limit;
};

export const isValidLatitude = (value: string): boolean => isInRange(value, 90);

export const isValidLongitude = (value: string): boolean => isInRange(value, 180);

export const canSaveCampSite = (values: CampSiteValues): boolean =>
  values.name.trim() !== '' &&
  SOUTH_AFRICAN_PROVINCES.includes(values.province) &&
  (values.phone.trim() === '' || isValidPhone(values.phone.trim())) &&
  (values.email.trim() === '' || isValidEmail(values.email)) &&
  (values.latitude.trim() === '' || isValidLatitude(values.latitude)) &&
  (values.longitude.trim() === '' || isValidLongitude(values.longitude));
