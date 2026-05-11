# Phase 4.4 入力資料: (legacy)/page.tsx 構造調査

調査日: 2026-05-10  
対象: `src/app/(legacy)/page.tsx` および周辺ファイル

---

## 1. `src/app/(legacy)/page.tsx` の全体構造

**ファイルパス**: `/mnt/data/yolo-web/src/app/(legacy)/page.tsx`

### imports

| 種別             | 名前                                                                                                                                          | ソース                          | 行   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---- |
| 型               | `Metadata`                                                                                                                                    | `next`                          | 1    |
| コンポーネント   | `Link`                                                                                                                                        | `next/link`                     | 2    |
| 関数             | `formatDate`                                                                                                                                  | `@/lib/date`                    | 3    |
| データ関数       | `getAllBlogPosts`                                                                                                                             | `@/blog/_lib/blog`              | 4    |
| データ関数・定数 | `allPlayContents`, `DAILY_UPDATE_SLUGS`, `getHeroPickupContents`, `getDefaultTabContents`, `getNonFortuneContents`, `quizQuestionCountBySlug` | `@/play/registry`               | 5-12 |
| 関数             | `getContentPath`                                                                                                                              | `@/play/paths`                  | 13   |
| 定数             | `SITE_NAME`, `BASE_URL`                                                                                                                       | `@/lib/constants`               | 14   |
| コンポーネント   | `FortunePreview`                                                                                                                              | `./_components/FortunePreview`  | 15   |
| コンポーネント   | `PlayContentTabs`                                                                                                                             | `./_components/PlayContentTabs` | 16   |
| CSSモジュール    | `styles`                                                                                                                                      | `./page.module.css`             | 17   |

### metadata（静的エクスポート、L19-40）

```
title: SITE_NAME  ("yolos.net")
description: "占い・性格診断・クイズ・パズルゲームなど多彩なインタラクティブコンテンツが揃う占い・診断パーク。AIが毎日更新する運勢・診断を無料でお楽しみいただけます。"
openGraph.type: "website"
openGraph.url: BASE_URL
twitter.card: "summary_large_image"
alternates.canonical: BASE_URL
```

**注意**: description/OGは「占い・診断パーク」コンセプトを前面に出した文言。`sharedMetadata`（後述）とは別に page レベルで上書きしている。

### JSX 構造（セクション単位）

```
<div className={styles.main}>

  Section 1: Hero (styles.hero)
    - 装飾絵文字 ×4 (.heroDeco1〜4)
    - <h1>yolos.net</h1>
    - <p> サブタイトル: "笑える占い・診断で、あなたの意外な一面を発見しよう"
    - <p> AI透明性テキスト: "AIが企画・運営する実験的なサイトです"
    - <Link href="/play"> メインCTA: "占い・診断を試す"
    - <ul aria-label="ピックアップコンテンツ"> getHeroPickupContents()の結果を3件表示
    - <div .badges> allPlayContents.length 件数バッジ、毎日更新バッジ、完全無料バッジ

  Section 2: おすすめ (styles.featuredSection)
    - data-testid="home-recommended-section"
    - aria-labelledby="home-recommended-heading"
    - <h2 id="home-recommended-heading">おすすめ</h2>
    - <p> "カテゴリ別にコンテンツを探せます"
    - <PlayContentTabs allContents=getNonFortuneContents() defaultContents=getDefaultTabContents() questionCountBySlug=quizQuestionCountBySlug dailyUpdateSlugs=DAILY_UPDATE_SLUGS />
    - <Link href="/play"> "全コンテンツを見る"

  Section 3: 今日のユーモア運勢プレビュー
    - <FortunePreview />
    (aria-labelledby="home-fortune-heading" はコンポーネント内部)

  Section 4: 最新ブログ (styles.section)
    - aria-labelledby="home-blog-heading"
    - <h2 id="home-blog-heading">開発の舞台裏</h2>
    - <p> "AIエージェントの開発記録や実験の裏側をお届けします"
    - getAllBlogPosts().slice(0,3) を blogCard で表示
    - <Link href="/blog"> "もっと読む"

</div>
```

