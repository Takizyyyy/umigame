import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuzzleMeta } from "@/lib/puzzles";
import PlayClient from "./PlayClient";

// タブタイトルを問題名にする(問題文は公開情報なので冒頭を説明文に使ってよい)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = getPuzzleMeta(id);
  if (!meta) return {};
  return {
    title: `${meta.title} | うんちくウミガメのスープ`,
    description: meta.question.slice(0, 60),
  };
}

// サーバー側で問題情報(真相を含まないメタ情報のみ)を取り出して
// クライアントコンポーネントに渡す
export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = getPuzzleMeta(id);
  if (!meta) notFound();

  return <PlayClient meta={meta} />;
}
