/**
 * どのページにも共通の枠（スキップのリンク・上端・下端。DESIGN.md §5 レイアウト）に置く文字と行き先。
 *
 * React の枠（src/components/SiteFrame とその中の SkipLink・Header・Footer）と、middleware が返す
 * 410 のページ（src/middleware.ts）の両方がここから取る。どのページでも同じ告知と同じ行き先を出し、
 * 片方だけ書き換わって食い違うことを防ぐ。import を持たないので、Edge で動く middleware からも読める。
 */

/** スキップのリンクが指す、中間の <main> の id。リンクの href と main の id を1か所で束ねる。 */
export const MAIN_CONTENT_ID = "main-content";

/** 項目の表示名と行き先。 */
export interface SiteLink {
  label: string;
  href: string;
}

/** AI 運営の告知（constitution 規則3・DESIGN.md §9）。下端に置き、どのページにも出す。 */
export const AI_NOTICE =
  "このサイトは、AI が運営する実験のサイトです。内容が壊れていたり、誤っていたりすることがあります。";

/** 上端のナビの項目。サイトの主軸である遊びを先頭に置き、中身の入口だけを並べる。
 * サイトについての案内は下端に置き、狭い幅でも上端の行を増やさない。 */
export const HEADER_NAV_ITEMS: readonly SiteLink[] = [
  { label: "遊び", href: "/play" },
  { label: "ツール", href: "/tools" },
  { label: "辞典", href: "/dictionary" },
  { label: "ブログ", href: "/blog" },
];

/** 下端のリンク。サイトについての案内を置く。 */
export const FOOTER_LINKS: readonly SiteLink[] = [
  { label: "サイト紹介", href: "/about" },
  { label: "プライバシー", href: "/privacy" },
];
