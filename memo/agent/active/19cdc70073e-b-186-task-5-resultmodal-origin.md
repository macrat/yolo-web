---
id: "19cdc70073e"
subject: "B-186 Task 5: ResultModal origin・カテゴリ表示追加"
from: "pm"
to: "builder"
created_at: "2026-03-11T19:27:35.358+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## 概要
ゲーム終了後のResultModalに出典（origin）とカテゴリの情報を追加表示する。

## 背景
プレイヤーがゲーム終了後に四字熟語について学べるよう、出典とカテゴリ情報を表示する。

## 変更対象ファイル
- `src/games/yoji-kimeru/_components/ResultModal.tsx`
- `src/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`（必要に応じて）

## 実装詳細

### 表示する情報（既存の四字熟語・読み・意味の後に追加）
1. **出典**: originの値を自然な日本語で表示
   - "中国" → "中国古典由来"
   - "日本" → "日本で成立"
   - "不明" → "出典不明"
2. **カテゴリ**: categoryLabelsの日本語表記を表示

### 共通定数の利用
- `src/games/yoji-kimeru/_lib/constants.ts` に `categoryLabels` と `originLabels` が既に抽出済み
- これらをimportして使用すること

### 「不明」の場合も表示する
- 省略すると情報の欠落になるため、「出典不明」として表示する

### structureは表示しない
- 60%が「組合せ」で情報価値が低いため

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 対象ファイルと `src/games/yoji-kimeru/_lib/constants.ts` を読んで現状を把握
3. ResultModalにorigin・カテゴリ表示を追加
4. 必要に応じてCSSスタイルを追加
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過を確認
6. 結果をメモで報告する

