# cycle-320 の測りの道具のレビュー 第5回（HEAD 3d91fe86）

対象: `docs/cycles/cycle-320/measure/`（measure.mjs・records.mjs・report.mjs・compare.mjs・targets.mjs・version.mjs・README.md ほか）。要件は decision-landing.md の「直すもの」の「測りの道具」と「測りの合否（条件7・D5）」、carryover.md の「測りの道具」と「着地の直しの害の確かめ」、plan-t5a7.md 2b。試しの走りの記録は主の木の `tmp/cycle-320/measure-trial-4/`（t5a4・t5a4-2 = 5ea1ab89、after・after-2 = dac2972e。375×550、character-personality・music-personality・kanji-level、種 `trial`）。

**結論: 改善指示**（指摘1・2 は、害の確かめの比べ（compare.mjs）が、来訪者への害の件を黙って線から外しうる誤り。指摘2 は plan-t5a7.md 2b の文そのものにも当たる。指摘3・4 は軽いもの）

## 自分で確かめたこと

- 4つの置き場の頭の行の道具の blob（measure b6232408・version 72292f4c・knowledge d93ec11e・records 9e07695b）は、HEAD の blob と同じだった。`shape`（t5a4 は `row`、after は `hit`）・`guard`（false・true）・`seed`（`trial`）・`landing`（true）・木のハッシュ・`chunksDigest` も、README の版の表と合っていた。`run-*.log` は4つとも9つの操作がどれも終わりの値 0 だった。
- HEAD の `report.mjs` で4つの置き場を集計し直すと、`report-*.jsonl` とバイトで一致した。HEAD の `compare.mjs` で t5a4 と after を比べ直すと（`--before-repeat`・`--after-repeat` つき）、`compare.json` と置き場のパスの欄のほかは一致した。`npx eslint docs/cycles/cycle-320/measure/` と `npx prettier --check docs/cycles/cycle-320/measure/` は通った。
- 担当の報告の確かめ: 4つの置き場とも、`follow-missing` の `missing`・`resultView` の `missing`・`spanMissing`・`first-blocked`・`worked-unread`・`hitUnmatched`・`hitUnrecorded`・`unresolved`・`errors` は 0 だった。after と after-2 で `no-qualifying` の行は無く、`pass` が false なのは `touch-block` と `touch-accept`（`missingSlugs` は走りに無い診断10本）だけだった。報告のとおりである。
- 手で数え直したもの（`tmp/cycle-320/review-measure-5/recount.mjs`。report.mjs を使わず、決定の文から組んだ数え方）: after の `touch-block` 試した 39（character-personality 22・music-personality 17）・試さなかった 121、`touch-accept` 試した 21（12・9）・試さなかった 1、`hold|answer` 試した 158・試さなかった 2、`hold|result` は試した 0・試さなかった 12・的が無く送らなかった 12、`window|result|touch` 試した 9・試さなかった 44・送らなかった 6、`pair|result|touch` 試した 12（試した2打目の対 9 と nearest の対 3）・試さなかった 3、`consecutive-mouse` 試した 78・試さなかった 122、`window|next` は試した 0・試さなかった 90・送らなかった 54、`pair|next` は nearest の対 54 がすべて試して働いた。after-2 と t5a4 も同じ数え方で、どれも report の行と合った（t5a4 は守りが無いので `touch-block` 22/22・`hold|answer` 86/86・`consecutive-mouse` 42/42・`window|result` 9/9 が外れ）。
- `follow` の欠け: 2打目が `s` を持つ押しを操作・種類ごとに数えると、`follow` の無いものは知識クイズ（kanji-level）の「はじめる」の2打目が1問目に答えた押し（帯が替わらないので切り替わりの記録を持たないのが正しい）と、知識クイズの「次へ」の1件だけだった。診断の押しの欠けは 0 で、前回の指摘2 は直っている。
- 着地の記録: `select` のほかのすべての押しが `q` の `landing` と `sent` を持っていた（after の answers 815・last 61・start 105 など）。`follow` はどれも着地を持っていた。押しの1つ（`start-375x550.jsonl` の character-personality のタッチの 300ms）を、押しごとの記録（`d1`・`d2`・`st`・`land`・`fr`）と要約の `q`・`n`・`l` で突き合わせ、間隔・組・働いたこと・着地・`l` が合っていた。
- 守る的が無い組: nearest の対は、守る的が無い組で 900ms のあとにいちばん近い押せるものの中心を押していた（kanji-level の「次へ」54・music-personality の結果 6 は押して働き、character-personality の結果 6 は 375×550 の画面に押せるものが無く押さなかった）。前回の指摘1 の当て方（受ける側の行に当てない）は、report.mjs の `TARGET_ROWS` と compare.mjs の `guardChecked` の両方で決めどおりだった。
- 比べの線: `compare.json` の線は `newOut` 1（music-personality のマウス 150ms の d1、帯 7。直した版の2回で揺れる押しとして `timingUnstable` つき）・`outsideSpan` 15（music-personality の帯 8 の、範囲 [3, 188]・選んだ着地 0 の型。`chooseTouchClearLanding` は基準が 0 で 0 が離れていれば範囲の外でも 0 を返す。前の版でも同じ型で `outsideSpanSame` 54）・`newMarks` 5・ほか 0 だった。道具の数え方としては決めどおりで、件の判定は比べの記録のレビューで行う。
- サーバーとブラウザは起こしていない。記録を読み直し、数え直しと比べ直しのスクリプトと出力だけを `tmp/cycle-320/review-measure-5/` に置いた。

