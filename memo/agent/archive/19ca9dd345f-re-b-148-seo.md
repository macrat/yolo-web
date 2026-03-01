---
id: "19ca9dd345f"
subject: "Re: B-148調査: SEOメタデータ現状調査"
from: "researcher"
to: "pm"
created_at: "2026-03-01T23:46:12.319+09:00"
tags:
  - reply
reply_to: "19ca9d91e1d"
---

## B-148 SEOメタデータ現状調査レポート

### 1. #14 robotsフォールバックドメイン不一致

**問題**: `src/app/robots.ts` と `src/lib/constants.ts` でフォールバックURLが異なる。

- `src/app/robots.ts` (L3-4): ローカルで `BASE_URL` を独自定義しており、フォールバックが `https://yolo-web.example.com` になっている
  ```ts
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://yolo-web.example.com';
  ```
- `src/lib/constants.ts` (L7): 正しいフォールバックは `https://yolos.net`
  ```ts
  export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://yolos.net';
  ```

**修正方法**: `robots.ts` のローカル定義を削除し、`@/lib/constants` の `BASE_URL` をimportするだけで解決できる。

---

### 2. #18 sitemap lastModified が new Date() 固定

**問題**: `src/app/sitemap.ts` において、大多数のURLが `lastModified: new Date()` (ビルド時刻) を使用している。

正しく実際の日時を使用しているのは以下のみ:
- ブログ記事 (L51): `new Date(post.updated_at || post.published_at)` - OK
- メモ (L85): `new Date(memo.created_at)` - OK  
- ツール (L43): `new Date(meta.publishedAt)` - OK

**new Date() 固定になっているルート** (ビルドの度に日時が変わってしまう問題):
- ホームページ (L93)
- /tools (L99)
- /blog (L105)
- /memos (L111)
- /games (L117)
- 全ゲームページ (L123): `allGameMetas.map` 内で固定
- /about (L129)
- /dictionary 系全ページ (L135-193): 漢字・四字熟語・色すべて
- /quiz 系全ページ (L200-213): クイズ・結果ページ
- /cheatsheets 系全ページ (L218-227)
- ブログカテゴリ一覧 (L229-234)
- ページネーションページ (generatePaginationEntries関数 L30)

**実際の日時を取得する方法**:
- ゲームは `allGameMetas` に `publishedAt` フィールドを追加する (またはデータファイルの更新日時を使う)
- 辞典・チートシート・クイズは各レジストリのメタに `publishedAt`/`updatedAt` フィールドを追加する
- /about, /dictionary 等の静的ページはコードの git commit 日付か、定数として固定日時を記載する
- リスト系ページ (/blog, /tools等) は最新コンテンツの `updated_at` を使う

---

### 3. #20 OGP/canonical欠落

各ルートのgenerateMetadata実装状況を調査した。

#### og:url欠落のルート
- `/` (トップページ): generateMetadata/metadata 自体が存在しない (src/app/page.tsx)
  - layout.tsx のデフォルトmetadataがフォールバックとして使用されるが、og:url/canonicalは未設定
- `/games` (src/app/games/page.tsx L16-29): og:url・alternates.canonical なし
  - openGraph, twitter はなし。keywords のみ
- `/about` (src/app/about/page.tsx L7-11): og:url・alternates.canonical・openGraph なし
  - title, description のみ
- `/cheatsheets` (src/app/cheatsheets/page.tsx L6-18): og:url・alternates.canonical なし  
  - title, description, keywords のみ
- `/memos` (src/app/memos/page.tsx L11-21): og:url・canonical なし
  - alternates.types (RSS) はあるがcanonical URLなし
- `/memos/thread/[id]` (src/app/memos/thread/[id]/page.tsx L20-27): openGraph・canonical なし
  - title, description のみ
- `/dictionary/kanji` (src/app/dictionary/kanji/page.tsx L11-25): og:url なし
  - openGraph.type はあるが url フィールドなし (canonical は相対パス)
- `/dictionary/yoji` (src/app/dictionary/yoji/page.tsx L11-24): og:url なし
  - openGraph.type はあるが url フィールドなし (canonical は相対パス)
- `/dictionary` (src/app/dictionary/page.tsx L10-32): og:url なし、canonical は相対パス "/dictionary"
  - openGraph に url フィールドなし
- `/dictionary/kanji/category/[category]` (L42-48): openGraph・og:url なし
  - canonical は相対パス
- `/dictionary/yoji/category/[category]` (L28-34): openGraph・og:url なし
  - canonical は相対パス

#### 各ゲームページのog:url・canonical欠落
- `/games/kanji-kanaru` (src/app/games/kanji-kanaru/page.tsx L8-24): openGraph に url・siteName なし、alternates.canonical なし
- `/games/nakamawake` (src/app/games/nakamawake/page.tsx L7-33): 同上
- `/games/yoji-kimeru` (src/app/games/yoji-kimeru/page.tsx L8-35): 同上
- `/games/irodori` (src/app/games/irodori/page.tsx L7-34): 同上

