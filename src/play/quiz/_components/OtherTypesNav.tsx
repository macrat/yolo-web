import type React from "react";
import { useId } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import { getPlayResultPath } from "@/play/paths";
import type { QuizResult } from "@/play/quiz/types";
import { resultHeadingName } from "@/play/quiz/resultName";
import styles from "./OtherTypesNav.module.css";

type OtherTypesNavResult = Pick<
  QuizResult,
  "id" | "title" | "nameParts" | "reading" | "color"
>;

/**
 * 診断の結果を置く面。結果のページ（resultPage）と、解き終えた画面（solvedScreen。ResultCard の中）がある。
 * 面によって、いまのタイプの行の示し方が変わる。
 */
export type ResultPlacement = "resultPage" | "solvedScreen";

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
 * 面（解き終えた画面の ResultCard と、結果のページの ResultPageShell）が、読みもののセクションのあとに置く。
 * 1つのセクションで、見出しはどちらの面でもセクションの見出しの段（§4）。全件の一覧なので、見出しがタイプの数を
 * 言う（DESIGN.md §7）。タイプ名は長い句なので、段組みにせず1行1項目で組む。サーバーでも描けるよう、フックは
 * useId だけにする。
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
  const items: ItemListItem[] = results.map((result) => {
    // 解き終えた画面では、来訪者のタイプの行だけが太字である理由を字で添え、リンクの説明にもして読み上げでも伝える。
    const visitors = !onResultPage && result.id === currentResultId;
    const { name, reading } = resultHeadingName(result);
    return {
      name,
      href: getPlayResultPath(quizSlug, result.id),
      reading,
      facts: visitors ? [{ text: "あなたのタイプ" }] : undefined,
      factsId: visitors ? `${headingId}-visitor` : undefined,
      swatch: showSwatch ? result.color : undefined,
    };
  });
  const currentResultHref = getPlayResultPath(quizSlug, currentResultId);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <PhrasedText
        as="h2"
        id={headingId}
        className={styles.heading}
        phrases={["すべての", "タイプ", `（${results.length}）`]}
      />
      <ItemList
        labelledBy={headingId}
        items={items}
        currentHref={onResultPage ? currentResultHref : undefined}
        currentItemHref={onResultPage ? undefined : currentResultHref}
      />
    </section>
  );
}
