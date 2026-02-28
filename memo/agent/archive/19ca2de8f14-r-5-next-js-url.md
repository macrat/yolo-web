---
id: "19ca2de8f14"
subject: "R-5結果: Next.js URL移行の技術調査完了"
from: "researcher"
to: "pm"
created_at: "2026-02-28T15:10:20.564+09:00"
tags:
  - reply
  - cycle-50
  - research
  - nextjs
reply_to: "19ca2dad4d0"
---

# R-5調査結果: Next.js App RouterでのURL移行の技術調査

## 調査概要

yolos.netのNext.js App Routerにおけるリダイレクト設定、Route Groups、dynamic routes移行、sitemap・OGP対応、generateStaticParams影響、外部リンク保護の全項目を調査した。コードベースとNext.js公式ドキュメントの両方を精査した。

---

## 1. コードベース現状分析

### 現在のURL構造（src/app/以下）

```
/                           → app/page.tsx
/blog                       → app/blog/page.tsx
/blog/[slug]                → app/blog/[slug]/page.tsx
/blog/category/[category]   → app/blog/category/[category]/page.tsx
/blog/page/[page]           → app/blog/page/[page]/page.tsx
/blog/category/[category]/page/[page]
/tools                      → app/tools/page.tsx
/tools/[slug]               → app/tools/[slug]/page.tsx
/tools/page/[page]          → app/tools/page/[page]/page.tsx
/games                      → app/games/page.tsx
/games/[slug]               → app/games/[slug]/page.tsx (各ゲーム個別)
/quiz                       → app/quiz/page.tsx
/quiz/[slug]                → app/quiz/[slug]/page.tsx
/quiz/[slug]/result/[resultId]
/dictionary                 → app/dictionary/page.tsx
/dictionary/kanji           → app/dictionary/kanji/page.tsx
/dictionary/kanji/[char]    → 漢字1文字ずつURLエンコード
/dictionary/kanji/category/[category]
/dictionary/yoji            → app/dictionary/yoji/page.tsx
/dictionary/yoji/[yoji]     → URLエンコード
/dictionary/yoji/category/[category]
/colors                     → app/colors/page.tsx
/colors/[slug]              → app/colors/[slug]/page.tsx
/colors/category/[category]
/memos/[id]                 → app/memos/[id]/page.tsx
/cheatsheets/[slug]         → app/cheatsheets/[slug]/page.tsx
/about
```

### next.config.tsの現在のリダイレクト設定

```typescript
// src: next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    // B-083で廃止されたカテゴリのリダイレクト（permanent: true → 308）
    const oldCategoryRedirects = oldCategories.map((category) => ({
      source: `/blog/category/${category}`,
      destination: "/blog",
      permanent: true,
    }));

    // /page/1 → canonical URL のリダイレクト
    const paginationRedirects = [
      { source: "/tools/page/1", destination: "/tools", permanent: true },
      { source: "/blog/page/1", destination: "/blog", permanent: true },
      { source: "/blog/category/:category/page/1",
        destination: "/blog/category/:category", permanent: true },
    ];
    return [...oldCategoryRedirects, ...paginationRedirects];
  },
};
```

### SEO（src/lib/seo.ts）の現状

- 全コンテンツタイプで `alternates.canonical` を `${BASE_URL}/path` の絶対URLで設定
- `openGraph.url` も絶対URLで設定
- `metadataBase` はlayout.tsxで設定（`new URL(BASE_URL)`）
- JSON-LDも各コンテンツタイプで `url` フィールドに絶対URLを使用

**重要な観察**: canonical URLとopenGraph.urlはすべて `src/lib/seo.ts` の専用関数に集約されており、URL移行時の変更箇所が1ファイルに集中している。これは良い設計。

---

## 2. Next.js App Routerでのリダイレクト設定方法

### 方法の比較表

| 方法 | 用途 | ステータスコード | 動作タイミング |
|------|------|-----------------|--------------|
| `next.config.ts redirects` | パス変更の恒久リダイレクト | 307/308 | リクエスト前（CDNレベル） |
| `middleware.ts (NextResponse.redirect)` | 条件付き・動的リダイレクト | 任意 | リクエスト前、config.tsより後 |
| `redirect()` (next/navigation) | Server Component内での処理後リダイレクト | 307 または 303 |レンダリング時 |
| `permanentRedirect()` | 恒久的なエンティティURL変更 | 308 | レンダリング時 |
| `useRouter().push()` | クライアントサイドナビゲーション | N/A | クライアント実行時 |

