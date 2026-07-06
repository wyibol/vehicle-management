/**
 * Upload an image file via API route and return the public URL.
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
 * Delete an image from Supabase Storage using its public URL via API.
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
 * Delete multiple images from Supabase Storage.
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
