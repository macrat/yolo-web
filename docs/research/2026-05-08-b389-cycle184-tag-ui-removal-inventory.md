# B-389 cycle-184 実装計画用コード調査レポート

調査日: 2026-05-08

---

## 1. ホットフィックス箇所の特定（TODO(cycle-184/B-389) マーカー一覧）

`grep -rn "TODO(cycle-184/B-389)" src/` の結果: 計 12 箇所。

### src/blog/\_components/BlogCard.tsx

| 行  | 概要                                                           | cycle-184 での撤去内容             |
| --- | -------------------------------------------------------------- | ---------------------------------- |
| 26  | `linkableTags?: ReadonlySet<string>` props の JSDoc コメント行 | props 定義ごと削除                 |
| 84  | `{/* TODO ... */}` + タグ描画 IIFE ブロック全体（84〜105行）   | タグ `<ul>` 描画ブロック全体を削除 |

### src/blog/\_components/TagList.tsx

| 行  | 概要                                                              | cycle-184 での撤去内容                                                                          |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 11  | `linkableTags?: ReadonlySet<string>` props の JSDoc コメント行    | props 定義ごと削除                                                                              |
| 21  | `const visibleTags = linkableTags ? ... : tags;` フィルタロジック | `visibleTags` 変数ごと削除（タグ描画自体を全廃するなら TagList コンポーネント全体が不要になる） |

### src/blog/\_components/BlogFilterableList.tsx

| 行  | 概要                                                           | cycle-184 での撤去内容 |
| --- | -------------------------------------------------------------- | ---------------------- |
| 73  | `linkableTags?: ReadonlySet<string>` props の JSDoc コメント行 | props 定義ごと削除     |
| 299 | `linkableTags={linkableTags}` を BlogGrid へ渡す jsx           | 該当 prop 渡し削除     |

### src/blog/\_components/BlogListView.tsx

| 行  | 概要                                                                         | cycle-184 での撤去内容                   |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| 82  | `// TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）`              | コメントと直下のコードブロック削除       |
| 85  | `const MIN_POSTS_FOR_TAG_PAGE = 3;`                                          | 定数削除                                 |
| 86  | `const linkableTags = new Set(getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE));` | `getTagsWithMinPosts` 呼び出しと変数削除 |
| 132 | `linkableTags={linkableTags}` を BlogFilterableList へ渡す jsx               | 該当 prop 渡し削除                       |

### src/blog/\_components/BlogGrid.tsx

| 行  | 概要                                                           | cycle-184 での撤去内容 |
| --- | -------------------------------------------------------------- | ---------------------- |
| 29  | `linkableTags?: ReadonlySet<string>` props の JSDoc コメント行 | props 定義ごと削除     |
| 52  | `linkableTags={linkableTags}` を BlogCard へ渡す jsx           | 該当 prop 渡し削除     |

### src/app/(legacy)/blog/[slug]/page.tsx

| 行  | 概要                                                                                                          | cycle-184 での撤去内容                   |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 61  | `// TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）`                                               | コメントと直下ブロック削除               |
| 64  | `const MIN_POSTS_FOR_TAG_PAGE = 3;`                                                                           | 定数削除                                 |
| 65  | `const linkableTags = new Set(getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE));`                                  | `getTagsWithMinPosts` 呼び出しと変数削除 |
| 108 | `{/* TODO(cycle-184/B-389): X1 採用時に削除 */}` + `<TagList tags={post.tags} linkableTags={linkableTags} />` | TagList 呼び出し行（109行）ごと削除      |

---

## 2. タグ関連コードのインベントリ

### 2-a. タグページルート（削除対象）

**`src/app/(new)/blog/tag/[tag]/page.tsx`**

- 1〜131行、全体
- `MIN_POSTS_FOR_TAG_PAGE = 3` をローカル定数として定義（14行）
- `generateStaticParams`, `generateMetadata`, `TagPage` 関数を export
- `getTagsWithMinPosts`, `getPostsByTag`, `TAG_DESCRIPTIONS`, `MIN_POSTS_FOR_TAG_INDEX` を `@/blog/_lib/blog` からインポート
- cycle-184 で **ファイルごと削除**

