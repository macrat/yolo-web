# T6 の作業の記録

t6-design.md 4章が求める、タスクごとの画像の比較と測った数を残す。

## T6-0（3332c05）

- 変更の前と後で `next build` し、`.next/server/app` の画像の body（731件）の sha256 がすべて一致した。
- `scripts/generate-favicons.ts` の出力（`favicon.ico`・`icon.svg`・`apple-touch-icon.png`）が変更の前後でバイト単位で一致した（出力はコミットしていない）。
- レビュー: [review-t6-0.md](./review-t6-0.md)（承認）。

## T6-2

- ブログの `src/app/blog/[slug]/twitter-image.tsx` の削除は、担当がステージしたものが T5 の設計のコミット 106e161 に入った。T6-2 のレビューの範囲には 106e161 のこの削除を含める。
- 代替テキストは案 b にした。案 a（`generateImageMetadata`）は、動的なルートの下ではビルドが画像を書き出さなかった（Next 16.3 は Route Handler の `generateStaticParams` を最後の段しか集めず、`generateImageMetadata` に `params` が渡らない。ブログの画像は0枚、最初の要求で 7.7 秒）。案 b は、Route Handler `src/app/blog/[slug]/opengraph-image/route.tsx` が画像を描き、ページの `generateMetadata` が同じ中身から `openGraph.images`（記事ごとの代替テキスト）を渡す。
- Route Handler の設定は `dynamic = "force-static"`・`dynamicParams = false`・`revalidate = false`・`generateStaticParams`（記事の slug をすべて並べる）。`GET` はクエリを読まず、無い記事は `notFound()`。
- 画像の URL は `/blog/{slug}/opengraph-image?v={版}`。版は、`ShareImageContent` と枠の寸法のモジュール（`share-image-frame.ts`。描き方の版の値 `SHARE_IMAGE_VERSION` を含む）の値を、それぞれキーの名前の順に並べた JSON をつないだ字の sha256 の頭16字。`og:image`・`twitter:image`・JSON-LD の `image` は、どれも `shareOpenGraphImage` の同じ値を使う。
- `seo.ts` はクライアントの部品（Breadcrumb）から読まれるので、画像はページの `generateMetadata` で作って `generateBlogPostMetadata` に渡す（`seo.ts` は `share-image` の型だけを読む）。
- ブログの `ShareImageContent` を作る関数（`blogShareImageContent`）は `src/blog/_lib/share-image-content.ts` に置いた。`seo.ts` はフィーチャーから型だけを読む決まりで、`share-image` も `server-only` なので、画像の Route Handler とページの両方が読める、ブログの側のファイルにした（このファイルは `share-image` から型だけを読む）。
- `twitter-image.tsx` は置かない。Next 16 は `og:image` から `twitter:image` を同じ URL と代替テキストで出す。
- 別の書き出しでのビルドで、記事の画像の `.body` は86枚、`twitter-image` は0枚。86本すべてで `og:image`・`twitter:image`・JSON-LD の `image` が同じ `?v` 付きの URL で、どれも 200・PNG・`.body` とバイト単位で同じ。代替テキストは記事ごとに画像に書いた字と同じ。無い記事と下書きの記事の画像は 404。`?v` の値は別のプロセスで計算し直しても同じ。書体の取得先を壊すとビルドが止まる（`Error occurred prerendering page "/blog/…/opengraph-image"`、exit 1）。
- 行の折り方を画面の見出しと同じ単位（文節の切れ目・空白の後ろ・閉じ括弧の直後。丸括弧の中では割らない）にして、長い題の段が上がった（直す前は 86823f9 の描き方で組んだ値）:

| ブログの題                                                    | 直す前（文節を丸ごと1単位）     | 直した後          |
| ------------------------------------------------------------- | ------------------------------- | ----------------- |
| 69字（nextjs-global-not-found-for-multiple-root-layouts）     | 48px・2行                       | 72px・3行         |
| 67字（nextjs-seo-metadata-and-json-ld-security）              | 48px・3行                       | 56px・3行         |
| 63字（scroll-lock-reference-counter-for-multiple-components） | 56px・3行                       | 64px・3行         |
| 63字（admonition-gfm-alert-support）                          | 56px・3行                       | 56px・3行（同じ） |
| git-command-cheatsheet                                        | 72px・3行（1行目が「Git」だけ） | 96px・2行         |

- 名前の段と描く時間（試しの入力）。描く時間は、5つの書体とどの段も通る1枚と、名前を Zen Antique で組む1枚の2枚を描いて温めたあと、同じ入力を3回描いて PNG に書き出すまでの CPU の時間（`process.cpuUsage`）のいちばん短い値:

| 入力                                             | 選んだ段 | 行                                               | 描く時間（CPU） |
| ------------------------------------------------ | -------- | ------------------------------------------------ | --------------- |
| 69字のブログの題                                 | 72px     | 3行                                              | 88ms            |
| 67字の SEO の題                                  | 56px     | 3行                                              | 77ms            |
| git-command-cheatsheet                           | 96px     | 2行（画面の h1 と同じ所で折れる）                | 33ms            |
| dark-mode-toggle（1段上では単位が1行に入らない） | 64px     | 2行                                              | 34ms            |
| 診断のタイプ名の最長（guardian-charger・35字）   | 72px     | 3行                                              | 62ms            |
| 鉤括弧を含むタイプ名（30字）                     | 84px     | 3行                                              | 42ms            |
| 締切1時間前…画家（28字）                         | 84px     | 3行                                              | 46ms            |
| Supercalifragilistic…                            | 64px     | 3行（語の中だけで折れる）                        | 103ms           |
| 纁（Zen Antique にも BIZ UDGothic にも無い字）   | 96px     | 1行、Noto Sans JP（モジュールが取る5つ目の書体） | 34ms            |
| 𠮟る（Zen Antique に無い字）                     | 96px     | 1行、BIZ UDGothic                                | 19ms            |
| エゾシカ——                                       | 96px     | 3行、ダッシュは1本の線                           | 40ms            |
| 10問中8問正解・漢字マスター                      | 96px     | 数字の結果は1行                                  | 28ms            |
| 72点・Bランク                                    | 96px     | 数字の結果は1行                                  | 23ms            |

- 数字の結果と名前の字の高さは 122px と 87px（1.40倍）。空白は PNG に残る。ブログの86本の題はすべて3行以内で枠に収まり、副題は切れない。1行に収まらない単位は、割れない字の組（行の頭に置かない字と空白は前の字に、行の終わりに置かない字の後ろの字はその字に付けた並び）の境で割り、1行に収まらない組だけを字で割る（禁則の判定は `phrase-breaks.ts` の1か所）。
