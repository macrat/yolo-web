# B-055: ディレクトリ構成整理 + i18n 設計ドキュメント

## 1. 概要

### 1.1 目的

サイトのコンテンツが増加し、類似コンテンツ（games/quiz、dictionary/colors/cheatsheets）が別々のディレクトリに分散している。
この設計は以下の2つの課題を同時に解決する:

1. **ディレクトリ構成の整理**: 類似コンテンツを論理的なカテゴリにまとめ、ユーザーの発見性と将来の拡張性を向上させる
2. **多言語対応(i18n)**: サブディレクトリ方式（`/ja/`, `/en/`）で国際化基盤を構築する

URL変更を伴うため、一度にまとめて実施することでリダイレクト設定の複雑さを最小限に抑える。

### 1.2 背景

- 現在13種類のトップレベルディレクトリ（tools, games, quiz, dictionary, colors, cheatsheets, blog, memos, about, feed）が存在
- `/quiz` と `/games` は「遊ぶ」という共通の目的を持つ
- `/dictionary`, `/colors`, `/cheatsheets` は「学ぶ・調べる」という共通の目的を持つ
- `/about` と `/memos` はプロジェクト情報として統合可能
- 現在のサイトは日本語のみで、`<html lang="ja">` がハードコードされている

### 1.3 技術スタック

- Next.js 16.1.6（App Router）
- `proxy.ts`（旧middleware.ts、Next.js 16で名称変更）
- 静的生成（`generateStaticParams`）を多用
- 現在middleware/proxyファイルは未使用

---

## 2. URL設計

### 2.1 新カテゴリ体系

| カテゴリ | パス            | 説明                                 |
| -------- | --------------- | ------------------------------------ |
| トップ   | `/{lang}`       | 言語別トップページ                   |
| ツール   | `/{lang}/tools` | 便利ツール全般                       |
| ゲーム   | `/{lang}/games` | ミニゲーム + クイズ・診断            |
| 学ぶ     | `/{lang}/learn` | 辞典・チートシートなど学習コンテンツ |
| ブログ   | `/{lang}/blog`  | ブログ記事                           |
| yolos    | `/{lang}/yolos` | プロジェクト説明・メモアーカイブ     |

### 2.2 完全なURLマッピング（旧URL -> 新URL）

#### ツール（変更: 言語プレフィックス追加のみ）

| 旧URL           | 新URL              |
| --------------- | ------------------ |
| `/tools`        | `/ja/tools`        |
| `/tools/[slug]` | `/ja/tools/[slug]` |

#### ゲーム（games + quiz の統合）

| 旧URL                            | 新URL                                             |
| -------------------------------- | ------------------------------------------------- |
| `/games`                         | `/ja/games`                                       |
| `/games/kanji-kanaru`            | `/ja/games/kanji-kanaru`                          |
| `/games/yoji-kimeru`             | `/ja/games/yoji-kimeru`                           |
| `/games/nakamawake`              | `/ja/games/nakamawake`                            |
| `/games/irodori`                 | `/ja/games/irodori`                               |
| `/quiz`                          | `/ja/games`（一覧ページ内にクイズセクション表示） |
| `/quiz/[slug]`                   | `/ja/games/quiz/[slug]`                           |
| `/quiz/[slug]/result/[resultId]` | `/ja/games/quiz/[slug]/result/[resultId]`         |

#### 学ぶ（dictionary + colors + cheatsheets の統合）

| 旧URL                                   | 新URL                                  |
| --------------------------------------- | -------------------------------------- |
| `/dictionary`                           | `/ja/learn`                            |
| `/dictionary/kanji`                     | `/ja/learn/kanji`                      |
| `/dictionary/kanji/[char]`              | `/ja/learn/kanji/[char]`               |
| `/dictionary/kanji/category/[category]` | `/ja/learn/kanji/category/[category]`  |
| `/dictionary/yoji`                      | `/ja/learn/yoji`                       |
| `/dictionary/yoji/[yoji]`               | `/ja/learn/yoji/[yoji]`                |
| `/dictionary/yoji/category/[category]`  | `/ja/learn/yoji/category/[category]`   |
| `/colors`                               | `/ja/learn/colors`                     |
| `/colors/[slug]`                        | `/ja/learn/colors/[slug]`              |
| `/colors/category/[category]`           | `/ja/learn/colors/category/[category]` |
| `/cheatsheets`                          | `/ja/learn/cheatsheets`                |
| `/cheatsheets/[slug]`                   | `/ja/learn/cheatsheets/[slug]`         |

#### ブログ（変更: 言語プレフィックス追加のみ）

| 旧URL                       | 新URL                          |
| --------------------------- | ------------------------------ |
| `/blog`                     | `/ja/blog`                     |
| `/blog/[slug]`              | `/ja/blog/[slug]`              |
| `/blog/category/[category]` | `/ja/blog/category/[category]` |

#### yolos（about + memos の統合）

| 旧URL                | 新URL                         |
| -------------------- | ----------------------------- |
| `/about`             | `/ja/yolos`                   |
| `/memos`             | `/ja/yolos/memos`             |
| `/memos/[id]`        | `/ja/yolos/memos/[id]`        |
| `/memos/thread/[id]` | `/ja/yolos/memos/thread/[id]` |

#### トップページ

| 旧URL | 新URL                          |
| ----- | ------------------------------ |
| `/`   | `/ja`（日本語）, `/en`（英語） |

#### その他（言語に依存しないパス — 変更なし）

