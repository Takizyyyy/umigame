"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JudgeResponse, PuzzleMeta } from "@/lib/types";
import { readProgress, saveProgress } from "@/lib/progress";

type ChatMessage = {
  role: "player" | "ai" | "hint";
  text: string;
};

// 判定結果(質問モード)を出題者のセリフに変換する
const VERDICT_TEXT: Record<string, string> = {
  yes: "はい!",
  no: "いいえ",
  irrelevant: "関係ありません",
  unclear: "うーん、「はい/いいえ」で答えられる質問にしてね",
};

const MAX_QUESTIONS = 30;
const MAX_HINTS = 3;

type Mode = "question" | "answer";

export default function PlayClient({ meta }: { meta: PuzzleMeta }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: "質問をどうぞ。「はい/いいえ」で答えられる形でね!" },
  ]);
  const [mode, setMode] = useState<Mode>("question");
  const [input, setInput] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [sending, setSending] = useState(false);
  // シェア文をコピーした直後のフィードバック表示用
  const [copied, setCopied] = useState(false);
  // 結果表示(正解 or ギブアップ)。null の間はプレイ中
  const [result, setResult] = useState<{
    kind: "correct" | "giveup";
    truth: string;
    trivia: string;
    sources: { title: string; url: string }[];
  } | null>(null);

  // 新しいメッセージが増えたらチャット欄を最下部までスクロール
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function callJudge(payload: {
    action: "question" | "answer" | "hint" | "giveup";
    text?: string;
    hintIndex?: number;
  }): Promise<JudgeResponse | null> {
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzleId: meta.id,
          questionCount,
          ...payload,
        }),
      });
      if (!res.ok) return null;
      return (await res.json()) as JudgeResponse;
    } catch {
      return null;
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || result) return;
    if (questionCount >= MAX_QUESTIONS) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "回数の上限だよ。ギブアップして真相を見よう!" },
      ]);
      return;
    }

    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "player", text }]);

    const data = await callJudge({ action: mode, text });
    setSending(false);

    if (!data) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "通信エラー。もう一度試してね" },
      ]);
      return;
    }

    setQuestionCount((c) => c + 1);

    if (mode === "answer") {
      if (data.verdict === "correct" && data.reveal) {
        setMessages((prev) => [...prev, { role: "ai", text: "正解!! 🎉" }]);
        setResult({ kind: "correct", ...data.reveal });
        saveProgress(meta.id, {
          status: "cleared",
          questions: questionCount + 1,
        });
        return;
      }
      if (data.verdict === "close") {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `かなり惜しい!! ${data.comment ?? ""}`.trim(),
          },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `残念、真相はそれじゃないみたい。${data.comment ?? ""}`.trim(),
        },
      ]);
      return;
    }

    // mode === "question"
    if (data.verdict === "correct" && data.reveal) {
      setMessages((prev) => [...prev, { role: "ai", text: "正解!! 🎉" }]);
      setResult({ kind: "correct", ...data.reveal });
      saveProgress(meta.id, {
        status: "cleared",
        questions: questionCount + 1,
      });
      return;
    }

    const verdictText =
      VERDICT_TEXT[data.verdict ?? "unclear"] ?? VERDICT_TEXT.unclear;
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: data.comment ? `${verdictText} ${data.comment}` : verdictText,
      },
    ]);
  }

  async function handleHint() {
    if (sending || result || hintsUsed >= MAX_HINTS) return;
    setSending(true);
    const data = await callJudge({ action: "hint", hintIndex: hintsUsed });
    setSending(false);
    if (!data?.hint) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "通信エラー。もう一度試してね" },
      ]);
      return;
    }
    setHintsUsed((n) => n + 1);
    setMessages((prev) => [...prev, { role: "hint", text: data.hint! }]);
  }

  // クリア結果のシェア文(ネタバレなし: 問題名と回数だけ)
  function buildShareText() {
    return `🍲 うんちくウミガメのスープ「${meta.title}」を質問${questionCount}回でクリア!\nhttps://umigame-chi.vercel.app/play/${meta.id}`;
  }

  async function handleCopyShare() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // コピー未対応のブラウザでは何もしない
    }
  }

  async function handleGiveUp() {
    if (sending || result) return;
    if (!window.confirm("ギブアップして真相を見ますか?")) return;
    setSending(true);
    const data = await callJudge({ action: "giveup" });
    setSending(false);
    if (data?.reveal) {
      setResult({ kind: "giveup", ...data.reveal });
      // 既にクリア済みなら記録を上書きしない
      if (readProgress()[meta.id]?.status !== "cleared") {
        saveProgress(meta.id, { status: "revealed" });
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-stone-800">
      {/* 上部固定: 問題文 */}
      <header className="border-b border-amber-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="text-sm text-amber-600 hover:underline">
              ← ホームへ
            </Link>
            <span className="text-sm text-stone-500">Q: {questionCount}</span>
          </div>
          <h1 className="mt-1 font-bold">🍲 {meta.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-700">
              {meta.genre}
            </span>
            <span className="text-amber-600">
              {"★".repeat(meta.difficulty)}
              <span className="text-amber-200">
                {"★".repeat(3 - meta.difficulty)}
              </span>
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            {meta.question}
          </p>
        </div>
      </header>

      {/* 中央: チャットログ */}
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "player" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "player"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-amber-500 px-4 py-2 text-white"
                  : m.role === "hint"
                    ? "max-w-[80%] rounded-2xl border border-dashed border-amber-400 bg-amber-100 px-4 py-2 text-amber-800"
                    : "max-w-[80%] rounded-2xl rounded-bl-sm border border-amber-200 bg-white px-4 py-2"
              }
            >
              {m.role === "hint" ? `💡 ${m.text}` : m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-amber-200 bg-white px-4 py-2 text-stone-400">
              考え中…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* 下部固定: 入力欄 */}
      <footer className="border-t border-amber-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          {/* モード切り替え */}
          <div className="mb-2 flex overflow-hidden rounded-xl border border-amber-300">
            <button
              onClick={() => setMode("question")}
              disabled={sending || !!result}
              aria-pressed={mode === "question"}
              className={
                mode === "question"
                  ? "flex-1 bg-amber-500 py-1.5 text-sm font-bold text-white"
                  : "flex-1 bg-white py-1.5 text-sm text-amber-600"
              }
            >
              質問
            </button>
            <button
              onClick={() => setMode("answer")}
              disabled={sending || !!result}
              aria-pressed={mode === "answer"}
              className={
                mode === "answer"
                  ? "flex-1 bg-amber-500 py-1.5 text-sm font-bold text-white"
                  : "flex-1 bg-white py-1.5 text-sm text-amber-600"
              }
            >
              解答
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  handleSend();
                }
              }}
              maxLength={200}
              disabled={sending || !!result}
              aria-label={mode === "question" ? "質問を入力" : "解答を入力"}
              placeholder={
                mode === "question"
                  ? "はい/いいえで答えられる質問(例: それは食べ物に関係ある?)"
                  : "真相だと思う説明を書いて解答(例: 〇〇だったから△△した)"
              }
              className="flex-1 rounded-xl border border-amber-300 px-4 py-2 outline-none focus:border-amber-500 disabled:bg-stone-100"
            />
            <button
              onClick={handleSend}
              disabled={sending || !!result || input.trim().length === 0}
              className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white transition hover:bg-amber-600 disabled:opacity-40"
            >
              {mode === "question" ? "質問する" : "解答する"}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleHint}
              disabled={sending || !!result || hintsUsed >= MAX_HINTS}
              className="text-sm text-amber-600 underline hover:text-amber-700 disabled:opacity-40"
            >
              💡 ヒントを見る(残り{MAX_HINTS - hintsUsed})
            </button>
            <button
              onClick={handleGiveUp}
              disabled={sending || !!result}
              className="text-sm text-stone-400 underline hover:text-stone-600 disabled:opacity-40"
            >
              ギブアップして真相を見る
            </button>
          </div>
        </div>
      </footer>

      {/* 結果モーダル */}
      {result && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 animate-[fadein_0.2s_ease-out]">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl animate-[pop_0.25s_ease-out]">
            <h2 className="text-center text-2xl font-bold">
              {result.kind === "correct"
                ? `正解! 🎉(回数 ${questionCount} 回)`
                : "ギブアップ…"}
            </h2>
            {result.kind === "correct" && (
              <p className="mt-2 animate-bounce text-center text-3xl">🎉 🎊 ✨</p>
            )}
            <section className="mt-4">
              <h3 className="font-bold text-amber-700">真相</h3>
              <p className="mt-1 text-sm leading-7">{result.truth}</p>
            </section>
            <section className="mt-4 rounded-xl bg-amber-50 p-4">
              <h3 className="font-bold text-amber-700">📚 今日のうんちく</h3>
              <p className="mt-1 text-sm leading-7">{result.trivia}</p>
            </section>
            {result.sources.length > 0 && (
              <section className="mt-4">
                <h3 className="font-bold text-amber-700">📚 出典</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {result.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 underline hover:text-amber-700"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {result.kind === "correct" && (
              <div className="mt-5 flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border border-amber-300 bg-white py-2.5 text-center text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                >
                  🕊️ Xでシェア
                </a>
                <button
                  onClick={handleCopyShare}
                  className="flex-1 rounded-xl border border-amber-300 bg-white py-2.5 text-center text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                >
                  {copied ? "✅ コピーしました!" : "📋 結果をコピー"}
                </button>
              </div>
            )}
            <Link
              href="/"
              className="mt-3 block rounded-xl bg-amber-500 py-3 text-center font-bold text-white transition hover:bg-amber-600"
            >
              他の問題へ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
