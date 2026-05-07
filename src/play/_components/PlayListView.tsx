import { Suspense } from "react";
import Panel from "@/components/Panel";
import type { PlayContentMeta } from "@/play/types";
import PlayFilterableList from "./PlayFilterableList";
import { calculateNewSlugs } from "./newSlugsHelper";
import styles from "./PlayListView.module.css";

interface PlayListViewProps {
  contents: PlayContentMeta[];
}

/**
 * 遊び一覧ページのビュー (Server Component)。
 * ページヘッダーとフィルター付きコンテンツ一覧を表示する。
 * useSearchParams を使う PlayFilterableList は Suspense でラップする（Next.js 要件）。
 *
 * Date.now() は react-hooks/purity 制約により Client Component 内で使用できないため、
 * Server Component のここで計算して newSlugs として渡す。
 * newSlugs の計算ロジックは newSlugsHelper.ts に分離（テスト容易性のため）。
 */
export default function PlayListView({ contents }: PlayListViewProps) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const newSlugs = calculateNewSlugs(contents, now);

  return (
    <div className={styles.container}>
      <Panel as="section" className={styles.header}>
        <h1 className={styles.title}>遊ぶ</h1>
        <p className={styles.description}>
          {contents.length}種のコンテンツを4つのカテゴリから絞り込んで探せます。
        </p>
      </Panel>
      <Suspense>
        <PlayFilterableList contents={contents} newSlugs={newSlugs} />
      </Suspense>
    </div>
  );
}
