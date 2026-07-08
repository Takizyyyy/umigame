// AIの判定結果(5分類)
export type Verdict = "yes" | "no" | "irrelevant" | "correct" | "unclear";

// クライアントに渡してよい問題情報(真相を含まない)
export type PuzzleMeta = {
  id: string;
  title: string;
  difficulty: number; // 1〜3
  question: string;
};

// サーバー内でだけ扱う完全な問題情報
export type Puzzle = PuzzleMeta & {
  truth: string; // 真相(=うんちく)
  keyPoints: string[]; // 正解判定に使う要点
  trivia: string; // クリア後に表示する解説
};

export type JudgeRequest = {
  puzzleId: string;
  message?: string;
  questionCount: number;
  giveUp?: boolean;
};

export type JudgeResponse = {
  // "reveal" はギブアップ時(判定ではなく真相開示)
  verdict: Verdict | "reveal";
  comment?: string;
  // correct / reveal のときだけ真相が入る
  reveal?: { truth: string; trivia: string };
};
