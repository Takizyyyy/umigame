import Link from "next/link";
import Logo from "@/components/Logo";

// 存在しないURLにアクセスしたときのページ
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <div className="text-stone-300">
        <Logo size={48} />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        ページが見つかりません
      </h1>
      <p className="mt-3 text-sm text-stone-500">
        このスープは売り切れみたい。別の問題をどうぞ。
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-stone-900 px-8 py-3.5 font-bold text-white transition-colors hover:bg-stone-700"
      >
        ホームへもどる
      </Link>
    </div>
  );
}
