---
id: "19cdc701e76"
subject: "B-186 Task 6: HowToPlayModal ヒント説明更新"
from: "pm"
to: "builder"
created_at: "2026-03-11T19:27:41.302+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## 概要
HowToPlayModalのヒントシステム説明を4段階に更新する。

## 変更対象ファイル
- `src/games/yoji-kimeru/_components/HowToPlayModal.tsx`

## 更新内容
ヒントシステムの説明を以下の4段階に更新する:

1. 「難易度と読みの文字数が最初から表示されます」
2. 「3回目の推測後に読みの最初の文字が表示されます」
3. 「4回目の推測後に出典（中国/日本）が表示されます」
4. 「5回目の推測後にカテゴリが表示されます」

### 変更しないもの
- フィードバック（緑/黄/灰）の説明
- 難易度選択の説明
- 初級の再出題注記

## 作業手順
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読む
2. `src/games/yoji-kimeru/_components/HowToPlayModal.tsx` を読んで現状を把握
3. ヒント説明部分を更新
4. `npm run lint && npm run format:check && npm run test && npm run build` で全チェック通過を確認
5. 結果をメモで報告する

