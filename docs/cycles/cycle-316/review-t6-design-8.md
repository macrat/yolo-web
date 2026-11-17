# t6-design.md のレビュー（8巡目。`1798244` 要求のときに描く形、プレイ面の3ページ、2段以上のルート、hash に使う字）

## 判定: 承認

7巡目（[review-t6-design-7.md](./review-t6-design-7.md)）の Major-1・Major-2・Minor-1〜6 は、どれも設計の文に入っていて、HEAD のコードと食い違わない。b にかかわる所（3-2 の「名前ごとの代替テキストの渡し方」から「確かめること」まで、4章の T6-2〜T6-8 の行、4章の頭の表、受け持ちの表、5章）を通して読み直した。builder が迷う所や、来訪者に害が出る所は見つからなかった。

## 確かめたこと

### Major-1（T6-8 の要求のときに描く形）

- 3-2 の Route Handler の決まりに、T6-8 だけの例外として書かれている。中身は次のとおり: `generateStaticParams` は空の配列、`dynamicParams` は既定（true）、無い字は `GET` の中で `notFound()`。`dynamicParams = false` のまま `generateStaticParams` を外すとどの字も 404 になる、ということも書いてある。
- 損も書かれている。書体を取れないときにビルドで止まらず、要求のときの 500 になり、「ビルドで止まる」確かめが効かなくなる。T6-8 の比べの材料にもなっている。
- T6-8 の完了の条件に「無い字・無い四字熟語の画像の URL が 404（どちらの形でも）」がある。
- 事実の確かめ:
  - `next.config.ts` は `cacheComponents` を使っていない。なので、空の `generateStaticParams` がビルドで拒まれることは無い。
  - Route Handler の中の `notFound()` は、Next 16.3.0 の `app-route/module.js:493-494`（`isHTTPAccessFallbackError` → その status）で 404 の応答になる。

### Major-2（プレイ面の3ページ）

- 3-2 の「プレイ面の3ページ」は次の3つを決めている。
  - `generatePlayMetadata` は、診断・クイズのページ（`[slug]`・music-personality）にだけ `openGraph.images` を渡す。daily には渡さない。渡すかどうかは、メタが診断・クイズかで決める。
  - `[slug]` の Route Handler は `getAllQuizSlugs()`（15本。music-personality を含む）を列挙する。
  - daily とゲーム4本は列挙しない。
- HEAD のコードと照らした。
  - `src/play/quiz/registry.ts` の `quizEntries` は15本で、music-personality を含む。
  - `src/app/play/music-personality/` は `page.tsx`・`result/`・`__tests__/` だけで、自分の画像のファイルを持たない。
  - `src/app/play/daily/opengraph-image.tsx` はある。
  - `generatePlayMetadata` の呼び手は3ページだけ。daily の `fortunePlayContentMeta` は `contentType` が `fortune` で、メタで分ける決まりのとおり分けられる。
  - `play/[slug]/opengraph-image.tsx` のいまの列挙は `getAllPlaySlugs()`。
- T6-3 の完了の条件には次の3つがある。
  - `/play/music-personality` の `og:image` を PNG で見て、音楽性格診断の名前の画像であること。
  - `/play/daily` の `og:image` が、daily の規約のファイルの画像のままであること。
  - プレイ面の `.body` が15本であること。
- daily・music-personality・`[slug]` の page のテストは `twitter`・`opengraph-image` を試していない（grep で0件）。T6-3 の「試していればそれも」は、何もしなくてよいことになる。害は無い。

### Minor-1〜6

- Minor-1: 4章の頭の表は、T5-5a を3本（`[slug]`・`character-fortune`・`character-personality`）と書いている。
- Minor-2: 3-2 に、2段以上のルートは `generateStaticParams` が全段の組を返すという決まりがある。当てはまるのは T6-4 と T6-7 のルートで、7巡目の確かめを事実として書いている。5章の「決めきれない所」からも外れている。
- Minor-3: 5章の X のカードの段落は、「T12 で本番の X のカードに画像が出ることを確かめる」の1文になっている。
- Minor-4: 一覧と `/about` は規約のファイルのままで、`openGraph.images` を足さない。`page.tsx` を触るのは h1 の字を定数に出すときだけ。このことが T6-7 の行・4章の頭の表・受け持ちの表の3か所で同じに書かれている。
- Minor-5: ユーモア辞典の画像の試験が、T6-3 の内容・完了の条件・受け持ちの表に入っている。
- Minor-6: `?v={hash}` の欄に次の2つが入っている。
  - 版の値で取り直されるのは b のルートだけで、規約のファイルのルートには効かない。
  - hash に使う字は、キーを名前の順に並べた JSON をつないだもの。

## 指摘

無し。

## 次に進めること

PM は、この設計のとおり T6-2 以降を builder に渡してよい。どのタスクも、終えたらレビューを受ける。
