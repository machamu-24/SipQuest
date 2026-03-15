import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { formatDisplayDate } from "@/lib/date";
import {
  DRINK_TYPE_FILTERS,
  DRINK_TYPE_LABELS,
  type DrinkTypeFilter,
  isDrinkType,
} from "@/lib/drink-types";
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
  const rawType = getSingleSearchParam(resolvedParams.type).trim();

  const selectedType: DrinkTypeFilter =
    rawType && isDrinkType(rawType) ? rawType : "ALL";

  const filters: Prisma.DrinkLogWhereInput[] = [];

  if (keyword) {
    filters.push({
      OR: [
        { brandName: { contains: keyword } },
        { origin: { contains: keyword } },
        { tasteNote: { contains: keyword } },
      ],
    });
  }

  if (selectedType !== "ALL") {
    filters.push({ drinkType: selectedType });
  }

  const logs = await prisma.drinkLog.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ drankAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <section className="grid gap-5">
      <div className="rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-4 sm:p-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#123524]">記録一覧</h1>
        <p className="mt-1 text-sm text-[#6e685b]">
          飲んだお酒の記録を検索・フィルタして振り返れます。
        </p>

        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]" method="GET">
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="銘柄名・産地・味メモで検索"
            className="rounded-xl border border-[#d8cfbf] bg-white px-3 py-2 outline-none focus:border-[#2d6a4f]"
          />

          <select
            name="type"
            defaultValue={selectedType}
            className="rounded-xl border border-[#d8cfbf] bg-white px-3 py-2 outline-none focus:border-[#2d6a4f]"
          >
            {DRINK_TYPE_FILTERS.map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? "すべて" : DRINK_TYPE_LABELS[type]}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-[#123524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a4731]"
          >
            絞り込む
          </button>
        </form>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c9bda8] bg-white/80 p-8 text-center text-[#6e685b]">
          該当する記録がありません。最初の1件を登録しましょう。
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {logs.map((log) => {
            const photo = log.photos[0];

            return (
              <li key={log.id}>
                <Link
                  href={`/logs/${log.id}`}
                  className="grid h-full gap-3 rounded-2xl border border-[#d8cfbf] bg-[#fffefb] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#efe5d2]">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.storagePath}
                        alt={`${log.brandName} の写真`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#827a6b]">
                        写真なし
                      </div>
                    )}
                  </div>

                  <div className="grid gap-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6e685b]">
                      {DRINK_TYPE_LABELS[log.drinkType]}
                    </p>
                    <h2 className="line-clamp-1 text-lg font-semibold text-[#2e2a21]">
                      {log.brandName}
                    </h2>
                    <p className="text-sm text-[#6e685b]">
                      {formatDisplayDate(log.drankAt)}
                      {log.origin ? ` ・ ${log.origin}` : ""}
                    </p>
                    {log.tasteNote ? (
                      <p className="line-clamp-2 text-sm text-[#4f493d]">{log.tasteNote}</p>
                    ) : (
                      <p className="text-sm text-[#8c8577]">味メモなし</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
