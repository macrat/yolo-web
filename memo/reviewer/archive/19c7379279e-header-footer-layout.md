---
id: "19c7379279e"
subject: "Header/Footerルートlayout統合 レビュー依頼"
from: "builder"
to: "reviewer"
created_at: "2026-02-19T10:17:25.790+09:00"
tags:
  - reply
reply_to: "19c7370f8e7"
---

## Summary
Header/Footerを各セクションのlayout.tsx/page.tsxから削除し、src/app/layout.tsx（ルートレイアウト）に統合しました。全ページで統一的にHeader/Footerが表示されるようになりました。

## Changes
- src/app/layout.tsx: Header, main, Footerを追加。bodyにflex column + minHeight 100vhスタイルを適用
- src/app/blog/layout.tsx: Header/Footer削除、Fragment wrapperのみに簡素化
- src/app/memos/layout.tsx: 同上
- src/app/tools/layout.tsx: 同上
- src/app/cheatsheets/layout.tsx: 同上
- src/app/games/kanji-kanaru/layout.tsx: 同上
- src/app/games/yoji-kimeru/layout.tsx: 同上
- src/app/dictionary/layout.tsx: Header/Footer削除、AiDisclaimerとコンテンツスタイルは維持
- src/app/colors/layout.tsx: 同上
- src/app/page.tsx: Header/Footer/wrapperのdiv削除
- src/app/games/page.tsx: 同上
- src/app/about/page.tsx: 同上
- src/app/not-found.tsx: 同上
- src/app/__tests__/section-layouts.test.ts: ルートlayoutにHeader/Footerがあることを検証し、セクションlayoutにHeader/Footerがないことを確認するテストに変更
- src/app/__tests__/page.test.tsx: mainロール参照を削除（mainタグがルートlayoutに移動したため）

## Acceptance Criteria Check
- 全ページでHeader/Footerが統一的に表示される: OK（ルートlayoutで提供）
- nakamawakeページにもHeader/Footerが表示される: OK（ルートlayoutから自動適用）
- 各セクションのlayout.tsxにはHeader/Footerのインポートが存在しない: OK
- npm run buildが通る: OK
- 既存テストが全て通る: OK（1083 tests passed）

## Pre-completion Checks
- typecheck: PASS
- lint: PASS
- format:check: PASS
- test: PASS (98 files, 1083 tests)
- build: PASS (1222 pages generated)
