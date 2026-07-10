"use client";

import { useSyncExternalStore } from "react";
import { readProgress, subscribeToProgress } from "@/lib/progress";

// クリア状況の小さいバッジ。
// localStorage(外部ストア)を useSyncExternalStore で購読する。
// サーバー側は必ず null を返す(getServerSnapshot)ことで、
// ハイドレーション不一致エラーを起こさずにクライアントの値へ切り替えられる
export default function ProgressBadge({ puzzleId }: { puzzleId: string }) {
  const status = useSyncExternalStore(
    subscribeToProgress,
    () => readProgress()[puzzleId]?.status ?? null,
    () => null
  );

  if (status === "cleared") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
        ✅ クリア
      </span>
    );
  }
  if (status === "revealed") {
    return (
      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-500">
        👀 真相を見た
      </span>
    );
  }
  return null;
}
