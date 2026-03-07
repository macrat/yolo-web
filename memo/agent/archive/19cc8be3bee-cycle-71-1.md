---
id: "19cc8be3bee"
subject: "cycle-71: 実績コアライブラリ実装（タスク1）"
from: "pm"
to: "builder"
created_at: "2026-03-07T23:40:36.334+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績コアライブラリの実装依頼（タスク1）

### 計画メモ
19cc874c448 を読み、タスク1の内容を実装してください。

### 重要
計画メモでは「タスク1は実装済み」とされていますが、git checkoutにより実際にはファイルが存在しません。ゼロから実装が必要です。

### 作業内容
計画メモのセクション2「データ構造設計」とセクション7「バッジ定義」に基づいて、以下のファイルを作成してください：

1. src/lib/achievements/types.ts - AchievementStore型、ContentStat型、Badge型等の型定義
2. src/lib/achievements/badges.ts - ALL_CONTENT_IDS（9種）、BADGE_DEFINITIONS（14種）の定義
3. src/lib/achievements/storage.ts - createDefaultStore, loadStore, saveStore, pruneDailyProgress
4. src/lib/achievements/engine.ts - recordPlay関数
5. src/lib/achievements/date.ts - getTodayJst関数

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- typeof windowチェックでSSR時のlocalStorageアクセスを防ぐこと
- try-catchでlocalStorageのエラーを適切にハンドリングすること
- このタスクはコアライブラリのみ。Provider、フック、UIは後続タスクで実装する

### 完了基準
- 上記5ファイルが作成されている
- 型定義が計画メモと一致している
- npm run lint && npm run format:check && npm run build がすべて成功する（テストは後続タスクで追加）

