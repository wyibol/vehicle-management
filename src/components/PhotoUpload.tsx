"use client";

import { useCallback, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { resizeImage } from "@/lib/images";

const POSITIONS = [
  { key: "front", label: "前" },
  { key: "rear", label: "後" },
  { key: "left", label: "左" },
  { key: "right", label: "右" },
  { key: "extra1", label: "追加" },
  { key: "extra2", label: "追加" },
  { key: "extra3", label: "追加" },
  { key: "extra4", label: "追加" },
] as const;

type PhotoMap = Record<string, File | string | null>;

interface PhotoUploadProps {
  photos: PhotoMap;
  onChange: (position: string, file: File | null) => void;
  existingUrls?: Record<string, string>;
}

export default function PhotoUpload({ photos, onChange, existingUrls = {} }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (position: string, file: File | null) => {
      if (!file) return;

      if (file.size > 20 * 1024 * 1024) {
        alert("ファイルサイズは20MB以下にしてください");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("画像ファイルを選択してください");
        return;
      }

      // Resize the image on the client to a reasonable max dimension.
      // This reduces upload size and display load without needing any
      // paid add-on like Supabase Image Transformation.
      try {
        const resizedBlob = await resizeImage(file);
        const resizedFile = new File([resizedBlob], file.name, {
          type: file.type,
        });
        onChange(position, resizedFile);
      } catch {
        // Fall back to the original image if resize fails
        onChange(position, file);
      }
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file && activePosition) {
        handleFileSelect(activePosition, file);
      }
      e.target.value = "";
      setActivePosition(null);
    },
    [activePosition, handleFileSelect]
  );

  const handleSlotClick = useCallback((position: string) => {
    setActivePosition(position);
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, position: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPosition(position);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, position: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverPosition(null);
      const file = e.dataTransfer.files?.[0] || null;
      if (file) {
        handleFileSelect(position, file);
      }
    },
    [handleFileSelect]
  );

  const getImageUrl = (position: string): string | null => {
    const photo = photos[position];
    if (!photo) return null;
    if (typeof photo === "string") return photo;
    return URL.createObjectURL(photo);
  };

  const hasPhoto = (position: string): boolean => {
    return !!photos[position];
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="grid grid-cols-2 gap-3">
        {POSITIONS.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => handleSlotClick(key)}
            onDragOver={(e) => handleDragOver(e, key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, key)}
            className={`relative aspect-[4/3] rounded-xl cursor-pointer overflow-hidden transition-colors ${
              dragOverPosition === key
                ? "border-2 border-dashed border-primary bg-primary/10"
                : hasPhoto(key)
                ? "border border-hairline bg-surface-1 hover:border-hairline-strong"
                : "border-2 border-dashed border-hairline bg-surface-1 hover:border-hairline-strong"
            }`}
          >
            {hasPhoto(key) ? (
              <>
                <img referrerPolicy="origin"
                  src={getImageUrl(key) || ""}
                  alt={label}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(key, null);
                  }}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 backdrop-blur border border-hairline-strong text-ink-muted rounded-full flex items-center justify-center text-sm hover:text-ink hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-ink-tertiary">
                <Plus className="w-8 h-8 mb-1" strokeWidth={1.5} />
                <span className="text-xs text-ink-subtle">{label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-tertiary mt-2 text-center">
        クリックまたはドラッグ＆ドロップで画像を追加（最大20MB）
      </p>
    </div>
  );
}
