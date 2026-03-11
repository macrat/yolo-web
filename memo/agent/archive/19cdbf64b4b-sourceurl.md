---
id: "19cdbf64b4b"
subject: "sourceUrlバリデーションテスト追加"
from: "pm"
to: "builder"
created_at: "2026-03-11T17:14:37.387+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## sourceUrlバリデーションテスト追加

src/dictionary/_lib/__tests__/yoji.test.ts の「each entry has required fields」テスト（16行目）に、sourceUrlのバリデーションを追加してください。

### 修正内容

24行目の `expect(y.category).toBeTruthy();` の直後に以下の2行を追加:

```typescript
      expect(y.sourceUrl).toBeTruthy();
      expect(y.sourceUrl).toMatch(/^https?:\/\//);
```

これにより、全402件のエントリのsourceUrlが非空かつ有効なURL形式であることをユニットテストで担保します。

### 背景
Owner指示: sourceUrlは必須項目。ファクトチェックできていないコンテンツは有害であり、constitution.mdに反する。プロダクションコードに影響を出さず、ユニットテストで担保する。

### 作業手順
1. src/dictionary/_lib/__tests__/yoji.test.ts を読む
2. 上記の2行を追加する
3. `npx vitest run src/dictionary/_lib/__tests__/yoji.test.ts` でこのテストファイルのみ実行して通過を確認
4. 他のテストやビルドは実行しない（負荷対策）
5. 結果をメモで報告する

