---
name: frontend-design
description: |
  yolos.net のフロントエンドデザインシステム。色・カラー・タイポグラフィ・
  フォント・レイアウト・余白・スペーシング・角丸・ヘッダー・フッター・ボタン・
  パネル・入力欄・記事エリア・CSS Modules について作業するとき、または
  デザインレビュー・UI レビュー・視覚的変更のレビューを行うときに参照する。
  Named Tone（functional-quiet 等）・CSS 変数・コンポーネント API を含む。
user-invocable: false
paths:
  - "src/**/*.tsx"
  - "src/**/*.module.css"
  - "src/app/globals.css"
---

<!-- このファイルは T-07 で本文を書く。現時点は玄関（frontmatter確定）のみ。 -->

# frontend-design スキル

yolos.net のデザインシステムガイドライン。

## ドキュメント構成

| ファイル        | 内容                             | 担当タスク   |
| --------------- | -------------------------------- | ------------ |
| `philosophy.md` | デザイン哲学・トーン・NEVER 節   | T-01（完了） |
| `variables.md`  | CSS 変数の用途・命名規約・使用例 | T-03         |
| `components.md` | コンポーネント API 早見表        | T-06         |

> 詳細は各ファイルを参照してください。本ファイル（SKILL.md）は玄関です。

<!-- T-07 でこの本文を再構成する。T-07 受け入れ基準（cycle-170.md L120-125）に従い、
以下の要素を追加すること:
- Quick reference: よく使うトークン・コンポーネント名の早見表
- Quick rules: 守るべき実装ルールの箇条書き（3〜5 項目）
- NEVER 節: やってはいけないこと（philosophy.md の NEVER と整合させる）
- 関連ファイルへの Markdown リンク（例: [philosophy.md](philosophy.md) 形式）
-->
