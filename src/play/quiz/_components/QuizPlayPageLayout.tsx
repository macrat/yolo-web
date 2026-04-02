import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import QuizContainer from "@/play/quiz/_components/QuizContainer";
import RelatedQuizzes from "@/play/quiz/_components/RelatedQuizzes";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { generatePlayJsonLd, resolveDisplayCategory } from "@/play/seo";
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
import type { QuizDefinition } from "@/play/quiz/types";
import styles from "@/app/play/[slug]/page.module.css";

interface QuizPlayPageLayoutProps {
  quiz: QuizDefinition;
  slug: string;
  referrerTypeId?: string;
}

/**
 * コスト感情報（所要時間の目安）を返す。
 *
 * 評価順序:
 * 1. quizQuestionCountBySlug に問数がある → 「全X問」
 * 2. DAILY_UPDATE_SLUGS に含まれる → 「毎日更新」
 * 3. それ以外 → resolveDisplayCategory の結果（「パズル」「診断」等）
 *
 * Server Component（QuizPlayPageLayout）で呼び出すため、registryのimportはOK。
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

/**
 * クイズのプレイページ共通レイアウトコンポーネント。
 *
 * 動的ルート（/play/[slug]/page.tsx）と専用ルート（/play/music-personality/page.tsx 等）
 * で共通して使用するレイアウトを提供する。
 * 将来的に他のクイズも専用ルートに移行する際に、最小限のコードで済むよう設計されている。
 */
export default async function QuizPlayPageLayout({
  quiz,
  slug,
  referrerTypeId,
}: QuizPlayPageLayoutProps) {
  const meta = playContentBySlug.get(slug);
  const jsonLd = meta ? generatePlayJsonLd(meta) : null;

  // 結果画面直下の回遊導線用データを事前計算。
  // Server Component で計算することで、registryとseoのimportが
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
        referrerTypeId={referrerTypeId}
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
