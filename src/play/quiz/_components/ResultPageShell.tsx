/**
 * 診断の結果のページ（`/play/[slug]/result/[resultId]`）の共通の枠。
 *
 * このページを開くのは、シェアや検索で着いた来訪者と、解き終えた画面（`ResultCard`）に並ぶタイプの行から
 * 来た来訪者である。操作の結果ではなくタイプを説明するページなので、結果のボックスを持たず、タイプ名を
 * ページの h1 にする（DESIGN.md §4・§8）。解き終えた画面の結果は `ResultCard.tsx` が描く。
 */
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PhrasedText from "@/components/PhrasedText";
import ShareButtons from "@/components/ShareButtons";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import OtherTypesNav from "@/play/quiz/_components/OtherTypesNav";
import { ReadingSection } from "@/play/quiz/_components/ResultReading";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import type { QuizDefinition, QuizResult } from "../types";
import { resultHeadingName } from "../resultName";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./ResultPageShell.module.css";

/** 共有の区画の見出しの id。共有の区画はページに1つだけなので、固定の値でよい。 */
const SHARE_HEADING_ID = "result-share-heading";

interface ResultPageShellProps {
  quiz: QuizDefinition;
  result: QuizResult;
  /** タイプ名のすぐ後に置く、本文の大きさの段落（キャッチコピーやキャラの自己紹介）。 */
  lead?: string;
  /** 誘いのあとに置くタイプの説明。全文を段落で置き、切り分けない（DESIGN.md §8）。 */
  description?: string;
  /** 添えた段落のすぐ下に置く、この診断を遊ぶ誘いのボタンの文言。 */
  ctaText: string;
  /**
   * 誘いのあとに続く、ルートごとの読みもの（詳しい読みものと、?with= で受け取った相性）。渡したときに、
   * セクション「このタイプについて」に置く。
   */
  children?: React.ReactNode;
  shareText: string;
  shareUrl: string;
  /** 結果が色そのものである診断で、タイプ名のすぐ下に出す結果の色（DESIGN.md §2 の色見本）。 */
  swatch?: string;
}

/**
 * 結果のページを組む。上から、何の診断の結果かの行・タイプ名の h1・読み・色見本、添えた段落・診断への誘い・
 * タイプの説明、ルートごとの読みもの（セクション「このタイプについて」）、すべてのタイプ、共有の区画、関連の区画。
 * 誘いを説明の前に置き、共有のリンクから来た来訪者が、最初の画面でタイプ名と添えた段落と誘いを見られるように
 * する。読みもののセクションはルートが中身を渡したときに、すべてのタイプはタイプが詳しい読みものを持つときに置く。
 *
 * タイプ名は、サーバーで作った文節の区切りで折る（DESIGN.md §4）。読みは見出しの折れを避けるため h1 に
 * 入れず、すぐ下に補助情報として添える。共有の操作はページに1か所だけ置き、何を共有するかを見出しが言う（§8）。
 */
export default function ResultPageShell({
  quiz,
  result,
  lead,
  description,
  ctaText,
  children,
  shareText,
  shareUrl,
  swatch,
}: ResultPageShellProps) {
  const slug = quiz.meta.slug;
  const heading = resultHeadingName(result);

  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊び", href: "/play" },
          { label: quiz.meta.title, href: `/play/${slug}` },
          { label: "結果", href: `/play/${slug}/result/${result.id}` },
        ]}
      />
      <header className={styles.header}>
        <p className={styles.quizName}>
          {quiz.meta.shortTitle ?? quiz.meta.title}の結果
        </p>
        <PhrasedText
          as="h1"
          phrases={splitIntoPhrases(heading.name)}
          className={styles.title}
          {...headingFontAttr(heading.name)}
        />
        {heading.reading && <p className={styles.reading}>{heading.reading}</p>}
        {swatch && (
          <div
            className={styles.swatch}
            style={{ backgroundColor: swatch }}
            aria-hidden="true"
          />
        )}
      </header>

      <div className={styles.body}>
        <div className={styles.intro}>
          {lead && <p className={styles.lead}>{lead}</p>}
          <div>
            <Link
              href={`/play/${slug}`}
              className={styles.tryButton}
              data-inverted
            >
              {ctaText}
            </Link>
            <p className={styles.tryCost}>
              全{quiz.meta.questionCount}問 / 登録不要
            </p>
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {children && <ReadingSection>{children}</ReadingSection>}
        {result.detailedContent && (
          <OtherTypesNav
            quizSlug={slug}
            currentResultId={result.id}
            results={quiz.results}
            placement="resultPage"
            showSwatch={swatch !== undefined}
          />
        )}

        <section className={styles.share} aria-labelledby={SHARE_HEADING_ID}>
          <PhrasedText
            as="h2"
            id={SHARE_HEADING_ID}
            className={styles.shareHeading}
            phrases={["この", "結果を", "共有"]}
          />
          <ShareButtons
            url={shareUrl}
            title={quiz.meta.title}
            text={shareText}
            sns={["x", "line", "copy"]}
            contentType={
              quiz.meta.type === "personality" ? "diagnosis" : "quiz"
            }
            contentId={contentIdForQuiz(slug)}
            surface="text"
          />
        </section>
      </div>
      <RelatedQuizzes currentSlug={slug} category={quiz.meta.category} />
      <RecommendedContent currentSlug={slug} />
    </div>
  );
}