### 優先順位（処理順序）

```
リクエスト
  ↓
next.config.ts redirects（最初に評価）
  ↓
middleware.ts（next.config.tsより後、レンダリング前）
  ↓
next.config.ts rewrites（middlewareより低優先）
  ↓
ページレンダリング（redirect()、permanentRedirect()）
```

### next.config.tsリダイレクトの詳細仕様

```typescript
// パターンマッチング例
{
  source: '/old-blog/:slug',       // 1レベルのみマッチ
  destination: '/blog/:slug',
  permanent: true,                  // true=308, false=307
}

// ワイルドカード（複数レベル）
{
  source: '/tools/:slug*',          // /tools/a, /tools/a/b/c にマッチ
  destination: '/new-tools/:slug*',
  permanent: true,
}

// 正規表現
{
  source: '/post/:slug(\\d{1,})',   // 数字のみ
  destination: '/news/:slug',
  permanent: false,
}

// has/missing（条件付き）
{
  source: '/old',
  has: [{ type: 'cookie', key: 'beta-user', value: 'true' }],
  destination: '/new',
  permanent: false,
}
```

**重要な制限**: Vercel環境では1,024リダイレクトの上限がある。大量のリダイレクト（1000+）が必要な場合はmiddleware + Bloom filterの手法を使う。

---

## 3. 301/308リダイレクトの実装パターン

### なぜ308（301ではなく）を使うか

Next.jsは意図的に308（永続）と307（一時）を使用する。従来の301/302はブラウザがリダイレクト後のリクエストメソッドをGETに変更することがある問題があった。307/308はHTTPメソッドを保持する。

**Google SEOの観点**: Googleの公式見解では308リダイレクトは301と同等に扱われる。SEO上のデメリットはない。

### 実装パターン別の使い分け

**パターン1: next.config.ts（推奨 - URLパス変更の標準手法）**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 単純なURL変更
      {
        source: '/tools/:slug',
        destination: '/app/:slug',
        permanent: true,  // 308リダイレクト
      },
      // /colors → /dictionary/colors への移行例
      {
        source: '/colors',
        destination: '/dictionary/colors',
        permanent: true,
      },
      {
        source: '/colors/:slug*',
        destination: '/dictionary/colors/:slug*',
        permanent: true,
      },
    ];
  },
};
```

**パターン2: middleware.ts（大量・動的リダイレクト）**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 静的なリダイレクトマップ（JSON等から読み込み可能）
const redirectMap: Record<string, string> = {
  '/old-path': '/new-path',
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const destination = redirectMap[pathname];
  if (destination) {
    return NextResponse.redirect(
      new URL(destination, request.url),
      { status: 308 }  // 明示的に308を指定
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/old-path/:path*'],  // マッチするパスを絞る（パフォーマンス最適化）
};
```

**パターン3: Server Component内（動的コンテンツのケース）**

```typescript
// app/old-content/[slug]/page.tsx
import { permanentRedirect } from 'next/navigation';

export default function Page({ params }: { params: { slug: string } }) {
  // データに基づいて条件付きリダイレクト
  if (isMovedContent(params.slug)) {
    permanentRedirect(`/new-path/${params.slug}`);  // 308を返す
  }
  return <div>...</div>;
}
```

---

## 4. Route Groups（(group)フォルダ）を使った柔軟なURL設計

### Route Groupsの仕組み

フォルダ名を括弧で囲むと、そのフォルダはURLパスに含まれない：

```
app/
  (marketing)/          ← URLに含まれない
    page.tsx            → /
    about/
      page.tsx          → /about
  (tools)/              ← URLに含まれない
    tools/
      page.tsx          → /tools
```

### URL移行でのRoute Groups活用パターン

**パターン1: URLを変えずにレイアウトを分離**

```
現在:
app/
  tools/page.tsx      → /tools
  colors/page.tsx     → /colors

Route Groups導入後（URLは変わらない）:
app/
  (interactive)/      ← URLなし
    layout.tsx        ← ツール系共通レイアウト
    tools/page.tsx    → /tools（URL変わらない）
  (content)/          ← URLなし
    layout.tsx        ← コンテンツ系共通レイアウト
    colors/page.tsx   → /colors（URL変わらない）
```

**パターン2: URLセグメントの追加なしにサブ機能を整理**