**`src/app/(new)/blog/tag/[tag]/page/[page]/page.tsx`**

- 1〜146行、全体
- `MIN_POSTS_FOR_TAG_PAGE = 3` をローカル定数として定義（14行）
- `dynamicParams = false`, `generateStaticParams`, `generateMetadata`, `TagPaginatedPage` 関数を export
- cycle-184 で **ファイルごと（ディレクトリごと）削除**

### 2-b. BlogCard.tsx タグ pill 描画ループ

ファイル: `src/blog/_components/BlogCard.tsx`

- 84〜105行: `{/* TODO(cycle-184/B-389) */}` に囲まれた IIFE ブロック
  - `linkableTags?.has(tag)` でフィルタし `<ul aria-label="タグ">` を描画
  - `<Link href={/blog/tag/${tag}}>` で各タグリンクを生成
- 22〜28行: `linkableTags?: ReadonlySet<string>` props 定義（JSDoc 含む）
- cycle-184 では**84〜105行のタグ `<ul>` ブロック全体**と**22〜28行の props 定義**を削除

### 2-c. TagList.tsx タグ pill 描画ループ

ファイル: `src/blog/_components/TagList.tsx`

- 4〜14行: `TagListProps` インターフェース（`linkableTags?: ReadonlySet<string>` 含む）
- 20行: `export default function TagList({ tags, linkableTags }: TagListProps)`
- 21〜25行: `const visibleTags = linkableTags ? tags.filter(...) : tags;`
- 29〜39行: `<ul aria-label="タグ">` 描画、`<Link href={/blog/tag/${tag}}>` でリンク生成
- X1 採用 = タグ UI 完全廃止のため、**TagList.tsx ファイル全体と TagList.module.css を削除**
  - ただし、TagList が `(legacy)/blog/[slug]/page.tsx` でのみ呼ばれているため、削除は legacy slug page の TagList 呼び出し行撤去と同時実施

### 2-d. BlogFilterableList.tsx 人気タグ Top 8 セクション

ファイル: `src/blog/_components/BlogFilterableList.tsx`

- 80〜82行: `const TOP_TAGS_COUNT = 8;` と説明コメント（これ自体は TODO マーカーなし）
- 109〜116行: `function buildTagHref(tag, keyword)` 関数（`/blog/tag/${tag}` を生成）
- 181〜190行: `popularTags` 算出ロジック（allPosts の tags をカウントし Top 8 抽出）
- 192〜194行: `showPopularTags` の計算
- 269〜284行: `{showPopularTags && <nav aria-label="人気タグ"> ... </nav>}` 人気タグ描画ブロック
- 73〜75行: `linkableTags?: ReadonlySet<string>` props 定義（JSDoc 含む）
- 299行: `linkableTags={linkableTags}` BlogGrid への prop 渡し

cycle-184 では**人気タグ nav ブロック全体、`buildTagHref` 関数、`popularTags` / `showPopularTags` 算出、`TOP_TAGS_COUNT` 定数、`linkableTags` props** を削除。`tagHeader` に関連する `BlogFilterableList` の `tagHeader` props と `noResults` メッセージのタグページ用分岐も削除（タグページ自体がなくなるため）。

### 2-e. BlogListView.tsx での MIN_POSTS_FOR_TAG_PAGE と linkableTags

ファイル: `src/blog/_components/BlogListView.tsx`

- 10行: `getTagsWithMinPosts` import（blog.ts から）
- 59〜65行: コメント内の 6 ルート説明に `/blog/tag/[tag]` が含まれる（コメント削除対象）
- 82〜86行: TODO マーカーブロック（`MIN_POSTS_FOR_TAG_PAGE = 3` 定数、`linkableTags` Set 生成）
- 132行: `linkableTags={linkableTags}` BlogFilterableList への prop 渡し
- `tagHeader?: TagHeader` props が BlogListView に存在（35〜42行）—タグページ用ヘッダー表示ロジックごと削除

