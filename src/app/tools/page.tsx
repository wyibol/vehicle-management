import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <Link
        href="/tools/vehicles"
        className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-1 border border-hairline hover:border-hairline-strong hover:bg-surface-2 transition-colors"
      >
        <div className="w-14 h-14 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center group-hover:border-hairline-strong transition-colors">
          <svg width="40" height="40" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="105" rx="90" ry="5" fill="rgba(247,248,248,0.06)" />
            <path d="M 20 80 L 220 80 A 10 10 0 0 0 230 70 L 230 65 A 20 20 0 0 0 210 45 L 180 45 L 140 15 A 15 15 0 0 0 125 10 L 65 10 A 15 15 0 0 0 50 18 L 30 45 L 20 45 A 15 15 0 0 0 5 60 L 5 70 A 10 10 0 0 0 15 80 Z" fill="#5e6ad2" />
            <path d="M 55 45 L 70 20 L 125 20 L 165 45 Z" fill="#8a8f98" opacity="0.8" />
            <path d="M 115 20 L 115 45" stroke="#5e6ad2" stroke-width="4.5" />
            <path d="M 225 55 L 230 55 L 230 65 L 223 65 Z" fill="#d0d6e0" />
            <path d="M 5 55 L 10 55 L 10 65 L 5 65 Z" fill="#eb5757" />
            <circle cx="55" cy="80" r="18" fill="#23252a" />
            <circle cx="55" cy="80" r="8" fill="#62666d" />
            <circle cx="55" cy="80" r="3" fill="#8a8f98" />
            <circle cx="185" cy="80" r="18" fill="#23252a" />
            <circle cx="185" cy="80" r="8" fill="#62666d" />
            <circle cx="185" cy="80" r="3" fill="#8a8f98" />
          </svg>
        </div>
        <span className="text-xs text-ink-muted text-center leading-tight">登録車両一覧</span>
      </Link>
    </div>
  );
}