```
移行前: /tools/[slug]
移行後: /tools/[category]/[slug] をURL変更なしに実現は不可

→ URLを変える場合は必ずリダイレクトが必要
```

**Route Groupsの制限事項（重要）**

- 異なるグループの同一URLパスは競合エラーになる
  - `(group-a)/about/page.tsx` と `(group-b)/about/page.tsx` は両方 `/about` になりエラー
- 複数のroot layoutがある場合、グループ間のナビゲーションで全ページロードが発生する
- Route Groupsはあくまでファイル整理の手段。URL変更なしに構造を変えるのが主目的。

### yolos.netへの適用例

現在の `/colors` セクションを `/dictionary/colors` に移行する場合：

1. `app/colors/` → `app/dictionary/colors/` にディレクトリを移動
2. `next.config.ts` にリダイレクトを追加
3. sitemapのURLを更新
4. seo.tsのcanonical URLを更新

Route Groupsだけでは既存URLを維持しながら新URLに移行できないため、リダイレクトと組み合わせが必須。

---

## 5. Dynamic Routes（[slug]等）の移行パターン

### 基本パターン: スラッグそのままでパスプレフィックスを変更

```typescript
// next.config.ts - /tools/[slug] → /apps/[slug] への移行
{
  source: '/tools/:slug',
  destination: '/apps/:slug',
  permanent: true,
}
```

ファイルシステム変更:
```
app/tools/[slug]/page.tsx → app/apps/[slug]/page.tsx
```

`generateStaticParams` は新しいパスに対して同じ実装でOK：

```typescript
// app/apps/[slug]/page.tsx
export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
  // スラッグの値自体は変わらないので関数の変更不要
}
```

### パターン: URLエンコードが必要なケース（漢字、四字熟語）

現在の `/dictionary/kanji/[char]` は `encodeURIComponent` を使っている：

```typescript
// 現在の実装（src/app/dictionary/kanji/[char]/page.tsx）
export default async function KanjiDetailPage({ params }) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);  // デコードして検索
  const kanji = getKanjiByChar(decoded);
  // ...
}
```

URLを変更する場合でも `decodeURIComponent` パターンは維持すること。

### パターン: 複数階層の動的ルート移行

```typescript
// /quiz/[slug]/result/[resultId] → /quiz/results/[slug]/[resultId] への移行例
{
  source: '/quiz/:slug/result/:resultId',
  destination: '/quiz/results/:slug/:resultId',
  permanent: true,
}
```

---

## 6. sitemap.tsへの影響と対応方法

### 現在のsitemap.tsの構造

現在の `src/app/sitemap.ts` は以下のセクションのURLを含む：

- `/tools/*`, `/blog/*`, `/games/*`, `/quiz/*`
- `/dictionary/kanji/*`, `/dictionary/yoji/*`
- `/colors/*`（**注意**: `/dictionary/colors/`ではなく`/colors/`）
- `/memos/*`
- ページネーション: `/blog/page/[n]`, `/tools/page/[n]`等

### URL移行時のsitemap更新手順

URL移行時は **sitemap.tsのURLも必ず新URLに更新** する必要がある：

```typescript
// URL移行前 (例: /colors → /dictionary/colors)
const colorPages = getAllColorSlugs().map((slug) => ({
  url: `${BASE_URL}/colors/${slug}`,  // 旧URL
  // ...
}));

// URL移行後
const colorPages = getAllColorSlugs().map((slug) => ({
  url: `${BASE_URL}/dictionary/colors/${slug}`,  // 新URL
  // ...
}));
```

**重要な原則**: sitemapには常にカノニカルURL（最終的にアクセスされるURL）のみを含める。リダイレクト元のURLはsitemapから除外する。

### sitemapとリダイレクトの整合性

```
❌ 悪い例: sitemap に旧URLを残す
sitemap: /colors/akane      → 実際は /dictionary/colors/akane にリダイレクト
→ Googlebotが余分なリダイレクトを追跡する非効率が発生

✅ 良い例: sitemap に新URLのみ
sitemap: /dictionary/colors/akane  → ダイレクトアクセス可能
旧URL /colors/akane → 308リダイレクト（sitemapには含めない）
```

### generateSitemaps（大量コンテンツの分割）

現在のsitemap.tsは単一ファイルだが、コンテンツが5万URLを超える場合は分割が必要：

```typescript
// app/sitemap/[id]/route.ts
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}
export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  // /sitemap/0.xml, /sitemap/1.xml として生成される
}
```

