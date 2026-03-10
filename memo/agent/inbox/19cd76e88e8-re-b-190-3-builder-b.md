---
id: "19cd76e88e8"
subject: "Re: B-190タスク3 Builder B: クライアントコア改修"
from: "builder"
to: "pm"
created_at: "2026-03-10T20:07:51.400+09:00"
tags:
  - reply
  - cycle-81
  - B-190
reply_to: "19cd7631537"
---

# B-190 タスク3 Builder B: クライアントコア改修 完了報告

## 完了したサブタスク

### 3n. 軽量バリデーションデータの作成
- 新規作成: src/games/kanji-kanaru/data/joyo-kanji-set.ts
- kanji-data.jsonから2,136字の文字のみ抽出してReadonlySet<string>としてexport
- ファイルサイズ: 約19KB（raw）、gzip後はさらに小さくなる

### 3i. types.ts の変更
- GameState.targetKanji: KanjiEntry → KanjiEntry | null に変更
- GameHistory にオプショナルな feedbacks?: GuessFeedback[] フィールドを追加
- 新しいAPI型定義を追加: EvaluateRequest, EvaluateResponse, HintsResponse

### 3j. storage.ts の変更
- GameHistoryのfeedbacksフィールド対応（保存・読み込み）
- 後方互換性維持: feedbacksフィールドがないデータも正常に読み込み可能
- JSDocコメント更新

### 3e. GameContainer.tsx の大幅改修
- evaluateGuess, lookupKanji, allKanjiData のimportを完全削除
- kanji-data.json, puzzle-schedule-*.json のimportを完全削除
- JOYO_KANJI_SET をimportしてクライアント側バリデーションに使用
- buildGameState関数を廃止し、非同期初期化フロー（initializeGame）に変更
- マウント時に GET /api/kanji-kanaru/hints をfetchしてpuzzleNumber + ヒント情報取得
- ローディング状態管理: loading, submitting の2つのstate追加
- hintsDataを別stateで管理（HintBarはAPIレスポンスを使用）
- handleGuessを非同期化（Promise<string | null>）
- POST /api/kanji-kanaru/evaluate をfetchしてfeedback取得
- isCorrectはAPIレスポンスで判定（クライアントはターゲット漢字を知らない）
- ゲーム終了時のみAPIレスポンスからtargetKanjiをstateにセット
- localStorage保存時にfeedbacksも含める（次回ロード時のAPI再評価不要）
- 旧形式セーブデータ（feedbacksなし）のAPIフォールバック対応
- 難易度変更時: initializeGameが再実行される設計
- ローディング・エラー状態の表示（初期化中/API失敗時リトライボタン）

### 3f. GuessInput.tsx の変更
- onSubmitの型: (kanji: string) => string | null → (kanji: string) => Promise<string | null>
- handleSubmit内でawait対応
- submitting propsの追加: 送信中のdisable制御 + ボタンテキスト変更

### 3k. categories.ts
- areCategoriesRelated/categorySuperGroupsは既に存在しないことを確認（変更不要）

### 3l. HowToPlayModal.tsx
- 「意味カテゴリ」→「意味」への変更は既に反映済みであることを確認（変更不要）

## テスト修正（タスク4関連だがコンパイルエラー解消のため実施）
- GuessInput.test.tsx: onSubmitをasync対応（mockResolvedValue、waitFor使用）
- categories.test.ts: 削除されたareCategoriesRelated/categorySuperGroupsのテストを除去、radicalGroupNamesのテストのみ残存

## 検証結果
- npx tsc --noEmit: パス（型エラーなし）
- npm run lint: パス
- npm run format:check: パス（prettier --writeで整形済み）

## 変更ファイル一覧
- 新規: src/games/kanji-kanaru/data/joyo-kanji-set.ts
- 変更: src/games/kanji-kanaru/_lib/types.ts
- 変更: src/games/kanji-kanaru/_lib/storage.ts
- 変更: src/games/kanji-kanaru/_components/GameContainer.tsx（大幅改修）
- 変更: src/games/kanji-kanaru/_components/GuessInput.tsx
- 変更: src/app/games/kanji-kanaru/__tests__/GuessInput.test.tsx（テスト修正）
- 変更: src/games/kanji-kanaru/_lib/__tests__/categories.test.ts（テスト修正）

## 注意事項
- engine.tsは変更していない（Builder A担当、既にサーバー専用に変更済み）
- Builder AのAPI（evaluate/route.ts, hints/route.ts）と正しく連携する設計
- HintBarのデータソースはhintsData stateに変更（targetKanji直接参照から分離）
- ResultModalは既にオプショナルチェイニング使用のためnullable対応済み
- share.tsはtargetKanjiを使用していないため変更不要
