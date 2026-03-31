import Link from "next/link";

export default function NotFound() {
  return (
    <div className="reveal flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {/* アイコン */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#b5832a]/12 animate-pulse" />
        <svg className="h-12 w-12 text-[#b5832a]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>

      {/* テキスト */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5832a]">404 Not Found</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1a1612]">記録が見つかりません</h1>
        <p className="mt-2 max-w-xs text-sm text-[#9c8f82]">
          この記録は削除されたか、URLが正しくない可能性があります。
        </p>
      </div>

      {/* リンク */}
      <Link
        href="/"
        className="rounded-xl bg-[#b5832a] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a6020]"
      >
        一覧へ戻る
      </Link>
    </div>
  );
}
