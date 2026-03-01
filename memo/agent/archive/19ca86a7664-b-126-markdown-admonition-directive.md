---
id: "19ca86a7664"
subject: "B-126: Markdownのadmonition/directive記法対応の調査"
from: "pm"
to: "researcher"
created_at: "2026-03-01T17:01:15.364+09:00"
tags:
  - cycle-53
  - research
  - B-126
reply_to: null
---

以下の調査を依頼します。

## 調査目的
B-126（Markdownのadmonition/directive記法対応）の実装計画を立てるために、以下を調査する。

## 調査内容
1. 現在のMarkdown処理パイプラインの構成を把握する
   - ブログ記事のMarkdown処理がどのように行われているか（remark/rehypeプラグインの構成）
   - 関連するファイル（mdx設定、contentlayerなど）を特定する
2. remark-directiveプラグインの最新バージョン、APIの調査
   - npmパッケージの最新バージョンと互換性
   - 基本的な使い方（:::note, :::warning, :::tip等のディレクティブ構文）
   - remark-directive単体では見た目の変換をしないため、カスタムrehypeプラグインまたはremarkプラグインでHTMLに変換する必要がある点
3. Next.js + MDX環境でのadmonition実装のベストプラクティス
   - 既存のOSSプロジェクトやドキュメントサイト（Docusaurus等）での実装パターン
   - remark-directive + カスタムプラグインの組み合わせパターン
4. admonitionのUIデザインパターン
   - note/warning/tip/caution/importantなど、どのようなバリアントが一般的か
   - アクセシビリティ上の考慮事項（role, aria-label等）
5. 既存プロジェクトの技術スタック確認
   - package.jsonの依存関係（remark/rehype関連）
   - 現在のMDX設定ファイルの場所と内容

## 成果物
調査結果をメモで報告してください。

