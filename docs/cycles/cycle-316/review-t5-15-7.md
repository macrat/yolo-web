# T5-15 レビュー（7回目。ブログの記事の枠と目次）

判定: **改善指示**

対象: 作業ツリーの未コミットの T5-15 のパス（`DESIGN.md` の 213 行目の目次の段のハンク（109 行目のハンクは T5-3b のもので対象外）、`src/app/blog/[slug]/page.tsx`・`page.module.css`・`__tests__/page.test.tsx`、`src/blog/_components/CollapsibleTOC.tsx`・`.module.css`・`TableOfContents.tsx`・`.module.css`・`SeriesNav.tsx`・`.module.css`・`RelatedArticles.tsx`、`__tests__/CollapsibleTOC.test.tsx`（新）・`TableOfContents.test.tsx`・`SeriesNav.test.tsx`・`RelatedArticles.test.tsx`・`MobileToc.test.tsx`（削除）、`src/lib/analytics.ts`・`__tests__/analytics.test.ts`、`docs/knowledge/browser-layout-and-scrolling.md`（新））。前回の指摘（review-t5-15-6.md）への直しに加え、全体を初めから見直した。

HEAD（8f56cae0。323dcc9b からの差は `docs/cycles/cycle-316/` の記録だけ）を scratchpad の自分だけのサブディレクトリ（`rv7-t515/`）に `git archive` で書き出し、`node_modules` が無いことを確かめてから `cp -al` で置いた。上のパスを作業ツリーのものに重ねて1つずつ `cmp` で一致を確かめ、`MobileToc.test.tsx` を消し、`DESIGN.md` は目次の段のハンクだけを当てた（213 行目が作業ツリーと一致、109 行目は HEAD のまま）。終えたあと、記録した PID（自分で立てたサーバーの npm・sh・next-server の3つ）だけを止め、書き出しは消した。

## コードが6回目の測りと同じであること

6回目の書き出しは消されているので、6回目の重ねたファイルとじかには `cmp` できない。代わりに次の2つで確かめた。

- 作業ツリーのコードとテストのファイルの更新の時刻は、どれも 2026-09-29 00:15:32 以前である（最後は 00:15 台の5回目の直し）。6回目が書き出した HEAD（323dcc9b）のコミットは 00:15:04、6回目のレビューのコミットは 01:04:07 で、そのあとに変わったのは知見のファイル（01:04:23）だけ。
- 今回の重ねたファイルは作業ツリーと `cmp` で一致する。HEAD の差（323dcc9b..8f56cae0）はレビューの記録だけで、`src/` と `DESIGN.md` を含まない。

コードは6回目が測ったものと同じとみて、振る舞いの測りは6回目の値に拠った。コードとテストは全部読み直した。

## 前回の指摘と、その直し

| 前回の指摘                                                               | 確かめたこと                                                                                                                                                                                                                                                                                                  | 判定                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1. 知見の2の項の推論の段が実測で古くなった。拡大の測り方の落とし穴が無い | Ctrl+ホイールの拡大の実測（XTest の本物の入力、対照と陰性の対照、5つの場面）が「実測」に移り、値は review-t5-15-6.md の表と一致する（100%→150%、`innerWidth` 1280→853、`wheel` 3件の取り消し 0・3・3）。CDP の落とし穴と、X の Ctrl+0 で戻すことが書かれた。推論に残るのは2本の指とトラックパッドのつまみだけ | 満たす。ただし下の指摘3・4 |

CDP の落とし穴の段にある「ヘッドレスでも」と「3880」は 6回目の記録に無い値なので、自分で測った。ヘッドレスの Chromium 141.0.7390.37（chromium-1194）の 1280×800 で javascript-date-pitfalls-and-fixes を y=4000 に置き、CDP の `Input.dispatchMouseEvent`（`mouseWheel`・`modifiers: 2`）を本文の上へ送ると、`deltaY: -120` の1回で 3880、3回で 3640、`deltaY: 120` の1回で 4120 になり、`devicePixelRatio` は 1、`innerWidth` は 1280 のまま（拡大しない）だった。書いてある値は正しい。

## 試験

- `npx vitest run --maxWorkers=2`: 393ファイル 6395件が通り、2ファイル 8件が飛ぶ。飛ぶのは `bundle-budget.test.ts`（`.next` が無いと走らない 7件）と、既定で飛ばす1件。ビルドのあとに `bundle-budget.test.ts` を走らせると 7件が通る。合わせて 6402件が通り、6回目と同じ数である。なお、書き出しで初めに流したときは `src/lib/generated/release-id.ts`（`pretest` の `generate:release-id` が作る、git に無いファイル）が無く5ファイルが読み込みで落ちた。`npm run generate:release-id` のあとに流し直した結果が上の数である（T5-15 とは関わらない、書き出しの手順の話）。
- `tsc --noEmit`・eslint（対象のパス）・prettier（対象のパスと `DESIGN.md`・知見のファイル）: 通る。
- `npm run build`: 通る。

