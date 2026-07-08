import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
      <Link
        href="/tools/vehicles"
        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
      >
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17h14v-5H5v5zm11.5-10.5l2 4.5H18l-1.5-4.5h-9L6 11H4.5l2-4.5h10z" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </div>
        <span className="text-xs text-gray-600 text-center leading-tight">登録車両一覧</span>
      </Link>
    </div>
  );
}
