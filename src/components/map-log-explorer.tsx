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

function getRegionLabel<T extends string>(
  regions: readonly RegionDescriptor<T>[],
  regionId: RegionSelection<T>,
): string {
  if (regionId === "UNCLASSIFIED") {
    return "未分類";
  }

  return regions.find((region) => region.id === regionId)?.label ?? "未分類";
}

function createCountRecord<T extends string>(
  regions: readonly RegionDescriptor<T>[],
): Record<T, number> {
  return Object.fromEntries(regions.map((region) => [region.id, 0])) as Record<T, number>;
}

function countByRegion<T extends string>(
  logs: readonly MapLogWithRegion<T>[],
  regions: readonly RegionDescriptor<T>[],
): {
  byRegion: Record<T, number>;
  unclassifiedCount: number;
} {
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
  if (selection === "UNCLASSIFIED") {
    return unclassifiedCount;
  }

  return byRegion[selection];
}

function pickInitialRegion<T extends string>(
  regions: readonly RegionDescriptor<T>[],
  byRegion: Record<T, number>,
  unclassifiedCount: number,
): RegionSelection<T> {
  const matched = regions.find((region) => byRegion[region.id] > 0);
  if (matched) {
    return matched.id;
  }

  if (unclassifiedCount > 0) {
    return "UNCLASSIFIED";
  }

  return regions[0].id;
}

function getRegionFill(active: boolean, count: number): string {
  if (active) {
    return "#0f5135";
  }

  if (count > 0) {
    return "#7fbf9b";
  }

  return "#d3dccf";
}

