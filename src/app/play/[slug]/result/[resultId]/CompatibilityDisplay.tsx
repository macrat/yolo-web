"use client";

/**
 * ⚠️ 重要 — このコードは「受検者本人には表示されない」第三者向け結果ページの一部です。
 *
 * ルート `/play/[slug]/result/[resultId]`（診断の result ページ）は【第三者向けの
 * シェア／検索ランディング専用】。診断を遊んだ本人は、完了時に `/play/[slug]` 上に
 * インライン描画される結果（ResultCard 経由）で見ており、この `/result/<id>` ページへは
 * 遷移しない（この URL はシェア用に生成される）。文言・構造・メタ・OGP は
 * 「診断をやっていない第三者が初めて見る」前提で設計すること。本人向け結果体験は
 * `src/play/quiz/_components/ResultCard.tsx` 側で編集する。
 */

import CompatibilitySection from "@/play/quiz/_components/CompatibilitySection";

interface CompatibilityDisplayProps {
  quizSlug: string;
  quizTitle: string;
  compatibility: { label: string; description: string };
  myType: { id: string; title: string; icon?: string };
  friendType: { id: string; title: string; icon?: string };
}

/**
 * Client component that renders the compatibility section
 * on the static result page when ?with= parameter is present.
 *
 * All data is resolved server-side in page.tsx and passed as required props.
 */
export default function CompatibilityDisplay({
  quizSlug,
  quizTitle,
  compatibility,
  myType,
  friendType,
}: CompatibilityDisplayProps) {
  return (
    <CompatibilitySection
      myType={myType}
      friendType={friendType}
      compatibility={compatibility}
      quizTitle={quizTitle}
      quizSlug={quizSlug}
    />
  );
}
