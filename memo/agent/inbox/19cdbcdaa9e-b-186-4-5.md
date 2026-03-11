---
id: "19cdbcdaa9e"
subject: "B-186 タスク4: ヒントシステム拡充（5段階ヒント）"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:30:14.814+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

計画メモ 19cda286b40 のタスク4を実装してください。

## 概要
四字熟語きめるのHintBarにorigin/structureヒントを追加し、5段階の段階的ヒント開示を実装する。

## 現在のフィールド定義（再設計済み）
- origin: "中国" | "日本" | "不明"
- structure: "対句" | "組合せ" | "因果" | "不明"

## 5段階ヒント
1. 常時表示: 難易度（既存）
2. 2回目の推測後: 構造パターン（新規）。「不明」の場合はスキップ
3. 3回目の推測後: 読みの最初の文字（既存）
4. 4回目の推測後: 出典区分（新規）。「不明」の場合はスキップ
5. 5回目の推測後: カテゴリ（既存）

## ラベル表示
- origin: "中国" → "中国古典由来", "日本" → "日本で成立"
- structure: "対句" → "対句構造", "組合せ" → "組合せ構造", "因果" → "因果構造"

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 対象ファイルを読んで現状を把握する:
   - `src/games/yoji-kimeru/_components/HintBar.tsx`
   - `src/games/yoji-kimeru/_components/GameContainer.tsx`
   - `src/games/yoji-kimeru/_lib/types.ts`
3. HintBarのpropsにorigin/structureを追加し、5段階ヒントを実装する
4. GameContainer.tsxでHintBarにorigin/structureを渡す
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過
6. 結果をメモで報告する

