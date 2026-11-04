# cycle-320 の測りの道具のレビュー 第3回（HEAD 3fd8e518）

対象: `docs/cycles/cycle-320/measure/`（measure.mjs・records.mjs・report.mjs・compare.mjs・version.mjs・README.md ほか）。要件は decision-landing.md の「直すもの」の「測りの道具」と「測りの合否（条件7・D5）」、carryover.md の「測りの道具」と「着地の直しの害の確かめ」、plan-t5a7.md 2b。試しの走りの記録は主の木の `tmp/cycle-320/measure-trial-2/`（t5a4・t5a4-2 = 5ea1ab89、after・after-2 = dac2972e。375×550、character-personality・music-personality・kanji-level、種 `trial`）。

**結論: 改善指示**（指摘1 は来訪者に届くものの害の判定を変える道具の誤り。指摘2・3 は判定の材料と決まりを変える。指摘4〜6 は軽いもの）

## 自分で確かめたこと

- 4つの置き場の 36 のファイルの頭の行の道具の blob（measure 0dd2bb10・version 72292f4c・knowledge d93ec11e・records 818233c9）は、HEAD の blob と同じだった。木のハッシュ・`shape`（t5a4 は `row`、after は `hit`）・`guard`（false と true）・`seed`（`trial`）も合っていた。
- HEAD の `report.mjs` で4つの置き場を集計し直すと、`report-*.jsonl` とバイトで一致した。HEAD の `compare.mjs` で比べ直すと、`compare.json` とは置き場のパスの行のほかは一致した。
- `npx eslint docs/cycles/cycle-320/measure/` と `npx prettier --check`（measure・decision-landing.md・plan-t5a7.md）は通った。
- 着地の記録: after の `select` のほかのすべての押し（answers の答え 818・`last` 61 など）が `q` の `landing` を持っていた。2打目が切り替えた画面の `follow` は、after の answers で 169、answers-d5 で 118、start-d5 で 12 あり、どれも着地を持っていた。4つの置き場とも、`resultView` の `expected` は 341、`missing`・`spanMissing`・`hitUnmatched`・`hitUnrecorded`・`unresolved` は 0 だった。S の回（`ck` の3つ目が 1 以上）は t5a4 で 51、after で 27 あり、どれも `rv` を持っていた。前回の指摘1 は直っている。
- 手で数え直したもの（`tmp/cycle-320/review-measure-3/` のスクリプト）:
  - after の `start` のタッチの 27 回を回ごとに読んだ。`window|start|touch` の試した回 19（character-personality 8・music-personality 8・kanji-level の `aim` 3）、試さなかった回 5（kanji-level の `same` 5）、`byMode` の same 15・aim 9、`pair` の試した回 19（どれも 905〜1,257ms で答えが入った）は、`report-after.jsonl` と合った。
  - after の answers の診断の答えを、間隔・押し方・離しからの間隔の帯・落ちた先・働いたかで数え直した。`touch-block` 試した 39・試さない 121、`touch-accept` 試した 21・試さない 1、`touch-border` 23（働いた 18）、`consecutive-mouse` 試した 78・試さない 122、`detail1Next` の d1 300ms 21/21・500ms 21/21・read 22/22、`hold|answer` の試した 158・試さない 2（`hold` 80・`hold-aim` 80、`downAfter` 0）は、どれも報告と合った。
- 担当の報告との突き合わせ: after に `no-qualifying` の行は無く、`no-target` の行は `hold|result|touch`・`window|next`（タッチ・マウス）・`pair|next`（同）・`d5-inner|next|touch`・`keyboard-pointer|next`（タッチ・マウス）で、報告のとおりだった。`noTarget` の距離は、kanji-level の「次へ」のあとが 87.3〜162px、診断の結果の画面が 100.3〜389.5px で、どれも 80px を越えていた。`compare.json` の `newOut` 0・`timingUnstable` 13・線3 18 件・線8 5 件も報告のとおりだった。ただし、この4つの数と `guardChecked`・`border` は、下の指摘1 の誤りを含んだ値である。
- サーバーは起こしていない。記録を読み、数え直すスクリプトと、指摘1 を確かめるための `compare.mjs` の写し（`tmp/cycle-320/review-measure-3/dbg/`）だけを置いた。

## 指摘

### 指摘1（判定を変える・道具）: `compare.mjs` は、2打目が働いて画面を切り替えた押しを、すべて切り替わりの写しと取り違え、線1・5・7 と境目の帯と時間の揺れから落とす

`pressesOf` は、2打目が画面を切り替えた押しのすぐあとに、その切り替わりを別の押しとして並べ、印に `follow: true` を持たせる。ところが、もとの押しも `readPress` で `q` の `follow` の欄（切り替わりの配列）を持つ。どちらも真なので、`main` の `if (a.follow) { landingLines(...); continue; }` は、もとの押しも写しとして扱い、線3・8 だけを当てて次へ進む。同じ取り違えが `repeatDifferences` の `!press.follow`、`reachesOf` の `!press.follow`、`landingPointDiffers` と `landingLines` の `a.follow` にもある。

