import Link from "next/link";
import { notFound } from "next/navigation";

import { updateDrinkLog } from "@/app/actions/drink-log-actions";
import { DrinkLogFormFields } from "@/components/drink-log-form-fields";
import { toDateInputValue } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLogPage({ params }: EditPageProps) {
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
    <section className="reveal mx-auto w-full max-w-2xl">
      {/* ─── ページヘッダー ─── */}
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5832a]">Edit Entry</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1612]">記録編集</h1>
        <p className="mt-1 text-sm text-[#9c8f82]">内容を更新できます。写真は追加アップロード形式です。</p>
      </header>

      {/* ─── フォーム ─── */}
      <form
        action={updateDrinkLog}
        className="glass-card p-4 sm:p-6"
        encType="multipart/form-data"
      >
        <input type="hidden" name="id" value={log.id} />
        <DrinkLogFormFields
          defaults={{
            drankAt: toDateInputValue(log.drankAt),
            drinkType: log.drinkType,
            brandName: log.brandName,
            origin: log.origin ?? "",
            tasteNote: log.tasteNote ?? "",
          }}
          submitLabel="更新する"
          photoHint="新しい写真を選ぶと既存写真に追加されます。"
        />
      </form>

      {/* ─── 現在の写真 ─── */}
      {log.photos.length > 0 && (
        <div className="mt-4 glass-card p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9c8f82]">
            現在の写真 ({log.photos.length}枚)
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {log.photos.map((photo) => (
              <li key={photo.id} className="overflow-hidden rounded-xl border border-[#1a1612]/8 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.storagePath}
                  alt={`${log.brandName} の写真`}
                  className="h-40 w-full object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── 戻るリンク ─── */}
      <div className="mt-4">
        <Link
          href={`/logs/${log.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-[#9c8f82] transition hover:text-[#b5832a]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          詳細へ戻る
        </Link>
      </div>
    </section>
  );
}
