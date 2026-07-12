"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { JudgeResponse, PuzzleMeta } from "@/lib/types";
import { readProgress, saveProgress } from "@/lib/progress";
import { decodeLog, encodeLog } from "@/lib/sharelog";
import DifficultyBadge from "@/components/DifficultyBadge";

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

// 「考え中」の3つの点が順番に浮かぶインジケーター
function ThinkingDots() {
  const reduce = useReducedMotion();
  return (
    <span className="flex items-center gap-1 px-1 py-1" aria-label="考え中">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-stone-400"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function PlayClient({
  meta,
  others,
}: {
  meta: PuzzleMeta;
  others: { id: string; genre: string }[];
}) {
  const router = useRouter();
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
  const [copiedLog, setCopiedLog] = useState(false);
  // シェアURL(#log=...)で開かれたときに表示する、他の人の質問ログ
  const [sharedLog, setSharedLog] = useState<ChatMessage[] | null>(null);
  // 結果(正解 or ギブアップ)。null の間はプレイ中
  const [result, setResult] = useState<{
    kind: "correct" | "giveup";
    truth: string;
    trivia: string;
    sources: { title: string; url: string }[];
  } | null>(null);
  // 結果モーダルの表示/非表示(閉じて質問ログを見返し、また開ける)
  const [resultOpen, setResultOpen] = useState(false);

  const reduce = useReducedMotion();

  // 新しいメッセージが増えたらチャット欄を最下部までスクロール
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // のこり質問が5回になったら一度だけ知らせる(30回の壁に突然ぶつからないように)
  useEffect(() => {
    if (result || MAX_QUESTIONS - questionCount !== 5) return;
    const notice = "(質問はのこり5回! ヒントやギブアップも考えてみてね)";
    setMessages((prev) =>
      // 復元されたログに既に含まれている場合は二重に出さない
      prev.some((m) => m.text === notice) ? prev : [...prev, { role: "ai", text: notice }],
    );
  }, [questionCount, result]);

  // 進行中のログをsessionStorage(タブを閉じるまで残る)へ自動保存・復元する。
  // 「あそびかた」ページ等へ移動して戻ってきても、続きから遊べるようにするため
  const storageKey = `umigame-play:${meta.id}`;
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // 挨拶1件だけの初期状態は復元しない(意味がないため)
      if (Array.isArray(saved.messages) && saved.messages.length > 1) {
        setMessages(saved.messages);
        setQuestionCount(saved.questionCount ?? 0);
        setHintsUsed(saved.hintsUsed ?? 0);
        setMode(saved.mode === "answer" ? "answer" : "question");
        if (saved.result) setResult(saved.result);
      }
    } catch {
      // 保存データが壊れていたら初期状態で始める
    }
    // 初回マウント時に1回だけ復元する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ messages, questionCount, hintsUsed, mode, result }),
      );
    } catch {
      // 保存できない環境(プライベートモード等)では諦めて通常動作
    }
  }, [storageKey, messages, questionCount, hintsUsed, mode, result]);

  // シェアURLで開かれたら、URLから質問ログを復元して閲覧モーダルを出す
  useEffect(() => {
    const match = window.location.hash.match(/^#log=(.+)$/);
    if (!match) return;
    decodeLog(match[1]).then((data) => {
      if (!data || data.puzzleId !== meta.id) return;
      const roleOf = { p: "player", a: "ai", h: "hint" } as const;
      setSharedLog(data.log.map((m) => ({ role: roleOf[m.r], text: m.t })));
    });
  }, [meta.id]);

  // 入力欄を内容に合わせて自動で伸縮させる。
  // 1行固定のinputだと、スマホで長い質問を打つと横に流れて先頭が読めなくなるため
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto"; // 一度縮めてから実際の高さを測る(削除時に縮むように)
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

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
      setInput(text); // 打った文を消さずに入力欄へ戻す(打ち直しさせない)
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "通信エラー。もう一度試してね" },
      ]);
      return;
    }

    // AI側が混雑・上限で判定できなかったとき: 質問回数を消費させず、入力も返す
    if (data.busy) {
      setInput(text);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "今ちょっと混み合ってるみたい。少し待ってもう一度!" },
      ]);
      return;
    }

    setQuestionCount((c) => c + 1);

    if (mode === "answer") {
      if (data.verdict === "correct" && data.reveal) {
        setMessages((prev) => [...prev, { role: "ai", text: "正解!!" }]);
        setResult({ kind: "correct", ...data.reveal });
        setResultOpen(true);
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
      setMessages((prev) => [...prev, { role: "ai", text: "正解!!" }]);
      setResult({ kind: "correct", ...data.reveal });
      setResultOpen(true);
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
    return `うんちくウミガメのスープ「${meta.title}」を質問${questionCount}回でクリア!\nhttps://umigame-chi.vercel.app/play/${meta.id}`;
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

  // 質問ログを圧縮してURLに埋め込んだシェア文をコピーする
  async function handleCopyLogShare() {
    try {
      const encoded = await encodeLog({
        puzzleId: meta.id,
        log: messages.map((m) => ({
          r: m.role === "player" ? "p" : m.role === "hint" ? "h" : "a",
          t: m.text,
        })),
      });
      const url = `https://umigame-chi.vercel.app/play/${meta.id}#log=${encoded}`;
      const head =
        result?.kind === "correct"
          ? `うんちくウミガメのスープ「${meta.title}」を質問${questionCount}回でクリア!`
          : `うんちくウミガメのスープ「${meta.title}」に挑戦!`;
      await navigator.clipboard.writeText(`${head}\n質問ログはこちら↓\n${url}`);
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 2000);
    } catch {
      // 圧縮API未対応の古いブラウザでは、ログなしの通常シェア文にフォールバック
      await handleCopyShare();
    }
  }

  // つぎの問題: 同ジャンルの未クリア → 他ジャンルの未クリア → その他 の順で選ぶ
  function handleNextPuzzle() {
    const progress = readProgress();
    const candidates = others.filter((p) => p.id !== meta.id);
    const pick = (list: { id: string }[]) =>
      list.length > 0
        ? list[Math.floor(Math.random() * list.length)].id
        : null;

    const nextId =
      pick(
        candidates.filter(
          (p) => p.genre === meta.genre && !progress[p.id]
        )
      ) ??
      pick(candidates.filter((p) => !progress[p.id])) ??
      pick(candidates);

    if (nextId) router.push(`/play/${nextId}`);
    else router.push("/");
  }

  async function handleGiveUp() {
    if (sending || result) return;
    if (!window.confirm("ギブアップして真相を見ますか?")) return;
    setSending(true);
    const data = await callJudge({ action: "giveup" });
    setSending(false);
    if (data?.reveal) {
      setResult({ kind: "giveup", ...data.reveal });
      setResultOpen(true);
      // 既にクリア済みなら記録を上書きしない
      if (readProgress()[meta.id]?.status !== "cleared") {
        saveProgress(meta.id, { status: "revealed" });
      }
    }
  }

  return (
    // h-dvh: 画面の高さに固定し、スクロールはチャット欄(main)の中だけで起こす。
    // これで質問を見返しても入力欄が画面外に流れない
    <div className="flex h-dvh flex-col">
      {/* 上部固定: 問題文 */}
      <header className="border-b border-stone-200 bg-[#fafaf8] px-5 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="text-sm text-stone-400 transition hover:text-stone-900"
            >
              ← ホーム
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/howto"
                className="text-sm text-stone-400 transition hover:text-stone-900"
              >
                あそびかた
              </Link>
              <span className="text-sm tabular-nums text-stone-400">
                質問 {questionCount}/{MAX_QUESTIONS}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">{meta.title}</h1>
            <span className="text-xs text-stone-400">{meta.genre}</span>
            <DifficultyBadge level={meta.difficulty} />
          </div>
          <p className="mt-2 max-w-[60ch] text-sm leading-7 text-stone-600">
            {meta.question}
          </p>
        </div>
      </header>

      {/* 中央: チャットログ */}
      {/* overscroll-y-contain: ログを一番上まで見返して更に引っ張っても、
          ブラウザのプルリフレッシュ(ページ再読み込み)を誤爆させない */}
      <main className="mx-auto min-h-0 w-full max-w-3xl flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-5 py-5">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={
              m.role === "player" ? "flex justify-end" : "flex justify-start"
            }
          >
            {m.role === "player" ? (
              // 自分の発言はタップで入力欄に戻せる(少し変えて聞き直す用)
              <button
                type="button"
                onClick={() => {
                  setInput(m.text);
                  inputRef.current?.focus();
                }}
                title="タップで入力欄にコピー"
                className="max-w-[80%] cursor-pointer rounded-2xl rounded-br-md bg-stone-900 px-4 py-2.5 text-left text-sm leading-7 text-white transition active:scale-[0.98]"
              >
                {m.text}
              </button>
            ) : (
              <div
                className={
                  m.role === "hint"
                    ? "max-w-[80%] rounded-2xl rounded-bl-md border border-amber-600/25 bg-amber-50 px-4 py-2.5 text-sm leading-7 text-stone-800"
                    : "max-w-[80%] rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-2.5 text-sm leading-7"
                }
              >
                {m.role === "hint" && (
                  <span className="mb-0.5 block text-[11px] font-bold tracking-wide text-amber-700">
                    ヒント
                  </span>
                )}
                {m.text}
              </div>
            )}
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-2.5">
              <ThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* 下部固定: 入力欄 */}
      <footer className="border-t border-stone-200 bg-[#fafaf8] px-5 py-4">
        <div className="mx-auto max-w-3xl">
          {/* モード切り替え(選択中の面がスライドするピル) */}
          <div className="mb-3 flex w-fit rounded-full border border-stone-200 bg-white p-1">
            {(["question", "answer"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={sending || !!result}
                aria-pressed={mode === m}
                className={`relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  mode === m ? "text-white" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-full bg-stone-900"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative">
                  {m === "question" ? "質問" : "解答"}
                </span>
              </button>
            ))}
          </div>

          {/* 文字数カウンター(200字上限を最初から見せておく) */}
          <div className="mb-1 text-right text-[11px] tabular-nums text-stone-400">
            {input.length}/200
          </div>
          <div className="flex items-end gap-2">
            {/* 文字サイズ: スマホ(sm未満)は16px(text-base)。
                iOS Safariは16px未満の入力欄にフォーカスすると画面ごと自動ズームする仕様があり、
                「チャットを開くと勝手にズームされる」の原因になるため */}
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enterで送信、Shift+Enterで改行。日本語変換確定のEnterは無視
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              maxLength={200}
              disabled={sending || !!result}
              aria-label={mode === "question" ? "質問を入力" : "解答を入力"}
              placeholder={
                // スマホの16px表示でも1行に収まる長さにする(長いと途中で切れて見にくい)
                mode === "question" ? "はい/いいえで聞ける質問" : "推理した真相を書く"
              }
              className="max-h-32 min-w-0 flex-1 resize-none overflow-y-auto rounded-3xl border border-stone-200 bg-white px-5 py-2.5 text-base leading-6 outline-none transition placeholder:text-stone-400 focus:border-stone-400 disabled:opacity-50 sm:text-sm"
            />
            <button
              onClick={handleSend}
              disabled={sending || !!result || !input.trim()}
              className="shrink-0 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-30"
            >
              {mode === "question" ? "質問する" : "解答する"}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <button
              onClick={handleHint}
              disabled={sending || !!result || hintsUsed >= MAX_HINTS}
              className="font-medium text-amber-700 transition hover:opacity-70 disabled:opacity-30"
            >
              ヒントを見る(残り{MAX_HINTS - hintsUsed})
            </button>
            {result ? (
              !resultOpen && (
                <button
                  onClick={() => setResultOpen(true)}
                  className="rounded-full bg-amber-600 px-3.5 py-1.5 font-bold text-white transition hover:bg-amber-700"
                >
                  真相をもう一度見る
                </button>
              )
            ) : (
              <button
                onClick={handleGiveUp}
                disabled={sending}
                className="text-stone-400 transition hover:text-stone-900 disabled:opacity-30"
              >
                ギブアップして真相を見る
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* シェアURLで開かれたときの質問ログ閲覧モーダル */}
      <AnimatePresence>
        {sharedLog && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-xl shadow-stone-900/10"
            >
              <p className="text-[11px] font-bold tracking-widest text-amber-700">
                SHARED LOG
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">
                シェアされた質問ログ
              </h2>
              <p className="mt-1 text-sm text-stone-400">
                この問題に挑戦した人の質問と出題者のやりとりです(ヒント含む・真相は含まれません)
              </p>
              <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-stone-50 p-4">
                {sharedLog.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "player" ? "flex justify-end" : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        m.role === "player"
                          ? "max-w-[80%] rounded-2xl rounded-br-md bg-stone-900 px-4 py-2.5 text-sm leading-7 text-white"
                          : m.role === "hint"
                            ? "max-w-[80%] rounded-2xl rounded-bl-md border border-amber-600/25 bg-amber-50 px-4 py-2.5 text-sm leading-7 text-stone-800"
                            : "max-w-[80%] rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-2.5 text-sm leading-7"
                      }
                    >
                      {m.role === "hint" && (
                        <span className="mb-0.5 block text-[11px] font-bold tracking-wide text-amber-700">
                          ヒント
                        </span>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setSharedLog(null);
                  // URLに残った#log=...を消して、リロードしても再表示されないようにする
                  history.replaceState(null, "", window.location.pathname);
                }}
                className="mt-4 block w-full rounded-full bg-stone-900 py-3 text-center font-bold text-white transition-colors hover:bg-stone-700"
              >
                閉じて自分も挑戦する
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 結果モーダル */}
      <AnimatePresence>
        {result && resultOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-7 shadow-xl shadow-stone-900/10"
            >
              <p className="text-[11px] font-bold tracking-widest text-amber-700">
                {result.kind === "correct" ? "SOLVED" : "GIVE UP"}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {result.kind === "correct" ? "正解!" : "真相はこちら"}
              </h2>
              {result.kind === "correct" && (
                <p className="mt-1 text-sm text-stone-400">
                  質問 {questionCount} 回でクリア
                </p>
              )}

              <section className="mt-6">
                <h3 className="text-sm font-bold text-stone-400">真相</h3>
                <p className="mt-2 text-sm leading-8">{result.truth}</p>
              </section>
              <section className="mt-5 rounded-2xl bg-amber-50 p-5">
                <h3 className="text-sm font-bold text-amber-700">
                  今日のうんちく
                </h3>
                <p className="mt-2 text-sm leading-8">{result.trivia}</p>
              </section>
              {result.sources.length > 0 && (
                <section className="mt-5">
                  <h3 className="text-sm font-bold text-stone-400">出典</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {result.sources.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-600 underline underline-offset-4 transition hover:text-stone-900"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.kind === "correct" && (
                <div className="mt-6 flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-full border border-stone-200 py-2.5 text-center text-sm font-medium transition hover:border-stone-400"
                  >
                    Xでシェア
                  </a>
                  <button
                    onClick={handleCopyShare}
                    className="flex-1 rounded-full border border-stone-200 py-2.5 text-center text-sm font-medium transition hover:border-stone-400"
                  >
                    {copied ? "コピーしました!" : "結果をコピー"}
                  </button>
                </div>
              )}
              <button
                onClick={handleCopyLogShare}
                className="mt-3 block w-full rounded-full border border-stone-200 py-2.5 text-center text-sm font-medium transition hover:border-stone-400"
              >
                {copiedLog
                  ? "コピーしました!"
                  : "質問ログ付きでシェア(URLをコピー)"}
              </button>
              <button
                onClick={() => setResultOpen(false)}
                className="mt-2 block w-full rounded-full border border-stone-200 py-2.5 text-center text-sm font-medium transition hover:border-stone-400"
              >
                質問ログを確認する
              </button>
              <button
                onClick={handleNextPuzzle}
                className="mt-2 block w-full rounded-full bg-stone-900 py-3 text-center font-bold text-white transition-colors hover:bg-stone-700"
              >
                つぎの問題へ
              </button>
              <Link
                href="/"
                className="mt-4 block text-center text-sm text-stone-400 transition hover:text-stone-900"
              >
                ホームにもどる
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
