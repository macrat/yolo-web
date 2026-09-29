# T5-15 レビュー（14回目。ブログの記事の枠と目次）

判定: **改善指示**

対象: 作業ツリーの未コミットの T5-15 のパス（`DESIGN.md` の目次の段のハンク、`src/app/blog/[slug]/page.tsx`・`page.module.css`・`__tests__/page.test.tsx`、`src/blog/_components/CollapsibleTOC.tsx`・`.module.css`・`TableOfContents.tsx`・`.module.css`・`SeriesNav.tsx`・`.module.css`・`RelatedArticles.tsx`、`__tests__/CollapsibleTOC.test.tsx`・`TableOfContents.test.tsx`・`SeriesNav.test.tsx`・`RelatedArticles.test.tsx`・`MobileToc.test.tsx`（削除）、`src/lib/analytics.ts`・`__tests__/analytics.test.ts`、`docs/knowledge/browser-layout-and-scrolling.md`）。13回目の指摘2への直しに加え、コード・試験・文書・DESIGN を初めから読み直した。13回目の指摘1（見出しの書体が届く前後の h1 の行の数）は、index.md の「T5-28 を立てる」のとおり T5-28 が受け持つので、ここでは扱わない。

HEAD（b2e55b15）を scratchpad の自分だけのサブディレクトリ（`rv14/ex`）に `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で置き、上のパスを作業ツリーのものに重ねて1つずつ `cmp` で一致を確かめ、`MobileToc.test.tsx` を消した。終えたあと、自分で `setsid` で立てたサーバーのプロセスグループ（npm・sh・next-server の3つ）だけを止め、書き出しを消した。

## 13回目の写しとの差

13回目の写し（`rv13-t515-snapshot.tar`）の18ファイルを作業ツリーと `cmp` で比べた。違うのは次の2つだけで、`DESIGN.md` と知見のファイルを含むほかの16はバイトで同じ。

- `CollapsibleTOC.tsx`: 部品の JSDoc の、閉じたまま回したときの段落だけ（覚えるものに「その要素のどこが線に掛かっているか」を足し、戻し方を「線の下から始まる要素は線から同じ距離へ、線をまたぐ要素は線より上に出ていた割合が同じになる所へ」と言い分けた）。コードは同じ。
- `__tests__/CollapsibleTOC.test.tsx`: 「画面の高さが目次を留める条件をまたいだとき」の `describe` に、置いた段落を覚える配列と、試験のあとで取り除く `afterEach` を足しただけ。

動くコード（`.tsx` の処理・CSS）は13回目と同じなので、13回目の実行時の測り（回したときの戻し、送りの止め、完了の条件の表）はそのまま有効である。次の回が比べられるよう、今回のファイル（同じ並び）を scratchpad の `rv14-t515-snapshot.tar`（sha256 `41fb6c8c…10b7`）に残した。

## 試験

- `npm run generate:release-id` のあとの `npx vitest run --maxWorkers=2`: 395ファイル 6459件が通り、2ファイル 8件が飛ぶ。
- `tsc --noEmit`・eslint（`src/app/blog/[slug]`・`src/blog`・`analytics.ts` と試験）・prettier（対象のパスと `DESIGN.md`・知見のファイル）: 通る。
- `npm run build`: 通る。
- `npm run check:phrased-names`: `SeriesNav.tsx` は値で渡す2か所（`seriesPhrases`・`positionPhrases`）だけで、字で渡すものは0。

## 13回目の指摘2の直し

- JSDoc の新しい言い方は、`ReadingPlace` の説明（`gap` と `passed`）、`restorePlace` の式（`top - 線 - gap + passed × 高さ`）、知見の3章の「線に対して同じ所へ」と一致する。
- 段落は `describe` の中の配列に入り、`afterEach` で外れる。`placeParagraph` を使うのはこの `describe` の中だけなので、ほかの試験に段落は残らない。

## 記事と表の数（自分で数えた）

PM の依頼は「完了の条件の数はいま 85 記事・194 表（T5-23 のあと）」だったが、自分で数えると **86 記事・197 表** だった。

- 記事: `src/blog/content` の md は 87 本で、`draft: true` は1本（`url-rewrite-as-demand-signal`）。本番のビルドの `sitemap.xml` の記事の URL は 86 で、ファイルから下書きを除いたものと一致し、86 本すべてが 200 を返した。`src/middleware.ts` の 410 の一覧（`DELETED_BLOG_SLUGS`）と重なるものは0。
- 表: 86 本のサーバーの HTML の `<table` は合わせて 197。Playwright（Chromium 141）の 1280×800 で 86 本を開いても `article table` は 197 で、横に送る表（`data-scrolls` を持つか、包みの `scrollWidth` が `clientWidth` を越えるもの）は **0**、ページの横のはみ出しも 0。
- 13回目の測りのあと、`src/blog/content` と `src/middleware.ts` を変えたコミットは無い（`git log 93ebdf38..HEAD`）。13回目の記録の「85 記事・194 表」は、表を3つ持つ記事（`ai-agent-concept-rethink-3-workflow-limits`・`redos-defense-web-worker-terminate`・`regex-tester-guide`・`series-navigation-ui` のどれか）を1本取りこぼした数と考えられる（推論。この環境では Chromium のページが負荷で落ちることがあり、今回も何度か落ちた）。「T5-23 で 87 から減った」も、T5-23 は 410 のページの組み方のタスクで、記事の数を変えていない。

8-d の条件（1280px で横に送る表が0）は、正しい数でも満たす。

## 実行時に新たに確かめたこと（本番のビルド）

開いた一覧の外を押したときに閉じるかを見た（ページの送りを止めているあいだ、来訪者が本文を押して閉じようとして何も起きないと、ページが固まったように見えるため）。

| 形                                           | 押した所                                 | 結果                                                                                             |
| -------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 375×667 のスマホの形、y=2000 で開く（2記事） | 一覧の下に見える本文の段落               | 閉じる。フォーカスは `main`（`tabindex="-1"`）へ移り、ページの位置は変わらず、送りの止めは外れる |
| 1280×800、y=2000・2600 で開く（2記事）       | 一覧の下に見える本文                     | 閉じる。そのあとのホイールでページが送られる（2600→3000・2000→2400）                             |
| 1280×800、y=3000 で開く（2記事）             | コンテンツ幅の外の左の余白（x=60）       | 開いたまま。送りも止まったまま（ホイールで 3000 のまま）                                         |
| 375×667 のスマホの形                         | 字下げした項目の左のあき・一覧の右の余白 | 指の当たりの補正で近くの項目のリンクになり、その章へ移って閉じる                                 |

本文の上を押せば閉じるので、スマホで「固まって閉じられない」ことは無い。PC でコンテンツ幅の外を押しても閉じないが、開閉の行・Escape・本文のどれでも閉じられ、見える所に閉じる手段があるので、欠陥とはしない。iOS の Safari で本文を押したときに `main` へフォーカスが移るか（閉じるか）は、この環境では確かめられない（下の「PM への依頼」）。

撮った画面（375 の読み始め・開いた一覧・記事の終わり、1280 の y=3000 の留まった目次）も見た。13回目から変わりはない。

## 指摘事項

### 1. `page.test.tsx` の Panel の試験が、DESIGN.md に無い決まりを §4 として指している（軽い）

`src/app/blog/[slug]/__tests__/page.test.tsx` の 37 行目の試験の名前「page.tsx は Panel を使わないこと（読み物は矩形パネルに包まない・§4）」は、DESIGN.md の §4（組版）に無い決まりを指している。DESIGN.md のどこにも「矩形パネル」「Panel」「読み物を包まない」に当たる文は無い。この試験は HEAD からあるものだが、T5-15 はこのファイルの組み立ての試験をほとんど書き直し、同じ `describe` に §5 を指す試験を足している。読む人は §4 を探して見つけられない。ページはセクションを全幅の罫線で分け（§5「ページの割り方」）、目次と連載の案内がそれぞれ自分のボックスを持つ、という今の組み方に合わせて、名前とすぐ上のコメントを1つの言い方に直す（指す節を §5 にするか、節を指さずに理由だけを書く）。CLAUDE.md の「前のサイクルが残したツギハギを見つけたらその場で直す」に当たる。

### 2. `CollapsibleTOC.test.tsx` が置き換えたウィンドウの値を戻さない（軽い）

13回目の指摘2の「試験が残したものがあとの試験に拾われうる」と同じ種類のものが、段落のほかにも残っている。`beforeEach` で `window.requestAnimationFrame`・`cancelAnimationFrame`・`scrollBy`・`matchMedia` と `document.elementFromPoint` を代入で置き換え、条件をまたぐ `describe` では `Object.defineProperty` で `innerWidth`・`innerHeight` を固定の値に替えるが、どれも戻さない（`window.gtag` だけは `afterEach` で戻す）。今はこのファイルの中で閉じていて（vitest はファイルごとに環境を分ける）、どの試験の結果にも響かないが、このファイルの最後の2つの `describe`・試験は 667×375 か 375×667 の窓の値のまま動く。あとから幅や高さに関わる試験を足すと、その前の試験が残した値を拾う。`vi.stubGlobal`（と `afterEach` の `vi.unstubAllGlobals()`）で置き換えるか、`afterEach` で元の値に戻す形にそろえる。

## そのほか確かめたこと（問題なし）

- **コード**: `CollapsibleTOC.tsx` を初めから読んだ。`restorePlace` の式は、線の下から始まる要素（`gap`）と線をまたぐ要素（`passed`）のどちらでも覚えたときの位置に戻す。`handleResize` が条件をまたぐ `resize` を続けて受けたときも、前の戻しのフレームを取り消して最後の `target` へ戻し直し、`restoring` は最後のフレームで必ず外れる。閉じた目次の受け手（`scroll`・`resize`）と開いた目次の受け手（`matchMedia` の `change`）は `open` で入れ替わり、後始末もそろう。`handleToggle` は制御された `open` と同じ値の `toggle`（項目を選んで閉じたとき）では何もしないので、`toc_open` が重ならない。
- **CSS**: 閉じた目次の高さの式・`scroll-padding-top` と開閉の行の打ち消し・一覧の `max-height: calc(100dvh - var(--toc-height))`・送りの止め（留める条件の中だけ）・`scrollbar-gutter: stable` は、それぞれの理由がコメントにあり、13回目の測りと合う。`src/` のほかの CSS に `z-index` は無く、本文の要素が留まった目次の上に出ることはない。
- **ページ**: 記事の頭・目次・連載の案内・本文を1つのセクションに置き、共有・関連記事・前後の記事をそれぞれセクションにする組み方は §5 と合う。前の形の跡（`contentColumn`・`articleAside` など）は、`src/`・`DESIGN.md`・`docs/*.md`・`.claude/` に残っていない（2026-05-13 のブログ記事の本文の例は、当時の記録なので対象外）。
- **計測**: `trackTocOpen`・`trackTocJump` は t5-design.md の 11 章の決定（`content_type: "blog"`・`content_id` が slug・`section_id`・`section_level`）のとおり。`section_id`・`section_level` は GA のカスタム定義に登録していないが、cycle-301 の決め（BigQuery の `event_params` は登録なしでも出る）のとおりに読めるので、足りない作業は無い。
- **DESIGN.md の目次の段・知見のファイル**: 13回目から変わっておらず、振る舞いと一致する。
- **T9**: index.md の T9 の行に、iOS の Safari・Android の Chrome での回転（拡大したままの回転を含む）と、開いているあいだの送りの止めの漏れを確かめる項目がある。

## PM への依頼

- 指摘1・2は builder に直させてください。直したあと、前回の指摘だけでなく全体を見直す15回目のレビューを依頼してください。比べるための写しは `rv14-t515-snapshot.tar` です。
- 完了の条件の数は **86 記事・197 表** です。依頼にあった「85 記事・194 表」は13回目の記録の数をそのまま渡したもので、自分で数えた数と違いました（AP-WF06・AP-WF14）。T5-15 の完了の記録や、ほかのタスクに渡す文にこの数を書くときは、86・197 を使ってください。t5-design.md の完了の条件の「87記事」も今の数と違います（表の 197 は合っています）。
- T9 の実機の確かめで、ブログの記事の目次の一覧を開いたまま本文を指で押したとき、iOS の Safari で目次が閉じるかも見てください（Chromium では `main` へフォーカスが移って閉じます。閉じないと、送りの止めのあいだページが固まったように見えます）。
