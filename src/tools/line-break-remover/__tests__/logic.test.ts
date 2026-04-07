import { describe, test, expect } from "vitest";
import { removeLineBreaks, normalizeLineEndings } from "../logic";

// --- normalizeLineEndings ---

describe("normalizeLineEndings", () => {
  test("\\r\\n を \\n に正規化する", () => {
    expect(normalizeLineEndings("a\r\nb")).toBe("a\nb");
  });

  test("\\r を \\n に正規化する", () => {
    expect(normalizeLineEndings("a\rb")).toBe("a\nb");
  });

  test("\\n はそのまま", () => {
    expect(normalizeLineEndings("a\nb")).toBe("a\nb");
  });

  test("混在した改行コードを正規化する", () => {
    expect(normalizeLineEndings("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
  });
});

// --- removeLineBreaks: remove モード ---

describe("removeLineBreaks - remove モード", () => {
  test("単一改行を削除する", () => {
    const result = removeLineBreaks("abc\ndef", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("abcdef");
    expect(result.removedCount).toBe(1);
    expect(result.error).toBeUndefined();
  });

  test("複数改行をすべて削除する", () => {
    const result = removeLineBreaks("a\nb\nc", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("abc");
    expect(result.removedCount).toBe(2);
  });

  test("\\r\\n の改行を削除する", () => {
    const result = removeLineBreaks("a\r\nb", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("ab");
    expect(result.removedCount).toBe(1);
  });

  test("\\r の改行を削除する", () => {
    const result = removeLineBreaks("a\rb", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("ab");
    expect(result.removedCount).toBe(1);
  });

  test("mergeConsecutive=true: 連続改行を1つに統合してから削除", () => {
    // 連続改行を1つに統合すると、実質的に削除される改行が減る
    const result = removeLineBreaks("a\n\n\nb", {
      mode: "remove",
      mergeConsecutive: true,
      smartPdfJoinStyle: "remove",
    });
    // 3連続 → 1つに統合 → その1つを削除
    expect(result.output).toBe("ab");
    // removedCount は元の改行数ではなく、実際に削除した改行数
    expect(result.removedCount).toBe(1);
  });

  test("mergeConsecutive=false: 連続改行をすべて削除する", () => {
    const result = removeLineBreaks("a\n\n\nb", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("ab");
    expect(result.removedCount).toBe(3);
  });
});

// --- removeLineBreaks: replace-space モード ---

describe("removeLineBreaks - replace-space モード", () => {
  test("単一改行をスペースに置換する", () => {
    const result = removeLineBreaks("abc\ndef", {
      mode: "replace-space",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("abc def");
    expect(result.removedCount).toBe(1);
  });

  test("複数改行をすべてスペースに置換する", () => {
    const result = removeLineBreaks("a\nb\nc", {
      mode: "replace-space",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("a b c");
    expect(result.removedCount).toBe(2);
  });

  test("mergeConsecutive=true: 連続改行を1つのスペースに置換", () => {
    const result = removeLineBreaks("a\n\n\nb", {
      mode: "replace-space",
      mergeConsecutive: true,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("a b");
    expect(result.removedCount).toBe(1);
  });

  test("mergeConsecutive=false: 各改行を個別にスペースに置換", () => {
    const result = removeLineBreaks("a\n\nb", {
      mode: "replace-space",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("a  b");
    expect(result.removedCount).toBe(2);
  });
});

// --- removeLineBreaks: smart-pdf モード ---

describe("removeLineBreaks - smart-pdf モード（削除）", () => {
  test("日本語テキスト: 単独改行を削除、段落間の空行を保持", () => {
    const input =
      "これはテストです。\nこのツールは便利です。\n\n次の段落です。";
    const result = removeLineBreaks(input, {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    // 単独改行は削除、2連続改行（段落区切り）は保持
    expect(result.output).toBe(
      "これはテストです。このツールは便利です。\n\n次の段落です。",
    );
    expect(result.removedCount).toBe(1);
  });

  test("段落内の複数の単独改行を削除する", () => {
    const input = "行1\n行2\n行3\n\n段落2";
    const result = removeLineBreaks(input, {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("行1行2行3\n\n段落2");
    expect(result.removedCount).toBe(2);
  });
});

describe("removeLineBreaks - smart-pdf モード（スペース）", () => {
  test("英文テキスト: 単独改行をスペースに置換、段落間を保持", () => {
    const input =
      "This is a test.\nThis tool is useful.\n\nNext paragraph here.";
    const result = removeLineBreaks(input, {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "space",
    });
    expect(result.output).toBe(
      "This is a test. This tool is useful.\n\nNext paragraph here.",
    );
    expect(result.removedCount).toBe(1);
  });
});

describe("removeLineBreaks - smart-pdf モード（日英混在）", () => {
  test("日英混在テキスト: 単独改行を削除（remove）", () => {
    const input = "日本語テキスト。\nEnglish text here.\n\n次の段落。";
    const result = removeLineBreaks(input, {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe(
      "日本語テキスト。English text here.\n\n次の段落。",
    );
    expect(result.removedCount).toBe(1);
  });
});

describe("removeLineBreaks - smart-pdf モード（3行以上の連続改行）", () => {
  test("3行以上の連続改行を1つの空行（2個の\\n）に正規化する", () => {
    const input = "段落1\n\n\n段落2";
    const result = removeLineBreaks(input, {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    // 3連続 \n → 2連続 \n（段落区切り）に正規化
    expect(result.output).toBe("段落1\n\n段落2");
  });

  test("4行以上の連続改行も1つの空行に正規化する", () => {
    const input = "段落1\n\n\n\n\n段落2";
    const result = removeLineBreaks(input, {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("段落1\n\n段落2");
  });
});

// --- エッジケース ---

describe("removeLineBreaks - エッジケース", () => {
  test("空入力", () => {
    const result = removeLineBreaks("", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("");
    expect(result.removedCount).toBe(0);
    expect(result.error).toBeUndefined();
  });

  test("改行なし入力はそのまま返す", () => {
    const result = removeLineBreaks("abc def", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("abc def");
    expect(result.removedCount).toBe(0);
  });

  test("10万文字超でエラーを返す", () => {
    const longInput = "a".repeat(100_001);
    const result = removeLineBreaks(longInput, {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.output).toBe("");
    expect(result.error).toBeDefined();
    expect(result.error).toContain("100,000");
  });

  test("ちょうど10万文字は正常に処理する", () => {
    const input = "a".repeat(100_000);
    const result = removeLineBreaks(input, {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.error).toBeUndefined();
    expect(result.output).toBe(input);
  });
});

// --- removedCount の正確性 ---

describe("removeLineBreaks - removedCount の正確性", () => {
  test("remove モード: 改行数を正確にカウント", () => {
    const result = removeLineBreaks("a\nb\nc\nd", {
      mode: "remove",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.removedCount).toBe(3);
  });

  test("replace-space モード: 置換数を正確にカウント", () => {
    const result = removeLineBreaks("a\nb\nc", {
      mode: "replace-space",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.removedCount).toBe(2);
  });

  test("smart-pdf モード: 処理した単独改行数をカウント", () => {
    // 段落1内の2つの単独改行が削除対象
    const result = removeLineBreaks("a\nb\nc\n\nd", {
      mode: "smart-pdf",
      mergeConsecutive: false,
      smartPdfJoinStyle: "remove",
    });
    expect(result.removedCount).toBe(2);
  });
});
