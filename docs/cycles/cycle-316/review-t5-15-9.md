# T5-15 レビュー（9回目。ブログの記事の枠と目次）

判定: **改善指示**

対象: 作業ツリーの未コミットの T5-15 のパス（`DESIGN.md` の 213 行目の目次の段のハンク（109 行目のハンクは T5-3b のもので対象外）、`src/app/blog/[slug]/page.tsx`・`page.module.css`・`__tests__/page.test.tsx`、`src/blog/_components/CollapsibleTOC.tsx`・`.module.css`・`TableOfContents.tsx`・`.module.css`・`SeriesNav.tsx`・`.module.css`・`RelatedArticles.tsx`、`__tests__/CollapsibleTOC.test.tsx`（新）・`TableOfContents.test.tsx`・`SeriesNav.test.tsx`・`RelatedArticles.test.tsx`・`MobileToc.test.tsx`（削除）、`src/lib/analytics.ts`・`__tests__/analytics.test.ts`、`docs/knowledge/browser-layout-and-scrolling.md`（新））。前回の指摘（review-t5-15-8.md）への直しに加え、全体を初めから見直した。

HEAD（fcab1ae5）を scratchpad の自分だけのサブディレクトリ（`rv9-t515/`）に `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で置いた。上のパスを作業ツリーのものに重ねて1つずつ `cmp` で一致を確かめ、`MobileToc.test.tsx` を消し、`DESIGN.md` は 213 行目だけを作業ツリーのものにした。終えたあと、記録した PID（自分で立てたサーバーの npm・sh・next-server の3つ）だけを止め、書き出しは消した。

## 8回目の写しとの差

8回目の写し（`rv8-t515-snapshot.tar`）と作業ツリーを `cmp` で比べた。変わったのは `CollapsibleTOC.tsx`・`CollapsibleTOC.module.css`・`__tests__/CollapsibleTOC.test.tsx`・`DESIGN.md`（213 行目だけ）・知見のファイルの5つで、ほかの T5-15 のパスはバイトで同じ。変わった中身は次のとおり。

- `CollapsibleTOC.tsx`: 一覧の `div` に `keydown` の受け手（`handleListKeyDown`）を足した。修飾キー（Alt・Ctrl・Meta・Shift）が付くときは何もしない。↑↓（40px）・PageUp・PageDown・Space（見えている高さの 0.875 倍）・Home・End を、いつも `preventDefault` し、一覧を `scrollTo({ behavior: "instant" })` で送る。JSDoc は、ホイールと指の段とキーの段に分かれ、Firefox の版が「149 以前」になった。
- `CollapsibleTOC.module.css`: `.list` のコメントが「ホイール・指・キー」と「Firefox 149 以前」になった。値は変わらない。
- 試験: 7つのキーの取り消しと送り先、送れない短い一覧の7つのキー、4つの修飾キー、Tab・Enter、開閉の行の Space・Enter の 21件が増えた。
- `DESIGN.md`: 目次の段に「開いた一覧の上での送り（ホイール・指・キー）は、一覧の長さに関わらず本文を動かさない。…気づかないまま読んでいた所を失う。」の2文が入った。
- 知見: 環境の Chromium 141 の事実がファイルの頭へ移り、2の項が「Firefox 149 以前」と、キーの送りの段・対処・実測・確認（Chrome 144 のキーの変更を別の点に、Firefox 150 を出典付きで）を持つようになった。

次の回が比べられるよう、今回重ねたファイル（T5-15 のパスと、HEAD に 213 行目だけを当てた `DESIGN.md`）を scratchpad の `rv9-t515-snapshot.tar`（sha256 `831eb0b9…b1b1`）に残した。

## 前回の指摘と、その直し

| 前回の指摘                                              | 確かめたこと                                                                                                                                                                                  | 判定                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1. Firefox は 150 から止める                            | 知見の見出し・本文・対処と、JSDoc・`.list` のコメントがどれも「Firefox 149 以前」になった。確認に Firefox 150 のリリースノートと bug 1837436 が入り、1724358 は「149 以前」の説明として残った | 満たす                     |
| 2. キーの変更は Chrome 144 の別の変更                   | 確認の点が2つに分かれ、キーの点に chromestatus 5099117340655616 と issue 41378182 が付いた                                                                                                    | 満たす                     |
| 3. 一覧の項目にフォーカスがあるとき、キーでページが動く | 項目にフォーカスを置いたときは、どの測りでもページが動かない（下の表）。ただし開閉の行にフォーカスがあるときと、修飾キーの付く送りのキーでは、同じことが残る（下の指摘1・2）                  | 項目は満たす。下の指摘1・2 |
| 4. 知見の2の項に作業の決まりがある                      | 環境の事実はファイルの頭へ移り、決まりの文は消えた                                                                                                                                            | 満たす                     |

## 試験

- `npm run generate:release-id` のあとの `npx vitest run --maxWorkers=2`: 393ファイル 6416件が通り、2ファイル 8件が飛ぶ。ビルドのあとに `src/__tests__/bundle-budget.test.ts` を走らせると 7件が通る。8回目（6395件）から、`CollapsibleTOC.test.tsx` の増えた 21件の分だけ増えた。
- `tsc --noEmit`・eslint（`src/app/blog`・`src/blog`・`analytics.ts` と試験）・prettier（対象のパスと `DESIGN.md`・知見のファイル）: 通る。
- `npm run build`: 通る。

## 本番のビルドでの測り（Chromium 141.0.7390.37、chromium-1194、ヘッドレス）

### 一覧の項目にフォーカスがあるとき（直しの対象）

2記事（`javascript-date-pitfalls-and-fixes`・`character-counting-guide`）× 375×667・1280×800・375×667 の文字サイズ 200% × 留まる前（読み始めの画面で開く）と y=4000 で、開閉の行で Enter を押して開き、下へのキーは最後の項目、上へのキーは最初の項目にフォーカスを置いて、↓・PageDown・Space・End・↑・PageUp・Home を3回ずつ押した。84通りのすべてでページの位置は変わらなかった。

続けて押したとき（y=4000、`delay: 0` で ↓60回・Space 20回・PageDown 20回・↑60回・PageUp 20回と、`keydown` だけを60回続ける押しっぱなし）も、2記事 × 3つの画面の 36通りのすべてで、ページは 4000 のままで、一覧は端（387・241・632・1497。送れない一覧は 0）で止まった。

送る量は、同じ大きさの受け手の無い箱に同じ項目を入れてブラウザに送らせたものと比べた。↓ はどちらも 40px、PageDown と Space は、一覧の端で止まらない 375 の 200% でどちらも見えている高さの 0.875 倍（507 と 506）で、Chromium のキーの送りと同じ量である。Chromium は既定でキーの送りを滑らかに動かすが、ここでは即時に送る。DESIGN.md §11 は操作に応える送りを即時にすると決めているので、それと合う。

Escape で閉じると、フォーカスは開閉の行へ戻り、ページは開く前の位置（3000）のまま。項目の上の Enter は章へ移って目次を閉じ、Tab は次の項目へ進む。Shift+↓・Shift+PageDown・Shift+End・Ctrl+↓・Ctrl+Space ではページは動かない。1280 と 375 で End のあとの一覧を撮って見た。一覧は目次の下から画面の下端までに収まり、最後の項目「まとめ」が画面の中にある。

### 開閉の行にフォーカスがあるとき・修飾キーの付く送りのキー（下の指摘1・2）

y=4000 で開いたまま、1回押して 0.8 秒後の位置。

| キー（フォーカスの所）                | jav 375 | jav 1280 | jav 375 200% | cha 375 | cha 1280 | cha 375 200% |
| ------------------------------------- | ------- | -------- | ------------ | ------- | -------- | ------------ |
| ↓（開閉の行）                         | 4040    | 4040     | 4040         | 4040    | 4040     | 4040         |
| PageDown（開閉の行）                  | 4583    | 4700     | 4583         | 4583    | 4700     | 4583         |
| End（開閉の行）                       | 14574   | 11170    | 42945        | 19201   | 13077    | 54505        |
| ↑（開閉の行）                         | 3960    | 3960     | 3960         | 3960    | 3960     | 3960         |
| Home（開閉の行）                      | 0       | 0        | 0            | 0       | 0        | 0            |
| Shift+Space（最初の項目・一覧は上端） | 3417    | 3300     | 3417         | 3417    | 3300     | 3417         |
| Ctrl+End（最後の項目）                | 14574   | 11170    | 42945        | 19201   | 13077    | 54505        |
| Ctrl+Home（最初の項目）               | 0       | 0        | 0            | 0       | 0        | 0            |

Alt+↓（最初の項目、jav 1280）も 4000→4700 だった。どれも目次は開いたままで、一覧が本文を隠している。

## 指摘事項

### 1. 開閉の行にフォーカスがあるまま開いた一覧の上でキーを押すと、ページが動く（中）

開閉の行（`summary`）を押して目次を開くと、フォーカスは開閉の行に残る。マウスや指で開いたときも、Chromium では押した `summary` にフォーカスが移る。そこから、一覧の続きを見ようとして ↓ や PageDown を押す、あるいはキーボードで開いたあとに一覧へ入ろうとして ↓ を押すのは、ありふれた操作である。いまは `keydown` の受け手が一覧の `div` にだけあるので、開閉の行の上のこれらのキーはブラウザの既定の送りになり、上の表のとおり一覧の下でページが送られる（End なら記事の末尾へ、Home なら記事の頭へ）。一覧は開いたまま本文を隠しているので、来訪者は動いたことに気づかず、閉じると読んでいた所を失う。

DESIGN.md の目次の段が今回足した理由（「一覧が本文に重なっているあいだに本文が動くと、来訪者は気づかないまま読んでいた所を失う」）は、フォーカスが項目にあるか開閉の行にあるかを問わない。項目の上だけを止めると、その理由を半分だけ満たす形になる。t5-design.md の T5-15 の完了条件は「フォーカスを一覧の項目に置いて」と書くので条件の文面は満たすが、来訪者の側では同じ穴である。

直し方の例: 開いているあいだ、目次（`nav`）の中のどこにフォーカスがあっても、送りのキーを一覧へ向ける。開閉の行の Space と Enter は開閉に使うので触らない（Space で閉じれば一覧は本文を隠さない）。開閉の行の ↓・PageDown・End などで一覧を送るか、一覧を送らずページだけを止めるかは builder が決める（一覧を送るほうが、開いて一覧の続きを見たい来訪者の意図に合う）。単体テストに開閉の行の各キーを足し、Chromium で上の表の「開閉の行」の行が 4000 のままになることを確かめる。知見の2の項の「層の中の項目にフォーカスがあると…」の段と対処にも、層を開く行にフォーカスがあるときのキーはブラウザがそのままページを送ることと、その対処を書く。完了条件に「開閉の行にフォーカスがあるとき」を足すかは PM が決める。

### 2. 修飾キーの付く送りのキーがページを送る。Mac の来訪者の主な送りのキーが漏れる（中）

`handleListKeyDown` は修飾キーが1つでも付くと何もしない。ところが、修飾キーの付く組み合わせにも、ブラウザがページを送るものがある。上の表で測れたのは次のとおり。

- **Shift+Space**（どの OS でも「上へ1画面」）: 送れない短い一覧や、一覧が上端にあるとき、ページが 583〜700px 上へ送られる。Space を下への送りに使う来訪者は、戻るときに Shift+Space を使う。
- **Ctrl+Home・Ctrl+End**（Windows・Linux の「頭へ・末尾へ」）: ページが記事の頭（0）や末尾（最大 54505）へ飛ぶ。
- **Alt+↓・Alt+↑**: この Chromium（Linux）ではページが1画面送られた（4000→4700）。Mac の Option+↑↓ も1画面の送りである。

測れないが、Mac の Cmd+↑・Cmd+↓（頭へ・末尾へ）も同じ既定の送りである。MacBook のキーボードには PageUp・PageDown・Home・End のキーが無く、Mac の来訪者は Space・Shift+Space・Option+↑↓・Cmd+↑↓ で送る。ブログの記事の来訪者の 89.1% は PC で（t5-design.md の 8-a・8-b・8-c）、そのうち Mac の来訪者には、今回の直しのうち Space しか効かない。

JSDoc と知見は「修飾キーを伴うキーは触らない」とだけ書き、なぜ触らないか（Alt+←→ の戻る・進むや、Shift+矢印の選択など、送り以外の操作を奪わないため）も、どの組み合わせが送りになるかも書かない。

直し方の例: 「修飾キーの付くものは一律に通す」をやめ、送りになる組み合わせ（Shift+Space・Alt+↑↓・Ctrl+Home/End・Meta+↑↓・Meta+Home/End など）を、修飾キーの無いキーと同じく一覧の送りにする。送りでない組み合わせ（Alt+←→・Shift+↑↓ など）は通す。組み合わせの一覧は、OS ごとの既定の送りを出典か実測で確かめて決める（Mac は測れないので、出典で確かめ、測っていないことを知見に書く）。単体テストに各組み合わせを足し、Chromium で上の表の Shift+Space・Ctrl+Home・Ctrl+End・Alt+↓ が 4000 のままになることを確かめる。

### 3. 「ブラウザのキーの送りと同じ量」は Chromium の量である（軽い）

`LIST_LINE_STEP_PX` と `LIST_PAGE_STEP_RATIO` の JSDoc（「ブラウザが矢印のキーで送る量と同じにする」「ブラウザのページ送りと同じにする」）と、知見の対処（「ブラウザのキーの送りと同じ量」）は、どのブラウザでもこの量であるように読める。40px と 0.875 倍は Chromium の値で（上の測りで一致）、Firefox の矢印は既定で3行分（`toolkit.scrollbox.verticalScrollDistance`）、ページ送りも画面の高さから少し重ねる別の決め方である。来訪者の多くは Chromium の系統で、Firefox の来訪者が少し違う量に感じるのは害が小さいので、値は変えなくてよい。「Chromium のキーの送りと同じ量」と書く。

### 4. 知見の2の項の見出しが中身を言わない（軽い）

2の項の見出しは「Chromium 143 以前と Firefox 149 以前は、中身が収まって送れない箱の `overscroll-behavior: contain` で送りを止めない」のままで、今回足した「キーの送りは、Chromium 143 以前では、中で送れる箱でも `overscroll-behavior` に従わない」と、その対処（キーは層だけを送る）を見出しが言わない。キーの送りで困って知見を探す人は、この見出しでは開かない。見出しを、送り方ごとの2つの事実を言う形（例: 「Chromium 143 以前と Firefox 149 以前では、`overscroll-behavior: contain` の箱の上の送りがページへ漏れる（送れない箱のホイールと指、Chromium 143 以前では送れる箱のキーも）」）にするか、キーを別の項に分ける。指摘1・2の直しで足す事実も、同じ見出しの下に収まるようにする。

### 5. JSDoc の折り返しに、書き足しの跡が残る（軽い）

`CollapsibleTOC.tsx` の JSDoc の 77〜79 行目は「…送る量は\n * ブラウザのキーの送りと同じにする。修飾キーを伴うキーと、Tab・Enter・\n * Escape は触らない。」で、ほかの行が 1 行を埋めて折り返しているのに、「Tab・Enter・」で行を切り「Escape は触らない。」が短い行に落ちている。67 行目は逆に、ほかの行より長い。書き足した所が形で分かる。指摘2の直しでこの段を書き直すときに、ほかの段と同じ幅で折り直す。

## そのほか確かめたこと（問題なし）

- **スクリーンリーダー**: NVDA・JAWS のブラウズモードと、VoiceOver のクイックナビは、矢印などのキーを読み上げの操作として受け取り、ページへ `keydown` を渡さない。VoiceOver の操作（Ctrl+Option+…）は修飾キーが付くので受け手を通らない。受け手は役割・名前・フォーカスの順を変えない。読み上げの操作は妨げない。
- **項目のリンクの上の Space**: ブラウザの既定でも、リンクの上の Space はリンクを押さずページを送る（Enter で押す）。一覧を送るようにしても、押す手段は変わらない。
- **一覧の中の文字の選択**: マウスでの選択はキーの受け手を通らない。Shift+矢印・Shift+End は触らないので、選択を広げる操作も奪わない（この Chromium では、これらでページも動かなかった）。キャレットブラウズ（F7）を入れた来訪者は、一覧の中で矢印のキーでキャレットを動かせなくなるが、一覧はリンクの名前だけで、Tab で項目を移れ、目次の外では変わらないので、害は小さいとみる。
- **出典を自分で読んだ**: MDN の Firefox 150 の開発者向けリリースノート（2026-04-21。`overscroll-behavior` とその個別の指定が、あふれの無いスクロールコンテナにも正しく当たるようになった。bug 1837436）。Bugzilla 1837436（「CSS overscroll-behavior does not work when scroll container has no overflow」、RESOLVED FIXED、150 Branch）。Bugzilla 1724358 のコメント18（スクロールの幅の無い `overflow: scroll/auto` の箱は APZC を持たず、`overscroll-behavior` が当たらない）。chromestatus の API（5129635997941760「Respect overscroll-behavior on non-scrollable scroll containers」、5099117340655616「Respect overscroll-behavior for keyboard scrolls」、どちらもデスクトップ 144。後者の bug は issues.chromium.org/41378182。後者の要約は「マウスと指の送りは従っていたが、キーボードの送りは無視していた」）。Chrome 144 のリリースノート（安定版 2026-01-13。2つが別の項）。知見の確認の点と JSDoc・コメントの版は、これらと合う。
- **知見の実測の値**: 対処の形の測り（2記事 × 3つの画面 × 留まる前と後でページが動かない、端 387・241・632・1497）は、今回の測りと一致した。受け手の無い形の値は review-t5-15-8.md の表と一致する。
- **DESIGN.md の目次の段の2文**: 実装の意図と合い、理由（本文が動くと気づかないまま読んでいた所を失う）を来訪者の側で書く。経緯の書き方は無い。指摘1・2の直しは、この2文の範囲に入るので、DESIGN.md を変えずに済む。
- **`page.tsx`・`page.module.css`・`TableOfContents`・`SeriesNav`・`RelatedArticles`・`analytics.ts` と各試験**: 8回目の写しとバイトで同じで、8回目までの確かめのとおり T5-15 の行と 11章の決定に合う。

## PM への依頼

指摘1〜5を builder に直させてください。指摘1・2は振る舞いの追加で、試験と Chromium での測り、知見の2の項の段と対処の書き足しを伴います。指摘1で完了条件に開閉の行のフォーカスを足すかは PM が決めてください。直したあと、前回の指摘だけでなく全体を見直す10回目のレビューを依頼してください。比べるための写しは `rv9-t515-snapshot.tar` です。

## Sources

- [Firefox 150 release notes for developers（MDN）](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/150)
- [Bugzilla 1837436](https://bugzilla.mozilla.org/show_bug.cgi?id=1837436)
- [Bugzilla 1724358](https://bugzilla.mozilla.org/show_bug.cgi?id=1724358)
- [chromestatus 5129635997941760](https://chromestatus.com/feature/5129635997941760)
- [chromestatus 5099117340655616](https://chromestatus.com/feature/5099117340655616)
- [Chrome 144 | Release notes](https://developer.chrome.com/release-notes/144)
- [toolkit.scrollbox.verticalScrollDistance（Firefox の設定）](https://admx.help/?Category=FrontMotion&Policy=FrontMotion.Policies.Firefox::TOOLKIT_SCROLLBOX_VERTICALSCROLLDISTANCE)
