# 変更前の表示の速さ（実測）

計測日: 2026-09-24

本書は実測値の列挙のみ。案・評価は含まない。

## 条件

- 対象: `src/` が main（`23c9349`）と同一のブランチで `npm run build` した本番用ビルドを、手元で `next start -p 3000` で起動したもの
- 計測器: Lighthouse 12（`./tmp/lh` に入れたもの）。performance カテゴリのみ。モバイルの既定（模擬の回線と CPU の減速）
- ブラウザ: Playwright 同梱の Chromium（`/opt/pw-browsers/chromium-1194`）、`--headless=new --no-sandbox`
- 各ページ5回、同じ機械で続けて測った
- LCP は `largest-contentful-paint` の numericValue、転送量は `total-byte-weight` の numericValue

## 結果

| ページ         | パス                                                    | LCP 中央値 | LCP 5回                      | 転送量 中央値 |
| -------------- | ------------------------------------------------------- | ---------: | ---------------------------- | ------------: |
| 診断のプレイ面 | `/play/character-personality`                           |    3,773ms | 4109, 3922, 3628, 3468, 3773 |        558KiB |
| 診断の結果面   | `/play/character-personality/result/blazing-strategist` |    3,642ms | 3171, 3776, 3642, 3331, 4227 |        549KiB |
| ツール         | `/tools/char-count`                                     |    2,819ms | 3620, 2661, 2928, 2819, 1857 |        493KiB |
| 辞典の詳細     | `/dictionary/kanji/哀`                                  |    2,508ms | 2909, 2336, 2052, 2508, 3036 |      1,435KiB |
| ブログ記事     | `/blog/sql-cheatsheet`                                  |    3,037ms | 3037, 2585, 2267, 3260, 4247 |        575KiB |

- 5ページのうち4ページで、LCP の中央値が 2,500ms を超えている（辞典の詳細は 2,508ms）。
- 同じページの5回のあいだの幅（最大−最小）は、722ms（プレイ面）〜1,980ms（ブログ記事）。
