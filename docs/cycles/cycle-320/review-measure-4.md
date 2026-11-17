# cycle-320 の測りの道具のレビュー 第4回（HEAD ed765dbe）

対象: `docs/cycles/cycle-320/measure/`（measure.mjs・records.mjs・report.mjs・compare.mjs・targets.mjs・version.mjs・README.md ほか）。要件は decision-landing.md の「直すもの」の「測りの道具」と「測りの合否（条件7・D5）」、carryover.md の「測りの道具」と「着地の直しの害の確かめ」、plan-t5a7.md 2b。試しの走りの記録は主の木の `tmp/cycle-320/measure-trial-2/`（t5a4・t5a4-2 = 5ea1ab89、after・after-2 = dac2972e。375×550、character-personality・music-personality・kanji-level、種 `trial`）と、HEAD の report.mjs・compare.mjs で出し直した `rerun-3/`。

**結論: 改善指示**（指摘1 は、要件の文と道具が、守りが受けるべき押しの行と組の合否を誤って「合格」にしうる誤り。指摘2 は、記録が黙って欠ける道具の誤り。指摘3・4 は軽いもの）

## 自分で確かめたこと

- 4つの置き場の頭の行の道具の blob（measure 0dd2bb10・version 72292f4c・knowledge d93ec11e・records 818233c9）は、HEAD の blob と同じだった。`shape`（t5a4 は `row`、after は `hit`）・`guard`（false・true）・`seed`（`trial`）・`landing`（true）も合っていた。measure.mjs は targets.mjs を import していないので、targets.mjs が blob の外にあるのは決めどおりである。
- HEAD の `report.mjs` で4つの置き場を集計し直すと、`rerun-3/report-*.jsonl` とバイトで一致した。HEAD の `compare.mjs` で t5a4 と after を比べ直すと、`rerun-3/compare.json` と、置き場のパスの欄のほかは一致した。
- `npx eslint docs/cycles/cycle-320/measure/` と `npx prettier --check`（measure・decision-landing.md・plan-t5a7.md・carryover.md）は通った。
- 前回の指摘の直り:
  - 指摘1（写しの取り違え）: 直っている。`compare-t5a4-vs-t5a4-2.json` の `newOut` は 2 件（music-personality のタッチの 150ms の答え、帯 8 と、kanji-level の「はじめる」の hold）で、`--before-repeat`・`--after-repeat` を渡した比べでは、どちらの件にも2回の結果の `timingUnstable` が付いた。t5a4 と after の比べで、`timingUnstable` は 22、`border` は 161、線3 は 14 で、前回の写しで出した数と同じだった。
  - 指摘2（直した版だけの外れ）: 直っている。`unmatched` の直した版の押しの件は `group`・`worked`・`out` を持ち、`unmatchedOut` は 0 だった。直した版だけの押しを数え直すと、答えの 126（どれも次の問の選択肢に落ちて働かなかった）・最後の答え 28・答え 2 で、働いた押しは 0 だった。
  - 指摘3（守る的が無い組）: 道具は決めどおりに組んである（`targets.mjs`）。ただし、その決めそのものの当て方に誤りがある（下の指摘1）。組ごとの証しが回によって食い違わないか（同じ組で的のある証しと無い証しが混ざらないか）を after の 140 の組で確かめ、食い違いは 0 だった。
  - 指摘4（`worked-unread`）・指摘5（`d5-inner` の 80px の下限）: 直っている。`d5-inner|start|touch` の `byShift` は 10px 8・20px 4・80px 3 で、下限は 80px の 3 で満たしている。
  - 指摘6（1MB を越えたときの分け方）: 直っている。`FILE_LIMIT` を 100KB にした写し（`tmp/cycle-320/review-measure-4/split/`）で分けると、操作ごとの 9 つのファイルに分かれた。件の一覧の数の和は、分けない出力と同じだった。
- 手で数え直したもの（`tmp/cycle-320/review-measure-4/scripts/`）: after の `d5-outer|start|touch` の試した回 4（どれも働いた）・試さなかった回 5、`window|result|mouse` の試した回 9・試さなかった回 59・外れ 0・`byMode` の same 45・d1 14・aim 9、`keyboard-pointer` の6つの行の試した回と試さなかった回、`guardChecked` の `mouse-consecutive|answer|mouse`（d1 の 300・500ms で試した回 21 と 21、0・90・150ms の 120 と、字に落ちた 2 が試さなかった回）と `touch-consecutive|answer|touch`（500ms で試した回 21・試さなかった回 1）。どれも出力と合った。
- サーバーとブラウザは起こしていない。記録を読み、数え直すスクリプトと、分け方を確かめる compare.mjs の写しだけを `tmp/cycle-320/review-measure-4/` に置いた。

## 指摘

### 指摘1（判定を変える・要件の文と道具）: 「守る的が無い組」（80px 以下に押せるものが無い組）を、守りが受けるべき押し（120px のずれ・見せる間の 120px の外の押し）の行と組にも当て、試していない行を合格にしうる