---

## 2. 依存コンポーネントの所在と性質

### `(legacy)/page.tsx` 直接 import のコンポーネント

| コンポーネント    | 実ファイルパス                                     | 性質                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FortunePreview`  | `src/app/(legacy)/_components/FortunePreview.tsx`  | **(legacy)専用** Client Component。`useSyncExternalStore` + `@/play/fortune/fortuneStore` + `@/play/fortune/_components/StarRating` を使用。独自 CSS モジュール `FortunePreview.module.css` を持つ。                                                                                                                                                                                                                          |
| `PlayContentTabs` | `src/app/(legacy)/_components/PlayContentTabs.tsx` | **(legacy)専用** Client Component。`useState` でタブ切り替えと「もっと見る」を管理。カードスタイルは **親の `../page.module.css`** から `cardStyles` として import している（`featuredCard`, `dailyBadge`, `featuredCardIconWrapper`, `featuredCardIcon`, `featuredCardTitleRow`, `featuredCardTitle`, `featuredCardDescription`, `featuredCardMeta`, `featuredCardQuestionCount`, `featuredCardCta` の各クラスを直接参照）。 |

### `PlayContentTabs` が参照するライブラリ側

| 名前                   | パス                 |
| ---------------------- | -------------------- |
| `PlayContentMeta` 型   | `@/play/types`       |
| `getContentPath`       | `@/play/paths`       |
| `getContrastTextColor` | `@/play/color-utils` |

### `FortunePreview` が参照するライブラリ側

| 名前                                                                      | パス                                    |
| ------------------------------------------------------------------------- | --------------------------------------- |
| `subscribeFortuneStore`, `getFortuneSnapshot`, `getFortuneServerSnapshot` | `@/play/fortune/fortuneStore`           |
| `StarRating`                                                              | `@/play/fortune/_components/StarRating` |

**ヘッダー・フッター**: `(legacy)/layout.tsx` が `@/components/common/Header` / `@/components/common/Footer` を使用（新デザイン `(new)/layout.tsx` は `@/components/Header` / `@/components/Footer` を使用、別系統）。

---

## 3. `src/app/(legacy)/page.module.css` の内容概要

**ファイルパス**: `/mnt/data/yolo-web/src/app/(legacy)/page.module.css`（543行）

| セクション           | 主要クラス                                                                                                                                                                                                                        | 概要                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ラッパー             | `.main`                                                                                                                                                                                                                           | max-width: var(--max-width); margin: 0 auto; padding: 0 1rem 2rem                                          |
| ヒーロー             | `.hero`                                                                                                                                                                                                                           | グラデーション背景 (紫→青→シアン `#6c3bea → #4466dd → #0a7080`)、border-radius 0.75rem、position: relative |
| 装飾絵文字           | `.heroDeco1〜4`                                                                                                                                                                                                                   | position: absolute; opacity: 0.25; 4隅に配置                                                               |
| ヒーロー文字         | `.heroTitle`, `.heroSubtitle`, `.heroAiNotice`                                                                                                                                                                                    | 白系文字色、各 z-index: 1                                                                                  |
| CTAボタン            | `.heroCta`                                                                                                                                                                                                                        | 白背景・紫文字のピル型ボタン、hover で transform/box-shadow                                                |
| ピックアップリスト   | `.heroFeaturedList`, `.heroFeaturedItem`, `.heroFeaturedIcon`, `.heroFeaturedTitle`                                                                                                                                               | CTAボタン直下、白半透明のピル型リンク群                                                                    |
| バッジ群             | `.badges`, `.badgeStatic`, `.badgeIcon`                                                                                                                                                                                           | 黒半透明のピル型静的バッジ                                                                                 |
| おすすめセクション   | `.featuredSection`                                                                                                                                                                                                                | padding: 2.5rem 0 1.5rem; border-top                                                                       |
| **カードスタイル**   | `.featuredCard`, `.featuredCardIconWrapper`, `.featuredCardIcon`, `.featuredCardTitleRow`, `.featuredCardTitle`, `.dailyBadge`, `.featuredCardDescription`, `.featuredCardMeta`, `.featuredCardQuestionCount`, `.featuredCardCta` | PlayContentTabs.tsx が直接参照。`--play-accent` CSS変数でアクセントカラーを受け取る設計。                  |
| 汎用セクション       | `.section`, `.sectionTitle`, `.sectionDescription`                                                                                                                                                                                | ブログセクション等に使用                                                                                   |
| ブログカード         | `.blogList`, `.blogCard`, `.blogDate`, `.blogTitle`, `.blogExcerpt`                                                                                                                                                               | 縦並びカード                                                                                               |
| 「もっと見る」リンク | `.seeAll`, `.seeAllLink`                                                                                                                                                                                                          | ピル型アウトラインリンク                                                                                   |
| フォーカスリング     | `.featuredCard:focus-visible` 他                                                                                                                                                                                                  | WCAG対応                                                                                                   |
| ダークモード         | `:global(:root.dark) .hero` 他                                                                                                                                                                                                    | ヒーローを暗めのグラデーションに変更                                                                       |
| レスポンシブ         | `@media (max-width: 640px)`, `@media (max-width: 320px)`                                                                                                                                                                          | ヒーロー縮小、featuredCardDescription を非表示、アイコン縮小                                               |

