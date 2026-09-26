/**
 * 診断の結果のページ（`/play/[slug]/result/[resultId]`）の共通の枠。
 *
 * このページを開くのは、シェアや検索で着いた来訪者と、解き終えた画面（`ResultCard`）に並ぶタイプの行から
 * 来た来訪者である。解き終えた画面の結果は `ResultCard.tsx` が描く。
 */
import Breadcrumb from "@/components/Breadcrumb";
import Tsutsumi from "@/components/Tsutsumi";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import type { QuizDefinition, QuizResult } from "../types";
import { pickResultWairoColor, pickResultSymbol } from "./resultVisual";
import { contentIdForQuiz } from "@/play/quiz/contentId";
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

  // 単独結果ページのヘッダを、解き終えた画面（ResultCard）の包みと同じ視覚（象徴タイル＋固有名）に
  // 揃える。シェアや検索で着いた第三者にも、本人が見たのと同じ姿で結果を届ける。
  // 適用条件は ResultCard と同じ「personality 型 かつ result.icon・result.color が両方存在」。
  // それ以外（knowledge 型・欠落）は title だけの見出しにフォールバックする。
  // 重要: 単独ページには「診断完了」の文字を付けない。第三者は診断を完走していないため、
  //   完了主張は偽になる。単独ページの包みは (象徴タイル＋固有名) のみ。
  const showMedal =
    quiz.meta.type === "personality" &&
    Boolean(result.icon) &&
    Boolean(result.color);

  return (
    <div className={styles.wrapper}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊び", href: "/play" },
          { label: quiz.meta.title, href: `/play/${slug}` },
          { label: "結果", href: `/play/${slug}/result/${result.id}` },
        ]}
      />
      <div className={styles.card}>
        {/* クイズ名 + shortDescription: 第三者が「この診断は何か」を即座に把握できるコンテキスト */}
        <p className={styles.quizName}>{quiz.meta.title}の結果</p>
        <p className={styles.quizContext}>{quiz.meta.shortDescription}</p>

        {showMedal ? (
          // 結果を包み（Tsutsumi）で見せる。
          // h1 は SEO/見出し構造のため置くが控えめに（器は静か）。結果そのものは
          // Tsutsumi が主役——第三者向けページでも解き終えた画面と同じ視覚で届ける。
          // 固有色は quiz データの任意 hex を使わず、id から和色8色へ決定的に写像する。
          // symbol は絵文字ではなくタイプ名の先頭1字（DESIGN.md §5）。
          // 重要: 単独ページには「診断完了」の完了主張は付けない（第三者は完走していない）。
          <div className={styles.medalWrap}>
            <h1 className={styles.medalHeading}>{result.title}</h1>
            <Tsutsumi
              typeName={result.title}
              symbol={pickResultSymbol(result.title)}
              color={pickResultWairoColor(result.id)}
              productName={quiz.meta.title}
              seal="診"
            />
          </div>
        ) : (
          <h1 className={styles.title}>{result.title}</h1>
        )}

        {children}

        <div className={styles.shareSection}>
          <ShareButtons
            shareText={shareText}
            shareUrl={shareUrl}
            quizTitle={quiz.meta.title}
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
