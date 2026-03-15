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
  themeColor: "#123524",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <PwaRegister />
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 sm:px-6">
          <header className="sticky top-0 z-20 mt-4 rounded-2xl border border-[#d8cfbf] bg-[#fffcf5]/90 px-4 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="text-lg font-bold tracking-tight text-[#123524]">
                SipQuest
              </Link>
              <nav className="grid grid-cols-3 gap-2 text-center text-xs font-medium sm:flex sm:items-center sm:gap-3 sm:text-sm">
                <Link href="/" className="rounded-lg px-3 py-2 text-[#2e2a21] hover:bg-[#efe5d2]">
                  記録一覧
                </Link>
                <Link
                  href="/logs/new"
                  className="rounded-lg bg-[#0f3f2c] px-3 py-2 font-semibold !text-white shadow-sm hover:bg-[#17563b] visited:!text-white"
                  style={{ WebkitTextFillColor: "#ffffff", color: "#ffffff" }}
                >
                  新規記録
                </Link>
                <Link
                  href="/settings"
                  className="rounded-lg px-3 py-2 text-[#2e2a21] hover:bg-[#efe5d2]"
                >
                  設定
                </Link>
              </nav>
            </div>
          </header>

          <main className="mt-6 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
