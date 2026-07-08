import { notFound } from "next/navigation";
import { getPuzzleMeta } from "@/lib/puzzles";
import PlayClient from "./PlayClient";

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
