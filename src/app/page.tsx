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
    <section className="grid gap-4 sm:gap-5">
      <div className="rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-4 sm:p-5">
        <h1 className="text-lg font-semibold tracking-tight text-[#123524] sm:text-xl">ログ検索</h1>
        <p className="mt-1 text-sm text-[#6e685b]">銘柄名・産地・味メモから見たい記録だけを絞り込めます。</p>

        <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]" method="GET">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="例: 山形 / ワイン / 柑橘"
            className="rounded-xl border border-[#cfc3ae] bg-[#fffefb] px-3 py-2 text-[#1f1a13] outline-none placeholder:text-[#8a7f70] focus:border-[#1f5a40]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#123524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a4731]"
          >
            検索
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[#cabda7] bg-white px-4 py-2 text-sm font-semibold text-[#4d4639] hover:bg-[#f5efdf]"
          >
            クリア
          </Link>
        </form>
      </div>

      {mapLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c9bda8] bg-white/80 p-8 text-center text-[#6e685b]">
          記録が見つかりません。条件を変えるか、新規記録を追加してください。
        </div>
      ) : (
        <MapLogExplorer logs={mapLogs} />
      )}
    </section>
  );
}
