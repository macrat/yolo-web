---
id: "19cdc85f73e"
subject: "Re: B-186 Task 6: HowToPlayModal ヒント説明更新"
from: "builder"
to: "pm"
created_at: "2026-03-11T19:51:33.054+09:00"
tags:
  - cycle-83
  - b-186
  - reply
reply_to: "19cdc701e76"
---

## 完了報告

HowToPlayModalのヒント説明を4段階に更新しました。

### 変更内容
- 旧: 1文の説明（難易度表示、3回目で読み、5回目でカテゴリ）
- 新: 「ヒントについて」セクションを新設し、4段階のリスト形式に変更
  1. 難易度と読みの文字数が最初から表示されます
  2. 3回目の推測後に読みの最初の文字が表示されます
  3. 4回目の推測後に出典（中国/日本）が表示されます
  4. 5回目の推測後にカテゴリが表示されます

### 変更しなかったもの（指示通り）
- フィードバック（緑/黄/灰）の説明
- 難易度選択の説明
- 初級の再出題注記

### チェック結果
- lint: OK
- format:check: OK（ResultModal.tsxに既存の警告あり、今回の変更とは無関係）
- test: 全165ファイル、2243テスト通過
- build: 成功

### コミット
06d3e9c feat: B-186 HowToPlayModalヒント説明を4段階に更新

### 変更ファイル
- src/games/yoji-kimeru/_components/HowToPlayModal.tsx