| パス           | 扱い                                 |
| -------------- | ------------------------------------ |
| `/feed`        | 変更なし（言語別フィードは将来検討） |
| `/feed/atom`   | 変更なし                             |
| `/sitemap.xml` | 多言語URLに更新                      |
| `/robots.txt`  | 変更なし                             |
| `/ads.txt`     | 変更なし                             |

---

## 3. 技術設計

### 3.1 ディレクトリ構造

```
src/
  proxy.ts                     # 言語未指定URLのリダイレクト
  app/
    (root)/                    # ルートグループ（言語なしのページ用）
      layout.tsx               # 最小限のルートレイアウト（<html lang="ja"><body>、グローバルCSS）
      page.tsx                 # ルート（/）→ デフォルト言語のコンテンツを直接表示
      not-found.tsx            # 404ページ
    sitemap.ts                 # 多言語対応サイトマップ
    robots.ts                  # 変更なし
    feed/                      # 変更なし
    [lang]/
      layout.tsx               # ルートレイアウト（<html lang={lang}><body>、Header, Footer, hreflang）
      page.tsx                 # トップページ
      not-found.tsx            # 言語別404ページ
      dictionaries.ts          # getDictionary関数
      tools/
        page.tsx               # ツール一覧
        [slug]/
          page.tsx             # 個別ツール
      games/
        page.tsx               # ゲーム一覧（ミニゲーム + クイズ統合表示）
        kanji-kanaru/
          page.tsx
        yoji-kimeru/
          page.tsx
        nakamawake/
          page.tsx
        irodori/
          page.tsx
        quiz/
          [slug]/
            page.tsx           # 個別クイズ
            result/
              [resultId]/
                page.tsx       # クイズ結果
      learn/
        page.tsx               # 学習コンテンツ一覧（辞典 + チートシート）
        kanji/
          page.tsx             # 漢字辞典一覧
          [char]/
            page.tsx
          category/
            [category]/
              page.tsx
        yoji/
          page.tsx             # 四字熟語辞典一覧
          [yoji]/
            page.tsx
          category/
            [category]/
              page.tsx
        colors/
          page.tsx             # 伝統色辞典一覧
          [slug]/
            page.tsx
          category/
            [category]/
              page.tsx
        cheatsheets/
          page.tsx             # チートシート一覧
          [slug]/
            page.tsx
      blog/
        page.tsx               # ブログ一覧
        [slug]/
          page.tsx
        category/
          [category]/
            page.tsx
      yolos/
        page.tsx               # プロジェクト説明（旧about）
        memos/
          page.tsx             # メモ一覧
          [id]/
            page.tsx
          thread/
            [id]/
              page.tsx
  dictionaries/
    ja.json                    # 日本語UI辞書
    en.json                    # 英語UI辞書
```

### 3.2 proxy.ts の設計

`src/proxy.ts` を新規作成する。役割は **言語プレフィックスのないURLへのアクセスに対してデフォルト言語へリダイレクトを行う** こと。

**重要な設計判断: 言語未指定URLの振る舞い**

Googleは言語ベースの自動リダイレクトを明確に非推奨としている:

> "Avoid automatically redirecting users from one language version of a site to a different language version of a site."

Googleのクローラーは通常USから発信され、Accept-Languageヘッダーを送信しない。自動リダイレクトを行うと、クローラーが特定言語版しかインデックスしないリスクがある。

**採用方式: デフォルト言語コンテンツの直接表示（推奨方式）**

言語未指定URL（例: `/tools`）にアクセスした場合、リダイレクトせずにデフォルト言語（日本語）のコンテンツを直接表示する。具体的には:

1. **proxy.ts**: 言語プレフィックスのないURLへのリクエストをrewriteで `/{defaultLocale}/{path}` に内部転送する（リダイレクトではない）
2. **言語切り替えバナー**: 言語未指定URLで表示されるページ上部に、他の言語版への切り替えバナーを表示する
3. **hreflang x-default**: 言語未指定URL（例: `/tools`）を `x-default` として設定する
4. **ユーザーの手動選択**: ユーザーが明示的に言語を選択した場合はCookieに保存し、以降はその選択に従って302リダイレクトする

この方式の利点:

- Google公式推奨に準拠（自動リダイレクトを回避）
- クローラーがデフォルト言語のコンテンツを直接取得可能
- x-defaultのURLで実際のコンテンツが表示される（空ページやリダイレクトループのリスクなし）
- アクセシビリティ上も適切（言語未指定=デフォルト言語のコンテンツが返る）

```
処理フロー:
1. パスが既にロケールプレフィックスを持つ → スキップ（return なし、NextResponse.next()を返さない）
2. 静的ファイル等（_next, api, favicon.ico, sitemap.xml, robots.txt, feed, ads.txt） → matcherで除外
3. Cookieに言語設定がある → その言語に302リダイレクト
4. Cookieがない → rewrite で /{defaultLocale}/{path} に内部転送（URLは変わらない）
```

matcherの設定（Next.js公式パターンに準拠）:

```
matcher: ['/((?!_next|api|feed|ads\\.txt|sitemap\\.xml|robots\\.txt|favicon\\.ico).*)']
```

**注意**: 実行順序は `next.config.ts` の redirects → proxy.ts の順であるため、旧URL→新URLの301リダイレクトは `next.config.ts` で先に処理される。proxy.tsは言語プレフィックスなしの新URLパターン（該当するものがある場合）のみを処理する。

**代替案（不採用）: 302リダイレクト方式**

Accept-Languageヘッダーに基づく302リダイレクトも検討したが、以下の理由で不採用とした:

