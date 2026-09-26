/**
 * 診断の結果のページ（`/play/[slug]/result/[resultId]`）の共通の枠。
 *
 * このページを開くのは、シェアや検索で着いた来訪者と、解き終えた画面（`ResultCard`）に並ぶタイプの行から
 * 来た来訪者である。操作の結果ではなくタイプを説明するページなので、結果のボックスを持たず、タイプ名を
 * ページの h1 にする（DESIGN.md §4・§8）。解き終えた画面の結果は `ResultCard.tsx` が描く。
 */
import Breadcrumb from "@/components/Breadcrumb";
import PhrasedText from "@/components/PhrasedText";
import ShareButtons from "@/components/ShareButtons";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import type { QuizDefinition, QuizResult } from "../types";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./ResultPageShell.module.css";

interface ResultPageShellProps {
  quiz: QuizDefinition;
  result: QuizResult;
  children: React.ReactNode;
  shareText: string;
  shareUrl: string;
  /** 結果が色そのものである診断で、タイプ名のすぐ下に出す結果の色（DESIGN.md §2 の色見本）。 */
  swatch?: string;
  /** 共有のボタンの直後に置く、ルートごとの区画（相性など）。 */
  afterShare?: React.ReactNode;
}

/**
 * 結果のページの頭（何の診断の結果かの行・タイプ名の h1・読み・色見本）と、共有・関連の区画を組む。
 * タイプ名の説明から先は、ルートごとの中身を children として受け取る。
 *
 * タイプ名は、サーバーで作った文節の区切りで折る（DESIGN.md §4）。読みにくい語の読みは、見出しの折れを
 * 避けるため h1 に入れず、すぐ下に補助情報として添える。
 */
export default function ResultPageShell({
  quiz,
  result,
  children,
  shareText,
  shareUrl,
  swatch,
  afterShare,
}: ResultPageShellProps) {
  const slug = quiz.meta.slug;

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
        <p className={styles.quizName}>{quiz.meta.title}の結果</p>
        <PhrasedText
          as="h1"
          phrases={splitIntoPhrases(result.title)}
          className={styles.title}
          {...headingFontAttr(result.title)}
        />
        {result.reading && (
          <p className={styles.reading}>{result.reading.kana}</p>
        )}
        {swatch && (
          <div
            className={styles.swatch}
            style={{ backgroundColor: swatch }}
            aria-hidden="true"
          />
        )}
      </header>

      <div className={styles.body}>
        {children}

        <div className={styles.shareSection}>
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
        </div>
        {afterShare}
      </div>
      <RelatedQuizzes currentSlug={slug} category={quiz.meta.category} />
      <RecommendedContent currentSlug={slug} />
    </div>
  );
}
