import Link from "next/link";
import { getPuzzleMetas } from "@/lib/puzzles";
import { GENRES } from "@/lib/genres";
import RandomPickButton from "./RandomPickButton";
import ClearCount from "@/components/ClearCount";

export default function Home() {
  const puzzles = getPuzzleMetas();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="text-center">
        <p className="text-5xl">🍲</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          ウンチクのスープ
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          答えが「うんちく」になっている水平思考クイズ
        </p>

        <RandomPickButton ids={puzzles.map((p) => p.id)} />
        <ClearCount total={puzzles.length} />
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-bold">ジャンルからえらぶ</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GENRES.map((genre) => {
            const count = puzzles.filter(
              (p) => p.genre === genre.name
            ).length;
            return (
              <Link
                key={genre.slug}
                href={`/genre/${genre.slug}`}
                className="block rounded-xl border border-amber-200 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md hover:shadow-amber-100 active:translate-y-0 active:scale-[0.99]"
              >
                <p className="text-3xl">{genre.emoji}</p>
                <p className="mt-1 font-bold">{genre.name}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {genre.description}
                </p>
                <p className="mt-1 text-xs text-amber-600">{count}問</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-amber-200 bg-white p-5 text-sm leading-6">
        <h2 className="font-bold text-amber-700">あそびかた</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>不思議な状況の問題文を読む</li>
          <li>「はい / いいえ」で答えられる質問をAIにぶつける</li>
          <li>真相を言い当てたらクリア! 正体は思わず話したくなる雑学</li>
        </ol>
      </section>

      <Link
        href="/about"
        className="mt-8 block rounded-xl border border-amber-200 bg-white p-4 text-center text-sm text-amber-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md hover:shadow-amber-100 active:translate-y-0 active:scale-[0.99]"
      >
        ⚙️ このサイトの仕組みを見る →
      </Link>
    </div>
  );
}
