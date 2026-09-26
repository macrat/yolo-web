import BrowsableList from "@/components/BrowsableList";
import ListPage from "@/components/ListPage";
import { BASE_URL } from "@/lib/constants";
import { listPageHref } from "@/lib/list-pages";
import { safeJsonLdStringify } from "@/lib/seo";
import { humorDictMeta } from "@/humor-dict/meta";
import {
  HUMOR_LIST_BASE_PATH,
  HUMOR_LIST_PER_PAGE,
  HUMOR_LIST_SORTS,
  humorListItems,
} from "@/humor-dict/_lib/humor-list";

interface HumorListViewProps {
  /** パスが示すページ。 */
  page: number;
}

/**
 * ユーモア辞典の一覧のページ。見出しの下に、見出し語の一覧を置く（DESIGN.md §7）。分類を持たないので、一覧の
 * 上に索引を置かない。
 */
export default function HumorListView({ page }: HumorListViewProps) {
  const heading = humorDictMeta.title;
  const definedTermSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: humorDictMeta.title,
    description: humorDictMeta.description,
    url: `${BASE_URL}${HUMOR_LIST_BASE_PATH}`,
    inLanguage: "ja",
  };

  return (
    <ListPage
      trail={[
        { label: "ホーム", href: "/" },
        { label: "辞典", href: "/dictionary" },
        { label: heading, href: listPageHref(HUMOR_LIST_BASE_PATH, page) },
      ]}
      heading={heading}
      description="身近な言葉を、AIがまじめな顔で定義し直しました。本当の意味ではありません。"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(definedTermSetJsonLd),
        }}
      />
      <BrowsableList
        items={humorListItems()}
        hrefPrefix={`${HUMOR_LIST_BASE_PATH}/`}
        label="ユーモア辞典の見出し語の一覧"
        unit="語"
        searchLabel="語・読み・語義で探す"
        sorts={HUMOR_LIST_SORTS}
        perPage={HUMOR_LIST_PER_PAGE}
        basePath={HUMOR_LIST_BASE_PATH}
        page={page}
        pageTitle={heading}
      />
    </ListPage>
  );
}