**重要な依存関係**: `PlayContentTabs.tsx` がこのファイルを `import cardStyles from "../page.module.css"` で参照しており、カードクラスが密結合している。新デザインへの移行時は `PlayContentTabs` のカードスタイル参照先も合わせて変更が必要。

---

## 4. OGP 画像 / twitter-image の所在

### トップページ向け

| ファイル              | パス                                   | 概要                                                                                                                                                 |
| --------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `opengraph-image.tsx` | `src/app/(legacy)/opengraph-image.tsx` | `createOgpImageResponse({ title: "yolos.net", subtitle: "AIエージェントによる実験的Webサイト" })` を返す。`@/lib/ogp-image` の共通ファクトリを使用。 |
| `twitter-image.tsx`   | `src/app/(legacy)/twitter-image.tsx`   | `export { default, alt, size, contentType } from "./opengraph-image"` — opengraph-image の re-export のみ。                                          |

`@/lib/ogp-image` (`src/lib/ogp-image.tsx`) が OGP 画像の共通生成ロジックを持つ共有ライブラリ。

---

## 5. トップページ向けテストの存在

**ファイルパス**: `src/app/(legacy)/__tests__/page.test.tsx`（488行）

- `import Home, { metadata } from "../page"` で `(legacy)/page.tsx` をテスト対象にしている
- テスト対象 URL "/"の明示的指定はないが、`(legacy)/page.tsx` そのものをレンダリング検証している
- テスト項目（主要なもの）:
  - h1 "yolos.net" の存在
  - メインCTA `/play` リンク
  - AI透明性テキスト
  - バッジ群（件数・毎日更新・完全無料）
  - 削除済みセクションの不存在確認（`home-diagnosis-section`, `home-daily-puzzle-section`）
  - 「おすすめ」セクション（`home-recommended-section`, tablist, `全コンテンツを見る` リンク）
  - `FortunePreview` セクション（`今日のユーモア運勢` 見出し、`今日の運勢を見る` リンク）
  - ブログセクション（`開発の舞台裏` 見出し、`もっと読む` リンク）
  - metadata の description/OGP/twitter が「占い・診断」テーマを含み「ツール」を含まないこと
  - CSS (`page.module.css`) のタップターゲットサイズ検証（`seeAllLink` padding, `featuredCardCta` font-size）
  - `dailyBadge` が `featuredCardTitleRow` の内側ではなくカード直下にあること

---

## 6. sitemap.ts でのトップ "/" の扱いと JSON-LD

### sitemap.ts (`src/app/sitemap.ts`)

- `(legacy)/page.tsx` に相当するトップ "/" エントリは **L178-184**:
  ```ts
  { url: BASE_URL, lastModified: homepageDate, changeFrequency: "weekly", priority: 1.0 }
  ```