その結果、2打目が働いて画面を切り替えた押しは、次のものから外れる。

- **線1（新しく外れた回）**: 診断で2打目が次の問の選択肢に落ちて答えた押しは、見せる 150ms のあとにかならず画面を切り替えるので、すべて `follow` を持つ。線1 が見張るのは、まさにこの型（直した版で新しく次の問に答えた2打目）である。いまの道具では、この型は件にならない。証しとして、同じ版どうしの比べ（`compare-t5a4-vs-t5a4-2.json`）の `newOut` は 1 件（kanji-level の「はじめる」の hold）だった。取り違えを直した写しでは 2 件になり、music-personality のタッチの 150ms の答え（帯 8。2回目の走りで次の問に答えた）が加わる。t5a4 と after の比べでは、直しても `newOut` は 0 だった。ただし、0 になったのは今回たまたまで、道具が 0 を保証しているわけではない。
- **線5（守りが正しい押しを止めた回）の試した押しと下限**: 守りが受けて働いた押しが数に入らない。HEAD の `guardChecked` は、`touch-consecutive|answer|touch` が試した 0（`no-qualifying`）、`mouse-consecutive` が試した 0、`read|answer|touch`・`read|answer|mouse`・`shown|answer|touch` が `not-run`、`window-far|start|touch` が試した 2 だった。直した写しでは、それぞれ試した 21・42・22・22・44・4 で、どれも `tried` になる。報告の「試した押し 0 の組」は、道具の誤りで出たものである。守りが誤って止めた押しは働かず画面も替わらないので、`stopped` の件は今も見える。ただ、全体の測りで PM が見る下限の判定（`lowerOk`）は、誤った値になる。
- **時間で揺れる押し**: 1回目の走りで2打目が画面を切り替えた押しは、比べに入らない。揺れは、1回目で働かず2回目で働いた向きしか拾えない。`timingUnstable` は HEAD で 13 件、直した写しで 22 件だった。線1 の件に揺れの印を添える決め（plan-t5a7.md 2b）が、片方の向きでしか効かない。
- **境目の帯・線7・線2 と線4 の別**: タッチの 300ms の答えで働いた押しなどが `border` に出ない（HEAD 26 件、直した写しで 161 件）。線7 の `gained` も、この押しには当たらない。また、もとの押しは `shown` が `a.follow` で真になり、2打目の押し下げが切り替わりより前に来た押しも、2・4 の「着地の離れ」で読まれる。走査では、着地に使った点の比べも、1打目からのずれでなく点そのもので行われる。その影響で、線3 は HEAD の 18 件が、直した写しでは 14 件になる（4 件は帯の押しだった）。

**直し方**: 写しの押しに、`q` の欄と重ならない印（例: `synthetic: true`）を持たせる。`main`・`repeatDifferences`・`reachesOf`・`landingPointDiffers`・`landingLines` は、その印で写しかどうかを見分ける。`tmp/cycle-320/review-measure-3/dbg/compare.mjs` は、この形で直した写しで、上の数はこの写しで出した。直したあと、4つの置き場で比べ直す。そのうえで、同じ版どうしの比べで、2打目が次の問に答えた揺れの押しが線1 に出ることを、完了の条件に入れる。`compare.json` と担当の報告の数（`timingUnstable`・線3・`border`・`guardChecked`）は出し直す。

### 指摘2（判定を変える・道具）: 直した版にしか無い押しが外れた回かが、出力から読めない

plan-t5a7.md 2b は、片方の版にしか無い帯の押しを別に数え、件ごとに PM が見ると決めている。`unmatched` の件は、ファイル・回・帯・種類しか持たない。直した版の押しが外れた回（第1の組か次の問の選択肢に落ちて働いた押し）かどうかは、件から読めない。

今回の t5a4 と after の比べでは、直した版にしか無い押しが 156（答え 128・最後の答え 24 ほか）あり、`unmatched` は全体で 512 件だった（直した写しで 476 件）。守りがマウスの 300・500ms の2打目を止めると、走査が前の版より1つずつ多くの帯に寄るので、この押しは作りの上で多く出る。直した版にしか無い外れた回は、線1 に入らない。PM がこの外れた回を見つけるには、全体の測りの数千の件を、`tmp/` の回の記録と1つずつ突き合わせることになる。今回の 156 押しを数え直すと、外れた回は 0 だった。

**直し方**: `unmatched` の直した版の押しの件に、落ちた先（`landedOf` の組）・働いたことの字・外れた回か（`isOut`）を添える。外れた回は、線1 の一覧に `unmatched: true` を付けて入れるか、`unmatched` の中の外れた回を別の一覧に出す。どちらにしたかを README の `unmatched` と `lines` の箇条に書く。

