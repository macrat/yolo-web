import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import ShareButtons from "@/components/ShareButtons";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { generatePlayJsonLd } from "@/play/seo";
import { safeJsonLdStringify } from "@/lib/seo";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { playContentBySlug } from "@/play/registry";
import { getResultNextContents } from "@/play/recommendation";
import { toPlayListItems } from "@/play/listItems";
import type { QuizDefinition } from "@/play/quiz/types";
import { solvedScreenHeadings } from "@/play/quiz/solvedScreenHeadings";
import styles from "@/app/play/[slug]/page.module.css";

interface QuizPlayPageLayoutProps {
  quiz: QuizDefinition;
  slug: string;
  referrerTypeId?: string;
}

/**
 * クイズ・診断のページ（プレイ面）の共通の組み方。動的ルート（/play/[slug]）と専用ルート（/play/music-personality
 * など）が使う。
 *
 * ページはセクションを上から並べる（DESIGN.md §5 ページの割り方）。
 *   1. パンくず・主見出し（h1）・クイズ本体（開始の画面・設問・解き終えた画面）
 *   2. よくある質問（FAQPage の JSON-LD を持つ）
 *   3. このクイズ・診断を人に勧めるページの共有。結果の共有は、解き終えた画面の結果のすぐ下にある
 *   4. 同じ分類のクイズ・診断（RelatedQuizzes）
 *   5. ほかの分類のおすすめ（RecommendedContent）
 * 4 と 5 は、並べるものが無ければセクションごと描かない。
 *
 * h1 はどの段階でも §4 の主見出しのまま置く。クイズの説明は、開始の画面が「はじめる」の下に置く。
 *
 * 解き終えた画面の結果の見出し（タイプ名）と詳しい読みものの小見出しは、クライアントの部品が描くデータから作る
 * 見出しなので、文節の区切りをここ（サーバー）で全件ぶん作って渡す（§4）。
 */
export default async function QuizPlayPageLayout({
  quiz,
  slug,
  referrerTypeId,
}: QuizPlayPageLayoutProps) {
  const meta = playContentBySlug.get(slug);
  const jsonLd = meta ? generatePlayJsonLd(meta) : null;

  const resultNextContents = toPlayListItems(getResultNextContents(slug));
  const { resultHeadings, readingHeadings } = solvedScreenHeadings(quiz);
  const recommendHeading =
    quiz.meta.type === "knowledge"
      ? ["この", "クイズを", "勧める"]
      : ["この", "診断を", "勧める"];

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
      )}

      <Section>
        <div className={styles.head}>
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "遊び", href: "/play" },
              { label: quiz.meta.title, href: `/play/${slug}` },
            ]}
          />
          <PhrasedText
            as="h1"
            phrases={splitIntoPhrases(quiz.meta.title)}
            {...headingFontAttr(quiz.meta.title)}
          />
          <QuizContainer
            quiz={quiz}
            referrerTypeId={referrerTypeId}
            recommendedContents={resultNextContents}
            resultHeadings={resultHeadings}
            readingHeadings={readingHeadings}
          />
        </div>
      </Section>

      {quiz.meta.faq && quiz.meta.faq.length > 0 && (
        <Section>
          <FaqSection faq={quiz.meta.faq} />
        </Section>
      )}

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={recommendHeading}
        />
        <ShareButtons
          url={"/play/" + slug}
          title={quiz.meta.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="quiz"
          contentId={slug}
        />
      </Section>

      {meta && <RelatedQuizzes currentSlug={slug} category={meta.category} />}

      <RecommendedContent currentSlug={slug} />
    </>
  );
}
