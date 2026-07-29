// 遊びかけ(まだクリア/ギブアップしていない)の進行ログをlocalStorageに
// 保存するときのキー形式・「遊びかけ判定」を1箇所にまとめる。
// PlayClient(保存)・ContinueCard/ProgressBadge(読み取り)がそれぞれ
// 独自にキー文字列や判定条件を書くと、片方だけ直し忘れる事故が起きるため

export const PLAY_LOG_PREFIX = "umigame-play:";

export function playLogKey(puzzleId: string): string {
  return `${PLAY_LOG_PREFIX}${puzzleId}`;
}

type StoredPlayLog = {
  messages?: unknown[];
  questionCount?: number;
  title?: string;
  result?: unknown;
  updatedAt?: number;
};

// 「遊びかけ」= 挨拶メッセージ以外に発言があり、まだ結果(正解/ギブアップ)が出ていない
function isInProgress(saved: StoredPlayLog): boolean {
  return Array.isArray(saved.messages) && saved.messages.length > 1 && !saved.result;
}

// 指定した問題の遊びかけログがこの端末に残っているか
export function readPlaying(puzzleId: string): boolean {
  try {
    const raw = localStorage.getItem(playLogKey(puzzleId));
    if (!raw) return false;
    return isInProgress(JSON.parse(raw));
  } catch {
    return false;
  }
}

export type ContinueEntry = {
  id: string;
  title: string;
  questionCount: number;
};

// localStorageの "umigame-play:" キーを全部見て、
// 遊びかけのものの中でupdatedAtが一番新しい1件だけ選ぶ
export function findLatestContinue(): ContinueEntry | null {
  let latest: (ContinueEntry & { updatedAt: number }) | null = null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(PLAY_LOG_PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const saved: StoredPlayLog = JSON.parse(raw);
      if (!isInProgress(saved)) continue;
      const updatedAt = saved.updatedAt ?? 0;
      if (!latest || updatedAt > latest.updatedAt) {
        latest = {
          id: key.slice(PLAY_LOG_PREFIX.length),
          title: saved.title ?? "",
          questionCount: saved.questionCount ?? 0,
          updatedAt,
        };
      }
    }
  } catch {
    // 保存データが壊れていたら「なし」として扱う
  }
  return latest;
}
