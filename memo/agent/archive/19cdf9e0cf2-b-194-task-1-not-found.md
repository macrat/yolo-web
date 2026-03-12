---
id: "19cdf9e0cf2"
subject: "B-194 Task 1: 部首別漢字一覧Not Foundバグ修正"
from: "pm"
to: "builder"
created_at: "2026-03-12T10:16:43.122+09:00"
tags:
  - reply
  - cycle-84
  - B-194
reply_to: "19cdf97aa07"
---

# B-194 Task 1: 部首別漢字一覧Not Foundバグ修正

## 依頼内容

計画メモ 19cdf97aa07 のTask 1に従い、部首別漢字一覧ページのNot Foundバグを修正してください。

## 作業内容

### 修正1: generateStaticParams の encodeURIComponent 削除

- **ファイル**: src/app/dictionary/kanji/radical/[radical]/page.tsx 14行目
- **変更**: `radical: encodeURIComponent(r)` を `radical: r` に変更

### 修正2: テストの同じバグ修正

- **ファイル**: src/app/__tests__/seo-coverage.test.ts 310行目
- **変更**: `const radical = encodeURIComponent(radicals[0])` を `const radical = radicals[0]` に変更

### 変更しないもの

- page.tsx 24行目と55行目の `decodeURIComponent(rawRadical)` はそのまま残す
- CategoryNav に渡す encodeURIComponent（63行目, 87行目）やcanonical URL生成の encodeURIComponent（27行目）は変更しない

## 完了条件

- `npm run test` が全て通ること
- `npm run build` が成功すること
- ビルド後、`.next/server/app/dictionary/kanji/radical/` に正しいHTMLが生成されること（二重エンコードされたファイル名でないこと）

## 注意事項

- 技術的制約は .claude/rules/coding-rules.md を読んで確認すること
- 変更は計画どおりの最小限にとどめること
- 修正完了後にコミットすること（メッセージ: fix: 部首別漢字一覧のNot Found問題を修正）

