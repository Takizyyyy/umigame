"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ContinueEntry = {
  id: string;
  title: string;
  questionCount: number;
};

// localStorageの "umigame-play:" キーを全部見て、
// 遊びかけ(メッセージが2件以上あり、まだ結果が出ていない)のものを
// updatedAtが一番新しい1件だけ選ぶ
function findLatestContinue(): ContinueEntry | null {
  let latest: (ContinueEntry & { updatedAt: number }) | null = null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("umigame-play:")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved.messages) || saved.messages.length <= 1 || saved.result) {
        continue;
      }
      const updatedAt = saved.updatedAt ?? 0;
      if (!latest || updatedAt > latest.updatedAt) {
        latest = {
          id: key.slice("umigame-play:".length),
          title: saved.title ?? "",
          questionCount: saved.questionCount ?? 0,
          updatedAt,
        };
      }
    }
  } catch {
    // 保存データが壊れていたら「なし」として扱う
  }
  return latest;
}

// ホームに出す「つづきから」導線。
// サーバー側ではlocalStorageを読めないため、初回レンダリングはnullにしておき、
// マウント後(クライアントのみ)にuseEffectで読んでハイドレーション不一致を避ける
export default function ContinueCard() {
  const [entry, setEntry] = useState<ContinueEntry | null>(null);

  useEffect(() => {
    setEntry(findLatestContinue());
  }, []);

  if (!entry) return null;

  return (
    <Link
      href={`/play/${entry.id}`}
      className="group block rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-stone-400"
    >
      <p className="text-lg font-bold tracking-tight text-stone-900 transition-transform duration-300 group-hover:translate-x-1">
        ▶ つづきから: {entry.title}
      </p>
      <p className="mt-2 text-sm text-stone-500">
        質問 {entry.questionCount}/30
      </p>
    </Link>
  );
}
