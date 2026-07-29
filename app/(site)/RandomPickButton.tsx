"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { readProgress } from "@/lib/progress";

// 一覧からランダムに1問選んで遷移するボタン。
// PlayClientの「つぎの問題へ」と同じ考え方で、未挑戦の問題があればその中から選ぶ
// (クリア済み・真相を見た問題ばかり引いて損した気分にさせないため)。
// 全問挑戦済みなら、そのときだけ全体からランダムに選ぶ
export default function RandomPickButton({ ids }: { ids: string[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  function handleClick() {
    const progress = readProgress();
    const untried = ids.filter((id) => !progress[id]);
    const pool = untried.length > 0 ? untried : ids;
    const id = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/play/${id}`);
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="rounded-full bg-stone-900 px-8 py-3.5 font-bold text-white transition-colors hover:bg-stone-700"
    >
      ランダムに1問あそぶ
    </motion.button>
  );
}
