import { Geolocation } from '@capacitor/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Capacitor uses the native location service on the device and the browser API on web.
export const getCurrentCoordinates = async (): Promise<Coordinates> => {
  const permission = await Geolocation.requestPermissions();
  if (permission.location === 'denied' || permission.coarseLocation === 'denied') {
    throw new Error('Location permission is needed to use your current position.');
  }
  const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
};
