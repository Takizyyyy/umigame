// 質問ログをシェアURLに埋め込むための圧縮/復元。
// サーバーやDBを使わず、ブラウザ標準のCompressionStreamでdeflate圧縮した
// JSONをURLフラグメント(#log=...)に載せる。真相はログに含まれない(ネタバレ防止)。

export interface SharedLogEntry {
  /** 発言者: p=プレイヤー, a=出題者AI, h=ヒント */
  r: "p" | "a" | "h";
  /** 本文 */
  t: string;
}

export interface SharedLog {
  puzzleId: string;
  log: SharedLogEntry[];
}

// ChatMessageのrole("player"/"ai"/"hint")とSharedLogEntryのr("p"/"a"/"h")の変換。
// この対応表を両方向の唯一の定義元にする(呼び出し側で独自に分岐させない)
const ROLE_TO_SHORT = { player: "p", ai: "a", hint: "h" } as const;
const SHORT_TO_ROLE = { p: "player", a: "ai", h: "hint" } as const;

export function toShortRole(role: keyof typeof ROLE_TO_SHORT): SharedLogEntry["r"] {
  return ROLE_TO_SHORT[role];
}

export function fromShortRole(r: SharedLogEntry["r"]): keyof typeof ROLE_TO_SHORT {
  return SHORT_TO_ROLE[r];
}

async function streamToBytes(stream: ReadableStream): Promise<Uint8Array> {
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// 上限を超えたら途中で読むのをやめる版。
// 全部読み終えてからサイズを見るのでは、巨大データを一度メモリに載せてしまうので意味がない
async function streamToBytesLimited(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array | null> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) return null;
      chunks.push(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

// URLに安全なbase64(+/=を使わないbase64url)へ変換
function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replaceAll("-", "+").replaceAll("_", "/"));
  // Uint8Array.from だと型がBlobに渡せない形になるため、明示的にArrayBufferから作る
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function encodeLog(data: SharedLog): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(data));
  const compressed = new Blob([json])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return toBase64Url(await streamToBytes(compressed));
}

// 圧縮データは小さくても展開すると巨大になりうる(圧縮爆弾)。
// 正規のログは30問分でも数KBなので、それを大きく超えたら展開を打ち切る
const MAX_DECOMPRESSED_BYTES = 100_000;
// 表示する行数・1行の長さの上限(質問30回+ヒント3回より十分大きい値)
const MAX_LOG_ENTRIES = 100;
const MAX_ENTRY_LENGTH = 500;

export async function decodeLog(encoded: string): Promise<SharedLog | null> {
  try {
    const decompressed = new Blob([fromBase64Url(encoded)])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    const bytes = await streamToBytesLimited(
      decompressed,
      MAX_DECOMPRESSED_BYTES,
    );
    if (!bytes) return null; // 上限超え = 細工されたURLとみなす
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as SharedLog;
    if (typeof data.puzzleId !== "string" || !Array.isArray(data.log)) return null;
    // 外から来るデータなので、形式が正しい行だけ通す
    data.log = data.log
      .filter(
        (m) =>
          (m.r === "p" || m.r === "a" || m.r === "h") &&
          typeof m.t === "string" &&
          m.t.length <= MAX_ENTRY_LENGTH,
      )
      .slice(0, MAX_LOG_ENTRIES);
    return data;
  } catch {
    return null; // 壊れたURL・未対応ブラウザでは黙って無視する
  }
}
