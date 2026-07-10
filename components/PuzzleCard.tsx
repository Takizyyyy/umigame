import Link from "next/link";
import type { PuzzleMeta } from "@/lib/types";
import ProgressBadge from "./ProgressBadge";

// 問題一覧カード(ジャンルページで使う)
export default function PuzzleCard({ puzzle }: { puzzle: PuzzleMeta }) {
  return (
    <Link
      href={`/play/${puzzle.id}`}
      className="block rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md hover:shadow-amber-100 active:translate-y-0 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">{puzzle.title}</span>
        <span className="text-sm text-amber-600">
          {"★".repeat(puzzle.difficulty)}
          <span className="text-amber-200">
            {"★".repeat(3 - puzzle.difficulty)}
          </span>
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-stone-500">
        {puzzle.question}
      </p>
      <div className="mt-2">
        <ProgressBadge puzzleId={puzzle.id} />
      </div>
    </Link>
  );
}
