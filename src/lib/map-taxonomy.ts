export type DrinkTypeValue = "SAKE" | "HIGHBALL" | "BEER" | "WINE" | "OTHER";

export const DRINK_TYPE_LABELS: Record<DrinkTypeValue, string> = {
  SAKE: "日本酒",
  HIGHBALL: "ハイボール",
  BEER: "ビール",
  WINE: "ワイン",
  OTHER: "その他",
};

export const JAPAN_MAP_DRINK_TYPES: readonly DrinkTypeValue[] = ["SAKE", "BEER"];
export const WORLD_MAP_DRINK_TYPES: readonly DrinkTypeValue[] = ["HIGHBALL", "WINE", "OTHER"];

export type JapanRegionId =
  | "HOKKAIDO"
  | "TOHOKU"
  | "KANTO"
  | "CHUBU"
  | "KANSAI"
  | "CHUGOKU"
  | "SHIKOKU"
  | "KYUSHU_OKINAWA";

export const JAPAN_REGIONS: readonly { id: JapanRegionId; label: string }[] = [
  { id: "HOKKAIDO", label: "北海道" },
  { id: "TOHOKU", label: "東北" },
  { id: "KANTO", label: "関東" },
  { id: "CHUBU", label: "中部" },
  { id: "KANSAI", label: "関西" },
  { id: "CHUGOKU", label: "中国" },
  { id: "SHIKOKU", label: "四国" },
  { id: "KYUSHU_OKINAWA", label: "九州・沖縄" },
] as const;

export type WorldRegionId =
  | "NORTH_AMERICA"
  | "SOUTH_AMERICA"
  | "EUROPE"
  | "AFRICA_MIDDLE_EAST"
  | "ASIA"
  | "OCEANIA";

export const WORLD_REGIONS: readonly { id: WorldRegionId; label: string }[] = [
  { id: "NORTH_AMERICA", label: "北米" },
  { id: "SOUTH_AMERICA", label: "南米" },
  { id: "EUROPE", label: "欧州" },
  { id: "AFRICA_MIDDLE_EAST", label: "中東・アフリカ" },
  { id: "ASIA", label: "アジア" },
  { id: "OCEANIA", label: "オセアニア" },
] as const;

const JAPAN_REGION_KEYWORDS: Record<JapanRegionId, readonly string[]> = {
  HOKKAIDO: ["北海道"],
  TOHOKU: ["東北", "青森", "岩手", "宮城", "秋田", "山形", "福島"],
  KANTO: ["関東", "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川"],
  CHUBU: [
    "中部",
    "北陸",
    "甲信",
    "新潟",
    "富山",
    "石川",
    "福井",
    "山梨",
    "長野",
    "岐阜",
    "静岡",
    "愛知",
  ],
  KANSAI: ["関西", "近畿", "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山"],
  CHUGOKU: ["中国", "鳥取", "島根", "岡山", "広島", "山口"],
  SHIKOKU: ["四国", "徳島", "香川", "愛媛", "高知"],
  KYUSHU_OKINAWA: ["九州", "沖縄", "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島"],
};

const WORLD_REGION_KEYWORDS: Record<WorldRegionId, readonly string[]> = {
  NORTH_AMERICA: [
    "アメリカ",
    "米国",
    "usa",
    "united states",
    "カナダ",
    "canada",
    "メキシコ",
    "mexico",
    "バーボン",
  ],
  SOUTH_AMERICA: [
    "南米",
    "チリ",
    "chile",
    "アルゼンチン",
    "argentina",
    "ブラジル",
    "brazil",
    "ウルグアイ",
    "uruguay",
    "ペルー",
    "peru",
  ],
  EUROPE: [
    "欧州",
    "ヨーロッパ",
    "フランス",
    "france",
    "イタリア",
    "italy",
    "スペイン",
    "spain",
    "ポルトガル",
    "portugal",
    "ドイツ",
    "germany",
    "イギリス",
    "uk",
    "england",
    "スコットランド",
    "scotland",
    "アイルランド",
    "ireland",
  ],
  AFRICA_MIDDLE_EAST: [
    "南アフリカ",
    "south africa",
    "アフリカ",
    "モロッコ",
    "morocco",
    "エジプト",
    "egypt",
    "トルコ",
    "turkey",
    "イスラエル",
    "israel",
    "レバノン",
    "lebanon",
    "中東",
  ],
  ASIA: [
    "日本",
    "japan",
    "中国",
    "china",
    "台湾",
    "taiwan",
    "韓国",
    "korea",
    "香港",
    "hong kong",
    "インド",
    "india",
    "タイ",
    "thailand",
    "ベトナム",
    "vietnam",
    "シンガポール",
    "singapore",
    "マレーシア",
    "malaysia",
  ],
  OCEANIA: [
    "オセアニア",
    "オーストラリア",
    "australia",
    "ニュージーランド",
    "new zealand",
  ],
};

function normalizeOrigin(origin: string): string {
  return origin.trim().toLowerCase().normalize("NFKC");
}

function includesAnyKeyword(origin: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => origin.includes(keyword));
}

export function classifyJapanRegion(origin?: string | null): JapanRegionId | null {
  if (!origin) {
    return null;
  }

  const normalized = normalizeOrigin(origin);

  for (const { id } of JAPAN_REGIONS) {
    if (includesAnyKeyword(normalized, JAPAN_REGION_KEYWORDS[id])) {
      return id;
    }
  }

  return null;
}

export function classifyWorldRegion(origin?: string | null): WorldRegionId | null {
  if (!origin) {
    return null;
  }

  const normalized = normalizeOrigin(origin);

  for (const { id } of WORLD_REGIONS) {
    if (includesAnyKeyword(normalized, WORLD_REGION_KEYWORDS[id])) {
      return id;
    }
  }

  return null;
}
