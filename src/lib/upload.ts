/**
 * Upload an image file via OSS presigned URL and return the public URL.
 *
 * The file never passes through Vercel -- it goes directly to Alibaba Cloud OSS
 * in Tokyo (ap-northeast-1), bypassing Vercel's 4.5MB body limit entirely.
 */
export async function uploadImage(file: File): Promise<string> {
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (!presignRes.ok) {
    let msg = "アップロードに失敗しました";
    try {
      const data = await presignRes.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const { signedUrl, publicUrl } = await presignRes.json();

  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!uploadRes.ok) {
    let msg = "アップロードに失敗しました";
    try {
      const data = await uploadRes.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return publicUrl;
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
