import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/dynamic は、読み込む部品の名前から診断の slug を決めるスタブを返す。
// スタブは受け取った props を data 属性に写すので、ResultExtraLoader が渡した値を確かめられる。
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<unknown>) => {
    const loaderStr = loader.toString();
    const slug = loaderStr.includes("CharacterFortune")
      ? "character-fortune"
      : loaderStr.includes("ScienceThinking")
        ? "science-thinking"
        : loaderStr.includes("JapaneseCulture")
          ? "japanese-culture"
          : "unknown";

    function Stub(props: Record<string, unknown>) {
      return (
        <div
          data-testid={`${slug}-extra`}
          data-result-id={String(props.resultId)}
          data-referrer-type-id={String(props.referrerTypeId)}
          data-answer-count={String(
            Array.isArray(props.answers) ? props.answers.length : "none",
          )}
        />
      );
    }
    return Stub;
  },
}));

const { default: ResultExtraLoader, hasResultExtra } =
  await import("../ResultExtraLoader");

const SLUGS_WITH_EXTRA = [
  "character-fortune",
  "science-thinking",
  "japanese-culture",
];

const SLUGS_WITHOUT_EXTRA = [
  "character-personality",
  "music-personality",
  "animal-personality",
  "kanji-level",
  "unknown-quiz",
];

test("追加の読みものを持つのは character-fortune・science-thinking・japanese-culture の3つだけ", () => {
  expect(
    [...SLUGS_WITH_EXTRA, ...SLUGS_WITHOUT_EXTRA].filter(hasResultExtra),
  ).toEqual(SLUGS_WITH_EXTRA);
});

test.each(SLUGS_WITH_EXTRA)(
  "%s では、その診断の読みものの部品を描き、結果と来訪者の情報を渡す",
  (slug) => {
    const answers = [{ questionId: "q1", choiceId: "a" }];
    render(
      <ResultExtraLoader
        slug={slug}
        resultId="result-01"
        referrerTypeId="result-02"
        answers={answers}
      />,
    );
    const extra = screen.getByTestId(`${slug}-extra`);
    expect(extra.dataset.resultId).toBe("result-01");
    expect(extra.dataset.referrerTypeId).toBe("result-02");
    expect(extra.dataset.answerCount).toBe("1");
  },
);

test.each(SLUGS_WITHOUT_EXTRA)("%s では何も描かない", (slug) => {
  const { container } = render(
    <ResultExtraLoader slug={slug} resultId="result-01" />,
  );
  expect(container.firstChild).toBeNull();
});
