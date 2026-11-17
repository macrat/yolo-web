# T6-3 第2回レビュー（共通の画像のルートを新しい描き方に移す）

対象: コミット a5304a35（本体）・f10b9e6b（第1回の指摘1の直し）、t6-log.md の「## T6-3」。照らしたもの: review-t6-3-1.md、t6-design.md の T6-3 の行、docs/anti-patterns（implementation・workflow）。

## 判定: 承認

第1回の指摘1は直っていました。T6-3 の全体に、新しい穴は見つかりませんでした。画像・代替テキスト・メタ・静的生成は、第1回で完了の条件をすべて確かめています。f10b9e6b はそこに触れていません。

## 確かめ方

- HEAD（f10b9e6b）を `git archive` で scratchpad の新しいディレクトリに書き出した。`node_modules` が無いのを確かめてから `cp -al` し、そこで次を回した。書き出しは最後に消した。
  - `vitest run src/play`: 138ファイル・2141件、すべて通った。
  - `npm run typecheck`（`generate:release-id` のあとに `tsc --noEmit`）: 0。書き出しの中で素の `tsc --noEmit` を回すと、`src/lib/generated/release-id.ts` が無いと言って落ちる。このファイルは git が追わない生成物なので、T6-3 とは関わらない。
  - 変更した2ファイルの eslint は0。prettier は、その2ファイルと t6-log.md のどれも通る。
- `git grep getAllPlaySlugs HEAD -- src .claude docs/*.md docs/knowledge docs/anti-patterns` は0件。
- a5304a35 で消したファイルが import していたものを洗い直した。`getAllPlaySlugs` のほかは、`playContentBySlug`・`getAllSlugs`・`getEntryBySlug`・`@/lib/ogp-image` の3つの関数と、`./opengraph-image` の再 export（twitter-image）だった。これらはどれも、ほかに使う所がある。受け取り手を失った export は、これで残っていない。

## 第1回の指摘1

- `src/play/registry.ts` から `getAllPlaySlugs` を消し、その `describe` と import を `src/play/__tests__/registry.test.ts` から消した。
- 消した試験が確かめていたことは、残る試験が受け持つ。20本の数は `allPlayContents (20種)` の `toHaveLength(20)` が、ゲームの4本の slug は同じ `describe` の `contains all 4 game slugs` が確かめる。確かめる中身は減っていない。
- t6-log.md の T6-3 の段落の「消したもの」の並びに、1行が入った。前後と同じ書き方で、読みの流れも切れていない。

直っています。

## T6-3 の全体を見直して

- 中身を作る関数を面ごとに1つにした。画像のルートとページのメタが同じ値から作られるので、画像・代替テキスト・URL は食い違わない。
- `ogpSubtitle`・`overrides`・字で組み立てていた `twitter.images`・38本の `twitter-image.tsx`・`getAllPlaySlugs` を、どれも消し切った。現用のコードと文書に残りは無い（AP-I13）。
- 来訪者から見ると、共有のカードはどれも前より良くなった（第1回の「画像を見て」のとおり）。ゲームの副題は遊び方が分かる言い方になり、ユーモア辞典は定義が全文出る。privacy は同じ語を2度並べなくなった。
- t6-log.md の完了の条件の測りは、f10b9e6b の前に取ったもの（vitest 全件で6360件）。直しで試験が1件減ったので、いまの数とは1件ずれる。ただ、これはサイクルの記録にある、その時点の測りである。直す要るものではない。

## T6-3 の外で気づいたこと（このタスクの指摘ではない）

`src/play/__tests__/registry.test.ts` で、`describe("allPlayContents (ゲーム)")` の `contains all expected game slugs`（61〜68行）と、`describe("allPlayContents (20種)")` の `contains all 4 game slugs`（134〜139行）が、同じことを試している。この重なりは T6-3 より前のサイクル（ca3e43b・5cc8be2）からあって、T6-3 が作ったものではない。ただ、CLAUDE.md の「ツギハギ禁止」は、見つけたらその場で直すよう求めている。このため PM は、別の小さなタスクで片方を消して、レビューを受けること。T6-3 の承認を止めるものではない。

## PM への報告

T6-3 は承認です。上の「T6-3 の外で気づいたこと」は、別のタスクとして扱ってください（builder が直し、レビューを受ける）。