decision-landing.md の「下限」は、守る的が無い組を、1打目の点から 80px 以下に押せるものが無い組と決め、その組だけでしか下限を満たせない行の合格を妨げないとする。理由は「二度押しの2打目がどの押せるものにも届かず、来訪者の害が起きない」である。この理由が通るのは、守りが受けない側の行（窓の守りの `window`・`pair`、`hold`、`d5-inner` など）だけである。ここでの害は、80px の中の2打目が押せるものに届いて働くことで、80px の中に押せるものが無ければ起こりえない。

守りが受けるべき押しの行と組は、120px 離れた所を押す。`d5-outer`（report.mjs）と、害の線5 の `window-far`・`shown`（compare.mjs の `guardChecked`）がこれにあたる。ここで見張る害は、守りが 120px の外の正しい押しを止めることである。80px の中に押せるものが無くても、120px の所には押せるものがありうる。そのため、守る的が無い組だからといって、来訪者の害が起こりえないとは言えない。それでも、decision-landing.md の「下限」と plan-t5a7.md 2b の線5 の下限は、どの行と組にもこの扱いを当てている。道具（`report.mjs` の `status`・`pass` と、`compare.mjs` の `guardChecked` の `status`）も、行と組を分けずに当てている。

今回の記録に、その証しがある。

- after の `d5-outer|next|touch` は、組 18 がすべて守る的が無い組（kanji-level の「次へ」のあと。いちばん近い押せるものまで 87.3〜135px）だった。それでも試した回が 1 あった（`answers-d5-375x550.jsonl` の `kanji-level|touch|300|0:-120|last|same` の押し 1。次の問の選択肢に落ちて答えが入った）。その1回が字に落ちていれば、行は `no-target` で `pass: true` になっていた。kanji-level の「次へ」のあとには、120px のずれが届く 87〜135px の所に選択肢があるのに、受ける側を1回も試さずに合格になる。`guardChecked` の `window-far|next|touch` も同じで、組 18 がすべて `noTarget` で、試した押しは同じ1回だけだった。
- `shown|result|touch` は、組 2 がどちらも守る的が無い組（いちばん近い押せるものまで 256px・184px）だった。それでも、music-personality の hold-out の2回は、下見で 220px の「LINEでシェア」を選んで試していた（`aim` が `["button:LINEでシェア",220]`）。music-personality が走りに無ければ、組は `no-target` になる。そうなると、見せる間に押し下げて結果の画面のボタンで離す正しい押しを、1回も試さずに合格とすることになる。

全体の測りでは15本・6画面のすべてに受ける側の行が掛かる。押しの点がたまたま字や余白に落ちた行は、試した回が 0 のまま `no-target` の合格になりうる。そうなると、守りが正しい押しを止める害（来訪者の押しが黙って効かない）が見えなくなる。

**直し方の向き**: planner が、decision-landing.md の「下限」と plan-t5a7.md 2b の線5 の下限で、80px の守る的が無い組の扱いを当てる行と組を、守りが受けない側の行と、試す押しが 80px の的で決まる行と組（`window`・`pair`・`window-late`・`hold`・`d5-inner`・`keyboard-pointer` など）に限る。受ける側の行と組（`d5-outer`・`window-far`・`shown`）については、扱いを当てない（試した回が無ければ PM に報告する）か、受ける押しの的が無いことの別の証しで決めるかを書く。後者なら、たとえば hold-out の下見が 120px 以上離れた押せるものを見つけなかったこと（`q` の `aim` の `[null, …]`）や、ずらした点の近くに押せるものが無いことが証しになる。道具（builder）はそれに合わせ、report.mjs と compare.mjs の `status` と `pass` を、行と組の側で分けて決める。`touch-accept`・`touch-consecutive`・`read` をどちらに入れるかも、planner が書く。

### 指摘2（判定を変える・道具の記録の欠け）: 2打目が次の問に答えて切り替えた押しの `follow` が、黙って欠けることがある

t5a4 の `answers-375x550.jsonl` の `music-personality|mouse|300|0:0|first|d1` の押し 2（帯 5）は、2打目（`downGap` 301.1ms、d1）が次の問に答え（`worked` が `s`、`click` が `["next",6,"playing",1]`、要約の `ck` の X に数えられている）、そのあと画面が帯 7 へ切り替わっている（次の押し 3 は帯 7）。それなのに、`q` の `follow` が `null` だった。同じ回の t5a4-2 の押し 2 は `follow` を持っていた。4つの置き場の診断の答えと「はじめる」で、2打目が画面を替えた押し（字に `s`）を数えると、`follow` の欠けは t5a4 で 505 のうち 1、t5a4-2・after・after-2 で 0 だった。

