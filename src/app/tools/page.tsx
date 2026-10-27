import Link from "next/link";
import { CarFront } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <Link
        href="/tools/vehicles"
        className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-1 border border-hairline hover:border-hairline-strong hover:bg-surface-2 transition-colors"
      >
        <div className="w-14 h-14 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center group-hover:border-hairline-strong transition-colors">
          <CarFront className="w-8 h-8 text-ink-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
        </div>
        <span className="text-xs text-ink-muted text-center leading-tight">登録車両一覧</span>
      </Link>
    </div>
  );
}