## 指摘事項

### 1. 知見の2の項の主張が、今の Chrome と仕様に合わない（中）

`docs/knowledge/browser-layout-and-scrolling.md` の2の項は、見出しで「`overscroll-behavior: contain` は、中身が収まって送れない箱では送りを止めない」と、ブラウザ一般の挙動として書き、推論で「送れない箱で効かないのが仕様どおりか…は確かめていない」と書く。ところが、

- 仕様（CSS Overscroll Behavior Module Level 1）は、`overscroll-behavior` を、中身があふれているか・来訪者が送れるかに関わらず、すべてのスクロールコンテナに当てる。
- Chrome は 144（安定版 2026-01-13）でこれに合わせ、中で送れない箱でも `overscroll-behavior` が送りの引き継ぎを止めるようになった（Chrome 144 のリリースノートの「Respect `overscroll-behavior` on non-scrollable scroll containers」、blink-dev の Intent to Ship）。同じ変更で、キーボードの送りも `overscroll-behavior` に従う。
- 測ったのは Chromium 141 で、今の安定版（2026年9月）より10版ほど古い。知見の「送れない箱では止めない」は Chromium 143 以前の挙動で、仕様から外れていたものである。
- Gecko と WebKit は Intent の時点で「no signal」。Firefox は、送れる幅の無い `overflow: auto` の箱では従わないのが今の挙動だと Bugzilla の議論（1724358）に書かれている。Safari は確かめられなかった。

このままだと、知見を読む人は「今の Chrome でも JS で止めないと送りが漏れる」「これは仕様どおりかもしれない」と受け取る。誤りを含むドキュメントは直す決まり（`.claude/rules/doc-directory.md`）。

直し方の例: 見出しと本文を「仕様と Chrome 144 以降は止めるが、Chromium 143 以前（と、確かめた範囲では Firefox）は止めない」と、ブラウザと版の範囲を付けた形に書き直す。仕様と Chrome 144 の変更は「確認」に出典（下の Sources）付きで書き、推論の「仕様どおりか確かめていない」を外す。実測が Chromium 141 であることは根拠の頭にすでにあるので、今の安定版で測っていないことを推論か根拠に書く。対処（JS の受け手）は、止めないブラウザが来訪者に残る（古い Chrome・Firefox・確かめていない Safari）ので要る、と理由を合わせる。Safari の挙動は実機で確かめられるなら T9 に足す。

### 2. コードのコメントも、同じ主張をブラウザ一般の事実として書く（軽い）

- `src/blog/_components/CollapsibleTOC.tsx` の JSDoc: 「中で送れない短い一覧は、ブラウザが送りをそのままページへ渡すので、ここで止める。」
- `src/blog/_components/CollapsibleTOC.module.css` の `.list` のコメント: 「中で送れない短い一覧では overscroll-behavior が効かないので、その送りは CollapsibleTOC が止める。」

Chrome 144 以降では、短い一覧でも CSS が止める。受け手が要らなくなったわけではない（止めないブラウザが残る）が、コメントの理由が今の主なブラウザで偽になる。コードを読む人が「Chrome でも CSS は効かない」と誤るか、逆に Chrome で確かめて理由が合わないので受け手を外してよいと読む。直し方の例: 「仕様では送れない箱でも CSS が止めるが、止めないブラウザ（Chromium 143 以前・Firefox など）があるので、ここでも止める」の形にする。経緯（前は・変えた）の書き方にはしない。振る舞いは変わらないので、単体テストの追加は要らない。

### 3. 知見の中の測りの出どころが食い違う（軽い）

2の項の実測で、XTest の拡大の測りを「（5回目のレビューのあとの測り）」、推論で2本の指の `touchmove` 30件の測りを「（6回目のレビューの測り）」と書く。どちらも review-t5-15-6.md の「拡大の実測」で測ったもので、前者は「5回目のレビューのあと」に builder が測ったとも読める。どちらも「6回目のレビュー（review-t5-15-6.md）の測り」とそろえる。

### 4. 実測の値が推論の段にあり、実測の段の記述と重なる（軽い）

推論の段の「短い一覧の上の2本の指の `touchmove` 30件は1つも取り消されず、陰性の対照では30件すべて取り消された」は測った事実で、実測と推論を分ける書式に反する。実測の3つ目の点（「2本の指の `touchmove` は、どれも取り消されなかった（375 と 1280）」）と重なり、件数と対照の有無が段によって違う。30件と陰性の対照を実測の3つ目の点にまとめ、推論には「受け手が取り消さないので、つまむ拡大は止めないと考えるが、本物のつまみでは測っていない（T9）」だけを残す。

