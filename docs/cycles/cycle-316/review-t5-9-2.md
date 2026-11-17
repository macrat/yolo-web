# T5-9 レビュー（2回目。辞典の詳細の枠）

判定: **改善指示（changes-needed）**

対象: 1回目と同じ、作業ツリーの未コミットの T5-9 のファイル。`src/dictionary/_components/{DictionaryDetailLayout,PlayRecommendBlock}.{tsx,module.css}`、その `__tests__` の2本、`src/dictionary/_components/new/` の削除、`src/app/dictionary/{kanji/[char],yoji/[yoji],colors/[slug]}/page.tsx`、`KanjiDetail`・`YojiDetail`・`ColorDetail` の `.tsx` とそのテスト。T5-7 の `ListView`・`_lib` は見ていない。1回目の指摘1の直しだけでなく、T5-9 のファイルを全部読み直した。

確かめ方: HEAD を `git archive` でスクラッチの自分のディレクトリに書き出し、`node_modules` が無いことを確かめてから `cp -al` し、T5-9 のファイルだけを重ねて `new/` を消した（重ねた15本は作業ツリーと `cmp` で一致）。`npm run generate:release-id` のあと、vitest（`--maxWorkers=2`）・tsc・eslint・prettier・`check:phrased-names` を走らせた。書き出しは終わったあとに消した。

## 1回目のあとに変わったもの

変わったのは3つの Detail のテストだけで、どれも末尾に頭の置き場所のテストが1本ずつ足された。`.tsx`・`.module.css`・`page.tsx` は1回目のときのまま（更新の時刻が1回目のレビューより前で、中身も1回目の記述のとおり: 関数で頭を渡す API、共有の見出し、名乗りの一言の `--text-small`）。ランタイムのコードが変わっていないので、ビルドとブラウザでの測り直しはしていない。1回目の実測（パンくずの左端 27 / 179、見出しの段、罫線）がそのまま当たる。

## 機械の検査

- vitest: `src/dictionary` と `src/app/dictionary` の 15 ファイル・176 件がすべて通った（1回目の 173 件に、足した3件）。1回目に時間切れで落ちた humor の OGP 画像のテストも今回は通った。
- tsc: 通った（出力なし）。eslint（`src/dictionary/_components` と3つの詳細のページのディレクトリ）: 通った。prettier（`src/dictionary/_components` と `src/app/dictionary`）: 通った。
- `check:phrased-names` を T5-9 の8本の `.tsx` に絞って: 0 / 0 / 0 で通った。
- `_components/new` の参照は `src` の `.ts`・`.tsx`・`.css` に残っていない。

## 1回目の指摘1（頭の置き場所のテスト）の確かめ

3つのテストは、目印の `<nav data-testid="page-head" />` を `head` に渡し、`container.querySelector("section")`（文書の順で最初の `section`、つまり Detail が返す最初の `Section`）の `firstElementChild` がその目印であること、目印が h1 より前にあることを確かめる。書き出しの中で Detail を壊して、テストが落ちるかを1つずつ試した（試したあと元に戻し、`cmp` で作業ツリーと一致を確かめた）。

| 壊し方                                                                                                                                    | 結果   |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `KanjiDetail` から `{head}` を消す                                                                                                        | 落ちた |
| `YojiDetail` の `{head}` を `</article>` のあと（最初のセクションの末尾）へ動かす                                                         | 落ちた |
| `ColorDetail` の `{head}` を中の「カラーコード」の `section` の頭へ動かす                                                                 | 落ちた |
| `KanjiDetail` の `{head}` を `Section` の外（前の兄弟）へ出す                                                                             | 落ちた |
| `KanjiDetail` に頭の無いセクションを先に足し、`{head}` を2つ目のセクションへ動かす（T5-10〜T5-12 がセクションを分けるときに起こりうる形） | 落ちた |

どの壊し方でも、足したテストだけが落ちた。**1回目の指摘1は直っている。**

## 1回目の指摘2（受け持ちの記録）の確かめ

