import Link from "next/link";

// 存在しないURLにアクセスしたときのページ
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-amber-50 px-4 py-20 text-center text-stone-800">
      <p className="text-5xl">🍜</p>
      <h1 className="mt-4 text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-stone-500">
        このスープは売り切れみたい。別の問題をどうぞ!
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-sm shadow-amber-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-200 active:translate-y-0 active:scale-[0.99]"
      >
        ホームへもどる
      </Link>
    </div>
  );
}
