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
          <svg
            className="h-4 w-4 text-[#b5832a]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h1 className="text-sm font-semibold text-[#1a1612]">ログ検索</h1>
        </div>
        <p className="mb-3 text-xs text-[#9c8f82]">銘柄名・産地・味メモから記録を絞り込めます。</p>

        <form className="flex gap-2" method="GET">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="例: 山形 / ワイン / 柑橘"
            className="min-w-0 flex-1 rounded-xl border border-[#1a1612]/12 bg-[#f7f3ed] px-3 py-2.5 text-sm text-[#1a1612] outline-none placeholder:text-[#9c8f82] focus:border-[#b5832a]/50 focus:ring-2 focus:ring-[#b5832a]/15 transition"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#b5832a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a6020] active:scale-95"
          >
            検索
          </button>
          {keyword && (
            <Link
              href="/"
              className="shrink-0 inline-flex items-center justify-center rounded-xl border border-[#1a1612]/12 bg-[#f7f3ed] px-3 py-2.5 text-sm font-medium text-[#9c8f82] transition hover:bg-[#1a1612]/6 hover:text-[#1a1612]"
            >
              クリア
            </Link>
          )}
        </form>

        {keyword && (
          <p className="mt-2 text-xs text-[#9c8f82]">
            <span className="font-medium text-[#b5832a]">「{keyword}」</span> の検索結果: {logs.length}件
          </p>
        )}
      </div>

      {/* ─── ログ一覧 / 地図エクスプローラー ─── */}
      {mapLogs.length === 0 ? (
        <div className="reveal reveal-delay-1 glass-card flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f2ead8]">
            <svg
              className="h-8 w-8 text-[#c4b090]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#5c5346]">
              {keyword ? "条件に一致する記録が見つかりません。" : "まだ記録がありません。"}
            </p>
            <p className="mt-1 text-xs text-[#9c8f82]">
              {keyword ? "キーワードを変えて再検索してください。" : "最初の一杯を記録してみましょう。"}
            </p>
          </div>
          {!keyword && (
            <Link
              href="/logs/new"
              className="rounded-xl bg-[#b5832a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a6020]"
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
