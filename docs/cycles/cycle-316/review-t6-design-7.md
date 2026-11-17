# t6-design.md のレビュー（7巡目。`e54e951` 代替テキストを案 b に、`?v={hash}`、規約のファイルのままにするルート、T6-2〜T6-8、4章の頭の T5 との順）

## 判定: 改善指示

b の骨組み（フォルダ名 `opengraph-image` の `force-static` な Route Handler と、ページの `openGraph.images` を同じ `ShareImageContent` から作る）は、Next 16.3.0 の事実と合っていて、来訪者に良い選択です。`?v={hash}` の決め方も筋が通っています。ただ、設計の中で互いに食い違う所が1つ（T6-8）と、builder が迷って画像を 404 にしうる所が1つ（プレイ面の `generatePlayMetadata` を使う3ページ）あり、ほかに事実の誤りと古くなった段落があります。どれも設計の文を直せば済みます。

## 確かめた事実

- `node_modules/next`（16.3.0）の `resolve-metadata.js`:
  - `mergeStaticMetadata`（126行〜）: 規約のファイルの画像は、そのセグメントの `metadata` が `openGraph.images`／`twitter.images` を持たないときだけ入る。
  - `postProcessMetadata`（619行〜）: `twitter` が `images` を持たないとき、`openGraph.images` を `twitter` に補う。
  - `openGraph`・`twitter` はセグメントごとに丸ごと置き換わる（浅い合わせ方）。設計の「`images` は題や説明と同じ `openGraph` の中に入れる」は正しい。
- b の対象のページの `metadata`（`src/lib/seo.ts` の5つの関数・`src/play/seo.ts`・結果のページ10本・privacy）は、どれも `twitter` を `images` なしで持つ（`generatePlayMetadata` だけが明示の `images` を持ち、T6-3 がやめる）。なので、ルートの `twitter-image.tsx` が T6-7 まで残っていても、b にしたページの `twitter:image` は `openGraph` から補われる。「T6-2〜T6-5・T6-8 の完了の時点で `og:image` と `twitter:image` が同じ」は成り立つ。
- スクラッチの最小のアプリ（`r7app/`。このリポジトリの `node_modules` の Next 16.3.0。`r62-bapp/` を写して足した）でビルドし、`next start` で配信して確かめた:
  - 2段のルート `app/p/[slug]/result/[rid]/opengraph-image/route.tsx`（`generateStaticParams` が `{slug, rid}` の組を返し、`dynamicParams = false`）で、ビルドがすべての組を `●` で書き出した。
  - 知っている組は 200・PNG を返した。知らない組（`/p/q9/result/z/opengraph-image`）は 404 だった。
  - `?v=abc` を付けても、同じ PNG を `x-nextjs-cache: HIT` で返した。
  - 無い slug（`/b/three/opengraph-image`）は 404 を返した。
  - ページの HTML には `og:image` と同じ URL・同じ文の `twitter:image`・`twitter:image:alt` が出た。
  - 静的なセグメント `app/b/one/opengraph-image.tsx`（規約のファイル）と、`app/b/[slug]/opengraph-image/route.tsx` の `generateStaticParams` の `one` を重ねた。ビルドは通り、配信で返ったのは静的な側の画像だった。
- t5-design.md 10-1・10-4 と、4章の頭の表・受け持ちの表を照らした。`src/lib/seo.ts`・`src/play/seo.ts` は、t5-design.md 10-4 に無い（T5 は触らない）。ブログの `page.tsx` を T6-2 と T5-15 が並行して触らないこと、結果のページを T5-5a → T5-6 → T6-4 の順にすること、`/about` を T5-21 と T6-7 が並行して触らないことは、どちらの設計でもそろっている。

## 指摘

### Major-1: T6-8 の「最初の要求で描く」が、3-2 の決まり（`dynamicParams = false`）と食い違い、そのまま組むと漢字と四字熟語の画像がすべて 404 になる