function MapSurface(props: {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border border-[#d5ccb8] bg-gradient-to-br from-[#f8f2e4] via-[#f2f7ec] to-[#e3f0e7] p-3 shadow-[0_16px_48px_-30px_rgba(20,43,30,0.45)] sm:p-4 ${props.className ?? ""}`}
    >
      <div className="mb-3 grid gap-0.5">
        <h2 className="text-base font-bold tracking-tight text-[#123524] sm:text-lg">{props.title}</h2>
        <p className="text-xs text-[#5f6d5f] sm:text-sm">{props.subtitle}</p>
      </div>
      {props.children}
    </div>
  );
}

function JapanRegionMap(props: {
  selected: RegionSelection<JapanRegionId>;
  counts: Record<JapanRegionId, number>;
  onSelect: (regionId: JapanRegionId) => void;
}) {
  return (
    <MapSurface
      title="日本地図ログ"
      subtitle="日本酒・ビールの記録を地域ごとに確認"
      className="reveal reveal-delay-1"
    >
      <div className="overflow-hidden rounded-2xl border border-[#cfdac6] bg-[#f9fcf7]">
        <svg viewBox="0 0 340 410" className="h-auto w-full">
          <defs>
            <pattern id="grid-jp" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e7efe2" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="340" height="410" fill="url(#grid-jp)" />
          {JAPAN_SHAPES.map((shape) => {
            const isActive = props.selected === shape.id;
            const count = props.counts[shape.id];
            const label = JAPAN_REGIONS.find((region) => region.id === shape.id)?.label ?? shape.id;

            return (
              <g
                key={shape.id}
                role="button"
                tabIndex={0}
                onClick={() => props.onSelect(shape.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    props.onSelect(shape.id);
                  }
                }}
                className="cursor-pointer"
              >
                <path
                  d={shape.path}
                  fill={getRegionFill(isActive, count)}
                  stroke={isActive ? "#0a2f21" : "#2f4f3e"}
                  strokeWidth={isActive ? 2.5 : 1.4}
                />
                <text
                  x={shape.labelX}
                  y={shape.labelY}
                  fill={isActive ? "#ffffff" : "#183425"}
                  fontSize="11"
                  textAnchor="start"
                  fontWeight={700}
                >
                  {label}
                </text>
                <circle
                  cx={shape.countX}
                  cy={shape.countY}
                  r="10.5"
                  fill={isActive ? "#ffffff" : "#123524"}
                />
                <text
                  x={shape.countX}
                  y={shape.countY + 3}
                  fill={isActive ? "#123524" : "#ffffff"}
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
    </MapSurface>
  );
}

function WorldRegionMap(props: {
  selected: RegionSelection<WorldRegionId>;
  counts: Record<WorldRegionId, number>;
  onSelect: (regionId: WorldRegionId) => void;
}) {
  return (
    <MapSurface
      title="世界地図ログ"
      subtitle="ハイボール・ワインを世界の産地から辿る"
      className="reveal reveal-delay-1"
    >
      <div className="overflow-hidden rounded-2xl border border-[#cfdac6] bg-[#f8fcff]">
        <svg viewBox="0 0 610 330" className="h-auto w-full">
          <defs>
            <linearGradient id="world-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eef8ff" />
              <stop offset="100%" stopColor="#d8eef4" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="610" height="330" fill="url(#world-bg)" />
          {WORLD_SHAPES.map((shape) => {
            const isActive = props.selected === shape.id;
            const count = props.counts[shape.id];
            const label = WORLD_REGIONS.find((region) => region.id === shape.id)?.label ?? shape.id;

            return (
              <g
                key={shape.id}
                role="button"
                tabIndex={0}
                onClick={() => props.onSelect(shape.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    props.onSelect(shape.id);
                  }
                }}
                className="cursor-pointer"
              >
                <path
                  d={shape.path}
                  fill={getRegionFill(isActive, count)}
                  stroke={isActive ? "#0a2f21" : "#2f4f3e"}
                  strokeWidth={isActive ? 2.6 : 1.6}
                />
                <text
                  x={shape.labelX}
                  y={shape.labelY}
                  fill={isActive ? "#ffffff" : "#183425"}
                  fontSize="13"
                  textAnchor="start"
                  fontWeight={700}
                >
                  {label}
                </text>
                <circle
                  cx={shape.countX}
                  cy={shape.countY}
                  r="12"
                  fill={isActive ? "#ffffff" : "#123524"}
                />
                <text
                  x={shape.countX}
                  y={shape.countY + 3.5}
                  fill={isActive ? "#123524" : "#ffffff"}
                  fontSize="11"
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
    </MapSurface>
  );
}

function LogCard(props: { log: MapLogItem }) {
  return (
    <li>
      <Link
        href={`/logs/${props.log.id}`}
        className="grid gap-3 rounded-2xl border border-[#d8cfbf] bg-[#fffefb] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-[#ece4d2]">
            {props.log.photoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.log.photoPath}
                alt={`${props.log.brandName} の写真`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-[#85796a]">
                No Photo
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-[#4d6b58]">
              {DRINK_TYPE_LABELS[props.log.drinkType]}
            </p>
            <h3 className="truncate text-base font-semibold text-[#2e2a21]">{props.log.brandName}</h3>
            <p className="truncate text-xs text-[#6e685b]">
              {formatDisplayDate(new Date(props.log.drankAtIso))}
              {props.log.origin ? ` ・ ${props.log.origin}` : ""}
            </p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-[#4f493d]">
          {props.log.tasteNote || "味メモはまだ登録されていません。"}
        </p>
      </Link>
    </li>
  );
}

export function MapLogExplorer({ logs }: MapLogExplorerProps) {
  const [mode, setMode] = useState<MapMode>("japan");
  const [selectedJapan, setSelectedJapan] = useState<RegionSelection<JapanRegionId>>("KANTO");
  const [selectedWorld, setSelectedWorld] = useState<RegionSelection<WorldRegionId>>("EUROPE");

  const japanLogs = useMemo<MapLogWithRegion<JapanRegionId>[]>(
    () =>
      logs
        .filter((log) => JAPAN_TYPE_SET.has(log.drinkType))
        .map((log) => ({
          ...log,
          regionId: classifyJapanRegion(log.origin),
        })),
    [logs],
  );

  const worldLogs = useMemo<MapLogWithRegion<WorldRegionId>[]>(
    () =>
      logs
        .filter((log) => WORLD_TYPE_SET.has(log.drinkType))
        .map((log) => ({
          ...log,
          regionId: classifyWorldRegion(log.origin),
        })),
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
          ...JAPAN_REGIONS.map((region) => ({
            id: region.id,
            label: region.label,
            count: japanStats.byRegion[region.id],
          })),
          { id: "UNCLASSIFIED" as const, label: "未分類", count: japanStats.unclassifiedCount },
        ]
      : [
          ...WORLD_REGIONS.map((region) => ({
            id: region.id,
            label: region.label,
            count: worldStats.byRegion[region.id],
          })),
          { id: "UNCLASSIFIED" as const, label: "未分類", count: worldStats.unclassifiedCount },
        ];

  return (
    <section className="grid gap-4 sm:gap-5">
      <div className="reveal rounded-3xl border border-[#d8cfbf] bg-[#fffcf5] p-4 shadow-[0_16px_50px_-36px_rgba(24,53,38,0.55)] sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#547061]">Map Journal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#123524] sm:text-3xl">
          地図から辿るお酒ログ
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#5f5b51]">
          よく飲むジャンルに合わせて、日本地図と世界地図を切り替えながら記録を見返せます。
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#efe7d7] p-1.5 text-sm">
          <button
            type="button"
            onClick={() => setMode("japan")}
            className={`rounded-xl px-3 py-2 font-semibold transition ${
              mode === "japan"
                ? "bg-[#123524] text-white"
                : "bg-transparent text-[#2e2a21] hover:bg-[#dfd4bf]"
            }`}
          >
            日本地図
          </button>
          <button
            type="button"
            onClick={() => setMode("world")}
            className={`rounded-xl px-3 py-2 font-semibold transition ${
              mode === "world"
                ? "bg-[#123524] text-white"
                : "bg-transparent text-[#2e2a21] hover:bg-[#dfd4bf]"
            }`}
          >
            世界地図
          </button>
        </div>
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

      <div className="reveal reveal-delay-1 flex gap-2 overflow-x-auto pb-1">
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
                  return;
                }

                setSelectedWorld(item.id as RegionSelection<WorldRegionId>);
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#0f3f2c] bg-[#123524] text-white"
                  : "border-[#d0c5b0] bg-[#fffdf9] text-[#544d41] hover:border-[#8ea896]"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-[#ece3d1] text-[#5f584b]"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="reveal reveal-delay-2 rounded-2xl border border-[#d8cfbf] bg-[#fffefb] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-[#123524]">{selectedLabel} の記録</h2>
          <span className="rounded-full bg-[#ecf3ea] px-3 py-1 text-xs font-semibold text-[#1d5239]">
            {selectedCount}件
          </span>
        </div>

        {selectedLogs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#cfc3ae] bg-[#fffaf1] p-4 text-sm text-[#756d5e]">
            この地域にはまだ記録がありません。新規記録から追加できます。
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {selectedLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
