# cycle-290 設計判断: 見出し id 生成の単一生成元(SSoT)化

B-596（TOC アンカーがジャンプしない不具合）の是正にあたり、見出し id の生成経路を確定する。本書は判断の芯だけを残す（経緯・実測は index.md と実装を参照）。

## 問題の構造（一次確認済み）

見出し id が **2つの独立したパスで別ロジック生成**されており、山括弧を含むインラインコードや生の特殊文字を含む見出しで食い違い、TOC の `href="#id"` が DOM 見出し id と一致せずジャンプ不能になっていた。

- DOM 側: `createHeadingExtension()` の heading renderer。`parseInline` が `` `<body>` `` を `<code>&lt;body&gt;</code>` に描画 → タグ剥がし後もエンティティ `&lt;body&gt;` が残り、`generateHeadingId` が `&`/`;` を除去して id が `ltbodygt` になる。
- TOC 側: `extractHeadings()`。生 markdown からバッククォートを先に剥がして `<body>` を露出 → `<[^>]*>` 除去で `<body>` を丸ごと削除し、id/表示から「body」が消える。

同じ見出しから 2 系統が別の文字列を作るため、id が一致しない・TOC 表示が空になる、の二重障害。

## 決定1: SSoT 化 — `markdownToHtml` が html と headings を一緒に返す

- `markdownToHtml` の戻り値を `Promise<string>` から `Promise<{ html: string; headings: Heading[] }>` に変更する。
- 見出しの収集は `createHeadingExtension` の heading renderer 内で行う（各見出し描画時に `{ level, text, id }` を push）。id を採番するのと**まったく同じコードパス・同じ採番カウンタ**で TOC 用の headings を作るため、DOM id と TOC の id は構造上一致する（別ロジックが存在し得ない）。

### 決定1補足: 状態は呼び出しごとにローカル化（並行下でも SSoT 成立）

- heading 拡張は「重複 id カウンタ」と「収集配列」という**可変の per-parse 状態**を持つ。`markdownToHtml` は reset → `await parse`(Shiki) → collect の順で、reset と collect の間に await を挟むため、状態をモジュール単一インスタンスで共有すると、並行する 2 つの `markdownToHtml` の heading renderer が同じ配列へ push し合い、返る html と headings が食い違う（自分の html に無い id を headings が指す／不要な `-1` サフィックス）。
- これは実ビルドで発火し得る: `getBlogPostBySlug` は `cache()` で dedupe されておらず、`generateMetadata`・ページ本体・`opengraph-image.tsx` が同一 slug を独立に呼び、Next.js はこれらを並行実行する。旧 `extractHeadings` は純同期でレース非対象だった。
- 対策として **module-level singleton をやめ、`markdownToHtml` の呼び出しごとに `createMarkedInstance()` で新しい `Marked` インスタンス＋新しい heading 拡張クロージャを生成**し、そのインスタンスで parse する（案(a)）。これで新規の headings レースと、実は旧実装から存在した DOM id カウンタ（`idCount`）のレースの両方を構造的に解消する。**DOM id と TOC id が一致する保証は、この状態隔離により逐次・並行いずれでも成立する**（別ロジックも共有状態も存在しない）。
- per-call インスタンス化のコストは無視できる: Shiki のハイライタは `highlight.ts` でグローバルキャッシュ、`codeExtension` のキャッシュは token キーの per-parse WeakMap なので、重い再構築は起きない。
- 案(b)（async ミューテックスで直列化）も可だが、per-call インスタンスの方が構造的で明快なため (a) を採用。

## 決定2: エンティティ復号でコード内容を活かす

- 表示テキストと id は、`inner`(HTML) からタグを除去した後に marked 生成の HTML エンティティを**復号してから**作る: `&lt;`→`<`, `&gt;`→`>`, `&quot;`→`"`, `&#39;`→`'`, **最後に** `&amp;`→`&`（二重復号回避のため `&amp;` を最後）。
- これにより `` `<body>` `` の見出しは TOC 表示に `<body>` が残り（従来は空白に脱落）、id は `body` を含む clean な slug になる。

## 決定3: `extractHeadings` は削除

- 本番消費者は `blog.ts:244` の 1 箇所のみで、これを `markdownToHtml` の戻り headings に置換すれば消費者は 0 になる。テストも新 SSoT 経路（`markdownToHtml` の戻り headings）へ全面移設できるため、委譲ラッパを残す理由が無い。関数・export ともに削除する。

## 決定4: 既存 id 温存の根拠

- 山括弧なしのプレーンなインラインコード見出し（`` `useRegexWorker` `` 等）や特殊文字を含まない見出しは、タグ除去後にエンティティを含まない。復号は no-op になり、`generateHeadingId` への入力は従来と同一 → **既存 id は不変**。
- 重複見出しの連番サフィックス（`-1`/`-2`）は単一パスの同一カウンタで採番されるため一貫する。
- 見出し以外の本文 HTML・sanitize 挙動は不変（heading renderer の返す HTML 文字列自体は従来と同じ `<h{depth} id="...">{inner}</h{depth}>`）。id 生成に用いる中間文字列だけを変える。

## 型の整合

- `Heading` interface（`{ level: number; text: string; id: string }`）を `markdown.ts` に定義・export し、`blog.ts` の `BlogPost.headings` と `TableOfContents.tsx` の `Heading` を同一型に統一する。`CollapsibleTOC` は `TableOfContents` から `Heading` を re-export で引き続き取得できる。

## 見出しアンカーへの内部/相互リンク

- id 変更の巻き添えを確認済（PM 一次確認: 見出しアンカーへの内部/相互リンクは 0 件）。破損記事の id は現状ジャンプ不能なので、`ltbodygt` 系 id が `body` 系へ変わっても失われる正当な被リンクは無い。
