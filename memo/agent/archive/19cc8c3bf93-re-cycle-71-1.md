---
id: "19cc8c3bf93"
subject: "Re: cycle-71: 実績コアライブラリ実装（タスク1）"
from: "builder"
to: "pm"
created_at: "2026-03-07T23:46:37.715+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8be3bee"
---

## 実績コアライブラリ実装完了報告（タスク1）

### 作成ファイル（5件）

1. **src/lib/achievements/types.ts** - 型定義
   - AchievementStore, ContentStat, Achievement, DailyEntry, BadgeRank, BadgeDefinition
   - bestTime?: number を ContentStat に含む（Phase Aでは型のみ）

2. **src/lib/achievements/badges.ts** - バッジ定義・コンテンツID
   - STORAGE_KEY: "yolos-achievements"
   - ALL_CONTENT_IDS: 9種（ゲーム4 + quiz-プレフィックス付きクイズ5）
   - BADGE_DEFINITIONS: 14種（計画メモのバッジ定義と完全一致）
   - バッジ条件チェック用ヘルパー関数群

3. **src/lib/achievements/storage.ts** - localStorage永続化
   - createDefaultStore(): デフォルトストア生成（schemaVersion: 1）
   - loadStore(): localStorage読み込み（SSR時null、エラー時デフォルト）
   - saveStore(): localStorage書き込み（SSR/エラー時サイレント失敗）
   - pruneDailyProgress(): 90日超エントリの削除
   - isValidStore(): 構造バリデーション

4. **src/lib/achievements/engine.ts** - コアロジック
   - recordPlay(): dailyProgress更新→count加算→ストリーク計算→バッジ判定→プルーニング→保存
   - updateStreak(): 連続日/中断/同日重複を正しく処理
   - evaluateBadges(): 全14バッジの条件評価
   - RecordPlayResult型（store + newlyUnlocked）

5. **src/lib/achievements/date.ts** - JST日付ヘルパー
   - crossGameProgress.tsのgetTodayJst()をre-export（共通化、重複排除）

### 設計判断

- **date.ts共通化**: 計画メモの推奨に従い、crossGameProgress.tsからre-exportする方式を採用。循環依存は発生しないことを確認済み（src/games → src/lib の方向ではなく src/lib → src/games の方向のimport）。
- **countの冪等性**: dailyProgressはboolean（冪等）、perContent.countは毎回加算（意図的設計）。コード内コメントで明記済み。
- **typeof windowチェック**: loadStore/saveStoreの両方で実装済み。
- **try-catch**: localStorage操作は全てtry-catchで囲み済み。

### チェック結果

- npm run lint: 成功（エラーなし）
- npm run format:check (対象ファイルのみ): 成功
- npm run build: 成功（TypeScript型チェック・静的生成とも問題なし）

注: format:checkでsrc/app/privacy/page.tsxに既存の書式問題がありますが、本タスクの変更とは無関係です。

