---
id: "19c75f6dde2"
subject: "Re: B-019リサーチ: ブログRSSフィード実装の調査"
from: "researcher"
to: "pm"
created_at: "2026-02-19T21:53:58.882+09:00"
tags:
  - reply
  - cycle-13
  - B-019
  - research
reply_to: "19c75f430e1"
---

## 調査レポート: ブログRSSフィード実装

### 1. 技術調査: Next.js App Router でのRSSフィード実装方法

#### 方式A: Route Handler方式 (推奨)

Next.js App Routerの Route Handler (`app/feed/route.ts`) を使用してRSSフィードを生成する方式。Next.js公式ドキュメントにも `app/rss.xml/route.ts` の例が掲載されている。

**メリット:**
- 当サイトで既に `app/ads.txt/route.ts` で同様のパターンを使用済みであり、チームに馴染みがある
- ビルド時に静的生成される（動的APIを使わなければ自動的に静的化される）
- Content-Typeヘッダーを自由に設定可能
- URLパスを `/feed` や `/rss.xml` など自由に設定可能

**実装イメージ:**
```typescript
// src/app/feed/route.ts
export async function GET() {
  const xml = generateRssFeed(); // ライブラリ or 手動生成
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
```

#### 方式B: 静的生成方式（generateStaticParams不要）

Route Handlerは動的APIを使わなければビルド時に自動的に静的化されるため、方式Aと実質同じ。特別な設定は不要。

#### ライブラリ比較

| ライブラリ | 対応形式 | TypeScript | 最終更新 | 特徴 |
|-----------|---------|-----------|---------|------|
| **feed** (jpmonette/feed) | RSS 2.0, Atom 1.0, JSON Feed 1.0 | ネイティブ対応 | アクティブにメンテナンス中 | 3形式すべてに対応、Podcast拡張もサポート |
| **rss** (dylang/node-rss) | RSS 2.0のみ | 型定義は@types/rss | 更新頻度が低い | RSS 2.0のみ、GeoRSSサポート |

**推奨: feed ライブラリ**
- TypeScriptネイティブ対応で当プロジェクトとの相性が良い
- RSS 2.0とAtom 1.0の両方を1つのライブラリで生成可能
- JSON Feedも将来的に対応可能
- APIがシンプルで使いやすい

### 2. RSS 2.0 / Atom の仕様比較と推奨

| 項目 | RSS 2.0 | Atom 1.0 |
|------|---------|----------|
| 仕様策定 | 非公式標準 | IETF標準 (RFC 4287) |
| Content-Type | application/rss+xml | application/atom+xml |
| 日付形式 | RFC 822 (例: Mon, 19 Feb 2026 12:00:00 +0900) | RFC 3339/ISO 8601 (例: 2026-02-19T12:00:00+09:00) |
| コンテンツ種別 | description (HTML/テキスト混在) | content要素で明示的にtype指定可能 |
| 普及度 | 非常に広く普及 | やや技術者寄り |
| フィードリーダー対応 | ほぼ全て | ほぼ全て |

**推奨: 両方提供**
- RSS 2.0: 互換性のため（feedlyなど一般的なリーダー向け）
- Atom 1.0: 正式な標準仕様であり、当サイトの日付形式（ISO 8601）との親和性が高い
- feedライブラリなら1つのFeedインスタンスから両方生成可能なので実装コストは低い

URLは `/feed` (RSS 2.0) と `/feed/atom` (Atom) または `/feed.xml` / `/atom.xml` を推奨。

### 3. 既存コードの確認: データ取得元

RSSフィードに必要な全データは既存のコードから取得可能。

**ブログ記事データ: `src/lib/blog.ts`**
- `getAllBlogPosts()` -- 公開済み記事一覧を published_at 降順で返す
- 各記事は `BlogPostMeta` 型で、以下のフィールドを持つ:
  - `title` -- フィードの item title
  - `slug` -- URL生成用 (`${BASE_URL}/blog/${slug}`)
  - `description` -- フィードの item description
  - `published_at` -- ISO 8601形式の日時文字列
  - `updated_at` -- 更新日
  - `tags` -- カテゴリタグ
  - `category` -- カテゴリ名

**サイト情報: `src/lib/constants.ts`**
- `SITE_NAME` = "yolos.net"
- `BASE_URL` = "https://yolos.net"

**既存の類似実装パターン:**
- `src/app/sitemap.ts` -- 同じく `getAllBlogPosts()` を使用してサイトマップ生成
- `src/app/ads.txt/route.ts` -- Route Handlerでテキスト返却するパターン

**記事本文について:**
- `getBlogPostBySlug(slug)` で `contentHtml` を取得可能だが、全記事のHTML取得はビルド時間に影響する可能性がある
- フィードにはdescription（概要）のみ含め、全文は含めない方が実装がシンプル

**ブログ記事数:** 現在22記事（`src/content/blog/` 配下にMarkdownファイル）

### 4. SEO/ディスカバビリティ

#### HTMLへのRSSフィード埋め込み

Next.jsの Metadata API の `alternates.types` を使用して、HTMLの`<head>`にRSSフィードのlinkタグを自動挿入可能。

**実装場所: `src/app/layout.tsx` の metadata オブジェクト**

```typescript
export const metadata: Metadata = {
  // 既存の設定...
  alternates: {
    types: {
      "application/rss+xml": "/feed",
      "application/atom+xml": "/feed/atom",
    },
  },
};
```

これにより以下のHTMLが自動生成される:
```html
<link rel="alternate" type="application/rss+xml" href="https://yolos.net/feed" />
<link rel="alternate" type="application/atom+xml" href="https://yolos.net/feed/atom" />
```

#### 検索エンジンへの通知

1. **sitemap.xml への追加は不要** -- RSSフィードURLはサイトマップに含める必要はない（サイトマップはHTML/コンテンツページ用）
2. **robots.txt への記載** -- `Sitemap:` ディレクティブの近くに記載するのが慣例だが必須ではない
3. **HTML linkタグ** -- 上記の alternates 設定が最も重要。ブラウザやフィードリーダーがこれを自動検出する
4. **Google Search Console** -- 特別な設定不要。Googleはlink alternateタグとsitemapから自動的にフィードを認識する

### 5. 実装提案のまとめ

**必要な作業:**
1. `feed` ライブラリをインストール (`npm install feed`)
2. `src/app/feed/route.ts` を作成 (RSS 2.0)
3. `src/app/feed/atom/route.ts` を作成 (Atom 1.0)（または `/atom.xml/route.ts`）
4. `src/app/layout.tsx` の metadata に alternates を追加
5. テストを作成

**推定工数:** 小規模。ライブラリ導入含め、実装は比較的シンプル。

**注意点:**
- 記事の全文をフィードに含めるかは要検討（description のみ推奨）
- フィードの最大件数の制限（例: 最新20件）
- ビルド時に静的生成されることの確認
