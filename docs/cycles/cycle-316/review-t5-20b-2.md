# レビュー（2回目）: T5-20b ゲームのページのセクション

対象: 作業ツリーの T5-20b のファイル11本。

- 動くもの7本: `GameLayout.tsx`・`.module.css`、`RelatedGames.tsx`・`.module.css`、`RelatedBlogPosts/index.tsx`・`RelatedBlogPosts.module.css`、nakamawake の `GameContainer.tsx`
- 試験4本: `GameLayout.test.tsx`、nakamawake の `GameContainer.test.tsx`、`RelatedGames.test.tsx`（新しいファイル）、`RelatedBlogPosts.test.tsx`

1回目（review-t5-20b.md）の指摘1の直しと、T5-20b の全体を見直した。基準は1回目と同じで、t5-design.md の T5-20b の行と 6-c、index.md の「T5-20b の builder の報告を受けた PM の決定」と「T5-20b のレビュー（review-t5-20b.md）を受けた PM の決定」、DESIGN.md §4・§5・§12、CLAUDE.md、constitution.md である。

## 判定: 承認

1回目の指摘1は直った。新しい試験は、関連の3つのどれかを素の `<section>` に戻すと落ちる。動くもの7本は1回目から1バイトも変わっていないので、1回目に本番のビルドで測ったことはそのまま使える。1回目の指摘2・3は、PM が index.md で T5-20f と T5-24 に振り分けた。新しい指摘は無い。

## 確かめたこと

### 動くものが1回目から変わっていないこと

- 1回目のレビューは、書き出しの全ファイルの git の hash を `rv-t520b-m7x3/paths.txt`・`ah.txt`（after）に残している。いまの作業ツリーの動くもの7本の `git hash-object` は、どれも `ah.txt` の同じパスの行（467・469・684〜687・749 行目）と一致した。1回目のあとで builder が変えたのは試験だけである。
- HEAD は1回目の基準の cec09cbf から fff3d31f に進んだ。あいだのコミットは T5-7（一覧の部品）と T5-9（辞典の詳細）と docs だけである。`src` で変わったファイルのうち、ゲームのページが読み込むものは無い。`Section`・`Breadcrumb`・`FaqSection`・`ShareButtons`・`RecommendedContent`・`ItemList`・`PhrasedText`・`phrase-breaks` は変わっていない。`src/lib/phrased-name.ts` は関数が1つ増えただけで、既存の関数は変わらない。そのため、1回目の測り（6つのセクションの順、全幅の罫線5本、主操作の下端、T4-13 のチェックの位置、h1 より大きい見出し0、横のはみ出し0、関連の見出しと上の一覧のあいだ、共有の見出しの段）はそのまま使える。

### 検証のしかた

- HEAD（fff3d31f）を `git archive HEAD | tar -x` で自分だけの書き出し（`scratchpad/rv-t520b-r2-q8k4`）に出した。node_modules が無いことを確かめてから `cp -al` で足し、T5-20b の11ファイルだけを重ねて、`npm run generate:release-id` を走らせた。
- vitest（`--maxWorkers=2`）: `src/play/games`・`src/components/RelatedBlogPosts`・`src/play/_components`（`RecommendedContent` を含む）は 49 ファイル・515 件すべて通った。
- `tsc --noEmit` は 0 で終わり、何も出さなかった。`eslint .` 0、`prettier --check .` 0。
- 終わったあと、書き出しを消した。

### 新しい試験に意味があるか（変異の確かめ）

まず、jsdom で `Section` が描く class を見た。`_section_1c4dfc` で、空ではない（`RelatedGames.module.css` の `.heading` は `_heading_f6acaf`）。そのため、根の class が `Section` の class と等しいことを確かめる試験は、空の文字列どうしが等しくて通ってしまうことが無い。

そのうえで、書き出しの中で1つずつ壊して試験を走らせ、そのたびに元に戻した。

| 壊し方                                                                    | 落ちた試験                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `RelatedGames` の `<Section>` を素の `<section>` にする                   | `RelatedGames.test.tsx` のセクションの試験と、`GameLayout.test.tsx` の順の試験（2件）     |
| `RelatedBlogPosts` の `<Section>` を素の `<section>` にする               | `RelatedBlogPosts.test.tsx` のセクションの試験と、`GameLayout.test.tsx` の順の試験（2件） |
| `RecommendedContent` の `<Section>` を素の `<section>` にする             | `GameLayout.test.tsx` の順の試験（1件）                                                   |
| `GameLayout` の「このゲームを勧める」の `<Section>` を素の `<section>` に | `GameLayout.test.tsx` の順の試験（1件）                                                   |
| `GameLayout` で関連ゲームと `RecommendedContent` の順を入れ替える         | `GameLayout.test.tsx` の順の試験（1件）                                                   |

