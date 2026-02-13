import qrcode from "qrcode-generator";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QrCodeResult {
  success: boolean;
  svgTag: string;
  dataUrl: string;
  error?: string;
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
    const dataUrl = qr.createDataURL(8, 4);

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
