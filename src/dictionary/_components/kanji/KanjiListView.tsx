import Breadcrumb from "@/components/Breadcrumb";
import BrowsableList from "@/components/BrowsableList";
import IndexAccordion from "@/components/IndexAccordion";
import Section from "@/components/Section";
import type { BreadcrumbItem } from "@/lib/seo";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import {
  KANJI_LIST_PER_PAGE,
  kanjiIndexEntries,
  kanjiListBasePath,
  kanjiListHeading,
  kanjiListItems,
  kanjiListSorts,
  kanjiListTitle,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import styles from "./KanjiListView.module.css";

interface KanjiListViewProps {
  scope: KanjiListScope;
  /** パスが示すページ。 */
  page: number;
}

/**
 * 漢字辞典の一覧のページ（トップ・学年・部首・画数）。見出しの下に、学年・画数・部首の索引を閉じたアコーディオンで
 * 置き、その下に範囲の漢字の一覧を置く（DESIGN.md §7）。
 *
 * 学年は行の種別として出るが、一覧の上に学年の索引を置くので、種別の組は置かない。部首と画数のページでも、
 * 学年の索引はその中を絞らず学年のページへ移す。その部首・画数の中を学年で見たい来訪者は、学年順に並べ替える。
 *
 * 漢字の一覧の見出しは読み上げにだけ出す。見出しで移る来訪者が、一覧を索引の「部首」の中身と取り違えずに
 * 一覧へ移れるようにするためで、目で見る来訪者には主見出しがそのまま一覧の見出しになる。
 */
export default function KanjiListView({ scope, page }: KanjiListViewProps) {
  const heading = kanjiListHeading(scope);
  const basePath = kanjiListBasePath(scope);
  const index = kanjiIndexEntries();
  const trail: BreadcrumbItem[] = [
    { label: "ホーム", href: "/" },
    { label: "辞典", href: "/dictionary" },
    ...(scope.type === "all"
      ? [{ label: heading }]
      : [{ label: "漢字辞典", href: "/dictionary/kanji" }, { label: heading }]),
  ];

  return (
    <Section>
      <div className={styles.view}>
        <Breadcrumb items={trail} />
        <div>
          <h1 className={styles.title} {...headingFontAttr(heading)}>
            {heading}
          </h1>
          {scope.type === "all" ? (
            <p className={styles.description}>
              常用漢字の読み方・意味・部首・画数・使用例を、1字ずつまとめています。
            </p>
          ) : null}
        </div>
        <IndexAccordion
          summary="学年・画数・部首から探す"
          indexes={[
            { name: "学年", items: index.grades },
            { name: "画数", items: index.strokes },
          ]}
          groupedIndex={{
            name: "部首",
            groups: index.radicals,
            singleCharacters: true,
          }}
          currentHref={basePath}
        />
        <h2 className="visually-hidden">漢字の一覧</h2>
        <BrowsableList
          items={kanjiListItems(scope)}
          hrefPrefix="/dictionary/kanji/"
          label="漢字の一覧"
          unit="字"
          searchLabel="字・読み・熟語で探す"
          sorts={kanjiListSorts(scope)}
          perPage={KANJI_LIST_PER_PAGE}
          basePath={basePath}
          page={page}
          pageTitle={kanjiListTitle(scope)}
        />
      </div>
    </Section>
  );
}