壊したファイルは、どれも作業ツリーまたは HEAD と `cmp` で一致するまで戻した。

`RecommendedContent` を壊したとき、`RecommendedContent.test.tsx` は通る。この試験は根の `tagName` だけを見て、class を見ないからである。ただし、この部品は T5-4 の受け持ちで、ゲームのページでは `GameLayout.test.tsx` の順の試験が捕まえる。T5-20b の範囲の抜けではない。

### 試験を読んだこと

- `RelatedGames.test.tsx`（5件）は、次の5つを確かめる。
  - セクションであること: 根が1つで、`SECTION` で、`Section` と同じ class を持ち、中に h2「関連ゲーム」がある。
  - 挙げた順に並べ、一覧が見出しの名前を持つこと。
  - いまのゲームと、ゲームに無い slug を除くこと。
  - `undefined`・`[]`・自分だけのときは何も描かないこと。
  - 見出しが文節の切れ目でだけ折れること。

  実在のゲームの slug を使っているので、registry の実物で動く。1回目の「直し方の例」をすべて満たしている。

- `RelatedBlogPosts.test.tsx` に足した1件は、根が1つで、`SECTION` で、`Section` と同じ class を持ち、h2「関連ブログ記事」を持つことを確かめる。
- `GameLayout.test.tsx` では、`RecommendedContent` のモックを外し、`@/lib/cross-links` だけをモックにした。関連の3つは本物を描く。順の試験は、slug を kanji-kanaru にして関連ゲームを2本挙げ、記事を1件返させる。そのうえで、`main` の直下にあたる子が6つで、どれも `Section` の class を持つ `SECTION` であることを確かめる。さらに、6つの中身（パンくず・h1・ゲームの区画・帰属表示、FAQ、4つの h2 の名前）を順に当てる。試験の名前と、確かめている範囲が合っている。
- 外した「GameLayout renders RecommendedContent with meta.slug」は、モックが受けた slug を確かめる試験だった。いまは本物を描くので、slug が meta.slug でなければ（知らない slug なら）`RecommendedContent` が null を返して6つにならず、順の試験が落ちる。確かめていたことは失われていない。
- 「よくある質問を持たないゲームは、空のセクションを置かない」の2件は、`test-game` という知らない slug で、`RecommendedContent` と `RelatedBlogPosts`（モックが空を返す）と `RelatedGames`（関連なし）が null を返すことに頼っている。ゲームと共有の2つになり、試験は決まった結果を出す。
- 3つの試験のファイルには、同じ `sectionClassName()` の手助けが1つずつある。`src/app/__tests__/page.test.tsx` のように CSS モジュールを import して `toHaveClass(sectionStyles.section)` とする書き方もある。ただ、この書き方はクラスを含むかどうかしか見ず、`Section.module.css` の中のキーの名前に頼る。いまの書き方は、`Section` と同じ class の列かどうかを見る。どちらにも理があり、試験のファイルの中で閉じた5行なので、指摘にはしない。
- 動くもの7本も読み直した。1回目のコードの所見（`<article>` を外したこと、`.header` の上の余白、FAQ の幅、JSDoc の「2・4〜6 は…セクションごと描かない」が実装と合うこと、経緯の注記が無いこと）は変わらない。

### 共有のファイルとの食い違い

- `RelatedBlogPosts/index.tsx`・`RelatedBlogPosts.module.css` は、T5-17 の2回目のレビューの書き出し（`scratchpad/t517r2-3636`）の同じファイルと `cmp` で一致した。
- `RelatedBlogPosts.test.tsx` は、T5-17 の書き出しでは HEAD のままである（`cmp` で一致）。T5-17 はこの試験を変えないので、足した1件は T5-20b だけが持つ。食い違いは無い。

## docs/anti-patterns/implementation.md の各項目