### 2-f. ローカル定数 MIN_POSTS_FOR_TAG_PAGE = 3 の所在（2 ファイル）

- `src/app/(new)/blog/tag/[tag]/page.tsx`: 14行
- `src/app/(new)/blog/tag/[tag]/page/[page]/page.tsx`: 14行
- `src/blog/_components/BlogListView.tsx`: 85行（TODO マーカー付き）
- `src/app/(legacy)/blog/[slug]/page.tsx`: 64行（TODO マーカー付き）

合計 4 箇所（cycle-183 §0 L719-723 で言及の「2 ファイルにローカル定義」は tag page ルートの 2 ファイルを指す。BlogListView と legacy slug page はホットフィックスで追加された箇所）

### 2-g. TAG_DESCRIPTIONS の定義場所

ファイル: `src/blog/_lib/blog.ts`

- 71〜136行: `export const TAG_DESCRIPTIONS: Record<string, string>` 定義
  - 26 エントリ（AIエージェント〜設計パターン等）、各エントリ 100 字以上の説明文
- 削除対象: `TAG_DESCRIPTIONS` 定数全体（71〜136行）
- 利用箇所:
  - `src/app/(new)/blog/tag/[tag]/page.tsx` 37, 85行（タグページ削除に伴い消える）
  - `src/app/(new)/blog/tag/[tag]/page/[page]/page.tsx` 51, 99行（同上）
  - `src/app/(new)/blog/__tests__/tag-page.test.ts` 6行（import）、38〜51行（全タグに説明文ありの assertion）

### 2-h. src/lib/feed.ts の `<category>` 出力箇所

ファイル: `src/lib/feed.ts`

- 43行: `category: post.tags.map((tag) => ({ name: tag })),`
- X1 案 = frontmatter 残置のため、**tags データ自体は記事 MD に残す**
- RSS/Atom の `<category>` 出力は feed.ts で行われており、タグ UI 廃止後も `category` 出力の存廃は別途決断が必要
  - X1 案の「frontmatter 残置」に従えば削除不要だが、タグページへのリンクを生成しない観点から影響を確認すること

### 2-i. next.config.ts の既存リダイレクト定義

ファイル: `next.config.ts`

- 9〜155行: `async redirects()` 関数
- `paginationRedirects`（28〜49行）に `/blog/tag/:tag/page/1` → `/blog/tag/:tag` の永続リダイレクト（45〜48行）が定義済み
- cycle-184 では `/blog/tag/[tag]` ルート全体の廃止に伴い、**26 タグ × `/blog/tag/[tag]` → `/blog` の 301 リダイレクト**を追加する必要がある（既存の paginationRedirects 等と同構造で追加）
- 既存の `/blog/tag/:tag/page/1` → `/blog/tag/:tag` リダイレクトは、廃止後は `/blog/tag/:tag` 自体がリダイレクトになるため実質二段リダイレクトにならないよう `/blog/tag/:tag/page/:page` → `/blog` のワイルドカードリダイレクトに一本化を検討すること

### 2-j. src/app/sitemap.ts タグ系 URL

ファイル: `src/app/sitemap.ts`

- 6〜8行: `getTagsWithMinPosts`, `getPostsByTag`, `MIN_POSTS_FOR_TAG_INDEX` を import
- 152〜176行: `const indexableTags = getTagsWithMinPosts(MIN_POSTS_FOR_TAG_INDEX)` と `tagSitemapEntries` の生成ブロック
  - `MIN_POSTS_FOR_TAG_INDEX` = 5 なので 16 タグ分の URL がサイトマップに追加されている
- 354行: `...tagSitemapEntries` のスプレッド
- cycle-184 では**152〜176行のブロック全体と 354行のスプレッド**を削除。import も清掃

### 2-k. (new)/blog/[slug]/page.tsx での TagList 呼び出し

`src/app/(new)/blog/[slug]/` ディレクトリは存在しない（`find` で未発見）。  
記事詳細ページは現在 `src/app/(legacy)/blog/[slug]/page.tsx` のみ。  
`TagList` の import と呼び出しは **legacy 側だけ**（24行 import、109行 `<TagList tags={post.tags} linkableTags={linkableTags} />`）。

