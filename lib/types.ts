// AIの判定結果(5分類、質問モード用)
export type Verdict = "yes" | "no" | "irrelevant" | "correct" | "unclear";

// 解答モード用の判定(真相の説明そのものを採点する)
export type AnswerVerdict = "correct" | "close" | "wrong";

// 問題のジャンル
export type Genre = "ことば" | "歴史" | "科学・技術" | "社会・経済" | "食・文化";

// クライアントに渡してよい問題情報(真相・ヒント・出典を含まない)
export type PuzzleMeta = {
  id: string;
  title: string;
  difficulty: number; // 1〜3
  question: string;
  genre: Genre;
  hintCount: number; // 用意されているヒントの数(内容は含まない)
};

// サーバー内でだけ扱う完全な問題情報
// (hintCount は PuzzleMeta 作成時に hints.length から計算するので、ここでは持たない)
export type Puzzle = Omit<PuzzleMeta, "hintCount"> & {
  truth: string; // 真相(=うんちく)
  keyPoints: string[]; // 正解判定に使う要点
  trivia: string; // クリア後に表示する解説
  hints: string[]; // ヒント(3件、サーバー側のみ)
  sources: { title: string; url: string }[]; // 出典(サーバー側のみ)
};

export type JudgeAction = "question" | "answer" | "hint" | "giveup";

export type JudgeRequest = {
  puzzleId: string;
  action: JudgeAction;
  text?: string; // question / answer のときの入力文
  hintIndex?: number; // hint のとき、0〜2で何番目のヒントか
  questionCount: number; // 質問+解答の合計回数(上限判定に使う)
};

export type JudgeResponse = {
  // "reveal" はギブアップ・正解時(判定ではなく真相開示)
  verdict?: Verdict | AnswerVerdict | "reveal";
  comment?: string;
  // AI側が混雑・上限で判定できなかったとき true
  // (誤った「不正解」表示や質問回数の消費をさせないための区別)
  busy?: boolean;
  // correct / reveal のときだけ真相が入る
  reveal?: {
    truth: string;
    trivia: string;
    sources: { title: string; url: string }[];
  };
  // action: "hint" のときだけ入る
  hint?: string;
};
