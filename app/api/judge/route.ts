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

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    const res: JudgeResponse = {
      verdict: "unclear",
      comment: "少し急ぎすぎ! ひと呼吸おいてから質問してね",
    };
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
        comment,
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
      comment,
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
    // AI側のエラー(レート制限・障害など)はゲームを止めず流す
    console.error("judge failed:", e);
    const res: JudgeResponse =
      body.action === "answer"
        ? {
            verdict: "wrong",
            comment: "今ちょっと混み合ってるみたい。少し待ってもう一度!",
          }
        : {
            verdict: "unclear",
            comment: "今ちょっと混み合ってるみたい。少し待ってもう一度!",
          };
    return Response.json(res);
  }
}
