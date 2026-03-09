"use client";

import dynamic from "next/dynamic";
import type { QuizAnswer } from "@/quiz/types";

/**
 * Lazy-loaded wrappers for quiz-specific result extra components.
 * Using next/dynamic ensures these heavy data modules (music-personality,
 * character-fortune, animal-personality, science-thinking) are code-split
 * into separate chunks and only loaded when the corresponding quiz result
 * is shown.
 */

const MusicPersonalityResultExtra = dynamic(
  () =>
    import("./MusicPersonalityResultExtra").then((mod) => {
      // Wrap the render function pattern into a React component
      function Wrapper({
        resultId,
        referrerTypeId,
      }: {
        resultId: string;
        referrerTypeId?: string;
      }) {
        const renderFn = mod.renderMusicPersonalityExtra(referrerTypeId);
        return <>{renderFn(resultId)}</>;
      }
      return { default: Wrapper };
    }),
  { ssr: false },
);

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

const AnimalPersonalityResultExtra = dynamic(
  () =>
    import("./AnimalPersonalityResultExtra").then((mod) => {
      function Wrapper({
        resultId,
        referrerTypeId,
      }: {
        resultId: string;
        referrerTypeId?: string;
      }) {
        const renderFn = mod.renderAnimalPersonalityExtra(referrerTypeId);
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

interface ResultExtraLoaderProps {
  slug: string;
  resultId: string;
  referrerTypeId?: string;
  /** Optional answers array, needed by quizzes that compute per-user scores (e.g. science-thinking) */
  answers?: QuizAnswer[];
}

/**
 * Dynamically loads and renders quiz-specific extra content below the result
 * card. Only loads the relevant module for the active quiz slug.
 */
export default function ResultExtraLoader({
  slug,
  resultId,
  referrerTypeId,
  answers,
}: ResultExtraLoaderProps) {
  if (slug === "music-personality") {
    return (
      <MusicPersonalityResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  if (slug === "character-fortune") {
    return (
      <CharacterFortuneResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
      />
    );
  }
  if (slug === "animal-personality") {
    return (
      <AnimalPersonalityResultExtra
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
  return null;
}
