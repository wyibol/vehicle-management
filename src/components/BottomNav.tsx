"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, StickyNote, Wrench } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isTools = pathname.startsWith("/tools");
  const isMemo = pathname.startsWith("/memo");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur border-t border-hairline">
      <div className="max-w-4xl mx-auto flex pb-[env(safe-area-inset-bottom)]">
        <Link
          href="/"
          aria-label="ホーム"
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors duration-200 ${
            isHome ? "text-primary" : "text-ink-tertiary hover:text-ink-muted"
          }`}
        >
          <Home className="w-[22px] h-[22px]" strokeWidth={1.75} />
          <span className="text-[11px] font-medium">ホーム</span>
        </Link>
        <Link
          href="/tools"
          aria-label="ツール"
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors duration-200 ${
            isTools ? "text-primary" : "text-ink-tertiary hover:text-ink-muted"
          }`}
        >
          <Wrench className="w-[22px] h-[22px]" strokeWidth={1.75} />
          <span className="text-[11px] font-medium">ツール</span>
        </Link>
        <Link
          href="/memo"
          aria-label="メモ"
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors duration-200 ${
            isMemo ? "text-primary" : "text-ink-tertiary hover:text-ink-muted"
          }`}
        >
          <StickyNote className="w-[22px] h-[22px]" strokeWidth={1.75} />
          <span className="text-[11px] font-medium">メモ</span>
        </Link>
      </div>
    </nav>
  );
}
