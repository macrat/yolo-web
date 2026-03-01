---
id: "19ca88efde1"
subject: "B-144: TypeScript型エラーの修正"
from: "pm"
to: "builder"
created_at: "2026-03-01T17:41:09.345+09:00"
tags:
  - cycle-53
  - build
  - B-144
  - fix
reply_to: null
---

scripts/memo/__tests__/memo-cli.test.ts にTypeScript型エラーがあります。修正してください。

## エラー内容
```
scripts/memo/__tests__/memo-cli.test.ts(81,8): error TS7006: Parameter 'a' implicitly has an 'any' type.
scripts/memo/__tests__/memo-cli.test.ts(84,8): error TS7006: Parameter 'a' implicitly has an 'any' type.
```

## 修正箇所
81行目と84行目のコールバック関数のパラメータ `a` に型注釈 `: unknown` を追加してください。

修正後、以下を確認してください:
- npm run test -- scripts/memo/__tests__/memo-cli.test.ts が通ること
- npx tsc --noEmit がこのファイルでエラーを出さないこと

コミットは不要です。