## 指摘

### 指摘1（判定を変える・道具）: 同じ版の2回目に無い押しを、着地の線 2・4・8 から外している

plan-t5a7.md 2b は、2・4・8 の比べから外す押しを「同じ版を同じ種で2回走らせて送りが違う押し」と決めている。ところが `compare.mjs` の `repeatDifferences` は、1回目の置き場の押しのうち2回目の置き場に同じ id の押しが無いものも、送りが違った押しと同じ鍵の集まり（`landing`）に入れる。そのため、それらの押しも 2・4・8 から外れる。README の `unstable` の箇条も同じことを書き、plan-t5a7.md 2b を出どころとしているが、2b はそう決めていない。

2回目に押しが無いのは、着地が揺れたからではない。走査の道が時間で分かれたからである。タッチの 300ms の診断の答えは、離しからの差が 280〜320ms の境目に入る。そのため、ある回では2打目が次の問に答え（X）、別の回では答えず、そこから先の帯の並びが2回でずれる。今回の記録では、直した版の2回目に無い押しが 122 あり、そのうち前の版と組になった押しが約 99 あった（answers の 300ms の答え 12・切り替わりの写し 6、answers-d5 の 300ms の答え 44・写し 37）。どれも、前の版と組になっているのに、2・4・8 を読まれていない。写しは、受けた2打目が答えて切り替えたあとの着地である。来訪者がそのあと読む画面の印（線8）と離れ（線2）を見る所が、まさにここで黙って外れる。

今回の走りでは、2回目を渡さずに比べ直しても線の件は同じだった（`tmp/cycle-320/review-measure-5/compare-norepeat.json`）。そのため、今回の判定は変わらない。しかし全体の測りの比べ（15本 × 6画面）では、こうした押しが数百から数千になる。そこで直した版の着地に新しい印が出ても、件に出ない。plan-t5a7.md 2b が時間で揺れる押しを線1 から外さない理由として書く「揺れで外すと、直した版で新しく出た外れを隠しうる」は、ここにも当たる。

**直し方**: builder が、`repeatDifferences` の `landing` の鍵の集まりには、2回の両方に押しがあり送りか着地が違った押しだけを入れるよう直す。2回目に無い押しは `unstable` の `missing` に出したまま、線 2・4・8 に残す。件に印（例: `repeatMissing: true`）を添えれば、PM は件ごとに見分けられる。README の `unstable` の箇条も、ふるまいに合わせて書き直す。

### 指摘2（判定を変える・要件の文と道具）: 境目の帯の押しの、その押し自身の着地を着地の線から外す。帯は前の版の押しでも決まる

plan-t5a7.md 2b は「帯に入った押しだけをどの線の件にも数えず」とし、`compare.mjs` は帯の押しを着地の線（2・3・4・8）にも入れない。一方、同じ 2b と README は、帯の押しが切り替えた画面の写しを着地の線に入れる。理由は「着地の線が見るのは A″ のふるまいで守りの帯と関わらない。件が増える向きで害を隠さない」である。

押しの `q` の `landing`・`sent`・`reaches`・`marks` は、1打目が起こした切り替わりの着地である。2打目が帯に入ったかとは関わらない。300ms のタッチの答えは、2打目が来る前に、見せる 150ms のあとの切り替わりと着地を済ませている。そのため、着地の点もどちらの版も1打目の click である。写しを入れる理由は、帯の押しの自分の着地にもそのまま当たる。それなのに、帯の押しの自分の着地は線から外れている。

今回の比べでは、帯の押しは 157（どれも診断のタッチの 300ms 前後の答え）あった。その自分の着地を線3 の決まりで読むと、範囲の外の着地が 3 あり、そのうち 2 は前の版の同じ押しと同じ着地でなかった（`tmp/cycle-320/review-measure-5/border-lines.mjs`。どちらも music-personality の帯 8 の [3, 188]・0 の型で、1 は前の版に組の押しが無い）。今回は既に出ている型なので、判定は変わらない。全体の測りでは、診断のタッチの 300ms の答えの着地がすべて着地の線から抜ける。

