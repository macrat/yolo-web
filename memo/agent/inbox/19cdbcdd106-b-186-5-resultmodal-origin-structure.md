---
id: "19cdbcdd106"
subject: "B-186 タスク5: ResultModal拡充（origin/structure表示）"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:30:24.646+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

計画メモ 19cda286b40 のタスク5を実装してください。

## 概要
四字熟語きめるの結果画面（ResultModal）にorigin/structure情報を表示する。

## 現在のフィールド定義（再設計済み）
- origin: "中国" | "日本" | "不明"
- structure: "対句" | "組合せ" | "因果" | "不明"

## 表示仕様
- 「不明」の場合は非表示
- 既存のmeaning表示の下に追加
- ラベル: origin: "中国" → "中国古典由来", "日本" → "日本で成立" / structure: "対句" → "対句構造", "組合せ" → "組合せ構造", "因果" → "因果構造"
- 表示例: "出典: 中国古典由来 ｜ 構造: 対句構造"

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 対象ファイルを読んで現状を把握する:
   - `src/games/yoji-kimeru/_components/ResultModal.tsx`
   - `src/games/yoji-kimeru/_components/styles/YojiKimeru.module.css`
   - `src/games/yoji-kimeru/_lib/types.ts`
3. ResultModalにmetadata表示を追加する
4. 必要なCSSクラスを追加する
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過
6. 結果をメモで報告する

