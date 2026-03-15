import Link from "next/link";

import { createDrinkLog } from "@/app/actions/drink-log-actions";
import { DrinkLogFormFields } from "@/components/drink-log-form-fields";
import { toDateInputValue } from "@/lib/date";

export default function NewLogPage() {
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4">
      <header className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#123524]">新規記録</h1>
        <p className="text-sm text-[#6e685b]">飲んだお酒の情報を記録します。</p>
      </header>

      <form
        action={createDrinkLog}
        className="grid gap-4 rounded-2xl border border-[#d8cfbf] bg-[#fffdf9] p-4 shadow-sm sm:p-5"
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
          submitLabel="記録を保存"
          photoHint="画像は最大10MB。未選択でも保存できます。"
        />
      </form>

      <Link href="/" className="text-sm font-medium text-[#2d6a4f] hover:underline">
        ← 一覧へ戻る
      </Link>
    </section>
  );
}
