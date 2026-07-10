"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { PuzzleMeta } from "@/lib/types";
import DifficultyBadge from "./DifficultyBadge";

// 今日の日付(端末のローカル時刻)。サーバーでは null を返して
// ハイドレーション不一致を避け、クライアントで日付が入ってから表示する
function useTodayKey() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const d = new Date();
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },
    () => null
  );
}

// 日付文字列から問題を1つ決める(同じ日は必ず同じ問題になる)
function pickIndex(dateKey: string, length: number) {
  let hash = 0;
  for (const ch of dateKey) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
  }
  return hash % length;
}

// 日替わりの「今日の1問」パネル
export default function DailyPick({ puzzles }: { puzzles: PuzzleMeta[] }) {
  const todayKey = useTodayKey();
  if (!todayKey || puzzles.length === 0) return null;

  const puzzle = puzzles[pickIndex(todayKey, puzzles.length)];

  return (
    <Link
      href={`/play/${puzzle.id}`}
      className="group block rounded-2xl bg-amber-50 p-6 transition hover:bg-amber-100/70"
    >
      <p className="text-[11px] font-bold tracking-widest text-amber-700">
        今日の1問
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-lg font-bold tracking-tight text-stone-900">
          {puzzle.title}
        </span>
        <span className="text-xs text-stone-400">{puzzle.genre}</span>
        <DifficultyBadge level={puzzle.difficulty} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-600">
        {puzzle.question}
      </p>
      <p className="mt-3 text-sm font-medium text-amber-700">
        挑戦する{" "}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </p>
    </Link>
  );
}
