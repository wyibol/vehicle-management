/**
 * Upload an image file to Alibaba Cloud OSS and return the public URL.
 *
 * The file goes through Vercel's serverless function but is already
 * compressed to ~1600px (~200-500KB) on the client side, well within
 * Vercel's 4.5MB body limit.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let msg = "アップロードに失敗しました";
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  return data.url;
}

/**
 * Delete an image from Alibaba Cloud OSS using its public URL via API.
 */
export async function deleteImageByUrl(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls: [imageUrl] }),
  });
  if (!res.ok) {
    console.error("画像の削除に失敗しました");
  }
}

/**
 * Delete multiple images from Alibaba Cloud OSS.
 */
export async function deleteImagesByUrls(imageUrls: string[]): Promise<void> {
  const urls = imageUrls.filter(Boolean);
  if (urls.length === 0) return;
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) {
    console.error("画像の削除に失敗しました");
  }
}
