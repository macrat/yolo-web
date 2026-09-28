"use client";

/**
 * 解き終えた画面（`/play/[slug]`）に出す結果。
 *
 * `QuizContainer` が開始→設問→結果と進んだあとに描き、variant ごとの詳しい読みものへの振り分けもここで行う。
 * 上から、結果のボックス（タイプ名・キャッチコピー・説明）、結果を持ち帰る・共有する区画、詳しい読みもの
 * （セクション「このタイプについて」）、すべてのタイプ、「もう一度挑戦する」の順に置く（DESIGN.md §8）。各タイプの
 * 結果のページ（`/play/[slug]/result/[resultId]`。枠は ResultPageShell）は、ここから共有する URL であり、
 * すべてのタイプの行から移る先でもある。
 */
import type React from "react";
import { useId, useState, type Ref } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type {
  QuizResult,
  QuizType,
  DetailedContent,
  QuizMeta,
  QuizResultDetailedContent,
  CharacterFortuneDetailedContent,
} from "@/play/quiz/types";
import {
  getCompatibility,
  isValidAnimalTypeId,
} from "@/play/quiz/data/animal-personality";
import animalPersonalityQuiz from "@/play/quiz/data/animal-personality";
import CompatibilitySection from "./CompatibilitySection";
import InviteFriendButton from "./InviteFriendButton";
import PhrasedText from "@/components/PhrasedText";
import ShareButtons from "@/components/ShareButtons";
import FittedNumber from "@/components/FittedNumber";
import ResultBox, { type ResultHeading } from "@/components/ResultBox";
import FudaActions from "./FudaActions";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import OtherTypesNav from "./OtherTypesNav";
import {
  resultHeadingName,
  resultNameWithReading,
} from "@/play/quiz/resultName";
import { standardReadingHeadings } from "@/play/quiz/readingHeadings";
import {
  Reading,
  ReadingHeading,
  ReadingList,
  ReadingSection,
  ReadingText,
} from "./ResultReading";
import Button from "@/components/Button";
import styles from "./ResultCard.module.css";

// 詳しい読みものの部品とそれが読む診断のデータ（あわせて 120KB を超える）を、クイズのページの最初のバンドルから
// 分け、/play/[slug] の転送量の上限 140KB を保つ。
const AnimalPersonalityContent = dynamic(
  () => import("./AnimalPersonalityContent"),
  { ssr: true },
);

const MusicPersonalityContent = dynamic(
  () => import("./MusicPersonalityContent"),
  { ssr: true },
);

const TraditionalColorContent = dynamic(
  () => import("./TraditionalColorContent"),
  { ssr: true },
);

const YojiPersonalityContent = dynamic(
  () => import("./YojiPersonalityContent"),
  { ssr: true },
);

const CharacterPersonalityContent = dynamic(
  () => import("./CharacterPersonalityContent"),
  { ssr: true },
);

const UnexpectedCompatibilityContent = dynamic(
  () => import("./UnexpectedCompatibilityContent"),
  { ssr: true },
);

const ImpossibleAdviceContent = dynamic(
  () => import("./ImpossibleAdviceContent"),
  { ssr: true },
);

const ContrarianFortuneContent = dynamic(
  () => import("./ContrarianFortuneContent"),
  { ssr: true },
);

