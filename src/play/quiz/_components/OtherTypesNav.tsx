import type React from "react";
import { useId } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import { getPlayResultPath } from "@/play/paths";
import type { QuizResult } from "@/play/quiz/types";
import styles from "./OtherTypesNav.module.css";

type OtherTypesNavResult = Pick<QuizResult, "id" | "title" | "color">;

interface OtherTypesNavProps {
  quizSlug: string;
  currentResultId: string;
  /** 診断の全タイプ。この順に並べる。 */
  results: readonly OtherTypesNavResult[];
  /** 見出しの階層。結果のページでは h2、解き終えた画面の結果（h2）の中では h3。 */
  headingLevel?: 2 | 3;
  /** タイプの色がタイプそのもの（伝統色）であるときに、行の先頭に色見本を置く。 */
  showSwatch?: boolean;
}

/**
 * 診断の全タイプを並べ、いまのタイプを現在地にする。結果を受け取った来訪者が、ほかに何があるかを眺める一覧。
 *
 * 全件の一覧なので、見出しがタイプの数を言う（DESIGN.md §7）。タイプ名は長い句なので、段組みにせず1行1項目で組む。
 * 解き終えた画面（ResultCard）と結果のページの両方から使うので、フックは useId だけにしてサーバーでも描ける形にする。
 */
export default function OtherTypesNav({
  quizSlug,
  currentResultId,
  results,
  headingLevel = 3,
  showSwatch = false,
}: OtherTypesNavProps): React.ReactNode {
  const headingId = useId();

  // 1タイプしか無い診断では、ほかに眺めるタイプが無い。
  if (results.length < 2) return null;

  const Heading = headingLevel === 2 ? "h2" : "h3";
  const items: ItemListItem[] = results.map((result) => ({
    name: result.title,
    href: getPlayResultPath(quizSlug, result.id),
    swatch: showSwatch ? result.color : undefined,
  }));

  return (
    <section className={styles.section}>
      <Heading id={headingId} className={styles.heading}>
        他のタイプ（{results.length}）
      </Heading>
      <ItemList
        labelledBy={headingId}
        items={items}
        currentHref={getPlayResultPath(quizSlug, currentResultId)}
      />
    </section>
  );
}