- `homepageDate` は blog/tool/game/quiz/fortune/cheatsheet/dictionary/about/achievements/privacy の各最終更新日の最大値（L135-150）

### JSON-LD

JSON-LD は `(legacy)/layout.tsx` (L8, L19) が `generateWebSiteJsonLd()` を呼び、`<script type="application/ld+json">` としてレンダリングしている（`safeJsonLdStringify` 経由）。

`generateWebSiteJsonLd()` の出力（`src/lib/seo.ts` L178-192）:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "yolos.net",
  "url": "https://yolos.net",
  "description": "笑える占い・性格診断がいっぱいの占い・診断パーク。AIが運営する実験サイトでデイリー運勢・タイプ診断・知識クイズ・パズルゲームを無料で楽しめます。",
  "inLanguage": "ja",
  "creator": { "@type": "Organization", "name": "yolos.net (AI Experiment)" }
}
```

この JSON-LD の description も「占い・診断パーク」コンセプトを含んでいる。新トップ移行時に `generateWebSiteJsonLd()` の書き換えが必要。JSON-LD は layout レベルで全ページに適用されるため、`(legacy)/layout.tsx` と `(new)/layout.tsx` の両方が呼んでいる（各 L19）。

---

## 7. ルートレイアウト (`(legacy)/layout.tsx`) の旧コンセプト残存状況

**ファイルパス**: `src/app/(legacy)/layout.tsx`

- L12: `export const metadata: Metadata = sharedMetadata` — 独自定義ではなく `sharedMetadata` を参照
- `sharedMetadata` (`src/lib/site-metadata.ts`):
  - `title`: "yolos.net" — 旧コンセプト文言なし
  - `description`: "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。" — 旧コンセプト文言なし
  - `keywords`: `["占い", "性格診断", "無料診断", "クイズ", "デイリーパズル", "AI占い", ...]` — 占い系キーワードが残存
  - `openGraph.siteName`: `SITE_NAME`
  - `twitter.card`: "summary_large_image"

**結論**: `sharedMetadata` 自体の title/description は中立的だが、`keywords` に占い系キーワードが残っている。ただし `keywords` は現代の SEO では検索エンジンに無視されるため、緊急度は低い。

旧コンセプトが強く残っているのはむしろ以下:

- `(legacy)/page.tsx` の page-level `metadata.description`（L22, L25, L33）—「占い・診断パーク」文言
- `generateWebSiteJsonLd()` の description（`src/lib/seo.ts` L184）—「占い・診断パーク」文言
- `(legacy)/layout.tsx` が参照している CSS が `../old-globals.css`（新デザインは `@/app/globals.css`）

`(new)/layout.tsx` も同じ `sharedMetadata` を参照している（L13）。

---

## 8. `(new)/page.tsx` の不存在確認

```
find src/app/(new) -maxdepth 1 -name page.tsx
(出力なし、EXIT:0)
```

`src/app/(new)/page.tsx` は **存在しない**。Phase 4.4 の新規作成が必要。

`src/app/(new)/` の現在の内容:

```
about/  blog/  feed/  layout.tsx  memos/  play/  privacy/  storybook/  tools/
```

---

## 補足: コンポーネント分類サマリー

| コンポーネント                                  | 新デザイン対応            | 移行コスト概算                                                                                                                     |
| ----------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `FortunePreview`                                | (legacy)専用              | 新規作成 or 移植が必要。ビジネスロジック（fortuneStore, StarRating）は `@/play/fortune/` に分離済みなので再利用可。CSSは書き直し。 |
| `PlayContentTabs`                               | (legacy)専用              | 新規作成 or 移植が必要。`../page.module.css` への直接依存を解除する必要あり。ロジック自体は再利用可。                              |
| `@/play/registry` 関数群                        | 共通（Route Group非依存） | そのまま利用可                                                                                                                     |
| `@/blog/_lib/blog`                              | 共通                      | そのまま利用可                                                                                                                     |
| `@/lib/date`, `@/lib/constants`, `@/play/paths` | 共通                      | そのまま利用可                                                                                                                     |
