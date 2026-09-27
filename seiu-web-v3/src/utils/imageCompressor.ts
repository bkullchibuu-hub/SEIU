/**
 * Utility to compress and resize images client-side before storing or uploading.
 * Reduces 5MB-10MB camera/phone photos to ~40KB-90KB crisp WebP/JPEG,
 * preventing browser localStorage quota exceeded errors and ensuring ultra-fast loads.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already a regular http/https URL, return as-is
    if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
      resolve(fileOrDataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio preserving dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          maxHeight = maxHeight;
          height = Math.round((img.height * maxHeight) / img.width);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original
        if (typeof fileOrDataUrl === 'string') resolve(fileOrDataUrl);
        else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(fileOrDataUrl);
        }
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try image/webp first, fallback to image/jpeg
      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData && webpData.startsWith('data:image/webp')) {
          resolve(webpData);
          return;
        }
      } catch (e) {
        // fallback to jpeg
      }

      const jpegData = canvas.toDataURL('image/jpeg', quality);
      resolve(jpegData);
    };

    img.onerror = (err) => {
      console.warn('Image compression load error, falling back:', err);
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
