"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import SearchForm from "@/components/SearchForm";

type Vehicle = {
  id: string;
  plate_number: string;
  car_model: string;
  front_image: string;
  rear_image: string;
  left_image: string;
  right_image: string;
  created_at: string;
  updated_at: string;
};

export default function HomePage() {
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [multipleResults, setMultipleResults] = useState<Vehicle[] | null>(null);
  const router = useRouter();

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setNotFound(false);
    setMultipleResults(null);

    try {
      const res = await fetch(`/api/vehicles?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || data.length === 0) {
        setNotFound(true);
        return;
      }

      if (data.length === 1) {
        router.push(`/vehicles/${data[0].id}`);
      } else {
        setMultipleResults(data);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold tracking-[-1px] text-ink">
            車両管理システム
          </h1>
        </div>

        <div className="card p-4 md:p-6">
          <SearchForm onSearch={handleSearch} isSearching={isSearching} />

          {notFound && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-surface-2 border border-hairline text-center">
              <p className="text-sm font-medium text-ink-muted">未找到車輛</p>
              <p className="text-xs text-ink-subtle mt-1">
                該当する車両が見つかりませんでした
              </p>
            </div>
          )}
        </div>

        {multipleResults && multipleResults.length > 0 && (
          <div className="mt-6 card">
            <div className="px-4 py-3 border-b border-hairline">
              <h2 className="text-[13px] font-medium text-ink-muted">
                検索結果（{multipleResults.length}件）
              </h2>
            </div>
            <div className="divide-y divide-hairline">
              {multipleResults.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors group"
                >
                  <div>
                    <div className="text-[15px] font-medium text-ink tracking-[-0.2px]">
                      {vehicle.plate_number}
                    </div>
                    <div className="text-xs text-ink-subtle mt-0.5">{vehicle.car_model}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-tertiary group-hover:text-ink-muted transition-colors shrink-0" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => router.push("/vehicles/new")}
            aria-label="新規車両を登録"
            title="新規車両を登録"
            className="btn-primary w-full rounded-xl py-3.5"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
