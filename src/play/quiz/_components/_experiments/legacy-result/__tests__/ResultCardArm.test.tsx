/**
 * A/B 実験 `quiz_result_visual_v1` の arm 切替経路テスト。
 *
 * `ResultCard.tsx` の renderDetailedContent / renderStandardContent /
 * OtherTypesNav の 3 系統（docs/visitor-value-measurement.md 論点2 F-3）が
 * arm=A のとき retro 版を、arm=B/null のとき current 版を選ぶことを確認する。
 *
 * 既存の `__tests__/ResultCard.test.tsx` は current 版のみを検証している
 * （arm 未指定→current にフォールバック）。retro 経路は arm prop を明示的に
 * "A" にして網羅する。
 *
 * 実験終了時はこのファイルごと削除する（`_experiments/` のディレクトリ削除と同期）。
 */

import { expect, test, vi, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ResultCard from "../../../ResultCard";
import type {
  QuizResult,
  AnimalPersonalityDetailedContent,
  YojiPersonalityDetailedContent,
  TraditionalColorDetailedContent,
  CharacterPersonalityDetailedContent,
  MusicPersonalityDetailedContent,
  UnexpectedCompatibilityDetailedContent,
  ImpossibleAdviceDetailedContent,
  ContrarianFortuneDetailedContent,
  QuizResultDetailedContent,
} from "../../../../types";

// next/dynamic を「同じパスから importした実モジュールに同期解決する」モックに置換。
// loader.toString() からインポートパスを抜き出し、retro / current を切り分ける。
vi.mock("next/dynamic", async () => {
  const current = {
    AnimalPersonalityContent:
      await import("@/play/quiz/_components/AnimalPersonalityContent"),
    MusicPersonalityContent:
      await import("@/play/quiz/_components/MusicPersonalityContent"),
    TraditionalColorContent:
      await import("@/play/quiz/_components/TraditionalColorContent"),
    YojiPersonalityContent:
      await import("@/play/quiz/_components/YojiPersonalityContent"),
    CharacterPersonalityContent:
      await import("@/play/quiz/_components/CharacterPersonalityContent"),
    UnexpectedCompatibilityContent:
      await import("@/play/quiz/_components/UnexpectedCompatibilityContent"),
    ImpossibleAdviceContent:
      await import("@/play/quiz/_components/ImpossibleAdviceContent"),
    ContrarianFortuneContent:
      await import("@/play/quiz/_components/ContrarianFortuneContent"),
  };
  const retro = {
    AnimalPersonalityContent: await import("../AnimalPersonalityContent"),
    MusicPersonalityContent: await import("../MusicPersonalityContent"),
    TraditionalColorContent: await import("../TraditionalColorContent"),
    YojiPersonalityContent: await import("../YojiPersonalityContent"),
    CharacterPersonalityContent: await import("../CharacterPersonalityContent"),
    UnexpectedCompatibilityContent:
      await import("../UnexpectedCompatibilityContent"),
    ImpossibleAdviceContent: await import("../ImpossibleAdviceContent"),
    ContrarianFortuneContent: await import("../ContrarianFortuneContent"),
  };

  return {
    default: (
      loader: () => Promise<{
        default: React.ComponentType<Record<string, unknown>>;
      }>,
    ) => {
      const s = loader.toString();
      // retro: パス文字列に _experiments/legacy-result/ を含む
      const isRetro = s.includes("_experiments/legacy-result");
      const bank = isRetro ? retro : current;
      // testid を付与して retro/current が区別できるようにする
      const tag = isRetro ? "retro" : "current";

      // どの variant をロードしようとしているか。retro/current で props 型は
      // 互換だが、TS 上は各 *Content の props 型が異なるため、ここでは
      // unknown 経由で props を中継する（テスト用 stub のため runtime には影響しない）。
      let mod: { default: React.ComponentType<unknown> };
      const cast = <T,>(m: T): { default: React.ComponentType<unknown> } =>
        m as unknown as { default: React.ComponentType<unknown> };
      if (s.includes("AnimalPersonalityContent"))
        mod = cast(bank.AnimalPersonalityContent);
      else if (s.includes("MusicPersonalityContent"))
        mod = cast(bank.MusicPersonalityContent);
      else if (s.includes("TraditionalColorContent"))
        mod = cast(bank.TraditionalColorContent);
      else if (s.includes("YojiPersonalityContent"))
        mod = cast(bank.YojiPersonalityContent);
      else if (s.includes("CharacterPersonalityContent"))
        mod = cast(bank.CharacterPersonalityContent);
      else if (s.includes("UnexpectedCompatibilityContent"))
        mod = cast(bank.UnexpectedCompatibilityContent);
      else if (s.includes("ImpossibleAdviceContent"))
        mod = cast(bank.ImpossibleAdviceContent);
      else if (s.includes("ContrarianFortuneContent"))
        mod = cast(bank.ContrarianFortuneContent);
      else {
        mod = { default: () => null };
      }
      const Component = mod.default;

      function DynamicStub(props: Record<string, unknown>) {
        return React.createElement(
          "div",
          { "data-testid": `arm-${tag}` },
          React.createElement(
            Component as React.ComponentType<Record<string, unknown>>,
            props,
          ),
        );
      }
      DynamicStub.displayName = `DynamicStub_${tag}`;
      return DynamicStub;
    },
  };
});

vi.mock("@/play/quiz/_components/ShareButtons", () => ({
  default: () => <div data-testid="share-buttons" />,
}));
vi.mock("@/play/quiz/_components/CompatibilitySection", () => ({
  default: () => <div data-testid="compatibility-section" />,
}));
vi.mock("@/play/quiz/_components/InviteFriendButton", () => ({
  default: () => <div data-testid="invite-friend-button" />,
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [k: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// データモジュールは ResultCard が直接 import している animal-personality のみ実体が要る。
// 他の variant は retro/current いずれも quiz データの import を含むが、本テストでは
// variant 別の見た目差分ではなく「arm=A → retro / arm=B → current が選ばれる」ことだけ
// 検証するため、各データを最小モックで置く。
vi.mock("@/play/quiz/data/animal-personality", () => ({
  default: {
    meta: { slug: "animal-personality", title: "動物" },
    results: [
      {
        id: "nihon-zaru",
        title: "ニホンザル",
        icon: "🐵",
        detailedContent: {
          variant: "animal-personality",
          catchphrase: "c",
          strengths: ["s"],
          weaknesses: ["w"],
          behaviors: ["b"],
          todayAction: "a",
        },
      },
    ],
  },
  getCompatibility: () => undefined,
  isValidAnimalTypeId: () => false,
}));

vi.mock("@/play/quiz/data/music-personality", () => ({
  default: { meta: { slug: "music-personality", title: "音楽" }, results: [] },
  getCompatibility: () => undefined,
  isValidMusicTypeId: () => false,
}));
vi.mock("@/play/quiz/data/traditional-color", () => ({
  default: {
    meta: { slug: "traditional-color", title: "色" },
    results: [],
  },
}));
vi.mock("@/play/quiz/data/yoji-personality", () => ({
  default: { meta: { slug: "yoji-personality", title: "四字" }, results: [] },
}));
vi.mock("@/play/quiz/data/character-personality", () => ({
  default: {
    meta: { slug: "character-personality", title: "似たキャラ" },
    results: [],
  },
  CHARACTER_PERSONALITY_TYPE_IDS: [],
}));
vi.mock("@/play/quiz/data/unexpected-compatibility", () => ({
  default: {
    meta: { slug: "unexpected-compatibility", title: "斜め上" },
    results: [],
  },
}));
vi.mock("@/play/quiz/data/impossible-advice", () => ({
  default: {
    meta: { slug: "impossible-advice", title: "達成困難" },
    results: [],
  },
}));
vi.mock("@/play/quiz/data/contrarian-fortune", () => ({
  default: {
    meta: { slug: "contrarian-fortune", title: "逆張り" },
    results: [],
  },
}));

const baseProps = {
  quizType: "personality" as const,
  quizTitle: "テスト",
  quizSlug: "test-quiz",
  onRetry: vi.fn(),
};

describe("ResultCard arm 切替: renderDetailedContent (各 case)", () => {
  const cases = [
    {
      variant: "animal-personality" as const,
      content: {
        variant: "animal-personality",
        catchphrase: "c",
        strengths: ["s"],
        weaknesses: ["w"],
        behaviors: ["b"],
        todayAction: "a",
      } as AnimalPersonalityDetailedContent,
    },
    {
      variant: "music-personality" as const,
      content: {
        variant: "music-personality",
        catchphrase: "c",
        strengths: ["s"],
        weaknesses: ["w"],
        behaviors: ["b"],
        todayAction: "a",
      } as MusicPersonalityDetailedContent,
    },
    {
      variant: "traditional-color" as const,
      content: {
        variant: "traditional-color",
        catchphrase: "c",
        colorMeaning: "m",
        season: "夏",
        scenery: "s",
        behaviors: ["b"],
        colorAdvice: "ad",
      } as TraditionalColorDetailedContent,
    },
    {
      variant: "yoji-personality" as const,
      content: {
        variant: "yoji-personality",
        catchphrase: "c",
        kanjiBreakdown: "k",
        origin: "o",
        behaviors: ["b"],
        motto: "m",
      } as YojiPersonalityDetailedContent,
    },
    {
      variant: "character-personality" as const,
      content: {
        variant: "character-personality",
        catchphrase: "c",
        archetypeBreakdown: "a",
        behaviors: ["b"],
        characterMessage: "m",
      } as CharacterPersonalityDetailedContent,
    },
    {
      variant: "unexpected-compatibility" as const,
      content: {
        variant: "unexpected-compatibility",
        catchphrase: "c",
        entityEssence: "e",
        whyCompatible: "w",
        behaviors: ["b"],
        lifeAdvice: "ad",
      } as UnexpectedCompatibilityDetailedContent,
    },
    {
      variant: "impossible-advice" as const,
      content: {
        variant: "impossible-advice",
        catchphrase: "c",
        diagnosisCore: "d",
        behaviors: ["b"],
        practicalTip: "p",
      } as ImpossibleAdviceDetailedContent,
    },
    {
      variant: "contrarian-fortune" as const,
      content: {
        variant: "contrarian-fortune",
        catchphrase: "c",
        coreSentence: "cs",
        behaviors: ["b"],
        persona: "p",
        thirdPartyNote: "n",
      } as ContrarianFortuneDetailedContent,
    },
  ];

  const result: QuizResult = {
    id: "type-a",
    title: "タイプA",
    description: "説明",
    color: "#123456",
  };

  test.each(cases)(
    "arm=A のとき variant=$variant は retro 版が選ばれる",
    ({ content }) => {
      render(
        <ResultCard
          {...baseProps}
          result={result}
          detailedContent={content}
          resultVisualArm="A"
          allResults={[result]}
        />,
      );
      expect(screen.getByTestId("arm-retro")).toBeInTheDocument();
      expect(screen.queryByTestId("arm-current")).not.toBeInTheDocument();
    },
  );

  test.each(cases)(
    "arm=B のとき variant=$variant は current 版が選ばれる",
    ({ content }) => {
      render(
        <ResultCard
          {...baseProps}
          result={result}
          detailedContent={content}
          resultVisualArm="B"
          allResults={[result]}
        />,
      );
      expect(screen.getByTestId("arm-current")).toBeInTheDocument();
      expect(screen.queryByTestId("arm-retro")).not.toBeInTheDocument();
    },
  );

  test.each(cases)(
    "arm=null のとき variant=$variant は current 版が選ばれる（hydration safe）",
    ({ content }) => {
      render(
        <ResultCard
          {...baseProps}
          result={result}
          detailedContent={content}
          resultVisualArm={null}
          allResults={[result]}
        />,
      );
      expect(screen.getByTestId("arm-current")).toBeInTheDocument();
      expect(screen.queryByTestId("arm-retro")).not.toBeInTheDocument();
    },
  );
});

describe("ResultCard arm 切替: renderStandardContent と OtherTypesNav", () => {
  // 標準 variant（variant === undefined）は専用 *Content を持たないので、
  // arm 切替の影響は OtherTypesNav の retro/current 出し分けのみに現れる。
  // OtherTypesNavAb は arm を props で受ける純粋コンポーネントに改修したため
  // （関心の分離）、ResultCard が `resultVisualArm` を OtherTypesNavAb へ伝播
  // していることを retro 版の絵文字（aria-hidden span）の有無で signal 検出する。
  const standardContent: QuizResultDetailedContent = {
    traits: ["t"],
    behaviors: ["b"],
    advice: "a",
  };
  const result: QuizResult = {
    id: "type-a",
    title: "タイプA",
    description: "説明",
  };
  const allResults: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A", icon: "🅰️" },
    { id: "type-b", title: "タイプB", description: "B", icon: "🅱️" },
  ];

  test("標準 variant: arm=null のとき OtherTypesNav は current で描画される", () => {
    const { container } = render(
      <ResultCard
        {...baseProps}
        result={result}
        detailedContent={standardContent}
        allResults={allResults}
        resultVisualArm={null}
      />,
    );
    expect(screen.getByText("他のタイプも見てみよう")).toBeInTheDocument();
    // current 版は絵文字を描画しない。
    expect(container.textContent).not.toContain("🅱️");
  });

  test("標準 variant: arm=A のとき OtherTypesNav は retro で描画される（絵文字あり）", () => {
    const { container } = render(
      <ResultCard
        {...baseProps}
        result={result}
        detailedContent={standardContent}
        allResults={allResults}
        resultVisualArm="A"
      />,
    );
    expect(screen.getByText("他のタイプも見てみよう")).toBeInTheDocument();
    // retro 版はタイプ絵文字を描画する。
    expect(container.textContent).toContain("🅱️");
  });

  test("標準 variant: arm=B のとき OtherTypesNav は current で描画される", () => {
    const { container } = render(
      <ResultCard
        {...baseProps}
        result={result}
        detailedContent={standardContent}
        allResults={allResults}
        resultVisualArm="B"
      />,
    );
    expect(container.textContent).not.toContain("🅱️");
  });
});
