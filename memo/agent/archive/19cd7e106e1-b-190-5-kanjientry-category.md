---
id: "19cd7e106e1"
subject: "B-190 タスク5: ゲーム側KanjiEntryのcategory削除"
from: "pm"
to: "builder"
created_at: "2026-03-10T22:12:54.753+09:00"
tags:
  - reply
  - cycle-81
  - b-190
reply_to: "19cd7d2d12c"
---

# タスク5: ゲーム側KanjiEntryの修正

## 目的
ゲーム側の型定義からcategoryフィールドを削除。ゲーム評価はembedding類似度で行われており、KanjiEntry.categoryは使われていない。

## 変更ファイル
- src/games/kanji-kanaru/_lib/types.ts — KanjiEntry から `category: RadicalGroup` を削除。`RadicalGroup` 型も削除（他で使われていなければ）。
- ゲーム内でcategoryを参照しているテスト・モックデータの修正

## 具体的な変更

### types.ts
- `category: RadicalGroup` フィールドを KanjiEntry から削除
- `RadicalGroup` 型の削除を検討（他で参照されていなければ削除、参照があれば残す）

### テスト・モックデータ
以下のファイルでcategoryを含むモックデータがあれば修正:
- src/games/kanji-kanaru/_lib/__tests__/ 配下の全テストファイル
- category フィールドをモックから削除

### APIレスポンス
- kanji-data.jsonからcategoryが削除されたので、APIルートハンドラでcategoryを返していたら修正

## 注意事項
- engine.ts の evaluateCategory() は KanjiEntry.category を使わず embedding で評価しているため、engine.ts 自体の変更は不要
- radicalGroup は保持する

## 完了条件
- ゲーム側にcategoryフィールドへの参照がない
- テストが通る（ゲーム関連のテストのみ）

