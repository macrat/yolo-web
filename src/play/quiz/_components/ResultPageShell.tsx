/**
 * ⚠️ 重要 — このコンポーネントは「受検者本人には表示されない」第三者向け結果ページの共通枠です。
 *
 * ResultPageShell は静的ルート `/play/[slug]/result/[resultId]`（各診断の result ページ）でのみ
 * 使われる。これらは【第三者向けのシェア／検索ランディング専用ページ】であり、診断を遊んだ
 * 本人には表示されない。本人は完了時に `/play/[slug]` 上のインライン `ResultCard` で結果を見る。
 * 本人向けの結果表示を変えたい場合は ResultPageShell ではなく `ResultCard.tsx` を編集すること。
 */
import Breadcrumb from "@/components/Breadcrumb";
import Tsutsumi from "@/components/Tsutsumi";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import type { QuizDefinition, QuizResult } from "../types";
import { pickResultWairoColor, pickResultSymbol } from "./resultVisual";
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
          // 結果を包み（Tsutsumi）で見せる（DESIGN.md §4「包み」/§7「見せたくなる結果」）。
          // h1 は SEO/見出し構造のため維持するが控えめに（器は静か）。結果そのものは
          // Tsutsumi が主役——第三者向けページでもインライン結果と同じ視覚トーンで届ける
          // （§7 トーン統一）。固有色は quiz データの任意 hex を捨て、id から和色8色へ
          // 決定的に写像する（§2）。symbol は絵文字ではなくタイプ名の先頭1字（§8-6）。
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
