import type { Metadata } from "next";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import musicPersonalityQuiz from "@/play/quiz/data/music-personality";
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
import styles from "@/app/play/[slug]/page.module.css";

const SLUG = "music-personality";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 専用ルートのため generateStaticParams は不要（slugパラメータなし）。
 * Next.js の静的エクスポートとの互換性のために空配列を返す。
 */
export async function generateStaticParams(): Promise<[]> {
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = playContentBySlug.get(SLUG);
  if (!meta) return {};
  return generatePlayMetadata(meta);
}

/**
 * コスト感情報（所要時間の目安）を返す。
 * 動的ルートの buildMetaText と同じロジック。
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

export default async function MusicPersonalityPlayPage({
  searchParams,
}: Props) {
  const meta = playContentBySlug.get(SLUG);
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
  const rawResultNextContents = getResultNextContents(SLUG);
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
          { label: musicPersonalityQuiz.meta.title },
        ]}
      />
      <TrustLevelBadge
        level={musicPersonalityQuiz.meta.trustLevel}
        note={musicPersonalityQuiz.meta.trustNote}
      />
      <QuizContainer
        quiz={musicPersonalityQuiz}
        referrerTypeId={refParam}
        recommendedContents={resultNextContents}
      />
      <FaqSection faq={musicPersonalityQuiz.meta.faq} />
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>
          この診断が楽しかったらシェア
        </h2>
        <ShareButtons
          url={"/play/" + SLUG}
          title={musicPersonalityQuiz.meta.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="quiz"
          contentId={SLUG}
        />
      </section>
      {meta && <RelatedQuizzes currentSlug={SLUG} category={meta.category} />}
      <RecommendedContent currentSlug={SLUG} />
    </div>
  );
}
