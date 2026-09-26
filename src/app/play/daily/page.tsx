import Breadcrumb from "@/components/Breadcrumb";
import PhrasedText from "@/components/PhrasedText";
import type { ResultHeading } from "@/components/ResultBox";
import DailyFortuneCard from "@/play/fortune/_components/DailyFortuneCard";
import { DAILY_FORTUNES } from "@/play/fortune/data/daily-fortunes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { generatePlayMetadata, generatePlayJsonLd } from "@/play/seo";
import { safeJsonLdStringify } from "@/lib/seo";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { fortunePlayContentMeta } from "@/play/registry";
import styles from "./page.module.css";

export const metadata = generatePlayMetadata(fortunePlayContentMeta);

const jsonLd = generatePlayJsonLd(fortunePlayContentMeta);

/**
 * すべての運勢の名の見出し。どれが出るかは来訪者の端末で決まるので、候補の全件の文節の区切りを
 * ここで作って渡す（区切りを作る処理はサーバーだけで動く）。
 */
const fortuneHeadings: Record<string, ResultHeading> = Object.fromEntries(
  DAILY_FORTUNES.map((fortune) => [
    fortune.id,
    {
      phrases: splitIntoPhrases(fortune.title),
      ...headingFontAttr(fortune.title),
    },
  ]),
);

/** 占っているあいだ、運勢の名の代わりに見出しに出す文。 */
const PENDING_HEADING_TEXT = "占っています……";
const pendingHeading: ResultHeading = {
  phrases: splitIntoPhrases(PENDING_HEADING_TEXT),
  ...headingFontAttr(PENDING_HEADING_TEXT),
};

export default function DailyFortunePage() {
  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊び", href: "/play" },
          { label: fortunePlayContentMeta.title, href: "/play/daily" },
        ]}
      />
      <PhrasedText
        as="h1"
        phrases={splitIntoPhrases(fortunePlayContentMeta.title)}
        className={styles.title}
        {...headingFontAttr(fortunePlayContentMeta.title)}
      />
      <DailyFortuneCard
        headings={fortuneHeadings}
        pendingHeading={pendingHeading}
      />
      <RecommendedContent currentSlug="daily" />
    </div>
  );
}
