# T5-17 レビュー 3回目（道具のページの頭と ErrorBoundary）

## 判定

**承認**

T5-17 の変更に指摘は無い。email-validator の h1 の語の中の折れ（1回目の指摘1）は、index.md の PM の決定 (1) のとおり T5-29 の受け持ちで、ここでは数えない。T5-17 の完了の条件のうち、この1点は T5-29 のあとに確かめる。これは T5-17 の変更に残る問題ではない。

## 確かめたこと

HEAD（71ba5cf8）を `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で張り、T5-17 の12ファイルだけを重ねて `npm run generate:release-id` を走らせた。重ねたファイルは作業ツリーのものと `cmp` で同じことを確かめた。T5-29 の `src/lib/phrase-breaks.ts` は重ねていない。確かめたあと、自分で立てたサーバーを PID を指定して止め、書き出しを消した。

| 検査                                                                                | 結果                                                                                |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| vitest（`src/tools`・`src/app/tools`・`RelatedTools`・`Section`、`--maxWorkers=2`） | 90ファイル・2092件が通る（`RelatedBlogPosts` は T5-20b でコミット済みなので外した） |
| `tsc --noEmit`                                                                      | 通る                                                                                |
| eslint（T5-17 のファイル）                                                          | エラー0（CSS の3本は設定の外なので無視された、という警告だけ）                      |
| prettier（T5-17 のファイル）                                                        | 通る                                                                                |
| `next build`                                                                        | 通る                                                                                |

### 2回目の指摘の直し

- **指摘1（ErrorBoundary の試験がクラスの外れを捕まえない）**: 直っている。試験は `ErrorBoundary.module.css` の `styles` を読み込み、h2 が `styles.heading`、`p` が `styles.text` を持つことを確かめる。CSS の試験は `.text` が `max-width: var(--measure)` を持ち、`font-size` と `color` を持たないことを確かめる。書き出しで次の変異を1つずつ入れて試験を走らせ、そのたびに戻した（戻したあと、作業ツリーと `cmp` で同じ）。

| 変異                                                             | 試験          |
| ---------------------------------------------------------------- | ------------- |
| h2 から `className={styles.heading}` を外す                      | 落ちる（1件） |
| `p` から `className={styles.text}` を外す                        | 落ちる（1件） |
| `.text` に `font-size: var(--text-small)`・`color: var(--ink-2)` | 落ちる（1件） |
| `.text` に `color: var(--ink-2)` だけ                            | 落ちる（1件） |
| `.text` に `font-size: var(--text-small)` だけ                   | 落ちる（1件） |
| `.text` から `max-width` を外す                                  | 落ちる（1件） |
| h2 と `p` のクラスを入れ替える                                   | 落ちる（1件） |
| `.text` に `border: 1px solid var(--rule)`                       | 落ちる（1件） |
| `.text` に `background-color: var(--paper-2)`                    | 落ちる（2件） |
| `.heading` に `color: var(--accent)`                             | 落ちる（2件） |
| `.heading` の大きさを `--text-heading` に                        | 落ちる（1件） |
| `.heading` に `line-height: 1.4`                                 | 落ちる（1件） |
| 知らせの `div` にクラスを付ける                                  | 落ちる（1件） |

- **指摘2（`types.ts` の「50字ほど」）**: 直っている。注記は「道具が何をするかを一言で言う短い説明」になり、数を言わない。出る所（道具の一覧と関連ツールの行の説明・道具のページの画像の副題・「このツールについて」の最初の段落）は、`tool-list.ts`・`RelatedTools`・`share-image-content.ts`・`ToolPageLayout` の読み手と grep で合わせた。ほかに読み手は無い。
- **指摘3（読まれない `error` の状態）**: 直っている。`ErrorBoundaryState` は `{ hasError: boolean }` だけで、`getDerivedStateFromError` は引数を取らない。

### 動くコードが2回目から変わっていないこと

2回目のレビュー（12:37）のあとに変わった T5-17 のファイルは、`ErrorBoundary.tsx`・`types.ts`・`ErrorBoundary.test.tsx` の3つ（13:05）だけである。`types.ts` は注記だけ、`ErrorBoundary.tsx` は状態から `error` を外しただけで、描くものは変わらない。

ただ HEAD が 2回目の fff3d31f から 71ba5cf8 に進み、T5-8 が `src/lib/scroll-frame.ts` を変えた（道具の `ResultBox`・`Prose` が使う）。`Section`・`Breadcrumb`・`PhrasedText`・`ResultBox`・`Prose`・`globals.css`・`phrase-breaks.ts` は HEAD で変わっていない。念のため本番のビルドを `next start` で配信し、`/opt/pw-browsers/chromium-1194` の Chromium で測り直した（200% は CDP の `Page.setFontSizes` で 32px）。

- **全36本 × 320・375・1280・320 200%（144面）**: h1 より大きいか同じ大きさの見出しは0。横のはみ出しは0。「このツールについて」の段落はどれも3つ。h1 は 33.28（320・375）・65.28（1280）・66.56（320 200%）。
- **パンくずの上端（375）**: 79。
- **最初の操作の上端（375）**: base64 327.9・email-validator 325.5・keigo-reference 253.3・yoji-search 294.5・char-count 236。2回目と一致する。
- **ErrorBoundary の知らせ**: 本番のページでは落とせないので、1回目と同じく char-count の道具の `<section>` の中身を、ビルドした CSS のクラス名（`ErrorBoundary-module__0v7bHW__heading`・`__text`）を使った知らせに差し替えて測り、375 ライト・1280 ダーク・320 ライトを撮って見た。見出しは 17px（320・375）・33.28px（1280）で、行間 1.25、枠は0。本文は 17px・本文の色・幅 640px まで。枠や地は無く、h1 のすぐ下に小見出しと本文が並び、何が起きてどうすればよいかが読める。375 の見出しは「ツールの読み込みでエラーが／発生しました」と文節の切れ目で折れる。

2回目の計測はそのまま使える。

### 読み直し

T5-17 の12ファイルを頭から終わりまで読んだ。`ToolPageLayout` の注記の並び（1〜6）は描く順と合い、`TileInteractionTracker` は `className` を持たず、`RelatedTools` は `Section` で組み、並べるものが無ければ描かない。`ErrorBoundary` の CSS の注記（「すぐ上が主見出しなので、小見出しの上の細い罫線は持たない」）は、`ToolErrorBoundary` を使う32本の `page.tsx` がどれも道具の本体を `ToolPageLayout` の children として包むことと合う。T5-17 のファイルと `src/tools/_components`・`src/components/RelatedTools`・`src/tools/_lib`・`src/app/tools` で `styles.error`・`styles.content`・`state.error`・`shareSection`・`data-section`・「ゾーン」「h1 の下」「50字」「以前は」「従来」などを grep し、残りは無い。

## 1回目の指摘1（T5-29 の受け持ち）

email-validator の h1 は 375 でいまも2行に折れる（HEAD の `phrase-breaks.ts` で測った）。どこで折れるかは T5-29 のコミットのあとに、T5-17 の完了の条件として確かめる。

## コミットするファイル（T5-17）

- `src/tools/_components/ToolPageLayout/index.tsx`
- `src/tools/_components/ToolPageLayout/ToolPageLayout.module.css`
- `src/tools/_components/ToolPageLayout/TileInteractionTracker.tsx`
- `src/tools/_components/ToolPageLayout/__tests__/ToolPageLayout.test.tsx`
- `src/tools/_components/ToolPageLayout/__tests__/TileInteractionTracker.test.tsx`
- `src/tools/_components/ErrorBoundary.tsx`
- `src/tools/_components/ErrorBoundary.module.css`
- `src/tools/_components/__tests__/ErrorBoundary.test.tsx`（新しいファイル）
- `src/components/RelatedTools/index.tsx`
- `src/components/RelatedTools/RelatedTools.module.css`
- `src/tools/types.ts`
- `src/tools/_lib/share-image-content.ts`
- `docs/cycles/cycle-316/review-t5-17-3.md`

`review-t5-17.md`・`review-t5-17-2.md` は f2224871 でコミット済み。`RelatedBlogPosts` は d663488e（T5-20b）でコミット済みで、作業ツリーに差分は無い。作業ツリーにあるほかの変更（`phrase-breaks.ts`・`DESIGN.md`・`globals.css` など）は T5-17 のものではないので入れない。

## アンチパターン（implementation.md）

- **AP-I01**: 当てはまらない。試験の通過だけで判断せず、36本 × 4条件を本番のビルドで測り、知らせを3条件で撮って来訪者の目で見た（読めるか、h1 より立たないか、色でなく文字で言うか）。残る体験の問題は T5-29（h1 の折れ）と T5-18（「このツールについて」の段落の重なり・短い説明の句点）に振ってある。
- **AP-I02**: 当てはまらない。道具を名前で分ける分岐や、足した省略可能な prop は無い（`TileInteractionTracker` の `className` はむしろ外した）。
- **AP-I03**: 当てはまらない。重いデータの読み込みは足していない。`RelatedTools` が `Section` を読み込むだけ。
- **AP-I04**: 当てはまらない。シェアのセクションは見出しを「このツールを勧める」にしただけで、指標のために置き場所を変えていない。
- **AP-I05**: 当てはまらない。道具の本体が h1 のすぐ下にあり、最初の操作の上端は 375 で 236〜328。
- **AP-I06**: 当てはまらない。2回目の3つの指摘への直しは、指摘の範囲に収まっている（試験を足し、注記を役目で言い、状態を1つ外しただけ）。
- **AP-I07**: 当てはまらない。見た目は本番のビルドを Playwright で測り、jsdom の試験は変異で効くことを確かめた。
- **AP-I08**: 当てはまらない。使っているのは DESIGN.md のトークン（`--space-*`・`--text-heading-sub`・`--text-small`・`--measure`・`--ink-2`）と `Section` だけ。
- **AP-I09**: 当てはまらない。T5-17 のファイルは1つのコミットに入り、依存する `RelatedBlogPosts`（T5-20b）は先にコミットされている。T5-29 のファイルは入れない。
- **AP-I10**: 当てはまらない（アニメーションは無い）。
- **AP-I11**: 当てはまらない（タイマーは無い）。
- **AP-I13**: 当てはまらない。撤去した識別子（`.error`・`styles.content`・`className` の prop・`state.error`・`.howItWorks*`・`.shareSection*`・`data-section`）を grep し、残りは無い。
- **AP-I14**: 当てはまらない。`ToolPageLayout`・`RelatedTools` を使う道具の36本を4条件で独立に測った。`RelatedTools` のほかの使い手は storybook の見本だけで、T5-24 に振ってある。

## 作業の進め方（workflow.md）

- **AP-WF01**: 2回目の3つの指摘がすべて直されたことを、変異と grep で確かめた。
- **AP-WF05**: 知らせを 375 ライト・1280 ダーク・320 ライトで撮って見た。道具のページの頭は2回目の撮影から変わっていないことを計測で確かめた。
- **AP-WF14**: builder と2回目の数を写さず、試験の件数・h1・最初の操作・段落の数を取り直した。
