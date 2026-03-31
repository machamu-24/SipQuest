import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { PwaRegister } from "@/components/pwa-register";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SipQuest",
    template: "%s | SipQuest",
  },
  description: "日本酒・ハイボール・ビール・ワインの記録を残す個人向けノートアプリ",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    title: "SipQuest",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ed",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <PwaRegister />

        {/* ─── PC用ヘッダーナビゲーション（md以上で表示） ─── */}
        <header className="hidden md:block sticky top-0 z-30 border-b border-[#1a1612]/8 bg-[#f7f3ed]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
            {/* ロゴ */}
            <Link href="/" className="flex items-center gap-2 group">
              <IconGlobe className="h-5 w-5 text-[#b5832a] transition-transform group-hover:rotate-12" />
              <span className="text-base font-bold tracking-tight text-[#1a1612]">
                Sip<span className="text-[#b5832a]">Quest</span>
              </span>
            </Link>

            {/* ナビリンク */}
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#5c5346] transition hover:bg-[#1a1612]/6 hover:text-[#1a1612]"
              >
                <IconHome className="h-4 w-4" />
                記録一覧
              </Link>
              <Link
                href="/logs/new"
                className="flex items-center gap-1.5 rounded-lg bg-[#b5832a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8a6020]"
              >
                <IconPlus className="h-4 w-4" />
                新規記録
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#5c5346] transition hover:bg-[#1a1612]/6 hover:text-[#1a1612]"
              >
                <IconSettings className="h-4 w-4" />
                設定
              </Link>
            </nav>
          </div>
        </header>

        {/* ─── スマホ用トップバー（md未満で表示） ─── */}
        <header className="md:hidden sticky top-0 z-30 border-b border-[#1a1612]/8 bg-[#f7f3ed]/90 backdrop-blur-xl">
          <div className="flex h-12 items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-1.5">
              <IconGlobe className="h-4 w-4 text-[#b5832a]" />
              <span className="text-sm font-bold tracking-tight text-[#1a1612]">
                Sip<span className="text-[#b5832a]">Quest</span>
              </span>
            </Link>
          </div>
        </header>

        {/* ─── メインコンテンツ ─── */}
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5 sm:px-6 md:pb-10">
          <main className="flex-1">{children}</main>
        </div>

        {/* ─── スマホ用ボトムナビゲーション（md未満で表示） ─── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#1a1612]/8 bg-[#f7f3ed]/95 backdrop-blur-xl bottom-nav-safe">
          <div className="grid grid-cols-3">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 px-2 py-3 text-[#9c8f82] transition hover:text-[#b5832a] active:scale-95"
            >
              <IconHome className="h-5 w-5" />
              <span className="text-[10px] font-medium">記録一覧</span>
            </Link>
            <Link
              href="/logs/new"
              className="flex flex-col items-center gap-1 px-2 py-3 transition active:scale-95"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5832a] shadow-md shadow-[#b5832a]/30 transition hover:bg-[#8a6020]">
                <IconPlus className="h-5 w-5 text-white" />
              </span>
              <span className="text-[10px] font-medium text-[#b5832a]">新規記録</span>
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center gap-1 px-2 py-3 text-[#9c8f82] transition hover:text-[#b5832a] active:scale-95"
            >
              <IconSettings className="h-5 w-5" />
              <span className="text-[10px] font-medium">設定</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
