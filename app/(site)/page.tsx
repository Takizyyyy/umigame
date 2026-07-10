import Link from "next/link";
import { getPuzzleMetas } from "@/lib/puzzles";
import { GENRES } from "@/lib/genres";
import RandomPickButton from "./RandomPickButton";
import ClearCount from "@/components/ClearCount";
import Reveal from "@/components/Reveal";
import AnimatedLogo from "@/components/AnimatedLogo";
import GenreIcon from "@/components/GenreIcon";

export default function Home() {
  const puzzles = getPuzzleMetas();

  return (
    <div className="mx-auto max-w-3xl px-5">
      {/* ヒーロー */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20">
        <Reveal>
          <div className="text-stone-900">
            <AnimatedLogo size={56} />
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            答えは、
            <br />
            思わず話したくなる
            <span className="inline-block">実話。</span>
          </h1>
          <p className="mt-5 max-w-[38ch] text-base leading-8 text-stone-500">
            AIの出題者に「はい/いいえ」で質問して、不思議な状況の真相を推理する水平思考クイズ。全{puzzles.length}問、すべて出典つきのうんちくです。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <RandomPickButton ids={puzzles.map((p) => p.id)} />
            <Link
              href="/howto"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-900"
            >
              あそびかたを見る →
            </Link>
          </div>
          <div className="mt-4 empty:hidden">
            <ClearCount total={puzzles.length} />
          </div>
        </Reveal>
      </section>

      {/* ジャンル */}
      <section className="border-t border-stone-200 py-14 sm:py-16">
        <Reveal>
          <h2 className="text-xl font-bold tracking-tight">
            ジャンルからえらぶ
          </h2>
        </Reveal>
        <div className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
          {GENRES.map((genre, i) => {
            const count = puzzles.filter((p) => p.genre === genre.name).length;
            return (
              <Reveal key={genre.slug} delay={i * 0.05}>
                <Link
                  href={`/genre/${genre.slug}`}
                  className="group flex items-center justify-between gap-4 px-1 py-5 transition-colors hover:bg-stone-100/60"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100/70 text-amber-800">
                      <GenreIcon slug={genre.slug} />
                    </span>
                    <div>
                      <p className="text-lg font-bold tracking-tight text-stone-900 transition-transform duration-300 group-hover:translate-x-1">
                        {genre.name}
                      </p>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {genre.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm text-stone-400">
                    <span>{count}問</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* あそびかた(要約) */}
      <section className="border-t border-stone-200 py-14 sm:py-16">
        <Reveal>
          <h2 className="text-xl font-bold tracking-tight">あそびかた</h2>
        </Reveal>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              n: "1",
              title: "問題文を読む",
              body: "書かれているのは不思議な「結果」だけ。",
            },
            {
              n: "2",
              title: "AIに質問する",
              body: "「はい/いいえ」で答えられる質問で真相に近づく。",
            },
            {
              n: "3",
              title: "真相を言い当てる",
              body: "正解すると、出典つきのうんちくが読める。",
            },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <p className="text-sm text-stone-300">{step.n}</p>
              <h3 className="mt-2 font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                {step.body}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link
            href="/howto"
            className="mt-8 inline-block text-sm font-medium text-stone-500 transition hover:text-stone-900"
          >
            くわしいあそびかた・質問のコツ →
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
