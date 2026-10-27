"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { SkeletonCard } from "@/components/Skeleton";

interface Vehicle {
  id: string;
  plate_number: string;
  car_model: string;
  created_at: string;
  updated_at: string;
}

type SortMode = "created" | "updated";

export default function RegisteredVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated");

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVehicles(data);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => setError("データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const key = sortMode === "created" ? "created_at" : "updated_at";
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
  }, [vehicles, sortMode]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-ink-subtle">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-medium text-ink-subtle">
          登録件数: {vehicles.length}件
        </h2>
        {/* タブ（pill）: surface-2 ベース、選択中は surface-3 */}
        <div className="flex rounded-full bg-surface-2 border border-hairline p-0.5">
          <button
            onClick={() => setSortMode("created")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              sortMode === "created"
                ? "bg-surface-3 text-ink"
                : "text-ink-tertiary hover:text-ink-muted"
            }`}
          >
            登録日時
          </button>
          <button
            onClick={() => setSortMode("updated")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              sortMode === "updated"
                ? "bg-surface-3 text-ink"
                : "text-ink-tertiary hover:text-ink-muted"
            }`}
          >
            更新日時
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-ink-tertiary">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
            <path d="M5 17h14v-5H5v5zm11.5-10.5l2 4.5H18l-1.5-4.5h-9L6 11H4.5l2-4.5h10z" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          <p className="text-sm text-ink-subtle">登録された車両はまだありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVehicles.map((v) => (
            <Link
              key={v.id}
              href={`/vehicles/${v.id}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-surface-1 border border-hairline hover:border-hairline-strong hover:bg-surface-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-surface-2 border border-hairline flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17h14v-5H5v5zm11.5-10.5l2 4.5H18l-1.5-4.5h-9L6 11H4.5l2-4.5h10z" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-ink tracking-[-0.2px]">{v.plate_number}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  {sortMode === "created" ? "登録日: " : "最終更新: "}
                  {new Date(v[sortMode === "created" ? "created_at" : "updated_at"]).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#62666d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
