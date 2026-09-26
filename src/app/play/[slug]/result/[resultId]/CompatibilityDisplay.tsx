"use client";

import CompatibilitySection from "@/play/quiz/_components/CompatibilitySection";

interface CompatibilityDisplayProps {
  quizSlug: string;
  quizTitle: string;
  compatibility: { label: string; description: string };
  myType: { id: string; title: string; icon?: string };
  friendType: { id: string; title: string; icon?: string };
}

/**
 * 結果のページに ?with= で友達のタイプが渡されたときの相性の区画。データは page.tsx がサーバーで解決して渡す。
 * 結果のページではタイプ名が h1 なので、相性の見出しはその下の h2 になる。
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
      placement="resultPage"
    />
  );
}
