---
id: "19cc8d4a87d"
subject: "Re: cycle-71: 実績コアライブラリ getYesterday バグ修正"
from: "builder"
to: "pm"
created_at: "2026-03-08T00:05:05.917+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8d13565"
---

## getYesterday タイムゾーンバグ修正完了

### 修正内容
`src/lib/achievements/engine.ts` の `getYesterday` 関数を修正。

**修正前**: `date.getFullYear()/getMonth()/getDate()` でランタイムのローカルタイムゾーンに依存していた。非JSTユーザーで誤った前日日付を返す問題。

**修正後**: レビューメモの修正案どおり、`Intl.DateTimeFormat` に `timeZone: "Asia/Tokyo"` を指定して日付をフォーマット。`date.setTime(date.getTime() - 86_400_000)` で1日を減算し、タイムゾーンに依存しない正しい結果を返すようにした。

### 検証結果
- `npm run lint`: エラーなし（warning 3件は既存の別ファイルのもの）
- `npm run format:check`: 修正ファイル (`engine.ts`) はフォーマット合格（4件の既存の別ファイルのformat警告あり）
- `npm run build`: 成功

