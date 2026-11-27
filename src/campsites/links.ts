export const telHref = (phone: string): string => `tel:${phone.replace(/[\s()-]/g, '')}`;

export const mailHref = (email: string): string => `mailto:${email.trim()}`;

export const mapsHref = (query: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const coordinatesQuery = (latitude: number, longitude: number): string => `${latitude},${longitude}`;
