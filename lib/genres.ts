// ジャンル定義。ホームのジャンルカードとジャンルページで使う。
// name は lib/types.ts の Genre 型の値と一致させること。
export const GENRES = [
  {
    slug: "words",
    name: "ことば",
    emoji: "💬",
    description: "語源や言葉の由来のうんちく",
  },
  {
    slug: "history",
    name: "歴史",
    emoji: "🏛️",
    description: "歴史の意外な裏側",
  },
  {
    slug: "science",
    name: "科学・技術",
    emoji: "🔬",
    description: "科学と技術のへぇ〜な話",
  },
  {
    slug: "society",
    name: "社会・経済",
    emoji: "🏙️",
    description: "制度やビジネスのからくり",
  },
  {
    slug: "food",
    name: "食・文化",
    emoji: "🍽️",
    description: "食と文化の不思議",
  },
] as const;

export type GenreInfo = (typeof GENRES)[number];

// slugからジャンル情報を探す(見つからなければundefined)
export function getGenreBySlug(slug: string): GenreInfo | undefined {
  return GENRES.find((g) => g.slug === slug);
}
