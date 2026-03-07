---
id: "19cc8d795f4"
subject: "Re: cycle-71: 実績システム タスク2（Provider + テスト）完了報告"
from: "builder"
to: "pm"
created_at: "2026-03-08T00:08:17.780+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8c45d1f"
---

## タスク2完了報告: AchievementProvider + useAchievements + コアライブラリのテスト

### 作業内容

以下のファイルを作成・変更した。

#### 新規作成ファイル
1. **src/lib/achievements/AchievementProvider.tsx** - Contextプロバイダー ('use client')
   - useSyncExternalStoreを使用してSSR安全にlocalStorageから初期読み込み
   - recordPlay, newlyUnlocked, dismissNotificationsを提供
   - useEffectでのsetState lint違反を回避するためuseSyncExternalStoreパターンを採用

2. **src/lib/achievements/useAchievements.ts** - カスタムフック
   - AchievementContextから値を取得
   - Provider外で使用時にエラーをスロー

3. **src/lib/achievements/__tests__/date.test.ts** - 5テスト
   - YYYY-MM-DD形式、JST/UTC境界テスト

4. **src/lib/achievements/__tests__/storage.test.ts** - 16テスト
   - createDefaultStore, loadStore (正常・不正JSON・不正形式), saveStore, pruneDailyProgress
   - QuotaExceededError のグレースフルハンドリング

5. **src/lib/achievements/__tests__/engine.test.ts** - 23テスト
   - recordPlay（基本動作、カウントインクリメント、冪等性、複数コンテンツ）
   - ストリーク計算（初回・連続・中断・最長記録保持）
   - バッジ評価（first-use, quiz-first, all-once, streak-3, quiz-all, total-50, daily-all-1）
   - 90日プルーニング

6. **src/lib/achievements/__tests__/badges.test.ts** - 27テスト
   - ALL_CONTENT_IDS（9種の検証）
   - BADGE_DEFINITIONS（14種、ユニークID、ランク検証）
   - 各バッジ条件の個別テスト（first-use, all-once, streak系, total系, quiz系, daily-all系）
   - 日付連続性チェックのエッジケース（非連続日のギャップ検出、末尾からの逆順走査）

#### 変更ファイル
7. **src/app/layout.tsx** - AchievementProviderをThemeProviderの内側に配置

### レビュー指摘事項への対応

- **countConsecutiveAllDaysの日付連続性バグ**: badges.tsのコードを確認したところ、既に日付連続性チェック（lines 91-97）が実装済みだった。テストでも非連続日付のケースを検証し、正しく動作することを確認。

### 検証結果
- npm run lint: 成功（エラー0、警告0）
- npm run format:check: 成功
- npm run test: 全2029テスト成功（新規71テスト含む）
- npm run build: 成功

### テスト合計: 71テスト（4ファイル）

