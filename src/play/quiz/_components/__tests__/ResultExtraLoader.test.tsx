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
      const slug = loaderStr.includes("CharacterPersonality")
        ? "character-personality"
        : loaderStr.includes("MusicPersonality")
          ? "music-personality"
          : loaderStr.includes("CharacterFortune")
            ? "character-fortune"
            : loaderStr.includes("AnimalPersonality")
              ? "animal-personality"
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
vi.mock("../MusicPersonalityResultExtra", () => ({
  renderMusicPersonalityExtra: () => () => null,
}));
vi.mock("../CharacterFortuneResultExtra", () => ({
  renderCharacterFortuneExtra: () => () => null,
}));
vi.mock("../AnimalPersonalityResultExtra", () => ({
  renderAnimalPersonalityExtra: () => () => null,
}));
vi.mock("../ScienceThinkingResultExtra", () => ({
  renderScienceThinkingExtra: () => () => null,
}));
vi.mock("../JapaneseCultureResultExtra", () => ({
  renderJapaneseCultureExtra: () => () => null,
}));
vi.mock("../CharacterPersonalityResultExtra", () => ({
  renderCharacterPersonalityExtra: () => () => null,
}));

// モックのセットアップ後に対象コンポーネントをインポート
const { default: ResultExtraLoader } = await import("../ResultExtraLoader");

test("character-personality スラグで CharacterPersonalityResultExtra が描画される", () => {
  const { getByTestId } = render(
    <ResultExtraLoader slug="character-personality" resultId="result-01" />,
  );
  expect(getByTestId("character-personality-extra")).toBeInTheDocument();
});

test("unknown スラグでは null が返る", () => {
  const { container } = render(
    <ResultExtraLoader slug="unknown-quiz" resultId="result-01" />,
  );
  expect(container.firstChild).toBeNull();
});

test("music-personality スラグで MusicPersonalityResultExtra が描画される", () => {
  const { getByTestId } = render(
    <ResultExtraLoader slug="music-personality" resultId="result-02" />,
  );
  expect(getByTestId("music-personality-extra")).toBeInTheDocument();
});

test("animal-personality スラグで AnimalPersonalityResultExtra が描画される", () => {
  const { getByTestId } = render(
    <ResultExtraLoader slug="animal-personality" resultId="result-03" />,
  );
  expect(getByTestId("animal-personality-extra")).toBeInTheDocument();
});
