import type { BreadcrumbItem } from "@/components/Breadcrumb";
import BrowsableList from "@/components/BrowsableList";
import IndexAccordion from "@/components/IndexAccordion";
import ListPage from "@/components/ListPage";
import {
  BLOG_INDEX_SUMMARY,
  BLOG_LIST_PER_PAGE,
  BLOG_SORTS,
  blogIndexEntries,
  blogListBasePath,
  blogListDescription,
  blogListHeading,
  blogListHeadingPhrases,
  blogListItems,
  blogListTitle,
  type BlogListScope,
} from "@/blog/_lib/blog-list";

interface BlogListViewProps {
  scope: BlogListScope;
  /** パスが示すページ。 */
  page: number;
}

/**
 * ブログの一覧のページ（`/blog`・分類・タグ）。見出しと説明の下に、分類とタグの索引を閉じたアコーディオンで置き、
 * その下に範囲の記事の一覧を置く（DESIGN.md §7）。分類とタグのページは、パンくずでブログへ戻れる。
 *
 * 分類は行の種別として出るが、一覧の上に分類の索引を置くので、種別の組は置かない。分類で見たい来訪者は
 * 索引から分類のページへ移る。
 *
 * 記事の一覧の見出しは読み上げにだけ出す。見出しで移る来訪者が、一覧を索引の「タグ」の中身と取り違えずに
 * 一覧へ移れるようにするためで、目で見る来訪者には主見出しがそのまま一覧の見出しになる。
 */
export default function BlogListView({ scope, page }: BlogListViewProps) {
  const heading = blogListHeading(scope);
  const basePath = blogListBasePath(scope);
  const index = blogIndexEntries();
  const trail: BreadcrumbItem[] | undefined =
    scope.type === "all"
      ? undefined
      : [
          { label: "ホーム", href: "/" },
          { label: "ブログ", href: "/blog" },
          { label: heading },
        ];

  return (
    <ListPage
      trail={trail}
      heading={heading}
      headingPhrases={blogListHeadingPhrases(scope)}
      description={blogListDescription(scope)}
    >
      <IndexAccordion
        summary={BLOG_INDEX_SUMMARY}
        indexes={[
          { name: "分類", items: index.categories },
          { name: "タグ", items: index.tags },
        ]}
        currentHref={basePath}
      />
      <h2 className="visually-hidden">記事の一覧</h2>
      <BrowsableList
        items={blogListItems(scope)}
        hrefPrefix="/blog/"
        label="記事の一覧"
        unit="件"
        searchLabel="題名・説明・分類・タグ・連載名で探す"
        sorts={BLOG_SORTS}
        perPage={BLOG_LIST_PER_PAGE}
        basePath={basePath}
        page={page}
        pageTitle={blogListTitle(scope)}
      />
    </ListPage>
  );
}
