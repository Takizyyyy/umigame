"use client";

import { useRouter } from "next/navigation";

// 「← もどる」ボタン: 直前のページ(プレイ中の問題など)へ戻る。
// ブックマーク等で直接開かれて履歴がないときはホームへ
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="text-sm text-stone-400 transition hover:text-stone-900"
    >
      ← もどる
    </button>
  );
}
