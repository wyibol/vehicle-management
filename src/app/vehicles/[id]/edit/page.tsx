"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload from "@/components/PhotoUpload";
import { uploadImage, deleteImageByUrl } from "@/lib/upload";
import { SkeletonDetail } from "@/components/Skeleton";
import { Camera } from "lucide-react";

type Vehicle = {
  id: string;
  plate_number: string;
  car_model: string;
  front_image: string;
  rear_image: string;
  left_image: string;
  right_image: string;
  extra1_image: string;
  extra2_image: string;
  extra3_image: string;
  extra4_image: string;
  memo?: string;
  created_at: string;
  updated_at: string;
};

export default function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [carModel, setCarModel] = useState("");
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<Record<string, File | string | null>>({
    front: null,
    rear: null,
    extra1: null,
    extra2: null,
    extra3: null,
    extra4: null,
    left: null,
    right: null,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchVehicle = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles/${id}`);
      if (!res.ok) {
        setError("車両データの取得に失敗しました");
        return;
      }
      const data: Vehicle = await res.json();
      setVehicle(data);
      setPlateNumber(data.plate_number);
      setCarModel(data.car_model);
      setMemo(data.memo || "");
      setPhotos({
        front: data.front_image || null,
        rear: data.rear_image || null,
        left: data.left_image || null,
        right: data.right_image || null,
        extra1: (data as any).extra1_image || data.extra1_image || null,
        extra2: (data as any).extra2_image || data.extra2_image || null,
        extra3: (data as any).extra3_image || data.extra3_image || null,
        extra4: (data as any).extra4_image || data.extra4_image || null,
      });
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handlePhotoChange = (position: string, file: File | null) => {
    setPhotos((prev) => {
      const updated = { ...prev, [position]: file };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!plateNumber.trim()) {
      setError("ナンバーを入力してください");
      return;
    }

    const photoPositions = ["front", "rear", "left", "right", "extra1", "extra2", "extra3", "extra4"];
    const uploadedCount = photoPositions.filter((p) => photos[p]).length;
    if (uploadedCount === 0) {
      setError("少なくとも1枚の写真をアップロードしてください");
      return;
    }

    setIsSubmitting(true);
    const oldImageUrls: string[] = vehicle
      ? [vehicle.front_image, vehicle.rear_image, vehicle.left_image, vehicle.right_image, (vehicle as any).extra1_image || "", (vehicle as any).extra2_image || "", (vehicle as any).extra3_image || "", (vehicle as any).extra4_image || ""]
      : [];
    const newUploadedUrls: Record<string, string> = {};

    try {
      // Upload all new photos in parallel
      const uploadTasks = photoPositions.map(async (position) => {
        const file = photos[position];
        if (file instanceof File) {
          const url = await uploadImage(file);
          newUploadedUrls[position] = url;
        } else if (typeof file === "string" && file.length > 0) {
          newUploadedUrls[position] = file;
        } else {
          newUploadedUrls[position] = "";
        }
      });
      await Promise.all(uploadTasks);

      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate_number: plateNumber.trim(),
          car_model: carModel.trim(),
          front_image: newUploadedUrls.front,
          rear_image: newUploadedUrls.rear,
          left_image: newUploadedUrls.left,
          right_image: newUploadedUrls.right,
          extra1_image: newUploadedUrls.extra1 || null,
          extra2_image: newUploadedUrls.extra2 || null,
          extra3_image: newUploadedUrls.extra3 || null,
          extra4_image: newUploadedUrls.extra4 || null,
          memo: memo.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "更新に失敗しました");
      }

      // Clean up old OSS files: replaced images and removed images
      for (const position of photoPositions) {
        const imgKey = `${position}_image`;
        const oldUrl = (vehicle as any)?.[imgKey] || "";
        const newFile = photos[position];
        const newUrl = newUploadedUrls[position] || "";
        // Image was replaced (new upload) — delete old
        if (newFile instanceof File && oldUrl && oldUrl !== newUrl) {
          await deleteImageByUrl(oldUrl).catch(() => {});
        }
        // Image was removed (user clicked ✕) — delete old
        if (!newFile && oldUrl) {
          await deleteImageByUrl(oldUrl).catch(() => {});
        }
      }

      router.push(`/vehicles/${id}`);
    } catch (err) {
      // On failure, clean up only newly uploaded images, not existing ones
      const existingUrls = vehicle
        ? new Set(photoPositions.map(p => (vehicle as any)?.[`${p}_image`] || "").filter(Boolean))
        : new Set<string>();
      for (const url of Object.values(newUploadedUrls)) {
        if (url && !existingUrls.has(url)) {
          await deleteImageByUrl(url).catch(() => {});
        }
      }
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SkeletonDetail />
    );
  }

  if (error && !vehicle) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-medium text-danger">{error}</p>
        <button onClick={() => router.push("/tools/vehicles")} className="mt-4 text-primary hover:text-primary-hover hover:underline transition-colors">
          トップに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-[28px] font-semibold tracking-[-0.6px] text-ink mb-6">車両情報を編集</h1>

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
              車種
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
          <h2 className="text-[13px] font-medium text-ink-muted mb-4 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-ink-tertiary" strokeWidth={1.75} />
            写真 <span className="text-danger">*</span>
          </h2>
          <p className="text-xs text-ink-tertiary mb-3">
            既存の画像をクリックして新しい画像に差し替えるか、✕ボタンで削除してからアップロードしてください
          </p>
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
