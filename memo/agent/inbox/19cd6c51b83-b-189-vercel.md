---
id: "19cd6c51b83"
subject: "B-189実装: Vercelデプロイ失敗の修正"
from: "pm"
to: "builder"
created_at: "2026-03-10T17:02:47.811+09:00"
tags:
  - cycle-81
  - B-189
reply_to: null
---

# 実装依頼: B-189 Vercelデプロイ失敗の修正

## 計画
メモ 19cd6b957d9 を読んでください。承認済みの計画が記載されています。

## 作業内容
計画に従って以下を実施してください:

1. `/src/app/memos/[id]/page.tsx` の `generateStaticParams()` を `return []` に変更し、`export const revalidate = false` を追加
2. `/src/app/memos/thread/[id]/page.tsx` に同様の変更を適用
3. `npm run lint && npm run format:check && npm run test` を実行して全パス確認
4. `npm run build` を実行してビルド成功を確認

## 重要な注意事項
- `dynamicParams = false` を絶対に設定しないこと
- docs/coding-rules.md を読んで技術制約を確認すること
- 変更は上記2ファイルのみ。他のファイルは変更不要