- Googleが自動リダイレクト自体を非推奨としている（301/302を問わない）
- Googleクローラーは通常Accept-Languageヘッダーを送信しないため、デフォルト言語にリダイレクトされる
- リダイレクトを挟むことでレイテンシが増加する
- x-defaultのURLがリダイレクト先を持つため、SEO上の不確実性がある

### 3.3 辞書（翻訳）システムの設計

Next.js公式推奨パターンに従い、JSONベースの自前実装を採用する。

**ライブラリ選定判断:** next-intl等の外部ライブラリは現時点では不要。現在のサイト規模（UIラベルの翻訳が主）ではNext.js公式パターンで十分であり、外部依存を増やさない方が保守性が高い。翻訳規模が大きくなった段階で再検討する。

#### 辞書ファイル構造

```
src/dictionaries/
  ja.json
  en.json
```

辞書JSONは以下のようなネスト構造:

```json
{
  "common": {
    "siteName": "yolos.net",
    "siteDescription": "AIエージェントが企画・開発・運営するWebサイト",
    "aiDisclaimer": "このサイトはAIによる実験的プロジェクトです...",
    "nav": {
      "home": "ホーム",
      "tools": "ツール",
      "games": "ゲーム",
      "learn": "学ぶ",
      "blog": "ブログ",
      "yolos": "yolosについて"
    }
  },
  "tools": {
    "title": "無料オンラインツール",
    "description": "..."
  },
  "games": {
    "title": "ゲーム & クイズ",
    "daily": "今日のデイリーパズル",
    "quiz": "クイズ・診断"
  },
  "learn": {
    "title": "学ぶ",
    "kanji": "漢字辞典",
    "yoji": "四字熟語辞典",
    "colors": "伝統色辞典",
    "cheatsheets": "チートシート"
  }
}
```

#### getDictionary関数

```
src/app/[lang]/dictionaries.ts
```

`server-only` を使って Server Component でのみインポート可能にする。
動的インポート（`import()`）を使い、使われない言語の辞書がバンドルに含まれないようにする。

Next.js 16公式ドキュメントに準拠した実装パターン:

```typescript
import "server-only";

const dictionaries = {
  ja: () => import("./dictionaries/ja.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
```

#### 対応言語定義

```
src/lib/i18n.ts
```

以下を一元管理する:

- `SUPPORTED_LOCALES`: サポートする言語コードの配列 `["ja", "en"]`
- `DEFAULT_LOCALE`: デフォルト言語 `"ja"`
- `Locale` 型: `"ja" | "en"`
- `isValidLocale(lang: string): lang is Locale` 型ガード関数

**注意:** `dictionaries.ts` の `Locale` 型と `i18n.ts` の `Locale` 型は一致させる。SEOヘルパー関数群が受け取る `lang` パラメータの型も `i18n.ts` の `Locale` 型で統一する。

### 3.4 hreflang実装方針

**HTMLタグ方式 + サイトマップ方式の併用** を採用する。

#### HTMLタグ（`<head>` 内）

`src/app/[lang]/layout.tsx` の `metadata` 設定で `alternates.languages` を使って自動生成:

```
各ページのメタデータで以下を出力:
<link rel="alternate" hreflang="ja" href="https://yolos.net/ja/tools" />
<link rel="alternate" hreflang="en" href="https://yolos.net/en/tools" />
<link rel="alternate" hreflang="x-default" href="https://yolos.net/tools" />
```

必須ルール:

- **双方向リンク**: jaページからenを参照し、enページからjaも参照する
- **完全修飾URL**: `https://yolos.net/ja/tools` の形式
- **自己参照**: 各ページは自分自身のhreflangも含める
- **x-default**: 言語未指定URL（デフォルト言語コンテンツの直接表示先）を指定

#### サイトマップでのhreflang

`src/app/sitemap.ts` を更新し、Next.jsの `MetadataRoute.Sitemap` 型の `alternates.languages` プロパティを使ってhreflang情報を出力する。

Next.jsの `sitemap()` 関数の返り値型は各エントリに `alternates` プロパティを持っており、これを使うことで `xhtml:link` 要素が自動的に生成される:

```typescript
import type { MetadataRoute } from "next";

const BASE_URL = "https://yolos.net";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/ja/tools`,
      lastModified: new Date(),
      alternates: {
        languages: {
          ja: `${BASE_URL}/ja/tools`,
          en: `${BASE_URL}/en/tools`,
          "x-default": `${BASE_URL}/tools`,
        },
      },
    },
    // ... 他のエントリも同様
  ];
}
```

これにより以下のXMLが自動生成される:

```xml
<url>
  <loc>https://yolos.net/ja/tools</loc>
  <xhtml:link rel="alternate" hreflang="ja" href="https://yolos.net/ja/tools" />
  <xhtml:link rel="alternate" hreflang="en" href="https://yolos.net/en/tools" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://yolos.net/tools" />
</url>
```

#### canonical設定

各言語版のページは **同一言語内の** canonicalを設定する:

- `/ja/tools` の canonical → `https://yolos.net/ja/tools`
- `/en/tools` の canonical → `https://yolos.net/en/tools`
- 異なる言語のcanonicalを指してはならない

### 3.5 リダイレクト設計

#### 旧URL → 新URL の301リダイレクト（next.config.ts）

`next.config.ts` の `redirects()` で設定する。理由:

- 実行順序が proxy.ts より先（next.config.ts の redirects → proxy.ts の順）
- パフォーマンスが良好
- 宣言的で管理しやすい

