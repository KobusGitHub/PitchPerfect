import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// Every saved image is kept under this many bytes so documents stay small.
export const MAX_IMAGE_BYTES = 500_000;

const MIN_SIDE_PX = 160;
const MIN_QUALITY = 0.5;

// Base64 data URLs are about a third bigger than the file they encode.
const dataUrlBytes = (dataUrl: string): number => {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64.length * 3) / 4 - padding;
};

// Lowers quality first, then size, until the JPEG fits under maxBytes.
export const resizeToDataUrl = (
  dataUrl: string,
  maxSidePx: number,
  quality: number,
  maxBytes: number = Infinity,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const encode = (side: number, jpegQuality: number): string => {
        const scale = Math.min(1, side / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not process that image.');
        // Fill white first so transparent PNGs don't turn black as JPEG.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', jpegQuality);
      };

      try {
        let side = maxSidePx;
        let jpegQuality = quality;
        let result = encode(side, jpegQuality);
        while (dataUrlBytes(result) > maxBytes) {
          if (jpegQuality - 0.1 >= MIN_QUALITY) {
            jpegQuality = Math.round((jpegQuality - 0.1) * 10) / 10;
          } else if (side * 0.8 >= MIN_SIDE_PX) {
            side = Math.round(side * 0.8);
          } else {
            throw new Error('That image is too large. Please choose a smaller one.');
          }
          result = encode(side, jpegQuality);
        }
        resolve(result);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not process that image.'));
      }
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

export const pickImage = async (maxSidePx: number, quality: number): Promise<string | null> => {
  try {
    const dataUrl = Capacitor.getPlatform() === 'web' ? await pickFileOnWeb() : await pickOnDevice();
    return dataUrl ? await resizeToDataUrl(dataUrl, maxSidePx, quality, MAX_IMAGE_BYTES) : null;
  } catch (err) {
    // Cancelling the camera or picker is not an error.
    if (err instanceof Error && /cancel/i.test(err.message)) return null;
    throw err;
  }
};

export const pickCampSiteLogo = (): Promise<string | null> => pickImage(256, 0.8);
