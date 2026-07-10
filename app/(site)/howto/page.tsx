import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "あそびかた | ウンチクのスープ",
  description:
    "水平思考クイズ「ウンチクのスープ」の遊び方。質問のコツ、ヒント、解答モードの使い方を紹介します。",
};

// 質問のコツの例
const QUESTION_EXAMPLES = [
  { q: "それは人の意図的な行動が関係ある?", why: "偶然か、狙いがあるかを切り分ける" },
  { q: "お金や商売が関係ある?", why: "動機の種類を絞り込む" },
  { q: "現代でも同じことが起きる?", why: "時代や技術が鍵かどうかを確かめる" },
];

export default function HowToPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        あそびかた
      </h1>

      {/* なにこれ? */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">なにこれ?</h2>
        <p className="mt-2 text-sm leading-7">
          ウミガメのスープ(水平思考クイズ)をAIと遊べるようにしたWebアプリです。
          答えが「思わず人に話したくなる実話のうんちく」になっているのが特徴で、
          全問ウェブ上の資料で事実確認をしてから収録しています。
        </p>
      </section>

      {/* 基本の流れ */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">基本の流れ</h2>
        <ol className="mt-3 space-y-3">
          {[
            {
              step: "1",
              title: "問題文を読む",
              body: "問題文には不思議な「結果」だけが書かれている。なぜそうなったのか、理由を推理するのがゴール。",
            },
            {
              step: "2",
              title: "「はい/いいえ」で答えられる質問をする",
              body: "AIの出題者が「はい」「いいえ」「関係ありません」で答えてくれる。質問を重ねて真相に近づこう。",
            },
            {
              step: "3",
              title: "確信したら「解答」モードで答える",
              body: "入力欄の上で「解答」に切り替えて、真相だと思う説明を書いて送信。半分合っていると「かなり惜しい!」と教えてくれる。",
            },
            {
              step: "4",
              title: "正解すると真相とうんちくが読める",
              body: "解説には出典リンク付き。誰かに話したくなったら、この問題の勝ち。",
            },
          ].map((item) => (
            <li
              key={item.step}
              className="flex gap-3 rounded-xl border border-amber-200 bg-white p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white">
                {item.step}
              </span>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 質問のコツ */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">質問のコツ</h2>
        <p className="mt-2 text-sm leading-7">
          最初から細かく当てにいくより、大きな切り口で絞り込むのが近道。
          たとえばこんな質問から始めてみよう:
        </p>
        <ul className="mt-3 space-y-2">
          {QUESTION_EXAMPLES.map((ex) => (
            <li
              key={ex.q}
              className="rounded-xl border border-amber-200 bg-white p-3 text-sm"
            >
              <p className="font-bold">「{ex.q}」</p>
              <p className="mt-1 text-stone-500">→ {ex.why}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 困ったときは */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">困ったときは</h2>
        <ul className="mt-3 space-y-2 text-sm leading-7">
          <li className="rounded-xl bg-amber-100/60 p-3">
            💡 <span className="font-bold">ヒント:</span>{" "}
            1問につき3段階。後になるほど核心に近づく(3つ目は「最後のひと押し」)。使ってもペナルティはなし
          </li>
          <li className="rounded-xl bg-amber-100/60 p-3">
            🏳️ <span className="font-bold">ギブアップ:</span>{" "}
            いつでも真相と解説を見られる。負けても「へぇ〜」は持ち帰れるので安心
          </li>
          <li className="rounded-xl bg-amber-100/60 p-3">
            🔢 <span className="font-bold">回数の上限:</span>{" "}
            質問と解答は合わせて30回まで。じっくり考えてから送ろう
          </li>
        </ul>
      </section>

      {/* 記録について */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-amber-700">クリア記録について</h2>
        <p className="mt-2 text-sm leading-7">
          クリアした問題には一覧でバッジが付きます。記録はこの端末のブラウザの中にだけ保存され、
          サーバーには送られません(ブラウザのデータを消すとリセットされます)。
        </p>
      </section>

      <Link
        href="/"
        className="mt-10 block rounded-xl bg-amber-500 py-3 text-center font-bold text-white shadow-sm shadow-amber-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-200 active:translate-y-0 active:scale-[0.99]"
      >
        さっそく遊ぶ →
      </Link>
    </div>
  );
}