```typescript
// next.config.ts に追加するリダイレクトルール
async redirects() {
  return [
    // Tools
    { source: "/tools", destination: "/ja/tools", permanent: true },
    { source: "/tools/:slug", destination: "/ja/tools/:slug", permanent: true },

    // Games
    { source: "/games", destination: "/ja/games", permanent: true },
    { source: "/games/:slug", destination: "/ja/games/:slug", permanent: true },

    // Quiz -> Games/quiz
    { source: "/quiz", destination: "/ja/games", permanent: true },
    { source: "/quiz/:slug", destination: "/ja/games/quiz/:slug", permanent: true },
    { source: "/quiz/:slug/result/:resultId", destination: "/ja/games/quiz/:slug/result/:resultId", permanent: true },

    // Dictionary -> Learn
    { source: "/dictionary", destination: "/ja/learn", permanent: true },
    { source: "/dictionary/kanji", destination: "/ja/learn/kanji", permanent: true },
    { source: "/dictionary/kanji/:char", destination: "/ja/learn/kanji/:char", permanent: true },
    { source: "/dictionary/kanji/category/:cat", destination: "/ja/learn/kanji/category/:cat", permanent: true },
    { source: "/dictionary/yoji", destination: "/ja/learn/yoji", permanent: true },
    { source: "/dictionary/yoji/:yoji", destination: "/ja/learn/yoji/:yoji", permanent: true },
    { source: "/dictionary/yoji/category/:cat", destination: "/ja/learn/yoji/category/:cat", permanent: true },

    // Colors -> Learn/colors
    { source: "/colors", destination: "/ja/learn/colors", permanent: true },
    { source: "/colors/:slug", destination: "/ja/learn/colors/:slug", permanent: true },
    { source: "/colors/category/:cat", destination: "/ja/learn/colors/category/:cat", permanent: true },

    // Cheatsheets -> Learn/cheatsheets
    { source: "/cheatsheets", destination: "/ja/learn/cheatsheets", permanent: true },
    { source: "/cheatsheets/:slug", destination: "/ja/learn/cheatsheets/:slug", permanent: true },

    // Blog
    { source: "/blog", destination: "/ja/blog", permanent: true },
    { source: "/blog/:slug", destination: "/ja/blog/:slug", permanent: true },
    { source: "/blog/category/:cat", destination: "/ja/blog/category/:cat", permanent: true },

    // About -> Yolos
    { source: "/about", destination: "/ja/yolos", permanent: true },

    // Memos -> Yolos/memos
    { source: "/memos", destination: "/ja/yolos/memos", permanent: true },
    { source: "/memos/:id", destination: "/ja/yolos/memos/:id", permanent: true },
    { source: "/memos/thread/:id", destination: "/ja/yolos/memos/thread/:id", permanent: true },
  ];
}
```

**注意事項:**

- すべて `permanent: true`（301リダイレクト）を使用。旧URL→新URL（カテゴリ変更含む）は恒久的な変更であるため
- 301/302ともにPageRankの損失はないことがGoogleにより確認済み
- リダイレクトは **最低1年間** 維持する
- リダイレクトチェーンが発生しないよう注意する（旧URL → 新URL の1ホップのみ）

**注意:** 旧URLからの301リダイレクトは `next.config.ts` の `redirects()` で処理されるため、proxy.tsより先に実行される。したがって proxy.ts の rewrite が旧URLに対して発動することはない。proxy.ts が処理するのは、言語プレフィックスなしの **新URLパターン** へのアクセスのみ（例: `/tools` → rewrite → `/ja/tools`）。ただし、旧URLの301リダイレクト先は `/ja/tools` であるため、301リダイレクトで処理されたあと `/ja/tools` にアクセスが来る。この場合は `[lang]` プレフィックスが既にあるため proxy.ts はスキップする。

### 3.6 ルートレイアウトの再設計

Next.js 16公式i18nドキュメントの推奨パターンに従い、`app/[lang]/layout.tsx` をルートレイアウトとして設計する。

#### 公式推奨パターン

Next.js公式ドキュメント（Internationalization > Static Rendering セクション）では以下のパターンが明示されている:

```typescript
// app/[lang]/layout.tsx
export async function generateStaticParams() {
  return [{ lang: 'ja' }, { lang: 'en' }]
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  return (
    <html lang={(await params).lang}>
      <body>{children}</body>
    </html>
  )
}
```

このパターンにより:

- `<html lang>` 属性がページの実際の言語に応じて動的に設定される
- 英語ページでは `<html lang="en">`、日本語ページでは `<html lang="ja">` が正しく出力される
- アクセシビリティ上の問題（スクリーンリーダーが誤った言語で読み上げるリスク）が解消される
- `LayoutProps<'/[lang]'>` 型ヘルパーにより型安全にルートパラメータを取得できる

#### レイアウト構成

**`app/[lang]/layout.tsx`（ルートレイアウト）:**

```
役割:
- <html lang={lang}> と <body> の配置（言語属性を動的に設定）
- グローバルCSS（globals.css）のインポート
- GoogleAnalytics の配置
- Header / Footer の配置（lang を props として渡す）
- JSON-LD 構造化データの配置
- hreflang メタデータの設定（alternates.languages）
- generateStaticParams で全サポート言語の静的パラメータを生成
```

**`app/(root)/layout.tsx`（言語なしページ用レイアウト）:**

言語プレフィックスのないURLで直接表示するページ（`/` のトップページ等）用のルートグループ。proxy.ts の rewrite で `app/[lang]/` 配下に内部転送される場合はこのレイアウトは使われない。

