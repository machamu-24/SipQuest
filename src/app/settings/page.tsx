import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  // データ統計を取得
  const [logCount, photoCount] = await Promise.all([
    prisma.drinkLog.count(),
    prisma.drinkPhoto.count(),
  ]);

  return (
    <section className="reveal mx-auto w-full max-w-2xl">
      {/* ─── ページヘッダー ─── */}
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4a843]">Settings</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">設定</h1>
      </header>

      <div className="grid gap-4">
        {/* ─── データ概要 ─── */}
        <div className="glass-card p-4 sm:p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#8b95a8]">
            データ概要
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/6 bg-white/3 p-4 text-center">
              <p className="text-3xl font-bold text-[#d4a843]">{logCount}</p>
              <p className="mt-1 text-xs text-[#8b95a8]">記録件数</p>
            </div>
            <div className="rounded-xl border border-white/6 bg-white/3 p-4 text-center">
              <p className="text-3xl font-bold text-[#52b788]">{photoCount}</p>
              <p className="mt-1 text-xs text-[#8b95a8]">写真枚数</p>
            </div>
          </div>
        </div>

        {/* ─── PWAインストール ─── */}
        <div className="glass-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#d4a843]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <h2 className="text-sm font-semibold text-white">ホーム画面に追加（PWA）</h2>
          </div>
          <p className="mb-3 text-xs text-[#8b95a8]">
            アプリとして使うと、より快適にご利用いただけます。
          </p>
          <div className="rounded-xl border border-white/6 bg-white/3 p-3">
            <p className="mb-2 text-xs font-semibold text-[#8b95a8]">iPhone / iPad（Safari）</p>
            <ol className="space-y-1.5 text-sm text-[#e8edf5]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4a843]/20 text-[10px] font-bold text-[#d4a843]">1</span>
                Safari でこのアプリを開く
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4a843]/20 text-[10px] font-bold text-[#d4a843]">2</span>
                共有ボタン（四角から上矢印）をタップ
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4a843]/20 text-[10px] font-bold text-[#d4a843]">3</span>
                「ホーム画面に追加」を選択
              </li>
            </ol>
          </div>
        </div>

        {/* ─── データ管理 ─── */}
        <div className="glass-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#52b788]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <h2 className="text-sm font-semibold text-white">データ管理</h2>
          </div>
          <div className="rounded-xl border border-[#d4a843]/20 bg-[#d4a843]/5 p-3">
            <p className="text-xs font-semibold text-[#d4a843]">現在の保存方式</p>
            <p className="mt-1 text-sm text-[#e8edf5]">
              ローカル SQLite に保存されています。端末の故障・誤削除に備え、定期的なバックアップをお勧めします。
            </p>
          </div>
          <p className="mt-3 text-xs text-[#4a5568]">
            CSVエクスポート・クラウド同期は今後のアップデートで追加予定です。
          </p>
        </div>

        {/* ─── バージョン情報 ─── */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">SipQuest</p>
              <p className="text-xs text-[#4a5568]">地図から辿る、お酒の記憶。</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#8b95a8]">
              v0.2.0
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
