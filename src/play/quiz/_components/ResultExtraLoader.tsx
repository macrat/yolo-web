"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import type { QuizAnswer } from "@/play/quiz/types";

/**
 * 診断ごとの追加の読みもの。science-thinking は来訪者の思考プロフィールと招待を、character-fortune と
 * japanese-culture は相性と招待を描く。解き終えた画面の「このタイプについて」の最後に置く。どれも診断のデータを
 * 丸ごと読むので、next/dynamic でクイズのページの最初のバンドルから分け、その診断を解き終えたときだけ読み込む。
 * ほかの診断の相性と招待は、music-personality と character-personality では読みものの部品（*Content）が
 * 自分で組み、animal-personality では ResultCard が組んで AnimalPersonalityContent の afterTodayAction に渡す。
 */

interface ResultExtraProps {
  resultId: string;
  /** 相性を見る友達のタイプの id（共有のリンクの ref）。character-fortune と japanese-culture が使う。 */
  referrerTypeId?: string;
  /** 来訪者の答え。答えから来訪者ごとのスコアを出す診断（science-thinking）が使う。 */
  answers?: QuizAnswer[];
}

const CharacterFortuneResultExtra = dynamic(
  () =>
    import("./CharacterFortuneResultExtra").then((mod) => {
      function Wrapper({ resultId, referrerTypeId }: ResultExtraProps) {
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
      function Wrapper({ resultId, answers }: ResultExtraProps) {
        const renderFn = mod.renderScienceThinkingExtra(answers);
        return <>{renderFn(resultId)}</>;
      }
      return { default: Wrapper };
    }),
  { ssr: false },
);

const JapaneseCultureResultExtra = dynamic(
  () =>
    import("./JapaneseCultureResultExtra").then((mod) => {
      function Wrapper({ resultId, referrerTypeId }: ResultExtraProps) {
        const renderFn = mod.renderJapaneseCultureExtra(referrerTypeId);
        return <>{renderFn(resultId)}</>;
      }
      return { default: Wrapper };
    }),
  { ssr: false },
);

/** 追加の読みものを持つ診断と、その読みものを描く部品。 */
const RESULT_EXTRAS: ReadonlyMap<
  string,
  (props: ResultExtraProps) => ReactNode
> = new Map([
  ["character-fortune", (props) => <CharacterFortuneResultExtra {...props} />],
  ["science-thinking", (props) => <ScienceThinkingResultExtra {...props} />],
  ["japanese-culture", (props) => <JapaneseCultureResultExtra {...props} />],
]);

/** その診断が追加の読みものを持つか。持たない診断では、置く側が「このタイプについて」に何も足さない。 */
export function hasResultExtra(slug: string): boolean {
  return RESULT_EXTRAS.has(slug);
}

interface ResultExtraLoaderProps extends ResultExtraProps {
  slug: string;
}

/** その診断の追加の読みものだけを読み込んで描く。 */
export default function ResultExtraLoader({
  slug,
  ...props
}: ResultExtraLoaderProps) {
  const renderExtra = RESULT_EXTRAS.get(slug);
  return renderExtra ? renderExtra(props) : null;
}