### 2-l. `grep -rn "/blog/tag/" src/` の結果（ソースファイル、テスト除く）

| ファイル                                            | 行               | 内容                                                       |
| --------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| `src/app/(new)/blog/tag/[tag]/page.tsx`             | 52, 61, 110, 125 | metadata canonical / breadcrumb / basePath 内での URL 生成 |
| `src/app/(new)/blog/tag/[tag]/page/[page]/page.tsx` | 68, 77, 125, 140 | 同上                                                       |
| `src/app/sitemap.ts`                                | 170              | `${BASE_URL}/blog/tag/${encodeURIComponent(tag)}`          |
| `src/blog/_components/BlogCard.tsx`                 | 98               | `<Link href={/blog/tag/${tag}}>`                           |
| `src/blog/_components/BlogFilterableList.tsx`       | 115              | `buildTagHref` 関数の return 文                            |
| `src/blog/_components/BlogListView.tsx`             | 64, 65           | コメント内の 6 ルート説明                                  |
| `src/blog/_components/TagList.tsx`                  | 18, 33           | JSDoc コメント / `<Link href>`                             |

`src/blog/content/` 配下の記事 MD ファイル内に `/blog/tag/` 参照なし（grep 結果 0 件）。

---

## 3. テストインベントリ（更新が必要なもの）

### 3-a. src/blog/\_components/**tests**/BlogCard.test.tsx

- タグ関連 assertion あり、多数
- **87〜96行**: `"タグリストが表示される"` — tags 表示を確認
- **98〜106行**: `"タグが 0 件の場合でもエラーにならない"` — `aria-label="タグ"` 未存在を確認
- **108〜117行**: `"タイトルリンクが /blog/[slug] を指す"` — タグとは別
- **119〜128行**: `"タグリンクが /blog/tag/[tag] を指す"` — `/blog/tag/Claude Code` を assertion
- **131〜193行**: `"BlogCard linkableTags フィルタ"` describe ブロック（5テスト）

cycle-184 で削除が必要なテスト:

- `"タグリストが表示される"` （87〜96）
- `"タグが 0 件の場合でもエラーにならない"` の `aria-label="タグ"` 確認部分（98〜106）
- `"タグリンクが /blog/tag/[tag] を指す"` （119〜128）
- `"BlogCard linkableTags フィルタ"` ブロック全体（131〜193）

### 3-b. src/blog/\_components/**tests**/BlogFilterableList.test.tsx

タグ関連 assertion あり。

- **401〜423行**: `"buildTagHref: タグリンク href にキーワード引き継ぎ"` describe ブロック
  - 人気タグナビ (`aria-label="人気タグ"`) の href に `q=` が含まれることを確認
- **425〜466行**: `"人気タグ表示の出現条件"` describe ブロック（3テスト）
  - 人気タグ表示・非表示の条件を確認
- **468〜486行**: `"タグページでの tagHeader 表示"` describe ブロック
  - `tagHeader` 指定時のカテゴリナビ非表示確認

cycle-184 で削除が必要なテスト:

- `"buildTagHref: タグリンク href にキーワード引き継ぎ"` ブロック全体（401〜423）
- `"人気タグ表示の出現条件"` ブロック全体（425〜466）
- `"タグページでの tagHeader 表示"` ブロック全体（468〜486）

### 3-c. src/blog/\_components/**tests**/BlogListView.test.tsx

- **145〜160行**: `"tagHeader が指定された場合タグ名が表示される（タグページモード）"` テスト
  - `basePath` に `/blog/tag/...` を含む、`tagHeader` props を渡してタグ名表示確認
- cycle-184 で削除が必要なテスト: 145〜160行

### 3-d. src/blog/\_components/**tests**/TagList.test.tsx

- ファイル全体がタグ関連テスト（108行）
- `describe("TagList", ...)` （22〜59行）: 基本表示テスト（`/blog/tag/` href 確認含む）
- `describe("TagList linkableTags フィルタ", ...)` （61〜107行）: linkableTags フィルタテスト
- cycle-184 では **TagList コンポーネント自体を削除**するため、**ファイル全体削除**

