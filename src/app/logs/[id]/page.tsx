import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteDrinkLog } from "@/app/actions/drink-log-actions";
import { formatDisplayDate } from "@/lib/date";
import { DRINK_TYPE_LABELS } from "@/lib/drink-types";
import type { DrinkTypeValue } from "@/lib/map-taxonomy";
import { prisma } from "@/lib/prisma";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

const DRINK_TYPE_BADGE_CLASS: Record<DrinkTypeValue, string> = {
  SAKE: "badge-sake",
  BEER: "badge-beer",
  WINE: "badge-wine",
  HIGHBALL: "badge-highball",
  OTHER: "badge-other",
};

export default async function LogDetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  const log = await prisma.drinkLog.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!log) {
    notFound();
  }

  const badgeClass = DRINK_TYPE_BADGE_CLASS[log.drinkType as DrinkTypeValue];
  const heroPhoto = log.photos[0];

  return (
    <section className="reveal mx-auto grid w-full max-w-3xl gap-4">
      {/* ─── ヒーロー写真 ─── */}
      {heroPhoto && (
        <div className="relative overflow-hidden rounded-2xl border border-[#1a1612]/10 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroPhoto.storagePath}
            alt={`${log.brandName} の写真`}
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
              {DRINK_TYPE_LABELS[log.drinkType as DrinkTypeValue]}
            </span>
            <h1 className="mt-1 text-xl font-bold text-white drop-shadow-lg sm:text-2xl">
              {log.brandName}
            </h1>
          </div>
        </div>
      )}

      {/* ─── ヘッダー（写真なし時） ─── */}
      {!heroPhoto && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
              {DRINK_TYPE_LABELS[log.drinkType as DrinkTypeValue]}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1a1612]">{log.brandName}</h1>
          </div>
        </div>
      )}

      {/* ─── アクションボタン ─── */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-[#9c8f82] transition hover:text-[#b5832a]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          一覧へ戻る
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/logs/${log.id}/edit`}
            className="rounded-xl border border-[#1a1612]/12 bg-white px-4 py-2 text-sm font-semibold text-[#1a1612] transition hover:bg-[#f7f3ed] hover:border-[#1a1612]/20"
          >
            編集
          </Link>
          <form action={deleteDrinkLog}>
            <input type="hidden" name="id" value={log.id} />
            <button
              type="submit"
              className="rounded-xl border border-[#8b2252]/30 bg-[#8b2252]/8 px-4 py-2 text-sm font-semibold text-[#7a1c4a] transition hover:bg-[#8b2252]/15"
            >
              削除
            </button>
          </form>
        </div>
      </div>

      {/* ─── 詳細情報カード ─── */}
      <article className="glass-card p-4 sm:p-5">
        {/* メタ情報グリッド */}
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#9c8f82]">飲んだ日</dt>
            <dd className="mt-1 text-sm font-medium text-[#1a1612]">{formatDisplayDate(log.drankAt)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#9c8f82]">種類</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
                {DRINK_TYPE_LABELS[log.drinkType as DrinkTypeValue]}
              </span>
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#9c8f82]">産地</dt>
            <dd className="mt-1 text-sm font-medium text-[#1a1612]">
              {log.origin ? (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-[#2d6a4f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {log.origin}
                </span>
              ) : (
                <span className="text-[#9c8f82]">未記録</span>
              )}
            </dd>
          </div>
        </dl>

        {/* 区切り線 */}
        <div className="my-4 border-t border-[#1a1612]/6" />

        {/* 味メモ */}
        <div>
          <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9c8f82]">味メモ</h2>
          <p className="whitespace-pre-wrap rounded-xl border border-[#1a1612]/6 bg-[#faf7f2] p-3.5 text-sm leading-7 text-[#1a1612]">
            {log.tasteNote || (
              <span className="text-[#9c8f82]">メモはまだありません。</span>
            )}
          </p>
        </div>

        {/* 写真ギャラリー（複数枚） */}
        {log.photos.length > 0 && (
          <>
            <div className="my-4 border-t border-[#1a1612]/6" />
            <div>
              <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#9c8f82]">
                写真 ({log.photos.length}枚)
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {log.photos.map((photo) => (
                  <li key={photo.id} className="overflow-hidden rounded-xl border border-[#1a1612]/8 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.storagePath}
                      alt={`${log.brandName} の写真`}
                      className="h-48 w-full object-cover"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
