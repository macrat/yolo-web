import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { quizBySlug, getAllQuizSlugs } from "@/play/quiz/registry";
import {
  generatePlayMetadata,
  generatePlayJsonLd,
  resolveDisplayCategory,
} from "@/play/seo";
import { safeJsonLdStringify } from "@/lib/seo";
import {
  playContentBySlug,
  quizQuestionCountBySlug,
  DAILY_UPDATE_SLUGS,
} from "@/play/registry";
import { getResultNextContents } from "@/play/recommendation";
import { getContentPath } from "@/play/paths";
import type { PlayContentMeta } from "@/play/types";
import type { ResultNextContentItem } from "@/play/quiz/_components/ResultNextContent";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * クイズ14種のslugのみを返す。
 * ゲームは固定ルート（/play/irodori/ 等）で処理されるため、
 * 動的ルートの generateStaticParams には含めない。
 * Next.js では固定ルートが動的ルートより優先されるため衝突しない。
 */
export async function generateStaticParams() {
  return getAllQuizSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = playContentBySlug.get(slug);
  if (!meta) return {};
  return generatePlayMetadata(meta);
}

/**
 * コスト感情報（所要時間の目安）を返す。
 *
 * 評価順序:
 * 1. quizQuestionCountBySlug に問数がある → 「全X問」
 * 2. DAILY_UPDATE_SLUGS に含まれる → 「毎日更新」
 * 3. それ以外 → resolveDisplayCategory の結果（「パズル」「診断」等）
 *
 * Server Component（page.tsx）で呼び出すため、registryのimportはOK。
 */
function buildMetaText(slug: string, content: PlayContentMeta): string {
  const questionCount = quizQuestionCountBySlug.get(slug);
  if (questionCount !== undefined) {
    return `全${questionCount}問`;
  }
  if (DAILY_UPDATE_SLUGS.has(slug)) {
    return "毎日更新";
  }
  return resolveDisplayCategory(content);
}

export default async function PlayQuizPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  // playContentBySlug にも登録されている前提（タスク1で完了済み）
  const meta = playContentBySlug.get(slug);
  const jsonLd = meta ? generatePlayJsonLd(meta) : null;

  // クイズの相性機能: 友達のタイプIDをクエリパラメータ ref から取得する
  // バリデーションはクライアントサイドの ResultExtraLoader が担うため、ここでは渡すだけ
  const resolvedSearchParams = await searchParams;
  const refParam =
    typeof resolvedSearchParams.ref === "string"
      ? resolvedSearchParams.ref
      : undefined;

  // 結果画面直下の回遊導線用データを事前計算。
  // Server Component（page.tsx）で計算することで、registryとseoのimportが
  // クライアントバンドルに含まれるのを防ぐ。
  const rawResultNextContents = getResultNextContents(slug);
  const resultNextContents: ResultNextContentItem[] = rawResultNextContents.map(
    (content) => ({
      slug: content.slug,
      title: content.title,
      shortTitle: content.shortTitle,
      icon: content.icon,
      category: content.category,
      contentPath: getContentPath(content),
      metaText: buildMetaText(content.slug, content),
      categoryLabel: resolveDisplayCategory(content),
    }),
  );

  return (
    <div className={styles.wrapper}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
      )}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "遊ぶ", href: "/play" },
          { label: quiz.meta.title },
        ]}
      />
      <TrustLevelBadge
        level={quiz.meta.trustLevel}
        note={quiz.meta.trustNote}
      />
      <QuizContainer
        quiz={quiz}
        referrerTypeId={refParam}
        recommendedContents={resultNextContents}
      />
      <FaqSection faq={quiz.meta.faq} />
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>
          この診断が楽しかったらシェア
        </h2>
        <ShareButtons
          url={"/play/" + slug}
          title={quiz.meta.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="quiz"
          contentId={slug}
        />
      </section>
      {meta && <RelatedQuizzes currentSlug={slug} category={meta.category} />}
      <RecommendedContent currentSlug={slug} />
    </div>
  );
}
