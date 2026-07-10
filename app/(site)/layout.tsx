import Link from "next/link";
import Logo from "@/components/Logo";

// ホーム・ジャンル・あそびかたページ共通のレイアウト(ヘッダー+フッター)。
// プレイ画面(app/play/[id])は没入感優先のため、このグループの外に置いている
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-[#fafaf8]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-stone-900 transition hover:opacity-70"
          >
            <Logo size={26} />
            うんちくウミガメのスープ
          </Link>
          <Link
            href="/howto"
            className="text-sm text-stone-500 transition hover:text-stone-900"
          >
            あそびかた
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-stone-200 px-5 py-8 text-center text-xs text-stone-400">
        <p>
          <a
            href="https://github.com/Takizyyyy/umigame"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition hover:text-stone-600"
          >
            GitHub
          </a>
        </p>
        <p className="mt-2">Next.js + Gemini API で作りました</p>
      </footer>
    </div>
  );
}
