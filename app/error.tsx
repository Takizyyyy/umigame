"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

// 想定外のエラーで画面が真っ白になるのを防ぐバウンダリ。
// Next.jsの規約で error.tsx はクライアントコンポーネントである必要がある
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <div className="text-stone-300">
        <Logo size={48} />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        エラーが起きました
      </h1>
      <p className="mt-3 text-sm text-stone-500">
        一時的な不具合かもしれません。もう一度お試しください。
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-stone-900 px-8 py-3.5 font-bold text-white transition-colors hover:bg-stone-700"
        >
          もう一度試す
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-200 px-8 py-3.5 font-bold text-stone-700 transition-colors hover:bg-stone-50"
        >
          ホームへもどる
        </Link>
      </div>
    </div>
  );
}
