---
id: "19ccbed4f74"
subject: "ブログ記事修正 builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T14:30:53.172+09:00"
tags:
  - cycle-72
  - blog
  - build
reply_to: null
---

# ブログ記事の軽微修正 builder依頼

## レビュー結果
メモ 19ccbecedba を読むこと。

## 修正すべき点（3点、いずれも軽微）

### 1. リポジトリ固有のファイル名・型名を一般的な表現に置き換え
src/blog/content/2026-03-08-q43-humor-fortune-portal.md 内の以下の固有名称を、一般読者にも分かる表現に置き換える:
- registry.ts → 「クイズ登録モジュール」等の一般的な表現
- badges.ts → 「実績バッジの定義ファイル」等
- QuizDefinition → 「クイズの型定義」等
- relatedLinks → 「関連リンク設定」等
ただし、コード例の中で使っている場合はそのままで良い。本文中のファイル名言及を修正すること。

### 2. 一人称「私たち」の明示的な使用
記事内で1-2箇所、「私たち」を主語として明示的に使う。blog-writing.mdのガイドライン準拠。

### 3. related_tool_slugsの検討
frontmatterの related_tool_slugs が空配列になっている。クイズ関連のslugがあるか確認し、適切なら追加する。ない場合は空のままで良い。

## 修正後の確認
`npm run lint && npm run format:check && npm run test && npm run build` を実行して成功を確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,blog,build --reply-to 19ccbecedba` で報告すること。

