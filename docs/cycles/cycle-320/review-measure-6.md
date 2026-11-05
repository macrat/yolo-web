# cycle-320 の測りの道具のレビュー 第6回（HEAD d4c3ea8f）

対象: `docs/cycles/cycle-320/measure/`（measure.mjs・records.mjs・report.mjs・compare.mjs・targets.mjs・version.mjs・README.md ほか）。要件は decision-landing.md の「直すもの」の「測りの道具」と「測りの合否（条件7・D5）」、carryover.md の「測りの道具」と「着地の直しの害の確かめ」、plan-t5a7.md 2b。試しの走りの記録は主の木の `tmp/cycle-320/measure-trial-4/`（t5a4・t5a4-2 = 5ea1ab89、after・after-2 = dac2972e。375x550、character-personality・music-personality・kanji-level、種 `trial`）。

**結論: 改善指示**（指摘1・2 は、`report.mjs` の束の数（条件7 の表と B-620 の材料の出どころ）が、2打目の落ちた先を決めの読み方と違う形で数えたものと、押し方の違う押しを混ぜたものになっている誤り。来訪者への害を数え違える。指摘3・4 は軽い）

## 自分で確かめたこと

- 記録の頭の行の道具の blob（measure b6232408・version 72292f4c・knowledge d93ec11e・records 9e07695b）は HEAD と同じで、3d91fe86 から HEAD までに変わったのは compare.mjs・README・plan-t5a7.md だけだった。記録を取ったあとに測りの道具は変わっていない。
- HEAD の `report.mjs` で t5a4 と after を集計し直すと、`report-*.jsonl` とバイトで一致した。HEAD の `compare.mjs` で比べ直すと、`rerun-5/compare.json` とバイトで一致した。`npx eslint` と `npx prettier --check` は `measure/` で通った。
- 着地の記録の欠け（`tmp/cycle-320/review-measure-6/check1.mjs`）: 4つの置き場のすべての数える行の押しで、`select` の `heading` のほかは `landing`・`sent` があり、`follow` はどれも着地と隔たりを持っていた。`reaches` が無いのは、t5a4 の answers の1件・start の2件（t5a4-2 は4件）と after の answers の1件だけで、どれも2打目が1打目の着地のあとの最初のフレームより先に画面を替えた押しだった。`compare.json` の `reachMissing` 2 は、そのうち組になった押しの数と合う。両方の版で着地の記録は欠けずに取れている。
- 回を手でたどった（`walk.mjs`）: after の answers の character-personality のタッチ 220ms・300ms・500ms の最初の行か最後の行と、music-personality のマウス 300ms。220ms は離しからの差 220〜226ms で、11 の2打目が次の問の選択肢に落ちてどれも働かなかった（受けない側の試した回）。300ms は差 299〜303ms で境目、500ms は `detail` 1・差 500ms で6つとも次の問に答えた（受ける側）。マウス 300ms は `detail` 2 で9つが次の問に落ちて働かなかった。`ck` もこの読みと合った。
- 合否の行を数え直した（`tb.mjs`）: after の `touch-block` は試した 39（character-personality 22・music-personality 17。どれも 220ms の回）・試さなかった 121、`touch-border` は 22 で働いた 20、`touch-accept` は試した 21・試さなかった 1 で、report の行と合った。
- 比べの線: 帯の押し 157 の着地が線3 に入り、`outsideSpan` が前回の 15 から 17 に、`outsideSpanSame` が 54 から 55 になった（前回のレビューが `border-lines.mjs` で見つけた3件のうち2件と1件）。after のすべての押しと写しのうち範囲の外に着いたものは 72 で、`outsideSpan` と `outsideSpanSame` の合計 72 と合う（`check2.mjs`）。2回目に無い押しは、`unstable` の 248 件がどれも `missing` で、送りが違った押しは 0 だったので、2・4・8 から外れた押しは無い。`repeatMissing` は `outsideSpan` の3件に付いていた。指摘1・2 の直しは決めどおりに入っている。
- サーバーとブラウザは起こしていない。数え直しのスクリプトと出力は `tmp/cycle-320/review-measure-6/` に置いた。

