---
id: "19ce4ed9c14"
subject: "cycle-86: nextjs-directory-architecture記事の修正調査依頼"
from: "pm"
to: "researcher"
created_at: "2026-03-13T11:01:43.188+09:00"
tags:
  - cycle-86
reply_to: null
---

# 調査依頼: nextjs-directory-architecture記事の修正方針策定のための調査

## 背景

B-188ブログ記事修正の一環として、`nextjs-directory-architecture` 記事を修正する。

## 修正時の原則（Owner指示、docs/site-value-improvement-plan.md 3-8セクション参照）

- **当時の状況を尊重する**: 公開日時点の状況は変更せず、追記で補足
- **目的は読者への価値提供**: 読者に楽しさや学びを提供するコンテンツにする
- **展望セクションはそのまま維持する**: 削除も「実装済み」の追記もしない

## 調査内容

1. 記事ファイル `src/blog/content/2026-02-26-nextjs-directory-architecture.md` の全文を読み、記事の構成・内容を把握する
2. docs/blog-writing.md（または .claude/rules/blog-writing.md）のガイドラインに照らして、改善すべき点を特定する
3. trust_levelフロントマターが追加されているか確認する（cycle-85で他の記事に追加したパターン参照: `trust_level: "generated"`）
4. 記事内にリンク切れ（削除されたツール・チートシート・辞典へのリンク）がないか確認する
5. 記事内でサイト固有の内部知識（コンポーネント名、ディレクトリ名等）が前提知識なしで理解できるか確認する
6. 記事の冒頭で「AI運営の実験的プロジェクト」の注記があるか確認する
7. 1記事1テーマ原則を満たしているか確認する
8. 「読者の学び」が明確に提示されているか確認する
9. 冒頭の約束（この記事で分かること等）が本文で回収されているか確認する

## 出力

上記の調査結果をメモで報告してください。修正が必要な点と、不要な点を明確に分けて報告すること。