```
役割:
- <html lang="ja"> と <body> の配置（デフォルト言語）
- グローバルCSS のインポート
- 最小限のシェルとして機能
```

**`app/(root)/page.tsx`:**

ルート `/` へのアクセス時に表示するページ。proxy.ts の rewrite により `/ja` のコンテンツが内部転送されるため、通常はこのページに到達しない。フォールバックとして、デフォルト言語のトップページへの302リダイレクトを行う。

#### 言語の検証

`app/[lang]/layout.tsx` 内で `hasLocale()` を使い、サポートされていない言語コードの場合は `notFound()` を呼ぶ:

```typescript
import { notFound } from 'next/navigation'
import { hasLocale } from './dictionaries'

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  return (
    <html lang={lang}>
      <body>
        <Header lang={lang} />
        <main>{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  )
}
```

#### 各ページでの型ヘルパーの活用

Next.js 16 では `PageProps` と `LayoutProps` がグローバルに利用可能な型ヘルパーとして提供されている。各ページでこれらを活用する:

```typescript
// app/[lang]/tools/page.tsx
export default async function ToolsPage({
  params,
}: PageProps<"/[lang]/tools">) {
  const { lang } = await params;
  // ...
}

// app/[lang]/tools/[slug]/page.tsx
export default async function ToolPage({
  params,
}: PageProps<"/[lang]/tools/[slug]">) {
  const { lang, slug } = await params;
  // ...
}
```

### 3.7 Header / Footer の多言語対応

現在の `Header.tsx` にハードコードされている NAV_LINKS を辞書から読み込むように変更する。

```
変更前: const NAV_LINKS = [{ href: "/", label: "ホーム" }, ...]
変更後: getDictionary(lang) から取得したラベルを使用
```

Header と Footer を Server Component のまま維持し、`lang` を props として受け取る。
リンク先のパスにも `/{lang}/` プレフィックスを付与する。

### 3.8 generateStaticParams の更新

`[lang]/layout.tsx` でサポート言語の静的パラメータを生成:

```
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}
```

各ページの既存の `generateStaticParams` は `lang` パラメータを追加する。例:

```
// tools/[slug]/page.tsx
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    allToolMetas.map((meta) => ({ lang, slug: meta.slug }))
  );
}
```

### 3.9 SEOヘルパー関数の更新

`src/lib/seo.ts` 内の全関数を更新し、`lang` パラメータを受け取るようにする。

変更点:

- URL生成に `/{lang}/` プレフィックスを含める
- `alternates.languages` にhreflang情報を含める
- `inLanguage` を動的に設定する
- `canonical` を現在の言語版のURLに設定する
- `lang` パラメータの型は `src/lib/i18n.ts` の `Locale` 型で統一する

### 3.10 フィード（RSS/Atom）の対応

**フェーズ1では変更なし。** 現在の `/feed` と `/feed/atom` はそのまま維持する。

将来的に `/ja/feed`, `/en/feed` の言語別フィードを提供することを検討するが、優先度は低い。理由:

- RSSリーダーのユーザーは限定的
- フィードのURLを変更するとRSS購読者に影響がある
- フェーズ3（英語版追加）の際にあわせて検討する

**注意:** フィードURL自体は変更しないが、フィード内のコンテンツURL（記事へのリンク等）は新パスに更新する必要がある。例えば、フィード内の `/blog/[slug]` へのリンクは `/ja/blog/[slug]` に更新する。これを移行チェックリスト（セクション6.2）に含める。

---

## 4. コンテンツ分類

### 4.1 現在のコンテンツ棚卸し

| 現在のパス                 | 種別           | 件数     |
| -------------------------- | -------------- | -------- |
| `/tools/[slug]`            | 便利ツール     | 約30種類 |
| `/games/kanji-kanaru`      | デイリーパズル | 1        |
| `/games/yoji-kimeru`       | デイリーパズル | 1        |
| `/games/nakamawake`        | デイリーパズル | 1        |
| `/games/irodori`           | デイリーパズル | 1        |
| `/quiz/kanji-level`        | 診断クイズ     | 1        |
| `/quiz/traditional-color`  | 診断クイズ     | 1        |
| `/dictionary/kanji/[char]` | 漢字辞典       | 80字     |
| `/dictionary/yoji/[yoji]`  | 四字熟語辞典   | 101語    |
| `/colors/[slug]`           | 伝統色辞典     | 250色    |
| `/cheatsheets/[slug]`      | チートシート   | 3種類    |
| `/blog/[slug]`             | ブログ記事     | 25記事   |
| `/memos/[id]`              | メモアーカイブ | 多数     |
| `/about`                   | サイト概要     | 1        |

### 4.2 新カテゴリへの割り当て

#### `/{lang}/tools` — 便利ツール

現在の `/tools/[slug]` の全30種類をそのまま移行。変更なし（パスプレフィックスの追加のみ）。

#### `/{lang}/games` — ゲーム & クイズ

`/games/*` と `/quiz/*` を統合。一覧ページでは以下のカテゴリで分けて表示:

- **デイリーパズル**: kanji-kanaru, yoji-kimeru, nakamawake, irodori
- **診断クイズ**: kanji-level, traditional-color, 将来の追加分

統合の根拠: 「遊ぶ・楽しむ」という共通のユーザー目的を持つ。一箇所にまとめることで発見性が向上する。

#### `/{lang}/learn` — 学習コンテンツ

`/dictionary/*`, `/colors/*`, `/cheatsheets/*` を統合。一覧ページではサブカテゴリで表示:

