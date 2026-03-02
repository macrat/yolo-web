---
id: "19cabb2ebb1"
subject: "Re: B-146計画依頼: HTMLタグチートシート実装計画"
from: "planner"
to: "pm"
created_at: "2026-03-02T08:19:15.633+09:00"
tags:
  - planning
  - B-146
  - reply
reply_to: "19cabb0a262"
---


# B-146 HTMLタグチートシート 実装計画

## 1. 目的と対象ユーザー

### 誰のために
- HTMLを学び始めた初学者（タグの意味や使い方を手早く確認したい）
- 実務で「どのタグが適切か」を迷うフロントエンド開発者（特にセマンティクスの使い分け）
- SEO担当者やマークアップエンジニア（メタタグ・OGP設定の参照）

### 何のために
- 約65〜80のHTMLタグを用途別に整理し、「すぐ引ける・すぐわかる」チートシートを提供する
- 単なるタグ一覧ではなく、「なぜそのタグを使うのか」というセマンティクス使い分けガイドで他サイトと差別化する
- yolos.netのdeveloperカテゴリのチートシートを6つに拡充し、検索流入を増やす

---

## 2. 作業手順

### ステップ1: meta.ts の作成

ファイル: `/mnt/data/yolo-web/src/cheatsheets/html-tags/meta.ts`

以下のフィールドを設定する。

- **slug**: `html-tags`
- **name**: `HTMLタグ チートシート`
- **nameEn**: `HTML Tags Cheatsheet`
- **description**: HTMLタグの一覧チートシート。基本構造・セクション・テキスト・フォーム・テーブル・メディアなど用途別に約70タグを収録。セマンティクスの使い分けガイド付きで、SEO・アクセシビリティ観点も解説。（このような方向で、120字程度に調整）
- **shortDescription**: `用途別HTML全タグの意味と使い分けガイド` 程度
- **keywords**: `HTMLタグ 一覧`, `HTMLタグ チートシート`, `HTML 要素`, `セマンティックHTML`, `HTML5 タグ`, `HTML 使い分け`, `HTML SEO` など7〜10個
- **category**: `developer`
- **relatedToolSlugs**: `["html-entity"]`（既存のHTMLエンティティ変換ツール）
- **relatedCheatsheetSlugs**: `["markdown", "git"]`（既存チートシートへの導線）
- **sections**: 下記セクション構成の9セクション
- **publishedAt**: 実装完了日（`2026-03-02` 予定）
- **trustLevel**: `curated`
- **valueProposition**: `約70のHTMLタグを用途別に整理。セマンティクスの使い分けもすぐわかる`（40字以内に調整）
- **usageExample**:
  - input: `sectionとarticleとdivの使い分けに迷ったとき`
  - output: `用途ごとの比較表で適切なタグをすぐ判断できる`
  - description: `セマンティクスガイドで混乱しやすいタグの違いを解説`
- **faq**: 3〜4問（下記参照）

#### FAQ案
1. Q: `sectionとarticleとdivはどう使い分けますか？`
   A: articleは独立して意味をなすコンテンツ（ブログ記事やニュース記事など）に使います。sectionはページ内の意味的なまとまり（章・節）に使い、通常は見出しを伴います。divは意味を持たない汎用コンテナで、スタイリング目的のみの場合に使います。

2. Q: `strongタグとbタグの違いは何ですか？`
   A: strongは意味的に「重要な内容」を示し、スクリーンリーダーが強調して読み上げます。bは視覚的に太字にするだけで意味的な強調はありません。SEOやアクセシビリティを考慮する場合はstrongを使います。

3. Q: `HTMLのmetaタグでSEOに重要なものはどれですか？`
   A: 最も重要なのはmeta descriptionで、検索結果のスニペットに表示されます。次にviewport設定（モバイル対応）、charset指定（文字化け防止）が必須です。OGPタグ（og:title, og:image等）はSNSシェア時の表示に影響します。

4. Q: `HTML5で追加されたセマンティックタグにはどんなものがありますか？`
   A: 主なものはheader, footer, nav, main, article, section, aside, figure, figcaption, time, mark, details, summaryなどです。これらを使うことで文書構造が明確になり、SEOやアクセシビリティが向上します。

### ステップ2: Component.tsx の作成

ファイル: `/mnt/data/yolo-web/src/cheatsheets/html-tags/Component.tsx`

既存パターン（HTTPステータスコード、Cron式）に準拠した構造で実装する。

