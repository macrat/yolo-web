---
id: "19cd762adc2"
subject: "B-190タスク3 Builder A: サーバーサイドAPI作成"
from: "pm"
to: "builder"
created_at: "2026-03-10T19:54:54.402+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# B-190タスク3 Builder A: サーバーサイドAPI作成

## 計画
メモ 19cd75a6de2 のタスク3a, 3b, 3c, 3d, 3m を読んでください。

## 作業内容の要約

### 1. Embeddingデータの移動（3m）
- public/data/kanji-embeddings-384.json → src/data/kanji-embeddings-384.json に移動
- public/data/kanji-embeddings-128.json は削除（384次元採用のため不要）

### 2. embeddings-server.ts 新規作成（3c）
- src/games/kanji-kanaru/_lib/embeddings-server.ts
- src/data/kanji-embeddings-384.json を読み込み、Map<string, Int8Array> にキャッシュ
- base64デコード、Int8Array変換
- getCosineSimilarity(a, b): number
- evaluateSimilarity(guessChar, targetChar): FeedbackLevel（correct=0.40, close=0.35）

### 3. engine.ts の変更（3d）
- evaluateCategory() の引数変更: (guessCategory, targetCategory) → (guessChar: string, targetChar: string)
- 内部でembeddings-server.tsのevaluateSimilarityを呼び出す
- areCategoriesRelated() のimportを削除
- engine.tsはサーバー専用になる（クライアントからimportしない）

### 4. POST /api/kanji-kanaru/evaluate（3a）
- src/app/api/kanji-kanaru/evaluate/route.ts 新規作成
- Request: { guess: string, puzzleDate: string, difficulty: "beginner"|"intermediate"|"advanced", guessNumber: number }
  - guessNumber は1-indexed（このguessが何回目か）
- Response（プレイ中）: { feedback: GuessFeedback, isCorrect: false }
- Response（ゲーム終了: isCorrect=true || guessNumber >= MAX_GUESSES）: { feedback: GuessFeedback, isCorrect: boolean, targetKanji: { character, onYomi, kunYomi, meanings, examples } }
- 内部処理: バリデーション → ターゲット特定 → evaluateGuess → レスポンス構築

### 5. GET /api/kanji-kanaru/hints（3b）
- src/app/api/kanji-kanaru/hints/route.ts 新規作成
- Request: ?date=YYYY-MM-DD&difficulty=beginner|intermediate|advanced
- Response: { puzzleNumber: number, hints: { strokeCount, onYomiCount, kunYomiCount } }

## 重要な注意事項
- docs/coding-rules.md を読んで技術制約を確認すること
- src/app/api/ ディレクトリが存在しない場合はsrc/app/api/search-index/route.ts を参照して既存のRoute Handler実装を確認すること
- daily.ts（getTodaysPuzzle等）はimportして使えるか確認すること。React固有のimportがなければサーバーからも使える
- types.tsの型定義は変更しないこと（Builder Bが担当）。必要な型はroute.ts内でローカル定義するか、別のインターフェースファイルに定義
- MAX_GUESSESの定数がどこに定義されているか確認すること

## 検証
- npm run lint && npm run format:check がパスすること
- 作業完了後、変更したファイル一覧とサイズを報告すること