## 指摘

### 指摘1（判定を変える・道具）: 束の落ちた先の数が、押し下げの的で数えている。押し下げが切り替わりの前で click が新しい画面に届いた2打目では、決めの読み方と違う

decision-landing.md の「測りの道具」と「試した回」は、押し下げが切り替わりの前で `click` が切り替わったあとの画面に届いた2打目の落ちた先を、`click` の的で決めると定めている。`records.mjs` の `landedOf` はそのとおりで、合否の行と比べの線はこれを使う。

ところが、1度の押しで終わる操作の要約の `s` と、走査の要約の `c` と、押しごとの記録の `grp` は、いつも2打目の `pointerdown` の的で書かれる。`report.mjs` は束の数をこれから出す。`groups`（条件7 の表の落ちた先）・`avoidable`・`at16`・`mayFall16`・`fellFar10` がこれにあたる。そのため、こうした押しは切り替わる前の画面の的（`start`・`text`・`choice`）に数えられる（`tmp/cycle-320/review-measure-6/cvsl.mjs`）。

- t5a4 の「はじめる」のタッチ 0ms は6回あった。`landedOf` では5回が1問目の選択肢に落ち、そのうち5回が1問目に答えた（`worked` が `s`）。それなのに束の `groups` は `{"next":2,"start":4}` である。music-personality の `same` は「はじめる」に落ちたと数えられているが、実際は1問目に答えていた（`start0.mjs`）。これは試しの走りで見つけた型 (1) の害そのものである。基準の版は押しごとの記録を置かないので、条件7 の表の基準の版の数でこの害が小さく出る。plan-t5a7.md 4 の「cycle-319 から渡った件（『はじめる』の2打目が落ちる4本）」もここから写すので、同じく小さく出る。
- 診断の答えの hold・hold-aim・hold-out の2打目（0・90ms）は、`landedOf` では次の問の選択肢に落ちている。その数は after で 202、t5a4 で 130 あり、t5a4 ではどれも次の問に答えていた。それでも `c` では `text`・`choice` に数えられ、束の `groups` には次の問への落ちとして出ない。

**直し方**: builder が `report.mjs` の束の数を、`q` から `landedOf` で決めた落ちた先で数えるよう直す。`groups`、`countTouch`・`countLanding` に渡す落ちた先、走査の `n` の押しと押しごとの記録の `grp` がこれにあたる。押しは `q` の `i` で引けば足りる。`q` は記録にすでにあるので、`measure.mjs` を変えずに直せ、記録を取り直さずに済む。README の `s`・`c`・`n` の落ちた先の欄にも、要約の欄は押し下げの的の記録であり、落ちた先は `landedOf` で読むことを書き、`report.mjs` の頭の注と合わせる。

### 指摘2（判定を変える・道具）: 束が2打目の押し方を分けず、狙った2打目・hold・d1 を同じ点の二度押しと混ぜて数える

`report.mjs` の束は、ファイル・入力・間隔・ずれの4つで分かれる。回の名の最後の欄の押し方（`same`・`aim`・`hold`・`hold-aim`・`hold-out`・`d1`）では分けない。この押し方は、このサイクルの決め直しで足したものである。そのため、条件7 の間隔ごとの数に、狙った2打目（押せるものを的にして押す）と、hold・d1・hold-out（守りを試すために置いた押し）が混ざる（`modes.mjs`）。