3-2 は、どの Route Handler も「`force-static`・`revalidate = false`・`generateStaticParams`・`dynamicParams = false`（無い id は 404）」を持つと決めている。一方 T6-8 は「最初の要求で描くか（Route Handler に `generateStaticParams` を持たせない）」を選べるとしている。`dynamicParams = false` のまま `generateStaticParams` を外すと、どの字も 404 になる。T6-8 の完了の条件（10件の 200）で気づけはするが、設計の2か所が互いに違うことを言っている。

直すこと:

- 3-2 の Route Handler の決まりに、例外として T6-8 の要求のときに描く形を書く。その形では、`generateStaticParams` は空の配列を返す。`dynamicParams` は既定（true）のままにし、無い字は `GET` の中で `notFound()` にする。
- その形では、書体を取れないときにビルドが止まらず、要求のときの 500 になる。3-2 の「書体を取れないときにビルドで止まる」確かめが効かなくなることを比べの材料に書く。T6-8 の完了の条件には、無い字の URL が 404 になることを足す。

### Major-2: `generatePlayMetadata` を使う3ページの画像の出どころが決まっておらず、`/play/music-personality` の画像を失いうる

`generatePlayMetadata` を使うページは3つある。

- `/play/[slug]`: b にする。
- `/play/daily`: 規約のファイル `play/daily/opengraph-image.tsx` を持つ。
- `/play/music-personality`: 静的なセグメントで、自分の画像のファイルを持たない。

`/play/music-personality` のいまの画像は、`play/[slug]/opengraph-image.tsx` が描いている。この規約のファイルは `getAllPlaySlugs()`（すべてのプレイ面の slug）を列挙する。設計（3-2 の表と T6-3 の行）は「`/play/[slug]` は b。daily は規約のファイル」とだけ言い、music-personality については何も書いていない。builder が `[slug]` の Route Handler の `generateStaticParams` をページと同じ `getAllQuizSlugs()` にすると、`dynamicParams = false` のもとで music-personality の画像は 404 になる。いまは `twitter:image` で出ている画像を、カードから失うことになる。daily についても、`generatePlayMetadata` が `openGraph.images` を渡すと、同じセグメントの規約のファイルは使われなくなる（`mergeStaticMetadata`）。「daily は規約のファイル」と、関数の作り方が噛み合っていない。

直すこと:

3-2 か T6-3 の行に、次の3つを書く。

- `generatePlayMetadata` がどの呼び手に `openGraph.images` を渡すか。例: `[slug]` と music-personality には渡し、daily には渡さない。または、daily も b の URL に向けて規約のファイルを消す。どちらにするかを決める。
- `play/[slug]/opengraph-image/route.tsx` の `generateStaticParams` が列挙する slug。`[slug]` のページが描く slug に music-personality を足したもの。
- daily とゲーム4本は、それぞれの静的なセグメントが画像を持つ。そのため、`[slug]` の Route Handler に列挙しても、配信されるのは静的な側になる（確かめた）。列挙から外すかを書く。

T6-3 の完了の条件では、`/play/music-personality` の `og:image` が music-personality の名前の画像であることを PNG で見る（200 だけでなく）。

### Minor-1: T5-5a の受け持ちの本数の誤り

4章の頭の表の「結果のページの `page.tsx`」の行が「T5-5a が2本（`[slug]`・`character-fortune`）」と書いている。t5-design.md 10-4 では3本（`[slug]`・`character-fortune`・`character-personality`）である。順（T5-5a → T5-6 → T6-4）は変わらないが、事実に合わせる。

### Minor-2: 2段の動的なセグメントの扱いが T6-4 だけに書かれ、T6-7 の2段のルートに触れていない

T6-7 の b のルートには、2段のものが多い。`blog/tag/[tag]/page/[page]`・`blog/category/[category]/page/[page]`・`dictionary/kanji/{radical,grade,stroke}/…/page/[page]`・`dictionary/yoji/category/[category]/page/[page]`・`dictionary/colors/category/[category]/page/[page]` がそれにあたる。3-2 と5章の「2段の Route Handler」の段落を、どのタスクのどのルートにも当てはまる決まりにする。決まりは「`generateStaticParams` が全段の値を返す」。あわせて、上の確かめ（Next 16.3.0 で全段の組を返せばすべて書き出され、知らない組は 404）を事実として書き、5章の「決めきれない所」から外す。T6-4 と T6-7 の完了の条件は、「ビルドの表で `.body` の数がページの数と同じ」のままでよい。

