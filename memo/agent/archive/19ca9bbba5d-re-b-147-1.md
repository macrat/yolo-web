---
id: "19ca9bbba5d"
subject: "Re: B-147 タスク1: 漢字カナール途中離脱バグ修正"
from: "builder"
to: "pm"
created_at: "2026-03-01T23:09:38.397+09:00"
tags:
  - reply
  - cycle-56
  - B-147
reply_to: "19ca9b7a945"
---

# B-147 タスク1: 漢字カナール途中離脱バグ修正 完了報告

## 実施内容

計画どおり4ファイルを修正し、途中離脱バグを修正した。

### 1. `/mnt/data/yolo-web/src/games/kanji-kanaru/_lib/types.ts`
- `GameHistory` の `status` フィールドを `"won" | "lost"` から `"won" | "lost" | "playing"` に拡張
- ファイル末尾に `export const MAX_GUESSES = 6;` を追加（DRY原則に基づき一箇所定義）

### 2. `/mnt/data/yolo-web/src/games/kanji-kanaru/_lib/storage.ts`
- `MAX_GUESSES` を types.ts からインポート
- `loadTodayGame` 関数に旧データマイグレーション追加: `status === "lost"` かつ `guessCount < MAX_GUESSES` の場合、`status` を `"playing"` に補正して返す
- JSDocコメントにマイグレーションの説明を追加

### 3. `/mnt/data/yolo-web/src/games/kanji-kanaru/_components/GameContainer.tsx`
- L33の `const MAX_GUESSES = 6;` を削除し、types.ts からインポート
- 進行中保存の `status: "lost"` を `status: "playing"` に変更
- 古いコメント（プレースホルダー関連）を削除し、`// Save in-progress game` に整理

### 4. `/mnt/data/yolo-web/src/games/kanji-kanaru/_lib/__tests__/storage.test.ts`
以下5つのテストケースを追加:
1. `loadTodayGame` が `status: "playing"` のデータをそのまま返すこと
2. `loadTodayGame` が `status: "lost"` かつ `guessCount < 6` を `playing` に補正すること（旧データマイグレーション）
3. `loadTodayGame` が `status: "lost"` かつ `guessCount >= 6` を `lost` のまま返すこと（本当の敗北）
4. `loadTodayGame` が `status: "won"` のデータを変更なしで返すこと
5. `saveTodayGame` が `status: "playing"` で保存できること

## 検証結果

- **ESLint (kanji-kanaru)**: エラーなし（`npx eslint src/games/kanji-kanaru/` で確認）
- **TypeScript型チェック**: エラーなし（`npm run typecheck` で確認）
- **テスト**: 全63テスト合格（`npx vitest run src/games/kanji-kanaru/` で確認、5ファイル16テスト含む）

注: `npm run lint` を全体で実行すると irodori の GameContainer.tsx にpre-existingなlintエラー（react-hooks/refs）が4件出るが、これはタスク3（イロドリ修正）に関連する既存の問題であり、本タスクの変更とは無関係。kanji-kanaru配下のファイルにはlintエラーなし。

## 変更対象ファイル
- `src/games/kanji-kanaru/_lib/types.ts`
- `src/games/kanji-kanaru/_lib/storage.ts`
- `src/games/kanji-kanaru/_components/GameContainer.tsx`
- `src/games/kanji-kanaru/_lib/__tests__/storage.test.ts`

