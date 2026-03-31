import Link from "next/link";

export default function NotFound() {
  return (
    <div className="reveal flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      {/* アイコン */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#d4a843]/10 animate-pulse" />
        <svg className="h-12 w-12 text-[#d4a843]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 17H7A5 5 0 0 1 7 7h2" />
          <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>

      {/* テキスト */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4a843]">404 Not Found</p>
        <h1 className="mt-2 text-2xl font-bold text-white">記録が見つかりません</h1>
        <p className="mt-2 max-w-xs text-sm text-[#8b95a8]">
          この記録は削除されたか、URLが正しくない可能性があります。
        </p>
      </div>

      {/* リンク */}
      <Link
        href="/"
        className="rounded-xl bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#0d1117] transition hover:bg-[#f0c96a]"
      >
        一覧へ戻る
      </Link>
    </div>
  );
}
