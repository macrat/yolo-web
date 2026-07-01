/**
 * ⚠️ 重要 — このコンポーネントは「受検者本人には表示されない」第三者向け結果ページの共通枠です。
 *
 * ResultPageShell は静的ルート `/play/[slug]/result/[resultId]`（各診断の result ページ）でのみ
 * 使われる。これらは【第三者向けのシェア／検索ランディング専用ページ】であり、診断を遊んだ
 * 本人には表示されない。本人は完了時に `/play/[slug]` 上のインライン `ResultCard` で結果を見る。
 * 本人向けの結果表示を変えたい場合は ResultPageShell ではなく `ResultCard.tsx` を編集すること。
 */
import Breadcrumb from "@/components/Breadcrumb";
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

  // MUST-2（§7 トーン統一）: 単独結果ページのヘッダを、インライン ResultCard の
  // 勲章と同じ視覚（象徴タイル＋固有名）に揃える。シェア/検索で着地した第三者にも
  // 「結果＝勲章」の印象を割らずに届ける（DESIGN.md §7「インライン結果と単独結果
  //  ページの視覚トーンを統一」）。
  // 適用条件はインラインと同じ「personality 型 かつ result.icon・result.color が両方存在」。
  // それ以外（knowledge 型・欠落）は現行の素の icon+title にフォールバックする。
  // 重要: 単独ページには「診断完了」バッジを付けない。第三者は診断を完走していないため、
  //   完了主張は偽になる。単独ページの勲章＝(象徴タイル＋固有名) のみ。
  const showMedal =
    quiz.meta.type === "personality" &&
    Boolean(result.icon) &&
    Boolean(result.color);

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

        {showMedal ? (
          // 勲章ヘッダ（§7：無彩の土台に結果固有色が一点効く構図）。
          // 固有色は象徴タイルの面（低アルファのティント）と罫にのみ使い、全面は塗らない。
          // タイトルは固有名を勲章の核として際立たせ、色は --fg を維持する（WCAG 1.4.1・
          // 固有色はテキストに使わない）。h1 は SEO/見出し構造のため維持する。
          <div className={styles.medal}>
            {/* 象徴（icon）を主役に。結果固有色を CSS 変数で渡し面のティントと罫に使う
                （テキスト色には使わない）。情報は下のタイトルが担うため装飾として aria-hidden。 */}
            <div
              className={styles.medalIcon}
              style={{ "--medal-color": result.color } as React.CSSProperties}
              aria-hidden="true"
            >
              {result.icon}
            </div>
            <h1 className={styles.medalTitle}>{result.title}</h1>
          </div>
        ) : (
          <>
            {result.icon && <div className={styles.icon}>{result.icon}</div>}
            <h1 className={styles.title}>{result.title}</h1>
          </>
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
