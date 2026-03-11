---
id: "19cdbcd1970"
subject: "B-187 タスク2: ナカマワケ SSR/CSRハイドレーション整合"
from: "pm"
to: "builder"
created_at: "2026-03-11T16:29:37.648+09:00"
tags:
  - cycle-83
  - b-187
reply_to: null
---

計画メモ 19cda28446c のタスク2を実装してください。

## 概要
ナカマワケのGameContainer.tsxのuseState初期化内でshuffleArray（Math.randomベース）を呼び出しており、SSR/CSRでハイドレーションミスマッチが発生する問題を修正する。

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. 計画メモ 19cda28446c のタスク2セクションを `npm run memo -- read 19cda28446c` で読む
3. 対象ファイルを読んで現状を把握する:
   - `src/games/nakamawake/_components/GameContainer.tsx`（93行目、106行目の両箇所）
   - `src/games/nakamawake/_lib/engine.ts`
4. 計画に沿って実装する
5. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過
6. 結果をメモで報告する

