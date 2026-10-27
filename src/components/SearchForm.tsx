"use client";

import { useState } from "react";

interface SearchFormProps {
  onSearch: (query: string) => Promise<void>;
  isSearching?: boolean;
}

export default function SearchForm({ onSearch, isSearching = false }: SearchFormProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ナンバーを入力（例：品川300）"
          className="field flex-1 px-3.5 py-2.5"
          autoFocus
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="btn-primary px-4 py-2.5 shrink-0"
        >
          {isSearching ? "検索中..." : "検索"}
        </button>
      </div>
    </form>
  );
}
