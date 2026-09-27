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
import { getCompatibility } from "@/play/quiz/data/music-personality";
import CompatibilityDisplay from "./CompatibilityDisplay";
import { extractWithParam } from "./extractWithParam";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import OtherTypesNav from "@/play/quiz/_components/OtherTypesNav";
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
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * 診断が resultPageLabels で言い替えないときの、詳しい読みものの小見出し。コードに書いた決まった文なので、
 * 書き手が文節で区切った並びで持つ（PhrasedText の約束）。
 */
export const DEFAULT_READING_HEADINGS = {
  traits: ["この", "タイプの", "特徴"],
  behaviors: ["この", "タイプの", "あるある"],
  advice: ["この", "タイプの", "人への", "アドバイス"],
} as const satisfies Record<string, readonly string[]>;

/**
 * 読みものの小見出しの区切りと書体の属性。診断が言い替えた文はデータなので、サーバーで文節に区切る。
 */
function readingHeading(
  label: string | undefined,
  fallback: readonly string[],
): { phrases: readonly string[]; headingFont: HeadingFontAttr } {
  const text = label ?? fallback.join("");
  return {
    phrases: label ? splitIntoPhrases(label) : fallback,
    headingFont: headingFontAttr(text),
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

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) return {};
  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) return {};

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const compatFriendTypeId = extractWithParam(
    resolvedSearchParams,
    slug,
    resultId,
  );

  let title: string;
  let description: string;

  if (compatFriendTypeId) {
    const friendResult = quiz.results.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatibility(resultId, compatFriendTypeId);
    title = `${resultNameWithReading(result)} x ${friendResult ? resultNameWithReading(friendResult) : ""} - ${compat?.label ?? "相性結果"}`;
    description = compat?.description ?? result.description;
  } else {
    // 題は「タイプ名 | 診断名の結果 | サイト名」。サイト名まで含めた全体が全角30字相当（幅 60）を超えるときは、
    // 検索の結果で切れないよう、診断名の部分を省く。
    const FULL_WIDTH_LIMIT = 60;
    const resultName = resultNameWithReading(result);
    const candidateTitle = `${resultName} | ${quiz.meta.title}の結果`;
    title =
      countCharWidth(`${candidateTitle} | ${SITE_NAME}`) > FULL_WIDTH_LIMIT
        ? resultName
        : candidateTitle;
    description = result.description;
  }

  // detailedContent があり、かつ相性ページでない場合のみ index: true にする
  const hasDetailedContent = Boolean(result.detailedContent);
  const shouldIndex = hasDetailedContent && !compatFriendTypeId;

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
export default async function PlayQuizResultPage({
  params,
  searchParams,
}: Props) {
  const { slug, resultId } = await params;
  const quiz = quizBySlug.get(slug);
  if (!quiz) notFound();

  const result = quiz.results.find((r) => r.id === resultId);
  if (!result) notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const compatFriendTypeId = extractWithParam(
    resolvedSearchParams,
    slug,
    resultId,
  );

  // Resolve compatibility data server-side for all quiz slugs.
  // This keeps CompatibilityDisplay as a simple display component with required props.
  let compatData:
    | {
        compatibility: { label: string; description: string };
        myType: { id: string; title: string; icon?: string };
        friendType: { id: string; title: string; icon?: string };
      }
    | undefined;

  if (compatFriendTypeId) {
    const myResult2 = quiz.results.find((r) => r.id === resultId);
    const friendResult2 = quiz.results.find((r) => r.id === compatFriendTypeId);
    const compat = getCompatibility(resultId, compatFriendTypeId);
    if (myResult2 && friendResult2 && compat) {
      compatData = {
        compatibility: {
          label: compat.label,
          description: compat.description,
        },
        myType: {
          id: myResult2.id,
          title: resultNameWithReading(myResult2),
          icon: myResult2.icon,
        },
        friendType: {
          id: friendResult2.id,
          title: resultNameWithReading(friendResult2),
          icon: friendResult2.icon,
        },
      };
    }
  }

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
      afterShare={
        compatData ? (
          <CompatibilityDisplay
            quizSlug={slug}
            quizTitle={quiz.meta.title}
            compatibility={compatData.compatibility}
            myType={compatData.myType}
            friendType={compatData.friendType}
          />
        ) : undefined
      }
    >
      {/* 詳しい読みものは、variant を持たない標準の形のときだけ組む。variant を持つ診断は専用のルートが描く。 */}
      {detailedContent && !detailedContent.variant && (
        <>
          <Reading>
            <ReadingHeading
              placement="resultPage"
              {...readingHeading(
                labels?.traitsHeading,
                DEFAULT_READING_HEADINGS.traits,
              )}
            />
            <ReadingList items={detailedContent.traits} />

            <ReadingHeading
              placement="resultPage"
              {...readingHeading(
                labels?.behaviorsHeading,
                DEFAULT_READING_HEADINGS.behaviors,
              )}
            />
            <ReadingList items={detailedContent.behaviors} />

            <ReadingHeading
              placement="resultPage"
              {...readingHeading(
                labels?.adviceHeading,
                DEFAULT_READING_HEADINGS.advice,
              )}
            />
            <ReadingText>{detailedContent.advice}</ReadingText>
          </Reading>

          {/* 検索や共有のリンクから来た来訪者にも、ほかのタイプを見せる。 */}
          <OtherTypesNav
            quizSlug={slug}
            currentResultId={result.id}
            results={quiz.results}
            placement="resultPage"
          />

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
