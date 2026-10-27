"use client";

import "./globals.css";
import { useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/react";
import { CarFront } from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js?v=4").catch(() => {});
    }
  }, []);

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#010102" />
        <meta name="description" content="車両情報管理アプリケーション" />
        <meta name="referrer" content="origin" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
        <title>美ら島車両管理</title>
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {/* トップナビ: 高さ 56px、canvas + hairline 下線 */}
        <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur">
          <div className="max-w-4xl mx-auto h-14 px-4 flex items-center">
            <a href="/" aria-label="美ら島車両管理 ホーム" className="flex items-center gap-2">
              <CarFront className="w-6 h-6 text-primary" strokeWidth={1.75} />
              <span className="text-[15px] font-semibold tracking-[-0.2px] text-ink">
                美ら島車両管理
              </span>
            </a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 pb-24 page-fade-in">
          {children}
        </main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
