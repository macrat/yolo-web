# T6 の作業の記録

t6-design.md 4章が求める、タスクごとの画像の比較と測った数を残す。

## T6-0（3332c05）

- 変更の前と後で `next build` し、`.next/server/app` の画像の body（731件）の sha256 がすべて一致した。
- `scripts/generate-favicons.ts` の出力（`favicon.ico`・`icon.svg`・`apple-touch-icon.png`）が変更の前後でバイト単位で一致した（出力はコミットしていない）。
- レビュー: [review-t6-0.md](./review-t6-0.md)（承認）。

## T6-2

- ブログの `src/app/blog/[slug]/twitter-image.tsx` の削除は、担当がステージしたものが T5 の設計のコミット 106e161 に入った。T6-2 のレビューの範囲には 106e161 のこの削除を含める。
- 代替テキストは案 b にした。案 a（`generateImageMetadata`）は、動的なルートの下ではビルドが画像を書き出さなかった（Next 16.3 は Route Handler の `generateStaticParams` を最後の段しか集めず、`generateImageMetadata` に `params` が渡らない。ブログの画像は0枚、最初の要求で 7.7 秒）。案 b は、force-static な `src/app/blog/[slug]/opengraph-image/route.tsx` が画像を描き、ページの `generateMetadata` が同じ中身から `openGraph.images`（記事ごとの代替テキスト）を渡す。画像の URL は `/blog/{slug}/opengraph-image?v={中身から作った16字}`。
- `seo.ts` はクライアントの部品（Breadcrumb）から読まれるので、画像はページの `generateMetadata` で作って `generateBlogPostMetadata` に渡す（`seo.ts` は型だけを読む）。
- `twitter-image.tsx` は置かない。Next 16 は `og:image` から `twitter:image` を同じ URL と代替テキストで出す。
- 別の書き出しでのビルドで、記事の画像の `.body` は86枚、`twitter-image` は0枚。86本すべてで `og:image`・`twitter:image`・JSON-LD の `image` が同じ `?v` 付きの URL で、どれも 200・PNG・`.body` とバイト単位で同じ。代替テキストは記事ごとに画像に書いた字と同じ。無い記事と下書きの記事の画像は 404。`?v` の値は別のプロセスで計算し直しても同じ。書体の取得先を壊すとビルドが止まる（exit 1）。
- 名前の段の選び方と描く時間（試しの入力。行の折り方は画面の見出しと同じ単位）:

| 入力                                           | 選んだ段 | 行                                | 描く時間 |
| ---------------------------------------------- | -------- | --------------------------------- | -------- |
| 69字のブログの題                               | 72px     | 3行                               | 896ms    |
| 67字の SEO の題                                | 56px     | 3行                               | 364ms    |
| git-command-cheatsheet                         | 96px     | 2行（画面の h1 と同じ所で折れる） | 182ms    |
| 診断のタイプ名の最長（guardian-charger・35字） | 72px     | 3行                               | 85ms     |
| 締切1時間前…画家（28字）                       | 84px     | 3行                               | 85ms     |
| Supercalifragilistic…                          | 64px     | 3行（語の中だけで折れる）         | 247ms    |
| エゾシカ——                                     | 96px     | 3行、ダッシュは1本の線            | 87ms     |
| 10問中8問正解・漢字マスター                    | 96px     | 数字の結果は1行                   | 31ms     |

- 数字の結果と名前の字の高さは 122px と 87px（1.40倍）。空白は PNG に残る。ブログの86本の題はすべて3行以内で枠に収まり、副題は切れない。