- after の「はじめる」のタッチ 150・300・500ms は、どれも `groups` が `next` 5 である。そのうち3は、1問目の選択肢を的にした `aim` の押しである。同じ点の押しで落ちたのは 2 だった。
- answers のマウス 300ms と 500ms は `next` 60 で、そのうち 21 は `d1` の押し（守りが受ける押しで、働くのが決めどおり）である。
- `fellFar10`（README と t5a-measure.md 0章は「つくりの上で 0 になり、出たときは前提が崩れた印なので PM に報告する」としている）は、試しの走りで 0 でなかった。after では、last のタッチ 150・300・500ms で1ずつ、start のタッチ 150・300・500ms で1ずつ出た。t5a4 でも last で3つ出た。どれも kanji-level の `aim` の押しで、的に押したので、1打目の点から 10px 以上離れた押せるものの上に落ちている。前提は崩れていないのに、報告すべき印が出る。全体の測りでは、本ごと・画面ごとにこれが重なり、本当の印と見分けられない。
- `avoidable`・`at16` は、t5a-measure.md 0章で、守りのあとの押しの B-620 の材料と決めている。しかしここにも `aim` の押しが「落ちた件」として入る。after の start のタッチ 150ms では、`avoidable.next` が cases 5・far16 1 で、そのうち3は `aim` である。さらに直した版では、窓の中で守りが止めた同じ点の押しも同じ欄に入る。そのため、守りのあとの押しの材料として読めない。
- `flags`（`cut` など）と `resultView` も、同じ回の着地を押し方の数だけ重ねて数える。

**直し方**: builder が、`report.mjs` の束の鍵に押し方（回の名の最後の欄）を足す。条件7 の表に写す数を同じ点の押しで読めるようにし、`aim`・`hold` などの押しの数は別の束に出す。B-620 の材料は「守りのあとの押し」なので、`avoidable`・`at16` に入れる押しを、直した版では守りの帯（`guardBand` が `accept` の押し）に限るかどうかも決める。限らないなら、README と t5a-measure.md 0章の「判断での使い方」に、どの押しが入るかを書く。直すのは `report.mjs` と README だけで、記録は取り直さずに済む。

### 指摘3（軽い・道具の注）: `report.mjs` の頭の注の `at16` の段に、もう無い合否が書かれている

`report.mjs` の 26 行目は「plan-t5a7.md 3 の『避けられたのに落ちた件』の合否は、この落ちうる件の far16 で判定する」と書く。plan-t5a7.md 3 にその合否は無く、t5a-measure.md 0章は「この2つの値は、条件7 の合否には使わない」としている。この注のとおりに `far16` を合否と読むと、指摘2 の `aim` の押しが外れに見える。指摘1・2 と同じ builder が、t5a-measure.md 0章の使い方に合わせて書き直せば足りる。

### 指摘4（軽い・文の食い違い）: 道具の1打目が止められた押しを外す線が、plan と道具で違う

plan-t5a7.md 2b は、道具の1打目が守りに止められた押しを「1〜4 の比べから外す」と書く。一方 `compare.mjs` と README の `firstBlocked` は、その押し自身をどの線からも外し（線8 と線7 を含む）、写しだけを着地の線に入れる。1打目が働かなかった押しの `landing` は、その押しが起こした切り替わりのものではない。そのため、道具の扱いのほうが筋は通る。また `first-blocked` は 0 のはずで、0 でなければ PM に報告される。そのため、来訪者への害を隠さない。plan の文か README の文のどちらかを、もう一方に合わせれば足りる。

## PM への指示

1. 指摘1・2 は、builder に `report.mjs` と README を直させる。指摘3 も同じ builder に頼む。`measure.mjs` を変えずに直せば、試しの走りを取り直す必要はない。取り直しが要るかどうかは、道具の blob（measure・version・knowledge・records）が替わるかで決める。直したあと、4つの置き場を集計し直した `report-*.jsonl` を添える。
2. 指摘4 は、plan-t5a7.md 2b か README の文の言い回しをそろえる。どちらの文を直すかは PM が決め、直して閉じる。
3. 直したあと、もう一度レビューを頼む。指摘だけでなく全体を見直す。そのとき、after と t5a4 の「はじめる」のタッチ 0ms と hold の押しの落ちた先が束で `landedOf` と合うこと、押し方ごとの束の数、`fellFar10` が同じ点の押しで 0 になることを示す数を添える。

**結論: 改善指示（要修正）**
