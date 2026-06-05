import { describe, test, expect } from "vitest";
import {
  getCategories,
  getTemplatesByCategory,
  getAllTemplates,
  getTemplateById,
  fillTemplate,
  generateEmail,
  COMMON_FIELD_KEYS,
} from "../logic";

describe("getCategories", () => {
  test("returns 5 categories", () => {
    const categories = getCategories();
    expect(categories).toHaveLength(5);
  });

  test("each category has id and name", () => {
    const categories = getCategories();
    for (const cat of categories) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });

  test("contains expected category ids", () => {
    const categories = getCategories();
    const ids = categories.map((c) => c.id);
    expect(ids).toContain("thanks");
    expect(ids).toContain("apology");
    expect(ids).toContain("request");
    expect(ids).toContain("decline");
    expect(ids).toContain("greeting");
  });
});

describe("getTemplatesByCategory", () => {
  test("thanks category has 3 templates", () => {
    expect(getTemplatesByCategory("thanks")).toHaveLength(3);
  });

  test("apology category has 2 templates", () => {
    expect(getTemplatesByCategory("apology")).toHaveLength(2);
  });

  test("request category has 3 templates", () => {
    expect(getTemplatesByCategory("request")).toHaveLength(3);
  });

  test("decline category has 2 templates", () => {
    expect(getTemplatesByCategory("decline")).toHaveLength(2);
  });

  test("greeting category has 2 templates", () => {
    expect(getTemplatesByCategory("greeting")).toHaveLength(2);
  });

  test("returns empty array for unknown category", () => {
    // Cast to bypass type-check for testing edge case
    expect(getTemplatesByCategory("nonexistent" as "thanks")).toHaveLength(0);
  });
});

