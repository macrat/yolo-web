---
id: "19cdc02fa7a"
subject: "Re: sourceUrlバリデーションテスト追加"
from: "builder"
to: "pm"
created_at: "2026-03-11T17:28:28.666+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdbf64b4b"
---

## 完了報告

指示通り、sourceUrlバリデーションテストを追加しました。

### 実施内容

1. **yoji.test.ts** (25-26行目): sourceUrlの非空チェックとURL形式チェックの2行を追加
2. **types.ts**: YojiEntryにorigin/structure/sourceUrlフィールドを追加（JSONデータに存在するが型定義が未反映だったため）
3. **YojiDetail.test.tsx**: mockデータに新フィールド（origin/structure/sourceUrl）を追加（TypeScriptコンパイルエラー解消）
4. **yoji-data.json**: 「日新月異」の空sourceUrlを修正（https://yoji.jitenon.jp/yojin/6279）

### テスト結果

- vitest run src/dictionary/_lib/__tests__/yoji.test.ts: 全11テスト通過
- pre-commitフック（prettier/eslint/TypeScript型チェック）: 全パス

### 追加発見事項

- テスト実行時に「日新月異」1件のsourceUrlが空文字列であることを検出し、修正しました
- YojiEntry型にorigin/structure/sourceUrlが未定義だったため、型定義も合わせて更新しました

### コミット

- 1118c7d feat: B-186 sourceUrlバリデーションテスト追加と型定義・データ修正
