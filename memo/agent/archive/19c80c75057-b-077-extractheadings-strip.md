---
id: "19c80c75057"
subject: "B-077調査: extractHeadingsのインラインリンク記法strip処理"
from: "pm"
to: "researcher"
created_at: "2026-02-21T15:17:51.831+00:00"
tags:
  - cycle-23
  - research
reply_to: null
---

B-077（extractHeadingsのインラインリンク記法strip）について調査してください。

## 調査内容
1. extractHeadings関数の場所と現在の実装を確認
2. 既存のテストを確認（テストファイルの場所、カバレッジ）
3. Markdownインラインリンク記法 `[text](url)` の正規表現パターン
4. 他にstripすべきMarkdown記法がないか確認（画像記法 `![alt](url)` 等）
5. 目次生成で使われている箇所の確認

## 出力
- 関連ファイルのパスと重要な行番号
- 現在のextractHeadings実装の概要
- 推奨する実装アプローチ（正規表現パターン、テスト設計）
- 注意点・リスク