あわせて、同じ項の CDP の落とし穴の「本文の上で 4000→3640・3880」に、それぞれの送り方（上へ 120 を3回・1回）を書く。今のままでは、同じ操作で値が2つあるように読める。2の項の根拠の頭（「375×667 と 1280×800 を測った」）には、実測の2つ目の点にある 375 の 200% と、XTest の測りの 1280 幅の窓（画面あり）を含める。

## そのほか確かめたこと（問題なし）

- `CollapsibleTOC.tsx`: 受け手は開いているあいだだけ付き、一覧が中で送れるかを送るたびに測る。`ctrlKey` のホイールと2本以上の指は取り消さない。開く押し下げでだけ目次を上端まで即時に送り、閉じる押し下げでは送らない。Escape は開いているときだけ `preventDefault` し、`preventScroll` で開閉の行へ戻す。外へのフォーカスで閉じる。`toc_open` は来訪者が開いたときだけ、`toc_jump` は項目を押したときに送る。JSDoc は実装と DESIGN.md の目次の段（Escape を含む）と一致する（指摘2の1文を除く）。
- `CollapsibleTOC.module.css`: `--toc-height` の式、500px 未満で留めないこと、閉じているときだけの `scroll-padding-top` と打ち消しの `scroll-margin-top`、`.list` の高さと重ね方は、知見の1の項の CSS の例と一致する。
- `page.tsx`・`page.module.css`: 記事の頭から本文までを1つの `Section` の `.body` に置き、共有・関連記事・前後の記事をそれぞれセクションにする。パンくずと h1 のあいだは `.header` の `gap: var(--space-16)`。補助情報は `--text-small`。
- `TableOfContents`・`SeriesNav`・`RelatedArticles`: 項目の字下げは `###` 以下を1段。連載のラベルはサーバーで `splitIntoPhrases` した並びで組む。関連記事が無いときはセクションごと描かない。
- `analytics.ts` の2つの関数と JSDoc は 11章の決定と一致し、試験は gtag の無い環境を含む。
- 試験は、`page.test.tsx` を含めて今の組み方を正の形で確かめ、経緯の書き方（前は・変えた・名残）は無い。`MobileToc.test.tsx` の削除で、消えた部品を指す試験は残っていない。
- 知見の1の項と、2の項の対処・CSS の例は実装と一致する。2の項の拡大の実測の値は review-t5-15-6.md と一致し、推論に残るのはつまみ（指とトラックパッド）だけで、依頼の範囲どおり。

## T5-15 の外の気づき（PM へ）

- この環境の Playwright の Chromium は 141 だけで（`/opt/pw-browsers/chromium-1194`）、今の安定版の Chrome より10版ほど古い。T5-15 の送りの測りは 141 の挙動で、Chrome 144 で `overscroll-behavior` の挙動が変わったように、古い版の測りが来訪者の Chrome と食い違うことがある。今回の目次では、どちらの版でも一覧の上の送りでページが動かないので結果は変わらないが、ほかのタスクでも版に依る挙動を測るときは、この差を知見か計画に残すかを PM が決めてください。
- review-t5-15-6.md の「T5-15 の外の気づき」（200% で本文の箇条書きの点が本文の左端より左へ出る件）は、今回の範囲外のため確かめ直していない。受け持ちの決定がまだなら、PM が決めてください。

## PM への依頼

指摘1〜4を builder に直させてください（知見のファイルとコンポーネントのコメントはどれも T5-15 のパスに入っている）。直したあと、前回の指摘だけでなく全体を見直す8回目のレビューを依頼してください。

## Sources

- [Chrome 144 | Release notes](https://developer.chrome.com/release-notes/144)
- [Intent to Ship: Respect overscroll-behavior on non-scrollable scroll containers（blink-dev）](https://groups.google.com/a/chromium.org/g/blink-dev/c/OSq1yVSSdDE/m/fq8a7frQAAAJ)
- [CSS Overscroll Behavior Module Level 1](https://www.w3.org/TR/css-overscroll-1/#propdef-overscroll-behavior)
- [Use overscroll-behavior: contain to prevent a page from scrolling while a dialog is open（Bram.us）](https://www.bram.us/2025/11/25/use-overscroll-behavior-contain-to-prevent-a-page-from-scrolling-while-a-dialog-is-open/)
- [Bugzilla 1724358](https://bugzilla.mozilla.org/show_bug.cgi?id=1724358)
