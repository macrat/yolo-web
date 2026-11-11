import Breadcrumb from "@/components/Breadcrumb";
import PhrasedText from "@/components/PhrasedText";
import type { ResultHeading } from "@/components/ResultBox";
import Section from "@/components/Section";
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

/**
 * 今日のユーモア運勢のページ。ページはセクションを上から並べる（DESIGN.md §5 ページの割り方）。
 *   1. 最初のセクション。パンくずと主見出し（h1）の下に、今日の運勢の結果のボックスと、結果の共有を置く
 *   2. ほかの分類のおすすめ（RecommendedContent）。並べるものが無ければセクションごと描かない
 */
export default function DailyFortunePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <Section>
        <div className={styles.head}>
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
            {...headingFontAttr(fortunePlayContentMeta.title)}
          />
        </div>
        <DailyFortuneCard
          headings={fortuneHeadings}
          pendingHeading={pendingHeading}
        />
      </Section>
      <RecommendedContent currentSlug="daily" />
    </>
  );
}
