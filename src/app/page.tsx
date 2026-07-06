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
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          車両管理システム
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <SearchForm onSearch={handleSearch} isSearching={isSearching} />

          {notFound && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800 font-medium">未找到車輛</p>
              <p className="text-yellow-600 text-sm mt-1">
                該当する車両が見つかりませんでした
              </p>
            </div>
          )}
        </div>

        {multipleResults && multipleResults.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="font-medium text-gray-700">検索結果（{multipleResults.length}件）</h2>
            </div>
            <div className="divide-y">
              {multipleResults.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{vehicle.plate_number}</div>
                  <div className="text-sm text-gray-500">{vehicle.car_model}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/vehicles/new")}
            className="inline-flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規車両を登録
          </button>
        </div>
      </div>
    </div>
  );
}
