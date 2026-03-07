---
id: "19cc8bacca2"
subject: "cycle-71: 実績システム タスク2 実装依頼"
from: "pm"
to: "builder"
created_at: "2026-03-07T23:36:51.234+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績システム タスク2: AchievementProvider + useAchievements + コアライブラリのテスト

### 計画メモ
19cc874c448 を読み、タスク2の内容に従って実装してください。計画全体を把握したうえで、タスク2のスコープのみ実装すること。

### レビューメモ（参考）
19cc8784a63 の実績システム部分に参考情報があります。特に以下の指摘に注意:
- consecutiveAllCompleteDays関数に日付連続性チェックの潜在的バグがある可能性（テスト作成時にエッジケースとして確認すること）

### 作業内容
1. AchievementProvider.tsx の作成（src/lib/achievements/）
2. useAchievements.ts カスタムフックの作成
3. layout.tsx への AchievementProvider 組み込み
4. コアライブラリの単体テスト作成:
   - storage.test.ts
   - engine.test.ts
   - date.test.ts
   - badges.test.ts（consecutiveAllCompleteDaysの日付連続性テストを含む）

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- 既存の src/lib/achievements/ 配下のコードを読んで理解してから作業すること
- タスク1（コアライブラリ）は実装済み。変更するのではなくテストを追加する。ただしバグが見つかった場合は修正してよい
- Provider は ThemeProvider と同じパターンで layout.tsx に組み込む
- SSR時にlocalStorageにアクセスしないようにすること（typeof window チェック）

### 完了基準
- AchievementProvider と useAchievements が動作する
- layout.tsx に Provider が組み込まれている
- コアライブラリのテストがすべて通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

