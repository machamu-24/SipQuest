import Link from "next/link";

import { MapLogExplorer } from "@/components/map-log-explorer";
import type { DrinkTypeValue } from "@/lib/map-taxonomy";
import { prisma } from "@/lib/prisma";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const keyword = getSingleSearchParam(resolvedParams.q).trim();

  const logs = await prisma.drinkLog.findMany({
    where: keyword
      ? {
          OR: [
            { brandName: { contains: keyword } },
            { origin: { contains: keyword } },
            { tasteNote: { contains: keyword } },
          ],
        }
      : undefined,
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ drankAt: "desc" }, { createdAt: "desc" }],
  });

  const mapLogs = logs.map((log) => ({
    id: log.id,
    drinkType: log.drinkType as DrinkTypeValue,
    brandName: log.brandName,
    origin: log.origin,
    tasteNote: log.tasteNote,
    drankAtIso: log.drankAt.toISOString(),
    photoPath: log.photos[0]?.storagePath ?? null,
  }));

  return (
    <section className="grid gap-5">
      {/* ─── 検索バー ─── */}
      <div className="reveal glass-card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <svg className="h-4 w-4 text-[#d4a843]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h1 className="text-sm font-semibold text-white">ログ検索</h1>
        </div>
        <p className="mb-3 text-xs text-[#8b95a8]">銘柄名・産地・味メモから記録を絞り込めます。</p>

        <form className="flex gap-2" method="GET">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="例: 山形 / ワイン / 柑橘"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#4a5568] focus:border-[#d4a843]/50 focus:bg-white/8 focus:ring-2 focus:ring-[#d4a843]/20 transition"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#d4a843] px-4 py-2.5 text-sm font-semibold text-[#0d1117] transition hover:bg-[#f0c96a] active:scale-95"
          >
            検索
          </button>
          {keyword && (
            <Link
              href="/"
              className="shrink-0 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-[#8b95a8] transition hover:bg-white/10 hover:text-white"
            >
              クリア
            </Link>
          )}
        </form>

        {keyword && (
          <p className="mt-2 text-xs text-[#8b95a8]">
            <span className="text-[#d4a843] font-medium">「{keyword}」</span> の検索結果: {logs.length}件
          </p>
        )}
      </div>

      {/* ─── ログ一覧 / 地図エクスプローラー ─── */}
      {mapLogs.length === 0 ? (
        <div className="reveal reveal-delay-1 glass-card flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <svg className="h-8 w-8 text-[#4a5568]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17H7A5 5 0 0 1 7 7h2" />
              <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#8b95a8]">
              {keyword ? "条件に一致する記録が見つかりません。" : "まだ記録がありません。"}
            </p>
            <p className="mt-1 text-xs text-[#4a5568]">
              {keyword ? "キーワードを変えて再検索してください。" : "最初の一杯を記録してみましょう。"}
            </p>
          </div>
          {!keyword && (
            <Link
              href="/logs/new"
              className="rounded-xl bg-[#d4a843] px-5 py-2.5 text-sm font-semibold text-[#0d1117] transition hover:bg-[#f0c96a]"
            >
              最初の記録を追加
            </Link>
          )}
        </div>
      ) : (
        <MapLogExplorer logs={mapLogs} />
      )}
    </section>
  );
}
