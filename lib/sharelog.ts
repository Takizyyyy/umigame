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

async function streamToBytes(stream: ReadableStream): Promise<Uint8Array> {
  return new Uint8Array(await new Response(stream).arrayBuffer());
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

export async function decodeLog(encoded: string): Promise<SharedLog | null> {
  try {
    const decompressed = new Blob([fromBase64Url(encoded)])
      .stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    const json = new TextDecoder().decode(await streamToBytes(decompressed));
    const data = JSON.parse(json) as SharedLog;
    if (typeof data.puzzleId !== "string" || !Array.isArray(data.log)) return null;
    // 外から来るデータなので、形式が正しい行だけ通す
    data.log = data.log.filter(
      (m) =>
        (m.r === "p" || m.r === "a" || m.r === "h") && typeof m.t === "string",
    );
    return data;
  } catch {
    return null; // 壊れたURL・未対応ブラウザでは黙って無視する
  }
}
