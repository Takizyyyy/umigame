import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて | ウンチクのスープ",
};

const WORK_POINTS = [
  {
    title: "🔒 答えはサーバーから出さない",
    detail:
      "真相・ヒント・出典はAPIを通じてしか取得できず、ページのHTMLには含まれない",
  },
  {
    title: "📋 AIの返事をJSONの型で固定",
    detail:
      "自由な文章を返させるとUIが壊れるので、「はい/いいえ/関係ない/正解/不明」の5分類だけを返す設計",
  },
  {
    title: "🛡️ いたずら対策",
    detail:
      "「答えを教えて」等の命令はAIが無視するよう指示。入力200字・質問30回・毎分のリクエスト回数に上限",
  },
  {
    title: "🔁 無料枠が止まっても動く",
    detail:
      "AIの無料枠上限(429)や混雑(503)のときは別モデルに自動で切り替え",
  },
  {
    title: "💡 ヒントは3段階",
    detail:
      "答えを言い切らず「最後のひと押し」で止める設計。クイズの楽しさを壊さない",
  },
];

const TECH_STACK = [
  "Next.js (App Router)",
  "TypeScript",
  "Tailwind CSS",
  "Gemini API(無料枠)",
  "Vercel",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold">このサイトについて</h1>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">なにこれ?</h2>
        <p className="mt-2 text-sm leading-7 text-stone-600">
          ウミガメのスープ(水平思考クイズ)をAIと遊べるようにしたWebアプリです。答えが「思わず人に話したくなる実話のうんちく」になっているのが特徴で、全18問すべてウェブ上の資料で事実確認をしてから収録しています。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">AI判定の仕組み</h2>
        <div className="mt-4 flex flex-col items-center gap-2 text-center text-xs sm:flex-row sm:justify-center sm:text-sm">
          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm">
            ブラウザ
          </div>
          <span className="text-amber-500">→質問→</span>
          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm">
            サーバー
            <br />
            (/api/judge)
          </div>
          <span className="text-amber-500">→問題文+真相+採点基準→</span>
          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm">
            Gemini AI
          </div>
        </div>
        <p className="mt-3 text-center text-xs font-bold text-amber-600">
          ↓ はい/いいえ/正解 をブラウザに返す
        </p>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          問題の真相はサーバーの中にしかありません。ブラウザに送られるのは判定結果だけなので、通信を覗いても答えは見えません。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">工夫したこと</h2>
        <ul className="mt-3 space-y-3">
          {WORK_POINTS.map((point) => (
            <li
              key={point.title}
              className="rounded-xl border border-amber-200 bg-white p-4 text-sm leading-6"
            >
              <p className="font-bold">{point.title}</p>
              <p className="mt-1 text-stone-600">{point.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">使った技術</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">制作について</h2>
        <p className="mt-2 text-sm leading-7 text-stone-600">
          2026年7月に、プログラミング学習中の作者がAI(Claude)と協働して要件定義から設計・実装・テストまで行いました。ソースコードはGitHubで公開しています →{" "}
          <a
            href="https://github.com/Takizyyyy/umigame"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 underline hover:text-amber-700"
          >
            GitHub
          </a>
        </p>
      </section>

      <Link
        href="/"
        className="mt-10 block rounded-xl bg-amber-500 py-3 text-center font-bold text-white transition hover:bg-amber-600"
      >
        ← ホームへ
      </Link>
    </div>
  );
}
