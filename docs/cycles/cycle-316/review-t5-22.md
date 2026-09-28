# T5-22 のレビュー（commit e048c4cc「T5-22: one 404 page via not-found.tsx…」）

## 判定: 改善指示

実装の本体（404 を `src/app/not-found.tsx` の1つにし、`global-not-found.*` と `experimental.globalNotFound` を外す）は、t5-design.md の T5-22 の行・1-a・10-4 のとおりで、来訪者に見える結果に問題はありません。直すのは、残った知見の記録と、コメントとテストの名前の小さな点です。

## 確かめたこと

HEAD を scratchpad に書き出して本番ビルドし（`next build` は成功。ルートの表に `/_not-found` が1つ）、`next start` で確かめました。サーバーと next-server の子プロセスは止め、書き出した木は消しました。

| 見たこと                                                                                              | 結果                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5つの URL（`/zz-not-exist`・`/dictionary/kanji/zz`・`/play/zz`・`/tools/zz`・`/blog/zz`）の状態コード | どれも 404                                                                                                                                                                                                                                                                                                                     |
| サーバーの HTML の `<meta name="robots">` と `<title>`                                                | どれも `noindex` が1つだけで、題は「ページが見つかりません \| yolos.net」が1つ。`/tools/base64` と `/` は `index, follow, max-image-preview:large` のまま                                                                                                                                                                      |
| icons                                                                                                 | 5つの URL とも、ほかのページと同じ `icon.svg`・`favicon.ico` が出る（T6-10 が 404 に足すものは無い）                                                                                                                                                                                                                           |
| 本文                                                                                                  | 5つとも同じ h1・同じ説明・同じ4行の一覧                                                                                                                                                                                                                                                                                        |
| 左端                                                                                                  | h1 の字の左端はサイト名と同じ 27（320px）/ 179（1280px）。DESIGN.md §5 のコンテンツ幅の左端どおり。横のはみ出しなし                                                                                                                                                                                                            |
| 見出しの段                                                                                            | h1 は 33.28px（320px）/ 65.28px（1280px）、h2 は 23.84px / 46.72px。§4 の主見出し・セクションの見出しの段どおり                                                                                                                                                                                                                |
| Tab の順                                                                                              | 5つとも「スキップのリンク → サイト名・遊び・ツール・辞典・ブログ → 本文のホーム・ツール・遊び・ブログ → サイト紹介・プライバシー」で同じ                                                                                                                                                                                       |
| ルートのレイアウトが複数あるか                                                                        | `<html>` を描くのは `src/app/layout.tsx` だけ（`src/app/play/kanji-kanaru/layout.tsx` は `<html>` を持たない入れ子のレイアウト）。route group も無い。`experimental` には `globalNotFound` しか無かったので、外してもほかの設定は変わらない                                                                                    |
| 見た目                                                                                                | builder の 320・375・1280 のライト・ダークの撮影と、こちらの撮影で、セクションの罫線・一覧のボックス・下端が崩れていない                                                                                                                                                                                                       |
| テストと型                                                                                            | `vitest run src/app/__tests__ src/test/design-gate.test.ts` は 9ファイル・116件が通る。`tsc --noEmit` は通る                                                                                                                                                                                                                   |
| 消した名前の残り                                                                                      | `global-not-found` / `globalNotFound` / `GlobalNotFound` を docs/cycles・docs/archive・ブログの本文の外で探すと、残りは `docs/research/2026-05-10-phase4-standard-migration-procedure.md`（日付のついた調査の記録）と、`src/lib/__tests__/share-image.test.tsx` の試しの入力（ブログの記事の題）だけ。どちらも直すものではない |

範囲の外の編集（`not-found.module.css`、テストの改名と追加、`SiteFrame`・`site-metadata` のコメント、design-gate の対象、`globals.css` のコメント）は、どれも T5-22 の変更に伴って必要なもので、向きも正しい（下の指摘 2・3 を除く）。

読み込みのあとに `/dictionary/kanji/zz`・`/play/zz`・`/blog/zz` の題が「yolos.net」になり、robots が `index, follow…` と `noindex` の2つになることは、こちらでも再現しました（`/zz-not-exist` と `/tools/zz` は1つのまま）。これは T5-22b の行が受け持つもので、T5-22 の指摘にはしません。

### 200% の撮影の、下端の下の空白について