- **漢字辞典**: `/learn/kanji/...`（80字）
- **四字熟語辞典**: `/learn/yoji/...`（101語）
- **伝統色辞典**: `/learn/colors/...`（250色）
- **チートシート**: `/learn/cheatsheets/...`（3種類）

統合の根拠: 「学ぶ・調べる」という共通のユーザー目的を持つ。辞典とチートシートは異なるジャンルだが、「知識を得る」という意味で共通する。

#### `/{lang}/blog` — ブログ

変更なし（パスプレフィックスの追加のみ）。既存のカテゴリ機能を維持。

#### `/{lang}/yolos` — プロジェクト情報

`/about` と `/memos/*` を統合。

- トップページ（`/yolos`）: 現在の `/about` の内容 + プロジェクト概要
- メモアーカイブ（`/yolos/memos/...`）: 現在の `/memos/*` の内容
- 将来: スキル一覧、ワークフロー解説ページの追加が可能

---

## 5. 一覧ページの設計

### 5.1 共通方針

すべての一覧ページで以下の機能を提供する:

- **カテゴリフィルター**: コンテンツの種別や目的でフィルタリング
- **ページング**: コンテンツ数が多い場合にページ分割（URLパラメータ `?page=2` 方式）
- **検索**: テキスト検索（クライアントサイドフィルター、Server Component のまま維持できる範囲で）

### 5.2 各一覧ページの設計

#### `/ja/tools` — ツール一覧

- **カテゴリ**: テキスト系、変換系、開発者系、画像系、計算系 等
- **表示**: グリッドレイアウト（現在の ToolsGrid コンポーネントを拡張）
- **検索**: ツール名・説明文でのフィルタリング
- **ページング**: 現時点では30種類程度なので不要。50種類を超えた場合に導入

#### `/ja/games` — ゲーム & クイズ一覧

- **セクション分割**: 「デイリーパズル」と「診断クイズ」のセクションに分離
- **表示**: カード形式（現在の games/page.tsx のスタイルを踏襲）
- **ページング**: 不要（コンテンツ数が少ない）

#### `/ja/learn` — 学習コンテンツ一覧

- **カテゴリ**: 漢字辞典 / 四字熟語辞典 / 伝統色辞典 / チートシート
- **表示**: セクションごとにカード表示（現在の dictionary/page.tsx のスタイルを拡張）
- **各サブ一覧**: 個別の一覧ページ（`/learn/kanji`, `/learn/yoji` 等）に既存の検索・カテゴリ機能を維持

#### `/ja/learn/cheatsheets` — チートシート一覧（少数コンテンツ対応）

チートシートは現在3種類と少数のため、空白感が出ないUI設計を採用する:

- **カードサイズ**: 通常の一覧ページより大きなカードを使用し、各チートシートの概要と特徴を詳しく表示する
- **説明文の充実**: カード内に単なるタイトルだけでなく、「このチートシートで学べること」「対象者」「含まれるトピック数」などの情報を表示する
- **視覚的な補強**: アイコンやイラストを活用し、少数でも情報量のあるレイアウトにする
- **成長性の表示**: 「今後追加予定のチートシート」セクションや、リクエストフォームへのリンクを設けて、ページに将来性を持たせる

同様の方針は `/ja/games` の診断クイズセクション（現在2種類）にも適用する。コンテンツ数が10を超えた時点で通常サイズのカードに切り替える。

#### `/ja/blog` — ブログ一覧

- 既存の機能を維持（カテゴリ別、時系列順）
- 変更なし

#### `/ja/yolos/memos` — メモ一覧

- 既存の機能を維持（スレッドビュー、ロール別フィルター、ページング）
- 変更なし

---

## 6. 移行計画

### 6.1 フェーズ概要

| フェーズ | 内容                                                   | 工数目安           |
| -------- | ------------------------------------------------------ | ------------------ |
| 1        | i18nインフラ構築 + ディレクトリ構成整理 + 日本語版完成 | 大                 |
| 2        | SEO移行完了（リダイレクト・サイトマップ・hreflang）    | 中                 |
| 3        | 英語版追加                                             | 大（翻訳工数含む） |

### 6.2 フェーズ1: i18nインフラ + ディレクトリ整理

**目標:** 新しいURL構造で日本語版が完全に動作する状態にする。

#### 手順

1. **i18n基盤の作成**
   - `src/lib/i18n.ts` を作成（言語定義、型、バリデーション）
   - `src/dictionaries/ja.json` を作成（UIラベルの日本語版）
   - `src/dictionaries/en.json` を作成（UIラベルの英語版 — 最低限のプレースホルダー）
   - `src/app/[lang]/dictionaries.ts` を作成（getDictionary関数）
   - `npm install server-only` を実行（辞書システムのサーバー専用制約に必要）

2. **レイアウトの再構築**
   - `src/app/[lang]/layout.tsx` をルートレイアウトとして作成（`<html lang={lang}><body>`、Header, Footer, 辞書提供）
   - `src/app/(root)/layout.tsx` を作成（言語なしページ用の最小限レイアウト）
   - Header / Footer を言語対応に更新（`lang` props を受け取る）
   - `LayoutProps<'/[lang]'>` と `PageProps<'/[lang]/...'>` 型ヘルパーを活用する

3. **ページの移動**
   - 全既存ページを `src/app/[lang]/` 配下に移動
   - ディレクトリ構成の変更を実施（quiz→games/quiz, dictionary→learn, colors→learn/colors, cheatsheets→learn/cheatsheets, about→yolos, memos→yolos/memos）
   - 各ページの内部リンクを新パスに更新
   - `generateStaticParams` に `lang` パラメータを追加