interface ResultCardProps {
  result: QuizResult;
  /** 結果の見出し（タイプ名）の文節の区切りと書体の属性。サーバーで作ったものを受け取る。 */
  heading: ResultHeading;
  /** 詳しい読みものの小見出しの文節の区切り。小見出しの文ごとに、サーバーで作ったものを受け取る。 */
  readingHeadings: Readonly<Record<string, readonly string[]>>;
  quizType: QuizType;
  /** 診断の題（ハッシュタグと、共有シートとはてなブックマークに渡す題に使う） */
  quizTitle: string;
  /** 補助情報「{診断の名前}の結果」と共有の文で言う診断の名前。短い名前（shortTitle）があればそれを渡す。 */
  quizName: string;
  quizSlug: string;
  /** 知識クイズの正解の数 */
  score?: number;
  /** 知識クイズの問題の数 */
  totalQuestions?: number;
  onRetry: () => void;
  /** 結果の詳しい読みもの（variant 別） */
  detailedContent?: DetailedContent;
  /** 詳しい読みものの小見出しの文言 */
  resultPageLabels?: QuizMeta["resultPageLabels"];
  /** 相性を見る友だちのタイプの id（共有のリンクの ref） */
  referrerTypeId?: string;
  /**
   * 診断の全タイプ。詳しい読みもののあとの、すべてのタイプの一覧に並べる。呼び出し側が持つ quiz.results を
   * 受け取り、ここで診断ごとのデータを読み込まない（バンドルを小さく保つ）。
   */
  allResults: QuizResult[];
  /**
   * 主タイプと同じ最高得点を分け合ったタイプ。word-sense-personality で同点が残ったときだけ渡される。
   * 1件以上あるとき、主タイプと同格に「同じくらい強く出た型」を結果の中で言う。
   */
  coTypes?: QuizResult[];
  /** 結果のボックスへの参照。結果に着いたとき、呼び出し側が画面を送り、フォーカスを移す。 */
  resultBoxRef?: Ref<HTMLElement>;
  /** 来訪者の操作（最後の設問に答えた）に応えて現れた結果か。true のときだけ結果のボックスが登場の動きを持つ。 */
  appear?: boolean;
}

/**
 * 同点の開示。診断が同点を残した来訪者（複数のタイプを等しく持つ人）に、配列の順で1つに割った結果だけを見せず、
 * 同じ強さのタイプをすべて同格に言う。主タイプを先に置くのは、ボックスの見出しがそのタイプだからで、上下を
 * 言うためではない。「主に X」のような上下を含む言い方はしない。ほかのタイプには、その結果のページへの
 * リンクを添える。
 */
