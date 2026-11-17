# T6 の設計（t6-design.md）のレビュー（4巡目）

- 対象: [t6-design.md](./t6-design.md)（19eb66d の時点）。3巡目の指摘は [review-t6-design-3.md](./review-t6-design-3.md)
- 突き合わせたもの: [index.md](./index.md) の T5・T6・T7・T9・T10・T12 の行と完了の条件、`DESIGN.md` §4・§8・§10、HEAD のコード（`FittedNumber.module.css`・irodori の `FinalResult.tsx`/`.module.css`・`src/play/quiz/data/kanji-level.ts`・`src/play/seo.ts`・`src/app/blog/[slug]/page.tsx`・`src/lib/analytics.ts`）、`node_modules/next`（16.3.0）の `get-metadata-route.js`・`next-metadata-image-loader.js`・`next-metadata-route-loader.js`
- 参照したアンチパターン: `docs/anti-patterns/planning.md`、`docs/anti-patterns/workflow.md`
- サーバーは立てていない。画像も描いていない。

## 判定: 改善指示

3巡目の指摘は、どれも設計の中で直っている（下の一覧）。ただ、代替テキストの渡し方で勧めている案 a（`generateImageMetadata`）は画像の URL を変える。「画像の URL を自分で組み立てている所」として設計が挙げるのは `src/play/seo.ts` だけで、ブログの記事の JSON-LD（`src/app/blog/[slug]/page.tsx:67`）が抜けている。しかもそのブログは、T6-2 の試しのルートの例として挙げられている。このままだと、Google 検索向けの記事の構造化データの画像が、黙って 404 を指す（Major-1）。ほかに、数字の結果の大きさの決まりが、ちょうど試しの入力で満たせない（Minor-1）。GA の値の書き残しにも小さな抜けがある（Minor-2）。

---

## 3巡目の指摘の直り方

- **Major-1 数字の結果**: 直った。3-1・3-2・3-5 で、「数字の結果」の決まりが1つになった（補助情報の下・名前の上・見出しの書体・名前より大きい段・渡した区切りでだけ折る）。画面の事実とも合う。`FittedNumber.module.css` の `.number` は `--font-heading`・`--text-heading-main`、irodori の `.total` も `--font-heading`・`--text-heading-main`、§8 の「数字・短い語」は主見出しの段、「名前」はセクションの見出しの段。T6-2 の入力（数字の結果）と試しの入力（「10問中8問正解」と「漢字マスター」の組・「72点」）、T6-1 の §10 の書き足し、T6-9 の条件にも入っている。段位は3本とも5段位（`minScore` 0・3・5・7・9）、画像は 11×3＝33枚で合う。大きさの決め方だけ、下の Minor-1 が残る。
- **Major-2 代替テキストの渡し方**: 決めるタスクは T6-2 に移った。T6-2 の条件に、試したルートの `og:image`・`og:image:alt`・幅と高さ・200 と PNG・ビルドの書き出しを確かめること、成り立たないときは c に替えることが入った。4章の順序には「タスクごとに選ばない」とある。事実も確かめた。`generateImageMetadata` の `alt` は画像のメタに渡り（`next-metadata-image-loader.js:87`）、各 id は `generateStaticParams` で静的に書き出される（`next-metadata-route-loader.js:175-183`）。`src/play/seo.ts` の `twitter.images` を消すのは T6-3 の受け持ちになり、T6-3 の条件に「`og:image` の URL が 200 と PNG を返す」も入った。ただし、URL を組み立てている所がもう1つある（Major-1）。
- **Minor-1 `page-coverage.test.ts`**: 直った（T6-3 の内容と受け持ちの表）。
- **Minor-2 ルートの `twitter-image.tsx`**: 直った。消すのは T6-7。T6-3 の条件も「ルートの1本だけが残る」になっている。
- **Minor-3 irodori の `surface`**: 直った（3-5・T6-9。`trackSave(contentId, contentType, method, surface)` の引数の順もコードと合う）。GA を読む人に伝わるかは Minor-2 を見てほしい。
- **Minor-4 favicon の確かめ方**: 直った。`emulateMedia` の light と dark で 16px と 32px を描いて撮る。実際のタブの見え方は T9 に渡す。
- **Minor-5 irodori の `GameContainer.tsx`**: 直った（4章の頭の表と受け持ちの表）。

---

## Major

### Major-1 ブログの記事の JSON-LD が、案 a で変わる画像の URL を組み立てている

`src/app/blog/[slug]/page.tsx:65-68` は、記事の構造化データ（`generateBlogPostJsonLd`、`BlogPosting`）の `image` に `${BASE_URL}/blog/${slug}/opengraph-image` を書いている。案 a にすると、ブログの画像は `…/opengraph-image/{id}` に移り、この URL は 404 になる。

