import type React from "react";
import { useId } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import { getPlayResultPath } from "@/play/paths";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./OtherTypesNav.module.css";

type OtherTypesNavResult = Pick<
  QuizResult,
  "id" | "title" | "nameParts" | "color"
>;

interface OtherTypesNavProps {
  quizSlug: string;
  currentResultId: string;
  /** 診断の全タイプ。この順に並べる。 */
  results: readonly OtherTypesNavResult[];
  /**
   * 置く面。結果のページ（resultPage）では、見出しは h2 で、いまのタイプは開いているページなので現在地になる。
   * 解き終えた画面（solvedScreen）では、見出しは結果（h2）の中の h3 で、いまのタイプの行は開いているページでなく
   * 結果のページへ移るので、来訪者のタイプとして太字にし、下線は残す。
   */
  placement: "resultPage" | "solvedScreen";
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

  const Heading = placement === "resultPage" ? "h2" : "h3";
  const items: ItemListItem[] = results.map((result) => ({
    name: result.nameParts?.name ?? result.title,
    href: getPlayResultPath(quizSlug, result.id),
    reading: result.nameParts?.reading,
    swatch: showSwatch ? result.color : undefined,
  }));
  const currentResultHref = getPlayResultPath(quizSlug, currentResultId);

  return (
    <section className={styles.section}>
      <Heading id={headingId} className={styles.heading}>
        他のタイプ（{results.length}）
      </Heading>
      <ItemList
        labelledBy={headingId}
        items={items}
        currentHref={placement === "resultPage" ? currentResultHref : undefined}
        currentItemHref={
          placement === "solvedScreen" ? currentResultHref : undefined
        }
      />
    </section>
  );
}
