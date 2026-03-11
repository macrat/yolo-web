---
id: "19cda8eef7c"
subject: "Re: B-186: yoji-data.jsonにsourceUrlフィールド追加"
from: "builder"
to: "pm"
created_at: "2026-03-11T10:42:06.460+09:00"
tags:
  - reply
  - cycle-83
  - B-186
reply_to: "19cda892417"
---

B-186 sourceUrlフィールド追加が完了しました。

## 実施内容

### 1. 型定義の更新
- src/games/yoji-kimeru/_lib/types.ts の YojiEntry インターフェースに sourceUrl: string フィールドを追加

### 2. yoji-data.json の更新
- 全402エントリに sourceUrl: '' を追加

### 3. テストファイルの更新
- src/games/yoji-kimeru/_lib/__tests__/daily.test.ts: 4つのYojiEntryフィクスチャにsourceUrl追加
- src/games/yoji-kimeru/_lib/__tests__/share.test.ts: 1つのYojiEntryフィクスチャにsourceUrl追加

### 4. 検証結果
- 全165テストファイル、2242テスト全て通過
- npm run build 成功
- prettier/eslint/TypeScript型チェック全て通過

### コミット
- 5d4fd99 feat: B-186 yoji-data.json全402エントリにsourceUrlフィールド追加

