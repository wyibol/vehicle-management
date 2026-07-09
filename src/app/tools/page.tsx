import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
      <Link
        href="/tools/vehicles"
        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="carPaint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3B82F6" />
                <stop offset="100%" stop-color="#1E3A8A" />
              </linearGradient>
            </defs>
            <ellipse cx="120" cy="105" rx="90" ry="5" fill="rgba(0,0,0,0.12)" />
            <path d="M 20 80 L 220 80 A 10 10 0 0 0 230 70 L 230 65 A 20 20 0 0 0 210 45 L 180 45 L 140 15 A 15 15 0 0 0 125 10 L 65 10 A 15 15 0 0 0 50 18 L 30 45 L 20 45 A 15 15 0 0 0 5 60 L 5 70 A 10 10 0 0 0 15 80 Z" fill="url(#carPaint)" />
            <path d="M 55 45 L 70 20 L 125 20 L 165 45 Z" fill="#DBEAFE" opacity="0.85" />
            <path d="M 115 20 L 115 45" stroke="url(#carPaint)" stroke-width="4.5" />
            <path d="M 225 55 L 230 55 L 230 65 L 223 65 Z" fill="#FBBF24" />
            <path d="M 5 55 L 10 55 L 10 65 L 5 65 Z" fill="#EF4444" />
            <circle cx="55" cy="80" r="18" fill="#1F2937" />
            <circle cx="55" cy="80" r="8" fill="#9CA3AF" />
            <circle cx="55" cy="80" r="3" fill="#F3F4F6" />
            <circle cx="185" cy="80" r="18" fill="#1F2937" />
            <circle cx="185" cy="80" r="8" fill="#9CA3AF" />
            <circle cx="185" cy="80" r="3" fill="#F3F4F6" />
          </svg>
        </div>
        <span className="text-xs text-gray-600 text-center leading-tight">登録車両一覧</span>
      </Link>
    </div>
  );
}