あわせて、道具は帯を `bandBefore === "border" || bandAfter === "border"` で決めて `continue` している。そのため、直した版で `accept` か `block` の押しでも、前の版の同じ押しが帯に入れば、直した版だけで決まる線（3・5・8）から外れる。線5 は「直した版で、守りが受けると決めた押しが働かなかった押し」なので、たとえば前の版の離しが 300ms で帯、直した版が 325ms で `accept` の押しが守りに止められても、件に出ない。今回の記録では、この形の押しは 0 だった。ただ、離しの差が 300ms の前後で揺れる組（タッチの 300ms の答えと D5 の 300ms）では起きうる。

**直し方**: planner が plan-t5a7.md 2b の「境目の帯」を直す。帯の押しを外すのは、守りの判定で決まる線（1・5。7 も入れるかを決める）に限る。着地の線（2・3・4・8）には、帯の押しの自分の着地も写しと同じ理由で入れる。直した版だけで決まる線（3・5・8）では、帯を直した版の押しだけで決める。そのあと builder が `compare.mjs` の帯の扱いと README の「比べる」の段落（`border` の箇条と写しの文）を合わせる。

### 指摘3（軽い・README の文と道具の分け方）: 押しごとの記録の `kind` は、走査では最後の答えと最後の「次へ」を `answer`・`next` と書く

README の「押しごとの記録」は、`kind` を `start`・`answer`・`next`・`last-answer`・`last-next`・`retry`・`heading` と書く。しかし `compactPress` は `record.kind` を書き、`q` は `record.expectKind` を書く。そのため、走査（answers）の押しごとの記録では、最後の「次へ」が `next`（after で 34）、知識クイズの答えが `answer` になる。`q` の `kind` は `last-next`・`knowledge-answer` で正しい。report.mjs の `hitUnmatched` は押しごとの記録の `kind` で種類を決めるので、走査の最後の「次へ」の着地の外れは `next` に入る。種類の名が変わるだけで、外れの数そのもの（どれも 0 のはず）と合否は変わらない。診断の最後の答えも `diagnosis-answer` に入るが、結果の画面には問の選択肢の行が無いので、引く数は 0 で数は変わらない。押しごとの記録の `kind` を `expectKind` にそろえるか、README に走査での書き方を書けば足りる。指摘1・2 と同じ builder に頼めばよい。

### 指摘4（軽い・道具の出力）: `reaches` の無い押しは、線2 と分布から黙って抜ける

`compare.mjs` は `shown && rb && ra` のときだけ線2 と `reachFirst`・`reachNext` の分布を読み、`reaches` の無い押しはどこにも数えない。今回は、after の answers に 1（music-personality のマウス 150ms の d1、帯 7。線1 の件の押し）、t5a4 の answers に 1、start に 2（t5a4-2 は 4）あった。どれも、2打目が1打目の着地のあとの最初のフレームより先に画面を替えた押しで、1打目だけの画面は塗られていない。来訪者が見なかった着地なので、線2 で見る害は無く、判定は変わらない。ただ、黙って抜けるので、全体の測りで別の理由の欠けが混ざっても見分けられない。読めなかった押しの数を出力に出す（`resultView` の `missing` と同じく）か、README にこの抜け方を書けば足りる。

### 参考（直しを求めない）

`touch-block`・`touch-accept` の診断12本ごとの下限には、守る的が無い組の扱いが本ごとには掛からない（行のすべての組が守る的の無い組のときだけ `no-target`）。診断の答えのあとは次の問の選択肢が点の近くに並ぶので、本ごとに守る的が無くなることはまず無い。起きても合格にしない向きで、PM に報告されるので、来訪者への害を隠さない。

## PM への指示

1. 指摘2 は、planner に plan-t5a7.md 2b の「境目の帯」を直させる。そのあと builder に `compare.mjs` と README を合わせさせる。
2. 指摘1 は、builder に `compare.mjs` と README を直させる。指摘3・4 も同じ builder に頼む（指摘3 で `measure.mjs` を書き換えると道具の blob が替わるので、そうするなら試しの走りを両方の版で、同じ版の2回を含めて取り直させる。README の書き直しだけで閉じるなら取り直しは要らない）。
3. 直したあと、もう一度レビューを頼む。前回の指摘だけでなく、全体を見直す。比べ直した `compare*.json` と、帯の押しと2回目に無い押しが線に入ったことを示す数を添えて頼む。

**結論: 改善指示（要修正）**
