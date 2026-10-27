"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink-tertiary group-hover:text-ink-muted transition-colors shrink-0"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/vehicles/new")}
            className="btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規車両を登録
          </button>
        </div>
      </div>
    </div>
  );
}