function renderTiedTypesDisclosure(
  mainResult: QuizResult,
  coTypes: QuizResult[],
  quizSlug: string,
): React.ReactNode {
  const tiedTitles = [mainResult, ...coTypes]
    .map((type) => `【${resultNameWithReading(type)}】`)
    .join("と");

  return (
    <div className={styles.tied}>
      <p>
        あなたの言葉の感覚は、{tiedTitles}
        が同じくらい強く出ています。いずれも同じ強さの、あなたの声です。
      </p>
      <ul className={styles.tiedTypeLinks}>
        {coTypes.map((coType) => (
          <li key={coType.id}>
            <Link
              href={`/play/${quizSlug}/result/${coType.id}`}
              className={styles.tiedTypeLink}
              data-text-box="inline"
            >
              {resultNameWithReading(coType)}の解説を見る
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 小見出しの文の文節の区切り。受け取っていない文は、1つの文節として組む。 */
type PhrasesOf = (text: string) => readonly string[];

function renderStandardContent(
  content: QuizResultDetailedContent,
  phrasesOf: PhrasesOf,
  labels?: QuizMeta["resultPageLabels"],
): React.ReactNode {
  const headings = standardReadingHeadings(labels);

  return (
    <Reading>
      <ReadingHeading phrases={phrasesOf(headings.traits)} />
      <ReadingList items={content.traits} />
      <ReadingHeading phrases={phrasesOf(headings.behaviors)} />
      <ReadingList items={content.behaviors} />
      <ReadingHeading phrases={phrasesOf(headings.advice)} />
      <ReadingText>{content.advice}</ReadingText>
    </Reading>
  );
}

function buildAnimalPersonalityAfterTodayAction(
  resultId: string,
  referrerTypeId?: string,
): React.ReactNode {
  const quiz = animalPersonalityQuiz;

  // 相性セクション: referrerTypeIdが有効な場合は相性表示、なければ招待ボタン
  if (referrerTypeId && isValidAnimalTypeId(referrerTypeId)) {
    const myResult = quiz.results.find((r) => r.id === resultId);
    const friendResult = quiz.results.find((r) => r.id === referrerTypeId);
    const compatibility = getCompatibility(resultId, referrerTypeId);

    if (myResult && friendResult && compatibility) {
      return (
        <>
          <CompatibilitySection
            placement="solvedScreen"
            myType={{
              id: myResult.id,
              title: myResult.title,
            }}
            friendType={{
              id: friendResult.id,
              title: friendResult.title,
            }}
            compatibility={compatibility}
            quizTitle={quiz.meta.title}
            quizSlug={quiz.meta.slug}
          />
          <InviteFriendButton
            quizSlug={quiz.meta.slug}
            resultTypeId={resultId}
            inviteText="日本の固有種診断で相性を調べよう!"
            contentId={contentIdForQuiz(quiz.meta.slug)}
          />
        </>
      );
    }
  }

  return (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText="日本の固有種診断で相性を調べよう!"
      contentId={contentIdForQuiz(quiz.meta.slug)}
    />
  );
}

function renderCharacterFortuneContent(
  content: CharacterFortuneDetailedContent,
  phrasesOf: PhrasesOf,
): React.ReactNode {
  return (
    <Reading>
      <ReadingText>{content.characterIntro}</ReadingText>
      <ReadingHeading phrases={phrasesOf(content.behaviorsHeading)} />
      <ReadingList items={content.behaviors} />
      <ReadingHeading phrases={phrasesOf(content.characterMessageHeading)} />
      <ReadingText>{content.characterMessage}</ReadingText>
    </Reading>
  );
}

function renderDetailedContent(
  content: DetailedContent,
  resultId: string,
  phrasesOf: PhrasesOf,
  labels?: QuizMeta["resultPageLabels"],
  referrerTypeId?: string,
): React.ReactNode {
  // variant を持たない標準の形
  if (!content.variant) {
    return renderStandardContent(content, phrasesOf, labels);
  }
  switch (content.variant) {
    case "contrarian-fortune": {
      const Comp = ContrarianFortuneContent;
      return <Comp detailedContent={content} />;
    }
    case "character-fortune":
      // character-fortune は専用 *Content を持たず、常に
      // renderCharacterFortuneContent で描画する。
      return renderCharacterFortuneContent(content, phrasesOf);
    case "animal-personality": {
      const Comp = AnimalPersonalityContent;
      return (
        <Comp
          content={content}
          afterTodayAction={buildAnimalPersonalityAfterTodayAction(
            resultId,
            referrerTypeId,
          )}
        />
      );
    }
    case "music-personality": {
      const Comp = MusicPersonalityContent;
      return (
        <Comp
          content={content}
          resultId={resultId}
          referrerTypeId={referrerTypeId}
        />
      );
    }
    case "traditional-color": {
      const Comp = TraditionalColorContent;
      return <Comp content={content} />;
    }
    case "yoji-personality": {
      const Comp = YojiPersonalityContent;
      return <Comp content={content} />;
    }
    case "character-personality": {
      const Comp = CharacterPersonalityContent;
      return (
        <Comp
          content={content}
          resultId={resultId}
          referrerTypeId={referrerTypeId}
        />
      );
    }
    case "unexpected-compatibility": {
      const Comp = UnexpectedCompatibilityContent;
      return <Comp detailedContent={content} />;
    }
    case "impossible-advice": {
      const Comp = ImpossibleAdviceContent;
      return <Comp detailedContent={content} />;
    }
    default: {
      // exhaustive check: 新variant追加時にコンパイルエラーで検出
      void (content satisfies never);
      return null;
    }
  }
}

/** キャッチコピーを持つ variant。キャッチコピーはタイプ名のすぐ下、説明の前に置く。 */
const CATCHPHRASE_VARIANTS = [
  "animal-personality",
  "music-personality",
  "traditional-color",
  "yoji-personality",
  "character-personality",
  "unexpected-compatibility",
  "impossible-advice",
  "contrarian-fortune",
] as const;

type CatchphraseVariant = (typeof CATCHPHRASE_VARIANTS)[number];

function catchphraseOf(detailedContent?: DetailedContent): string | null {
  if (
    !detailedContent ||
    !CATCHPHRASE_VARIANTS.includes(
      detailedContent.variant as CatchphraseVariant,
    )
  ) {
    return null;
  }
  return (detailedContent as { catchphrase: string }).catchphrase;
}

export default function ResultCard({
  result,
  heading,
  readingHeadings,
  quizType,
  quizTitle,
  quizName,
  quizSlug,
  score,
  totalQuestions,
  onRetry,
  detailedContent,
  resultPageLabels,
  referrerTypeId,
  allResults,
  coTypes,
  resultBoxRef,
  appear = false,
}: ResultCardProps) {
  const shareHeadingId = useId();
  // ハッシュタグは、これまでの共有と同じ語で数えられるよう、題から作る。
  const shareText = `${quizName}の結果は「${resultNameWithReading(result)}」でした! #${quizTitle.replace(/\s/g, "")} #yolosnet`;
  // 札の画像のボタンの知らせ。区画の知らせの行を1つにするため、共有のボタンの知らせの行に出す。
  const [fudaNotice, setFudaNotice] = useState<string[]>([]);
  const catchphrase = catchphraseOf(detailedContent);
  // 見出しは名前だけにし、読みにくい名前の読みは見出しのすぐ下に添える（伝統色の「藍色」と「あいいろ」など）。
  const { reading } = resultHeadingName(result);
  // 伝統色診断は、結果の色が結果そのものなので、色見本で見せる（DESIGN.md §2）。
  const resultColor =
    detailedContent?.variant === "traditional-color" ? result.color : undefined;

  return (
    <div className={styles.card}>
      <ResultBox
        ref={resultBoxRef}
        tabIndex={resultBoxRef ? -1 : undefined}
        caption={`${quizName}の結果`}
        heading={reading === undefined ? heading : { ...heading, reading }}
        appear={appear}
      >
        <div className={styles.result}>
          {resultColor && (
            <div
              className={styles.swatch}
              style={{ backgroundColor: resultColor }}
            />
          )}
          {quizType === "knowledge" &&
            score !== undefined &&
            totalQuestions !== undefined && (
              <FittedNumber
                segments={[`${totalQuestions}問中`, `${score}問正解`]}
              />
            )}
          {catchphrase && <p>{catchphrase}</p>}
          <p className={styles.description}>{result.description}</p>
          {coTypes &&
            coTypes.length > 0 &&
            renderTiedTypesDisclosure(result, coTypes, quizSlug)}
        </div>
      </ResultBox>
      <section className={styles.share} aria-labelledby={shareHeadingId}>
        <PhrasedText
          as="h3"
          id={shareHeadingId}
          className={styles.shareHeading}
          phrases={["この", "結果を", "共有"]}
        />
        {detailedContent?.variant === "character-personality" && (
          <FudaActions
            resultId={result.id}
            resultTitle={result.title}
            quizName={quizName}
            quizSlug={quizSlug}
            onNoticeChange={setFudaNotice}
          />
        )}
        <ShareButtons
          url={`/play/${quizSlug}/result/${result.id}`}
          title={quizTitle}
          text={shareText}
          sns={["x", "line", "copy"]}
          contentType={quizType === "personality" ? "diagnosis" : "quiz"}
          contentId={contentIdForQuiz(quizSlug)}
          surface="text"
          notice={fudaNotice}
        />
      </section>
      {result.recommendation && result.recommendationLink && (
        <Link
          href={result.recommendationLink}
          className={`${styles.action} ${styles.recommendation}`}
          data-text-box="inline"
        >
          {result.recommendation}
        </Link>
      )}
      {detailedContent && (
        <>
          <ReadingSection>
            {renderDetailedContent(
              detailedContent,
              result.id,
              (text) => readingHeadings[text] ?? [text],
              resultPageLabels,
              referrerTypeId,
            )}
          </ReadingSection>
          <OtherTypesNav
            quizSlug={quizSlug}
            currentResultId={result.id}
            results={allResults}
            placement="solvedScreen"
            showSwatch={resultColor !== undefined}
          />
        </>
      )}
      <div className={styles.action}>
        <Button onClick={onRetry}>もう一度挑戦する</Button>
      </div>
    </div>
  );
}