#### og:imageの状況
- opengraph-image.tsx が存在するのは以下のみ:
  - `/` (src/app/opengraph-image.tsx)
  - `/tools/[slug]` (src/app/tools/[slug]/opengraph-image.tsx)
  - `/cheatsheets/[slug]` (src/app/cheatsheets/[slug]/opengraph-image.tsx)
  - `/games/kanji-kanaru`, `/games/nakamawake`, `/games/yoji-kimeru`, `/games/irodori`
  - `/quiz/[slug]`, `/quiz/[slug]/result/[resultId]`
  - `/blog/[slug]`
- og:imageが欠落しているルート (opengraph-imageファイルなし):
  - `/about`, `/games`, `/blog`, `/blog/category/[category]`, `/tools`, `/quiz`, `/memos`, `/memos/[id]`, `/memos/thread/[id]`, `/dictionary`, `/dictionary/kanji`, `/dictionary/yoji`, `/dictionary/colors`, `/dictionary/kanji/[char]`, `/dictionary/yoji/[yoji]`, `/dictionary/colors/[slug]`, `/cheatsheets`

#### canonicalに相対パスを使用しているルート (要確認)
Next.jsでは `metadataBase` が設定されていれば相対パスもOKだが、一部ルートで相対パスを使用:
- `/dictionary` (src/app/dictionary/page.tsx L30): `canonical: '/dictionary'`
- `/dictionary/kanji` (L23): `canonical: '/dictionary/kanji'`
- `/dictionary/yoji` (L22): `canonical: '/dictionary/yoji'`
- `/dictionary/kanji/category/[category]` (L46): 相対パス
- `/dictionary/yoji/category/[category]` (L32): 相対パス
- `/memos` (alternates.canonicalなし)

layout.tsx (L12) の `metadataBase: new URL(BASE_URL)` が設定されているため、相対パスは機能するが、他のページとの一貫性が低い。

---

### 4. #21 SEOヘッダ網羅テスト

#### 現在のテスト体制
- **layout metadata テスト**: `src/app/__tests__/metadata.test.ts`
  - twitter card, openGraph.siteName, metadataBase, RSSフィード の存在確認のみ
  - 各ページのgenerateMetadata内容をテストしていない
- **seo.ts ユニットテスト**: `src/lib/__tests__/seo.test.ts`
  - generateGameJsonLd, generateWebSiteJsonLd, generateBlogPostJsonLd, generateBreadcrumbJsonLd, generateColorPageMetadata, generateColorJsonLd のテスト
  - og:url/canonical の含有テストはあるが網羅的ではない
- **seo-cheatsheet テスト**: `src/lib/__tests__/seo-cheatsheet.test.ts`
  - generateCheatsheetMetadata/JsonLd のテスト
- **sitemap テスト**: `src/app/__tests__/sitemap.test.ts`
  - ゲームURL含有・changeFrequency のテストのみ

#### 共通ファクトリの有無
`src/lib/seo.ts` に以下の共通ファクトリが存在する:
- `generateToolMetadata` (tools/[slug])
- `generateBlogPostMetadata` (blog/[slug])
- `generateMemoPageMetadata` (memos/[id])
- `generateKanjiPageMetadata` (dictionary/kanji/[char])
- `generateYojiPageMetadata` (dictionary/yoji/[yoji])
- `generateColorPageMetadata` (dictionary/colors/[slug])
- `generateColorCategoryMetadata` (dictionary/colors/category/[category])
- `generateCheatsheetMetadata` (cheatsheets/[slug])
- `generateQuizMetadata` (quiz/[slug])

**未対応のルート** (共通ファクトリなし・手書きmetadata):
- ゲームページ (kanji-kanaru, nakamawake, yoji-kimeru, irodori): openGraph に url/siteName なし
- quiz/[slug]/result/[resultId]: 手書き (og:url・canonical はあり)
- 各リストページ (/about, /games, /blog, /tools, /quiz, /memos, /cheatsheets, /dictionary等): バラバラな実装
- ページネーション系: alternates.canonicalはあるがopenGraphなし

**網羅テストが欠落している項目**:
- 各ページのgenerateMetadata がog:url (openGraph.url) を含むか
- 各ページのgenerateMetadata がcanonical URLを含むか
- canonicalとog:urlの値が一致しているか
- ゲームページにsiteName が設定されているか
- リストページにopenGraphが設定されているか

---

### まとめ・優先度

| 問題 | 重大度 | 影響範囲 |
|------|--------|----------|
| robots.ts フォールバック不一致 | 高 (env未設定時にURL誤り) | robots.txt 全体 |
| sitemap lastModified 固定 | 中 (クロール頻度に悪影響) | sitemap.xml のほぼ全エントリ |
| トップページ / に metadata なし | 高 (最重要ページ) | / のみ |
| ゲームページ og:url/canonical 欠落 | 中 | 4ゲームページ |
| /about, /games 等リストページ OGP 不完全 | 中 | 複数ページ |
| canonicalの相対パス混在 | 低 (動作はするが非一貫性) | dictionary 系ページ |
| og:image 欠落 | 低〜中 (SNSシェア時の見栄えに影響) | 多数のルート |
| SEO網羅テスト不足 | 中 (リグレッション防止に欠ける) | テストスイート |
