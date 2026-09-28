import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  quizBySlug,
  getAllQuizSlugs,
  getResultIdsForQuiz,
} from "@/play/quiz/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { countCharWidth } from "@/lib/countCharWidth";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingText,
} from "@/play/quiz/_components/ResultReading";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import {
  headingFontAttr,
  type HeadingFontAttr,
} from "@/lib/zen-antique-charset";
import { resultNameWithReading } from "@/play/quiz/resultName";
import { DEFAULT_READING_HEADINGS } from "@/play/quiz/readingHeadings";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
};

/**
 * 読みものの小見出しの区切りと書体の属性。診断が言い替えた文はデータなので、サーバーで文節に区切り、見出しの書体に
 * 無い字を含むかを調べる。言い替えないときは、決まった文の並びをそのまま使う。
 */
function readingHeading(
  label: string | undefined,
  fallback: readonly string[],
): { phrases: readonly string[]; headingFont?: HeadingFontAttr } {
  if (label === undefined) return { phrases: fallback };
  return {
    phrases: splitIntoPhrases(label),
    headingFont: headingFontAttr(label),
  };
}

/**
 * 全クイズの slug + resultId の組み合わせを返す。
 * 専用の具体ルートを持つクイズ（contrarian-fortune, animal-personality 等）は
 * Next.jsのファイルシステムルーティングにより自動的に専用ルートが優先されるため、
 * 除外リストは不要。
 */
export async function generateStaticParams() {
  const params: Array<{ slug: string; resultId: string }> = [];
  for (const slug of getAllQuizSlugs()) {
    for (const resultId of getResultIdsForQuiz(slug)) {
      params.push({ slug, resultId });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) return {};
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  // 題は「タイプ名 | 診断名の結果 | サイト名」。サイト名まで含めた全体が全角30字相当（幅 60）を超えるときは、
  // 検索の結果で切れないよう、診断名の部分を省く。
  const FULL_WIDTH_LIMIT = 60;
  const resultName = resultNameWithReading(result);
  const candidateTitle = `${resultName} | ${quiz.meta.title}の結果`;
  const title =
    countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
      ? resultName
      : candidateTitle;
  const description = result.description;

  // 詳しい読みものを持つタイプだけを検索に載せる
  const shouldIndex = Boolean(result.detailedContent);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/play/${slug}/result/${resultId}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/play/${slug}/result/${resultId}`,
    },
  };
}

/**
 * 診断・クイズの結果のページ。シェアのリンクや検索から来た来訪者と、解き終えた画面（ResultCard）の
 * 一覧から来た来訪者が開く。まだ遊んでいない来訪者が最初に着くページでもあるので、この診断を遊ぶ誘いを持つ。
 */
export default async function PlayQuizResultPage({ params }: Props) {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  // 末尾に「あなたは?」を追加してシェアした友人の興味を引く
  const shareText = `${quiz.meta.shortTitle ?? quiz.meta.title}の結果は「${resultNameWithReading(result)}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${slug}/result/${resultId}`;

  const ctaText =
    quiz.meta.type === "personality"
      ? "あなたはどのタイプ? 診断してみよう"
      : "あなたも挑戦してみよう";

  const { detailedContent } = result;

  const labels = quiz.meta.resultPageLabels;

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
      description={result.description}
      ctaText={ctaText}
    >
      {/* 詳しい読みものは、variant を持たない標準の形のときだけ組む。variant を持つ診断は専用のルートが描く。 */}
      {detailedContent && !detailedContent.variant && (
        <>
          <Reading>
            <ReadingHeading
              {...readingHeading(
                labels?.traitsHeading,
                DEFAULT_READING_HEADINGS.traits,
              )}
            />
            <ReadingList items={detailedContent.traits} />

            <ReadingHeading
              {...readingHeading(
                labels?.behaviorsHeading,
                DEFAULT_READING_HEADINGS.behaviors,
              )}
            />
            <ReadingList items={detailedContent.behaviors} />

            <ReadingHeading
              {...readingHeading(
                labels?.adviceHeading,
                DEFAULT_READING_HEADINGS.advice,
              )}
            />
            <ReadingText>{detailedContent.advice}</ReadingText>
          </Reading>

          <div className={styles.cta2Section}>
            <Link
              href={`/play/${slug}`}
              className={styles.cta2Link}
              data-text-box="inline"
            >
              {ctaText}
            </Link>
          </div>
        </>
      )}
    </ResultPageShell>
  );
}