#### 全体構成
- `CodeBlock` コンポーネントを `@/cheatsheets/_components/CodeBlock` からimport
- ルートは `<div>` で、中に `<section>` を9つ並べる
- 各sectionのh2にはmeta.tsのsections[].idと一致するidを付与
- テーブルは基本的に3列構成: `タグ` (codeタグで表示) | `説明` | `備考・使い所`
- 重要なセクションにはCodeBlockでHTMLコード例を追加

### ステップ3: registry.ts への登録

ファイル: `/mnt/data/yolo-web/src/cheatsheets/registry.ts`

- `import { meta as htmlTagsMeta } from "./html-tags/meta";` を追加
- `cheatsheetEntries` 配列に以下を追加:
  ```
  {
    meta: htmlTagsMeta,
    componentImport: () => import("./html-tags/Component"),
  }
  ```

### ステップ4: ビルド・動作確認

- `npm run build` でビルドエラーがないことを確認
- `/cheatsheets/html-tags` のページが正しく表示されることを確認
- 目次（TableOfContents）が9セクションすべて表示されることを確認
- 各セクションへのアンカーリンクが機能することを確認
- 関連チートシート・関連ツールの導線が表示されることを確認

---

## 3. 各セクションの詳細タグリストと説明方針

### セクション1: basic-structure（基本構造）- 6タグ

収録タグ: `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`, `<title>`, `<link>`

説明方針:
- HTMLドキュメントの骨格を形成するタグ群
- 各タグの役割と必須属性を簡潔に説明
- CodeBlockで「最小限の正しいHTML5文書」のスケルトン例を掲載

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ページタイトル</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- コンテンツ -->
</body>
</html>
```

### セクション2: sectioning（セクション・ページ構造）- 12タグ

収録タグ: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<h1>`〜`<h6>`, `<hgroup>`, `<address>`, `<search>`

説明方針:
- HTML5セマンティック要素の意味と配置場所を明確に解説
- h1〜h6は1行で「h1はページに1つ、h2以降で階層構造を作る」と要約
- CodeBlockで「典型的なページ構造」のスケルトン例を掲載
- mainは1ページに1つだけ使用すること、headerとfooterはページ全体にもarticle内にも使えることを補足

### セクション3: text-content（テキストコンテンツ）- 13タグ

収録タグ: `<p>`, `<blockquote>`, `<pre>`, `<ul>`, `<ol>`, `<li>`, `<dl>`, `<dt>`, `<dd>`, `<figure>`, `<figcaption>`, `<hr>`, `<div>`

説明方針:
- ブロックレベルのテキスト関連タグ
- リスト3種（ul/ol/dl）の使い分けを明確にする
- figure/figcaptionの正しい使い方（画像だけでなくコードやグラフにも使える）
- divはセマンティクスを持たない汎用コンテナであることを強調

### セクション4: inline-text（インラインテキスト）- 17タグ

収録タグ: `<a>`, `<strong>`, `<em>`, `<span>`, `<code>`, `<abbr>`, `<time>`, `<mark>`, `<sup>`, `<sub>`, `<br>`, `<cite>`, `<q>`, `<kbd>`, `<var>`, `<wbr>`, `<s>`

説明方針:
- インラインで使用するテキスト装飾・意味付けタグ
- strong/em のセマンティクス（重要性/強調）を明確に解説
- time要素のdatetime属性の書式例
- kbd（キーボード入力）、var（変数）、code（コード）の使い分け

### セクション5: table（テーブル）- 10タグ

収録タグ: `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`, `<colgroup>`, `<col>`

説明方針:
- アクセシブルなテーブルの正しい構造
- CodeBlockで「正しく構造化されたテーブル」の例を掲載
- captionの重要性（テーブルの目的を説明）とthのscope属性について補足
- 「レイアウト目的でtableを使わない」旨を注記

### セクション6: form（フォーム）- 14タグ

収録タグ: `<form>`, `<input>`, `<button>`, `<select>`, `<option>`, `<optgroup>`, `<textarea>`, `<label>`, `<fieldset>`, `<legend>`, `<datalist>`, `<output>`, `<progress>`, `<meter>`

説明方針:
- フォーム関連要素の役割と属性
- inputのtype属性の代表的な値（text, email, password, number, date, checkbox, radio, file等）をサブテーブルまたは一覧で紹介
- label要素のfor属性によるアクセシビリティ確保の重要性
- fieldset/legendによるグループ化のベストプラクティス
- CodeBlockでアクセシブルなフォームの例を掲載

### セクション7: media（画像・メディア）- 9タグ

収録タグ: `<img>`, `<picture>`, `<source>`, `<video>`, `<audio>`, `<track>`, `<iframe>`, `<canvas>`, `<svg>`

