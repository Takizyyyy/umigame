"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

// 一覧からランダムに1問選んで遷移するボタン
export default function RandomPickButton({ ids }: { ids: string[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  function handleClick() {
    const id = ids[Math.floor(Math.random() * ids.length)];
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
