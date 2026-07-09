"use client";

import { getOptimizedImageUrl, getViewerImageUrl } from "@/lib/images";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageViewer from "@/components/ImageViewer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonDetail } from "@/components/Skeleton";

type Vehicle = {
  id: string;
  plate_number: string;
  car_model: string;
  created_at: string;
  updated_at: string;
  // 🌟 终极解法：放宽限制，允许代码读取任何可能的字段名
  [key: string]: any; 
};

const POSITIONS = [
  { key: "front", label: "前面" },
  { key: "rear", label: "後面" },
  { key: "left", label: "左側" },
  { key: "right", label: "右側" },
  { key: "extra1", label: "追加" },
  { key: "extra2", label: "追加" },
  { key: "extra3", label: "追加" },
  { key: "extra4", label: "追加" },
] as const;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

export default function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchVehicle = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          setError("車両が見つかりません");
        } else {
          setError("データの取得に失敗しました");
        }
        return;
      }
      const data = await res.json();
      setVehicle(data);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("削除に失敗しました");
        return;
      }
      router.push("/tools/vehicles");
    } catch {
      alert("削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  if (loading) {
    return (
      <SkeletonDetail />
    );
  }

  if (error || !vehicle) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-medium">{error || "エラーが発生しました"}</p>
        <button
          onClick={() => router.push("/tools/vehicles")}
          className="mt-4 text-blue-600 hover:underline"
        >
          トップに戻る
        </button>
      </div>
    );
  }

  // Thumbnails: raw URLs (optimized in JSX via getOptimizedImageUrl)
  const allImages = POSITIONS.map((p) => {
    const imgUrl = vehicle[p.key] || vehicle[`${p.key}_image`];
    return {
      src: imgUrl as string,
      alt: p.label,
    };
  }).filter((img) => img.src);

  // Viewer: OSS-optimized 2560px for fast loading with good detail
  const viewerImages = allImages.map((img) => ({
    src: getViewerImageUrl(img.src, 95),
    thumbnail: getOptimizedImageUrl(img.src, 400),
    alt: img.alt,
  }));

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.plate_number}</h1>
            <p className="text-gray-600 mt-1">{vehicle.car_model}</p>
            <p className="text-sm text-gray-400 mt-2">
              最終更新: {formatDate(vehicle.updated_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/vehicles/${id}/edit`)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              編集
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {allImages.map((img, idx) => (
          <div
            key={img.alt}
            onClick={() => openViewer(idx)}
            className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="aspect-[4/3] relative">
              <img referrerPolicy="origin"
                src={getOptimizedImageUrl(img.src, 400)}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  拡大表示
                </span>
              </div>
            </div>
            <div className="p-2 text-center text-sm font-medium text-gray-600">
              {img.alt}
            </div>
          </div>
        ))}
      </div>

      {vehicle?.memo && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">メモ</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{vehicle.memo}</p>
        </div>
      )}

      {viewerOpen && (
        <ImageViewer
          images={viewerImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="車両を削除"
        message="確定删除该车辆吗？削除したデータは復元できません。"
        confirmText={isDeleting ? "削除中..." : "削除する"}
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </div>
  );
}
