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
import DescriptionExpander from "./DescriptionExpander";
import ResultPageShell from "@/play/quiz/_components/ResultPageShell";
import OtherTypesNav from "@/play/quiz/_components/OtherTypesNav";
import PhrasedText from "@/components/PhrasedText";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { resultNameWithReading } from "@/play/quiz/resultName";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string; resultId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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
    // 新しいtitle形式: 「結果タイトル | クイズ名の結果 | SITE_NAME」
    // 完全なtitle（candidateTitle + " | " + SITE_NAME）が全角30文字相当（width 60）を
    // 超える場合はクイズ名部分を省略してフォールバック。
    // SITE_NAMEサフィックス（" | yolos.net" = 半角12文字）を含めた幅で判定する。
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
 * 一覧から来た来訪者が開く。まだ遊んでいない来訪者が最初に着くページでもあるので、
 * 「自分も遊んでみる」への誘い（CTA）を持つ。
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
  const shareText = `${quiz.meta.title}の結果は「${resultNameWithReading(result)}」でした！あなたは? #${quiz.meta.title.replace(/\s/g, "")} #yolosnet`;
  const shareUrl = `${BASE_URL}/play/${slug}/result/${resultId}`;

  // CTAテキストをクイズタイプに応じて出し分ける
  const ctaText =
    quiz.meta.type === "personality"
      ? "あなたはどのタイプ? 診断してみよう"
      : "あなたも挑戦してみよう";

  const { detailedContent } = result;

  // descriptionが4行を超えるかどうかの判定:
  // countCharWidth は全角1文字を width 2 としてカウントするため、
  // 1行あたり全角16文字 = width 32。4行分 = width 32 × 4 = 128。
  const DESCRIPTION_LONG_THRESHOLD = 128;
  const isDescriptionLong =
    countCharWidth(result.description) > DESCRIPTION_LONG_THRESHOLD;

  // resultPageLabels から見出しを取得（未設定時はデフォルト値）
  const traitsHeading =
    quiz.meta.resultPageLabels?.traitsHeading ?? "このタイプの特徴";
  const behaviorsHeading =
    quiz.meta.resultPageLabels?.behaviorsHeading ?? "このタイプのあるある";
  const adviceHeading =
    quiz.meta.resultPageLabels?.adviceHeading ?? "このタイプの人へのアドバイス";

  return (
    <ResultPageShell
      quiz={quiz}
      result={result}
      shareText={shareText}
      shareUrl={shareUrl}
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
      <DescriptionExpander
        description={result.description}
        isLong={isDescriptionLong}
      />

      <div className={styles.trySection}>
        <Link href={`/play/${slug}`} className={styles.tryButton} data-inverted>
          {ctaText}
        </Link>
        <p className={styles.tryCost}>
          全{quiz.meta.questionCount}問 / 登録不要
        </p>
      </div>

      {/* 詳しい読みものは、variant を持たない標準の形のときだけ組む。variant を持つ診断は専用のルートが描く。 */}
      {detailedContent && !detailedContent.variant && (
        <div className={styles.detailedSection}>
          <PhrasedText
            as="h2"
            phrases={splitIntoPhrases(traitsHeading)}
            className={styles.subheading}
            {...headingFontAttr(traitsHeading)}
          />
          <ul className={styles.list}>
            {detailedContent.traits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
          </ul>

          <PhrasedText
            as="h2"
            phrases={splitIntoPhrases(behaviorsHeading)}
            className={styles.subheading}
            {...headingFontAttr(behaviorsHeading)}
          />
          <ul className={styles.list}>
            {detailedContent.behaviors.map((behavior, i) => (
              <li key={i}>{behavior}</li>
            ))}
          </ul>

          <PhrasedText
            as="h2"
            phrases={splitIntoPhrases(adviceHeading)}
            className={styles.subheading}
            {...headingFontAttr(adviceHeading)}
          />
          <p className={styles.paragraph}>{detailedContent.advice}</p>

          {/* 解き終えた画面（ResultCard）と同じく、検索やシェアから来た人にもほかのタイプを見せる。 */}
          <OtherTypesNav
            quizSlug={slug}
            currentResultId={result.id}
            results={quiz.results}
            placement="resultPage"
          />

          {/* 読み終えた人への、2つ目の診断への誘い */}
          <div className={styles.cta2Section}>
            <Link
              href={`/play/${slug}`}
              className={styles.cta2Link}
              data-text-box="inline"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      )}
    </ResultPageShell>
  );
}
