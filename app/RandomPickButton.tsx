"use client";

import { useRouter } from "next/navigation";

// 一覧からランダムに1問選んで遷移するだけの小さなクライアントコンポーネント
export default function RandomPickButton({ ids }: { ids: string[] }) {
  const router = useRouter();

  function handleClick() {
    const id = ids[Math.floor(Math.random() * ids.length)];
    router.push(`/play/${id}`);
  }

  return (
    <button
      onClick={handleClick}
      className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-center font-bold text-white transition hover:bg-amber-600"
    >
      🎲 ランダムに1問
    </button>
  );
}