### Minor-3: 5章の「本番の X のカード」が古い前提のまま

この段落は「`twitter-image.tsx` を消したあと、X のカードに `og:image` の画像が出ることを確かめ、出なければ `twitter:image` を出す直しのタスクを立てる」と書いている。いまの設計では、Next が `openGraph` から `twitter:image` を補うので、`twitter:image` は出る（3-2 の段落と T6-2 の条件がそう言っている）。T12 で本番の X のカードに画像が出ることを確かめる、という1文に直す。

### Minor-4: T6-7 の「一覧と `/about` の `page.tsx` の `generateMetadata`（`openGraph.images`）」が、規約のファイルのままにする決めと噛み合わない

3-2 と T6-7 の行は、1ページだけのルート（一覧のページ・`/about`・ルート）を規約のファイルにすると決めている。規約のファイルにするなら、そのページの `metadata` に `openGraph.images` を足してはいけない。足すと、規約のファイルは使われなくなる（`mergeStaticMetadata`）。受け持ちの表の T6-7 の行と、4章の頭の表の行は、次のように分けて書く。

- 一覧と `/about` の `page.tsx`: h1 の字を定数に出すときだけ触る。
- `openGraph.images` を足すのは b の索引・分類・ページ送り・タグだけ。

### Minor-5: 規約のファイルを消すタスクが、それを import する既存のテストも持つことを書く

`../opengraph-image` を import するテストは4つある。

- `src/app/dictionary/humor/[slug]/__tests__/opengraph-image.test.tsx`（T6-3）
- `src/app/dictionary/colors/[slug]/__tests__/opengraph-image.test.ts`（T6-5）
- `src/app/play/[slug]/result/[resultId]/__tests__/opengraph-image.test.tsx`（T6-4）
- `src/app/play/traditional-color/result/[resultId]/__tests__/opengraph-image.test.ts`（T6-4）

T6-4・T6-5 の受け持ちの行には「とテスト」とあるが、T6-3 の行には、ユーモア辞典のテストの名が無い。T6-3 の行に足す（テストは Route Handler の `GET` と、ページの `openGraph.images` を作る関数を試す形に書き直す）。

### Minor-6: `?v={hash}` の「版の値を上げる」は、規約のファイルのままのルートには効かない

`?v={hash}` の表は、描き方のコードだけを変えたときは、枠の寸法のモジュールの版の値を上げると書いている。これで URL が変わるのは b のルートだけである。道具36本などの規約のファイルの URL（Next の hash は、そのルートのファイルの中身の hash）は変わらない。この出荷では、どのルートのファイルも書き換わるので問題は無い。ただ、後で描き方だけを直す人が迷わないよう、表の同じ欄に、規約のファイルのルートは版の値では取り直されないことを1文足す。あわせて、hash に使う字の並べ方を書く（`ShareImageContent` のキーを決まった順に並べる。ビルドをまたいで同じになるように）。

## 良かった所

- 案 a・b・c の比べ方が、来訪者から見た損（名前が届かない、ビルドで止まらない）で書かれ、CLAUDE.md の判断の原則どおりに b を選んでいる。
- 画像と代替テキストと JSON-LD の `image` を、同じ `ShareImageContent` から1つの関数で作ることにしている。そのため、字と文と URL が食い違わない。
- `?v={hash}` を内容と寸法の値から作ることで、名前が変わったページだけ SNS が取り直す。hash はビルドをまたいで同じになる。
- 完了の条件は、`og:image` と `twitter:image` が同じ URL・同じ文であること、URL が 200 と PNG を返すこと、`.body` の数を、配信したビルドで数える形になっていて、確かめられる。
- `src/lib/seo.ts` を T6-2 → T6-3・T6-5・T6-8（並行させない）の順にしたので、どのファイルも同時に2つの持ち主を持たない。

## 次に進めること

1. planner が Major-1・Major-2・Minor-1〜6 を t6-design.md に反映する。
2. もう一度レビューを受ける。前回の指摘だけでなく、全体を見直す。