- AP-I01（来訪者目線の評価）: 該当しない。今回変わったのは試験だけで、来訪者の見るものは1回目に撮って自分の目で見たものと同じである（hash で確かめた）。遊び終えた画面で同じ導線が2度出る件は、1回目に来訪者の目で見つけ、PM が T5-20f に回した。
- AP-I02（場当たりの回避）: 該当しない。試験は、関連の区画ごとに条件を足すのではなく、`Section` の class との一致という1つの基準で、3つの部品とページの組みを確かめている。
- AP-I03（Core Web Vitals・バンドル）: 該当しない。動くものは1回目から変わっていない。1回目の所見（`PhrasedText` の import が1つ増えただけ、主操作の位置は 320・375 で変わらない）のとおりである。
- AP-I04（指標の直接最適化）: 該当しない。
- AP-I05（目的に無関係な追加）: 該当しない。足したのは試験だけである。
- AP-I06（反対の極端）: 該当しない。1回目の指摘は「セクションであることの試験が無い」だった。足した試験は、その3つの部品とページの順だけを確かめていて、見た目の値（罫線の太さ・余白）を jsdom で固めるところまでは踏み込んでいない。
- AP-I07（jsdom で見えない不具合）: 該当しない。罫線・間隔・はみ出し・チェックの位置は、1回目に本番のビルドを Playwright で測った。今回の jsdom の試験は、構造（セクションであること・順）を守る役目で、見た目の測りの代わりにはしていない。
- AP-I08（DESIGN.md に無い表現）: 該当しない。動くものは1回目から変わっていない。
- AP-I09（コミットの順）: 注意。`RelatedBlogPosts` の2つの動くファイルは T5-17 と同じ変更で、PM の決定(4)により、先にレビューを通ったほうのコミットに入れる。T5-17 が先に入った場合、T5-20b のコミットでは2本に差分が無くなる。そのため、`RelatedBlogPosts.test.tsx`（T5-20b だけが変える）は、T5-20b のコミットに入れる。試験が確かめる `Section` を返す実装は、どちらの順でも試験より先か同時に入るので、依存の順は崩れない。
- AP-I10（keyframes）: 該当しない。
- AP-I11（タイマー）: 該当しない。
- AP-I13（撤去の残り）: 該当しない。外したモックの名前（`おすすめコンテンツ`・`RecommendedContent:`）と、`<article>` を探す `getByRole("article")` を `src/play/games` で grep すると、0件だった。
- AP-I14（共有の部品の撮り比べ）: 1回目のとおりである。動くものは変わっていないので、撮り直す要は無い。storybook の見本の件は、PM の決定(2)で T5-24 が受け持つ。

## docs/anti-patterns/workflow.md

- AP-WF01（最後の修正のあとのレビュー）: この2回目のレビューがそれにあたる。
- AP-WF13（スコープを越えない）: builder が今回変えたのは、1回目の指摘1の試験の3ファイルだけである。`RecommendedContent.test.tsx`（T5-4）や、yoji-kimeru・irodori（PM の決定(2)の続き）には触れていない。
- AP-WF14（一次集計）: builder の主張（新しい試験が5件、`RelatedBlogPosts.test.tsx` に1件、モックを外した、素の `<section>` に戻すと落ちる）は、どれも自分の書き出しで確かめ直した。すべて合っていた。変異は builder の3つに加え、共有のセクションと順の入れ替えの2つも試した。

## 作業の記録

- サーバーは立てていない。Playwright も使っていない。変わったのが試験だけであることを hash で確かめたので、1回目の測りを使った。
- 自分の書き出し `scratchpad/rv-t520b-r2-q8k4` は消した。作業ツリーのソースには手を入れていない。

## コミットするファイル

T5-20b のコミットには、次の12本を入れる。

- `src/play/games/_components/GameLayout.tsx`
- `src/play/games/_components/GameLayout.module.css`
- `src/play/games/_components/RelatedGames.tsx`
- `src/play/games/_components/RelatedGames.module.css`
- `src/components/RelatedBlogPosts/index.tsx`（T5-17 が先に入っていれば差分は無い）
- `src/components/RelatedBlogPosts/RelatedBlogPosts.module.css`（同上）
- `src/play/games/nakamawake/_components/GameContainer.tsx`
- `src/play/games/_components/__tests__/GameLayout.test.tsx`
- `src/play/games/_components/__tests__/RelatedGames.test.tsx`
- `src/play/games/nakamawake/_components/__tests__/GameContainer.test.tsx`
- `src/components/RelatedBlogPosts/__tests__/RelatedBlogPosts.test.tsx`
- `docs/cycles/cycle-316/review-t5-20b-2.md`（このファイル）