4. **proxy.ts の作成**
   - `src/proxy.ts` を作成
   - 言語未指定URLのrewrite（デフォルト言語への内部転送）
   - Cookie による言語選択済みユーザーの302リダイレクト

5. **テストの更新**
   - 既存テストを新パス構造に合わせて更新
   - proxy.ts のユニットテスト追加

6. **内部リンクの検証**
   - grepによる旧パス残留チェック（セクション8.1参照）を実施
   - フィード内のコンテンツURLを新パスに更新

#### 成果物

- 新URL構造で全ページが表示できる
- `/{lang}/` プレフィックス付きのURLでアクセスできる
- 言語未指定URLでデフォルト言語のコンテンツが直接表示される
- Header/Footerが言語対応ナビゲーションを表示する

#### チェックポイント

- [ ] `npm run build` が成功する
- [ ] `npm test` が通る
- [ ] 全ページが `/ja/` プレフィックスでアクセスできる
- [ ] proxy.ts が言語未指定URLをrewriteでデフォルト言語コンテンツに内部転送する
- [ ] Header/Footerのリンクが新パスを指している
- [ ] 旧パスのハードコードがコードベースに残っていないこと（grepチェック済み）
- [ ] フィード内の記事URLが新パスに更新されていること

### 6.3 フェーズ2: SEO移行

**目標:** 旧URLからのリダイレクトを完備し、検索エンジンに新URL構造を正しく伝える。

#### 手順

1. **リダイレクト設定**
   - `next.config.ts` にセクション3.5の全リダイレクトルールを追加
   - リダイレクトチェーンが発生していないことを確認

2. **サイトマップの更新**
   - `src/app/sitemap.ts` を多言語URL対応に更新
   - 各エントリに `alternates.languages` でhreflang情報を追加（セクション3.4のパターンに従う）
   - フェーズ3で英語版が追加されるまでは日本語のみだが、構造は多言語対応にしておく

3. **メタデータの更新**
   - `src/lib/seo.ts` の全関数を更新
   - 各ページの `canonical` を新URLに設定
   - `alternates.languages` でhreflang出力

4. **構造化データの更新**
   - JSON-LD の URL を新パスに更新
   - `inLanguage` を動的に設定

5. **Google Search Console 対応**
   - 新サイトマップの送信
   - インデックス状況の監視

#### 成果物

- 旧URLが全て新URLに301リダイレクトされる
- サイトマップが新URL構造を反映している
- 全ページに正しいcanonical, hreflang が設定されている

#### チェックポイント

- [ ] 旧URLにアクセスすると新URLに301リダイレクトされる
- [ ] リダイレクトチェーンがない（1ホップで完了）
- [ ] サイトマップが新URL構造を反映している
- [ ] サイトマップに `alternates.languages` が正しく設定されている
- [ ] 各ページのcanonicalが正しい
- [ ] robots.txt の sitemap URL が正しい

### 6.4 フェーズ3: 英語版追加

**目標:** 英語版のコンテンツを追加し、完全な多言語サイトにする。

#### 手順

1. **英語版UIラベルの完成**
   - `src/dictionaries/en.json` の全ラベルを翻訳

2. **英語版コンテンツの作成（優先度順）**
   - 高: UIラベル（ナビゲーション、ヘッダー/フッター、ボタンテキスト）
   - 高: ツールページ（UIのみの翻訳で機能はそのまま使える）
   - 中: ブログ記事（人気記事から順次、単なる翻訳ではなく英語圏向けの補足・調整を含む）
   - 低: 漢字・四字熟語辞典（日本語固有コンテンツ、英語版では解説を充実）
   - 低: ゲーム（日本語コンテンツに依存、英語向けは別テーマも検討）

3. **hreflangの完全実装**
   - 全ページに日英双方向のhreflangを追加
   - x-default を `/tools` 等の言語未指定URLに設定

4. **言語切り替えUI**
   - 各ページに言語切り替えリンクを配置
   - ユーザーの言語選択をCookieに保存

5. **サイトマップの更新**
   - 英語版URLを追加
   - hreflang情報を全エントリに追加

#### 成果物

- `/en/` プレフィックスで英語版全ページにアクセスできる
- 日英双方向のhreflangが正しく設定されている
- 言語切り替えUIが全ページに表示される

#### チェックポイント

- [ ] `/en/` で英語版全ページが表示できる
- [ ] hreflangが双方向で正しく設定されている
- [ ] x-default が正しく設定されている
- [ ] 言語切り替えUIが機能する
- [ ] Google Search Console で多言語ページが認識されている

### 6.5 フェーズの統合について

**フェーズ1と2は実装上分離しにくいため、1つの大きな作業として同時に実施することを推奨する。** リダイレクト設定なしにデプロイすると既存URLが404になってしまうため、ページの移動とリダイレクト設定は必ず同時にデプロイする。

実際の実装単位としては:

- **作業単位A**: i18n基盤 + レイアウト再構築（フェーズ1の手順1-2）
- **作業単位B**: ページ移動 + ディレクトリ整理 + リダイレクト + SEO更新（フェーズ1の手順3-6 + フェーズ2の全体）
- **作業単位C**: 英語版追加（フェーズ3の全体）

作業単位Bは大きいが、これ以上分割するとデプロイ時に壊れるURLが発生するリスクがある。

---

## 7. リスクと対策

### 7.1 SEOへの影響

