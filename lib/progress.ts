// クリア状況をブラウザのlocalStorageだけに保存するヘルパー(サーバーには送らない)
// このファイルはクライアントコンポーネントから使う想定だが、
// typeof window ガードを入れているのでサーバー側で読み込まれても壊れない。

export type ProgressStatus = "cleared" | "revealed";

export type ProgressMap = {
  [puzzleId: string]: { status: ProgressStatus; questions?: number };
};

const STORAGE_KEY = "umigame-progress-v1";

export function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    // 拡張機能等による書き換えでnullや配列が入っていることがある。
    // 形が想定と違えば空扱いにし、呼び出し側(ProgressBadge等)が
    // parsed[puzzleId] で例外を投げて画面が真っ白になるのを防ぐ
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(
  puzzleId: string,
  entry: { status: ProgressStatus; questions?: number }
) {
  if (typeof window === "undefined") return;
  const current = readProgress();
  current[puzzleId] = entry;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // 保存に失敗しても致命的ではないので何もしない(容量オーバー等)
  }
}

// useSyncExternalStore用の購読関数。
// 他タブでlocalStorageが変わったこと(storageイベント)を検知するために使う。
// クリア状況だけでなく、遊びかけログの監視にも共通で使う
export function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
