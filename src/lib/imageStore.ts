/**
 * Image compression + sessionStorage store for step photos.
 * Compresses to max 1024px wide at 0.7 JPEG quality before saving,
 * keeping each image well under 200KB and the full set under 2MB.
 */

const imgPrefix = 'cmce_img_';
const sigPrefix = 'cmce_sig_';
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const JPEG_QUALITY = 0.72;

/** Resize + compress a data URL using an offscreen canvas. Returns a JPEG data URL. */
export function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally if larger than max
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Rotate a data URL image 90° clockwise using an offscreen canvas. Returns a JPEG data URL. */
export function rotateImage90(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Swap width/height for 90° rotation
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return; }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function saveImage(stepId: string, dataUrl: string): void {
  sessionStorage.setItem(`${imgPrefix}${stepId}`, dataUrl);
}

export function loadImage(stepId: string): string | undefined {
  return sessionStorage.getItem(`${imgPrefix}${stepId}`) ?? undefined;
}

export function removeImage(stepId: string): void {
  sessionStorage.removeItem(`${imgPrefix}${stepId}`);
}

export function saveSignature(jobId: string, dataUrl: string): void {
  sessionStorage.setItem(`${sigPrefix}${jobId}`, dataUrl);
}

export function loadSignature(jobId: string): string | undefined {
  return sessionStorage.getItem(`${sigPrefix}${jobId}`) ?? undefined;
}

export function removeSignature(jobId: string): void {
  sessionStorage.removeItem(`${sigPrefix}${jobId}`);
}

export function clearAllImages(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(imgPrefix) || key?.startsWith(sigPrefix)) {
      keysToRemove.push(key!);
    }
  }
  keysToRemove.forEach((k) => sessionStorage.removeItem(k));
}
