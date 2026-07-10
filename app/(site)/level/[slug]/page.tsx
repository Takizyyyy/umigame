import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuzzleMetas } from "@/lib/puzzles";
import { LEVELS, getLevelBySlug } from "@/lib/levels";
import { GENRES } from "@/lib/genres";
import PuzzleCard from "@/components/PuzzleCard";
import Reveal from "@/components/Reveal";
import DifficultyBadge from "@/components/DifficultyBadge";

// 3段階分を静的生成
export function generateStaticParams() {
  return LEVELS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const level = getLevelBySlug(slug);
  if (!level) return {};
  return {
    title: `${level.label}の問題 | うんちくウミガメのスープ`,
  };
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const level = getLevelBySlug(slug);
  if (!level) notFound();

  // 同じ難易度の中はジャンル順で並べる
  const genreOrder = GENRES.map((g) => g.name as string);
  const puzzles = getPuzzleMetas()
    .filter((p) => p.difficulty === level.level)
    .sort(
      (a, b) => genreOrder.indexOf(a.genre) - genreOrder.indexOf(b.genre)
    );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Reveal>
        <Link
          href="/"
          className="text-sm text-stone-400 transition hover:text-stone-900"
        >
          ← ホーム
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {level.label}
          </h1>
          <DifficultyBadge level={level.level} />
        </div>
        <p className="mt-3 text-stone-500">
          {level.description}
          <span className="ml-3 text-sm text-stone-400">
            全{puzzles.length}問
          </span>
        </p>
      </Reveal>

      <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
        {puzzles.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <PuzzleCard puzzle={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
