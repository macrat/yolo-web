/**
 * _layouts/types.ts の型定義テスト。
 * 各 props 型が期待するフィールドを持ち、extends 関係が正しく機能することを確認する。
 */

import { describe, it, expect } from "vitest";
import type {
  ResultLayoutCommonProps,
  StandardResultLayoutProps,
  ContrarianFortuneLayoutProps,
  CharacterFortuneLayoutProps,
} from "../types";
import type {
  QuizMeta,
  QuizResult,
  QuizResultDetailedContent,
  ContrarianFortuneDetailedContent,
  CharacterFortuneDetailedContent,
} from "@/play/quiz/types";

// テスト用のダミーデータ型チェック（コンパイル時にのみ検証される）
// これらの変数は型チェックの目的のみに使用し、実行時には評価されない

/** QuizMeta の最小構成 */
const dummyQuizMeta: QuizMeta = {
  slug: "test-quiz",
  title: "テストクイズ",
  description: "テスト",
  shortDescription: "テスト",
  type: "personality",
  category: "personality",
  questionCount: 10,
  icon: "🎯",
  accentColor: "#000000",
  keywords: [],
  publishedAt: "2026-01-01T00:00:00+09:00",
  trustLevel: "generated",
};

/** QuizResult の最小構成 */
const dummyResult: QuizResult = {
  id: "result-1",
  title: "結果1",
  description: "テスト結果",
};

/** ResultLayoutCommonProps の最小構成 */
const dummyCommon: ResultLayoutCommonProps = {
  slug: "test-quiz",
  resultId: "result-1",
  quizMeta: dummyQuizMeta,
  result: dummyResult,
  shareText: "シェアテキスト",
  shareUrl: "https://example.com",
  ctaText: "もう一度やる",
};

/** StandardResultLayoutProps が ResultLayoutCommonProps を extends していること */
const dummyStandard: StandardResultLayoutProps = {
  ...dummyCommon,
  detailedContent: undefined,
  isDescriptionLong: false,
  traitsHeading: "このタイプの特徴",
  behaviorsHeading: "このタイプのあるある",
  adviceHeading: "このタイプへのアドバイス",
};

/** StandardResultLayoutProps に detailedContent が設定できること */
const dummyStandardWithContent: StandardResultLayoutProps = {
  ...dummyCommon,
  detailedContent: {
    variant: undefined,
    traits: ["特徴1"],
    behaviors: ["あるある1"],
    advice: "アドバイス",
  } satisfies QuizResultDetailedContent,
  isDescriptionLong: true,
  traitsHeading: "特徴",
  behaviorsHeading: "あるある",
  adviceHeading: "アドバイス",
};

/** ContrarianFortuneLayoutProps が ResultLayoutCommonProps を extends していること */
const dummyContrarianFortune: ContrarianFortuneLayoutProps = {
  ...dummyCommon,
  detailedContent: {
    variant: "contrarian-fortune",
    catchphrase: "キャッチコピー",
    coreSentence: "コア文",
    behaviors: ["あるある1"],
    persona: "人物像",
    thirdPartyNote: "第三者視点",
  } satisfies ContrarianFortuneDetailedContent,
  allResults: [dummyResult],
};

/** CharacterFortuneLayoutProps が ResultLayoutCommonProps を extends していること */
const dummyCharacterFortune: CharacterFortuneLayoutProps = {
  ...dummyCommon,
  detailedContent: {
    variant: "character-fortune",
    characterIntro: "キャラ自己紹介",
    behaviorsHeading: "あるある見出し",
    behaviors: ["あるある1"],
    characterMessageHeading: "本音見出し",
    characterMessage: "本音テキスト",
    thirdPartyNote: "第三者視点",
    compatibilityPrompt: "相性診断へ",
  } satisfies CharacterFortuneDetailedContent,
  allResults: [dummyResult],
};

// 型チェックが通れば全テスト成功
describe("_layouts/types.ts 型定義", () => {
  it("ResultLayoutCommonProps が必須フィールドを持つ", () => {
    expect(dummyCommon.slug).toBe("test-quiz");
    expect(dummyCommon.resultId).toBe("result-1");
    expect(dummyCommon.shareText).toBe("シェアテキスト");
    expect(dummyCommon.shareUrl).toBe("https://example.com");
    expect(dummyCommon.ctaText).toBe("もう一度やる");
  });

  it("StandardResultLayoutProps が共通props + 固有フィールドを持つ", () => {
    expect(dummyStandard.traitsHeading).toBe("このタイプの特徴");
    expect(dummyStandard.behaviorsHeading).toBe("このタイプのあるある");
    expect(dummyStandard.adviceHeading).toBe("このタイプへのアドバイス");
    expect(dummyStandard.isDescriptionLong).toBe(false);
    expect(dummyStandard.detailedContent).toBeUndefined();
  });

  it("StandardResultLayoutProps の detailedContent に QuizResultDetailedContent を設定できる", () => {
    expect(dummyStandardWithContent.detailedContent).toBeDefined();
    expect(dummyStandardWithContent.isDescriptionLong).toBe(true);
  });

  it("ContrarianFortuneLayoutProps が共通props + 固有フィールドを持つ", () => {
    expect(dummyContrarianFortune.detailedContent.variant).toBe(
      "contrarian-fortune",
    );
    expect(dummyContrarianFortune.allResults).toHaveLength(1);
  });

  it("CharacterFortuneLayoutProps が共通props + 固有フィールドを持つ", () => {
    expect(dummyCharacterFortune.detailedContent.variant).toBe(
      "character-fortune",
    );
    expect(dummyCharacterFortune.allResults).toHaveLength(1);
  });
});
