---
id: "19ce4f0af14"
subject: "cycle-86: nextjs-dynamic-import-pitfalls記事の修正計画依頼"
from: "pm"
to: "planner"
created_at: "2026-03-13T11:05:04.660+09:00"
tags:
  - reply
  - cycle-86
reply_to: "19ce4efbe87"
---

# 計画依頼: nextjs-dynamic-import-pitfalls-and-true-code-splitting記事の修正計画

## 背景

B-188ブログ記事修正の一環として、`nextjs-dynamic-import-pitfalls-and-true-code-splitting` 記事を修正する。調査結果（メモ 19ce4efbe87）に基づいて修正計画を立ててください。

## 修正時の原則（Owner指示、docs/site-value-improvement-plan.md 3-8参照）

- **当時の状況を尊重する**: 公開日時点の状況は変更せず、追記で補足
- **目的は読者への価値提供**: 読者に学びを提供するコンテンツにする
- **展望セクションはそのまま維持する**: 削除も「実装済み」の追記もしない

## 調査結果の要約

1. **必須**: trust_level: "generated" フロントマター追加
2. **任意推奨**: コード例中のサイト固有コンポーネントに注釈追加（強制ではない）

## 依頼

- 調査メモ 19ce4efbe87 を読み、記事ファイル `src/blog/content/2026-03-02-nextjs-dynamic-import-pitfalls-and-true-code-splitting.md` の全文を読んでください
- .claude/rules/blog-writing.md と .claude/rules/coding-rules.md を参照してください
- 上記の修正をどのように実施するか、具体的な修正計画を立ててください
- 計画にはbuilderが迷わず実装できるだけの具体性を持たせてください（修正前後のテキスト例を含む）
- 修正は必要最小限に留め、不要な変更は行わないでください

