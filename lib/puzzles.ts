// 問題データの読み込み。このファイルはサーバー側専用。
// ※クライアントコンポーネントから import しないこと(真相が漏れるため)
import puzzlesData from "@/data/puzzles.json";
import type { Puzzle, PuzzleMeta } from "@/lib/types";

const puzzles = puzzlesData as Puzzle[];

// 一覧表示用: 真相を含まない情報だけ返す
export function getPuzzleMetas(): PuzzleMeta[] {
  return puzzles.map(({ id, title, difficulty, question }) => ({
    id,
    title,
    difficulty,
    question,
  }));
}

export function getPuzzleMeta(id: string): PuzzleMeta | undefined {
  return getPuzzleMetas().find((p) => p.id === id);
}

// 判定API用: 真相を含む完全なデータ(サーバー内でのみ使う)
export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}
