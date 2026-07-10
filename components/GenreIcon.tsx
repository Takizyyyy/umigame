import {
  ChatCircleText,
  Bank,
  Flask,
  ChartLineUp,
  ForkKnife,
} from "@phosphor-icons/react/dist/ssr";

// ジャンルごとのアイコン。ロゴと同じ「細い線画」のトーンで揃える
const ICONS = {
  words: ChatCircleText,
  history: Bank,
  science: Flask,
  society: ChartLineUp,
  food: ForkKnife,
} as const;

export default function GenreIcon({
  slug,
  size = 22,
}: {
  slug: string;
  size?: number;
}) {
  const Icon = ICONS[slug as keyof typeof ICONS] ?? ChatCircleText;
  return <Icon size={size} weight="light" aria-hidden="true" />;
}
