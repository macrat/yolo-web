import type React from "react";
import { useId } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import { getPlayResultPath } from "@/play/paths";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./OtherTypesNav.module.css";

type OtherTypesNavResult = Pick<
  QuizResult,
  "id" | "title" | "nameParts" | "reading" | "color"
>;

/**
 * 診断の結果を置く面。結果のページ（resultPage）と、解き終えた画面（solvedScreen。ResultCard の中）がある。
 * 結果のページではセクションの見出しが h1 の次の h2 に、解き終えた画面では結果の見出し h2 の下の h3 になる。
 */
export type ResultPlacement = "resultPage" | "solvedScreen";

/** 結果を置く面ごとの、セクションの見出しの要素。 */
export const SECTION_HEADING: Readonly<Record<ResultPlacement, "h2" | "h3">> = {
  resultPage: "h2",
  solvedScreen: "h3",
};

interface OtherTypesNavProps {
  quizSlug: string;
  currentResultId: string;
  /** 診断の全タイプ。この順に並べる。 */
  results: readonly OtherTypesNavResult[];
  /**
   * 置く面。結果のページでは、いまのタイプは開いているページなので現在地になる。解き終えた画面では、いまのタイプの行は
   * 開いているページでなく結果のページへ移るので、来訪者のタイプとして太字にし、下線を残して「あなたのタイプ」と添える。
   */
  placement: ResultPlacement;
  /** タイプの色がタイプそのもの（伝統色）であるときに、行の先頭に色見本を置く。 */
  showSwatch?: boolean;
}

/**
 * 診断の全タイプを並べ、いまのタイプを示す。結果を受け取った来訪者が、ほかに何があるかを眺める一覧。
 *
 * 全件の一覧なので、見出しがタイプの数を言う（DESIGN.md §7）。タイプ名は長い句なので、段組みにせず1行1項目で組む。
 * 解き終えた画面（ResultCard）と結果のページの両方から使うので、フックは useId だけにしてサーバーでも描ける形にする。
 */
export default function OtherTypesNav({
  quizSlug,
  currentResultId,
  results,
  placement,
  showSwatch = false,
}: OtherTypesNavProps): React.ReactNode {
  const headingId = useId();

  // 1タイプしか無い診断では、ほかに眺めるタイプが無い。
  if (results.length < 2) return null;

  const onResultPage = placement === "resultPage";
  const Heading = SECTION_HEADING[placement];
  const items: ItemListItem[] = results.map((result) => {
    // 解き終えた画面では、来訪者のタイプの行だけが太字である理由を字で添え、リンクの説明にもして読み上げでも伝える。
    const visitors = !onResultPage && result.id === currentResultId;
    return {
      name: result.nameParts?.name ?? result.title,
      href: getPlayResultPath(quizSlug, result.id),
      reading: result.nameParts?.reading ?? result.reading,
      facts: visitors ? [{ text: "あなたのタイプ" }] : undefined,
      factsId: visitors ? `${headingId}-visitor` : undefined,
      swatch: showSwatch ? result.color : undefined,
    };
  });
  const currentResultHref = getPlayResultPath(quizSlug, currentResultId);

  return (
    <section className={styles.section}>
      <Heading id={headingId} className={styles.heading}>
        すべてのタイプ（{results.length}）
      </Heading>
      <ItemList
        labelledBy={headingId}
        items={items}
        currentHref={onResultPage ? currentResultHref : undefined}
        currentItemHref={onResultPage ? undefined : currentResultHref}
      />
    </section>
  );
}
