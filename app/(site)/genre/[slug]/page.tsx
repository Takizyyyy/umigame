import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuzzleMetas } from "@/lib/puzzles";
import { GENRES, getGenreBySlug } from "@/lib/genres";
import PuzzleCard from "@/components/PuzzleCard";

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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-amber-600 hover:underline">
        ← ホームへ
      </Link>

      <header className="mt-4 text-center">
        <p className="text-5xl">{genre.emoji}</p>
        <h1 className="mt-3 text-2xl font-bold">{genre.name}</h1>
        <p className="mt-2 text-sm text-stone-500">{genre.description}</p>
        <p className="mt-1 text-xs text-stone-400">全{puzzles.length}問</p>
      </header>

      <ul className="mt-8 space-y-3">
        {puzzles.map((p) => (
          <li key={p.id}>
            <PuzzleCard puzzle={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
