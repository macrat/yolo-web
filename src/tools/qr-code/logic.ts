import qrcode from "qrcode-generator";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QrCodeResult {
  success: boolean;
  svgTag: string;
  dataUrl: string;
  error?: string;
}

// Quiet Zone: QR 仕様上の必須要件（最小 4 セル分の白マージン）
// cellSize=8px, margin=4 セルで既存 createDataURL(8, 4) と同等のサイズ感を維持する
const CELL_SIZE = 8;
const MARGIN_CELLS = 4;

/**
 * canvas を使って PNG DataURL を生成する（案Y: 真の PNG 化）。
 * renderTo2dContext は margin パラメータを持たないため、
 * canvas サイズ拡大 + translate で Quiet Zone を自前実装する（cycle-207 T-2 計画書 L160-168）。
 */
function createPngDataUrl(
  qr: ReturnType<typeof qrcode>,
  cellSize: number,
  marginCells: number,
): string {
  const moduleCount = qr.getModuleCount();
  const totalSize = (moduleCount + marginCells * 2) * cellSize;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize;
  canvas.height = totalSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D rendering context");
  }

  // 全面を白で塗りつぶして Quiet Zone を確保する
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, totalSize, totalSize);

  // QR モジュール本体を margin 分オフセットして描画する
  ctx.save();
  ctx.translate(marginCells * cellSize, marginCells * cellSize);
  qr.renderTo2dContext(ctx, cellSize);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function generateQrCode(
  text: string,
  errorCorrection: ErrorCorrectionLevel = "M",
): QrCodeResult {
  if (!text) {
    return { success: false, svgTag: "", dataUrl: "", error: "Input is empty" };
  }

  try {
    // typeNumber 0 = auto-detect
    const qr = qrcode(0, errorCorrection);
    qr.addData(text);
    qr.make();

    const svgTag = qr.createSvgTag(4, 4);
    // PNG DataURL: renderTo2dContext + toDataURL("image/png") で GIF ではなく真の PNG を生成する
    const dataUrl = createPngDataUrl(qr, CELL_SIZE, MARGIN_CELLS);

    return { success: true, svgTag, dataUrl };
  } catch (e) {
    return {
      success: false,
      svgTag: "",
      dataUrl: "",
      error:
        e instanceof Error
          ? e.message
          : "QR code generation failed. Text may be too long.",
    };
  }
}
