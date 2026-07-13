import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "あそびかた | うんちくウミガメのスープ",
  description:
    "水平思考クイズ「うんちくウミガメのスープ」の遊び方。質問のコツ、ヒント、解答モードの使い方を紹介します。",
};

// 質問のコツの例
const QUESTION_EXAMPLES = [
  {
    q: "それは人の意図的な行動が関係ある?",
    why: "偶然か、狙いがあるかを切り分ける",
  },
  { q: "お金や商売が関係ある?", why: "動機の種類を絞り込む" },
  { q: "現代でも同じことが起きる?", why: "時代や技術が鍵かどうかを確かめる" },
];

const STEPS = [
  {
    n: "1",
    title: "問題文を読む",
    body: "問題文には不思議な「結果」だけが書かれている。なぜそうなったのか、理由を推理するのがゴール。",
  },
  {
    n: "2",
    title: "「はい/いいえ」で答えられる質問をする",
    body: "AIの出題者が「はい」「いいえ」「関係ありません」で答えてくれる。質問を重ねて真相に近づこう。",
  },
  {
    n: "3",
    title: "確信したら「解答」モードで答える",
    body: "入力欄の上で「解答」に切り替えて、真相だと思う説明を書いて送信。半分合っていると「かなり惜しい!」と教えてくれる。",
  },
  {
    n: "4",
    title: "正解すると真相とうんちくが読める",
    body: "解説には出典リンク付き。誰かに話したくなったら、この問題の勝ち。",
  },
];

const SUPPORTS = [
  {
    title: "ヒント",
    body: "1問につき3段階。後になるほど核心に近づく(3つ目は「最後のひと押し」)。使ってもペナルティはなし。",
  },
  {
    title: "ギブアップ",
    body: "いつでも真相と解説を見られる。負けても「へぇ〜」は持ち帰れるので安心。",
  },
  {
    title: "回数の上限",
    body: "質問と解答は合わせて30回まで。じっくり考えてから送ろう。",
  },
  {
    title: "質問の再利用",
    body: "自分の質問(黒い吹き出し)をタップすると入力欄にコピーされる。少し言い換えて聞き直したいときに便利。",
  },
  {
    title: "つづきから",
    body: "遊びかけの問題はこの端末に自動保存される。ホームや一覧の「つづきから」からいつでも再開できる。",
  },
];

export default function HowToPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Reveal>
        <BackButton />
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          あそびかた
        </h1>
        <p className="mt-5 max-w-[42ch] leading-8 text-stone-500">
          ウミガメのスープ(水平思考クイズ)をAIと遊べるようにしたWebアプリです。答えが「思わず人に話したくなる実話のうんちく」になっているのが特徴で、全問ウェブ上の資料で事実確認をしてから収録しています。
        </p>
      </Reveal>

      {/* 基本の流れ */}
      <section className="mt-14 border-t border-stone-200 pt-10">
        <Reveal>
          <h2 className="text-xl font-bold tracking-tight">基本の流れ</h2>
        </Reveal>
        <ol className="mt-8 space-y-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <li className="flex gap-5">
                <span className="text-sm text-stone-300">{step.n}</span>
                <div>
                  <h3 className="font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 max-w-[46ch] text-sm leading-7 text-stone-500">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* 質問のコツ */}
      <section className="mt-14 border-t border-stone-200 pt-10">
        <Reveal>
          <h2 className="text-xl font-bold tracking-tight">質問のコツ</h2>
          <p className="mt-3 max-w-[46ch] text-sm leading-7 text-stone-500">
            最初から細かく当てにいくより、大きな切り口で絞り込むのが近道。たとえばこんな質問から始めてみよう。
          </p>
        </Reveal>
        <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
          {QUESTION_EXAMPLES.map((ex, i) => (
            <Reveal key={ex.q} delay={i * 0.06}>
              <div className="px-1 py-4">
                <p className="font-medium">「{ex.q}」</p>
                <p className="mt-1 text-sm text-stone-400">{ex.why}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 困ったときは */}
      <section className="mt-14 border-t border-stone-200 pt-10">
        <Reveal>
          <h2 className="text-xl font-bold tracking-tight">困ったときは</h2>
        </Reveal>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {SUPPORTS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <h3 className="font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-500">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 記録について */}
      <section className="mt-14 border-t border-stone-200 pt-10">
        <Reveal>
          <h2 className="text-xl font-bold tracking-tight">
            クリア記録について
          </h2>
          <p className="mt-3 max-w-[46ch] text-sm leading-7 text-stone-500">
            クリアした問題には一覧でバッジが付きます。記録はこの端末のブラウザの中にだけ保存され、サーバーには送られません(ブラウザのデータを消すとリセットされます)。
          </p>
        </Reveal>
      </section>

      <Reveal delay={0.1}>
        <Link
          href="/"
          className="mt-14 inline-block rounded-full bg-stone-900 px-8 py-3.5 font-bold text-white transition-colors hover:bg-stone-700"
        >
          さっそく遊ぶ →
        </Link>
      </Reveal>
    </div>
  );
}
