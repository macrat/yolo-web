import CompatibilitySection from "@/play/quiz/_components/CompatibilitySection";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";

interface CompatibilityDisplayProps {
  quizSlug: string;
  quizTitle: string;
  compatibility: { label: string; description: string };
  myType: { id: string; title: string };
  friendType: { id: string; title: string };
}

/**
 * 結果のページに ?with= で友達のタイプが渡されたときの相性の区画。相性を持つ診断の結果のページが、読みものの
 * セクション「このタイプについて」の最後に置く。データはページがサーバーで解決して渡し、相性の名前の見出しの
 * 区切りもここでサーバーで作る。相性の名前は、そのセクションの中の小見出し（h3）になる。
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
