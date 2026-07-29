/**
 * Utility to compress and convert image files (e.g. mobile screenshots) to Base64 Data URLs.
 * Ensures fast, effortless uploads without relying on third-party API keys.
 */
export async function compressAndConvertToBase64(
  file: File,
  maxWidth = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data URL if canvas context fails
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('Failed to read selected image file.'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to load file.'));
    };
    reader.readAsDataURL(file);
  });
}