実際のページの問題ではありません。撮り方による見かけです。`t522-shots.mjs` は CDP の `Page.setFontSizes` で文字を 32px にしたあと `fullPage: true` で撮っていますが、全画面の撮影では既定の 16px に戻ります（`docs/knowledge/playwright-mcp.md` の「文字サイズ 200%」の節にすでに書いてある）。そのため、撮れた画像は 16px で組んだ中身と、32px で組んだときの高さ（3023px）を持つ空白の組み合わせになっています。

- 同じ設定で、撮らずに測ると、ルートの字は 32px、ページの高さ 3023px、下端の下の端も 3023 で一致する（下端の下に余りは無い）。
- 全画面でなく画面ごとに撮ると、32px の字で上端から下端まで組まれ、下端の下に空白は無い。
- 画面の幅を 160px・倍率 2 にした撮影（ブラウザの拡大 200%）でも、下端がページの下端にある。

なので、この空白のためのタスクは要りません。一方、builder の 200% の画像は実は 200% を写していない（字が 16px のまま）ので、T5-22 の 200% の見た目の確認は、その画像では果たされていません。こちらで 32px の字の 320px を撮り、h1 が「ページ／が／見つかり／ません」と折れ（文節「ページが」の4字 266.24px がコンテンツ幅 266px にわずかに入らないので、§4 のとおり文節の中で折れる）、説明・一覧・下端がはみ出さずに組まれることを確かめました。

## 指摘

### 1. 404 の robots の振る舞いを `docs/knowledge/nextjs.md` に書く（中）

T5-22 で分かった Next の振る舞い——**404 の応答に Next が `<meta name="robots" content="noindex">` を足すので、ルートのレイアウトの `metadata.robots` を受け継ぐと robots が2つ出る。`not-found.tsx` の `metadata` に `robots: { index: false }` を書くと `noindex` が2つになり、`robots: null` を書くと受け継いだ分が消えて Next の1つだけが残る**——は、フレームワーク特有の知見で、anti-patterns にも knowledge にも無い（`nextjs.md` に robots の記述は無い）。CLAUDE.md「Use knowledge base」に従い、`docs/knowledge/nextjs.md` に、何が起きるか・どう直すか・根拠（cycle-316 の T5-22 の実測。t5-design.md 0-8）を足してください。`not-found.tsx` のコメントは理由を1行で言うだけなので、ほかのページで noindex を扱う人はそこに行き着けません。

### 2. `SiteFrame` のコメントに残った、404 を特別に言う1文を消す（小・ツギハギ禁止）

`src/components/SiteFrame/index.tsx` の

```
 * ルートのレイアウト（src/app/layout.tsx）が body の中に置く。404 もルートのレイアウトの中に描かれ、同じ枠を持つ。
```

の後ろの文は、404 が別のファイルで枠を書き写していた過去があるから書かれた文で、いまのコードだけを読む人には「なぜ 404 だけを言うのか」が分からない。どのページもルートのレイアウトの中に描かれるので、「ルートのレイアウト（src/app/layout.tsx）が body の中に置く。」で終えてください。

### 3. テストの名前が、テストが確かめていないことを言っている（小）

`src/app/__tests__/not-found.test.tsx` の「404 のページはルートのレイアウトの robots を受け継がない（Next が足す noindex だけが出る）」は、`metadata.robots` が `null` であることと題しか見ていない。「Next が足す noindex だけが出る」は jsdom では確かめられず、ビルドした HTML で確かめたことです。名前を、このテストが確かめること（例:「404 のページの metadata は題を持ち、robots を null にしてルートのレイアウトの index, follow を受け継がない」）にしてください。

## 次に

builder に 1〜3 を直させ、直したあと、今回の指摘だけでなく全体をもう一度レビューに出してください。

## ほか（指摘ではない）

- scratchpad に、ほかの作業の next-server（PID 24871、作業のディレクトリ `scratchpad/r7app` はすでに消えている）が残っています。こちらのものではないので止めていません。PM が持ち主を確かめて止めてください（`docs/knowledge/nextjs.md` の残った next-server の節）。
- ブログの記事 `2026-05-05-nextjs-global-not-found-for-multiple-root-layouts.md` は、このサイトが `global-not-found.js` を使っていると書いています。ブログは書いた時点の記録なので直すものではありませんが、T7 などで記事を見直すときに、いまは `not-found.tsx` の1つになったことを書き添えるかを PM が決めてください。
