/**
 * Generate an optimized thumbnail URL for Alibaba Cloud OSS with server-side
 * image processing (resize). Append ?x-oss-process=image/resize,w_N.
 *
 * OSS image processing is built into every bucket -- no paid add-on needed.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  width = 800,
  quality = 80
): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("aliyuncs.com")) {
      const params = `image/resize,w_${width}/quality,Q_${quality}`;
      parsed.searchParams.set("x-oss-process", params);
      return parsed.toString();
    }
  } catch {}
  return url;
}

/**
 * Generate a high-quality viewer URL that converts the image to WebP format
 * on the fly without resizing, preserving original resolution while cutting
 * file size by 40-60%. Quality 92 is near-lossless.
 *
 * Uses OSS server-side processing — no re-upload needed, originals untouched.
 */
export function getViewerImageUrl(
  url: string | undefined | null,
  quality = 92
): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("aliyuncs.com")) {
      parsed.searchParams.set(
        "x-oss-process",
        `image/format,webp/quality,Q_${quality}/interlace,1`
      );
      return parsed.toString();
    }
  } catch {}
  return url;
}

/**
 * Resize an image on the client side before upload.
 *
 * Uses a canvas to downscale the image to at most maxWidth x maxHeight while
 * maintaining aspect ratio. This drastically reduces file size and improves
 * display performance.
 *
 * @returns A Blob with the same image type as the original.
 */
export function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const w = img.width;
      const h = img.height;

      // Skip resize entirely for photos under 4096px — send original quality
      if (w <= 4096 && h <= 4096) {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
        return;
      }

      // Only downscale very large images (>4096px) proportionally
      let nw = w, nh = h;
      if (w > 4096) { nh = h * (4096 / w); nw = 4096; }
      if (nh > 4096) { nw = nw * (4096 / nh); nh = 4096; }

      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);

      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        file.type || "image/jpeg",
        0.95
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}
