"use client";

import { motion, useReducedMotion } from "motion/react";

// ヒーロー用: ロゴの線がゆっくり描かれていくアニメーション
export default function AnimatedLogo({ size = 64 }: { size?: number }) {
  const reduce = useReducedMotion();

  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration: 0.9, delay, ease: "easeInOut" as const },
            opacity: { duration: 0.15, delay },
          },
        };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      {/* 器 → 湯気の「?」の順に描く */}
      <motion.path
        d="M7.5 29.5 H40.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        {...draw(0)}
      />
      <motion.path
        d="M10.5 29.5 a13.5 13.5 0 0 0 27 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        {...draw(0.25)}
      />
      <motion.path
        d="M19 44 h10"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        {...draw(0.5)}
      />
      <motion.path
        d="M19.5 10.5 a5 5 0 1 1 7.6 4.2 c-2.2 1.3 -3.1 2.2 -3.1 4.3"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.7)}
      />
      <motion.circle
        cx="24"
        cy="23.5"
        r="1.7"
        fill="currentColor"
        initial={reduce ? undefined : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.5, type: "spring", stiffness: 400, damping: 15 }}
      />
    </svg>
  );
}
