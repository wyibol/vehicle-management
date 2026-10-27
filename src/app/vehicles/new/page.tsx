"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload from "@/components/PhotoUpload";
import { uploadImage, deleteImageByUrl } from "@/lib/upload";

export default function NewVehiclePage() {
  const router = useRouter();
  const [plateNumber, setPlateNumber] = useState("");
  const [carModel, setCarModel] = useState("");
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<Record<string, File | string | null>>({
    front: null,
    rear: null,
    left: null,
    right: null,
    extra1: null,
    extra2: null,
    extra3: null,
    extra4: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (position: string, file: File | null) => {
    setPhotos((prev) => ({ ...prev, [position]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!plateNumber.trim()) {
      setError("ナンバーを入力してください");
      return;
    }

    if (!carModel.trim()) {
      setError("車種を入力してください");
      return;
    }

    const photoPositions = ["front", "rear", "left", "right", "extra1", "extra2", "extra3", "extra4"];
    const uploadedCount = photoPositions.filter((p) => photos[p]).length;
    if (uploadedCount === 0) {
      setError("少なくとも1枚の写真をアップロードしてください");
      return;
    }

    setIsSubmitting(true);
    const uploadedUrls: Record<string, string> = {};

    try {
      // Upload all images in parallel
      const uploadTasks = photoPositions.map(async (position) => {
        const file = photos[position];
        if (file instanceof File) {
          const url = await uploadImage(file);
          uploadedUrls[position] = url;
        }
      });
      await Promise.all(uploadTasks);

      // Create vehicle record
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate_number: plateNumber.trim(),
          car_model: carModel.trim(),
          front_image: uploadedUrls.front,
          rear_image: uploadedUrls.rear,
          left_image: uploadedUrls.left,
          right_image: uploadedUrls.right,
          extra1_image: uploadedUrls.extra1,
          extra2_image: uploadedUrls.extra2,
          extra3_image: uploadedUrls.extra3,
          extra4_image: uploadedUrls.extra4,
          memo: memo.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "作成に失敗しました");
      }

      const vehicle = await res.json();
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      // Clean up uploaded images on failure
      for (const url of Object.values(uploadedUrls)) {
        if (url) await deleteImageByUrl(url).catch(() => {});
      }
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[28px] font-semibold tracking-[-0.6px] text-ink mb-6">新規車両登録</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
              ナンバー <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="例：品川300 あ1234"
              className="field"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-muted mb-1.5">
              車種 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="例：トヨタ クラウン"
              className="field"
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-[13px] font-medium text-ink-muted mb-4">
            写真 <span className="text-danger">*</span>
          </h2>
          <PhotoUpload photos={photos} onChange={handlePhotoChange} />
        </div>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-[13px] font-medium text-ink-muted mb-2">メモ</h2>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="車両に関するメモを入力（300文字以内）"
            maxLength={300}
            rows={4}
            className="field resize-vertical"
          />
          <p className="text-xs text-ink-tertiary mt-1 text-right">{memo.length}/300</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
