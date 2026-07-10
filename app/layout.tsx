import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

// 丸ゴシック体の日本語Webフォント(ビルド時に取り込んで自前配信されるため
// 利用者のブラウザからGoogleへの通信は発生しない)
const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ウンチクのスープ",
  description:
    "答えがうんちくになっている水平思考クイズ。AIに「はい/いいえ」で質問しながら真相を当てよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenMaru.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
