import Link from "next/link";
import { getPuzzleMetas } from "@/lib/puzzles";

export default function Home() {
  const puzzles = getPuzzleMetas();

  return (
    <div className="flex-1 bg-amber-50 text-stone-800">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <header className="text-center">
          <p className="text-4xl">🍲</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            ウンチクのスープ
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            答えが「うんちく」になっている水平思考クイズ
          </p>
        </header>

        <section className="mt-8 rounded-xl border border-amber-200 bg-white p-5 text-sm leading-6">
          <h2 className="font-bold text-amber-700">あそびかた</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>不思議な状況の問題文を読む</li>
            <li>「はい / いいえ」で答えられる質問をAIにぶつける</li>
            <li>真相を言い当てたらクリア! 正体は思わず話したくなる雑学</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold">問題をえらぶ</h2>
          <ul className="mt-3 space-y-3">
            {puzzles.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/play/${p.id}`}
                  className="block rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{p.title}</span>
                    <span className="text-sm text-amber-600">
                      {"★".repeat(p.difficulty)}
                      <span className="text-amber-200">
                        {"★".repeat(3 - p.difficulty)}
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-500">
                    {p.question}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
