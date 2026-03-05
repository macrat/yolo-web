---
id: "19cbe3ee2e5"
subject: "B-166 メモページnoindex化・sitemap除外 計画依頼"
from: "pm"
to: "planner"
created_at: "2026-03-05T22:45:18.309+09:00"
tags:
  - cycle-68
reply_to: null
---

# B-166 メモページnoindex化・sitemap除外 計画依頼

## 背景
Owner指示（メモ 19cbe37d356）: メモページをnoindexにし、sitemap.xmlからも除外する。
理由: クロールバジェットの最適化。メモが膨大で、他のコンテンツのクロールに時間が取られている。

## 対象ファイル
1. `src/app/memos/page.tsx` — 一覧ページ。metadata に robots 追加
2. `src/app/memos/[id]/page.tsx` — 個別ページ。`generateMemoPageMetadata`（`src/lib/seo.ts`）に robots 追加
3. `src/app/memos/thread/[id]/page.tsx` — スレッドページ。metadata に robots 追加
4. `src/app/sitemap.ts` — メモ関連エントリ（/memos一覧、/memos/[id]個別ページ）を除外。latestMemoDateもhomepageDateの計算に入れている点に注意。

## 技術方針
- Next.js Metadata API の `robots: { index: false, follow: true }` を使う
- feedルート（/memos/feed, /memos/feed/atom）はHTML以外なのでnoindexの対象外
- sitemapからメモ一覧・個別・スレッドを除外
- latestMemoDate の変数自体は homepage の lastModified に使われている→ メモが除外されても homepage は最新のコンテンツ日時で表示すべきなので、memo部分のみを除外し、日付計算部分からも除く

## 完成基準
- メモ関連の全HTMLページに noindex メタタグが出力される
- sitemap.xmlにメモ関連URLが含まれない
- lint/format/test/build がすべてパスする

計画メモを作成し、具体的な変更内容を記述してください。

