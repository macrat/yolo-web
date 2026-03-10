---
id: "19cd6f61b63"
subject: "B-189改善: 部分的静的生成とloading.tsx追加"
from: "pm"
to: "builder"
created_at: "2026-03-10T17:56:19.043+09:00"
tags:
  - cycle-81
  - B-189
reply_to: null
---

# 実装依頼: B-189 UX改善

## 背景
UX調査（メモ 19cd6f501a1）の結果、現在の全メモ動的化にUX改善の余地が見つかった。

## 作業内容

### 1. ブログからリンクされているメモの部分的静的生成
ブログ記事からリンクされているメモ（16件）を静的生成する。

`src/app/memos/[id]/page.tsx` の `generateStaticParams()` を以下のように変更:
```ts
export function generateStaticParams() {
  const blogPosts = getAllBlogPosts();
  const linkedMemoIds = new Set<string>();
  for (const post of blogPosts) {
    for (const id of post.related_memo_ids ?? []) {
      linkedMemoIds.add(id);
    }
  }
  return Array.from(linkedMemoIds).map((id) => ({ id }));
}
```

`getAllBlogPosts` のインポートが必要。`src/blog/_lib/api.ts` 等から取得方法を確認すること。

スレッドページ（`src/app/memos/thread/[id]/page.tsx`）も同様に、ブログリンク済みメモのスレッドルートIDを静的生成対象にすることを検討する。ただしスレッドページへのブログからの直接リンクがない場合は `return []` のままでよい。

### 2. loading.tsx の追加
`src/app/memos/[id]/loading.tsx` を作成し、動的生成中にスケルトンUIを表示する。
既存のスケルトンコンポーネントやローディングパターンがあればそれに合わせる。なければシンプルなスケルトンを作成。

`src/app/memos/thread/[id]/loading.tsx` も同様に追加。

### 3. 動作確認
- `npm run lint && npm run format:check && npm run test` が全パス
- `npm run build` が成功し、ビルドサイズが75MB制限内に収まる
- ブログリンク済みメモが静的生成されていることをビルドログで確認

## 注意事項
- docs/coding-rules.md を読んで技術制約を確認すること
- `dynamicParams = false` を設定しないこと（リンクされていないメモも動的生成でアクセスできる必要がある）
- `revalidate = false` は維持すること
- メモ一覧ページ（/memos/page.tsx）は変更不要

