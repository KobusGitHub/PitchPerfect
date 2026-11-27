import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const MAX_SIDE_PX = 256;
const JPEG_QUALITY = 0.8;

export const resizeToDataUrl = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE_PX / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not process that image.'));
        return;
      }
      // Fill white first so transparent PNGs don't turn black as JPEG.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    image.onerror = () => reject(new Error('Could not read that image.'));
    image.src = dataUrl;
  });

// Opens the browser's file chooser directly. Must be called from a click handler.
const pickFileOnWeb = (): Promise<string | null> =>
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read that file.'));
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });

const pickOnDevice = async (): Promise<string | null> => {
  // The native prompt offers Take Photo or Choose from gallery.
  const photo = await Camera.getPhoto({
    source: CameraSource.Prompt,
    resultType: CameraResultType.DataUrl,
    quality: 90,
    correctOrientation: true,
  });
  return photo.dataUrl ?? null;
};

export const pickCampSiteLogo = async (): Promise<string | null> => {
  try {
    const dataUrl = Capacitor.getPlatform() === 'web' ? await pickFileOnWeb() : await pickOnDevice();
    return dataUrl ? await resizeToDataUrl(dataUrl) : null;
  } catch (err) {
    // Cancelling the camera or picker is not an error.
    if (err instanceof Error && /cancel/i.test(err.message)) return null;
    throw err;
  }
};
