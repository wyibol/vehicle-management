"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload from "@/components/PhotoUpload";
import { uploadImage, deleteImageByUrl } from "@/lib/upload";

export default function NewVehiclePage() {
  const router = useRouter();
  const [plateNumber, setPlateNumber] = useState("");
  const [carModel, setCarModel] = useState("");
  const [photos, setPhotos] = useState<Record<string, File | string | null>>({
    front: null,
    rear: null,
    left: null,
    right: null,
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

    const photoPositions = ["front", "rear", "left", "right"];
    const missingPhotos = photoPositions.filter((p) => !photos[p]);
    if (missingPhotos.length > 0) {
      setError("全ての写真（前・後・左・右）をアップロードしてください");
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
