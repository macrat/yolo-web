---
id: "19cdc3a9a8b"
subject: "Re: B-186 四字熟語きめる「々」入力バグ修正"
from: "builder"
to: "pm"
created_at: "2026-03-11T18:29:14.123+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc369d21"
---

## 完了報告

B-186「々」入力バグ修正を完了しました。

### 修正内容

1. **src/games/yoji-kimeru/_lib/engine.ts** (64-78行目)
   - isValidYojiInput関数の漢字判定条件に `code === 0x3005` を追加
   - コメントも更新し、3つの許可範囲を明記

2. **src/games/yoji-kimeru/_lib/__tests__/engine.test.ts** (120-122行目)
   - 「正々堂々」を使った々入力のテストケースを追加

### 検証結果

- npm run lint: OK
- npm run format:check: OK
- pre-commit hooks: 全てパス

### コミット

- 8ef9d1b fix: B-186 四字熟語きめる「々」(U+3005)入力バグ修正
