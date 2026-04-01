import Breadcrumb from "@/components/common/Breadcrumb";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import type { QuizDefinition, QuizResult } from "../types";
import styles from "./ResultPageShell.module.css";

interface ResultPageShellProps {
  quiz: QuizDefinition;
  result: QuizResult;
  children: React.ReactNode;
  shareText: string;
  shareUrl: string;
  /** シェアボタン直後に表示するコンテンツ（相性診断表示など、ルート固有の追加要素） */
  afterShare?: React.ReactNode;
}

/**
 * 結果ページの共通wrapper構造を提供するServer Component。
 *
 * Breadcrumb, クイズ名, quizContext, icon, h1, ShareButtons,
 * RelatedQuizzes, RecommendedContent を描画し、
 * ルート固有のコンテンツは children として受け取る。
 *
 * dispatch機構を含まず、variant固有のJSXはchildrenとして委譲される。
 */
export default function ResultPageShell({
  quiz,
  result,
  children,
  shareText,
  shareUrl,
  afterShare,
}: ResultPageShellProps) {
  const slug = quiz.meta.slug;

  return (
    <div className={styles.wrapper}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊ぶ", href: "/play" },
          { label: quiz.meta.title, href: `/play/${slug}` },
          { label: "結果" },
        ]}
      />
      <div className={styles.card}>
        {/* クイズ名 + shortDescription: 第三者が「この診断は何か」を即座に把握できるコンテキスト */}
        <p className={styles.quizName}>{quiz.meta.title}の結果</p>
        <p className={styles.quizContext}>{quiz.meta.shortDescription}</p>

        {result.icon && <div className={styles.icon}>{result.icon}</div>}
        <h1 className={styles.title}>{result.title}</h1>

        {children}

        <div className={styles.shareSection}>
          <ShareButtons
            shareText={shareText}
            shareUrl={shareUrl}
            quizTitle={quiz.meta.title}
            contentType={
              quiz.meta.type === "personality" ? "diagnosis" : "quiz"
            }
            contentId={`quiz-${slug}`}
          />
        </div>
        {afterShare}
      </div>
      <RelatedQuizzes currentSlug={slug} category={quiz.meta.category} />
      <RecommendedContent currentSlug={slug} />
    </div>
  );
}
