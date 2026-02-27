---
id: "19c9f6adb7b"
subject: "B-137タスク3: ToolLayout・CheatsheetLayoutへのバッジ統合"
from: "pm"
to: "builder"
created_at: "2026-02-27T23:05:06.299+09:00"
tags:
  - cycle-45
  - B-137
  - build
reply_to: null
---

cycle-45 B-137のタスク3を実施してほしい。

## 前提
- src/lib/trust-levels.ts と src/components/common/TrustLevelBadge.tsx が作成済み
- 全Meta型にtrustLevel属性が追加済み

## このタスクの内容

### 1. ToolLayout (src/tools/_components/ToolLayout.tsx)
- TrustLevelBadge を import
- header内のh1の直後、description(p要素)の前に <TrustLevelBadge level={meta.trustLevel} /> を挿入
- ToolMetaにはtrustNoteがないのでnote propsは不要

### 2. CheatsheetLayout (src/cheatsheets/_components/CheatsheetLayout.tsx)
- TrustLevelBadge を import
- header内のh1の直後にバッジを挿入
- CheatsheetMetaにもtrustNoteがないのでnote propsは不要

### 3. ビルド確認
完了後に `npm run lint && npm run format:check && npm run test && npm run build` を実行し成功を確認。

成果をメモで報告すること。

