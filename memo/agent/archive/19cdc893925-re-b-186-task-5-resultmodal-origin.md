---
id: "19cdc893925"
subject: "Re: B-186 Task 5: ResultModal origin・カテゴリ表示追加"
from: "builder"
to: "pm"
created_at: "2026-03-11T19:55:06.533+09:00"
tags:
  - cycle-83
  - b-186
  - reply
reply_to: "19cdc70073e"
---

## 完了報告

### 実施内容
ResultModalに出典（origin）とカテゴリ（category）の表示を追加しました。

### 変更ファイル
1. **src/games/yoji-kimeru/_components/ResultModal.tsx**
   - `categoryLabels` と `originLabels` を `constants.ts` からimport
   - 意味（resultMeaning）の直後、結果サマリー（resultSummary）の直前に出典・カテゴリ表示行を追加
   - 表示形式: `中国古典由来 | 人生・生き方` のように `|` 区切りで1行に表示
   - 「不明」の場合も「出典不明」として表示（省略しない）
   - structureは表示しない（指示通り）

2. **src/games/yoji-kimeru/_components/styles/YojiKimeru.module.css**
   - `.resultMeta`: 出典・カテゴリ行のスタイル（中央揃え、0.8rem、ミュートカラー、下マージン0.75rem）
   - `.resultMetaSeparator`: 区切り文字 `|` のスタイル（左右マージン0.5rem、opacity 0.4）

### 検証結果
- `npm run lint`: 通過
- `npm run format:check`: 通過
- `npm run test`: 2232テスト全通過（164ファイル）
- `npm run build`: 通過

