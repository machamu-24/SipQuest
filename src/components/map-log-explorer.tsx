"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatDisplayDate } from "@/lib/date";
import {
  DRINK_TYPE_LABELS,
  JAPAN_MAP_DRINK_TYPES,
  JAPAN_REGIONS,
  WORLD_MAP_DRINK_TYPES,
  WORLD_REGIONS,
  type DrinkTypeValue,
  type JapanRegionId,
  type WorldRegionId,
  classifyJapanRegion,
  classifyWorldRegion,
} from "@/lib/map-taxonomy";

type MapMode = "japan" | "world";
type RegionSelection<T extends string> = T | "UNCLASSIFIED";

type MapLogItem = {
  id: string;
  drinkType: DrinkTypeValue;
  brandName: string;
  origin: string | null;
  tasteNote: string | null;
  drankAtIso: string;
  photoPath: string | null;
};

type MapLogWithRegion<T extends string> = MapLogItem & {
  regionId: T | null;
};

type MapLogExplorerProps = {
  logs: MapLogItem[];
};

type RegionDescriptor<T extends string> = {
  id: T;
  label: string;
};

const JAPAN_TYPE_SET = new Set<DrinkTypeValue>(JAPAN_MAP_DRINK_TYPES);
const WORLD_TYPE_SET = new Set<DrinkTypeValue>(WORLD_MAP_DRINK_TYPES);

// ─────────────────────────────────────────────────────────────────────────────
// 酒類バッジクラス
// ─────────────────────────────────────────────────────────────────────────────
const DRINK_TYPE_BADGE_CLASS: Record<DrinkTypeValue, string> = {
  SAKE: "badge-sake",
  BEER: "badge-beer",
  WINE: "badge-wine",
  HIGHBALL: "badge-highball",
  OTHER: "badge-other",
};