### 3-e. src/blog/\_components/**tests**/searchFilter.test.ts

- **78〜91行**: `"tags 配列のいずれかにキーワードが含まれる場合ヒットする"` テスト
  - `filterPostsByKeyword` の tags 検索機能を確認
- X1 案ではタグ frontmatter を残置するため、`filterPostsByKeyword` 関数自体はタグを検索対象に含めたままで良い可能性がある
  - 「タグ UI 廃止」と「タグ検索廃止」は別問題であり、キーワード検索でのタグマッチを残すかは設計判断が必要

### 3-f. src/app/(new)/blog/**tests**/pagination-redirect.test.ts

タグページ関連テスト多数あり（89〜121行、123〜136行）。

- **89〜121行**: `"/blog/tag/[tag]/page/[page]"` describe ブロック（4テスト）
  - `dynamicParams=false` と `generateStaticParams` 整合、p2 タグ数（3タグ）、3タグ確認、各タグ 12 件超確認
- **124〜136行**: `"/blog/tag/:tag/page/1 → /blog/tag/:tag"` リダイレクト確認テスト

cycle-184 で削除が必要なテスト:

- `/blog/tag/[tag]/page/[page]` describe ブロック全体（89〜121）
- `/blog/tag/:tag/page/1` リダイレクト確認テスト（124〜136）
  - ただし cycle-184 では新たに `/blog/tag/...` → `/blog` の 301 リダイレクトを追加するため、新リダイレクトの assertion に置き換えること

### 3-g. src/app/(new)/blog/**tests**/tag-page.test.ts

- ファイル全体がタグページ関連テスト（62行）
- `generateStaticParams` が 3件以上タグのみ返す確認、主要タグ含有確認、TAG_DESCRIPTIONS 定義確認、noindex 条件確認
- cycle-184 では **tag ページルート自体を削除**するため、**ファイル全体削除**

### 3-h. src/app/(legacy)/blog/[slug]/**tests**/page.test.tsx

- TagList レンダリングに関する assertion は存在しない
  - PlayRecommendBlock の integration テストのみ（7〜80+行）
- cycle-184 での変更対象外（TagList 呼び出し行を page.tsx から削除するが、テスト側は TagList を直接 assertion していない）
  - 削除後もテストは通過する想定（page.tsx の import/動作確認テストのみ）

### 3-i. src/lib/**tests**/feed.test.ts

- **該当ファイルなし**。feed テストは `src/app/(new)/feed/__tests__/feed.test.ts` に存在
- `src/app/(new)/feed/__tests__/feed.test.ts` （65行）: RSS/Atom 形式の確認のみ、`<category>` タグの存在は非検証
- cycle-184 での対応: B-389-4-2（U-6 採用 = `<category>` 削除と一貫）で「`<category>` 要素が出力されないこと」の明示 assertion を追加する

### 3-j. src/blog/\_lib/**tests**/blog-tags.test.ts（cycle-184 で処遇判断が必要、CRIT-1 関連）

ファイル: `src/blog/_lib/__tests__/blog-tags.test.ts`（92 行）

- 1-7 行: `TAG_DESCRIPTIONS` / `getAllTags` / `getPostsByTag` / `MIN_POSTS_FOR_TAG_INDEX` を import
- 9-52 行: `describe("TAG_DESCRIPTIONS", ...)` — 4 テスト（`設計パターン` / `Next.js` / 100 字以上 / 主要 13 タグ定義確認）
- 54-66 行: `describe("getAllTags", ...)` — 2 テスト（重複なし / アルファベット順）
- 68-86 行: `describe("getPostsByTag", ...)` — 2 テスト（存在タグ / 非存在タグ空配列）
- 88-92 行: `describe("MIN_POSTS_FOR_TAG_INDEX", ...)` — 1 テスト（値が 5）

cycle-184 での処遇:

