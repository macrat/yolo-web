# T5-3b 完了のレビュー（全体・第10回）

対象: T5-3b の全体。PART 1（011ec106・224b13b3・092c42e2・b57ae1f5・3c2726e2）、PART 2（80223ce3）、PART 3（e78a5d7a）、f7179b8f に入った記録、index.md の決定 (1)〜(9) と T9 の Safari の写しの項目を見た。作業ツリーにあってまだコミットしていないものも見た。`src/components/WordJoinerCopyFilter/` の部品と試験、`src/app/layout.tsx`、`src/lib/phrase-dashes.ts`、`src/tools/json-formatter/JsonFormatterTile.tsx`、`docs/knowledge/clipboard-and-copy.md`、`docs/knowledge/research-and-verification-techniques.md`、`frontend-design` スキル、DESIGN.md の 109 行の hunk である。照らしたものは、t5-design.md の T5-3b の行、review-t5-3b-done-1.md〜9.md、CLAUDE.md、`docs/anti-patterns/implementation.md`・`workflow.md` である。DESIGN.md の 213 行の hunk（T5-15）と、作業ツリーにあるほかのタスクの書きかけは見ていない。

## 判定: 承認

第9回の指摘 1・2 は直っている。受け手のコードの行は第8回から変わっていないので、第8回・第9回の動きの測りは今も成り立つ。検査はどれも通った。

コード・試験・知見の文書2つ・スキル・DESIGN.md の 109 行を読み直した。直すべき所は見つからなかった。コードと文書は食い違わず、書き足した跡も無い。

また、Chromium の外でもこの組み方が効くかを、Firefox 151 と WebKit 26.5（Playwright の Linux の版）で測った。どちらでも語結合子は写らず、文書と選択は元に戻った（下の「確かめたこと」）。

## 指摘

無し。

## 確かめたこと（問題なし）

**第9回の直し**:

- 箱が広がる話は、コードの説明（`removeWordJoinersFromCopy` の説明の3段落目）と `clipboard-and-copy.md` の 2 の3つ目の項の両方で、「最大でその分だけ広がることがある」になった。
- 根拠の段落は、広がった「小文字 (a-z)」の span と、同じページで変わらなかった「大文字 (A-Z)」の span（92.938px）を並べて書く。書き足した跡は無い。
- `MutationObserver` の項は「`MutationObserver` のコールバックは 2 回呼ばれた」と書く。
- 2 の冒頭の項は「Chromium の `Selection.toString()` は `user-select` を見ない」と、範囲を付けて書く。

**受け手の動きが第8回から変わっていないこと**: 第9回と同じ方法で確かめた。第8回のレビュアーのサブエージェントの記録（`agent-ab47c10e25a47342f.jsonl`）から、2026-09-29T03:17:20Z の `cat src/components/WordJoinerCopyFilter/index.tsx && git diff …` の出力を取り出した。その `index.tsx` の部分（254 行）を、いまの `index.tsx` と `diff` で比べた。

- 違うのは、`hideJoiners` の説明と `removeWordJoinersFromCopy` の説明の注釈の行だけだった。
- 注釈の行（`/**`・`*`・`*/`・`//` で始まる行）を両方から除いて比べると、同じだった。
- 同じ出力の `git diff` の部分（`layout.tsx`・`phrase-dashes.ts`・`JsonFormatterTile.tsx`）も、`index` の行を除いていまの差分と同じだった。
- 試験のファイルの更新の時刻は 02:51:37 で、第8回の `cat` より前である。

**書き出しと重ね**: HEAD（72bf6065）を scratchpad の自分のディレクトリ（`t53b-rev10-q8m3`）に `git archive` で書き出した。`node_modules` が無いのを確かめてから `cp -al` で置き、上の T5-3b の作業ツリーのファイルを重ねた。DESIGN.md は 109 行の hunk だけを当てた。重ねた8ファイルは、作業ツリーのものと `cmp` で同じだった。DESIGN.md の 109 行も同じで、213 行は HEAD のままだった。

**検査**: 次のものはどれも通った。

- `npm run generate:release-id` と `npm run build`。
- vitest の全体（`--maxWorkers=2`）: 395 ファイル・6423 件が通り、1 ファイル・1 件は前から skip。
- `tsc --noEmit`。
- コードの5ファイルの eslint。
- それらと、知見の文書2つ・スキル・DESIGN.md の prettier。

`npm run check:phrased-names`（失敗させずに出す指定）の `src/` の数は、字で渡すもの 114・値で渡すもの 56 で、index.md の記録と同じだった。数えた `.tsx` は 332 で、e78a5d7a の 331 より、新しい `WordJoinerCopyFilter/index.tsx` の1つだけ多い。

**見えない字のバイト**: U+00A0・U+00AD・U+200B〜U+200F・U+202A〜U+202E・U+2060〜U+206F・U+FEFF を perl で数えた。U+2060 を1つ入れた対照のファイルでは 1 と出た。

- 重ねた8ファイル・DESIGN.md・index.md・t5-design.md は、どれも 0 だった。
- PART 1〜3 が触った 70 ファイルでは、`src/play/games/kanji-kanaru/_components/GameContainer.tsx` の U+00A0 が1つだけ出た。これは T4-11 のもので、第8回・第9回と同じである。

