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
    <section className="mx-auto grid w-full max-w-2xl gap-4">
      <header className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#123524]">記録編集</h1>
        <p className="text-sm text-[#6e685b]">内容を更新できます。写真は追加アップロード形式です。</p>
      </header>

      <form
        action={updateDrinkLog}
        className="grid gap-4 rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-4 sm:p-5"
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

      {log.photos.length > 0 ? (
        <div className="grid gap-2 rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-4">
          <h2 className="text-sm font-semibold text-[#2e2a21]">現在の写真</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {log.photos.map((photo) => (
              <li key={photo.id} className="overflow-hidden rounded-xl border border-[#e6dccb] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.storagePath} alt={`${log.brandName} の写真`} className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link href={`/logs/${log.id}`} className="text-sm font-medium text-[#2d6a4f] hover:underline">
        ← 詳細へ戻る
      </Link>
    </section>
  );
}
