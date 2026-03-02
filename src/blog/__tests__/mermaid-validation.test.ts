import fs from "fs";
import path from "path";
import { describe, test, expect, beforeAll } from "vitest";

/**
 * ブログ記事に含まれる全Mermaidブロックが正しくレンダリングできることを検証するテスト。
 *
 * mermaid.parse() ではなく mermaid.render() を使う理由:
 * parse() では構文上の問題しか検出できず、ganttチャートのタスク名にコロンが含まれる等の
 * 意味的エラーは render 段階で初めて発生するため。
 */

interface MermaidBlock {
  code: string;
  blockIndex: number;
  startLine: number;
}

/** Markdown テキストから全 Mermaid コードブロックを抽出する */
function extractMermaidBlocks(markdown: string): MermaidBlock[] {
  const pattern = /^```mermaid\n([\s\S]*?)^```/gm;
  const blocks: MermaidBlock[] = [];
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = pattern.exec(markdown)) !== null) {
    // match.index はマッチ開始位置（文字数）。そこまでの改行数 + 1 が行番号
    const startLine = markdown.substring(0, match.index).split("\n").length;
    blocks.push({
      code: match[1],
      blockIndex,
      startLine,
    });
    blockIndex++;
  }

  return blocks;
}

const CONTENT_DIR = path.resolve(__dirname, "../content");

describe("ブログ記事のMermaid全数バリデーション", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mermaid: any;

  beforeAll(async () => {
    // jsdom には SVGElement.getBBox / getComputedTextLength が実装されていないため、
    // mermaid.render() が動作するようにモックを追加する
    // getBBox は SVGGraphicsElement、getComputedTextLength は SVGTextContentElement の
    // プロパティであり SVGElement 上には存在しないため as any でキャストする
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (SVGElement.prototype as any).getBBox = function () {
      return { x: 0, y: 0, width: 100, height: 20 } as SVGRect;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (SVGElement.prototype as any).getComputedTextLength = function () {
      return 50;
    };

    // mermaid は ESM パッケージのため動的 import を使用
    const mermaidModule = await import("mermaid");
    mermaid = mermaidModule.default;
    mermaid.initialize({ startOnLoad: false });
  });

  // content ディレクトリの全 .md ファイルを走査
  const mdFiles = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  for (const filename of mdFiles) {
    const filePath = path.join(CONTENT_DIR, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    const blocks = extractMermaidBlocks(content);

    if (blocks.length === 0) {
      continue;
    }

    describe(filename, () => {
      for (const block of blocks) {
        test(`ブロック #${block.blockIndex} (行 ${block.startLine}) が正常にレンダリングできる`, async () => {
          // render ID はファイル名+インデックスから一意に生成
          const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-]/g, "_");
          const renderId = `mermaid-validation-${sanitizedFilename}-${block.blockIndex}`;

          try {
            const result = await mermaid.render(renderId, block.code);
            // SVG が生成されたことを検証
            expect(result.svg).toBeTruthy();
          } catch (error: unknown) {
            const codePreview = block.code.split("\n").slice(0, 5).join("\n");
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            throw new Error(
              `Mermaidレンダリングエラー\n` +
                `  ファイル: ${filename}\n` +
                `  ブロック: #${block.blockIndex} (行 ${block.startLine})\n` +
                `  コード先頭:\n${codePreview}\n` +
                `  エラー: ${errorMessage}`,
            );
          }
        });
      }
    });
  }
});