index.md の「T5-9 から T5-10〜T5-12 へ」の行に、(1) `ColorDetail` の中央寄せを外して h1 を 27 / 179 に、(2) h1 を §4 の大きさにしてセクションの見出し（46.72px）より大きく、(3) 「関連ツール」と「同じカテゴリの伝統色」を別のセクションに、(4) 最後の `.section` の `margin-bottom`（漢字と四字熟語も同じ）、と FAQ の「？」の申し送りを閉じたことが書かれている。1回目が求めた5つがそろっている。t5-design.md は書き換えていない。**直っている。**

## 読み直して見つけたこと

枠の2つの部品（`DictionaryDetailLayout`・`PlayRecommendBlock`）とその CSS・テスト、3つの `page.tsx` の枠への渡し方、3つの Detail の `Section` と `{head}` の置き方は、1回目の判断のまま受け入れる。共有のセクションが `aria-labelledby` を持たない形も、`QuizPlayPageLayout`・`GameLayout` の共有のセクションと同じである。`ColorDetail` の props の宣言では `head` が先頭、分割代入では末尾にあるが、動きには関わらない。

一方、T5-9 が触ったファイル（字下げを変えたので、差分に行ごと出ている）と、その Detail が使う CSS に、前のサイクルの経緯の注記が残っている。T5-9 の行の「『店構え』の注記を消す」は `DictionaryDetailLayout.module.css` の語は消したが、同じ考え（「器は静か」）の注記と、ほかの形をとらないことを言う注記が Detail の側に残っている。CLAUDE.md のツギハギ禁止は、見つけたらその場で直すことを求める。下の指摘1・2。

## 指摘

1. **T5-9 のファイルに残る、経緯とほかの形の否定の注記を消すこと（builder の作業）。** いまのコードが何をするかでなく、前にあったものや採らなかった形を言っている。
   - `src/app/dictionary/colors/[slug]/page.tsx:36-37`「辞典固有の JSON-LD のみ渡す。breadcrumb JSON-LD は Breadcrumb コンポーネントが自動出力するため手動呼び出し不要。」: 3つの詳細のページのうち伝統色だけにあり、以前の手動の呼び出しを消した跡である。伝えたい約束（パンくずと FAQ の構造化データは枠が出すので、ページは項目のものだけを渡す）は、`DictionaryDetailLayout` の `jsonLd` の props の説明に書くのが正しい置き場所で、そうすれば3つのページがそろう。
   - `src/dictionary/_components/yoji/YojiDetail.tsx:203`「フッターにAI運営の旨が記載されているため、セクション単位の注記は不要」: 消した注記の跡。
   - `src/dictionary/_components/yoji/YojiDetail.tsx:125`「……ピルにしない。」、`src/dictionary/_components/kanji/KanjiDetail.tsx:133` と `src/dictionary/_components/__tests__/KanjiDetail.test.tsx:43`「カード/ピルではなく……」: 採らなかった形の否定。言うことがあるなら、いまの形（「読点で組んだ一文で見せる」など）だけを言う。
2. **3つの Detail の CSS の頭の注記から、「店構え」と同じ考えの経緯の注記を消すこと（builder の作業）。** `KanjiDetail.module.css:4`・`YojiDetail.module.css:4`「器は静か（紙・墨・罫……のみ）。……ピル・色付きカード・影・角丸装飾なし・全トークン経由。」、`ColorDetail.module.css:3-5`（「ただし成果物＝色そのものが主役のため……」は、前にあった文を消した跡で「ただし」が何も受けていない。5行目の「器（見出し・表・導線）は静か……なし・全トークン経由。」も同じ）。消した `DictionaryDetailLayout.module.css` の注記「『実務／参照』の店構え（器は静か）」と同じ考えで、T5-9 の行の「『店構え』の注記を消す」の残りである。注記だけの変更で、見た目は変わらない。ファイルは T5-10〜T5-12 がこのあと組み直すが、どの行も経緯の注記を受け持っていない（10-5 の表は、辞典の分を T5-9 に渡している）。
3. **ユーモア辞典の同じ注記の受け持ちを、index.md に記録すること（PM の作業）。** `src/app/dictionary/humor/[slug]/page.module.css:3`「器は静か（紙・墨・罫のみ）」と `:50`「色付きの座布団や角丸の包みは使わない（器は静か）」も同じ考えの注記で、T5-9 のファイルではない。このファイルを組み直すのは T5-13 なので、「T5-9 から T5-10〜T5-12 へ」の行か T5-13 への申し送りとして、T5-13 が消すと書く。t5-design.md は書き換えない。

