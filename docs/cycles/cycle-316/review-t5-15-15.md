# T5-15 レビュー（15回目。ブログの記事の枠と目次）

判定: **改善指示**

対象: 作業ツリーの未コミットの T5-15 のパス（`DESIGN.md` の目次の段のハンク、`src/app/blog/[slug]/page.tsx`・`page.module.css`・`__tests__/page.test.tsx`、`src/blog/_components/CollapsibleTOC.tsx`・`.module.css`・`TableOfContents.tsx`・`.module.css`・`SeriesNav.tsx`・`.module.css`・`RelatedArticles.tsx`、`__tests__/CollapsibleTOC.test.tsx`・`TableOfContents.test.tsx`・`SeriesNav.test.tsx`・`RelatedArticles.test.tsx`・`MobileToc.test.tsx`（削除）、`src/lib/analytics.ts`・`__tests__/analytics.test.ts`、`docs/knowledge/browser-layout-and-scrolling.md`）。14回目の指摘1・2への直しに加え、コード・試験・文書を初めから読み直した。13回目の指摘1（見出しの書体が届く前後の h1 の行の数）は、index.md の「T5-28 を立てる」のとおり T5-28 が受け持つので、ここでは扱わない。

HEAD（d015a148）を scratchpad の自分だけのサブディレクトリ（`rv15/ex`）に `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で置いた。上のパスを作業ツリーのものに重ねて1つずつ `cmp` で一致を確かめ（18/18）、`MobileToc.test.tsx` を消した。14回目の HEAD（b2e55b15）からのコミットは 27 あり、`src/` では storybook・FaqSection・GameLayout・QuizPlayPageLayout・ToolPageLayout などを変えているが、ブログ・`Accordion`・`Prose`・`Section`・`globals.css` には触れていない。終えたあと、自分で `setsid` で立てたサーバーのプロセスグループ（npm・sh・next-server の3つ）だけを `kill -- -PGID` で止め、next-server が消えたことを確かめ、書き出しを消した。

## 14回目の写しとの差

14回目の写し（`rv14-t515-snapshot.tar`、sha256 `41fb6c8c…10b7`）の18ファイルを作業ツリーと `cmp` で比べた。違うのは次の2つだけで、`DESIGN.md` と知見のファイルを含むほかの16はバイトで同じ。T5-15 のファイルが増えたことも無い。

- `src/app/blog/[slug]/__tests__/page.test.tsx`: Panel の試験の名前とすぐ上のコメントだけ（「§4・読み物は矩形パネルに包まない」→「記事はセクションと全幅の罫線で組む・§5」）。
- `src/blog/_components/__tests__/CollapsibleTOC.test.tsx`: `requestAnimationFrame`・`cancelAnimationFrame`・`scrollBy`・`matchMedia`・`innerWidth`・`innerHeight` を `vi.stubGlobal` で置き換え、`afterEach` で `vi.unstubAllGlobals()`・`vi.restoreAllMocks()` を呼び、`document.elementFromPoint` を覚えておいた値へ戻すようにしただけ。

動くコード（`.tsx` の処理・CSS）は13回目・14回目と同じ。次の回が比べられるよう、今回のファイル（同じ並び）を scratchpad の `rv15-t515-snapshot.tar`（sha256 `c77251db…41d9`）に残した。

## 試験

- `npm run generate:release-id` のあとの `npx vitest run --maxWorkers=2`: 398 ファイルのうち 391 が通り、2 が飛び、5 が落ちた（6459 件が通り、8 件が飛び、5 件が落ちた）。落ちた5件（`humor/[slug]/opengraph-image`・`blog/list-pages`・`age-calculator/logic`・`blog/tag-page`・`kanji-list`）はどれも T5-15 の外の試験で、時間切れだった（この回は機械の負荷が 4 コアで load average 45〜56 あり、全体に 5323 秒かかった）。5つを `--testTimeout=240000` で走らせ直すと4つが通り、`list-pages` は自分で 15 秒の上限を持つので同じ負荷の中でまた時間切れになり、1つだけで走らせると 3 件とも通った（9.5 秒）。T5-15 の試験（`CollapsibleTOC`・`TableOfContents`・`SeriesNav`・`RelatedArticles`・`page`・`analytics`）は全体の走りの中で通った。
- `tsc --noEmit`（終了コード 0）・eslint（`src/app/blog/[slug]`・`src/blog`・`analytics.ts` と試験）・prettier（対象のパスと `DESIGN.md`・知見のファイル）: 通る。
- `npm run build`: 通る。
- `npm run check:phrased-names`: `SeriesNav.tsx` は値で渡す2か所（`seriesPhrases`・`positionPhrases`）だけで、字で渡すものは0。この検査の試験が落ちる2件（`BlogListView.tsx` の探す欄と `TraditionalColorPaletteTile.tsx`）は T5-7・T5-18 の受け持ちで、T5-15 のファイルではない。

## 14回目の指摘の直し

- **指摘1（直った）**: 試験の名前とコメントは DESIGN.md §5「ページの割り方」（セクションの切れ目の全幅の罫線）を指し、その節は実在する。ページの今の組み方（記事・共有・関連記事・前後の記事のセクション、目次と連載の案内がそれぞれ自分のボックスを持つ）とも合う。
- **指摘2（ほぼ直った。下の指摘1）**: `vi.stubGlobal` で置き換えたウィンドウの値は、`vi.unstubAllGlobals()` で元の記述子に戻る。vitest の既定（`sequence.hooks: "stack"`）では、このファイルの `afterEach` が setup の `cleanup()` より先に走るので、部品の後始末の `cancelAnimationFrame` は jsdom の本物に届くが、試験は通っていて害は無い。`innerWidth` を `vi.stubGlobal` で替えても部品の `window.innerWidth` に届くことは、「大きさが変わったあとの送りでは覚え直さず」の試験（幅が違うと覚え直さないことに依る）が通ることで確かめられる。ただし `document.elementFromPoint` の戻し方に誤りが残った。

## 記事と表の数（自分で数えた）

**86 記事・197 表**。

- 記事: `src/blog/content` の md は 87 本で、`draft: true` は1本（`url-rewrite-as-demand-signal`）。本番のビルドの `sitemap.xml` の記事の URL は 86 で、ファイルの `slug` から下書きを除いた 86 と `diff` で一致した。86 本すべてが 200 を返した。
- 表: 86 本のサーバーの HTML の `<table` は合わせて 197。
- 8-d: Playwright（`/opt/pw-browsers/chromium-1194`）の 1280×800 で 86 本を開くと `article table` は 197 で、横に送る表（`data-scrolls` の中にあるか、包みの `scrollWidth` が `clientWidth` を越えるもの）は **0**、ページの横のはみ出しも 0、開けなかったページも 0。

## 画面（本番のビルド）

`javascript-date-pitfalls-and-fixes` を、375×667 のスマホの形の読み始めと y=2500 で目次を開いた形、1280×800 の y=3000 のライトとダークで撮って見た。読み始めでは記事の頭の下に閉じた目次のボックスがあり、開くと目次が上端に来て一覧が画面の中に収まり、字下げした小見出しと2行に折れた項目の境目が読める。1280 では閉じた目次が上端に留まり、下を送られるコードと注記を `--paper` の地で隠している。開閉の行の細い線は、ポインターが上にある間の §6 の hover の線（`globals.css` の `--hover-line`）である。14回目から変わりはない。

## 指摘事項

### 1. `CollapsibleTOC.test.tsx` の `document.elementFromPoint` の戻し方と、そのコメントが事実と違う（軽い）

`src/blog/_components/__tests__/CollapsibleTOC.test.tsx` の 57〜58 行目は次のとおり。

```ts
/** jsdom の document.elementFromPoint。試験が差し替えたものを、試験のあとで戻す。 */
const originalElementFromPoint = document.elementFromPoint;
```

この環境の jsdom（29.1.1）は `document.elementFromPoint` を持たない（`jsdom/lib` に実装が無く、`new JSDOM("").window.document` で `typeof` が `undefined`・`"elementFromPoint" in document` が `false`）。なので `originalElementFromPoint` は `undefined` で、コメントの「jsdom の document.elementFromPoint」は無いものを指している。`afterEach` の `document.elementFromPoint = originalElementFromPoint` は元に戻さず、`document` の上に値が `undefined` の自前のプロパティを残す。vitest の jsdom の環境で同じ代入を試すと、代入の前は `in` が `false`・自前のプロパティ無しで、戻したあとは `in` が `true`・自前のプロパティありになった。

14回目の指摘2は「試験が置き換えたものを元の状態へ戻す」ことで、ほかの5つは `vi.stubGlobal` で元の状態（無かったものは無い状態）に戻るのに、これだけ戻らない。今はこのファイルの中で閉じていて結果に響かないが、読む人は jsdom が `elementFromPoint` を持つと誤って受け取る（ブログの記事 `2026-04-30-nextjs-multiple-root-layouts-for-gradual-design-migration.md` にも「jsdom では座標から要素を解決しない」とある）。jsdom が持たないものを試験が置き、試験のあとで取り除く、という事実どおりのコメントにし、戻し方もプロパティを消す形（たとえば置くときに `configurable` で定義し、`afterEach` で `delete` する）にそろえる。

## アンチパターンの点検（docs/anti-patterns/implementation.md）

- **AP-I01（来訪者の体験を独立に見たか）**: 該当なし。試験・ビルドの通過だけでなく、本番のビルドで 86 記事の表を 1280 で開き、目次の読み始め・開いた一覧・留まった目次をライトとダークで撮って来訪者の目で見た。今回の変更は試験の中だけで、来訪者の画面は変わらない。
- **AP-I02（場当たりの回避）**: 該当なし。指摘2の直しは、置き換えを1つずつ戻す代わりに vitest の仕組み（`vi.stubGlobal`・`vi.unstubAllGlobals`）にそろえた根の直しである。上の指摘1はその中の取り残しで、回避ではない。
- **AP-I03（Core Vitals・バンドル）**: 該当なし。動くコードは変わっていない。目次の部品はクライアントの小さな部品で、大きなデータの静的な import は無い。
- **AP-I04（指標を直接の目的に）**: 該当なし。`toc_open`・`toc_jump` は目次が使われているかを読むための計測で、置き方や見た目を指標のために変えていない。
- **AP-I05（目的に無関係なもの）**: 該当なし。目次は記事の章へ移る道で、閉じた形だけを留める。
- **AP-I06（反対の極端）**: 該当なし。指摘への直しは、名前とコメントの言い直しと、置き換えの戻し方の統一に留まる。
- **AP-I07（jsdom で見えないもの）**: 該当なし。留める・送りを止める・回したときの戻しは、前の回までに本番のビルドの Chromium で測ってあり、動くコードは変わっていない。今回も 1280 の表と画面を本番のビルドで見た。
- **AP-I08（DESIGN.md に無い表現）**: 該当なし。目次のボックス・`--paper` の地・hover の線は DESIGN.md §5・§6 にある。
- **AP-I09（コミットの順）**: 該当なし（未コミット）。コミットのときは、`MobileToc.test.tsx` の削除と `CollapsibleTOC` まわりを同じコミットに入れる必要がある。
- **AP-I10（`@keyframes` の参照）**: 該当なし。インラインのアニメーションは無い。
- **AP-I11（タイマーの後始末）**: 該当なし。`setTimeout`・`setInterval` は無い。`requestAnimationFrame` は `frame` に持ち、effect の後始末で `cancelAnimationFrame` し、受け手も外す。
- **AP-I13（撤去の残骸）**: 該当なし。前の形の名前（`MobileToc`・`contentColumn`・`articleAside`）を `src/`・`DESIGN.md`・`docs/*.md`・`.claude/` で今回 grep し、当たるのは 2026-05-13 のブログ記事（`grid-column-and-dom-order`）の本文だけだった。当時の記録なので対象外。
- **AP-I14（共有の部品の撮り比べ）**: 該当なし。共有の部品（`Accordion`・`Section`・`Prose`・`ItemList` など）の指定は T5-15 で変えていない。

作業の進め方（workflow.md）では、PM は今回、記事と表の数を渡さずに自分で数えるよう頼んでおり、14回目の AP-WF06・AP-WF14 の件は繰り返されていない。

## PM への依頼

- 指摘1は builder に直させてください。直したあと、前回の指摘だけでなく全体を見直す16回目のレビューを依頼してください。比べるための写しは `rv15-t515-snapshot.tar` です。
- 完了の条件の数は、今回も **86 記事・197 表**（1280 で横に送る表 0）でした。
- 全体の試験の走りは、機械の負荷（load average 45〜56）で T5-15 の外の5件が時間切れになりました。どれも走らせ直すと通りました。コミットの前の検査は、負荷の低いときに走らせてください。