describe("getAllTemplates", () => {
  test("returns 12 templates", () => {
    expect(getAllTemplates()).toHaveLength(12);
  });

  test("each template has common fields (recipientCompany, recipientName, senderName)", () => {
    const templates = getAllTemplates();
    for (const template of templates) {
      const fieldKeys = template.fields.map((f) => f.key);
      for (const commonKey of COMMON_FIELD_KEYS) {
        expect(fieldKeys).toContain(commonKey);
      }
    }
  });

  test("all template IDs are unique", () => {
    const templates = getAllTemplates();
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getTemplateById", () => {
  test("returns template for existing id", () => {
    const template = getTemplateById("thanks-visit");
    expect(template).toBeDefined();
    expect(template!.name).toBe("訪問のお礼");
  });

  test("returns undefined for non-existing id", () => {
    expect(getTemplateById("nonexistent")).toBeUndefined();
  });
});

describe("fillTemplate", () => {
  test("replaces single placeholder", () => {
    expect(fillTemplate("Hello {{name}}", { name: "World" })).toBe(
      "Hello World",
    );
  });

  test("replaces multiple different placeholders", () => {
    const result = fillTemplate("{{greeting}} {{name}}", {
      greeting: "Hello",
      name: "World",
    });
    expect(result).toBe("Hello World");
  });

  test("replaces same placeholder multiple times", () => {
    const result = fillTemplate("{{name}} and {{name}}", { name: "Alice" });
    expect(result).toBe("Alice and Alice");
  });

  test("replaces with empty string", () => {
    const result = fillTemplate("Hello {{name}}!", { name: "" });
    expect(result).toBe("Hello !");
  });

  test("leaves undefined placeholder untouched", () => {
    const result = fillTemplate("Hello {{name}} {{unknown}}", {
      name: "World",
    });
    expect(result).toBe("Hello World {{unknown}}");
  });

  test("returns template unchanged when no placeholders", () => {
    expect(fillTemplate("No placeholders here", { key: "val" })).toBe(
      "No placeholders here",
    );
  });
});

describe("generateEmail", () => {
  test("generates subject and body with values", () => {
    const template = getTemplateById("thanks-visit")!;
    const values: Record<string, string> = {
      recipientCompany: "テスト株式会社",
      recipientName: "田中太郎",
      visitDate: "2月21日",
      topic: "新サービスのご提案",
      senderName: "山田花子",
    };
    const result = generateEmail(template, values);
    expect(result.subject).toBe("ご訪問のお礼");
    expect(result.body).toContain("テスト株式会社");
    expect(result.body).toContain("田中太郎");
    expect(result.body).toContain("山田花子");
    expect(result.body).toContain("新サービスのご提案");
  });

  test("does not throw when all fields are empty strings", () => {
    const template = getTemplateById("thanks-visit")!;
    const values: Record<string, string> = {};
    for (const field of template.fields) {
      values[field.key] = "";
    }
    const result = generateEmail(template, values);
    expect(result.subject).toBeTruthy();
    expect(result.body).toBeTruthy();
  });

  test("generates email for all templates without error", () => {
    const templates = getAllTemplates();
    for (const template of templates) {
      const values: Record<string, string> = {};
      for (const field of template.fields) {
        values[field.key] = `test-${field.key}`;
      }
      const result = generateEmail(template, values);
      expect(result.subject).toBeTruthy();
      expect(result.body).toBeTruthy();
    }
  });

  test("template fields and placeholders are consistent", () => {
    const templates = getAllTemplates();
    for (const template of templates) {
      // Extract all placeholders from subject and body
      const placeholders = new Set<string>();
      const regex = /\{\{(\w+)\}\}/g;
      let match;
      while ((match = regex.exec(template.subjectTemplate)) !== null) {
        placeholders.add(match[1]);
      }
      while ((match = regex.exec(template.bodyTemplate)) !== null) {
        placeholders.add(match[1]);
      }

      // All placeholders should be present in fields
      const fieldKeys = new Set(template.fields.map((f) => f.key));
      for (const placeholder of placeholders) {
        expect(fieldKeys.has(placeholder)).toBe(true);
      }
    }
  });

  /**
   * 是正テスト(E-4拡張): 12テンプレート全て、placeholder フォールバックで初期表示した際に
   * 破綻文(同語二重・前置きフレーズ重複・連体終止+体言の組合せ)が生成されないことを検証する。
   * これはレビュアー指摘(critical: thanks-visit の二重「について」・decline-proposalの前置き重複、
   * major: apology-mistake の「あったの件」不自然接続)に対応した恒久的な回帰テスト。
   */
  test("all templates: initial preview with placeholder fallback produces no broken Japanese text", () => {
    const templates = getAllTemplates();
    for (const template of templates) {
      // 初期表示と同等: placeholder フォールバックで全フィールドを埋める
      const values: Record<string, string> = {};
      for (const field of template.fields) {
        values[field.key] = field.defaultValue ?? field.placeholder;
      }
      const result = generateEmail(template, values);
      const body = result.body;

      // パターン1: 同一語が2回連続する破綻パターン
      // 「について」「ましたが、」等が連続するケースを検出
      // 同じ4文字以上の日本語フレーズが直後にもう1回繰り返されるパターン
      const doublePhrase = /(.{4,})\1/;
      expect(body).not.toMatch(
        doublePhrase,
        // テンプレート名をエラーメッセージに含める
      );

      // パターン2: 「について」が連続する具体的なケース
      expect(body).not.toContain("についてについて");

      // パターン3: 「社内で慎重に検討いたしましたが、社内で慎重に」のような前置きフレーズ重複
      const lines = body.split("\n");
      for (const line of lines) {
        // 1行内で「ましたが、」の後に「ましたが、」が再出現しないこと
        const searchPhrase = "ましたが、";
        const firstIdx = line.indexOf(searchPhrase);
        if (firstIdx !== -1) {
          const secondIdx = line.indexOf(
            searchPhrase,
            firstIdx + searchPhrase.length,
          );
          expect(secondIdx).toBe(
            -1,
            // テンプレート ID をエラーに含める
          );
        }
      }

      // パターン4: 連体終止形(「〜た」「〜な」「〜い」)+「の件」の不自然な接続
      // 例: 「誤りがあったの件」「難しい状況の件」
      // 注: 文語体では「あったの件」より「あったことの件」「誤りの件」が自然
      expect(body).not.toMatch(/た(?:こと)?の件/);
      expect(body).not.toMatch(/い(?:こと)?の件/);
      expect(body).not.toMatch(/な(?:こと)?の件/);
    }
  });
});
