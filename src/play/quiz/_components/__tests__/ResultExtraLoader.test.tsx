import { expect, test, vi } from "vitest";
import { render } from "@testing-library/react";

// next/dynamic を各コンポーネントのモックに置き換える
// ローダー関数の引数から import パスを取得して対応するコンポーネントを返す
vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<{
      default: React.ComponentType<Record<string, unknown>>;
    }>,
  ) => {
    // 各コンポーネントのスタブを返すラッパー
    // loader 文字列化でパスを判定する
    const loaderStr = loader.toString();

    function Stub(props: Record<string, unknown>) {
      const slug = loaderStr.includes("CharacterFortune")
        ? "character-fortune"
        : loaderStr.includes("ScienceThinking")
          ? "science-thinking"
          : loaderStr.includes("JapaneseCulture")
            ? "japanese-culture"
            : "unknown";
      return (
        <div
          data-testid={`${slug}-extra`}
          data-result-id={String(props.resultId)}
        />
      );
    }
    return Stub;
  },
}));

// 各モジュールのモック（dynamic import の解決には不要だが、型エラー回避のため）
vi.mock("../CharacterFortuneResultExtra", () => ({
  renderCharacterFortuneExtra: () => () => null,
}));
// AnimalPersonalityResultExtraは削除済み（animal-personality分岐はResultCard内に統合）
// MusicPersonalityResultExtraは削除済み（MusicPersonalityContentのafterTodayActionスロットに統合）
// CharacterPersonalityResultExtraは削除済み（CharacterPersonalityContentに統合済み）
vi.mock("../ScienceThinkingResultExtra", () => ({
  renderScienceThinkingExtra: () => () => null,
}));
vi.mock("../JapaneseCultureResultExtra", () => ({
  renderJapaneseCultureExtra: () => () => null,
}));

// モックのセットアップ後に対象コンポーネントをインポート
const { default: ResultExtraLoader } = await import("../ResultExtraLoader");

test("character-personality スラグでは null が返る（CharacterPersonalityContentに統合済み）", () => {
  const { container } = render(
    <ResultExtraLoader slug="character-personality" resultId="result-01" />,
  );
  expect(container.firstChild).toBeNull();
});

test("unknown スラグでは null が返る", () => {
  const { container } = render(
    <ResultExtraLoader slug="unknown-quiz" resultId="result-01" />,
  );
  expect(container.firstChild).toBeNull();
});

test("music-personality スラグでは null が返る（MusicPersonalityContentのafterTodayActionスロットに統合済み）", () => {
  const { container } = render(
    <ResultExtraLoader slug="music-personality" resultId="result-02" />,
  );
  expect(container.firstChild).toBeNull();
});

test("animal-personality スラグでは null が返る（ResultCard内に統合済み）", () => {
  const { container } = render(
    <ResultExtraLoader slug="animal-personality" resultId="result-03" />,
  );
  expect(container.firstChild).toBeNull();
});
