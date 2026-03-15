import { DrinkType } from "@prisma/client";

export const DRINK_TYPE_OPTIONS: readonly DrinkType[] = [
  DrinkType.SAKE,
  DrinkType.HIGHBALL,
  DrinkType.BEER,
  DrinkType.WINE,
  DrinkType.OTHER,
] as const;

export const DRINK_TYPE_LABELS: Record<DrinkType, string> = {
  [DrinkType.SAKE]: "日本酒",
  [DrinkType.HIGHBALL]: "ハイボール",
  [DrinkType.BEER]: "ビール",
  [DrinkType.WINE]: "ワイン",
  [DrinkType.OTHER]: "その他",
};

export const DRINK_TYPE_FILTERS = ["ALL", ...DRINK_TYPE_OPTIONS] as const;

export type DrinkTypeFilter = (typeof DRINK_TYPE_FILTERS)[number];

export function isDrinkType(value: string): value is DrinkType {
  return DRINK_TYPE_OPTIONS.includes(value as DrinkType);
}
