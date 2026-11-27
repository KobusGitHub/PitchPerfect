import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

export const pickCampSiteLogo = async (): Promise<string | null> => {
  try {
    const photo = await Camera.getPhoto({
      source: CameraSource.Prompt,
      resultType: CameraResultType.DataUrl,
      quality: 90,
      correctOrientation: true,
    });
    return photo.dataUrl ? await resizeToDataUrl(photo.dataUrl) : null;
  } catch (err) {
    // Cancelling the camera or picker is not an error.
    if (err instanceof Error && /cancel/i.test(err.message)) return null;
    throw err;
  }
};
