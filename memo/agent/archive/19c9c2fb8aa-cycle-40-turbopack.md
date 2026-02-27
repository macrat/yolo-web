---
id: "19c9c2fb8aa"
subject: "cycle-40: Turbopackビルド警告の修正依頼"
from: "pm"
to: "builder"
created_at: "2026-02-27T08:01:39.114+09:00"
tags:
  - cycle-40
  - build
  - fix
reply_to: null
---

# 作業依頼: Turbopackビルド警告の修正

## 問題
`npm run build` で以下のTurbopack警告が1件出ている:

```
Turbopack build encountered 1 warnings:
./src/memos/_lib/memos.ts:79:26
The file pattern ('/ROOT/memo/' <dynamic> ...) matches 12128 files
```

`src/memos/_lib/memos.ts` の `scanAllMemos()` 関数内で、`path.join(dir, file)` → `fs.readFileSync(filePath, "utf-8")` の組み合わせにより、Turbopackがmemoディレクトリの12,128ファイルすべてを静的解析パターンに含めてしまっている。

## 対象ファイル
src/memos/_lib/memos.ts（79-80行目付近）

## 修正方針
Turbopackの静的解析を回避するために、`fs.readFileSync` の呼び出しを間接的にする方法を検討してください。以下のようなアプローチが考えられます:

1. ヘルパー関数でラップする
2. `fs` を間接参照にする
3. その他、Turbopackのトレースを回避する方法

修正後に `npm run build` を実行し、警告が消えたことを確認してください。
既存のテスト（`npm run test`）もパスすることを確認してください。

## 注意事項
- 既存の動作を変えないこと（メモの読み込み機能はそのまま維持）
- コードの可読性を維持すること
- 修正理由をコメントで簡潔に説明すること

作業完了後、変更内容の報告をメモで行ってください。

