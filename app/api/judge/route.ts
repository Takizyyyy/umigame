import { judge, judgeAnswer } from "@/lib/ai";
import { getPuzzle } from "@/lib/puzzles";
import type { JudgeRequest, JudgeResponse } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 200;
const MAX_QUESTIONS = 30;

// 簡易レート制限: 同一IPから60秒に20回まで
// (サーバーレスではインスタンスごとのメモリなので完全ではないが、
//  連打や単純な悪用への抑止としては十分。個人デモの割り切り)
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

// commentの長さ・「真相を書かない」はプロンプト指示だけで守らせている(lib/ai.ts)。
// プロンプトインジェクションで指示が破られた場合の保険として、correct以外は
// サーバー側でも強制的に短く切り詰め、真相の全文がcommentに漏れないようにする
const MAX_COMMENT_LENGTH = 40;
function safeComment(comment: string | undefined, isCorrect: boolean): string | undefined {
  if (!comment || isCorrect || comment.length <= MAX_COMMENT_LENGTH) return comment;
  return comment.slice(0, MAX_COMMENT_LENGTH) + "…";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
}

// ブラウザからの同一オリジンfetchは自動でOriginヘッダーを付けるため、
// これが無い/自サイトと違うリクエストは弾く。ヘッダーは詐称できるので
// 本気の攻撃者は防げないが、雑なスクリプト・外部からの直叩きボットは止まる
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    // busyとして返す(verdictとして返すとクライアントが通常の判定と誤解し、
    // 解答モードでは「不正解」表示・質問回数の消費が起きてしまう)
    const res: JudgeResponse = { busy: true };
    return Response.json(res);
  }

  const body = (await request.json().catch(() => null)) as JudgeRequest | null;

  // 入力検証(不正なリクエストは400で弾く)
  if (
    !body ||
    typeof body.puzzleId !== "string" ||
    !["question", "answer", "hint", "giveup"].includes(body.action)
  ) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  const puzzle = getPuzzle(body.puzzleId);
  if (!puzzle) {
    return Response.json({ error: "puzzle not found" }, { status: 400 });
  }
  // この上限はクライアント申告のquestionCountを信じているだけで、直接APIを
  // 叩けば回避できる(不正な値の形式チェックのみ)。真相はどのみち"giveup"で
  // いつでも取得できる設計なので、これはチート対策ではなくUIの誤動作防止の割り切り
  if (
    typeof body.questionCount !== "number" ||
    body.questionCount < 0 ||
    body.questionCount > MAX_QUESTIONS
  ) {
    return Response.json({ error: "too many questions" }, { status: 400 });
  }

  // ギブアップ: 真相とうんちくを返す(AIは使わない)
  if (body.action === "giveup") {
    const res: JudgeResponse = {
      verdict: "reveal",
      reveal: {
        truth: puzzle.truth,
        trivia: puzzle.trivia,
        sources: puzzle.sources,
      },
    };
    return Response.json(res);
  }

  // ヒント: hintIndex(0〜2)だけ検証して、該当のヒント文を返す(AIは使わない)
  if (body.action === "hint") {
    if (
      typeof body.hintIndex !== "number" ||
      !Number.isInteger(body.hintIndex) ||
      body.hintIndex < 0 ||
      body.hintIndex >= puzzle.hints.length
    ) {
      return Response.json({ error: "invalid hintIndex" }, { status: 400 });
    }
    const res: JudgeResponse = { hint: puzzle.hints[body.hintIndex] };
    return Response.json(res);
  }

  // question / answer: 入力文を検証
  if (
    typeof body.text !== "string" ||
    body.text.trim().length === 0 ||
    body.text.length > MAX_MESSAGE_LENGTH
  ) {
    return Response.json({ error: "invalid message" }, { status: 400 });
  }

  try {
    if (body.action === "answer") {
      const { verdict, comment } = await judgeAnswer({
        question: puzzle.question,
        truth: puzzle.truth,
        keyPoints: puzzle.keyPoints,
        trivia: puzzle.trivia,
        playerMessage: body.text,
      });

      const res: JudgeResponse = {
        verdict,
        comment: safeComment(comment, verdict === "correct"),
        ...(verdict === "correct" && {
          reveal: {
            truth: puzzle.truth,
            trivia: puzzle.trivia,
            sources: puzzle.sources,
          },
        }),
      };
      return Response.json(res);
    }

    // action === "question"
    const { verdict, comment } = await judge({
      question: puzzle.question,
      truth: puzzle.truth,
      keyPoints: puzzle.keyPoints,
      trivia: puzzle.trivia,
      playerMessage: body.text,
    });

    const res: JudgeResponse = {
      verdict,
      comment: safeComment(comment, verdict === "correct"),
      // 正解のときだけ真相を開示する
      ...(verdict === "correct" && {
        reveal: {
          truth: puzzle.truth,
          trivia: puzzle.trivia,
          sources: puzzle.sources,
        },
      }),
    };
    return Response.json(res);
  } catch (e) {
    // AI側のエラー(レート制限・障害など)はゲームを止めず流す。
    // 以前は wrong/unclear として返していたが、それだと「残念、真相はそれじゃない」と
    // 誤った判定表示になり質問回数も消費してしまうため、busyとして区別する
    console.error("judge failed:", e);
    const res: JudgeResponse = { busy: true };
    return Response.json(res);
  }
}
