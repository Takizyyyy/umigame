// アプリ全体で共有する定数。
// サーバー(judge API)・クライアント(PlayClient等)の両方から使うため、
// server-only化はしない。

// 1問あたりの質問(解答含む)回数の上限
export const MAX_QUESTIONS = 30;

// 質問・解答の入力欄の最大文字数
export const MAX_MESSAGE_LENGTH = 200;

// 本番ドメイン。metadataBase・シェア文言のURL生成で共通利用する
export const SITE_URL = "https://umigame-chi.vercel.app";
