"use client";

import { useRef, useState } from "react";

import { type DrinkType } from "@prisma/client";

import { DRINK_TYPE_LABELS, DRINK_TYPE_OPTIONS } from "@/lib/drink-types";
import { filterOriginSuggestions } from "@/lib/origin-suggestions";
import type { DrinkTypeValue } from "@/lib/map-taxonomy";

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

const DRINK_TYPE_COLORS: Record<DrinkTypeValue, string> = {
  SAKE: "#7eb8d4",
  BEER: "#e8a020",
  WINE: "#c4436e",
  HIGHBALL: "#4a9eca",
  OTHER: "#9ca3af",
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#4a5568] focus:border-[#d4a843]/50 focus:bg-white/8 focus:ring-2 focus:ring-[#d4a843]/20 transition";

const labelClass = "block text-xs font-semibold uppercase tracking-wider text-[#8b95a8] mb-1.5";

export function DrinkLogFormFields({
  defaults,
  submitLabel,
  photoHint,
}: DrinkLogFormFieldsProps) {
  const [drinkType, setDrinkType] = useState<DrinkTypeValue>(defaults.drinkType as DrinkTypeValue);
  const [origin, setOrigin] = useState(defaults.origin);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tasteNoteLen, setTasteNoteLen] = useState(defaults.tasteNote.length);
  const originRef = useRef<HTMLInputElement>(null);

  const suggestions = filterOriginSuggestions(drinkType, origin);
  const accentColor = DRINK_TYPE_COLORS[drinkType];

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }

  return (
    <div className="grid gap-5">
      {/* ─── 飲んだ日 ─── */}
      <div>
        <label className={labelClass} htmlFor="drankAt">
          飲んだ日 <span className="text-[#d4a843]">*</span>
        </label>
        <input
          id="drankAt"
          required
          type="date"
          name="drankAt"
          defaultValue={defaults.drankAt}
          className={fieldClass}
        />
      </div>

      {/* ─── 酒類 ─── */}
      <div>
        <label className={labelClass} htmlFor="drinkType">
          酒類 <span className="text-[#d4a843]">*</span>
        </label>
        <div className="relative">
          <select
            id="drinkType"
            required
            name="drinkType"
            value={drinkType}
            onChange={(e) => {
              setDrinkType(e.target.value as DrinkTypeValue);
              setOrigin("");
            }}
            className={`${fieldClass} appearance-none pr-8`}
            style={{ borderColor: `${accentColor}40` }}
          >
            {DRINK_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type} style={{ background: "#1e2a3a" }}>
                {DRINK_TYPE_LABELS[type as DrinkTypeValue]}
              </option>
            ))}
          </select>
          {/* カラードット */}
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
        {/* 酒類バッジ */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DRINK_TYPE_OPTIONS.map((type) => {
            const color = DRINK_TYPE_COLORS[type as DrinkTypeValue];
            const isActive = type === drinkType;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setDrinkType(type as DrinkTypeValue);
                  setOrigin("");
                }}
                className="rounded-full border px-2.5 py-1 text-xs font-medium transition"
                style={{
                  borderColor: isActive ? color : "rgba(255,255,255,0.1)",
                  backgroundColor: isActive ? `${color}22` : "transparent",
                  color: isActive ? color : "#8b95a8",
                }}
              >
                {DRINK_TYPE_LABELS[type as DrinkTypeValue]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 銘柄名 ─── */}
      <div>
        <label className={labelClass} htmlFor="brandName">
          銘柄名 <span className="text-[#d4a843]">*</span>
        </label>
        <input
          id="brandName"
          required
          type="text"
          name="brandName"
          defaultValue={defaults.brandName}
          placeholder="例: 十四代 本丸"
          maxLength={100}
          className={fieldClass}
        />
      </div>

      {/* ─── 産地（サジェスト付き） ─── */}
      <div className="relative">
        <label className={labelClass} htmlFor="origin">
          産地
          <span className="ml-1.5 text-[10px] font-normal text-[#4a5568]">
            未入力だと地図で「未分類」になります
          </span>
        </label>
        <input
          id="origin"
          ref={originRef}
          type="text"
          name="origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="例: 山形県 / フランス"
          maxLength={100}
          className={fieldClass}
          autoComplete="off"
        />
        {/* サジェストドロップダウン */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#1c2333] py-1 shadow-xl">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={() => {
                    setOrigin(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[#e8edf5] transition hover:bg-white/8"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── 味メモ ─── */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={`${labelClass} mb-0`} htmlFor="tasteNote">
            味メモ
          </label>
          <span className={`text-xs ${tasteNoteLen > 1800 ? "text-[#c4436e]" : "text-[#4a5568]"}`}>
            {tasteNoteLen} / 2000
          </span>
        </div>
        <textarea
          id="tasteNote"
          rows={5}
          name="tasteNote"
          defaultValue={defaults.tasteNote}
          onChange={(e) => setTasteNoteLen(e.target.value.length)}
          placeholder="香り、甘み、余韻、食事との相性など"
          maxLength={2000}
          className={`${fieldClass} resize-none leading-6`}
        />
      </div>

      {/* ─── 写真 ─── */}
      <div>
        <label className={labelClass} htmlFor="photo">
          写真
        </label>
        <div className="grid gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/3 px-4 py-3 transition hover:border-[#d4a843]/40 hover:bg-white/6">
            <svg className="h-5 w-5 shrink-0 text-[#4a5568]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#8b95a8]">画像を選択</p>
              <p className="text-xs text-[#4a5568]">{photoHint}</p>
            </div>
            <input
              id="photo"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="sr-only"
            />
          </label>

          {/* 写真プレビュー */}
          {photoPreview && (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="プレビュー"
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-2 left-3 text-xs font-medium text-white/80">プレビュー</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── 送信ボタン ─── */}
      <button
        type="submit"
        className="mt-1 w-full rounded-xl bg-[#d4a843] py-3 text-sm font-bold text-[#0d1117] shadow-lg shadow-[#d4a843]/20 transition hover:bg-[#f0c96a] active:scale-[0.98]"
      >
        {submitLabel}
      </button>
    </div>
  );
}
