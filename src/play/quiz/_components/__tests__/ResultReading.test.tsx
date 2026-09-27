import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeAll, describe, expect, test } from "vitest";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import animalPersonality from "@/play/quiz/data/animal-personality";
import characterPersonality from "@/play/quiz/data/character-personality";
import contrarianFortune from "@/play/quiz/data/contrarian-fortune";
import impossibleAdvice from "@/play/quiz/data/impossible-advice";
import musicPersonality from "@/play/quiz/data/music-personality";
import scienceThinking from "@/play/quiz/data/science-thinking";
import traditionalColor from "@/play/quiz/data/traditional-color";
import unexpectedCompatibility from "@/play/quiz/data/unexpected-compatibility";
import yojiPersonality from "@/play/quiz/data/yoji-personality";
import type { DetailedContent, QuizResult } from "@/play/quiz/types";
import AnimalPersonalityContent from "../AnimalPersonalityContent";
import CharacterPersonalityContent from "../CharacterPersonalityContent";
import ContrarianFortuneContent from "../ContrarianFortuneContent";
import { ReadingHeading } from "../ResultReading";
import ImpossibleAdviceContent from "../ImpossibleAdviceContent";
import MusicPersonalityContent from "../MusicPersonalityContent";
import type { ResultPlacement } from "../OtherTypesNav";
import { renderScienceThinkingExtra } from "../ScienceThinkingResultExtra";
import TraditionalColorContent from "../TraditionalColorContent";
import UnexpectedCompatibilityContent from "../UnexpectedCompatibilityContent";
import YojiPersonalityContent from "../YojiPersonalityContent";

// jsdom は字を組まないので、Range の矩形を持たない（量の帯が字の幅を測る）。
beforeAll(() => {
  Range.prototype.getBoundingClientRect = function (this: Range) {
    const width = (this.startContainer.textContent ?? "").length * 10;
    return { width } as DOMRect;
  };
});

function contentOf<T extends DetailedContent["variant"]>(
  results: readonly QuizResult[],
  variant: T,
): Extract<DetailedContent, { variant: T }> {
  const content = results.find(
    (result) => result.detailedContent?.variant === variant,
  )?.detailedContent;
  if (!content) throw new Error(variant);
  return content as Extract<DetailedContent, { variant: T }>;
}

/** 読みものの全部の小見出しが出るように、各診断の読みものを組む。 */
function readings(placement: ResultPlacement): ReactElement[] {
  const contrarian = contrarianFortune.results.find(
    (result) =>
      result.detailedContent?.variant === "contrarian-fortune" &&
      (result.detailedContent.humorMetrics?.length ?? 0) > 0,
  )!;
  return [
    <AnimalPersonalityContent
      key="animal"
      content={contentOf(animalPersonality.results, "animal-personality")}
      resultId={animalPersonality.results[0].id}
      placement={placement}
      afterTodayAction={null}
    />,
    <CharacterPersonalityContent
      key="character"
      content={contentOf(characterPersonality.results, "character-personality")}
      resultId={characterPersonality.results[0].id}
      placement={placement}
      afterCharacterMessage={null}
    />,
    <ContrarianFortuneContent
      key="contrarian"
      quizSlug={contrarianFortune.meta.slug}
      resultId={contrarian.id}
      detailedContent={contentOf([contrarian], "contrarian-fortune")}
      allResults={contrarianFortune.results}
      placement={placement}
    />,
    <ImpossibleAdviceContent
      key="impossible"
      quizSlug={impossibleAdvice.meta.slug}
      resultId={impossibleAdvice.results[0].id}
      detailedContent={contentOf(impossibleAdvice.results, "impossible-advice")}
      allResults={impossibleAdvice.results}
      placement={placement}
    />,
    <MusicPersonalityContent
      key="music"
      content={contentOf(musicPersonality.results, "music-personality")}
      resultId={musicPersonality.results[0].id}
      placement={placement}
      afterTodayAction={null}
    />,
    <TraditionalColorContent
      key="color"
      content={contentOf(traditionalColor.results, "traditional-color")}
      resultId={traditionalColor.results[0].id}
      placement={placement}
    />,
    <UnexpectedCompatibilityContent
      key="unexpected"
      quizSlug={unexpectedCompatibility.meta.slug}
      resultId={unexpectedCompatibility.results[0].id}
      detailedContent={contentOf(
        unexpectedCompatibility.results,
        "unexpected-compatibility",
      )}
      allResults={unexpectedCompatibility.results}
      placement={placement}
    />,
    <YojiPersonalityContent
      key="yoji"
      content={contentOf(yojiPersonality.results, "yoji-personality")}
      resultId={yojiPersonality.results[0].id}
      placement={placement}
    />,
  ];
}

/** 見出しの中の <wbr> で分けた並び。 */
function phrasesOf(heading: Element): string[] {
  const phrases = [""];
  for (const node of heading.childNodes) {
    if (node.nodeName === "WBR") phrases.push("");
    else phrases[phrases.length - 1] += node.textContent ?? "";
  }
  return phrases;
}

describe("読みものの小見出しの手で区切った並び", () => {
  test("どの小見出しも、splitIntoPhrases と同じ禁則を満たす", () => {
    const headings: string[][] = [];
    for (const placement of ["solvedScreen", "resultPage"] as const) {
      for (const reading of readings(placement)) {
        const { container, unmount } = render(reading);
        container
          .querySelectorAll("h2, h3")
          .forEach(
            (heading) =>
              heading.querySelector("wbr") && headings.push(phrasesOf(heading)),
          );
        unmount();
      }
    }
    const answers = scienceThinking.questions.map((question) => ({
      questionId: question.id,
      choiceId: question.choices[0].id,
    }));
    const { container } = render(
      <>
        {renderScienceThinkingExtra(
          undefined,
          answers,
        )(scienceThinking.results[0].id)}
      </>,
    );
    container
      .querySelectorAll("h3")
      .forEach(
        (heading) =>
          heading.querySelector("wbr") && headings.push(phrasesOf(heading)),
      );

    // 8本の読みもの（2つの面）と、理系思考タイプ診断のプロフィールの小見出し
    expect(headings.length).toBeGreaterThanOrEqual(2 * 30 + 1);
    for (const phrases of headings) {
      expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    }
  });
});

describe("読みものの小見出しの書体の属性", () => {
  test("見出しの書体に無い字を含む見出しは、渡された属性で本文の書体に替わり、渡さなければ属性を持たない", () => {
    const { container } = render(
      <>
        <ReadingHeading
          placement="resultPage"
          phrases={["𠮟られて", "伸びる"]}
          headingFont={{ "data-heading-font": "fallback" }}
        />
        <ReadingHeading
          placement="resultPage"
          phrases={["この", "タイプの", "強み"]}
        />
      </>,
    );
    const [fallback, plain] = container.querySelectorAll("h2");
    expect(fallback).toHaveAttribute("data-heading-font", "fallback");
    expect(plain).not.toHaveAttribute("data-heading-font");
  });
});