`doublePress` は、記録の時点の状態がまだ答えを見せているとき（`shown.answered`）だけ `waitShownSwitch` で切り替わりのフレームを待つ。2打目を 300ms 前後で押すと、見せる 150ms のあとの切り替わりが、記録の時点（1打目から 450ms）とほぼ同じ時に来る。記録の時点の状態がすでに次の問に替わっていると、待たずに記録を閉じ、切り替わりのフレームが押しの記録に入らないまま `follow` が欠けた、と見られる（前の版の記録は押しごとの記録を置かないので、フレームでは確かめられなかった）。

欠けると、その切り替わりの写しが比べに出ない。

- 前の版で欠けたとき: 直した版の写しは片方にしか無い押しとして `unmatched` に入り、ほかの作りの上の片方だけの押し（今回は 37）と見分けがつかない。線2・4 は読めない。
- 直した版で欠けたとき: その切り替わりの着地に、線3（見せる範囲の外の着地）と線8（読む所の印）が掛からず、その件が黙って出ない。

結果への切り替わりには `resultView` の `missing` があるが、次の問への切り替わりの欠けを数えるものは、report.mjs にも compare.mjs にも無い。`repeatDifferences` は1回目の置き場の押しだけを回るので、2回目にしか無い写しは `unstable` の `missing` にも出ない。carryover.md の道具のレビューの完了の条件（両方の版で数本を走らせ、着地の記録が欠けずに取れること）は、今回の記録で満たされていない。

**直し方**: builder が `doublePress` を直す。2打目が答えた画面から切り替わったあとの最初のフレームを待つかは、記録の時点の状態だけで決めない（例: 2打目の `click` が切り替わったあとの画面の選択肢に届き、1打目だけの画面から先へ進んだ押しは、記録の時点の状態がすでに切り替わっていても、切り替わりのフレームがその押しの記録に入るまで待つ）。あわせて、report.mjs に、2打目が画面を替えたのに `follow` の無い押しの数を出す行（`resultView` の `missing` と同じく、0 のはずで、0 でなければ PM に報告する）を足す。compare.mjs の `repeatDifferences` は、2回目にしか無い押しも `unstable` に出す。measure.mjs が替わると道具の blob が替わるので、`tmp/` の試しの走りは両方の版で取り直し、欠けが 0 であることを確かめる（同じ版の2回を含める）。

### 指摘3（軽い・道具の出力と README の文）: 直した版にしか無い境目の帯の押しと、1打目が止められた押しは、`unmatched` に入らず、片方だけの印も持たない

`compare.mjs` の `main` は、`firstTook` が 0 の押しと境目の帯の押しを、組になったかを見る前に `continue` する。そのため、直した版にしか無いそれらの押しは `unmatched` に入らない。今回は、境目の帯の押しのうち 42（`border` の `downGap` の前の版の側が `null` のもの）がそれにあたる。`border` の件は片方だけかの印を持たず、前の版の押しがあって2打目を送らなかった押しと見分けられない。README の `unmatched` の箇条は、「直した版にしか無い押し（切り替わりの写しと、帯の押しと道具の1打目が止められた押しを除く）の件は、…を持つ」と書いている。この書き方では、それらの押しも `unmatched` に入るように読める。どちらも線には入らない押しなので、判定は変わらない。`border` と `firstBlocked` の件に片方だけの印（`unmatched: true`）を添え、README の文をふるまいに合わせる。指摘2 の直しと一緒に builder に頼めば足りる。

### 指摘4（軽い・README の文）: 境目の帯の押しの切り替わりの写しは、着地の線（2・3・4・8）に入る

plan-t5a7.md 2b は「帯に入った押しだけをどの線の件にも数えず」とする。一方、`main` は写しを境目の帯の見分けより先に `landingLines` に渡す。そのため、境目の帯の押し（タッチの 300ms の答えなど）が切り替えた画面の着地は、線2・3・4・8 に入る。着地の線が見るのは A″ のふるまいで、守りの帯とは関わらない。件が増える向きなので、害は隠れない。どちらを決めとするかを PM が決め、README の写しの箇条（「比べる」の段落）に書けば足りる。

## PM への指示

1. 指摘1 は、planner に decision-landing.md の「下限」と plan-t5a7.md 2b の線5 の下限を直させ、そのあと builder に report.mjs・compare.mjs と README を合わせさせる。
2. 指摘2 は、builder に measure.mjs・report.mjs・compare.mjs と README を直させる。指摘3 も同じ builder に頼む。measure.mjs の blob が替わるので、両方の版（5ea1ab89 と dac2972e）で、同じ版の2回を含めて試しの走りを取り直させる。
3. 指摘4 は、PM が決めて README を直して閉じる（builder に指摘2 と一緒に書かせてもよい）。
4. 直したあと、もう一度レビューを頼む。前回の指摘だけでなく、全体を見直す。取り直した記録の置き場と、比べ直した `compare*.json` を添えて頼む。

**結論: 改善指示（要修正）**
