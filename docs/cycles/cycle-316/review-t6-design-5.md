# T6 の設計（t6-design.md）のレビュー（5巡目）

- 対象: [t6-design.md](./t6-design.md)（112b806 の時点）。4巡目の指摘は [review-t6-design-4.md](./review-t6-design-4.md)
- 突き合わせたもの: HEAD の `src/`（`rg "opengraph-image|twitter-image" src`・`rg "\bimages?:" src` を自分で走らせた）、`src/app/blog/[slug]/{opengraph-image,twitter-image,page}.tsx`、`src/play/seo.ts`、`node_modules/next`（16.3.0）の `next-metadata-image-loader.js`
- 参照したアンチパターン: `docs/anti-patterns/planning.md`、`docs/anti-patterns/workflow.md`
- サーバーは立てていない。

## 判定: 改善指示

4巡目の指摘は3つとも直っている。ただ、T6-2 が試しのルートをブログにすると、ブログの `twitter-image.tsx` が `opengraph-image.tsx` の `alt` を再エクスポートしているため、T6-2 の途中でビルドが壊れるか、`twitter:image` が古い URL と古い `alt` のまま残る。そのファイルは受け持ちの表で T6-3 だけの持ち物になっている（Major-1）。ほかに、T6-12 の完了の条件が表の中の `|` で切れて、描画すると後半が消える（Minor-1）。T6-2 の内容の欄に、ルートを「1本だけ移す」と「まだ移さない」の2つの書き方が並んでいる（Minor-2）。

---

## 4巡目の指摘の直り方

- **Major-1 画像の URL を組み立てている所**: 直った。自分で `rg` を走らせた。テストとブログの本文とコメントと規約のファイルを除くと、画像のルートの URL を字で組み立てているのは `src/play/seo.ts:41`（`:66` の `images`）と `src/app/blog/[slug]/page.tsx:67` の2つだけだった。`src/lib/seo.ts:97` は記事の前付けの値で、設計の書いたとおり。テストで URL を試しているのは `src/play/__tests__/seo.test.ts:137-160` だけで、ブログのページのテストは試していない。3-2 の表、1つの関数（T6-2 の持ち物。受け持ちの表 `:395`）、T6-2 と T6-3 の条件の「`og:image`・`twitter:image`・JSON-LD の `image` が 200 と PNG」、T6-12 の `rg` の条件が入っている。ただし T6-12 の条件は Minor-1 のとおり、描画すると消える。
- **Minor-1 数字の結果の大きさ**: 直った。3-1（`:170`「3-2 の数字の結果の決まった大きさ」）・3-2（`:196` 出発点 134px、名前の段のいちばん上 96px の約 1.4 倍、1段上にする決め方は採らない理由）・3-5（`:273`）・T6-1・T6-2（96px の名前でも約 1.4 倍、「72点」も同じ大きさ）・T6-6・T6-9（寸法のモジュールの同じ値）で、書き方がそろっている。134px で「10問中8問正解」が約 900px という見積もりも、漢字5字 670px と Plex の数字3字でおおむね合う。
- **Minor-2 `surface="fuda"`**: 直った。3-1 の T10 への2つ目の書き足しと `ShareSurface` の説明（`:176`・`:179`）が同じ中身で、irodori の `content_type`・`content_id` と、札に限った数の分け方と、値の名前を残す理由を言っている。3-5 も同じ。

---

## Major

### Major-1 ブログを試しにすると、ブログの `twitter-image.tsx` が T6-2 の途中でビルドを壊す

`src/app/blog/[slug]/twitter-image.tsx` の中身は次のとおり。

```ts
export {
  default,
  alt,
  size,
  contentType,
  generateStaticParams,
} from "./opengraph-image";
```

- T6-2 がブログの `opengraph-image.tsx` を案 a（`generateImageMetadata` で `alt` を返す）にして `export const alt` を消すと、このファイルの再エクスポートの `alt` が無くなり、型の検査とビルドが落ちる。T6-2 の完了の条件「ビルドと検査とテストが通る」を満たせない。
- `alt` を残したままにすると、ビルドは通る。ただ、`twitter-image` は `generateImageMetadata` を持たないので、`twitter:image` は id を持たない古い URL を指したまま、`twitter:image:alt` も「yolos.net blog」のまま残る。X はまず `twitter:image` を読む（3-2）ので、T6-2 が確かめたい「画像の字を言う代替テキスト」が X には届かず、試しとして半分しか確かめられない。
- 受け持ちの表では、このファイルは「`twitter-image.tsx` のうちルートのほかの39本（消す）」として T6-3 だけの持ち物（`:397`）。T6-2 はこのファイルを触ってよいことになっていない。builder は、持ち物でないファイルを触るか、条件を満たせないまま止まるかになる。
- ブログに限らない。`twitter-image.tsx` を持つ動的なセグメントは、どれも同じ形で `alt` を再エクスポートしている。試しをどのルートにしても同じことが起きる。

直し方の例: T6-2 の内容に「試しのルートの `twitter-image.tsx` は、T6-2 が消す」と書き、受け持ちの表の `:396` の行にそのファイルを入れる（`:397` の「39本」は38本に直すか、「T6-2 が消した1本を除く」と書く）。T6-2 の条件の「`twitter:image`（残っていれば）」は、試しのルートでは「`twitter:image` を持たず、`twitter:card` が `summary_large_image` のまま」に替える。消さずに `generateImageMetadata` も再エクスポートする形を選ぶなら、それを書く。どちらにしても、どのタスクがそのファイルを触るかを1つに決める。

---

## Minor

### Minor-1 T6-12 の完了の条件が、表の中の `|` で切れる

`:384` の T6-12 の完了の条件の欄に、`` `rg "opengraph-image|twitter-image" src` `` がそのまま書かれている。GFM の表では、コードの中でも `|` はセルの区切りになる（エスケープしない限り）。そのため、描画すると、条件は `` `rg "opengraph-image `` で切れる。残りの「twitter-image" src の結果に…0件。PM が T10 の行に ADR009 の2つの書き足し（3-1）を足している。判定の数と PNG を並べた記録がある」は4つ目のセルになり、見出しより多いセルとして捨てられて表示されない。prettier が整えた表にも、列が1つ増えた跡が残っている。

GitHub などで設計を読む PM や builder には、この回で足した grep の条件と ADR009 の条件の両方が見えない。直し方: 表の中では `\|` と書く（例 `` `rg "opengraph-image\|twitter-image" src` ``）。3-2 の段落（`:227`・`:240`）は表の外なので、そのままでよい。

### Minor-2 T6-2 の内容に、ルートを「1本移す」と「まだ移さない」が並んでいる

T6-2 の内容の欄（`:374`）は、途中で「ルートはその1本の試しのほかは移さない」と書き、終わりで「ルートはまだ移さない（いまの `ogp-image.tsx` は触らない）」と書いている。後ろの文だけを読むと、試しのルートも移さないように読める。後ろの文を「試しの1本のほかのルートは移さない（いまの `ogp-image.tsx` は触らない）」にそろえる。

---

## 全体を見直して、問題の無かった所

1章・2章の事実、3-3・3-4・3-6・3-7・3-8、4章の順序と T5・T5a・T7 との重なりの表、T6-0・T6-4〜T6-11 の条件、5章は、4巡目から変わっておらず、読み直しても食い違いは無かった。1〜4巡目で決まったことを蒸し返す指摘はしていない。

## PM への指示

1. planner に t6-design.md を直させる（Major-1、Minor-1・2）。
2. 直したら、もう一度レビューに出す。そのときは、この指摘の直り方だけでなく、設計の全体を見直す。
