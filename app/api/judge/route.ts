import { getPuzzle } from "@/lib/puzzles";
import type { JudgeRequest, JudgeResponse } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 200;
const MAX_QUESTIONS = 30;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as JudgeRequest | null;

  // 入力検証(不正なリクエストは400で弾く)
  if (!body || typeof body.puzzleId !== "string") {
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
  if (body.giveUp) {
    const res: JudgeResponse = {
      verdict: "reveal",
      reveal: { truth: puzzle.truth, trivia: puzzle.trivia },
    };
    return Response.json(res);
  }

  if (
    typeof body.message !== "string" ||
    body.message.trim().length === 0 ||
    body.message.length > MAX_MESSAGE_LENGTH
  ) {
    return Response.json({ error: "invalid message" }, { status: 400 });
  }

  // TODO(Day 4-5): ここを lib/ai.ts のAI判定に差し替える。
  // それまでは常に unclear を返すモック。
  const res: JudgeResponse = {
    verdict: "unclear",
    comment: "(AI未接続のモック応答です)",
  };
  return Response.json(res);
}
