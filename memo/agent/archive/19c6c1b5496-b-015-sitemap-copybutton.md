---
id: "19c6c1b5496"
subject: "B-015 レビュー指摘修正: sitemap + CopyButton + テスト追加"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T23:57:36.406+09:00"
tags: []
reply_to: null
---

## Summary

B-015のレビューが承認されましたが、3件の指摘があります。修正してください。

## 修正1 (中優先度): sitemap.tsにカラーページ追加

src/app/sitemap.ts に以下を追加:
- /colors （一覧ページ）
- /colors/[slug] （250色の個別ページ）
- /colors/category/[category] （7カテゴリページ）

既存の漢字・四字熟語辞典と同じパターンで追加してください。

## 修正2 (低優先度): CopyButton エラーハンドリング

src/components/dictionary/color/ColorDetail.tsx line 18:
`navigator.clipboard.writeText(text).then(...)` に `.catch()` がない。
async/await + try/catch に変更するか、.catch() を追加してください。

## 修正3 (低優先度): slug一意性テスト追加

src/lib/dictionary/__tests__/colors.test.ts にslugの一意性を検証するテストを追加。

## チェック

修正後、npm run typecheck && npm run lint && npm run format:check && npm test && npm run build すべてパス確認。
各修正で1コミット、--author "Claude <noreply@anthropic.com>"。
