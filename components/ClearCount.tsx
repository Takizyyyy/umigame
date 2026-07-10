"use client";

import { useSyncExternalStore } from "react";
import { readProgress, subscribeToProgress } from "@/lib/progress";

function countCleared() {
  return Object.values(readProgress()).filter((p) => p.status === "cleared")
    .length;
}

// 全問題数に対するクリア数の表示。
// localStorage(外部ストア)を useSyncExternalStore で購読する。
// サーバー側は 0 を返し、クライアントで実際のクリア数に切り替わる
export default function ClearCount({ total }: { total: number }) {
  const clearedCount = useSyncExternalStore(
    subscribeToProgress,
    countCleared,
    () => 0
  );

  if (clearedCount === 0) return null;

  return (
    <p className="text-sm text-stone-500">
      クリア {clearedCount} <span className="text-stone-300">/</span> {total}
    </p>
  );
}