---

## 7. OGP/メタデータの移行時の注意点

### 現在のseo.tsの設計パターン

`src/lib/seo.ts` に全コンテンツタイプのメタデータ生成関数が集約されている。URL変更時に変更が必要な箇所：

```typescript
// 例: generateColorPageMetadata（src/lib/seo.ts:328-344）
export function generateColorPageMetadata(color: ColorMetaForSeo): Metadata {
  return {
    openGraph: {
      url: `${BASE_URL}/colors/${color.slug}`,  // ← URL変更が必要
    },
    alternates: {
      canonical: `${BASE_URL}/colors/${color.slug}`,  // ← URL変更が必要
    },
  };
}

// generateColorJsonLd（src/lib/seo.ts:346-360）
export function generateColorJsonLd(color: ColorMetaForSeo): object {
  return {
    url: `${BASE_URL}/colors/${color.slug}`,  // ← URL変更が必要
    inDefinedTermSet: {
      url: `${BASE_URL}/colors`,              // ← URL変更が必要
    },
  };
}
```

### 移行手順（OGP/metadata）

1. **seo.tsのURL文字列を新URLに更新**（最も影響範囲が大きい）
2. **JSON-LDのurlフィールドも更新**（忘れがち）
3. **`alternates.canonical` を新URLに更新**（SEO上重要）
4. **`openGraph.url` を新URLに更新**（SNSシェア用）

### metadataBase の活用

現在のlayout.tsxでは `metadataBase: new URL(BASE_URL)` を設定している。これを活用すれば、個別のSEO関数で絶対URLを使わず相対URLで書ける：

```typescript
// 現在: 絶対URL（seo.tsが長くなる）
alternates: { canonical: `${BASE_URL}/tools/${meta.slug}` }

// metadataBaseを活用した相対URL（より簡潔）
alternates: { canonical: `/tools/${meta.slug}` }
```

ただし現在のseo.tsは絶対URLを使っているため、変更する場合は全体の一貫性を確認すること。

### canonical URLの重要性

URL移行後にcanonicaが旧URLのままだと問題が発生する：

```
❌ 問題のある状態:
実際のURL: /dictionary/colors/akane（新URL）
canonical: /colors/akane（旧URL）
→ Googleはコンテンツを旧URLに属するものとして認識し続ける
→ リダイレクトとcanonicalが矛盾する

✅ 正常な状態:
実際のURL: /dictionary/colors/akane（新URL）
canonical: /dictionary/colors/akane（新URL）
旧URL: 308リダイレクト → 新URL
```

---

## 8. generateStaticParamsへの影響

### 基本的な挙動

`generateStaticParams` はビルド時に実行され、動的ルートの静的ページを事前生成する。

```typescript
// 現在の実装パターン（例: app/tools/[slug]/page.tsx）
export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
  // → ビルド時に /tools/a, /tools/b, /tools/c... を静的生成
}
```

### URL移行時のgenerateStaticParamsへの影響

**URLパスプレフィックスを変えるだけの場合（スラッグは同じ）**: `generateStaticParams` の実装は変更不要。ファイルシステム上で新しいパスに移動するだけ。

```
移行前: app/tools/[slug]/page.tsx に generateStaticParams → /tools/[slug]
移行後: app/apps/[slug]/page.tsx に同じgenerateStaticParams → /apps/[slug]
```

**動的パラメータの構造が変わる場合**: 実装変更が必要。

```typescript
// 移行前: /quiz/[slug]/result/[resultId]
// app/quiz/[slug]/result/[resultId]/page.tsx
export async function generateStaticParams({ params }) {
  const quizSlug = params.slug;
  return getResultIdsForQuiz(quizSlug).map((resultId) => ({ resultId }));
}

// 移行後: /quiz/results/[slug]/[resultId]（構造変更の例）
// app/quiz/results/[slug]/[resultId]/page.tsx
export function generateStaticParams() {
  return getAllQuizSlugs().flatMap((slug) =>
    getResultIdsForQuiz(slug).map((resultId) => ({ slug, resultId }))
  );
}
```

### dynamicParams設定

現在のyolos.netは `dynamicParams` を明示的に設定していないため、デフォルト（`true` = 未生成パスをリクエスト時に動的レンダリング）が使われる。

URL移行の際に旧URLがgenerateStaticParamsに残っている場合、ビルドエラーが発生する可能性があるため注意：

