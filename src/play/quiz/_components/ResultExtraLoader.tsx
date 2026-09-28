"use client";

import dynamic from "next/dynamic";
import type { QuizAnswer } from "@/play/quiz/types";

/**
 * 診断ごとの追加の読みもの（理系思考のプロフィール・相性・招待）。解き終えた画面の「このタイプについて」の
 * 最後に置く。どれも診断のデータを丸ごと読むので、next/dynamic でクイズのページの最初のバンドルから分け、
 * その診断を解き終えたときだけ読み込む。ほかの診断の相性と招待は、読みものの部品（*Content）が持つ。
 */

const CharacterFortuneResultExtra = dynamic(
  () =>
    import("./CharacterFortuneResultExtra").then((mod) => {
      function Wrapper({
        resultId,
        referrerTypeId,
      }: {
        resultId: string;
        referrerTypeId?: string;
      }) {
        const renderFn = mod.renderCharacterFortuneExtra(referrerTypeId);
        return <>{renderFn(resultId)}</>;
      }
      return { default: Wrapper };
    }),
  { ssr: false },
);

const ScienceThinkingResultExtra = dynamic(
  () =>
    import("./ScienceThinkingResultExtra").then((mod) => {
      function Wrapper({
        resultId,
        referrerTypeId,
        answers,
      }: {
        resultId: string;
        referrerTypeId?: string;
        answers?: QuizAnswer[];
      }) {
        const renderFn = mod.renderScienceThinkingExtra(
          referrerTypeId,
          answers,
        );
        return <>{renderFn(resultId)}</>;
      }
      return { default: Wrapper };
    }),
  { ssr: false },
);

const JapaneseCultureResultExtra = dynamic(
  () =>
    import("./JapaneseCultureResultExtra").then((mod) => {
      function Wrapper({
        resultId,
        referrerTypeId,
      }: {
        resultId: string;
        referrerTypeId?: string;
      }) {
        const renderFn = mod.renderJapaneseCultureExtra(referrerTypeId);
        return <>{renderFn(resultId)}</>;
      }
      return { default: Wrapper };
    }),
  { ssr: false },
);

/** 追加の読みものを持つ診断。 */
const RESULT_EXTRA_SLUGS: ReadonlySet<string> = new Set([
  "character-fortune",
  "science-thinking",
  "japanese-culture",
]);

/** その診断が追加の読みものを持つか。持たない診断では、置く側が「このタイプについて」に何も足さない。 */
export function hasResultExtra(slug: string): boolean {
  return RESULT_EXTRA_SLUGS.has(slug);
}

interface ResultExtraLoaderProps {
  slug: string;
  resultId: string;
  referrerTypeId?: string;
  /** 来訪者の答え。答えから来訪者ごとのスコアを出す診断（science-thinking）が使う。 */
  answers?: QuizAnswer[];
}

/** その診断の追加の読みものだけを読み込んで描く。 */
export default function ResultExtraLoader({
  slug,
  resultId,
  referrerTypeId,
  answers,
}: ResultExtraLoaderProps) {
  if (slug === "character-fortune") {
    return (
      <CharacterFortuneResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  if (slug === "science-thinking") {
    return (
      <ScienceThinkingResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
        answers={answers}
      />
    );
  }
  if (slug === "japanese-culture") {
    return (
      <JapaneseCultureResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  return null;
}