**Firefox と WebKit での写し（本番のビルド、1280×900）**: Playwright 1.61.1 の Firefox 151.0 と WebKit 26.5 を、scratchpad の自分のディレクトリに入れた。サーバーは `next start -p 3961` で開いた。止めたのは、`$!` で記録した PID 29989 とその子孫（30002・30003）だけである。書き出しは消した。

記事 `nextjs-global-not-found-for-multiple-root-layouts` の h1 を写した。写した中身は、ページに足した貼り付け先へ Ctrl+V で貼って読んだ。WebKit の Linux の版では Ctrl+C でコピーの出来事が起きなかったので、`execCommand("copy")` で写した。受け手を止めた対照は、第8回と同じく、`document` に `copy` を登録する関数のうち `getSelection` を含むものだけを登録させずに作った。止めた数は、どの回も1つだった。

- Firefox で h1 を3度押して写すと、貼った文は 69 字で、語結合子は 0 個だった。text/html も 0 個で、`user-select` の字は入らなかった。止めると 73 字で、語結合子は 4 個だった。
- Firefox で余白を押して Ctrl+A し、写すと、12,176 字で語結合子は 0 個だった。止めると 12,180 字で 4 個だった。
- WebKit で h1 を3度押して写すと、70 字で語結合子は 0 個だった。止めると 74 字で 4 個だった。
- どちらのエンジンでも、`selectNodeContents(h1)` と、h1 の頭からリンクのある段落の終わりまでの選択を写した。貼った文は途中で切れず、語結合子は 0 個だった。
- 写したあと、h1 の `innerHTML` と選択の両端・`toString()` の字数は写す前と同じで、`user-select` の span は 0 個だった。ページの誤りも 0 だった。

これは、決定 (7)・(9) の組み方が、いまの Firefox と WebKit でも効くことを示す。ただし、Linux の WebKit は iOS の Safari そのものではなく、長押しのメニューから写す経路も通っていない。したがって、T9 の実機の確かめは要る。

**コードと試験を読み直した所**:

- 受け手は、既定の動きを止めず、字も除かない。触るのは、選んだ範囲にかかる、描かれる字の節だけである。入力欄と `defaultPrevented` は素通しにする。
- `src/lib/clipboard.ts` の代わりの写し方は、画面の外の `textarea` を選んで `execCommand("copy")` で写す。そのときの出来事の的は `textarea` なので、受け手は素通しにする。道具のコピーのボタンの中身は変わらない。
- `endAfterHiding` の位置の計算は、端が語結合子の上・前・後ろのどこにあっても、分けたあとの同じ字の位置に写る。
- 戻す仕事は `restored` で1回に限られ、React が描き替えた節の字を古い字で上書きしない。
- 試験は、見出し・段落まで・Ctrl+A・2回続けた写し・端の2つの置き方・置き直さない場合・範囲外・語結合子の無い選択・入力欄の3種・React の2つの時機・部品の付け外しを持つ。
- `src/` で `copy` を受けるのはこの部品だけで、`copyText` の呼び手は知見の文書の 1 に書いた4つ（`CopyButton`・`ShareButtons`・`FudaActions`・`InviteFriendButton`）である。

**文書を読み直した所**: 次のものは、コードとも互いとも食い違わず、書き足した跡も無い。

- `phrase-dashes.ts` の説明と `WORD_JOINER` の説明。
- 知見の文書2つ。
- スキルの 5 の項と `WORD_JOINER` の項。5 の「数字の前には置かない」は、正規表現の `(?=[^\s\d-])` と、Unicode の改行の規則の LB25（ハイフンと数字のあいだで折らない）に合う。
- DESIGN.md の 109 行。

**決定 (6)〜(9)**:

- (6) の受け入れは §4 に合う。
- (7) の目的（写した名前が見えない字で失敗しない）は、Chromium に加えて、Firefox 151 と WebKit 26.5 でも満たされている。
- (8) のドラッグの受け入れと VoiceOver の聞き取りは、index.md と T9 に入っている。
- (9) の形は、メニューでもキーでも CLS に入らない（第8回の測り。動きは変わっていない）。

**作業の進め方**:

- 直しは受け持ちのファイルに収まっている。
- T5-3b のコミットには、DESIGN.md の 109 行の hunk だけを入れる（213 行の hunk は T5-15）。
- 承認のコミットのメッセージでは、T5-3b の記録が f7179b8f に入ったことに触れる。
- 見えるものを変える変更ではないので、撮り比べはしていない（写すあいだの画面の枠は、第8回が CDP の screencast で確かめた）。

## PM への参考（指摘ではない）

このコンテナでも、`PLAYWRIGHT_BROWSERS_PATH=<自分のディレクトリ> npx playwright install firefox webkit` で、Firefox と WebKit を入れて動かせた（プロキシの下で、合わせて 588MB）。スキルの「このリポジトリの作業のコンテナには Chromium しか無い」（41 行。T5-3b の変更の外）と、T9 の Safari・Firefox の項目を決めるときの材料になる。測りのスクリプトは scratchpad の `t53b-rev10-q8m3/work/`（`xb.mjs`・`wk.mjs`・`snc.mjs`）にある。