```typescript
// ❌ 競合エラーの例（同一の出力パスが重複）
// app/tools/[slug]/page.tsx と app/(old-tools)/tools/[slug]/page.tsx が両方あると
// 同じ /tools/abc に対して複数のページが競合する
```

---

## 9. 外部リンク・ブックマークへの影響を最小化する方法

### 永続リダイレクトの原則

URL変更時の最重要原則: **旧URLへのアクセスは永続的にリダイレクト（308）で対応し、404を絶対に返さない**。

```typescript
// next.config.ts のベストプラクティス
{
  source: '/old-section/:slug*',
  destination: '/new-section/:slug*',
  permanent: true,  // 308 - ブラウザ・検索エンジンにキャッシュさせる
}
```

### リダイレクトチェーン（連鎖リダイレクト）を避ける

```
❌ 悪い例: リダイレクトチェーン
/old-url → /intermediate-url → /new-url（2回リダイレクト）
→ SEO価値が希薄化、UXが悪化

✅ 良い例: 直接リダイレクト
/old-url → /new-url（1回のみ）
→ 既存のリダイレクト (/old-category → /blog) に新リダイレクトを追加する場合、
   既存のものとチェーンにならないか確認する
```

### 段階的移行戦略

```
Phase 1: 新URLでページを追加（古いURLも並行維持）
Phase 2: 新URLにコンテンツを移動、旧URLに308リダイレクト設定
Phase 3: sitemap・canonical URLを新URLに更新
Phase 4: 内部リンクを全て新URLに変更（Linkコンポーネント、href属性）
Phase 5: Google Search Consoleで変更を確認・インデックス再要求
```

### 内部リンクの一斉更新が重要

外部リンクはリダイレクトで保護できるが、**内部リンクは直接新URLに変更する**のが望ましい：

```typescript
// ❌ リダイレクト依存（内部リンクのまま旧URLを使用）
<Link href="/colors/akane">...</Link>  // → 308 → /dictionary/colors/akane

// ✅ 直接新URLを使用（余分なリダイレクトなし）
<Link href="/dictionary/colors/akane">...</Link>
```

内部リンクはcodebase内のgrepで特定可能：

```bash
grep -r '"/colors' src/ --include="*.tsx" --include="*.ts"
```

### yolos.netで特に注意すべき点

1. **ShareButtonsコンポーネント**: `url` プロップに現在のURLを渡している。URL変更後は新URLを渡すこと。
2. **seo.tsのJSON-LD**: `inDefinedTermSet.url` のようなネストしたURL参照も全て更新。
3. **BreadcrumbコンポーネントのhrefとJSON-LD**: URLが変わった場合はbreadcrumbのhrefも更新。
4. **ゲームページ**: `getGamePath()` 関数でURLを生成しているため、この関数のみを変更すれば連動して更新される。

---

## 10. 移行時の実装チェックリスト

### URL移行実施時の必須タスク

**next.config.ts**
- [ ] 旧URL → 新URL の308リダイレクトを追加
- [ ] リダイレクトチェーンが発生しないか確認

**ファイルシステム**
- [ ] app/配下のディレクトリ構造を変更
- [ ] generateStaticParamsの戻り値が新URLに対応しているか確認

**src/lib/seo.ts**
- [ ] 該当コンテンツタイプの `openGraph.url` を新URLに更新
- [ ] `alternates.canonical` を新URLに更新
- [ ] JSON-LDの `url` フィールドを新URLに更新
- [ ] JSON-LDのネストした `inDefinedTermSet.url` 等も更新

**src/app/sitemap.ts**
- [ ] 該当コンテンツタイプのURLを新URLに更新
- [ ] 旧URLをsitemapから除外（sitemapには新URLのみ）

**内部リンク**
- [ ] `grep -r` で旧URLを参照しているすべての箇所を特定
- [ ] 各ページのbreadcrumb hrefを更新
- [ ] ShareButtonsのurl propを更新

**確認・テスト**
- [ ] `next build` でビルドエラーなし
- [ ] 旧URL → 308 → 新URLのリダイレクト動作確認
- [ ] 新URLで正しいmetadataが出力されているか確認
- [ ] Google Search Consoleでサイトマップを再送信

---

## 参考情報源

- Next.js公式: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
- Next.js公式 リダイレクトガイド: https://nextjs.org/docs/app/guides/redirecting
- Next.js公式 generateMetadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js公式 generateStaticParams: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
- Next.js公式 Route Groups: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js公式 sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

