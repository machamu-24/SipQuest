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

// ─────────────────────────────────────────────────────────────────────────────
// 日本地図キーワード辞書（都道府県・地方名・通称・英語表記を網羅）
// ─────────────────────────────────────────────────────────────────────────────
const JAPAN_REGION_KEYWORDS: Record<JapanRegionId, readonly string[]> = {
  HOKKAIDO: [
    "北海道", "hokkaido", "ほっかいどう",
    "札幌", "函館", "旭川", "帯広", "釧路", "小樽", "苫小牧",
    "sapporo", "hakodate", "asahikawa",
  ],
  TOHOKU: [
    "東北", "tohoku", "とうほく",
    "青森", "aomori", "あおもり",
    "岩手", "iwate", "いわて",
    "宮城", "miyagi", "みやぎ", "仙台", "sendai",
    "秋田", "akita", "あきた",
    "山形", "yamagata", "やまがた",
    "福島", "fukushima", "ふくしま",
  ],
  KANTO: [
    "関東", "kanto", "かんとう",
    "茨城", "ibaraki", "いばらき",
    "栃木", "tochigi", "とちぎ",
    "群馬", "gunma", "ぐんま",
    "埼玉", "saitama", "さいたま",
    "千葉", "chiba", "ちば",
    "東京", "tokyo", "とうきょう",
    "神奈川", "kanagawa", "かながわ", "横浜", "yokohama",
  ],
  CHUBU: [
    "中部", "chubu", "ちゅうぶ",
    "北陸", "hokuriku", "ほくりく",
    "甲信越", "甲信", "koshinetsu",
    "新潟", "niigata", "にいがた",
    "富山", "toyama", "とやま",
    "石川", "ishikawa", "いしかわ", "金沢", "kanazawa",
    "福井", "fukui", "ふくい",
    "山梨", "yamanashi", "やまなし",
    "長野", "nagano", "ながの",
    "岐阜", "gifu", "ぎふ",
    "静岡", "shizuoka", "しずおか",
    "愛知", "aichi", "あいち", "名古屋", "nagoya",
  ],
  KANSAI: [
    "関西", "kansai", "かんさい",
    "近畿", "kinki", "きんき",
    "三重", "mie", "みえ",
    "滋賀", "shiga", "しが",
    "京都", "kyoto", "きょうと",
    "大阪", "osaka", "おおさか",
    "兵庫", "hyogo", "ひょうご", "神戸", "kobe",
    "奈良", "nara", "なら",
    "和歌山", "wakayama", "わかやま",
    "灘", "伏見", "fushimi",
  ],
  CHUGOKU: [
    "中国地方", "chugoku", "ちゅうごく",
    "鳥取", "tottori", "とっとり",
    "島根", "shimane", "しまね",
    "岡山", "okayama", "おかやま",
    "広島", "hiroshima", "ひろしま",
    "山口", "yamaguchi", "やまぐち",
  ],
  SHIKOKU: [
    "四国", "shikoku", "しこく",
    "徳島", "tokushima", "とくしま",
    "香川", "kagawa", "かがわ",
    "愛媛", "ehime", "えひめ",
    "高知", "kochi", "こうち",
  ],
  KYUSHU_OKINAWA: [
    "九州", "kyushu", "きゅうしゅう",
    "沖縄", "okinawa", "おきなわ",
    "福岡", "fukuoka", "ふくおか",
    "佐賀", "saga", "さが",
    "長崎", "nagasaki", "ながさき",
    "熊本", "kumamoto", "くまもと",
    "大分", "oita", "おおいた",
    "宮崎", "miyazaki", "みやざき",
    "鹿児島", "kagoshima", "かごしま",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 世界地図キーワード辞書（国名・地域名・英語表記・ウイスキー産地通称を網羅）
// ─────────────────────────────────────────────────────────────────────────────
const WORLD_REGION_KEYWORDS: Record<WorldRegionId, readonly string[]> = {
  NORTH_AMERICA: [
    "北米", "アメリカ", "米国", "usa", "united states", "us",
    "カナダ", "canada",
    "メキシコ", "mexico",
    "バーボン", "bourbon", "ケンタッキー", "kentucky",
    "テネシー", "tennessee",
  ],
  SOUTH_AMERICA: [
    "南米", "南アメリカ",
    "チリ", "chile",
    "アルゼンチン", "argentina",
    "ブラジル", "brazil",
    "ウルグアイ", "uruguay",
    "ペルー", "peru",
    "コロンビア", "colombia",
    "ボリビア", "bolivia",
    "パラグアイ", "paraguay",
  ],
  EUROPE: [
    "欧州", "ヨーロッパ", "europe",
    "フランス", "france", "ボルドー", "bordeaux", "ブルゴーニュ", "burgundy",
    "シャンパーニュ", "champagne", "ローヌ", "rhone", "ロワール", "loire",
    "アルザス", "alsace", "プロヴァンス", "provence",
    "イタリア", "italy", "トスカーナ", "tuscany", "ピエモンテ", "piedmont",
    "シチリア", "sicily", "ヴェネト", "veneto",
    "スペイン", "spain", "リオハ", "rioja",
    "ポルトガル", "portugal",
    "ドイツ", "germany", "ライン", "rhine", "モーゼル", "mosel",
    "イギリス", "uk", "england", "britain",
    "スコットランド", "scotland", "スコッチ", "scotch",
    "アイルランド", "ireland", "アイリッシュ", "irish",
    "オーストリア", "austria",
    "スイス", "switzerland",
    "ギリシャ", "greece",
    "ハンガリー", "hungary",
    "チェコ", "czech",
    "ポーランド", "poland",
    "ルーマニア", "romania",
    "クロアチア", "croatia",
    "スロベニア", "slovenia",
    "北欧", "スウェーデン", "sweden", "デンマーク", "denmark",
    "ノルウェー", "norway", "フィンランド", "finland",
  ],
  AFRICA_MIDDLE_EAST: [
    "南アフリカ", "south africa",
    "アフリカ", "africa",
    "モロッコ", "morocco",
    "チュニジア", "tunisia",
    "エジプト", "egypt",
    "エチオピア", "ethiopia",
    "ケニア", "kenya",
    "トルコ", "turkey",
    "イスラエル", "israel",
    "レバノン", "lebanon",
    "ヨルダン", "jordan",
    "中東", "サウジアラビア", "saudi",
    "アラブ", "arab",
    "イラン", "iran",
  ],
  ASIA: [
    "日本", "japan",
    "中国", "china", "中華",
    "台湾", "taiwan",
    "韓国", "korea",
    "香港", "hong kong",
    "インド", "india",
    "タイ", "thailand",
    "ベトナム", "vietnam",
    "シンガポール", "singapore",
    "マレーシア", "malaysia",
    "インドネシア", "indonesia",
    "フィリピン", "philippines",
    "ミャンマー", "myanmar",
    "カンボジア", "cambodia",
    "スリランカ", "sri lanka",
    "ネパール", "nepal",
    "パキスタン", "pakistan",
    "アジア", "asia",
  ],
  OCEANIA: [
    "オセアニア", "oceania",
    "オーストラリア", "australia",
    "ニュージーランド", "new zealand",
    "フィジー", "fiji",
    "パプアニューギニア", "papua",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 正規化ヘルパー
// ─────────────────────────────────────────────────────────────────────────────
function normalizeOrigin(origin: string): string {
  return origin
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    // 全角英数字→半角、全角スペース→半角
    .replace(/　/g, " ");
}

function includesAnyKeyword(origin: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => origin.includes(keyword.toLowerCase().normalize("NFKC")));
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
