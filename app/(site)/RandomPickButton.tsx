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
      className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-center font-bold text-white shadow-sm shadow-amber-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-200 active:translate-y-0 active:scale-[0.99]"
    >
      🎲 ランダムに1問
    </button>
  );
}
