// むずかしさの定義(URLスラッグ・表示名・説明)
export const LEVELS = [
  {
    slug: "easy",
    level: 1,
    label: "やさしい",
    description: "はじめての人向け。すんなり気持ちよく解ける",
  },
  {
    slug: "normal",
    level: 2,
    label: "ふつう",
    description: "ちょうどいい歯ごたえ。ひらめきがカギ",
  },
  {
    slug: "hard",
    level: 3,
    label: "むずかしい",
    description: "発想の転換が試される骨太の問題",
  },
] as const;

export type LevelDef = (typeof LEVELS)[number];

export function getLevelBySlug(slug: string): LevelDef | undefined {
  return LEVELS.find((l) => l.slug === slug);
}
