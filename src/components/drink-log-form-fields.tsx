import { type DrinkType } from "@prisma/client";

import { DRINK_TYPE_LABELS, DRINK_TYPE_OPTIONS } from "@/lib/drink-types";

type DrinkLogDefaults = {
  drankAt: string;
  drinkType: DrinkType;
  brandName: string;
  origin: string;
  tasteNote: string;
};

type DrinkLogFormFieldsProps = {
  defaults: DrinkLogDefaults;
  submitLabel: string;
  photoHint: string;
};

export function DrinkLogFormFields({
  defaults,
  submitLabel,
  photoHint,
}: DrinkLogFormFieldsProps) {
  const baseFieldClassName =
    "rounded-xl border border-[#cfc3ae] bg-[#fffefb] px-3 py-2 text-[#1f1a13] outline-none ring-0 placeholder:text-[#8a7f70] focus:border-[#1f5a40] focus:ring-2 focus:ring-[#1f5a40]/20";

  return (
    <>
      <label className="grid gap-2 text-sm font-medium text-[#2e2a21]">
        飲んだ日
        <input
          required
          type="date"
          name="drankAt"
          defaultValue={defaults.drankAt}
          className={baseFieldClassName}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#2e2a21]">
        種類
        <select
          required
          name="drinkType"
          defaultValue={defaults.drinkType}
          className={baseFieldClassName}
        >
          {DRINK_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {DRINK_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#2e2a21]">
        銘柄名
        <input
          required
          type="text"
          name="brandName"
          defaultValue={defaults.brandName}
          placeholder="例: 十四代 本丸"
          className={baseFieldClassName}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#2e2a21]">
        産地
        <input
          type="text"
          name="origin"
          defaultValue={defaults.origin}
          placeholder="例: 山形県"
          className={baseFieldClassName}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#2e2a21]">
        味メモ
        <textarea
          rows={5}
          name="tasteNote"
          defaultValue={defaults.tasteNote}
          placeholder="香り、甘み、余韻、食事との相性など"
          className={baseFieldClassName}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#2e2a21]">
        写真
        <input
          type="file"
          name="photo"
          accept="image/*"
          className={`${baseFieldClassName} text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-[#1f5a40] file:px-3 file:py-1.5 file:font-semibold file:text-white file:hover:bg-[#184734]`}
        />
        <span className="text-xs font-normal text-[#6e685b]">{photoHint}</span>
      </label>

      <button
        type="submit"
        className="mt-2 inline-flex justify-center rounded-xl bg-[#123524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a4731]"
      >
        {submitLabel}
      </button>
    </>
  );
}
