import qrcode from "qrcode-generator";
import { DEFAULT_LEVEL, type ErrorCorrectionLevel } from "./levels";

/**
 * 作れなかった理由。
 * - "tooLong": 文が、選んだエラー訂正レベルの QR の最大の容量を超えた。
 * - "failed": それ以外（画像を描けなかったなど）。
 */
export type QrCodeFailure = "tooLong" | "failed";

export type QrCodeResult =
  | {
      success: true;
      /** PNG の data URL。画面に見せる画像と、保存する画像は同じもの。 */
      dataUrl: string;
      /** 画面に見せる一辺の CSS px。PNG はこの2倍の画素で描いてある。 */
      size: number;
    }
  | { success: false; error: QrCodeFailure };

/**
 * 画面に見せる1モジュールの一辺の CSS px。短い URL の QR（29モジュール）で一辺 148px、96dpi の画面でおよそ
 * 39mm 四方になり、PC の画面に出した QR をスマートフォンのカメラで読める。等倍の画面でも1モジュールが整数の
 * 画素に乗る。
 */
const CELL_SIZE = 4;
/**
 * PNG を画面の何倍の画素で描くか。高い解像度の画面でもモジュールの境がぼけず、保存した画像を印刷や資料に
 * 使うときも1モジュールが8画素ある。整数倍なので、等倍の画面で半分に縮めても境が揃う。
 */
const PNG_SCALE = 2;
/** 周りの白い余白（クワイエットゾーン）のモジュールの数。読み取りに要る規格の最小の 4。 */
const MARGIN_CELLS = 4;

const utf8 = new TextEncoder();

/** 文を UTF-8 のバイトの並びにする。 */
export function toUtf8Bytes(text: string): number[] {
  return Array.from(utf8.encode(text));
}

// 文を UTF-8 のバイトにして符号にする。ライブラリの既定は字のコードの下位8ビットだけを取るので、
// 日本語の文が別の字の並びになり、読み取ると化ける。
qrcode.stringToBytes = toUtf8Bytes;

/**
 * QR を PNG に描く。renderTo2dContext は余白を持たないので、余白ぶん大きいキャンバスを白で塗り、
 * モジュールを余白ぶんずらして描く。
 */
function renderPng(
  qr: ReturnType<typeof qrcode>,
  size: number,
): string | undefined {
  const cell = CELL_SIZE * PNG_SCALE;
  const pixels = size * PNG_SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = pixels;
  canvas.height = pixels;

  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, pixels, pixels);
  ctx.save();
  ctx.translate(MARGIN_CELLS * cell, MARGIN_CELLS * cell);
  qr.renderTo2dContext(ctx, cell);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/** 文を QR コードの PNG にする。空の文は呼び出し側が渡さない。 */
export function generateQrCode(
  text: string,
  errorCorrection: ErrorCorrectionLevel = DEFAULT_LEVEL,
): QrCodeResult {
  const qr = qrcode(0, errorCorrection);
  try {
    // 型番号 0 で、文の長さに合う型を選ばせる。容量を超えると、ライブラリは文字列を投げる。
    qr.addData(text);
    qr.make();
  } catch {
    return { success: false, error: "tooLong" };
  }

  const size = (qr.getModuleCount() + MARGIN_CELLS * 2) * CELL_SIZE;
  const dataUrl = renderPng(qr, size);
  if (!dataUrl) return { success: false, error: "failed" };
  return { success: true, dataUrl, size };
}
