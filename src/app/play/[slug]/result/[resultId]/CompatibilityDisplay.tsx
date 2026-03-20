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
