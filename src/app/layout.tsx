"use client";

import "./globals.css";
import { useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/react";

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
        <meta name="theme-color" content="#3b82f6" />
        <meta name="description" content="車両情報管理アプリケーション" />
        <meta name="referrer" content="origin" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
        <title>美ら島車両管理</title>
      </head>
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-2">
            <a href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="美ら島車両管理"
                className="h-14 w-auto rounded-xl object-contain"
              />
            </a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6 pb-20 page-fade-in">
          {children}
        </main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
