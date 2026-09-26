import type { BreadcrumbItem } from "@/components/Breadcrumb";
import BrowsableList from "@/components/BrowsableList";
import IndexAccordion from "@/components/IndexAccordion";
import ListPage from "@/components/ListPage";
import {
  YOJI_INDEX_SUMMARY,
  YOJI_LIST_PER_PAGE,
  YOJI_LIST_SORTS,
  yojiIndexEntries,
  yojiListBasePath,
  yojiListHeading,
  yojiListItems,
  yojiListTitle,
  type YojiListScope,
} from "@/dictionary/_lib/yoji-list";

interface YojiListViewProps {
  scope: YojiListScope;
  /** パスが示すページ。 */
  page: number;
}

/**
 * 四字熟語辞典の一覧のページ（トップ・カテゴリ）。見出しの下に、カテゴリの索引を閉じたアコーディオンで置き、
 * その下に範囲の四字熟語の一覧を置く（DESIGN.md §7）。
 *
 * カテゴリは行の種別として出るが、一覧の上にカテゴリの索引を置くので、種別の組は置かない。カテゴリで見たい
 * 来訪者は、索引からカテゴリのページへ移る。
 */
export default function YojiListView({ scope, page }: YojiListViewProps) {
  const heading = yojiListHeading(scope);
  const basePath = yojiListBasePath(scope);
  const trail: BreadcrumbItem[] = [
    { label: "ホーム", href: "/" },
    { label: "辞典", href: "/dictionary" },
    ...(scope.type === "all"
      ? [{ label: heading }]
      : [
          { label: "四字熟語辞典", href: "/dictionary/yoji" },
          { label: heading },
        ]),
  ];

  return (
    <ListPage
      trail={trail}
      heading={heading}
      description={
        scope.type === "all"
          ? "読み方・意味・由来と例文を引けます。"
          : undefined
      }
    >
      <IndexAccordion
        summary={YOJI_INDEX_SUMMARY}
        index={yojiIndexEntries()}
        currentHref={basePath}
      />
      <BrowsableList
        items={yojiListItems(scope)}
        hrefPrefix="/dictionary/yoji/"
        label="四字熟語の一覧"
        unit="語"
        searchLabel="語・読み・意味・例文で探す"
        sorts={YOJI_LIST_SORTS}
        perPage={YOJI_LIST_PER_PAGE}
        basePath={basePath}
        page={page}
        pageTitle={yojiListTitle(scope)}
      />
    </ListPage>
  );
}
