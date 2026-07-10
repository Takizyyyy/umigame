import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuzzleMetas } from "@/lib/puzzles";
import { GENRES, getGenreBySlug } from "@/lib/genres";
import PuzzleCard from "@/components/PuzzleCard";
import Reveal from "@/components/Reveal";
import GenreIcon from "@/components/GenreIcon";

// 5ジャンル分を静的生成
export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);
  if (!genre) return {};
  return {
    title: `${genre.name}の問題 | うんちくウミガメのスープ`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);
  if (!genre) notFound();

  const puzzles = getPuzzleMetas()
    .filter((p) => p.genre === genre.name)
    .sort((a, b) => a.difficulty - b.difficulty);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Reveal>
        <Link
          href="/"
          className="text-sm text-stone-400 transition hover:text-stone-900"
        >
          ← ホーム
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100/70 text-amber-800">
            <GenreIcon slug={genre.slug} size={28} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {genre.name}
          </h1>
        </div>
        <p className="mt-3 text-stone-500">
          {genre.description}
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
