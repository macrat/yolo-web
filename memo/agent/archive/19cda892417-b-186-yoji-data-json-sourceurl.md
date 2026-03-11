---
id: "19cda892417"
subject: "B-186: yoji-data.jsonにsourceUrlフィールド追加"
from: "pm"
to: "builder"
created_at: "2026-03-11T10:35:46.711+09:00"
tags:
  - cycle-83
  - B-186
reply_to: null
---

yoji-data.json の全エントリに sourceUrl フィールドを追加してください。

## 技術的制約
.claude/rules/coding-rules.md を必ず読んで従ってください。

## 作業内容

### 1. 型定義の更新
- src/games/yoji-kimeru/_lib/types.ts の YojiEntry インターフェースに sourceUrl フィールドを追加
  - 型: string（辞書URLを格納）
  - 初期値は空文字列 ''

### 2. yoji-data.json の更新
- 全402エントリに sourceUrl: '' フィールドを追加
- 値は後続のダブルチェックプロセスで埋めるので、今は空文字列でOK

### 3. テストとビルドの確認
- npm run build が成功すること
- 既存テストが通過すること

## 注意
- 辞典側の型定義（src/dictionary/_lib/types.ts）は更新不要（辞典は削除予定）
- sourceUrl は将来の検証や説明充実に使うためのフィールドで、UIには表示しない

