import type { BreadcrumbItem } from "@/components/Breadcrumb";
import BrowsableList from "@/components/BrowsableList";
import IndexAccordion from "@/components/IndexAccordion";
import ListPage from "@/components/ListPage";
import {
  COLOR_LIST_PER_PAGE,
  colorIndexEntries,
  colorListBasePath,
  colorListHeading,
  colorListItems,
  colorListSorts,
  colorListTitle,
  type ColorListScope,
} from "@/dictionary/_lib/color-list";

interface ColorListViewProps {
  scope: ColorListScope;
  /** パスが示すページ。 */
  page: number;
}

/**
 * 伝統色辞典の一覧のページ（トップ・色み）。見出しの下に、色みの索引を閉じたアコーディオンで置き、その下に
 * 範囲の伝統色の一覧を置く（DESIGN.md §7）。
 *
 * 色みは行の種別として出るが、一覧の上に色みの索引を置くので、種別の組は置かない。色みで見たい来訪者は、
 * 索引から色みのページへ移る。
 */
export default function ColorListView({ scope, page }: ColorListViewProps) {
  const heading = colorListHeading(scope);
  const basePath = colorListBasePath(scope);
  const trail: BreadcrumbItem[] = [
    { label: "ホーム", href: "/" },
    { label: "辞典", href: "/dictionary" },
    ...(scope.type === "all"
      ? [{ label: "伝統色辞典" }]
      : [
          { label: "伝統色辞典", href: "/dictionary/colors" },
          { label: heading },
        ]),
  ];

  return (
    <ListPage
      trail={trail}
      heading={heading}
      description={
        scope.type === "all"
          ? "色名のローマ字とカラーコードを引けます。"
          : undefined
      }
    >
      <IndexAccordion
        summary="色みから探す"
        index={colorIndexEntries()}
        currentHref={basePath}
      />
      <BrowsableList
        items={colorListItems(scope)}
        hrefPrefix="/dictionary/colors/"
        label="伝統色の一覧"
        unit="色"
        searchLabel="色名・ローマ字・カラーコードで探す"
        sorts={colorListSorts(scope)}
        perPage={COLOR_LIST_PER_PAGE}
        basePath={basePath}
        page={page}
        pageTitle={colorListTitle(scope)}
      />
    </ListPage>
  );
}
