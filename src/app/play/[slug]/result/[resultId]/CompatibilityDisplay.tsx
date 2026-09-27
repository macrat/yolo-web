import CompatibilitySection from "@/play/quiz/_components/CompatibilitySection";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";

interface CompatibilityDisplayProps {
  quizSlug: string;
  quizTitle: string;
  compatibility: { label: string; description: string };
  myType: { id: string; title: string; icon?: string };
  friendType: { id: string; title: string; icon?: string };
}

/**
 * 結果のページに ?with= で友達のタイプが渡されたときの相性の区画。データは page.tsx がサーバーで解決して渡し、
 * 相性の名前の見出しの区切りもここでサーバーで作る。結果のページではタイプ名が h1 なので、相性の見出しは
 * その下の h2 になる。
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
      placement="resultPage"
      labelHeading={{
        phrases: splitIntoPhrases(compatibility.label),
        ...headingFontAttr(compatibility.label),
      }}
      myType={myType}
      friendType={friendType}
      compatibility={compatibility}
      quizTitle={quizTitle}
      quizSlug={quizSlug}
    />
  );
}
