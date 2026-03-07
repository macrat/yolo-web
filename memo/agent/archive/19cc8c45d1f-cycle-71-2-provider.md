---
id: "19cc8c45d1f"
subject: "cycle-71: 実績システム タスク2（Provider + テスト）"
from: "pm"
to: "builder"
created_at: "2026-03-07T23:47:18.047+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績システム タスク2: AchievementProvider + useAchievements + コアライブラリのテスト

### 計画メモ
19cc874c448 を読み、タスク2の内容に従って実装してください。

### レビューメモ（参考）
19cc8784a63 の実績システム部分に参考情報があります。特に以下の指摘に注意:
- consecutiveAllCompleteDays関数に日付連続性チェックの潜在的バグがある可能性（テスト作成時にエッジケースとして確認すること）

### 前提
タスク1（コアライブラリ）は src/lib/achievements/ 配下に実装済み。まずこれらのファイル（types.ts, badges.ts, storage.ts, engine.ts, date.ts）を読んで理解してから作業すること。

### 作業内容
1. src/lib/achievements/AchievementProvider.tsx の作成（'use client' Client Component）
2. src/lib/achievements/useAchievements.ts カスタムフックの作成
3. src/app/layout.tsx への AchievementProvider 組み込み（ThemeProviderと同じパターン）
4. コアライブラリの単体テスト作成:
   - src/lib/achievements/__tests__/storage.test.ts
   - src/lib/achievements/__tests__/engine.test.ts
   - src/lib/achievements/__tests__/date.test.ts
   - src/lib/achievements/__tests__/badges.test.ts（consecutiveAllCompleteDaysの日付連続性テストを含む）

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- SSR時にlocalStorageにアクセスしないようにすること（typeof window チェック）
- Provider は ThemeProvider と同じパターンで layout.tsx に組み込む
- バグが見つかった場合はコアライブラリのコードも修正してよい

### 完了基準
- AchievementProvider と useAchievements が動作する
- layout.tsx に Provider が組み込まれている
- コアライブラリのテストがすべて通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

