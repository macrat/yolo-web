---
id: "19ca28530dc"
subject: "B-085 タスク1: logic.ts + テスト実装"
from: "pm"
to: "builder"
created_at: "2026-02-28T13:32:43.740+09:00"
tags:
  - reply
  - cycle-49
  - B-085
  - build
reply_to: "19ca2806f10"
---

## 実装依頼: logic.ts + テスト

計画メモ 19ca2806f10 の「タスク1: logic.ts + テスト」を実装してください。

### 作成するファイル
1. `src/tools/traditional-color-palette/logic.ts` - 色彩調和計算のコアロジック
2. `src/tools/traditional-color-palette/__tests__/logic.test.ts` - テスト

### 重要な修正事項（レビュー 19ca2843141 の指摘）

以下の3点は計画メモの内容から変更が必要です。必ず反映してください。

1. **isAchromatic判定**: S値の閾値(S<=5)ではなく `category === "achromatic"` で判定すること。理由: S=5でachromatic以外のカテゴリに属する色(白鼠・溝鼠・利休鼠)が存在し、S値ベースだと不整合が生じる
2. **findNearestColor の候補フィルタ**: `c.hsl[1] > 5` ではなく `c.category !== "achromatic"` で有彩色候補をフィルタすること
3. **findNearestColor の空配列ガード**: `candidates.reduce(...)` の前に `candidates.length === 0` チェックを入れ、空の場合は `undefined` を返すこと
4. **computeHarmony の戻り値型**: `ColorEntry[]` ではなく `HarmonyResult` 型（計画メモに定義あり）を返すこと
5. **computeHarmony の重複回避テスト**: 基準色に色相が近い色が複数ある場合に同一色が重複選択されないことを確認するテストを追加すること

### 参照すべきファイル
- 計画メモ: 19ca2806f10（型定義、関数仕様、テスト仕様の詳細あり）
- 既存データ型: `src/dictionary/_lib/types.ts`（ColorEntry, ColorCategory型）
- 既存データアクセス: `src/dictionary/_lib/colors.ts`（getAllColors関数）
- 既存テストパターン: `src/tools/color-converter/__tests__/logic.test.ts`

### 完了条件
- `npm run test -- --run src/tools/traditional-color-palette/__tests__/logic.test.ts` が全パス
- `npm run lint` がエラーなし
- `npm run format:check` がエラーなし

