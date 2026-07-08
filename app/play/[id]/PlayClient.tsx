"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JudgeResponse, PuzzleMeta } from "@/lib/types";

type ChatMessage = {
  role: "player" | "ai";
  text: string;
};

// 判定結果を出題者のセリフに変換する
const VERDICT_TEXT: Record<string, string> = {
  yes: "はい!",
  no: "いいえ",
  irrelevant: "関係ありません",
  unclear: "うーん、「はい/いいえ」で答えられる質問にしてね",
};

const MAX_QUESTIONS = 30;

export default function PlayClient({ meta }: { meta: PuzzleMeta }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: "質問をどうぞ。「はい/いいえ」で答えられる形でね!" },
  ]);
  const [input, setInput] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [sending, setSending] = useState(false);
  // 結果表示(正解 or ギブアップ)。null の間はプレイ中
  const [result, setResult] = useState<{
    kind: "correct" | "giveup";
    truth: string;
    trivia: string;
  } | null>(null);

  // 新しいメッセージが増えたらチャット欄を最下部までスクロール
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function callJudge(payload: {
    message?: string;
    giveUp?: boolean;
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
    const message = input.trim();
    if (!message || sending || result) return;
    if (questionCount >= MAX_QUESTIONS) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "質問回数の上限だよ。ギブアップして真相を見よう!" },
      ]);
      return;
    }

    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "player", text: message }]);

    const data = await callJudge({ message });
    setSending(false);

    if (!data) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "通信エラー。もう一度試してね" },
      ]);
      return;
    }

    setQuestionCount((c) => c + 1);

    if (data.verdict === "correct" && data.reveal) {
      setMessages((prev) => [...prev, { role: "ai", text: "正解!! 🎉" }]);
      setResult({ kind: "correct", ...data.reveal });
      return;
    }

    const text =
      VERDICT_TEXT[data.verdict] ?? VERDICT_TEXT.unclear;
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: data.comment ? `${text} ${data.comment}` : text },
    ]);
  }

  async function handleGiveUp() {
    if (sending || result) return;
    if (!window.confirm("ギブアップして真相を見ますか?")) return;
    setSending(true);
    const data = await callJudge({ giveUp: true });
    setSending(false);
    if (data?.reveal) {
      setResult({ kind: "giveup", ...data.reveal });
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-stone-800">
      {/* 上部固定: 問題文 */}
      <header className="border-b border-amber-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="text-sm text-amber-600 hover:underline">
              ← 一覧へ
            </Link>
            <span className="text-sm text-stone-500">Q: {questionCount}</span>
          </div>
          <h1 className="mt-1 font-bold">🍲 {meta.title}</h1>
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
                  : "max-w-[80%] rounded-2xl rounded-bl-sm border border-amber-200 bg-white px-4 py-2"
              }
            >
              {m.text}
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
              placeholder="はい/いいえで答えられる質問を入力"
              className="flex-1 rounded-xl border border-amber-300 px-4 py-2 outline-none focus:border-amber-500 disabled:bg-stone-100"
            />
            <button
              onClick={handleSend}
              disabled={sending || !!result || input.trim().length === 0}
              className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white transition hover:bg-amber-600 disabled:opacity-40"
            >
              質問
            </button>
          </div>
          <button
            onClick={handleGiveUp}
            disabled={sending || !!result}
            className="mt-2 text-sm text-stone-400 underline hover:text-stone-600 disabled:opacity-40"
          >
            ギブアップして真相を見る
          </button>
        </div>
      </footer>

      {/* 結果モーダル */}
      {result && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-center text-2xl font-bold">
              {result.kind === "correct"
                ? `正解! 🎉(質問 ${questionCount} 回)`
                : "ギブアップ…"}
            </h2>
            <section className="mt-4">
              <h3 className="font-bold text-amber-700">真相</h3>
              <p className="mt-1 text-sm leading-7">{result.truth}</p>
            </section>
            <section className="mt-4 rounded-xl bg-amber-50 p-4">
              <h3 className="font-bold text-amber-700">📚 今日のうんちく</h3>
              <p className="mt-1 text-sm leading-7">{result.trivia}</p>
            </section>
            <Link
              href="/"
              className="mt-6 block rounded-xl bg-amber-500 py-3 text-center font-bold text-white transition hover:bg-amber-600"
            >
              他の問題へ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