| リスク                              | 影響度 | 対策                                                                       |
| ----------------------------------- | ------ | -------------------------------------------------------------------------- |
| URL変更による一時的なランキング低下 | 中     | 全旧URLに301リダイレクトを設定。Googleによれば中規模サイトで数週間で回復   |
| リダイレクトチェーンの発生          | 中     | next.config.tsの redirects で一元管理し、旧URL→新URLの1ホップに限定        |
| canonicalの設定ミス                 | 高     | テストで全ページのcanonicalを検証。異なる言語のcanonicalを指さないよう注意 |
| hreflangの双方向リンク漏れ          | 中     | テストで全ページのhreflang相互参照を検証                                   |
| サイトマップの不整合                | 低     | ビルド時に自動生成するため、コードが正しければ不整合は発生しない           |

### 7.2 技術的リスク

| リスク                                        | 影響度 | 対策                                                                                                              |
| --------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| ビルド時間の増加（言語数 x ページ数）         | 中     | フェーズ1では日本語のみなので影響なし。フェーズ3で英語追加時にビルド時間を計測し、必要に応じてISRを検討           |
| `[lang]` パラメータの追加による全ページの変更 | 高     | 段階的に移行せず一括で変更する。中途半端な状態は避ける                                                            |
| proxy.ts の静的エクスポートとの互換性         | 高     | Next.js 16のproxy.tsは静的エクスポート非対応だが、現在のデプロイ方式がNode.jsサーバーであれば問題なし。確認が必要 |
| 内部リンクの更新漏れ                          | 中     | ビルド後のリンク切れチェックを実施。grepで旧パスの残留を検出（セクション8.1参照）                                 |

### 7.3 ユーザー影響

| リスク                                   | 影響度 | 対策                                                                           |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| ブックマークしたURLが変わる              | 低     | 301リダイレクトにより自動的に新URLへ遷移。ユーザーへの影響は最小限             |
| 共有されたURLの無効化                    | 低     | 301リダイレクトを最低1年維持                                                   |
| ゲームの進捗データの消失（localStorage） | 中     | localStorageはドメイン単位のため影響なし。パスの変更はlocalStorageに影響しない |

### 7.4 デプロイ戦略

- **一括デプロイ**: フェーズ1+2の変更は一括でデプロイする。部分的なデプロイは404を生む
- **ロールバック計画**: 問題発生時にgit revertで元に戻せるようにする
- **事前テスト**: ステージング環境でリダイレクトと全ページの表示を確認
- **監視**: デプロイ後24時間はGoogle Search Consoleとアクセスログを重点監視

---

## 8. 実装時の注意事項

### 8.1 内部リンクの更新

現在のコードベースに散在する内部リンク（`/tools/`, `/games/`, `/blog/` 等）を全て更新する必要がある。主な対象:

- `src/app/page.tsx`（トップページの各種リンク）
- `src/components/common/Header.tsx`（ナビゲーションリンク）
- `src/app/[lang]/` 配下の各ページ内リンク
- `src/lib/seo.ts`（URL生成）
- `src/app/sitemap.ts`（サイトマップURL）
- 各コンポーネント内のハードコードされたパス

リンクのヘルパー関数を作成することを推奨:

```typescript
// src/lib/i18n.ts
export function localePath(lang: Locale, path: string): string {
  return `/${lang}${path}`;
}
```

#### 旧パス残留チェック

移行後に旧パスがコードベースに残っていないことを検証するため、以下のgrepコマンドを実行する:

```bash
# 旧パスのハードコードされたリンクを検出
grep -rn '"/tools' --include='*.tsx' --include='*.ts' src/
grep -rn '"/games' --include='*.tsx' --include='*.ts' src/
grep -rn '"/quiz' --include='*.tsx' --include='*.ts' src/
grep -rn '"/dictionary' --include='*.tsx' --include='*.ts' src/
grep -rn '"/colors' --include='*.tsx' --include='*.ts' src/
grep -rn '"/cheatsheets' --include='*.tsx' --include='*.ts' src/
grep -rn '"/blog' --include='*.tsx' --include='*.ts' src/
grep -rn '"/about' --include='*.tsx' --include='*.ts' src/
grep -rn '"/memos' --include='*.tsx' --include='*.ts' src/
```

検出された結果を確認し、以下のいずれかであることを検証する:

- `localePath()` ヘルパー関数経由のパス生成（OK）
- `next.config.ts` の `redirects()` 内のソースパス定義（OK）
- テストコード内のリダイレクト検証（OK）
- それ以外のハードコードされたパス（要修正）

### 8.2 テスト方針

- 既存テストを新パス構造に合わせて更新
- proxy.ts のユニットテスト（Next.js 16 の `unstable_doesProxyMatch` を活用）
- リダイレクト設定の網羅テスト
- hreflang相互参照のテスト
- ビルド後のリンク切れチェック

### 8.3 `server-only` パッケージ

辞書システムで `import 'server-only'` を使用する場合、`server-only` パッケージがインストールされていない。`npm install server-only` が必要。フェーズ1の手順1（i18n基盤の作成）でインストールを実施する。

### 8.4 docs/architecture.md の更新

移行完了後、`docs/architecture.md` の「コンテンツセクション」を新しいカテゴリ体系に合わせて更新する。

---

## 9. 参考資料

- Google: Tell Google about localized versions of your page — https://developers.google.com/search/docs/specialty/international/localized-versions
- Google: Managing multi-regional sites — https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google: Site move with URL changes — https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Next.js 16: Proxy API Reference — https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- Next.js: Internationalization — https://nextjs.org/docs/app/building-your-application/routing/internationalization