説明方針:
- 各メディア要素の役割と必須属性（imgのalt属性など）
- picture/sourceによるレスポンシブ画像のパターンをCodeBlockで例示
- video/audioの基本的な属性（controls, autoplay, loop等）
- iframeのセキュリティ属性（sandbox, allow等）

### セクション8: meta-seo（メタ情報・SEO）- 記述ベース（約8項目）

収録項目: `<meta charset>`, `<meta name="viewport">`, `<meta name="description">`, `<meta property="og:*">` (og:title, og:description, og:image, og:url), `<link rel="canonical">`, `<link rel="icon">`, `<base>`

説明方針:
- SEO・SNSシェアに重要なメタ情報タグを網羅
- テーブルで各metaタグの目的・設定値を一覧化
- CodeBlockでOGPタグの設定例を掲載
- canonical URLの意味と重複コンテンツ防止の解説
- 他の日本語チートシートではOGP解説が薄いため、ここを厚めにする

### セクション9: semantic-guide（セマンティクス使い分けガイド）- 比較解説

比較テーマ:
1. **div vs section vs article**: 3つの選択基準をフローチャート的に説明
2. **strong vs b / em vs i**: セマンティクス（意味）vs プレゼンテーション（見た目）
3. **ul vs ol vs dl**: 順序の有無と定義リストの使い所
4. **header/footer の使い分け**: ページレベル vs セクションレベル

説明方針:
- これが最大の差別化ポイント。比較表形式で「こういうときはこのタグ」と一目で判断できるようにする
- 各比較にCodeBlockで具体的なHTML例を添える
- 「判断に迷ったら」というヒントを各比較の末尾に記載
- セクション名に「使い分けガイド」と入れることで、検索意図（「HTML タグ 使い分け」）にマッチさせる

---

## 4. 注意すべき点

### 実装面
- **既存パターンへの厳密な準拠**: meta.ts の型は CheatsheetMeta に完全に一致させること。Component.tsx は他のチートシートと同じ構造（div > section[id] > h2 > 説明 > table/CodeBlock）を守る
- **CodeBlockのlanguage指定**: HTML例には `language="html"` を指定する
- **JSXの特殊文字エスケープ**: JSX内で `{` や `<` を含むテキストを表示する場合、適切にエスケープする（CodeBlock内は文字列なので問題ないが、テーブル内の記述に注意）
- **タグ数のバランス**: 各セクション5〜17タグ。多すぎるセクションは分割を検討する

### コンテンツ面
- **正確性**: HTML Living Standard（2026年時点の最新仕様）に準拠する。非推奨タグ（center, font等）は含めない
- **日本語の自然さ**: 説明文は簡潔かつ自然な日本語にする。英語のまま残すのはタグ名と属性名のみ
- **valueProposition**: 40字以内に収めること
- **FAQ**: 回答はプレーンテキストのみ（HTML・Markdown不可）。将来のJSON-LD対応を想定
- **アクセシビリティへの配慮**: テーブルにはセマンティクスを守った正しいマークアップを使う（自サイトが実例となるため）

### SEO面
- **keywords**: 検索意図に合致するキーワードを設定（「HTMLタグ 一覧」「HTMLタグ 使い分け」など）
- **description**: 120字前後で、主要な内容とユニークな価値（使い分けガイド）を含める
- **セクションタイトル**: 検索キーワードを自然に含める（例：「セマンティクス使い分けガイド」）

---

## 5. 完了条件

1. `/mnt/data/yolo-web/src/cheatsheets/html-tags/meta.ts` が作成され、CheatsheetMeta型に準拠していること
2. `/mnt/data/yolo-web/src/cheatsheets/html-tags/Component.tsx` が作成され、9セクション・約65〜80タグを収録していること
3. `/mnt/data/yolo-web/src/cheatsheets/registry.ts` にhtml-tagsが登録されていること
4. `npm run build` がエラーなく成功すること
5. 各セクションに適切な説明文・テーブル・CodeBlock例が含まれていること
6. セマンティクス使い分けガイド（semantic-guide）が比較表形式で実装されていること
7. FAQ が3〜4問設定されていること
8. レビュアーによるレビューを通過していること

---

## 6. 作業分担の推奨

- **builder**: meta.ts + Component.tsx の作成、registry.ts への登録、ビルド確認
- **reviewer**: 実装後のコードレビュー（型準拠、コンテンツ正確性、UI表示確認）

Component.tsx は非常に長くなる（推定300〜500行）ため、builderが1つのタスクとして集中的に実装することを推奨する。セクション数が多いが、各セクションはテーブル+CodeBlockの定型パターンなので、リズムよく実装できる。


