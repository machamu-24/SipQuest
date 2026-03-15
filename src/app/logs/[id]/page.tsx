import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteDrinkLog } from "@/app/actions/drink-log-actions";
import { formatDisplayDate } from "@/lib/date";
import { DRINK_TYPE_LABELS } from "@/lib/drink-types";
import { prisma } from "@/lib/prisma";

type DetailPageProps = {
  params: Promise<{ id: string }>;
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

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#123524]">記録詳細</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/logs/${log.id}/edit`}
            className="rounded-lg bg-[#2d6a4f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#285d45]"
          >
            編集
          </Link>
          <form action={deleteDrinkLog}>
            <input type="hidden" name="id" value={log.id} />
            <button
              type="submit"
              className="rounded-lg bg-[#8b2d2d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#742626]"
            >
              削除
            </button>
          </form>
        </div>
      </div>

      <article className="grid gap-5 rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-4 sm:p-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#6e685b]">飲んだ日</dt>
            <dd className="mt-1 text-sm text-[#2e2a21]">{formatDisplayDate(log.drankAt)}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#6e685b]">種類</dt>
            <dd className="mt-1 text-sm text-[#2e2a21]">{DRINK_TYPE_LABELS[log.drinkType]}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#6e685b]">銘柄名</dt>
            <dd className="mt-1 text-sm text-[#2e2a21]">{log.brandName}</dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#6e685b]">産地</dt>
            <dd className="mt-1 text-sm text-[#2e2a21]">{log.origin || "未記録"}</dd>
          </div>
        </dl>

        <div className="grid gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6e685b]">味メモ</h2>
          <p className="whitespace-pre-wrap rounded-xl border border-[#e6dccb] bg-white p-3 text-sm leading-6 text-[#2e2a21]">
            {log.tasteNote || "メモはまだありません。"}
          </p>
        </div>

        <div className="grid gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6e685b]">写真</h2>
          {log.photos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#c9bda8] bg-white p-4 text-sm text-[#6e685b]">
              写真はまだ登録されていません。
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {log.photos.map((photo) => (
                <li key={photo.id} className="overflow-hidden rounded-xl border border-[#e6dccb] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.storagePath}
                    alt={`${log.brandName} の写真`}
                    className="h-full w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <Link href="/" className="text-sm font-medium text-[#2d6a4f] hover:underline">
        ← 一覧へ戻る
      </Link>
    </section>
  );
}
