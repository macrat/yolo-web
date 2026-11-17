# 出荷と、本番での確かめ

## 出荷

- 出荷の pull request: #125。2026-11-17 11:16 UTC に、通常のマージで main に入れた（マージコミット 852f2c4）。
- マージの前の CI（Node 24。head は 4175e0e）: 型検査・lint・整形・テスト・ビルドのすべてが通った。CodeQL のチェックは赤のままマージした（index.md の「レビュー結果」の「CodeQL の 13 件」）。
- Vercel の本番のデプロイ: `dpl_75P9voniPRfmYJzjhwgPYQBFxXhd`。11:26 UTC に、本番（https://yolos.net）が新しい版（release `852f2c4-20261117`）を配り始めた。
- 出荷の前の本番のデプロイ `dpl_FRCp5jYJy1q71LUwGvQ99Kb5hTbf` へは戻していない。

## 本番で確かめたこと（2026-11-17 11:26〜11:29 UTC）

### 状態コードと転送（curl）

- 200 を返した 23 本: `/`・`/play`・`/tools`・`/dictionary`・`/blog`・`/blog/page/2`・`/play/character-personality`・`/play/character-personality/result/blazing-strategist`・`/play/kanji-level`・`/play/nakamawake`・`/play/irodori`・`/play/kanji-kanaru`・`/play/yoji-kimeru`・`/play/daily`・`/tools/char-count`・`/dictionary/kanji/哀`・`/dictionary/yoji`・`/dictionary/colors`・`/blog/sql-cheatsheet`・`/about`・`/sitemap.xml`・`/robots.txt`・`/feed`。
- 404 を返した 2 本: どのルートにも一致しない URL と、実在しない記事の slug。
- 無くなったページ番号の転送は、Vercel の上でも 308 を返した。

| URL                               | 状態 | 転送の先                   |
| --------------------------------- | ---- | -------------------------- |
| `/blog/page/3`                    | 308  | `/blog`                    |
| `/blog/page/5`                    | 308  | `/blog/page/2`             |
| `/blog/page/8`                    | 308  | `/blog/page/2`             |
| `/blog/page/9`                    | 404  | （転送しない）             |
| `/blog/tag/設計パターン/page/2`   | 308  | `/blog/tag/設計パターン`   |
| `/blog/category/dev-notes/page/3` | 308  | `/blog/category/dev-notes` |
| `/tools/page/2`                   | 308  | `/tools`                   |

### トップの HTML

- `theme-color`: ライト `#fcfcfc`・ダーク `#121212` の2つが出ている。
- `og:image`: `https://yolos.net/opengraph-image?…`。canonical は `https://yolos.net`、robots は `index, follow, max-image-preview:large`。
- GA のタグ（gtag.js）が読み込まれている。AI が運営する実験であることの告知が出ている。
- `og:image` の3本（トップ・診断・ブログの記事）は、200 で `image/png` を返した。

### ブラウザでの確かめ（Chromium。375×667 のタッチの端末と 1280×800）

- **診断 `/play/character-personality`**: 「はじめる」は最初の画面に入る。12 問のすべてで4つの選択肢が画面に入り、最後まで答えて結果の名前が出た。JavaScript のエラー 0、横へのはみ出し無し、400 以上の応答 0。
- **ナカマワケ `/play/nakamawake`**: 16 の言葉が4行（4列×4行）に並び、最初のマスの上端から「チェック」の下端まで 433px。エラー 0。
- **トップ・ブログの記事・ツール・漢字の詳細**: ライトとダークのどちらでも 200、横へのはみ出し無し、エラー 0。地の色はライトとダークで切り替わる。追記を足した記事 `/blog/japanese-word-puzzle-games-guide` に「補足」の枠が出ている。
- **ツール `/tools/char-count`**: 「こんにちは世界」を入れると「7文字」と出る。
- **Web フォント**: woff2 の応答はすべて 200。見出しが明朝で描かれていることを、撮った画面で見た。
- **GA のイベント**: 診断を通して、ブラウザから `page_view`・`level_start`・`level_end`・`save`（surface `fuda`）・`share` が送られることを、送信の記録で確かめた。BigQuery での数の確かめは、エクスポートが翌日になるので行っていない（backlog の B-801 で、基線を取るときに見る）。
- 撮った画面（診断の開始・1問目・結果、ナカマワケ、トップと記事のライトとダーク）を PM が目で見て、崩れが無いことを確かめた。

## 確かめていないこと

- 実機（iPhone の Safari など）と、Chromium のほかのブラウザ。
- 本番での、全 URL の巡回（出荷の前に、最終の版で確かめた。t2d-result.md と review-t2d.md）。
- BigQuery に届いた GA のイベントの数。
