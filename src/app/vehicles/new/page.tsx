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
      // Upload all images first
      for (const position of photoPositions) {
        const file = photos[position];
        if (file instanceof File) {
          const url = await uploadImage(file);
          uploadedUrls[position] = url;
        }
      }

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
      <h1 className="text-xl font-bold text-gray-800 mb-6">新規車両登録</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ナンバー <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="例：品川300 あ1234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              車種 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="例：トヨタ クラウン"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            写真 <span className="text-red-500">*</span>
          </h2>
          <PhotoUpload photos={photos} onChange={handlePhotoChange} />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">メモ</h2>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="車両に関するメモを入力（300文字以内）"
            maxLength={300}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{memo.length}/300</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
