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
    return JSON.parse(raw) as ProgressMap;
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
// 他タブでの更新(storageイベント)を検知するために使う
export function subscribeToProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
