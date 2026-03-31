/**
 * Quality tests for ContrarianFortuneDetailedContent in contrarian-fortune results.
 *
 * Q1: behaviors must not be paraphrases of description.
 *     Each item must not share a 15+ character exact substring with description.
 *
 * Q2: persona must not be a paraphrase of description.
 *     persona must not share a 15+ character exact substring with description.
 *
 * Q3: thirdPartyNote must use third-party perspective.
 *     At least 6 out of 8 must contain second/third-person keywords.
 *
 * Q4: coreSentence must contain the "普通" or "一般" reversal frame.
 */
import { describe, it, expect } from "vitest";
import type { ContrarianFortuneDetailedContent } from "../../types";
import contrarianFortuneQuiz from "../contrarian-fortune";

const allResults = contrarianFortuneQuiz.results;

/**
 * Returns true if str contains any substring of length >= minLen from source.
 */
function hasLongOverlap(source: string, str: string, minLen: number): boolean {
  for (let i = 0; i <= source.length - minLen; i++) {
    const sub = source.slice(i, i + minLen);
    if (str.includes(sub)) {
      return true;
    }
  }
  return false;
}

describe("Q1: behaviors must not paraphrase description", () => {
  it("each behavior must not share a 15+ char exact substring with its description", () => {
    const violations: string[] = [];
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      const behaviors = dc?.behaviors ?? [];
      for (const behavior of behaviors) {
        if (hasLongOverlap(result.description, behavior, 15)) {
          violations.push(
            `${result.id}: behavior overlaps with description — "${behavior.slice(0, 40)}..."`,
          );
        }
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

describe("Q2: persona must not paraphrase description", () => {
  it("persona must not share a 15+ char exact substring with its description", () => {
    const violations: string[] = [];
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      if (dc?.persona && hasLongOverlap(result.description, dc.persona, 15)) {
        violations.push(
          `${result.id}: persona overlaps with description — "${dc.persona.slice(0, 40)}..."`,
        );
      }
    }
    expect(violations, violations.join("\n")).toHaveLength(0);
  });
});

describe("Q3: thirdPartyNote must convey third-party perspective", () => {
  /**
   * Pattern for third-party or second-party observation keywords.
   * "このタイプの人" / "一緒に" / "友人" / "あの人" / "彼/彼女" / "周り" etc.
   */
  const THIRD_PARTY_PATTERN =
    /このタイプ|一緒に|友人|あの人|彼[はがを]|彼女[はがを]|周り|相手|隣|側にいる|いると|一緒|周囲|仲間/;

  it("at least 6 out of 8 thirdPartyNotes contain third-party perspective keywords", () => {
    const thirdPartyNotes = allResults.filter((r) => {
      const dc = r.detailedContent as ContrarianFortuneDetailedContent;
      return THIRD_PARTY_PATTERN.test(dc?.thirdPartyNote ?? "");
    });

    expect(
      thirdPartyNotes.length,
      `Only ${thirdPartyNotes.length}/8 thirdPartyNotes contain third-party keywords. Need at least 6.`,
    ).toBeGreaterThanOrEqual(6);
  });
});

describe("Q4: coreSentence must contain the reversal frame", () => {
  /**
   * Pattern for the "普通の占いなら〜だが" reversal frame structure.
   */
  const REVERSAL_FRAME_PATTERN = /普通|一般|通常|ふつう/;

  it("at least 6 out of 8 coreSentences contain a reversal frame keyword", () => {
    const withFrame = allResults.filter((r) => {
      const dc = r.detailedContent as ContrarianFortuneDetailedContent;
      return REVERSAL_FRAME_PATTERN.test(dc?.coreSentence ?? "");
    });

    expect(
      withFrame.length,
      `Only ${withFrame.length}/8 coreSentences contain reversal frame keywords. Need at least 6.`,
    ).toBeGreaterThanOrEqual(6);
  });
});

describe("Q5: calmchaos must have humorous behaviors (review feedback 1-1)", () => {
  /**
   * calmchaosのbehaviorsは「優秀な人物の描写」でなく「笑えるシーン」であること。
   * 具体的に笑えるシーンを示すキーワードが少なくとも2つのbehaviorに含まれるべき。
   * 自己啓発書的なフレーズ「感情より先に〜整理する」は使わないこと。
   */
  it("calmchaos behaviors must not contain self-help book phrasing", () => {
    const calmchaos = allResults.find((r) => r.id === "calmchaos");
    expect(calmchaos).toBeDefined();
    const dc = calmchaos!.detailedContent as ContrarianFortuneDetailedContent;
    const selfHelpPattern = /感情より先に.*整理する/;
    for (const behavior of dc.behaviors) {
      expect(
        selfHelpPattern.test(behavior),
        `calmchaos: behavior must not contain self-help phrasing: "${behavior}"`,
      ).toBe(false);
    }
  });

  it("calmchaos behaviors must contain at least 2 comical scene descriptions", () => {
    const calmchaos = allResults.find((r) => r.id === "calmchaos");
    expect(calmchaos).toBeDefined();
    const dc = calmchaos!.detailedContent as ContrarianFortuneDetailedContent;
    // 笑えるシーンを示すキーワード（慌てる/緊急/おやつ/紅茶/など具体的な行動シーン）
    const comicalPattern =
      /慌て|おやつ|紅茶|一人だけ|のんびり|ゆっくり|おかし|ぼーっと|呑気|のほほん|牧歌|淡々/;
    const comicalCount = dc.behaviors.filter((b) =>
      comicalPattern.test(b),
    ).length;
    expect(
      comicalCount,
      `calmchaos: expected at least 2 comical behaviors, got ${comicalCount}. behaviors: ${JSON.stringify(dc.behaviors)}`,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe("Q6: mundaneoracle and inversefortune must not share duplicate content (review feedback 1-2)", () => {
  /**
   * 「地味だけど好き」という表現がmundaneoracleとinversefortuneの両方に存在することを禁止。
   * inversefortuneのthirdPartyNoteには「みんなと違う選択」軸の表現が必要。
   */
  it("inversefortune thirdPartyNote must not contain '地味だけど好き'", () => {
    const inversefortune = allResults.find((r) => r.id === "inversefortune");
    expect(inversefortune).toBeDefined();
    const dc = inversefortune!
      .detailedContent as ContrarianFortuneDetailedContent;
    expect(
      dc.thirdPartyNote,
      "inversefortune: thirdPartyNote must not contain '地味だけど好き'",
    ).not.toContain("地味だけど好き");
  });

  it("inversefortune thirdPartyNote must emphasize 'choosing differently from others' axis", () => {
    const inversefortune = allResults.find((r) => r.id === "inversefortune");
    expect(inversefortune).toBeDefined();
    const dc = inversefortune!
      .detailedContent as ContrarianFortuneDetailedContent;
    // 「みんなと違う」「人気を避ける」「独自」などの表現が含まれるべき
    const differentChoicePattern =
      /みんなと違|人気|流行|定番|避け|独自|逆張|別の/;
    expect(
      differentChoicePattern.test(dc.thirdPartyNote),
      `inversefortune: thirdPartyNote must emphasize 'different choice' axis. Got: "${dc.thirdPartyNote}"`,
    ).toBe(true);
  });

  it("mundaneoracle behaviors must not contain '地味だけど好きな場所を勧める' pattern", () => {
    const mundaneoracle = allResults.find((r) => r.id === "mundaneoracle");
    expect(mundaneoracle).toBeDefined();
    const dc = mundaneoracle!
      .detailedContent as ContrarianFortuneDetailedContent;
    // mundaneoracleのbehaviorsはコンビニ新商品や道端の変化など日常密着型であるべき
    const duplicatePattern = /地味だけど好きな場所.*勧め|地味だけど好き.*勧め/;
    for (const behavior of dc.behaviors) {
      expect(
        duplicatePattern.test(behavior),
        `mundaneoracle: behavior must not contain duplicate '地味だけど好きな場所を勧める' pattern: "${behavior}"`,
      ).toBe(false);
    }
  });
});
