import Link from "next/link";
import type { PuzzleMeta } from "@/lib/types";
import ProgressBadge from "./ProgressBadge";
import DifficultyBadge from "./DifficultyBadge";

// 問題一覧の1行(ジャンルページで使う)。ヘアラインで区切るリスト形式
export default function PuzzleCard({ puzzle }: { puzzle: PuzzleMeta }) {
  return (
    <Link
      href={`/play/${puzzle.id}`}
      className="group block px-1 py-5 transition-colors hover:bg-stone-100/60"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold tracking-tight text-stone-900 transition-transform duration-300 group-hover:translate-x-1">
          {puzzle.title}
        </span>
        <DifficultyBadge level={puzzle.difficulty} />
      </div>
      <p className="mt-1.5 line-clamp-1 text-sm text-stone-500">
        {puzzle.question}
      </p>
      <div className="mt-2 empty:hidden">
        <ProgressBadge puzzleId={puzzle.id} />
      </div>
    </Link>
  );
}