- 設計は、URL を組み立てている所として `src/play/seo.ts` だけを挙げている（3-2 の案 a の欄、`src/lib/seo.ts` は触らないという段落）。T6-3 の条件が確かめるのも `og:image` と `twitter:image` の URL だけで、JSON-LD は見ない。ブログのページのテストはこの URL を試していない（`src/` のテストで `opengraph-image` を含むものに、ブログのページのテストは無い）。どのテストも落ちず、誰も気づかないまま出荷される。
- 来訪者への害: サイトへの来訪の大半は Google 検索から来る（2-3。リファラの Google 2,350）。記事の構造化データの画像が壊れると、検索結果や Discover で記事に画像を添える材料を失う。
- 受け持ちもずれている。T6-2 は、試しのルートとして「例 ブログ」を移したまま残す（「ルートはその1本の試しのほかは移さない」）。ところが受け持ちの表では、ブログの `opengraph-image.tsx` は T6-3 だけの持ち物で、`blog/[slug]/page.tsx` はどのタスクの持ち物でもない。T6-2 がブログを試せば、T6-2 が終わった時点で JSON-LD が壊れる。

直し方の例:

- 3-2 の案 a の欄と、`src/play/seo.ts` の段落に、`src/app/blog/[slug]/page.tsx` の JSON-LD の `image` を書き足す。
- JSON-LD の `image` は、決めた渡し方と同じ関数（T6-2 がモジュールに置くもの）から URL を取るようにする。字で書き写さない。
- 試しのルートの画像の URL を変えるタスクに、その書き換えを持たせる。試しがブログなら T6-2、そうでなければ T6-3。
- 受け持ちの表では、試しのルートとブログのページを「T6-2 → T6-3」の順にする。
- T6-2 と T6-3 の条件の「URL が 200 と PNG を返す」を、`og:image`・`twitter:image`・JSON-LD の `image` のすべてに広げる。
- あわせて builder に `rg "opengraph-image" src` を走らせ、画像の URL を組み立てている所が残っていないことを条件にさせる。いま `src/`（テストを除く）で組み立てている所は、この2つだけだった。

---

## Minor

### Minor-1 数字の結果の大きさの決まりが、試しの入力で満たせない

3-2 は、数字の結果を「名前の段より1段以上大きい段」とする。名前の段は、試作の段（96・84・72・64・56・48・42px）のうち、3行以内に収まるいちばん大きいものが選ばれる。

- T6-2 の試しの入力の段位の名前「漢字マスター」（6字。kanji-level の段位の名前はどれも6字以下）は、96px で1行に収まるので、いちばん上の段になる。その上に段は無い。数字の結果の大きさは、builder が自分で決めることになる。
- irodori の画像（3-5）は名前を持たない（数字の結果の下にあるのは、本文の書体のランクの文）。そのため「名前より1段大きい」の基準が無い。T6-9 の条件「T6-2 の数字の結果と同じ段」も確かめようがない。
- 名前の段どうしの差は約 1.14 倍しかない。1段上にしただけでは、画面の主見出しとセクションの見出しの差（§4 の 4.08 / 2.92 ≒ 1.4 倍）ほどの重みの差が出ない。

直し方の例: 数字の結果は、名前の段に依らない決まった大きさにする。名前の段のいちばん上（96px）より大きく、画面と同じく 1.4 倍前後の差が出る大きさ（例 約 134px）にし、それでも1行に収まらないときだけ渡された区切りで折る。T6-1 の §10 の書き足し、T6-2 の条件、T6-9 の条件を、この決まりで書く。

### Minor-2 irodori の保存が `surface="fuda"` で数えられることが、T10 への書き足しに書かれていない

値の名前「fuda」は、出荷のあとは「結果の画像」を指す計測の値になる。コードでは `ShareSurface` の説明で分かる。GA（BigQuery）を読む人は `surface = "fuda"` で数えるので、その中身がいつから何を含むかは、ADR009 の書き足し（T10）で分かる必要がある。3-1 の T10 への書き足しの2つ目は、ほかの診断・クイズについては `surface="fuda"` と書いているが、irodori については「`save` として新しく出る」とだけ書いている。

直し方の例: 3-1 の書き足しを次のように書く。「出荷の日から、`surface="fuda"` は診断・クイズの結果の画像に加えて irodori の結果の画像の保存（`content_type="game"`・`content_id="irodori"`）を含む。札に限った数を読むときは `content_type`・`content_id` で分ける」。`ShareSurface` の説明も同じ中身にする。値の名前は、出荷の前後で数をつなげるためにそのまま残す。そう読めれば、GA を読む人が迷うことは無いと判断した。

---

## 全体を見直して、問題の無かった所

4章の順序、T5・T5a・T7 との重なりの表、受け持ちの表、T6-0 と T6-11 の条件、3-7、3-8 は、3巡目から変わっておらず、読み直しても食い違いは無かった。

## PM への指示

1. planner に t6-design.md を直させる（Major-1、Minor-1・2）。
2. 直したら、もう一度レビューに出す。そのときは、この指摘の直り方だけでなく、設計の全体を見直す。
