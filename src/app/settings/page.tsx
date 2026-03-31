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
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5832a]">Settings</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1612]">設定</h1>
      </header>

      <div className="grid gap-4">
        {/* ─── データ概要 ─── */}
        <div className="glass-card p-4 sm:p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#9c8f82]">
            データ概要
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#1a1612]/8 bg-[#faf7f2] p-4 text-center">
              <p className="text-3xl font-bold text-[#b5832a]">{logCount}</p>
              <p className="mt-1 text-xs text-[#9c8f82]">記録件数</p>
            </div>
            <div className="rounded-xl border border-[#1a1612]/8 bg-[#faf7f2] p-4 text-center">
              <p className="text-3xl font-bold text-[#2d6a4f]">{photoCount}</p>
              <p className="mt-1 text-xs text-[#9c8f82]">写真枚数</p>
            </div>
          </div>
        </div>

        {/* ─── PWAインストール ─── */}
        <div className="glass-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#b5832a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <h2 className="text-sm font-semibold text-[#1a1612]">ホーム画面に追加（PWA）</h2>
          </div>
          <p className="mb-3 text-xs text-[#9c8f82]">
            アプリとして使うと、より快適にご利用いただけます。
          </p>
          <div className="rounded-xl border border-[#1a1612]/8 bg-[#faf7f2] p-3">
            <p className="mb-2 text-xs font-semibold text-[#9c8f82]">iPhone / iPad（Safari）</p>
            <ol className="space-y-1.5 text-sm text-[#1a1612]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#b5832a]/15 text-[10px] font-bold text-[#b5832a]">1</span>
                Safari でこのアプリを開く
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#b5832a]/15 text-[10px] font-bold text-[#b5832a]">2</span>
                共有ボタン（四角から上矢印）をタップ
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#b5832a]/15 text-[10px] font-bold text-[#b5832a]">3</span>
                「ホーム画面に追加」を選択
              </li>
            </ol>
          </div>
        </div>

        {/* ─── データ管理 ─── */}
        <div className="glass-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-[#2d6a4f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <h2 className="text-sm font-semibold text-[#1a1612]">データ管理</h2>
          </div>
          <div className="rounded-xl border border-[#b5832a]/20 bg-[#b5832a]/5 p-3">
            <p className="text-xs font-semibold text-[#8a6020]">現在の保存方式</p>
            <p className="mt-1 text-sm text-[#1a1612]">
              ローカル SQLite に保存されています。端末の故障・誤削除に備え、定期的なバックアップをお勧めします。
            </p>
          </div>
          <p className="mt-3 text-xs text-[#9c8f82]">
            CSVエクスポート・クラウド同期は今後のアップデートで追加予定です。
          </p>
        </div>

        {/* ─── バージョン情報 ─── */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a1612]">SipQuest</p>
              <p className="text-xs text-[#9c8f82]">地図から辿る、お酒の記憶。</p>
            </div>
            <span className="rounded-full border border-[#1a1612]/12 bg-[#f7f3ed] px-2.5 py-1 text-xs text-[#9c8f82]">
              v0.2.0
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
