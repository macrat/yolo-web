# T5-15 レビュー（10回目。ブログの記事の枠と目次）

判定: **改善指示**

対象: 作業ツリーの未コミットの T5-15 のパス（`DESIGN.md` の 213 行目の目次の段のハンク（109 行目のハンクは T5-3b のもので対象外）、`src/app/blog/[slug]/page.tsx`・`page.module.css`・`__tests__/page.test.tsx`、`src/blog/_components/CollapsibleTOC.tsx`・`.module.css`・`TableOfContents.tsx`・`.module.css`・`SeriesNav.tsx`・`.module.css`・`RelatedArticles.tsx`、`__tests__/CollapsibleTOC.test.tsx`（新）・`TableOfContents.test.tsx`・`SeriesNav.test.tsx`・`RelatedArticles.test.tsx`・`MobileToc.test.tsx`（削除）、`src/lib/analytics.ts`・`__tests__/analytics.test.ts`、`docs/knowledge/browser-layout-and-scrolling.md`（新））。9回目の PM の判断（index.md「T5-15 の PM の判断（review-t5-15-9.md）」）への直しに加え、全体を初めから見直した。

HEAD（253b67c5）を scratchpad の自分だけのサブディレクトリ（`rv10-t515/`）に `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で置いた。上のパスを作業ツリーのものに重ねて1つずつ `cmp` で一致を確かめ、`MobileToc.test.tsx` を消し、`DESIGN.md` は 213 行目だけを作業ツリーのものにした。終えたあと、記録した PID（自分で立てたサーバーの npm・sh・next-server の3つ）だけを止め、書き出しは消した。

## 9回目の写しとの差

9回目の写し（`rv9-t515-snapshot.tar`）と今回重ねたファイルを `cmp` で比べた。変わったのは `CollapsibleTOC.tsx`・`CollapsibleTOC.module.css`・`__tests__/CollapsibleTOC.test.tsx`・`DESIGN.md`（213 行目だけ）・知見のファイルの5つで、ほかの T5-15 のパスはバイトで同じ。

- `CollapsibleTOC.tsx`: `wheel`・`touchmove` の受け手（`useEffect`）と `keydown` の受け手（`handleListKeyDown`・`listScrollTarget`・2つの定数）が消え、一覧の `div` は `className` だけを持つ。JSDoc の送りの段は「開いているあいだは、ページ全体を送らない（CollapsibleTOC.module.css）」の3文になった。
- `CollapsibleTOC.module.css`: `:global(html):has(.toc) { scrollbar-gutter: stable }` と `:global(html):has(.toc > details[open]) { overflow: hidden }` が足され、その理由のコメントが付いた。`.list` は `overflow-y: auto`・`overscroll-behavior: contain` を保ち、コメントは「端まで送ったあとの指の送りを、ページの引っ張りや跳ね返りにも渡さない」になった。
- 試験: 受け手の試験（ホイール・指・キー・修飾キー）が消え、CSS の3つの規則（ルートの `overflow: hidden`・`scrollbar-gutter: stable`・一覧の `overflow-y: auto`）を読む試験が3件入った。CSS を読む試験は `Section`・`Button`・`page.test.tsx` などにもある、このリポジトリの形である。
- `DESIGN.md`: 目次の段に、開いているあいだは本文を送らないこと、その理由、一覧の外の本文も送れないことを受け入れる理由、開閉で本文の幅と位置が変わらないことが入り、開閉を変える操作に「Escape を押す」が入った。
- 知見: 2の項が「`overscroll-behavior` と入力ごとの受け手では止めきれない。層が出ているあいだはページの送りを止める」になり、漏れの4つの道・対処・実測（止める形の測り、画面ありの幅と layout-shift、X の入力での拡大、受け手の形の漏れ）・確認・推論を持つ。

次の回が比べられるよう、今回重ねたファイル（T5-15 のパスと、HEAD に 213 行目だけを当てた `DESIGN.md`）を scratchpad の `rv10-t515-snapshot.tar`（sha256 `457a09f7…0534`）に残した。

## 試験

- `npm run generate:release-id` のあとの `npx vitest run --maxWorkers=2`: 393ファイル 6397件が通り、2ファイル 8件が飛ぶ。ビルドのあとに `src/__tests__/bundle-budget.test.ts` を走らせると 7件が通る。
- `tsc --noEmit`・eslint（`src/app/blog/[slug]`・`src/blog`・`analytics.ts` と試験）・prettier（対象のパスと `DESIGN.md`・知見のファイル）: 通る。
- `npm run build`: 通る。
- `npm run check:phrased-names`: `SeriesNav.tsx` は値で渡す2か所（`seriesPhrases`・`positionPhrases`。サーバーで区切る文）だけで、字で渡すものは0。

## 本番のビルドでの測り（Chromium 141.0.7390.37、chromium-1194）

### ページが動かないか（ヘッドレス）

2記事（`javascript-date-pitfalls-and-fixes`（11項目）・`character-counting-guide`（21項目））× 375×667・1280×800・375×667 の文字サイズ 200% × 留まる前（読み始めの画面で開く）と y=4000 × フォーカスの所（開閉の行・最初の項目・最後の項目）× 19のキー（↓・↑・PageDown・PageUp・Home・End・Space・Shift+Space・Ctrl+Home・Ctrl+End・Alt+↓・Alt+↑・Meta+↓・Meta+↑・Shift+↓・Ctrl+↓・Shift+PageDown・Ctrl+Space・Shift+End）を2回ずつ押し、0.7 秒後の位置を読んだ。684通りのすべてで、ページの位置は開いた直後と同じで、開いているあいだのルートの `overflow-y` は `hidden` だった。項目にフォーカスがあるとき、一覧はキーで送れた（最初の項目から End で 387・241・671・1497 の端まで、最後の項目から Home で 0 まで）。開閉の行にフォーカスがあるときは、キーでページも一覧も動かない。

指（`isMobile`・`hasTouch`。CDP の `Input.dispatchTouchEvent` で 15 段の指の動き）: 375×667・320×568 × 2記事 × 留まる前と y=4000 で開き、一覧の上で上下に9回、左の端と開閉の行の上で1回ずつ送った。ページは1度も動かず、一覧は両端（375 で 0〜387、320 で 0〜113・0〜519）まで送れた。閉じているときの同じ動きではページが 280〜324px 送られるので、測りは効いている。なお CDP の `Input.synthesizeScrollGesture` の指の送りは、この環境では閉じたページも一覧も送らなかったので、指の測りには使えない。

### 開閉で動かないか（Xvfb の上の画面ありの Chromium、1280 幅の窓、スクロールバーあり）

2記事 × 留まる前と y=4000 で、マウスで開いて閉じた。`main` は 152.5+960、本文の段落の x と幅は 171.5・640 のまま、layout-shift は0件。`documentElement.clientWidth` は 1265→1280→1265 と変わるが、置かれ方は変わらない。対照として `scrollbar-gutter: auto` を当てると、開いたとき `main` が 152.5→160 へ動き、開くときと閉じるときに layout-shift が 0.0059 ずつ出た。開いた形を撮って見ると、ページのスクロールバーが消えた所はページの地の色の帯になり、本文も目次も動かない。暗い配色でも同じ。

X の入力（`libXtst`）: 開いた一覧の上のホイールは一覧だけを送り（21項目で端の 228 まで）、一覧の外の本文の上ではページは 4000 のまま。一覧の上の Ctrl+ホイール（上へ3回）で拡大が 150%（`innerWidth` 853）になり、ページは 4000 のまま。X の Ctrl+0 で 100% に戻る。

### 目次のほかの振る舞い（ヘッドレス。320×568・375×667・1280×800 の既定と 200%、667×375）

- 3000px 送ると目次は上端（top 0、`sticky`）。667×375 では `relative` で留まらない。
- 留まる前に開くと目次が上端へ送られ、一覧の下端は画面の下端以内、一覧を送り切った最後の項目は画面の中で押せる（`elementFromPoint` が項目を返す）。667×375 でも同じ。
- 項目の Escape で閉じ、フォーカスは開閉の行へ戻り、ページは動かない。
- y=4000 で真ん中の項目を押すと、目次は閉じ、ルートの `overflow` は `visible` に戻り、見出しの上端は目次の下端の 16px 下（すべての大きさ）。
- Enter で開いて Tab で最後の項目まで進み Shift+Tab で開閉の行まで戻るあいだ、どの項目も一覧の中に見え、ページは動かない。最後の項目から Tab で目次の外へ出ると目次は閉じ、フォーカスした要素は目次の下に見える。320 と 375 の 200% の `character-counting-guide` だけは、次のフォーカスが高さ 1438px の横に送る表（`tabindex="0"`）で画面より高く、上端が画面の上に出る。止めを外した対照でも同じ位置で、今回の変更には依らない（完了の条件の「画面より高い要素は記録する」に当たる）。
- `window.dataLayer` に、開いたときの `toc_open`（`content_type: "blog"`・`content_id` が slug）と、項目を押したときの `toc_jump`（`section_id`・`section_level`。`character-counting-guide` の「環境別の全角半角の扱い」で 3）が入る。

### ほかのページ

画面ありの 1280 で `/`・`/blog`・`/tools/json-formatter`・`/about` のルートは `overflow-y: visible`・`scrollbar-gutter: auto` で、`:has()` の規則は目次を持たないページに当たらない。storybook の `.toc` は別のモジュールのクラスで、名前が衝突しない。

## 指摘事項

### 1. 開いたまま画面の高さが 500px を下回ると、目次が画面の外へ出て、ページが送れなくなる（中）

画面ありの Chromium（1280×900 の窓、`innerHeight` 813）で `character-counting-guide` を y=4000 で開き、一覧の上で X の Ctrl+ホイールを1回ずつ送った。150%（`innerHeight` 542）までは目次は上端に留まるが、175%（464）で `@media (min-height: 500px)` から外れて目次は `relative` になり、記事の頭の元の位置（画面の上端から −3482px）へ戻る。目次は開いたままなので、ルートの `overflow: hidden` は掛かったまま。200% でホイールを5回送ってもページは 4000 のままで、画面には本文しか見えない。来訪者には、目次が消え、ページが送れなくなったとしか見えない。本文を押すと、フォーカスが `main` へ移って目次が閉じ、送れるようになる（確かめた）が、来訪者はそれを知らない。止めを外した対照では、同じ手順でページは送れる（4000→4300）。止める形で新しく生まれた詰まりである。

同じことは、窓を低くしたとき（分割の表示・開発者ツール）や、スマホを横に回したときにも起きうる。この Chromium のスマホの形（375×667 → 667×375）では、回したあと目次が上端に来ていて詰まらなかったが、Safari では確かめていない。知見の2の項は「ブラウザの拡大もそのまま効く」と書くが、拡大で留まらなくなる所を越えると、この詰まりになる。

直し方の例: 開いているあいだに画面の大きさが変わったら、開くときと同じく目次を上端まで送る（スクリプトの送りは `overflow: hidden` でも効く）。DESIGN.md の「開閉は来訪者の操作でだけ変わり、画面の幅や読み込みでは変わらない」を保つため、閉じる形にはしない。単体テストを足し、画面ありの Chromium で X の Ctrl+ホイールで 175%・200% にしたとき目次の上端が 0 で、一覧の最後の項目まで押せることを確かめる。知見の2の項の対処と実測に、留める条件を越える拡大と大きさの変わりを書く。

### 2. iOS の Safari でルートの `overflow: hidden` が効かない、知られた場合を、知見も T9 の確かめ方も書かない（中）

WebKit には、ルートの `overflow: hidden` が指の送りを止めない場合が報告されている。

- ツールバーが縮んでいるとき（Bugzilla 240859「`<body>` with overflow: hidden CSS is scrollable on iOS when Safari's UI is collapsed」）。ツールバーを出すための送りが通る。bug の記録では、設定の変更（bug 301667）で直り、Safari 26.4（2026年4月）でその設定の既定が切り替わった。それより前の iOS では漏れ、26.4 以降も時の条件で残る場合を bug 317941 が追う。
- 画面をつまんで拡大しているとき（Bugzilla 240860。visual viewport が layout viewport より小さいと、ページ全体が送れる。NEW のまま）。

ブログの記事を読み進めた来訪者は、iOS の Safari ではたいていツールバーが縮んだ状態で目次を開く。古い iOS ではちょうどその状態で漏れる。知見の2の項の推論は「iOS の Safari で…止めるかは、この環境では確かめられない」とだけ書き、これらを書かない。index.md の T9 の行も「iOS の Safari で本文の上を指で送っても…本文が動かないか」とだけ書き、ツールバーの状態、つまんで拡大したあと、iOS の版を指定しない。これでは、実機で見たときにたまたまツールバーが出ていて「動かない」と記録し、漏れを見逃しうる。

直し方の例: 知見の2の項の推論に、上の2つの bug と、Safari 26.4 の変更を出典付きで書く。T9 の行（PM）に、読み進めてツールバーが縮んだ状態と、ツールバーが出ている状態の両方で開くこと、一覧の上でつまんで拡大したあとに本文の上を送ること、iOS の版を記録することを足す。漏れたときにどうするか（受け入れる版の線、または iOS だけの手当て）も、PM が T9 の分かれ道として先に書いておく。

### 3. DESIGN.md の「どの送りも一覧の中だけを送る」が、振る舞いより多くを言う（軽い）

DESIGN.md の目次の段は「一覧を開いているあいだは本文を送らず、ホイール・指・キーのどの送りも一覧の中だけを送る。」と書く。測りでは、一覧の外に見える本文の上のホイールと指、開閉の行にフォーカスがあるときのキーは、一覧も本文も送らない。一覧を送るのは、一覧の上のホイールと指と、項目にフォーカスがあるときのキーである。読み手は「どの送りでも一覧が動く」と読みうる。例: 「一覧を開いているあいだは、どの送りでも本文は動かない。一覧は、その上のホイールと指と、項目にフォーカスがあるときのキーで中を送る。」のように、動くものと動かないものを分けて書く。

### 4. 知見の「確認」の出典を確かめた回に、9回目が抜けている（軽い）

知見の2の項の確認の最後は「どれも cycle-316 の T5-15 のレビュー（5回目・7回目・8回目、…）が出典を読んで確かめた」と書く。ところが、Firefox 150 の変更（MDN のリリースノート・bug 1837436）と、Chrome 144 のキーの送りの変更（chromestatus 5099117340655616・issue 41378182）は、9回目（review-t5-15-9.md）が出典を読んで確かめ、直させたものである。「5回目・7回目・8回目・9回目」とし、review-t5-15-9.md を並べる。

## そのほか確かめたこと（問題なし）

- **Chrome 145 以降の `vw`**: Chrome 145 から、ルートに `scrollbar-gutter: stable` があると `100vw` はスクロールバーの幅を引く（Bram.us の記事）。記事のページでは `Section` の全幅の罫線（`margin-inline: calc(50% - 50vw)`）の右の端が、いまの「はみ出して切られる」形から「ちょうど画面の端まで」の形になるが、見える範囲は同じ（0〜1265）で、見た目は変わらない。この環境の Chromium 141 では測れない。
- **位置の固定された要素**: サイトの CSS に `position: fixed` は無い。ルートの `overflow: hidden` と `scrollbar-gutter` で位置の変わる要素は無い。
- **`html` と `body` の `overflow-x: clip`**: ルートが `overflow: hidden` になると、`body` の `overflow-x: clip` は `body` 自身に当たるが、`clip` は送りの箱を作らないので、`body` が送りの箱にはならず、`sticky` も保たれた（上の測り）。
- **Accordion の組み**: `Accordion` の根は `<details>` で、`nav.toc > details` の選び方は組みと合う。
- **撮った画面**: 1280 と 360 × 明るい配色と暗い配色 × 閉じた形と開いた形を撮って見た。開いた一覧は目次の下から画面の下端までに収まり、閉じた形は9回目までと同じ。
- **JSDoc・CSS のコメント**: 受け手の形の跡（定数・キーの一覧・Firefox の版）は残らず、今の形だけを書く。9回目の指摘5の折り返しの跡も、段ごと消えた。
- **知見の実測の値**: 止める形の12通り、画面ありの幅（1265→1280→1265、`main` 152.5+960、layout-shift 0件）と対照（152.5→160、1件ずつ）、X の Ctrl+ホイールの 150%・853 は、今回の測りと一致した。

## PM への依頼

指摘1・3・4を builder に、指摘2は知見の推論を builder に、T9 の行の確かめ方と分かれ道を PM が直してください。指摘1は振る舞いの追加で、試験と画面ありの Chromium での X の入力による測り、知見の書き足しを伴います。直したあと、前回の指摘だけでなく全体を見直す11回目のレビューを依頼してください。比べるための写しは `rv10-t515-snapshot.tar` です。

## Sources

- [WebKit Bugzilla 240859](https://bugs.webkit.org/show_bug.cgi?id=240859)
- [WebKit Bugzilla 240860](https://bugs.webkit.org/show_bug.cgi?id=240860)
- [WebKit Bugzilla 153852](https://bugs.webkit.org/show_bug.cgi?id=153852)
- [Interop の提案「Scrolling on Mobile Devices」（web-platform-tests/interop #788）](https://github.com/web-platform-tests/interop/issues/788)
- [Using 100vw is now scrollbar-aware (in Chrome 145+, under the right conditions)（Bram.us）](https://www.bram.us/2026/01/15/100vw-horizontal-overflow-no-more/)
