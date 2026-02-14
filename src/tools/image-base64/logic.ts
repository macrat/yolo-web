export interface ImageBase64Result {
  dataUri: string;
  base64: string;
  mimeType: string;
  originalSize: number;
  base64Size: number;
}

export interface ParsedImage {
  dataUri: string;
  mimeType: string;
  base64: string;
}

export const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export function fileToBase64(file: File): Promise<ImageBase64Result> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      // Extract base64 portion after "data:...;base64,"
      const commaIndex = dataUri.indexOf(",");
      const base64 = commaIndex >= 0 ? dataUri.substring(commaIndex + 1) : "";
      const mimeType = file.type || "image/png";
      resolve({
        dataUri,
        base64,
        mimeType,
        originalSize: file.size,
        base64Size: base64.length,
      });
    };
    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"));
    };
    reader.readAsDataURL(file);
  });
}

export function isValidBase64Image(input: string): boolean {
  if (!input || input.trim() === "") return false;

  // Check if it's a valid data URI for an image
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(input)) {
    return true;
  }

  // Check if it's a pure base64 string (at least some characters)
  if (/^[A-Za-z0-9+/]+=*$/.test(input.trim()) && input.trim().length >= 4) {
    return true;
  }

  return false;
}

export function parseBase64Image(input: string): ParsedImage | null {
  if (!input || input.trim() === "") return null;

  const trimmed = input.trim();

  // Parse data URI format
  const dataUriMatch = trimmed.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s,
  );
  if (dataUriMatch) {
    return {
      dataUri: trimmed,
      mimeType: dataUriMatch[1],
      base64: dataUriMatch[2],
    };
  }

  // Try as pure base64 string - assume image/png
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length >= 4) {
    return {
      dataUri: `data:image/png;base64,${trimmed}`,
      mimeType: "image/png",
      base64: trimmed,
    };
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, units.length - 1);
  if (index === 0) return `${bytes} B`;
  return `${(bytes / Math.pow(k, index)).toFixed(2)} ${units[index]}`;
}
