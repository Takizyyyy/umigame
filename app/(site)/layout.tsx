import Link from "next/link";

// ホーム・ジャンル・aboutページ共通のレイアウト(ヘッダー+フッター)。
// プレイ画面(app/play/[id])は没入感優先のため、このグループの外に置いている
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-amber-50 text-stone-800">
      <header className="sticky top-0 z-10 border-b border-amber-200 bg-amber-50/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href="/"
            className="font-bold text-stone-800 transition hover:text-amber-700"
          >
            🍲 うんちくウミガメのスープ
          </Link>
          <Link
            href="/howto"
            className="text-sm text-amber-600 hover:underline"
          >
            あそびかた
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-amber-200 bg-white px-4 py-4 text-center text-xs text-stone-400">
        <p>
          <a
            href="https://github.com/Takizyyyy/umigame"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 underline hover:text-amber-700"
          >
            GitHub
          </a>
        </p>
        <p className="mt-1">Next.js + Gemini API で作りました</p>
      </footer>
    </div>
  );
}