- `TAG_DESCRIPTIONS` describe（9-52 行）: B-389-3-1 で TAG_DESCRIPTIONS 削除のため**先行削除**
- `MIN_POSTS_FOR_TAG_INDEX` describe（88-92 行）: B-389-3-2 で定数削除のため**先行削除**
- `getAllTags` / `getPostsByTag` describe（54-86 行）: B-389-3-3 で関数削除のため**先行削除**
- 上記すべて削除すると残るテストがなくなるため、結果としてファイル全体を削除する想定。`getRelatedPosts` の `sharedTagCount` を検証するテストはこのファイルには存在せず、別ファイル（`related-posts.test.ts` 等）にある場合のみ残置対象となる
- 削除順序の制約: `blog-tags.test.ts` の各 describe を消す前に B-389-3 系の定義削除を実行すると、test ファイル側で import エラーが出るため、**describe 削除を先行**することが必須

### 3-k. `getAllTags` / `getPostsByTag` の現状利用箇所一覧（タグページ削除後の処遇判断材料）

`grep -rn "getAllTags\|getPostsByTag" src/` の結果を整理:

- `src/blog/_lib/blog.ts` L344, L358: 関数定義（処遇 = 利用箇所が消えた段階で削除）
- `src/blog/_lib/__tests__/blog-tags.test.ts` L4-5, L54-86: import + テスト（B-389-7-8 で削除）
- `src/app/sitemap.ts` L7, L155: `getPostsByTag` 利用（B-389-5-1 で削除対象）
- `src/app/(new)/blog/tag/[tag]/page.tsx` L4, L32, L77: 利用（B-389-1-1 でファイルごと削除）
- `src/app/(new)/blog/tag/[tag]/page/[page]/page.tsx` L4, L32, L47, L92: 利用（B-389-1-2 でファイルごと削除）
- `src/app/(new)/blog/__tests__/pagination-redirect.test.ts` L5, L114: 利用（B-389-7-6 で当該 describe 削除）
- `src/app/(new)/blog/__tests__/tag-page.test.ts` L3, L17: 利用（B-389-7-5 でファイルごと削除）

**結論**: 上記すべての利用箇所が cycle-184 内で消えるため、関数定義（L344, L358）も同サイクル内で削除する。frontmatter `tags` 残置によって `getRelatedPosts` 内のタグスコアリングは継続するが、その内部実装は `getAllTags` / `getPostsByTag` を呼ばない（`post.tags` を直接参照する形）ため、これら 2 関数は削除しても影響しない。

---

## 4. design-migration-plan.md との整合確認

`grep "タグ\|tag" docs/design-migration-plan.md` の結果から、タグ関連記述を抽出:

- **27行**: `(new)/` のインデックス説明例として `src/app/(legacy)/blog/tag/[tag]/page.tsx` を参照
  - → `(legacy)/blog/tag/[tag]/page.tsx` は `(new)/` に移行済みのため、例示が誤り。cycle-183 時点では `src/app/(new)/blog/tag/[tag]/page.tsx` が正しい
  - → cycle-184 でタグページ削除後はこの参照例も更新が必要

- **112行（Phase 4.3）**: ブログ一覧移行対象として `/blog/tag/[tag]` が列挙されている
  - → Phase 4.3 は (new)/ への移行済み（実装済み状態）
  - → B-389 X1 採用でタグページ自体を廃止するため、Phase 4.3 の記述は「廃止対応済み」として扱う

- **129行（Phase 4 全体留意）**: 「グローバルナビ / 一覧 / サイトマップ / タグで複数経路（WCAG 2.4.5 Multiple Ways）」の記述
  - → タグページ廃止後は WCAG 2.4.5 Multiple Ways の充足状況を再確認する必要がある

- **354行**: `(legacy)/blog/tag/[tag]/page.tsx` を noindex 設定例として参照（27行と同じ問題）

**Phase 2 / Phase 7 / Phase 9 / Phase 9.2** でタグ固有の記述は見当たらない（Phase 2 は道具箱タイル、Phase 7 はツール詳細、Phase 9 は道具箱本実装が主テーマ）。

---

## 5. 旧 /blog/tag/ 関連 URL の集計（実体確認）

### getTagsWithMinPosts の実体値（2026-05-08 時点）

