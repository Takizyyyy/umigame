import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// 端正な角ゴシック体の日本語Webフォント(ビルド時に取り込んで自前配信されるため
// 利用者のブラウザからGoogleへの通信は発生しない)
const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "うんちくウミガメのスープ",
  description:
    "答えがうんちくになっている水平思考クイズ。AIに「はい/いいえ」で質問しながら真相を当てよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenKaku.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
