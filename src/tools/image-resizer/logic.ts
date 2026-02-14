export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  outputFormat: "image/png" | "image/jpeg" | "image/webp";
  quality: number; // 0.1 - 1.0, only for jpeg/webp
}

export interface ImageInfo {
  width: number;
  height: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number | null,
  targetHeight: number | null,
  maintainAspectRatio: boolean,
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.max(1, Math.round(targetWidth ?? originalWidth)),
      height: Math.max(1, Math.round(targetHeight ?? originalHeight)),
    };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (targetWidth != null && targetHeight != null) {
    // Both specified with aspect ratio lock: use width as primary
    const w = Math.max(1, Math.round(targetWidth));
    const h = Math.max(1, Math.round(w / aspectRatio));
    return { width: w, height: h };
  }

  if (targetWidth != null) {
    const w = Math.max(1, Math.round(targetWidth));
    const h = Math.max(1, Math.round(w / aspectRatio));
    return { width: w, height: h };
  }

  if (targetHeight != null) {
    const h = Math.max(1, Math.round(targetHeight));
    const w = Math.max(1, Math.round(h * aspectRatio));
    return { width: w, height: h };
  }

  return { width: originalWidth, height: originalHeight };
}

export function calculateDimensionsFromPercent(
  originalWidth: number,
  originalHeight: number,
  percent: number,
): { width: number; height: number } {
  const clampedPercent = Math.max(1, Math.min(1000, percent));
  const scale = clampedPercent / 100;
  return {
    width: Math.max(1, Math.round(originalWidth * scale)),
    height: Math.max(1, Math.round(originalHeight * scale)),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getOutputMimeType(
  format: string,
): "image/png" | "image/jpeg" | "image/webp" {
  switch (format) {
    case "image/jpeg":
      return "image/jpeg";
    case "image/webp":
      return "image/webp";
    default:
      return "image/png";
  }
}