### 指摘3（判定を変える・要件の文）: 害の線5 の下限に、守る的が無い組の扱いが無い

decision-landing.md の「下限」は、守る的が無い組だけでしか下限を満たせない行の合格を妨げないと決めている。`report.mjs` は、これを `no-target` で出す。plan-t5a7.md 2b の線5 の下限は、「届かなければ合格とせず PM に報告する」だけで、守る的が無い組に触れていない。`compare.mjs` の `guardChecked` にも、この扱いは無い。

線5 の `window-late` の組（空振りでないことの対の押し）は、窓の守りの行の試した2打目と同じ点を押すので、窓の守りの行が `no-target` の切り替わりでは、作りの上で試した押しが出ない。今回の `window-late|next|touch` と `window-late|next|mouse` は、どちらも試した 0 で `no-qualifying` だった（kanji-level の「次へ」のあとに 80px の中の押せるものが無い）。全体の測りでほかの本が埋めるかは、まだ分からない。埋まらなければ、来訪者の害が起こりえない組のために、PM が「合格としない」に戻ることになる。

**直し方の向き**: planner が plan-t5a7.md 2b の線5 の下限に、decision-landing.md の「守る的が無い組」の扱いを当てるか（当てるなら、どの組に当てるか）を書く。道具（builder）はそれに合わせ、`guardChecked` に組ごとの守る的の証しと `no-target` の様子を出す。

### 指摘4（軽い・道具）: `report.mjs` は、状態が読めなかった押し（`worked` が null）を、どの行にも数えずに捨てる

`verdictsOf` は、`worked === null` の押しを `see` の前に `continue` で飛ばす。そのため、その押しはどの行の `seen`・`untried` にも出ない。今回の4つの置き場には、そうした押しは無かった（12,463 押しのうち 0）。それでも、出れば黙って消える。数だけでも `first-blocked` と同じように出しておけば、PM が欠けに気づける。

### 指摘5（軽い・要件の文の読み方）: `d5-inner` の下限は、80px のずれの試した回が 0 でも満たされる

前回の指摘2 の直しで、`d5-inner` に基本のずれ（10・20px）が入った。decision-landing.md の「空振りでないことの対」の段落は、「D5 の 80px・120px … の試した回の下限は、上の『下限』のとおり」と書く。80px の行に下限を掛けるのか、80px 以下の行（基本のずれを含む）に掛けるのかは、文から一通りに読めない。いまの `lowerOk` は後の読み方をしている。今回は、`byShift` に start の 80px が 3、result の 80px が 4 あった。PM がどちらの読み方にするかを決め、決めた読み方を README の `d5-inner` の箇条に書けば足りる。

### 指摘6（軽い・見通し）: 比べの出力が、全体の害の確かめでは 1MB を越える見込みがある

3本 × 1画面の走りで、`compare.json` は 262KB だった。そのうち多くは `unmatched`・`unstable`・`landingPointDiffers` の件の一覧である。害の確かめの範囲が、これより本や画面の多い走りになるなら、比べの出力は 1MB を越える見込みが高い。道具は越えれば知らせるので、ふるまいは決めどおりである。ただ、置き方の決め直し（carryover.md）を前もって PM が見込んでおくとよい。

## 前回の指摘の直り

前回の指摘1〜7 の道具の側は、記録と符号で直っているのを確かめた。

- 指摘1: `follow` と `waitShownSwitch` で、S の `rv`・`re`・`lo` と X・S の着地が取れ、`missing` は 0 になった。
- 指摘2: `d5-inner` に基本のずれが入り、`byShift` が出る。下限の読み方は指摘5 に書いた。
- 指摘3: `hold-aim` が入った。hold の行は見せる間がある2つの切り替わりに限られ、`no-target` が出る。
- 指摘4: 押しごとの `mode` が入り、hold の回の知識クイズの答えは `same` になった。
- 指摘5: `timingUnstable` が出るようになった。ただし、指摘1 で片方の向きしか拾えていない。
- 指摘6: `landingPointDiffers` の印と `sameInputBefore` が入った。
- 指摘7: `version.mjs` は主の木の根に書き出す。

## PM への指示

1. 指摘1・2・4 の道具の直しを builder に頼む。指摘3 は、planner が plan-t5a7.md 2b を直したあとに、道具の側を builder が合わせる。指摘5 は、PM が読み方を決め、README の文を直して閉じる。指摘6 は、PM の見込みに入れる。
2. 直したあと、もう一度レビューを頼む。前回の指摘だけでなく、全体を見直す。`compare.mjs` だけの直しなら、道具の blob（measure・version・knowledge・records）は替わらないので、`tmp/cycle-320/measure-trial-2/` の記録はそのまま比べ直しに使える。比べ直した `compare*.json` を添えて頼む。

**結論: 改善指示（要修正）**
