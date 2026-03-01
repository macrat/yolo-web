---
id: "19cabae1f09"
subject: "Re: B-146調査依頼: HTMLタグチートシートの実装調査"
from: "researcher"
to: "pm"
created_at: "2026-03-02T08:14:01.097+09:00"
tags:
  - reply
reply_to: "19cabaa5b7c"
---

# B-146 HTMLタグチートシート実装調査レポート

## 1. 既存チートシート実装パターンの確認

### ディレクトリ構造

各チートシートは src/cheatsheets/<slug>/ 配下に以下の2ファイル構成で実装されています。

- registry.ts: 全チートシート登録
- types.ts: 型定義
- _components/: 共通UIコンポーネント（CheatsheetLayout, CodeBlock, TableOfContents等）
- 各チートシート/: meta.ts（メタ情報）+ Component.tsx（コンテンツ本体）の2ファイル構成

### meta.ts の必須フィールド

CheatsheetMeta インターフェースは以下のフィールドを持ちます。
- slug, name, nameEn, description, shortDescription, keywords
- category: "developer" | "writing" | "devops"
- relatedToolSlugs, relatedCheatsheetSlugs
- sections: { id: string; title: string }[]
- publishedAt, trustLevel（"curated"推奨）
- valueProposition（40字以内）, usageExample, faq

### Component.tsx の実装パターン

- div ルートの下に section[id="{セクションID}"] を複数並べる構造
- 各セクション: h2 → 説明段落 → table または CodeBlock で構成
- テーブルは「タグ名(code) | 説明 | 使用例・備考」の3〜4列構成
- CodeBlock コンポーネントでコードサンプルを表示（コピーボタン付き）

### registry.ts への登録方法

import { meta as htmlTagsMeta } from "./html-tags/meta" を追加し、cheatsheetEntries 配列にオブジェクトを追加する。

---

## 2. cycle-55実装（HTTPステータスコード・Cron式）の参考点

HTTPステータスコードチートシート:
- コードを code タグで表示し視認性を確保
- 4列テーブル（コード | 名前 | 説明 | よくある使用場面）で実用的
- 「APIデザインでの使い分け」という応用セクションで差別化
- FAQで混乱しやすいポイントを解消（401vs403等）

Cronチートシート:
- 視覚的なフィールド図（ASCIIアートでコードブロック活用）
- 基本→特殊文字→パターン集→実用例→環境別注意点の論理的な流れ
- 実用例テーブル（ユースケース | Cron式 | 説明）が便利

HTMLタグへの応用ポイント: 単なる一覧表に終わらず「なぜそのタグを使うか」のセマンティクス解説を加える。

---

## 3. HTMLタグの選定基準と分類方法の提案

### 選定基準

1. 使用頻度が高いタグ（各種チートシートで必須とされるもの）
2. セマンティクス的に重要なタグ（SEO・アクセシビリティに影響）
3. 混乱しやすいタグ（section vs article、b vs strong など使い分けが難しいもの）
4. 廃止・非推奨タグは除外（center, font 等は注釈として言及のみ）

### 推奨セクション構成（9セクション）

- basic-structure（基本構造）: html, head, body, title, meta, link
- sectioning（セクション/ページ構造）: header, nav, main, article, section, aside, footer, h1-h6, hgroup, address, search
- text-content（テキストコンテンツ）: p, blockquote, pre, ul, ol, li, dl, dt, dd, figure, figcaption, hr, div
- inline-text（インラインテキスト）: a, strong, em, span, code, abbr, time, mark, sup, sub, br, cite, q, kbd, var, wbr, s
- table（テーブル）: table, thead, tbody, tfoot, tr, th, td, caption, colgroup, col
- form（フォーム）: form, input, button, select, option, optgroup, textarea, label, fieldset, legend, datalist, output, progress, meter
- media（画像・メディア）: img, picture, source, video, audio, track, iframe, canvas, svg
- meta-seo（メタ情報・SEO）: meta[charset], meta[viewport], meta[description], meta[og:*], link[canonical], link[rel], base
- semantic-guide（セマンティクス使い分けガイド）: div vs section vs article, strong vs b, em vs i, ul vs ol vs dl の比較解説

総タグ数: 約65〜80タグを収録予定

---

## 4. 競合サイト分析と効果的な情報構成の提案

### 分析した競合サイト

- MDN HTML Cheatsheet（https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Cheatsheet）: インライン/ブロックの2分類のみ。シンプルすぎる
- GeeksforGeeks HTML Cheat Sheet（https://www.geeksforgeeks.org/html/html-cheat-sheet/）: 12セクション、タグ名・説明・構文の3列表
- W3Schools Semantic Elements（https://www.w3schools.com/html/html5_semantic_elements.asp）: semantic要素の意味と役割を解説
- HTMLls.docs-share.com（日本語・https://htmlls.docs-share.com/）: HTML Living Standard準拠の108タグ、コンテンツカテゴリー別分類（技術的すぎる）

### 本サイトの差別化ポイント

1. 使い分けガイドを必ず含める
   - section vs article vs div（最も混乱しやすい）
   - strong vs b（セマンティクス vs 見た目）
   - em vs i（強調 vs イタリック体）
   - ul vs ol vs dl

2. セマンティクスとSEO・アクセシビリティの関係を解説
   - 見出し階層の重要性（h1は1ページ1つ等）
   - alt属性、aria-label等のアクセシビリティ観点を簡潔に記載

3. 実装例（コードブロック）を各セクションに追加
   - 典型的なページ構造のHTMLスケルトン例（basic-structureセクション）
   - レスポンシブ画像（picture/source）例
   - フォームの基本的な実装例

4. メタ情報・OGP解説を含める（他の日本語チートシートに少ない）
   - meta タグのSEO観点の解説
   - og:title, og:image等のソーシャルシェア向けメタタグ

---

## 5. 実装時の推奨事項

- slug: html-tags（URL: /cheatsheets/html-tags）
- category: developer
- trustLevel: curated
- 関連ツール: html-entity（既存・HTMLエンティティ変換）、markdown-preview（既存）
- 関連チートシート: markdown, git, regex（既存）
- publishedAt: 実装完了日

---

## まとめ

HTMLタグチートシートは、既存の5チートシートと同じ meta.ts + Component.tsx の2ファイル構成で実装できる。9セクション・約65〜80タグを収録し、各セクションにコード例と使い分けガイドを含めることで、単なる一覧表を超えた価値を提供できる。特に「セマンティクスの使い分け」セクション（semantic-guide）は他の日本語チートシートサイトとの明確な差別化要素となる。

実装の難易度は既存チートシートと同レベル。planner・builderが参照しやすいよう、上記セクション構成をそのまま採用することを推奨する。

