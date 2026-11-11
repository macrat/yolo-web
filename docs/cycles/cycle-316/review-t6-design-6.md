# T6 の設計（t6-design.md）のレビュー（6巡目）

- 対象: [t6-design.md](./t6-design.md)（dd1f68d の時点）。5巡目の指摘は [review-t6-design-5.md](./review-t6-design-5.md)
- 突き合わせたもの: HEAD の `src/`（`find src/app -name 'twitter-image.*'`・`find src/app -name 'opengraph-image.*'`・`rg "opengraph-image|twitter-image" src` を自分で走らせた）、`src/app/blog/[slug]/` の5つのファイル、`src/app/tools/__tests__/page-coverage.test.ts`
- 表の列の数は、表の行ごとにエスケープされていない `|` を数えるスクリプトで確かめた。`npx prettier --check` も通った。
- 参照したアンチパターン: `docs/anti-patterns/planning.md`、`docs/anti-patterns/workflow.md`
- サーバーは立てていない。

## 判定: 承認

5巡目の指摘は3つとも直っていて、設計の全体を読み直しても、builder が迷う所・途中でビルドやテストが壊れる所・来訪者に害が出る所は見つからなかった。

---

## 5巡目の指摘の直り方

- **Major-1 試しのルートの `twitter-image.tsx`**: 直った。
  - T6-2 の内容（`:386`）に「ブログなら、`twitter-image.tsx` を消し、`page.tsx` の JSON-LD の `image` をその関数から取る形に直す」とあり、完了の条件に「試したルートのページは `twitter:image` を持たず、`twitter:card` が `summary_large_image` のまま」「試しのルートのディレクトリに `twitter-image.tsx` が無い」がある。
  - 受け持ちの表（`:408`）で、試しのルートの `opengraph-image.tsx`・`twitter-image.tsx`（T6-2 が消す）・ブログの `page.tsx` が「T6-2 → T6-3」になっている。T6-3 の行（`:409`）は「ルートと T6-2 の試しのルートのほかの38本」。T6-3 は T6-2 のあとに始まるので、並行して触ることは起きない。
  - 数の合い方: HEAD の `twitter-image.tsx` は40本（ルート1・ブログ1・ユーモア辞典1・privacy 1・道具36）。T6-2 がブログの1本、T6-7 がルートの1本、T6-3 が残りの38本（道具36・ユーモア辞典・privacy）で、1+1+38=40。T6-3 の内容の面（ブログ・道具・プレイ面・daily・ゲーム・ユーモア辞典・privacy）と、残る38本の置き場所も合う（プレイ面・daily・ゲームは `twitter-image.tsx` を持たない）。3-2 の段落（`:256`）・T6-3 の条件（「`src/app` の `twitter-image.tsx` がルートの1本だけ」）・レビューへの対応の3巡目 Minor-2 の書き直しも同じ数で書かれている。
  - ブログのディレクトリの表（`:246-252`）を HEAD と照らした。中身は `opengraph-image.tsx`・`twitter-image.tsx`・`page.tsx`・`page.module.css`・`__tests__/page.test.tsx` の5つで表と同じ。`opengraph-image.tsx` は `alt`（「yolos.net blog」）・`size`・`contentType`・`generateStaticParams`・描く関数を export し、`twitter-image.tsx` はその5つを再エクスポートし、`page.tsx:67` が `${BASE_URL}/blog/${slug}/opengraph-image` を字で書き、`page.test.tsx` は `opengraph`・`image` を含まない。どれも表のとおり。ブログの画像のルートを import するテストは無く、`page-coverage.test.ts` の `REQUIRED_FILES` は道具のディレクトリだけを見るので、T6-2 がブログの `twitter-image.tsx` を消してもテストは壊れない。
- **Minor-1 表の中の `|`**: 直った。T6-12 の条件（`:396`）は `` `rg "opengraph-image\|twitter-image" src` `` になっている。20の表のすべてで、行ごとの区切りの数が見出しと同じだった（T6 のタスクの表は3列、受け持ちの表は2列など）。表の外の `:227`・`:240`・`:254` はエスケープしていないが、表の外なのでそのまま描かれる。
- **Minor-2 T6-2 の内容**: 直った。「試しの1本のほかのルートは移さない（いまの `ogp-image.tsx` は触らない）」になり、前の「試しのルートは、この T6-2 で新しい描き方に移し」と食い違わない。

---

## 全体を見直して

1〜5巡目で決まったことは蒸し返していない。読み直して、次のことを確かめた。

- 4章の順序（T6-0・T6-1 → T6-2 → 面ごと → T6-11 → T6-12）と受け持ちの表で、同じファイルを2つのタスクが並行して持つ所は無い。
- 試しをブログ以外にしたときの扱いは、`:239` の「書き換えは、そのルートの画像の URL を変えるタスクが持つ」と `:254` の「ディレクトリの中身を同じ表の形で確かめて記録し、`twitter-image.tsx` を消し、URL を字で組み立てている所を直す」で決まっている。T6-3 は T6-2 のあとに始まるので、その場合も並行して触る事故にはならず、T6-3 の条件（`twitter-image.tsx` がルートの1本だけ・どのページの URL も 200 と PNG）は試しのルートに依らず成り立つ。
- どのタスクも完了の条件に「ビルドと検査とテストが通る」を持つ。

## PM への指示

指摘事項は無い。T6-0 と T6-1 から実装に進んでよい。各タスクは、終わったらレビューに出す。
