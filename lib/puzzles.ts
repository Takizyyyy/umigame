// 問題データの読み込み。このファイルはサーバー側専用。
// ※クライアントコンポーネントから import しないこと(真相が漏れるため)
// → server-only を import しておくことで、'use client' から読み込まれた瞬間に
//   ビルドエラーになり、コメントだけに頼らず機械的に守れるようにする
import "server-only";
import puzzlesData from "@/data/puzzles.json";
import type { Puzzle, PuzzleMeta } from "@/lib/types";

const puzzles = puzzlesData as Puzzle[];

// 真相・ヒント本文・出典を落として、一覧やプレイ画面に渡してよい情報だけにする
function toMeta({
  id,
  title,
  difficulty,
  question,
  genre,
  hints,
}: Puzzle): PuzzleMeta {
  return { id, title, difficulty, question, genre, hintCount: hints.length };
}

// 一覧表示用: 真相・ヒント・出典を含まない情報だけ返す
export function getPuzzleMetas(): PuzzleMeta[] {
  return puzzles.map(toMeta);
}

export function getPuzzleMeta(id: string): PuzzleMeta | undefined {
  // 先に該当の1問を探してから変換する(全件変換してから探す必要はない)
  const puzzle = puzzles.find((p) => p.id === id);
  return puzzle && toMeta(puzzle);
}

// 判定API用: 真相を含む完全なデータ(サーバー内でのみ使う)
export function getPuzzle(id: string): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}
