/**
 * Generate an optimized Supabase storage URL with image transformation.
 *
 * Converts /object/public/... to /render/image/public/...?width=X&quality=Y
 * Falls back to the original URL if it's not a Supabase storage URL.
 *
 * NOTE: This requires Supabase Image Transformation add-on (Pro plan).
 * Without it, the render endpoint serves the original image unchanged.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  width = 800,
  quality = 80
): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("supabase.co") &&
      parsed.pathname.includes("/object/public/")
    ) {
      parsed.pathname = parsed.pathname.replace(
        "/object/public/",
        "/render/image/public/"
      );
      parsed.searchParams.set("width", String(width));
      parsed.searchParams.set("quality", String(quality));
      return parsed.toString();
    }
  } catch {}
  return url;
}

/**
 * Resize an image on the client side before upload.
 *
 * Uses a canvas to downscale the image to at most maxWidth × maxHeight while
 * maintaining aspect ratio. This drastically reduces file size and improves
 * display performance without requiring any paid Supabase add-on.
 *
 * @returns A Blob with the same image type as the original.
 */
export function resizeImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = width * (maxHeight / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        file.type || "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}
