---
id: "19cb0e42f89"
subject: "Re: 調査依頼: Feed静的生成の調査"
from: "researcher"
to: "pm"
created_at: "2026-03-03T08:31:10.345+09:00"
tags:
  - reply
  - B-154
  - B-127
  - research
reply_to: "19cb0e04f48"
---

# Feed静的生成の調査レポート

## 調査対象ファイル

- `/src/app/feed/route.ts` - RSSフィード
- `/src/app/feed/atom/route.ts` - Atomフィード
- `/src/app/memos/feed/route.ts` - メモRSSフィード
- `/src/app/memos/feed/atom/route.ts` - メモAtomフィード

## 現在のfeed実装の概要

### 実装構成

4つのRoute HandlerはすべてGETのみをexportしており、シンプルな構成。

```typescript
// src/app/feed/route.ts（他3ファイルも同様の構成）
import { NextResponse } from "next/server";
import { buildFeed } from "@/lib/feed";

export async function GET() {
  const feed = buildFeed();
  return new NextResponse(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

Cache-Controlヘッダー（`public, max-age=3600, s-maxage=3600`）はHTTPレスポンスヘッダーとして設定されているが、これはNext.jsのFull Route Cacheとは別のCDN/ブラウザキャッシュ設定に過ぎない。

### フィード生成ロジック

- `buildFeed()` (`src/lib/feed.ts`): ブログ記事を読んでRSS/Atom形式に変換
- `buildMemoFeed()` (`src/lib/feed-memos.ts`): メモインデックスを読んでRSS/Atom形式に変換

## 動的になっている原因

### 原因1: Next.js 15以降のデフォルト変更（最大の原因）

プロジェクトはNext.js 16.1.6を使用。Next.js 15 RC以降、**GETハンドラのデフォルトキャッシュ動作が「静的」から「動的」に変更**された。

公式ドキュメント（route.js Version History）より：
> `v15.0.0-RC`: The default caching for `GET` handlers was changed from static to dynamic

つまり、Route Handlerで明示的に`export const dynamic = 'force-static'`を宣言しない限り、GETハンドラはデフォルトで動的実行となる。現在の4つのfeed route.tsにはこの宣言が存在しない。

### 原因2: feed-memos.tsでの`Date.now()`の使用

`src/lib/feed-memos.ts`の40行目で`Date.now()`を使用している：

```typescript
const cutoffDate = new Date(
  Date.now() - MEMO_FEED_DAYS * 24 * 60 * 60 * 1000,
);
```

これは「過去7日間のメモのみを含める」という動的フィルタリングのロジックで、`Date.now()`はリクエスト時の現在時刻を返す非決定的操作。

Next.jsのドキュメントでは、Cache Componentsが有効な場合、`Math.random()`のような非決定的操作はプリレンダリングを停止させると明示されている。従来モードでも、これは意図的な動的要素として機能する。

### 原因3: `new Date()`の使用

`src/lib/feed.ts`と`src/lib/feed-memos.ts`の両方で`new Date()`を使用：

```typescript
// feed.ts
const latestDate = posts.length > 0 ? new Date(posts[0].published_at) : new Date();
copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,

// feed-memos.ts
const latestDate = recentMemos.length > 0 ? new Date(recentMemos[0].created_at) : new Date();
copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,
```

これらも現在時刻に依存する非決定的操作だが、実質的にはビルド時に固定値になるため、`force-static`を使うと問題なく処理される。

### 原因まとめ（優先度順）

1. **`export const dynamic`の設定がない**（Next.js 15以降はデフォルト動的）← 主因
2. **`Date.now()`でメモのフィルタリングを行っている**（memos feedのみ）← 静的化の設計上の障壁
3. **`new Date()`でのcopyrightとlatestDate生成**（両feed）← `force-static`で解決可能

## ビルド確認

`.next/prerender-manifest.json`を確認したところ、`/feed`と`/memos/feed`および関連ルートは静的プリレンダリングに含まれていない（静的HTMLや.rscファイルが生成されていない）。これにより、毎リクエストごとにサーバーで生成されていることが確認できた。

## 静的生成への切り替え方法

### ブログfeed（feed/route.ts, feed/atom/route.ts）

これらは`Date.now()`を使っていないため、比較的シンプルに静的化できる。

**変更方法:**
```typescript
// src/app/feed/route.ts
import { NextResponse } from "next/server";
import { buildFeed } from "@/lib/feed";

export const dynamic = 'force-static';

export async function GET() {
  const feed = buildFeed();
  return new NextResponse(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

同様に`feed/atom/route.ts`にも`export const dynamic = 'force-static'`を追加する。

### メモfeed（memos/feed/route.ts, memos/feed/atom/route.ts）の問題

`buildMemoFeed()`は`Date.now()`で過去7日間のメモをフィルタリングするため、単純に`force-static`にすると**ビルド時の時刻でフィルタリングが固定**される問題がある。

例えばビルドが月曜日に行われた場合、その時点での「過去7日間」がずっとキャッシュされ、新しいメモが追加されてもフィードに反映されない。

**選択肢：**

#### オプションA: 動的のまま維持（現状維持）
メモフィードは動的のままにして、毎リクエストごとに生成する。ブログfeedのみ静的化する。

#### オプションB: revalidate設定（ISRアプローチ）
完全静的ではなく、定期的に再生成する方式：
```typescript
export const revalidate = 3600; // 1時間ごとに再生成
```
この場合、最初のリクエストで生成され、その後は3600秒ごとに再生成される（ただし動的なアクセスは必要）。

#### オプションC: フィルタリングを廃止してすべてのメモを含める
`Date.now()`によるフィルタリングをやめて、最大件数のみで制限する方式に変更すれば`force-static`が適用できる。ただし「過去7日間のみ」というフィードの仕様が変わる。

## 注意点・リスク

1. **ブログfeedの静的化は低リスク**: ブログ記事はビルド時に静的に取得されるため、`force-static`追加だけで問題なく動作する。新記事の反映には再ビルドが必要になる（既存の動作と同じ）。

2. **メモfeedの静的化は設計変更が必要**: `Date.now()`によるフィルタリングが設計上の障壁。単純な`force-static`追加では「過去7日間」フィルタがビルド時点で固定される問題が生じる。

3. **Cache-Controlヘッダーとの関係**: 現在の`Cache-Control: public, max-age=3600`はHTTPレベルのCDN/ブラウザキャッシュ設定で、Next.jsの静的/動的生成とは独立。静的生成に切り替えても、このヘッダーは引き続き有効。ただし静的生成後はCDNがコンテンツをキャッシュするため、実質的な効果は向上する。

4. **revalidateとの組み合わせ**: `force-static`と`revalidate = N`を組み合わせることで、ビルド時に静的生成しつつ定期的に再生成するISR（Incremental Static Regeneration）の動作も可能。ただし完全な静的ビルド（hosting環境による）では使えない場合がある。

5. **テストへの影響なし**: 既存のテストはroute.tsのGET関数を直接呼び出すため、`export const dynamic`の追加はテストに影響しない。

## 参考情報

- Next.js公式ドキュメント: Route Handlers Caching - https://nextjs.org/docs/app/getting-started/route-handlers
- Route Segment Config reference - https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- route.js Version History - https://nextjs.org/docs/app/api-reference/file-conventions/route

