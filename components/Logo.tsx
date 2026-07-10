// サイトのロゴマーク: スープの器から立ちのぼる湯気が「?」になっている線画。
// 色は currentColor を使うので、親要素の文字色に馴染む
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      {/* 湯気の「?」 */}
      <path
        d="M19.5 10.5 a5 5 0 1 1 7.6 4.2 c-2.2 1.3 -3.1 2.2 -3.1 4.3"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="23.5" r="1.7" fill="currentColor" />
      {/* 器 */}
      <path d="M7.5 29.5 H40.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M10.5 29.5 a13.5 13.5 0 0 0 27 0"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M19 44 h10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
