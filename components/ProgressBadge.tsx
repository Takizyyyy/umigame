"use client";

import { useSyncExternalStore } from "react";
import { readProgress, subscribeToProgress } from "@/lib/progress";

// クリア状況の小さいバッジ。
// localStorage(外部ストア)を useSyncExternalStore で購読する。
// サーバー側は必ず null を返す(getServerSnapshot)ことで、
// ハイドレーション不一致エラーを起こさずにクライアントの値へ切り替えられる
// この端末に遊びかけのログ(localStorage)があるか。
// サーバー側は必ず false(getServerSnapshot)にしてハイドレーション不一致を避ける
function readPlaying(puzzleId: string): boolean {
  try {
    const raw = localStorage.getItem(`umigame-play:${puzzleId}`);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    return Array.isArray(saved.messages) && saved.messages.length > 1 && !saved.result;
  } catch {
    return false;
  }
}

export default function ProgressBadge({ puzzleId }: { puzzleId: string }) {
  const status = useSyncExternalStore(
    subscribeToProgress,
    () => readProgress()[puzzleId]?.status ?? null,
    () => null
  );
  const playing = useSyncExternalStore(
    // 表示中に他タブでの更新まで追う必要はないため購読は空でよい(表示のたびに読み直す)
    () => () => {},
    () => readPlaying(puzzleId),
    () => false
  );

  if (status === "cleared") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden="true" />
        クリア済み
      </span>
    );
  }
  if (status === "revealed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-400">
        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" aria-hidden="true" />
        真相を見た
      </span>
    );
  }
  if (playing) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        つづきから
      </span>
    );
  }
  return null;
}
