import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import ShareButtons from "@/components/ShareButtons";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { generatePlayJsonLd } from "@/play/seo";
import { safeJsonLdStringify } from "@/lib/seo";
import { playContentBySlug } from "@/play/registry";
import { getResultNextContents } from "@/play/recommendation";
import { toPlayListItems } from "@/play/listItems";
import type { QuizDefinition } from "@/play/quiz/types";
import { solvedScreenHeadings } from "@/play/quiz/solvedScreenHeadings";
// プレイ層のスタイルを参照する
import styles from "@/app/play/[slug]/page.module.css";

interface QuizPlayPageLayoutProps {
  quiz: QuizDefinition;
  slug: string;
  referrerTypeId?: string;
}

/**
 * クイズ・診断のページの共通の組み方。動的ルート（/play/[slug]）と専用ルート（/play/music-personality など）が使う。
 *
 * 来訪者が何のページかを確かめてから本体に入れるよう、文脈 → 本体 → 二次情報の順に並べる。
 *   1. パンくず（BreadcrumbList の JSON-LD を持つ）
 *   2. h1 と短い説明。ファーストビューを本体に空けるため短く組む
 *   3. クイズ本体（QuizContainer）
 *   4. FAQ（FAQPage の JSON-LD を持つ）
 *   5. このクイズ・診断を人に勧めるページの共有。結果の共有は、解き終えた画面の結果のすぐ下にある
 *   6. 同じ分類のクイズ・診断（RelatedQuizzes）
 *   7. ほかの分類のおすすめ（RecommendedContent）
 *
 * 解き終えた画面の結果の見出し（タイプ名）と詳しい読みものの小見出しは、クライアントの部品が描くデータから作る
 * 見出しなので、文節の区切りをここ（サーバー）で全件ぶん作って渡す（DESIGN.md §4）。
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
    quiz.meta.type === "knowledge" ? "このクイズを勧める" : "この診断を勧める";

  return (
    <article className={styles.layout}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
      )}

      {/* 1. パンくず（BreadcrumbList JSON-LD 内蔵） */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊び", href: "/play" },
          { label: quiz.meta.title, href: `/play/${slug}` },
        ]}
      />

      {/* 2. コンパクトな h1 + 短説明（ファーストビューを占有しない） */}
      <header className={styles.header}>
        <h1 className={styles.title}>{quiz.meta.title}</h1>
        <p className={styles.shortDescription}>{quiz.meta.description}</p>
      </header>

      {/* 3. クイズ本体 */}
      <QuizContainer
        quiz={quiz}
        referrerTypeId={referrerTypeId}
        recommendedContents={resultNextContents}
        resultHeadings={resultHeadings}
        readingHeadings={readingHeadings}
      />

      {/* 4. FAQ（FAQPage JSON-LD 内蔵）。faq が空のとき FaqSection は null を返す */}
      <FaqSection faq={quiz.meta.faq} />

      {/* 5. ページの共有 */}
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>{recommendHeading}</h2>
        <ShareButtons
          url={"/play/" + slug}
          title={quiz.meta.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="quiz"
          contentId={slug}
        />
      </section>

      {/* 6. 関連クイズ・診断 */}
      {meta && <RelatedQuizzes currentSlug={slug} category={meta.category} />}

      {/* 7. 他ジャンルのおすすめ */}
      <RecommendedContent currentSlug={slug} />
    </article>
  );
}
