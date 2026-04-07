/**
 * 改行削除ツールのロジック
 */

/** 変換モード */
export type RemoveMode = "remove" | "replace-space" | "smart-pdf";

/** PDFスマートモードでの行内改行の処理方法 */
export type SmartPdfJoinStyle = "remove" | "space";

/** 変換オプション */
export interface RemoveLineBreakOptions {
  /** 変換モード */
  mode: RemoveMode;
  /** 連続する改行を1つにまとめる（remove/replace-spaceモード用） */
  mergeConsecutive: boolean;
  /** 行内改行の処理方法（smart-pdfモード用） */
  smartPdfJoinStyle: SmartPdfJoinStyle;
}

/** 変換結果 */
export interface RemoveLineBreakResult {
  output: string;
  removedCount: number;
  error?: string;
}

/** 入力の最大文字数（超過した場合はエラーを返す） */
const MAX_INPUT_LENGTH = 100_000;

/**
 * 改行コードを \n に正規化する（\r\n、\r を \n に変換）
 */
export function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * 改行を削除・置換する
 *
 * - remove: すべての改行を削除する
 * - replace-space: すべての改行をスペースに置換する
 * - smart-pdf: 段落区切り（空行）は保持し、行内改行のみ処理する（PDF貼り付け用）
 */
export function removeLineBreaks(
  input: string,
  options: RemoveLineBreakOptions,
): RemoveLineBreakResult {
  if (!input) return { output: "", removedCount: 0 };

  if (input.length > MAX_INPUT_LENGTH) {
    return {
      output: "",
      removedCount: 0,
      error: `テキストが長すぎます。100,000文字以内で入力してください。`,
    };
  }

  const normalized = normalizeLineEndings(input);
  const { mode, mergeConsecutive, smartPdfJoinStyle } = options;

  if (mode === "smart-pdf") {
    return processSmartPdf(normalized, smartPdfJoinStyle);
  }

  const replacement = mode === "replace-space" ? " " : "";
  let removedCount = 0;

  if (mergeConsecutive) {
    // 連続する改行をまず1つにまとめてから置換
    const collapsed = normalized.replace(/\n{2,}/g, "\n");
    const output = collapsed.replace(/\n/g, () => {
      removedCount++;
      return replacement;
    });
    return { output, removedCount };
  }

  const output = normalized.replace(/\n/g, () => {
    removedCount++;
    return replacement;
  });

  return { output, removedCount };
}

/**
 * PDFスマートモードの処理
 *
 * 空行（段落区切り）は保持し、行内改行のみを削除またはスペースに置換する。
 * 3行以上の連続改行は1つの段落区切り（空行）に正規化する。
 * PDFからコピーしたテキストの処理に適している。
 */
function processSmartPdf(
  input: string,
  joinStyle: SmartPdfJoinStyle,
): RemoveLineBreakResult {
  // 3行以上の連続改行を2行（段落区切り）に正規化
  const normalized = input.replace(/\n{3,}/g, "\n\n");

  // 段落を空行で分割
  const paragraphs = normalized.split(/\n{2}/);
  let totalRemovedCount = 0;

  const processedParagraphs = paragraphs.map((paragraph) => {
    // 段落内の改行数をカウント
    const lineBreaksInParagraph = (paragraph.match(/\n/g) || []).length;
    totalRemovedCount += lineBreaksInParagraph;

    if (joinStyle === "space") {
      return paragraph.replace(/\n/g, " ");
    }
    return paragraph.replace(/\n/g, "");
  });

  return {
    output: processedParagraphs.join("\n\n"),
    removedCount: totalRemovedCount,
  };
}
