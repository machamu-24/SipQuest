import { createDrinkLog } from "@/app/actions/drink-log-actions";
import { DrinkLogFormFields } from "@/components/drink-log-form-fields";
import { toDateInputValue } from "@/lib/date";

export default function NewLogPage() {
  return (
    <section className="reveal mx-auto w-full max-w-2xl">
      {/* ─── ページヘッダー ─── */}
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5832a]">New Entry</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1612]">新規記録</h1>
        <p className="mt-1 text-sm text-[#9c8f82]">飲んだお酒の情報を記録します。</p>
      </header>

      {/* ─── フォーム ─── */}
      <form
        action={createDrinkLog}
        className="glass-card p-4 sm:p-6"
        encType="multipart/form-data"
      >
        <DrinkLogFormFields
          defaults={{
            drankAt: toDateInputValue(new Date()),
            drinkType: "SAKE",
            brandName: "",
            origin: "",
            tasteNote: "",
          }}
          submitLabel="記録を保存する"
          photoHint="JPEG・PNG・WebP・HEIC対応、最大10MB"
        />
      </form>
    </section>
  );
}