## anti-patterns/implementation.md の点検

- AP-I01（来訪者の目で見たか）: ランタイムのコードは1回目から変わっておらず、1回目が本番ビルドを 320・375・1280px・200%、ライトとダークで撮って見た結果がそのまま当たる。今回はテストの守りが来訪者に効くか（パンくずが 2,000 ページを超える詳細から消えないか）を、壊して確かめた。
- AP-I02（場当たりの回避）: 当たらない。`head` は必須の prop のままで、テストも `head={null}` だけでなく本物の置き場所を確かめるようになった。
- AP-I03（Core Vitals・バンドル）: 当たらない。1回目から変わっていない。足したのはテストだけ。
- AP-I04（指標を目的に配置）: 当たらない。共有の見出しは 7-e の決定による。
- AP-I05（目的と無関係な中身）: 当たらない。
- AP-I06（反対の極端）: 当たらない。指摘1への直しは3つのテストに1本ずつで、Detail の本体や枠の API を変えていない。
- AP-I07（jsdom で分からないもの）: 足したのは DOM の順を見るテストで、jsdom で確かめられる範囲である。左端・罫線・見出しの大きさは1回目に本番ビルドで測った。
- AP-I08（DESIGN.md に無い見た目）: 当たらない。CSS は1回目から変わっていない（`--space-16`・`--space-8`・`--text-small`・`--measure`・`--ink-2` だけ）。
- AP-I09（コミットの順）: 移したファイル・消した `new/`・3つの `page.tsx`・Detail とテストは、分けると途中でビルドかテストが壊れる。指摘1・2の直しも含めて1つのコミットにまとめること。
- AP-I10（keyframes）: 当たらない（アニメーションを足していない）。
- AP-I11（タイマー）: 当たらない（タイマーを足していない）。
- AP-I13（撤去の網羅）: `_components/new` は `src` に残っていない。「店構え」の語は `src/dictionary` に無いが、同じ考えの「器は静か」を `src` で grep すると、3つの Detail の CSS とユーモア辞典の CSS に残っていた（指摘2・3）。ほかのヒットは道具の CSS（`BmiCalculatorTile`・`TextDiffTile`。T5-18 の範囲）と、ほかの面のテストの describe の名（`middleware-gone-slugs.test.ts`・`ogp-image.test.tsx`。1回目と同じく T5-9 の範囲の外）。
- AP-I14（共有の部品の変更）: T5-9 は共有の部品を変えていない。`DictionaryDetailLayout` と `PlayRecommendBlock` を使うのは3つの `page.tsx` だけで、1回目に3つとも測った。

workflow.md の点検: 1回目の指摘1は builder が、指摘2は PM が直し、どちらも受け持ちのとおり（AP-WF08・AP-WF13）。直しの確かめは、テストが通ることの自己申告でなく、壊して落ちることで確かめた（AP-WF09・AP-WF14）。

## PM への申し送り

- 指摘1・2を builder が直したあと、全体を見直すレビューをもう一度受けること。注記だけの変更なので、そのレビューでもビルドと測り直しは要らないはずだが、ランタイムのコードに触れたときは測り直す。指摘3は PM が index.md に書く。
- コミットは1回目の申し送りのとおり、T5-9 のファイル（指摘2の3つの CSS を含む）と `new/` の削除だけを1つにし、作業ツリーのほかのタスクのファイルを入れない。`docs/backlog.md` の B-567 はコミットのあとで済みにする。
