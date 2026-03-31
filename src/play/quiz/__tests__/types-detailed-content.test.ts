import { describe, it, expect } from "vitest";
import type {
  QuizResult,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  DetailedContent,
} from "../types";

/**
 * Tests for DetailedContent union type and related interfaces.
 * Verifies backward compatibility (QuizResultDetailedContent) and
 * the new ContrarianFortuneDetailedContent variant.
 */
describe("QuizResultDetailedContent", () => {
  it("accepts the existing shape without variant field", () => {
    const content: QuizResultDetailedContent = {
      traits: ["特徴1", "特徴2"],
      behaviors: ["あるある1", "あるある2"],
      advice: "アドバイスのメッセージ",
    };
    expect(content.traits).toHaveLength(2);
    expect(content.behaviors).toHaveLength(2);
    expect(content.advice).toBe("アドバイスのメッセージ");
  });

  it("variant field is undefined when not set", () => {
    const content: QuizResultDetailedContent = {
      traits: [],
      behaviors: [],
      advice: "test",
    };
    // variant は明示的に undefined として定義されている
    expect(content.variant).toBeUndefined();
  });
});

describe("ContrarianFortuneDetailedContent", () => {
  it("accepts all required fields with variant='contrarian-fortune'", () => {
    const content: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "逆張りの天才",
      coreSentence: "流行に背を向けて独自の道を行く、真のオリジナル。",
      behaviors: ["みんながAと言えばBを選ぶ", "ランキング上位は避ける"],
      persona:
        "このタイプの人は常に一歩引いた視点で物事を見ている。流行を追うことに意味を感じず、独自の美学で選択し続ける。周囲が熱狂するほど冷静になれるのが特技。ユーモアと皮肉が混ざった独特の表現で場を和ませることも多い。",
      thirdPartyNote:
        "一緒にいると常識を揺さぶられる体験ができる。意外な選択肢を示してくれる存在。",
    };
    expect(content.variant).toBe("contrarian-fortune");
    expect(content.catchphrase).toBe("逆張りの天才");
    expect(content.behaviors).toHaveLength(2);
    expect(content.humorMetrics).toBeUndefined();
  });

  it("accepts optional humorMetrics field", () => {
    const content: ContrarianFortuneDetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "逆張り指数MAX",
      coreSentence: "逆を行くことが美学。",
      behaviors: ["定番を避ける"],
      persona: "説明文",
      thirdPartyNote: "第三者視点",
      humorMetrics: [
        { label: "逆張り指数", value: "999%" },
        { label: "流行嫌い度", value: "S級" },
      ],
    };
    expect(content.humorMetrics).toHaveLength(2);
    expect(content.humorMetrics![0].label).toBe("逆張り指数");
    expect(content.humorMetrics![0].value).toBe("999%");
  });
});

describe("DetailedContent union type", () => {
  it("can hold QuizResultDetailedContent", () => {
    const content: DetailedContent = {
      traits: ["特徴"],
      behaviors: ["あるある"],
      advice: "メッセージ",
    };
    // variant が undefined なら QuizResultDetailedContent として扱える
    expect(content.variant).toBeUndefined();
  });

  it("can hold ContrarianFortuneDetailedContent", () => {
    const content: DetailedContent = {
      variant: "contrarian-fortune",
      catchphrase: "キャッチコピー",
      coreSentence: "核心文",
      behaviors: ["あるある"],
      persona: "人物像",
      thirdPartyNote: "第三者視点",
    };
    expect(content.variant).toBe("contrarian-fortune");
  });

  it("discriminates variant correctly using type narrowing", () => {
    const contents: DetailedContent[] = [
      {
        traits: [],
        behaviors: [],
        advice: "advice",
      },
      {
        variant: "contrarian-fortune",
        catchphrase: "cp",
        coreSentence: "cs",
        behaviors: [],
        persona: "p",
        thirdPartyNote: "t",
      },
    ];

    const legacy = contents[0];
    const contrarian = contents[1];

    // 型ガードでの分岐確認
    if (legacy.variant === undefined) {
      expect(legacy.advice).toBe("advice");
    }
    if (contrarian.variant === "contrarian-fortune") {
      expect(contrarian.catchphrase).toBe("cp");
    }
  });
});

describe("QuizResult.detailedContent with DetailedContent union", () => {
  it("accepts QuizResult without detailedContent (optional)", () => {
    const result: QuizResult = {
      id: "type-a",
      title: "タイプA",
      description: "説明文",
    };
    expect(result.detailedContent).toBeUndefined();
  });

  it("accepts QuizResult with legacy QuizResultDetailedContent", () => {
    const result: QuizResult = {
      id: "type-a",
      title: "タイプA",
      description: "説明文",
      detailedContent: {
        traits: ["特徴1"],
        behaviors: ["あるある1"],
        advice: "メッセージ",
      },
    };
    expect(result.detailedContent).toBeDefined();
    expect(result.detailedContent!.variant).toBeUndefined();
  });

  it("accepts QuizResult with ContrarianFortuneDetailedContent", () => {
    const result: QuizResult = {
      id: "type-contrarian",
      title: "逆張りタイプ",
      description: "説明文",
      detailedContent: {
        variant: "contrarian-fortune",
        catchphrase: "キャッチコピー",
        coreSentence: "核心文",
        behaviors: ["あるある"],
        persona: "人物像",
        thirdPartyNote: "第三者視点",
      },
    };
    expect(result.detailedContent).toBeDefined();
    expect(result.detailedContent!.variant).toBe("contrarian-fortune");
  });
});
