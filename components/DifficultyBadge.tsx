// むずかしさを一目で分かるラベルで表示する。
// 色はアクセント(琥珀)の濃さで段階を表す
const LEVELS: Record<number, { label: string; className: string }> = {
  1: { label: "やさしい", className: "border border-stone-200 text-stone-500" },
  2: { label: "ふつう", className: "bg-amber-100 text-amber-800" },
  3: { label: "むずかしい", className: "bg-amber-600 text-white" },
};

export default function DifficultyBadge({ level }: { level: number }) {
  const d = LEVELS[level] ?? LEVELS[2];
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${d.className}`}
    >
      {d.label}
    </span>
  );
}