- `getTagsWithMinPosts(3)`: **26 タグ**
  - AIエージェント, Claude Code, Next.js, SEO, TypeScript, UI改善, Web開発, オンラインツール, ゲーム, サイト運営, セキュリティ, チートシート, テキスト処理, パフォーマンス, リファクタリング, ワークフロー, ワークフロー連載, 伝統色, 四字熟語, 失敗と学び, 新機能, 日本語, 正規表現, 漢字, 舞台裏, 設計パターン

- `getTagsWithMinPosts(5)`: **16 タグ**
  - AIエージェント, Next.js, SEO, TypeScript, UI改善, Web開発, オンラインツール, ゲーム, サイト運営, リファクタリング, ワークフロー, 失敗と学び, 新機能, 日本語, 舞台裏, 設計パターン

### ページネーション p2+ URL 実体（vitest 実行結果より）

pagination-redirect.test.ts の実行結果（2026-05-08 通過）:

- p2 ページが存在するタグ: **3 タグ**（設計パターン 21件, Web開発 17件, Next.js 15件）
- 各タグとも 12件/ページで 2 ページ、p2 が 1 ページずつ → 計 3 p2 URL

### 削除対象 URL 総数

| 種別                                   | 数     |
| -------------------------------------- | ------ |
| タグ p1 URL (`/blog/tag/[tag]`)        | 26     |
| タグ p2 URL (`/blog/tag/[tag]/page/2`) | 3      |
| **合計**                               | **29** |

→ **cycle-183 の計算値「26 タグ × 1 + p2 が 3 = 29 URL」と一致**

### サイトマップ収録対象（indexable, ge5 = 16 タグ）

`src/app/sitemap.ts` は `getTagsWithMinPosts(MIN_POSTS_FOR_TAG_INDEX)` = `getTagsWithMinPosts(5)` の結果を使用。16 タグの p1 URL のみサイトマップ収録（p2 は収録なし）。

---

## 付録: 実体確認に使ったコマンド一覧

```bash
# 1. ホットフィックス箇所特定
grep -rn "TODO(cycle-184/B-389)" /mnt/data/yolo-web/src/

# 2. タグページルートファイル一覧
find /mnt/data/yolo-web/src/app -path "*/blog/tag*" -type f

# 3. /blog/tag/ URL 参照（テスト・テストファイルを除く）
grep -rn "/blog/tag/" /mnt/data/yolo-web/src/ | grep -v "__tests__" | grep -v ".test."

# 4. blog.ts の tag 関連定義
grep -n "getTagsWithMinPosts\|MIN_POSTS_FOR_TAG_INDEX\|TAG_DESCRIPTIONS\|getRelatedPosts" /mnt/data/yolo-web/src/blog/_lib/blog.ts

# 5. sitemap.ts の tag 関連行
grep -n "tag\|TAG" /mnt/data/yolo-web/src/app/sitemap.ts

# 6. next.config.ts リダイレクト確認
cat /mnt/data/yolo-web/next.config.ts

# 7. TagList 呼び出し箇所
grep -rn "TagList" /mnt/data/yolo-web/src/app/

# 8. design-migration-plan.md のタグ関連記述
grep -n "タグ\|tag" /mnt/data/yolo-web/docs/design-migration-plan.md

# 9. getTagsWithMinPosts 実体値確認（実行環境での直接確認は環境依存で失敗、vitest 経由で確認）
npx vitest run src/app/\(new\)/blog/__tests__/pagination-redirect.test.ts --reporter=verbose

# 10. feed.ts の category 出力箇所
grep -n "category.*post.tags\|post.tags.map\|<category>" /mnt/data/yolo-web/src/lib/feed.ts

# 11. 各テストファイルの内容確認（Read ツール使用）
# BlogCard.test.tsx, BlogFilterableList.test.tsx, BlogListView.test.tsx,
# TagList.test.tsx, searchFilter.test.ts, pagination-redirect.test.ts, tag-page.test.ts,
# (legacy)/blog/[slug]/__tests__/page.test.tsx, (new)/feed/__tests__/feed.test.ts
```
