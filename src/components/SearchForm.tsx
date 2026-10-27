"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ナンバーを入力（例：品川300）"
            className="field pl-9 py-2.5"
            autoFocus
          />
        </div>
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