// ─────────────────────────────────────────────────────────────────────────────
// 日本地図シェイプ定義
// ─────────────────────────────────────────────────────────────────────────────
const JAPAN_SHAPES: readonly {
  id: JapanRegionId;
  labelX: number;
  labelY: number;
  countX: number;
  countY: number;
  path: string;
}[] = [
  {
    id: "HOKKAIDO",
    labelX: 276,
    labelY: 56,
    countX: 303,
    countY: 73,
    path: "M245 24 L315 34 L323 83 L259 97 L230 70 Z",
  },
  {
    id: "TOHOKU",
    labelX: 232,
    labelY: 141,
    countX: 261,
    countY: 156,
    path: "M214 107 L257 96 L274 151 L226 186 L190 167 Z",
  },
  {
    id: "KANTO",
    labelX: 251,
    labelY: 203,
    countX: 282,
    countY: 218,
    path: "M229 190 L278 157 L295 205 L252 238 L208 223 Z",
  },
  {
    id: "CHUBU",
    labelX: 161,
    labelY: 200,
    countX: 190,
    countY: 216,
    path: "M171 169 L220 189 L206 223 L152 230 L123 200 Z",
  },
  {
    id: "KANSAI",
    labelX: 143,
    labelY: 255,
    countX: 171,
    countY: 270,
    path: "M130 232 L182 229 L198 257 L165 289 L118 277 Z",
  },
  {
    id: "CHUGOKU",
    labelX: 66,
    labelY: 250,
    countX: 95,
    countY: 267,
    path: "M66 220 L124 201 L116 279 L55 292 L36 254 Z",
  },
  {
    id: "SHIKOKU",
    labelX: 123,
    labelY: 309,
    countX: 153,
    countY: 324,
    path: "M117 293 L170 292 L184 320 L128 332 L103 316 Z",
  },
  {
    id: "KYUSHU_OKINAWA",
    labelX: 38,
    labelY: 336,
    countX: 72,
    countY: 353,
    path: "M34 296 L96 289 L114 341 L72 388 L20 360 Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 世界地図シェイプ定義
// ─────────────────────────────────────────────────────────────────────────────
const WORLD_SHAPES: readonly {
  id: WorldRegionId;
  labelX: number;
  labelY: number;
  countX: number;
  countY: number;
  path: string;
}[] = [
  {
    id: "NORTH_AMERICA",
    labelX: 95,
    labelY: 112,
    countX: 170,
    countY: 129,
    path: "M25 60 L180 42 L245 95 L208 160 L110 176 L38 125 Z",
  },
  {
    id: "SOUTH_AMERICA",
    labelX: 167,
    labelY: 246,
    countX: 236,
    countY: 263,
    path: "M176 176 L232 182 L266 250 L216 314 L158 284 L142 222 Z",
  },
  {
    id: "EUROPE",
    labelX: 301,
    labelY: 94,
    countX: 364,
    countY: 111,
    path: "M280 70 L350 58 L392 89 L363 127 L299 121 Z",
  },
  {
    id: "AFRICA_MIDDLE_EAST",
    labelX: 304,
    labelY: 209,
    countX: 395,
    countY: 224,
    path: "M314 131 L386 128 L430 214 L381 292 L311 249 L288 183 Z",
  },
  {
    id: "ASIA",
    labelX: 430,
    labelY: 136,
    countX: 538,
    countY: 151,
    path: "M392 73 L542 74 L585 146 L533 222 L430 214 L387 128 Z",
  },
  {
    id: "OCEANIA",
    labelX: 498,
    labelY: 273,
    countX: 571,
    countY: 289,
    path: "M486 229 L570 238 L589 300 L505 313 L462 272 Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ユーティリティ関数
// ─────────────────────────────────────────────────────────────────────────────
function getRegionLabel<T extends string>(
  regions: readonly RegionDescriptor<T>[],
  regionId: RegionSelection<T>,
): string {
  if (regionId === "UNCLASSIFIED") return "未分類";
  return regions.find((r) => r.id === regionId)?.label ?? "未分類";
}

function createCountRecord<T extends string>(
  regions: readonly RegionDescriptor<T>[],
): Record<T, number> {
  return Object.fromEntries(regions.map((r) => [r.id, 0])) as Record<T, number>;
}

function countByRegion<T extends string>(
  logs: readonly MapLogWithRegion<T>[],
  regions: readonly RegionDescriptor<T>[],
): { byRegion: Record<T, number>; unclassifiedCount: number } {
  const byRegion = createCountRecord(regions);
  let unclassifiedCount = 0;
  for (const log of logs) {
    if (log.regionId) {
      byRegion[log.regionId] += 1;
    } else {
      unclassifiedCount += 1;
    }
  }
  return { byRegion, unclassifiedCount };
}

function getCountFromSelection<T extends string>(
  selection: RegionSelection<T>,
  byRegion: Record<T, number>,
  unclassifiedCount: number,
): number {
  if (selection === "UNCLASSIFIED") return unclassifiedCount;
  return byRegion[selection];
}

function pickInitialRegion<T extends string>(
  regions: readonly RegionDescriptor<T>[],
  byRegion: Record<T, number>,
  unclassifiedCount: number,
): RegionSelection<T> {
  const matched = regions.find((r) => byRegion[r.id] > 0);
  if (matched) return matched.id;
  if (unclassifiedCount > 0) return "UNCLASSIFIED";
  return regions[0].id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 地図の地域カラー（ダークテーマ）
// ─────────────────────────────────────────────────────────────────────────────
function getRegionFill(active: boolean, count: number): string {
  if (active) return "#d4a843";
  if (count > 0) return "#2d6a4f";
  return "rgba(255,255,255,0.05)";
}

function getRegionStroke(active: boolean): string {
  if (active) return "#f0c96a";
  return "rgba(255,255,255,0.15)";
}

// ─────────────────────────────────────────────────────────────────────────────
// 日本地図コンポーネント
// ─────────────────────────────────────────────────────────────────────────────
function JapanRegionMap(props: {
  selected: RegionSelection<JapanRegionId>;
  counts: Record<JapanRegionId, number>;
  onSelect: (regionId: JapanRegionId) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d1117]/60">
      <svg viewBox="0 0 340 410" className="h-auto w-full">
        <defs>
          <pattern id="grid-jp" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="340" height="410" fill="url(#grid-jp)" />
        {JAPAN_SHAPES.map((shape) => {
          const isActive = props.selected === shape.id;
          const count = props.counts[shape.id];
          const label = JAPAN_REGIONS.find((r) => r.id === shape.id)?.label ?? shape.id;

          return (
            <g
              key={shape.id}
              role="button"
              tabIndex={0}
              onClick={() => props.onSelect(shape.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  props.onSelect(shape.id);
                }
              }}
              className="cursor-pointer"
              style={{ transition: "all 0.2s" }}
            >
              <path
                d={shape.path}
                fill={getRegionFill(isActive, count)}
                stroke={getRegionStroke(isActive)}
                strokeWidth={isActive ? 2 : 1}
                style={{ filter: isActive ? "drop-shadow(0 0 6px rgba(212,168,67,0.5))" : undefined }}
              />
              <text
                x={shape.labelX}
                y={shape.labelY}
                fill={isActive ? "#0d1117" : count > 0 ? "#e8edf5" : "rgba(255,255,255,0.3)"}
                fontSize="10"
                textAnchor="start"
                fontWeight={700}
              >
                {label}
              </text>
              <circle
                cx={shape.countX}
                cy={shape.countY}
                r="10"
                fill={isActive ? "#0d1117" : count > 0 ? "#d4a843" : "rgba(255,255,255,0.08)"}
              />
              <text
                x={shape.countX}
                y={shape.countY + 3.5}
                fill={isActive ? "#d4a843" : count > 0 ? "#0d1117" : "rgba(255,255,255,0.3)"}
                fontSize="9"
                textAnchor="middle"
                fontWeight={700}
              >
                {count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 世界地図コンポーネント
// ─────────────────────────────────────────────────────────────────────────────
function WorldRegionMap(props: {
  selected: RegionSelection<WorldRegionId>;
  counts: Record<WorldRegionId, number>;
  onSelect: (regionId: WorldRegionId) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d1117]/60">
      <svg viewBox="0 0 610 330" className="h-auto w-full">
        <defs>
          <linearGradient id="world-bg-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(13,17,23,0.8)" />
            <stop offset="100%" stopColor="rgba(13,17,23,0.95)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="610" height="330" fill="url(#world-bg-dark)" />
        {WORLD_SHAPES.map((shape) => {
          const isActive = props.selected === shape.id;
          const count = props.counts[shape.id];
          const label = WORLD_REGIONS.find((r) => r.id === shape.id)?.label ?? shape.id;

          return (
            <g
              key={shape.id}
              role="button"
              tabIndex={0}
              onClick={() => props.onSelect(shape.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  props.onSelect(shape.id);
                }
              }}
              className="cursor-pointer"
            >
              <path
                d={shape.path}
                fill={getRegionFill(isActive, count)}
                stroke={getRegionStroke(isActive)}
                strokeWidth={isActive ? 2 : 1.2}
                style={{ filter: isActive ? "drop-shadow(0 0 8px rgba(212,168,67,0.5))" : undefined }}
              />
              <text
                x={shape.labelX}
                y={shape.labelY}
                fill={isActive ? "#0d1117" : count > 0 ? "#e8edf5" : "rgba(255,255,255,0.3)"}
                fontSize="12"
                textAnchor="start"
                fontWeight={700}
              >
                {label}
              </text>
              <circle
                cx={shape.countX}
                cy={shape.countY}
                r="12"
                fill={isActive ? "#0d1117" : count > 0 ? "#d4a843" : "rgba(255,255,255,0.08)"}
              />
              <text
                x={shape.countX}
                y={shape.countY + 4}
                fill={isActive ? "#d4a843" : count > 0 ? "#0d1117" : "rgba(255,255,255,0.3)"}
                fontSize="10"
                textAnchor="middle"
                fontWeight={700}
              >
                {count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ログカードコンポーネント
// ─────────────────────────────────────────────────────────────────────────────
function LogCard({ log }: { log: MapLogItem }) {
  const badgeClass = DRINK_TYPE_BADGE_CLASS[log.drinkType];

  return (
    <li>
      <Link
        href={`/logs/${log.id}`}
        className="group flex gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 transition hover:border-[#d4a843]/30 hover:bg-white/6"
      >
        {/* サムネイル */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-white/5">
          {log.photoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={log.photoPath}
              alt={`${log.brandName} の写真`}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-6 w-6 text-[#4a5568]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* テキスト情報 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
              {DRINK_TYPE_LABELS[log.drinkType]}
            </span>
          </div>
          <h3 className="mt-0.5 truncate text-sm font-semibold text-white">{log.brandName}</h3>
          <p className="truncate text-xs text-[#8b95a8]">
            {formatDisplayDate(new Date(log.drankAtIso))}
            {log.origin && (
              <span className="ml-1 text-[#52b788]">・ {log.origin}</span>
            )}
          </p>
          {log.tasteNote && (
            <p className="mt-1 line-clamp-1 text-xs text-[#4a5568]">{log.tasteNote}</p>
          )}
        </div>

        {/* 矢印アイコン */}
        <div className="flex shrink-0 items-center">
          <svg className="h-4 w-4 text-[#4a5568] transition group-hover:text-[#d4a843] group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </Link>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────────────────────────────────────────
export function MapLogExplorer({ logs }: MapLogExplorerProps) {
  const [mode, setMode] = useState<MapMode>("japan");
  const [selectedJapan, setSelectedJapan] = useState<RegionSelection<JapanRegionId>>("KANTO");
  const [selectedWorld, setSelectedWorld] = useState<RegionSelection<WorldRegionId>>("EUROPE");

  const japanLogs = useMemo<MapLogWithRegion<JapanRegionId>[]>(
    () =>
      logs
        .filter((log) => JAPAN_TYPE_SET.has(log.drinkType))
        .map((log) => ({ ...log, regionId: classifyJapanRegion(log.origin) })),
    [logs],
  );

  const worldLogs = useMemo<MapLogWithRegion<WorldRegionId>[]>(
    () =>
      logs
        .filter((log) => WORLD_TYPE_SET.has(log.drinkType))
        .map((log) => ({ ...log, regionId: classifyWorldRegion(log.origin) })),
    [logs],
  );

  const japanStats = useMemo(() => countByRegion(japanLogs, JAPAN_REGIONS), [japanLogs]);
  const worldStats = useMemo(() => countByRegion(worldLogs, WORLD_REGIONS), [worldLogs]);

  const effectiveSelectedJapan = useMemo(() => {
    if (
      getCountFromSelection(selectedJapan, japanStats.byRegion, japanStats.unclassifiedCount) > 0 ||
      japanLogs.length === 0
    ) {
      return selectedJapan;
    }
    return pickInitialRegion(JAPAN_REGIONS, japanStats.byRegion, japanStats.unclassifiedCount);
  }, [japanLogs.length, japanStats.byRegion, japanStats.unclassifiedCount, selectedJapan]);

  const effectiveSelectedWorld = useMemo(() => {
    if (
      getCountFromSelection(selectedWorld, worldStats.byRegion, worldStats.unclassifiedCount) > 0 ||
      worldLogs.length === 0
    ) {
      return selectedWorld;
    }
    return pickInitialRegion(WORLD_REGIONS, worldStats.byRegion, worldStats.unclassifiedCount);
  }, [selectedWorld, worldLogs.length, worldStats.byRegion, worldStats.unclassifiedCount]);

  const selectedLogs =
    mode === "japan"
      ? japanLogs.filter((log) =>
          effectiveSelectedJapan === "UNCLASSIFIED"
            ? log.regionId === null
            : log.regionId === effectiveSelectedJapan,
        )
      : worldLogs.filter((log) =>
          effectiveSelectedWorld === "UNCLASSIFIED"
            ? log.regionId === null
            : log.regionId === effectiveSelectedWorld,
        );

  const selectedLabel =
    mode === "japan"
      ? getRegionLabel(JAPAN_REGIONS, effectiveSelectedJapan)
      : getRegionLabel(WORLD_REGIONS, effectiveSelectedWorld);

  const selectedCount =
    mode === "japan"
      ? getCountFromSelection(effectiveSelectedJapan, japanStats.byRegion, japanStats.unclassifiedCount)
      : getCountFromSelection(effectiveSelectedWorld, worldStats.byRegion, worldStats.unclassifiedCount);

  const activeRegionItems =
    mode === "japan"
      ? [
          ...JAPAN_REGIONS.map((r) => ({ id: r.id, label: r.label, count: japanStats.byRegion[r.id] })),
          { id: "UNCLASSIFIED" as const, label: "未分類", count: japanStats.unclassifiedCount },
        ]
      : [
          ...WORLD_REGIONS.map((r) => ({ id: r.id, label: r.label, count: worldStats.byRegion[r.id] })),
          { id: "UNCLASSIFIED" as const, label: "未分類", count: worldStats.unclassifiedCount },
        ];

  // 統計サマリー
  const totalJapan = japanLogs.length;
  const totalWorld = worldLogs.length;

  return (
    <section className="grid gap-4 sm:gap-5">
      {/* ─── ヒーローヘッダー ─── */}
      <div className="reveal glass-card p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4a843]">Map Journal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          地図から辿るお酒ログ
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-[#8b95a8]">
          よく飲むジャンルに合わせて、日本地図と世界地図を切り替えながら記録を見返せます。
        </p>

        {/* 統計バッジ */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7eb8d4]/30 bg-[#7eb8d4]/10 px-2.5 py-1 text-xs font-medium text-[#7eb8d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7eb8d4]" />
            日本酒・ビール {totalJapan}件
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c4436e]/30 bg-[#c4436e]/10 px-2.5 py-1 text-xs font-medium text-[#c4436e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c4436e]" />
            ハイボール・ワイン・その他 {totalWorld}件
          </span>
        </div>

        {/* 地図モード切替 */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/8 bg-white/3 p-1">
          <button
            type="button"
            onClick={() => setMode("japan")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "japan"
                ? "bg-[#d4a843] text-[#0d1117] shadow-md shadow-[#d4a843]/20"
                : "text-[#8b95a8] hover:text-white"
            }`}
          >
            🗾 日本地図
          </button>
          <button
            type="button"
            onClick={() => setMode("world")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "world"
                ? "bg-[#d4a843] text-[#0d1117] shadow-md shadow-[#d4a843]/20"
                : "text-[#8b95a8] hover:text-white"
            }`}
          >
            🌍 世界地図
          </button>
        </div>
      </div>

      {/* ─── 地図 ─── */}
      <div className="reveal reveal-delay-1 glass-card p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {mode === "japan" ? "日本地図ログ" : "世界地図ログ"}
          </h2>
          <span className="text-xs text-[#8b95a8]">
            {mode === "japan" ? "日本酒・ビール" : "ハイボール・ワイン・その他"}
          </span>
        </div>
        {mode === "japan" ? (
          <JapanRegionMap
            selected={effectiveSelectedJapan}
            counts={japanStats.byRegion}
            onSelect={(regionId) => setSelectedJapan(regionId)}
          />
        ) : (
          <WorldRegionMap
            selected={effectiveSelectedWorld}
            counts={worldStats.byRegion}
            onSelect={(regionId) => setSelectedWorld(regionId)}
          />
        )}
      </div>

      {/* ─── 地域タブ ─── */}
      <div className="reveal reveal-delay-2 flex gap-2 overflow-x-auto pb-1">
        {activeRegionItems.map((item) => {
          const isActive =
            mode === "japan"
              ? effectiveSelectedJapan === item.id
              : effectiveSelectedWorld === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (mode === "japan") {
                  setSelectedJapan(item.id as RegionSelection<JapanRegionId>);
                } else {
                  setSelectedWorld(item.id as RegionSelection<WorldRegionId>);
                }
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#d4a843]/50 bg-[#d4a843]/15 text-[#d4a843]"
                  : "border-white/8 bg-white/3 text-[#8b95a8] hover:border-white/15 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-[#d4a843]/20 text-[#d4a843]" : "bg-white/5 text-[#4a5568]"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── 地域ログ一覧 ─── */}
      <div className="reveal reveal-delay-3 glass-card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-white">
            {selectedLabel}
            <span className="ml-1 text-[#8b95a8] font-normal text-sm">の記録</span>
          </h2>
          <span className="rounded-full border border-[#d4a843]/30 bg-[#d4a843]/10 px-3 py-1 text-xs font-semibold text-[#d4a843]">
            {selectedCount}件
          </span>
        </div>

        {selectedLogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/8 bg-white/2 p-6 text-center">
            <svg className="h-8 w-8 text-[#4a5568]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-[#4a5568]">この地域にはまだ記録がありません。</p>
            <Link
              href="/logs/new"
              className="rounded-xl bg-[#d4a843] px-4 py-2 text-xs font-semibold text-[#0d1117] transition hover:bg-[#f0c96a]"
            >
              記録を追加する
            </Link>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {selectedLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
