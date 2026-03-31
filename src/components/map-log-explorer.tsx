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
// 実際の日本の形状に近い、より精細なパスを使用
// ─────────────────────────────────────────────────────────────────────────────
const JAPAN_SHAPES: readonly {
  id: JapanRegionId;
  labelX: number;
  labelY: number;
  countX: number;
  countY: number;
  path: string;
  labelAnchor?: "middle" | "start" | "end" | "inherit";
}[] = [
  {
    id: "HOKKAIDO",
    labelX: 195,
    labelY: 52,
    countX: 195,
    countY: 70,
    path: "M140 22 L210 18 L248 28 L260 55 L238 75 L200 82 L168 78 L148 62 L132 44 Z",
    labelAnchor: "middle",
  },
  {
    id: "TOHOKU",
    labelX: 210,
    labelY: 130,
    countX: 210,
    countY: 148,
    path: "M188 88 L238 82 L252 100 L248 148 L218 168 L188 158 L172 132 L176 100 Z",
    labelAnchor: "middle",
  },
  {
    id: "KANTO",
    labelX: 228,
    labelY: 198,
    countX: 228,
    countY: 216,
    path: "M192 162 L248 152 L262 178 L248 210 L218 222 L192 208 L182 186 Z",
    labelAnchor: "middle",
  },
  {
    id: "CHUBU",
    labelX: 168,
    labelY: 198,
    countX: 168,
    countY: 216,
    path: "M148 168 L192 162 L182 208 L158 228 L128 218 L118 192 L132 172 Z",
    labelAnchor: "middle",
  },
  {
    id: "KANSAI",
    labelX: 148,
    labelY: 252,
    countX: 148,
    countY: 270,
    path: "M118 228 L168 228 L178 258 L158 282 L128 278 L108 258 Z",
    labelAnchor: "middle",
  },
  {
    id: "CHUGOKU",
    labelX: 88,
    labelY: 258,
    countX: 88,
    countY: 276,
    path: "M58 228 L118 228 L108 278 L72 292 L42 268 L48 242 Z",
    labelAnchor: "middle",
  },
  {
    id: "SHIKOKU",
    labelX: 128,
    labelY: 308,
    countX: 128,
    countY: 326,
    path: "M98 290 L162 288 L172 312 L148 332 L102 328 L88 308 Z",
    labelAnchor: "middle",
  },
  {
    id: "KYUSHU_OKINAWA",
    labelX: 62,
    labelY: 332,
    countX: 62,
    countY: 350,
    path: "M28 292 L92 290 L108 320 L92 368 L52 378 L18 348 L22 312 Z",
    labelAnchor: "middle",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 世界地図シェイプ定義（より自然な形状）
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
    labelX: 102,
    labelY: 108,
    countX: 102,
    countY: 126,
    path: "M18 52 L188 38 L228 68 L218 118 L172 148 L108 162 L52 142 L22 108 Z",
  },
  {
    id: "SOUTH_AMERICA",
    labelX: 162,
    labelY: 238,
    countX: 162,
    countY: 256,
    path: "M118 162 L218 158 L248 208 L238 278 L188 308 L148 288 L118 248 L108 198 Z",
  },
  {
    id: "EUROPE",
    labelX: 318,
    labelY: 92,
    countX: 318,
    countY: 110,
    path: "M272 52 L378 48 L398 78 L388 118 L342 128 L288 118 L268 88 Z",
  },
  {
    id: "AFRICA_MIDDLE_EAST",
    labelX: 328,
    labelY: 208,
    countX: 328,
    countY: 226,
    path: "M278 128 L398 122 L428 188 L408 268 L358 298 L298 268 L268 208 L278 148 Z",
  },
  {
    id: "ASIA",
    labelX: 468,
    labelY: 128,
    countX: 468,
    countY: 146,
    path: "M398 58 L568 62 L598 118 L568 188 L468 208 L398 188 L388 128 L398 78 Z",
  },
  {
    id: "OCEANIA",
    labelX: 508,
    labelY: 268,
    countX: 508,
    countY: 286,
    path: "M458 228 L578 232 L598 288 L548 318 L468 308 L438 268 Z",
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
// 地図の地域カラー（ライトテーマ・古地図風）
// ─────────────────────────────────────────────────────────────────────────────
function getRegionFill(active: boolean, count: number): string {
  if (active) return "#b5832a";
  if (count > 0) return "#c8a96e";
  return "#e8dfc8";
}

function getRegionStroke(active: boolean, count: number): string {
  if (active) return "#8a6020";
  if (count > 0) return "#a07838";
  return "#c4b090";
}

function getRegionStrokeWidth(active: boolean): number {
  return active ? 2 : 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// 日本地図コンポーネント（古地図風ライトテーマ）
// ─────────────────────────────────────────────────────────────────────────────
function JapanRegionMap(props: {
  selected: RegionSelection<JapanRegionId>;
  counts: Record<JapanRegionId, number>;
  onSelect: (regionId: JapanRegionId) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#c4b090]/60 bg-[#f2ead8] shadow-sm">
      <svg viewBox="0 0 290 410" className="h-auto w-full" aria-label="日本地図">
        <defs>
          {/* 古地図風テクスチャ */}
          <filter id="paper-jp">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="region-shadow">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(100,70,20,0.2)" />
          </filter>
          {/* 海の背景グラデーション */}
          <linearGradient id="sea-jp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ddeef8" />
            <stop offset="100%" stopColor="#c8e0f0" />
          </linearGradient>
          {/* 選択時のグロー */}
          <filter id="active-glow-jp">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#b5832a" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 海の背景 */}
        <rect x="0" y="0" width="290" height="410" fill="url(#sea-jp)" />

        {/* 海の波模様（装飾） */}
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={20 + i * 60}
            cy={380}
            rx={25}
            ry={4}
            fill="none"
            stroke="rgba(180,210,230,0.5)"
            strokeWidth="1.5"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={`w2-${i}`}
            cx={50 + i * 60}
            cy={395}
            rx={20}
            ry={3}
            fill="none"
            stroke="rgba(180,210,230,0.4)"
            strokeWidth="1"
          />
        ))}

        {/* 地域シェイプ */}
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
              style={{ transition: "all 0.18s ease" }}
            >
              {/* 地域の影（立体感） */}
              <path
                d={shape.path}
                fill="rgba(100,70,20,0.12)"
                transform="translate(2,3)"
              />
              {/* 地域本体 */}
              <path
                d={shape.path}
                fill={getRegionFill(isActive, count)}
                stroke={getRegionStroke(isActive, count)}
                strokeWidth={getRegionStrokeWidth(isActive)}
                strokeLinejoin="round"
                style={isActive ? { filter: "drop-shadow(0 0 5px rgba(181,131,42,0.6))" } : undefined}
              />
              {/* 地域名ラベル */}
              <text
                x={shape.labelX}
                y={shape.labelY}
                fill={isActive ? "#ffffff" : count > 0 ? "#4a3010" : "#7a6848"}
                fontSize="9.5"
                textAnchor={shape.labelAnchor ?? "middle"}
                fontWeight={isActive ? 800 : 600}
                style={{ letterSpacing: "0.02em" }}
              >
                {label}
              </text>
              {/* 件数バッジ */}
              {count > 0 && (
                <>
                  <circle
                    cx={shape.countX}
                    cy={shape.countY}
                    r="11"
                    fill={isActive ? "#8a6020" : "#b5832a"}
                    stroke={isActive ? "#f7f3ed" : "#ffffff"}
                    strokeWidth="1.5"
                  />
                  <text
                    x={shape.countX}
                    y={shape.countY + 3.5}
                    fill="#ffffff"
                    fontSize="9"
                    textAnchor="middle"
                    fontWeight={700}
                  >
                    {count}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* コンパスローズ（装飾） */}
        <g transform="translate(24, 24)" opacity="0.5">
          <circle cx="0" cy="0" r="12" fill="none" stroke="#a07838" strokeWidth="0.8" />
          <polygon points="0,-10 2.5,-3 0,-5 -2.5,-3" fill="#a07838" />
          <polygon points="0,10 2.5,3 0,5 -2.5,3" fill="#c4b090" />
          <polygon points="-10,0 -3,-2.5 -5,0 -3,2.5" fill="#c4b090" />
          <polygon points="10,0 3,-2.5 5,0 3,2.5" fill="#c4b090" />
          <text x="0" y="-14" fontSize="5" textAnchor="middle" fill="#a07838" fontWeight="700">N</text>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 世界地図コンポーネント（古地図風ライトテーマ）
// ─────────────────────────────────────────────────────────────────────────────
function WorldRegionMap(props: {
  selected: RegionSelection<WorldRegionId>;
  counts: Record<WorldRegionId, number>;
  onSelect: (regionId: WorldRegionId) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#c4b090]/60 bg-[#f2ead8] shadow-sm">
      <svg viewBox="0 0 620 340" className="h-auto w-full" aria-label="世界地図">
        <defs>
          <linearGradient id="sea-world" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d8eef8" />
            <stop offset="100%" stopColor="#c2ddf0" />
          </linearGradient>
          <filter id="active-glow-world">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#b5832a" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 経緯線パターン */}
          <pattern id="grid-world" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(160,120,56,0.12)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* 海の背景 */}
        <rect x="0" y="0" width="620" height="340" fill="url(#sea-world)" />
        {/* 経緯線（装飾） */}
        <rect x="0" y="0" width="620" height="340" fill="url(#grid-world)" />

        {/* 地域シェイプ */}
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
              style={{ transition: "all 0.18s ease" }}
            >
              {/* 影 */}
              <path
                d={shape.path}
                fill="rgba(100,70,20,0.1)"
                transform="translate(2,3)"
              />
              {/* 地域本体 */}
              <path
                d={shape.path}
                fill={getRegionFill(isActive, count)}
                stroke={getRegionStroke(isActive, count)}
                strokeWidth={isActive ? 2 : 1}
                strokeLinejoin="round"
                style={isActive ? { filter: "drop-shadow(0 0 6px rgba(181,131,42,0.6))" } : undefined}
              />
              {/* 地域名ラベル */}
              <text
                x={shape.labelX}
                y={shape.labelY}
                fill={isActive ? "#ffffff" : count > 0 ? "#4a3010" : "#7a6848"}
                fontSize="11"
                textAnchor="middle"
                fontWeight={isActive ? 800 : 600}
                style={{ letterSpacing: "0.02em" }}
              >
                {label}
              </text>
              {/* 件数バッジ */}
              {count > 0 && (
                <>
                  <circle
                    cx={shape.countX}
                    cy={shape.countY}
                    r="13"
                    fill={isActive ? "#8a6020" : "#b5832a"}
                    stroke={isActive ? "#f7f3ed" : "#ffffff"}
                    strokeWidth="1.5"
                  />
                  <text
                    x={shape.countX}
                    y={shape.countY + 4}
                    fill="#ffffff"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight={700}
                  >
                    {count}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* コンパスローズ（装飾） */}
        <g transform="translate(30, 30)" opacity="0.55">
          <circle cx="0" cy="0" r="16" fill="none" stroke="#a07838" strokeWidth="0.8" />
          <polygon points="0,-13 3,-4 0,-7 -3,-4" fill="#a07838" />
          <polygon points="0,13 3,4 0,7 -3,4" fill="#c4b090" />
          <polygon points="-13,0 -4,-3 -7,0 -4,3" fill="#c4b090" />
          <polygon points="13,0 4,-3 7,0 4,3" fill="#c4b090" />
          <text x="0" y="-18" fontSize="7" textAnchor="middle" fill="#a07838" fontWeight="700">N</text>
        </g>

        {/* スケール（装飾） */}
        <g transform="translate(520, 320)" opacity="0.5">
          <line x1="0" y1="0" x2="60" y2="0" stroke="#a07838" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="#a07838" strokeWidth="1" />
          <line x1="30" y1="0" x2="30" y2="4" stroke="#a07838" strokeWidth="1" />
          <line x1="60" y1="0" x2="60" y2="5" stroke="#a07838" strokeWidth="1" />
          <text x="30" y="-3" fontSize="6" textAnchor="middle" fill="#a07838">scale</text>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ログカードコンポーネント（ライトテーマ）
// ─────────────────────────────────────────────────────────────────────────────
function LogCard({ log }: { log: MapLogItem }) {
  const badgeClass = DRINK_TYPE_BADGE_CLASS[log.drinkType];

  return (
    <li>
      <Link
        href={`/logs/${log.id}`}
        className="group flex gap-3 rounded-xl border border-[#1a1612]/8 bg-white p-3 transition hover:border-[#b5832a]/30 hover:shadow-md hover:shadow-[#b5832a]/8"
      >
        {/* サムネイル */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#1a1612]/8 bg-[#f2ead8]">
          {log.photoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={log.photoPath}
              alt={`${log.brandName} の写真`}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-6 w-6 text-[#c4b090]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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
          <h3 className="mt-0.5 truncate text-sm font-semibold text-[#1a1612]">{log.brandName}</h3>
          <p className="truncate text-xs text-[#9c8f82]">
            {formatDisplayDate(new Date(log.drankAtIso))}
            {log.origin && (
              <span className="ml-1 text-[#2d6a4f]">・ {log.origin}</span>
            )}
          </p>
          {log.tasteNote && (
            <p className="mt-1 line-clamp-1 text-xs text-[#9c8f82]">{log.tasteNote}</p>
          )}
        </div>

        {/* 矢印アイコン */}
        <div className="flex shrink-0 items-center">
          <svg className="h-4 w-4 text-[#c4b090] transition group-hover:text-[#b5832a] group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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

  const totalJapan = japanLogs.length;
  const totalWorld = worldLogs.length;

  return (
    <section className="grid gap-4 sm:gap-5">
      {/* ─── ヒーローヘッダー ─── */}
      <div className="reveal glass-card p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5832a]">Map Journal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1a1612] sm:text-3xl">
          地図から辿るお酒ログ
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-[#5c5346]">
          よく飲むジャンルに合わせて、日本地図と世界地図を切り替えながら記録を見返せます。
        </p>

        {/* 統計バッジ */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3a8ab5]/25 bg-[#3a8ab5]/8 px-2.5 py-1 text-xs font-medium text-[#2a6f9e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3a8ab5]" />
            日本酒・ビール {totalJapan}件
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8b2252]/25 bg-[#8b2252]/8 px-2.5 py-1 text-xs font-medium text-[#7a1c4a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8b2252]" />
            ハイボール・ワイン・その他 {totalWorld}件
          </span>
        </div>

        {/* 地図モード切替 */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[#1a1612]/8 bg-[#f7f3ed] p-1">
          <button
            type="button"
            onClick={() => setMode("japan")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "japan"
                ? "bg-[#b5832a] text-white shadow-sm shadow-[#b5832a]/20"
                : "text-[#9c8f82] hover:text-[#1a1612]"
            }`}
          >
            🗾 日本地図
          </button>
          <button
            type="button"
            onClick={() => setMode("world")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "world"
                ? "bg-[#b5832a] text-white shadow-sm shadow-[#b5832a]/20"
                : "text-[#9c8f82] hover:text-[#1a1612]"
            }`}
          >
            🌍 世界地図
          </button>
        </div>
      </div>

      {/* ─── 地図 ─── */}
      <div className="reveal reveal-delay-1">
        {mode === "japan" ? (
          <JapanRegionMap
            selected={effectiveSelectedJapan}
            counts={japanStats.byRegion}
            onSelect={setSelectedJapan}
          />
        ) : (
          <WorldRegionMap
            selected={effectiveSelectedWorld}
            counts={worldStats.byRegion}
            onSelect={setSelectedWorld}
          />
        )}
      </div>

      {/* ─── 地域タブ ─── */}
      <div className="reveal reveal-delay-2 flex gap-1.5 overflow-x-auto pb-1">
        {activeRegionItems.map((item) => {
          const isSelected =
            mode === "japan"
              ? effectiveSelectedJapan === item.id
              : effectiveSelectedWorld === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (mode === "japan") {
                  setSelectedJapan(item.id as JapanRegionId | "UNCLASSIFIED");
                } else {
                  setSelectedWorld(item.id as WorldRegionId | "UNCLASSIFIED");
                }
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "border-[#b5832a] bg-[#b5832a] text-white"
                  : item.count > 0
                    ? "border-[#c4b090] bg-white text-[#5c5346] hover:border-[#b5832a]/50 hover:text-[#b5832a]"
                    : "border-[#1a1612]/8 bg-[#f7f3ed] text-[#9c8f82]"
              }`}
            >
              {item.label}
              {item.count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isSelected ? "bg-white/20 text-white" : "bg-[#b5832a]/12 text-[#b5832a]"}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── 選択地域のログ一覧 ─── */}
      <div className="reveal reveal-delay-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1a1612]">
            {selectedLabel}
            <span className="ml-2 text-xs font-normal text-[#9c8f82]">{selectedCount}件</span>
          </h2>
        </div>

        {selectedLogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#c4b090]/60 bg-[#faf7f2] p-8 text-center">
            <p className="text-sm text-[#9c8f82]">この地域のログはまだありません</p>
            <Link
              href="/logs/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#b5832a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8a6020]"
            >
              最初の記録を追加
            </Link>
          </div>
        ) : (
          <ul className="grid gap-2">
            {selectedLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
