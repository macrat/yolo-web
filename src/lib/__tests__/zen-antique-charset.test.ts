import fs from "node:fs";
import path from "node:path";
import { marked, type Token } from "marked";
import { describe, expect, test } from "vitest";
import {
  canSetInZenAntique,
  charsMissingFromZenAntique,
  headingFontAttr,
} from "@/lib/zen-antique-charset";
import { parseFrontmatter } from "@/lib/markdown";
import { getAllKanji, getKanjiRadicals } from "@/dictionary/_lib/kanji";
import { getAllYoji } from "@/dictionary/_lib/yoji";
import { getAllColors } from "@/dictionary/_lib/colors";
import {
  COLOR_CATEGORY_LABELS,
  KANJI_GRADE_LABELS,
  YOJI_CATEGORY_LABELS,
} from "@/dictionary/_lib/types";
import { getAllEntries } from "@/humor-dict/data";
import {
  CATEGORY_LABELS,
  SERIES_LABELS,
  getAllBlogPosts,
} from "@/blog/_lib/blog";
import { allPlayContents } from "@/play/registry";
import { quizBySlug } from "@/play/quiz/registry";
import { allToolMetas } from "@/tools/registry";

describe("canSetInZenAntique", () => {
  test("Zen Antique が持つ和文は組める", () => {
    expect(canSetInZenAntique("漢字の辞典——読みと意味……")).toBe(true);
  });

  test("U+0000-007F は Plex が組むので、和文と混ざっても組める", () => {
    expect(canSetInZenAntique("SQL チートシート 2026")).toBe(true);
  });

  test("Zen Antique に無い字を含むと組めない", () => {
    expect(canSetInZenAntique("𠮟る")).toBe(false);
    expect(charsMissingFromZenAntique("𠮟る𠮟")).toEqual(["𠮟"]);
  });
});

describe("headingFontAttr", () => {
  test("組める見出しには属性を付けない", () => {
    expect(headingFontAttr("漢字「山」")).toEqual({});
  });

  test("組めない見出しは本文の書体で組む属性を付ける", () => {
    expect(headingFontAttr("漢字「𠮟」")).toEqual({
      "data-heading-font": "fallback",
    });
  });
});

function collectMarkdownHeadings(tokens: Token[]): string[] {
  return tokens.flatMap((token) => {
    if (token.type === "heading") return [token.text];
    if ("tokens" in token && token.tokens) {
      return collectMarkdownHeadings(token.tokens);
    }
    return [];
  });
}

function blogBodyHeadings(): string[] {
  const dir = path.join(process.cwd(), "src/blog/content");
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { content } = parseFrontmatter(raw);
      return collectMarkdownHeadings(marked.lexer(content));
    });
}

const quizzes = [...quizBySlug.values()];

/**
 * 見出しになるデータの出どころごとの文字列。
 * 辞典の項目の名前（漢字・部首・四字熟語・色名・ユーモア辞典の語）は、ページが headingFontAttr で見出しの組み方を決める。
 * ほかのデータは Zen Antique で組める前提で見出しに描くので、無い字が入ったらここで気づく。
 */
const headingSources: Record<string, string[]> = {
  漢字: getAllKanji().map((entry) => entry.character),
  部首: getKanjiRadicals(),
  学年: Object.values(KANJI_GRADE_LABELS),
  四字熟語: getAllYoji().map((entry) => entry.yoji),
  四字熟語の分類: Object.values(YOJI_CATEGORY_LABELS),
  伝統色: getAllColors().map((entry) => `${entry.name}（${entry.romaji}）`),
  伝統色の分類: Object.values(COLOR_CATEGORY_LABELS),
  ユーモア辞典の語: getAllEntries().map((entry) => entry.word),
  ブログの題: getAllBlogPosts().map((post) => post.title),
  ブログの見出し: blogBodyHeadings(),
  ブログの分類とシリーズ: [
    ...Object.values(CATEGORY_LABELS),
    ...Object.values(SERIES_LABELS),
  ],
  遊びの名前: allPlayContents.map((content) => content.title),
  診断とクイズの設問: quizzes.flatMap((quiz) =>
    quiz.questions.map((question) => question.text),
  ),
  診断とクイズの結果: quizzes.flatMap((quiz) =>
    quiz.results.map((result) => result.title),
  ),
  ツールの名前: allToolMetas.map((meta) => meta.name),
};

describe("見出しになるデータ", () => {
  test("どの出どころも空でない", () => {
    for (const [source, texts] of Object.entries(headingSources)) {
      expect(texts.length, source).toBeGreaterThan(0);
    }
  });

  // 字の表かデータが変わったら、見出しの組み方を見直すために差分を確かめる。
  test("Zen Antique に無い字の一覧", () => {
    const missingBySource = Object.fromEntries(
      Object.entries(headingSources).map(([source, texts]) => [
        source,
        charsMissingFromZenAntique(texts.join("")),
      ]),
    );
    expect(missingBySource).toMatchInlineSnapshot(`
      {
        "ツールの名前": [],
        "ブログの分類とシリーズ": [],
        "ブログの見出し": [],
        "ブログの題": [],
        "ユーモア辞典の語": [],
        "伝統色": [
          "纁",
        ],
        "伝統色の分類": [],
        "四字熟語": [],
        "四字熟語の分類": [],
        "学年": [],
        "漢字": [
          "𠮟",
          "剝",
          "塡",
          "頰",
        ],
        "診断とクイズの結果": [],
        "診断とクイズの設問": [],
        "遊びの名前": [],
        "部首": [
          "彐",
          "疒",
          "辵",
          "黃",
        ],
      }
    `);
  });
});

describe("字の表をクライアントのバンドルに入れない", () => {
  function sourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(fullPath);
      return /\.tsx?$/.test(entry.name) ? [fullPath] : [];
    });
  }

  // "use client" は、先頭の空白とコメントのあとに置かれても有効な指示になる。
  const leadingCommentsAndSpace = /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/;
  function isClientModule(source: string): boolean {
    return /^["']use client["']/.test(
      source.replace(leadingCommentsAndSpace, ""),
    );
  }

  test("先頭のコメントのあとに置いた use client も拾う", () => {
    expect(isClientModule('"use client";\n')).toBe(true);
    expect(isClientModule('// 説明\n/*\n * 説明\n */\n\n"use client";\n')).toBe(
      true,
    );
    expect(isClientModule('import x from "y";\n"use client";\n')).toBe(false);
  });

  test("判定を値として読み込むのはサーバーのモジュールだけ", () => {
    const valueImport =
      /^import\s+(?!type\b)[^;]*from\s+["']@\/lib\/zen-antique-charset["']/m;
    const clientImporters = sourceFiles(path.join(process.cwd(), "src"))
      .filter((file) => !file.includes(`${path.sep}__tests__${path.sep}`))
      .filter((file) => {
        const source = fs.readFileSync(file, "utf-8");
        return isClientModule(source) && valueImport.test(source);
      });
    expect(clientImporters).toEqual([]);
  });
});
