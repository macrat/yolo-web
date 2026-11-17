# cycle-320 の測りの道具のレビュー 第7回（HEAD 2511ce8f）

対象: `docs/cycles/cycle-320/measure/`（measure.mjs・records.mjs・report.mjs・compare.mjs・targets.mjs・version.mjs・README.md ほか）。要件は decision-landing.md の「直すもの」の「測りの道具」と「測りの合否（条件7・D5）」、carryover.md の「測りの道具」と「着地の直しの害の確かめ」、plan-t5a7.md 2b・3 の「タッチの調整の距離」、cycle-316/t5a-measure.md 0章、cycle-316/t5a-design.md 8章の5。PM の決め: B-620 の材料（`avoidable`・`at16`・`mayFall16`）には、押し方が `same` で、守りが受けた押し（`guardBand` が `accept`）だけを入れる。試しの走りの記録は主の木の `tmp/cycle-320/measure-trial-4/` にある。

**結論: 改善指示**（指摘1 で判定が変わる。PM の決めのとおりに組むと、`report.mjs` が「B-620 の材料」と呼ぶ数が、条件7 の束ではつくりの上でいつも 0 になる。試しの走りで守りをすり抜けて次の問に答えた2打目も、その数には出ない。指摘2・3 は軽い）

## 自分で確かめたこと

- **道具の版**: HEAD の `measure.mjs`・`version.mjs`・`knowledge.mjs`・`records.mjs` の blob（b6232408・72292f4c・d93ec11e・9e07695b）は、4つの置き場の頭の行の `tool` と同じだった。HEAD の `report.mjs` で4つの置き場を集計し直すと、`rerun-6/report-*.jsonl` とバイトで一致した。HEAD の `compare.mjs` の比べは、置き場の道の書き方（相対か絶対か）を除いて `rerun-5/compare.json` と一致した。`npx eslint` と `npx prettier --check` は `measure/` で通った。
- **記録が欠けていないか**（`tmp/cycle-320/review-measure-7/complete.mjs`）: どの置き場も 509 回のすべてに数える行がある。`heading` のほかのすべての押し（t5a4 は 2,929、after は 3,086）が `landing` と `sent` を持ち、`follow` もどれも着地と隔たりを持つ。`reaches` が無い押しは、t5a4 で3、t5a4-2 で5、after で1、after-2 で0 だった。どれも、2打目が着地のあとの最初のフレームより先に画面を替えた押しで、前回のレビューの見立てと合う。
- **合否の行の数え直し**（`recount.mjs`）: 決めの文から、landedOf を写して組み直した。after の `window`（start・next・result のタッチとマウス）・`pair`・`consecutive-mouse`（試した回 78・試さなかった回 122）・`touch-block`（39・121）・`touch-border`（22、働いた 20）・`touch-accept`（21・1）の試した回・外れ・試さなかった回は、report の行と合った。違ったのは2つで、どちらも読み方の違いであり、誤りではない。1つ目は `window|result|mouse` で、report は `d1` の走査の最後の答え 14 を `seen` に含める（指摘3）。2つ目は `d9` で、report は 100px 以内・650ms 未満の押しのすべてを試した回に数える（D9 の「件 0」はどの押しも数えるので、それで正しい）。
- **回を手でたどった**（`walk.mjs`）: after の music-personality のタッチ 500ms の最初の行。5つの2打目は、離しからの差が 501ms 前後、`detail` 1、`guardBand` が `accept` で、どれも次の問の選択肢に落ちて答えを入れた。`ck` は `[5, 4, 1, 0, 1]` で、問の数 10 と合う。character-personality のタッチ 220ms の最後の行は、after では 11 の2打目が次の問に落ちても働かなかった（`block`）。t5a4 では、6つとも次の問に答えた。
- **時刻の欄**（`gaps.mjs`）: どの組でも `releaseGap` は `downGap` より 0〜9ms 小さい。マウスの `detail`・`clickDetail` は、送った `clickCount` のとおり（同じ点は 2、`d1`・`read` は 1）だった。タッチの `detail` は 300ms までが 2、500ms が 1 である。
- **PM の決めがコードに入っているか**: `report.mjs` の `isMaterial` は、押しの `mode` が `same` で、`guardBand(guardAfter(kind), …)` が `accept` の押しだけを通す。`countTouch` の `mayFall16` と `countLanding`（`avoidable`・`at16`）は、どちらもこれを通る。`same` 以外の押し方の束に材料は無かった。決めのとおりに組まれている。
- サーバーとブラウザは起こしていない。数え直しのスクリプトと出力は `tmp/cycle-320/review-measure-7/` に置いた。

## 指摘

### 指摘1（判定を変える・要件と道具）: PM の決めのとおりに数えると、条件7 の束の B-620 の材料がいつも 0 になる。守りをすり抜けた2打目が材料に出ない

README の「B-620 の材料」と `report.mjs` の頭の注は、`mayFall16`・`avoidable`・`at16` を守りのあとの押しの B-620 の材料と呼んでいる。PM の決め（`same` かつ `accept`）と、前からある数え方を重ねると、条件7 の束（D5 でない束）では、この3つが次のとおり、つくりの上で 0 になる。

- **窓の守りの3つの切り替わり**: 条件7 の同じ点の2打目は 0〜500ms で送り、1打目から 0px なので、どれも `block` になる。材料に入る押しは無い。
- **診断の答え→次の問**: 材料に入るのは、タッチの離しから 320ms 以上の2打目（500ms の回）だけである。マウスの同じ点の押しは `detail` 2 で送るので、`accept` にならない。ところが、この2打目のうち次の問に落ちた押しは、`avoidable`・`at16` に入らない。答えの2打目が次の問に落ちた押しは押しごとの記録に置かず、`countLanding` は落ちた押しを押しごとの記録からしか数えないためである（README の「答えの2打目が次の問の選択肢に落ちた押しは…avoidable と at16 に入らない」）。落ちなかった押しが入りうるのは要約の `n`（0 より大きく 20 以下）だけで、試しの走りでは、診断の答えの `n` の押しは 0 だった（次の問の選択肢までは 0 か、第1の組までは 100）。

試しの走りの4つの置き場で、条件7 の束の `avoidable`・`at16`・`mayFall16` は、どの束でもすべて 0 だった（`tmp/cycle-320/review-measure-7/report-*.jsonl`）。一方、来訪者に起きる、守りで塞げない2打目は、次のように出ている（`material.mjs`・`pairs.mjs`）。

- after の診断の答え→次の問のタッチ 500ms（同じ点・`accept`）は 22 で、21 が次の問の選択肢に落ちて次の問に答えた。t5a4 も同じく 22 のうち 21 だった。どれも、着地のあとの1打目の点から次の問の選択肢までの max(dx, dy) が 0 である（`q` の `reaches`）。t5a-design.md 4-9 の「守りのあとの押し」が B-620 の材料の中心とする、連続と数えられない2打目である。report では、この数は `touch-accept` の試した回（合格の行）と、束の `groups.next` にしか出ない。`at16` の定義（落ちたか、16px より近い件。t5a-measure.md 0章の「判断での使い方」）には当たるのに、`at16` は 0 である。
- after の「はじめる」の同じ点の空振りでないことの対（900ms・同じ点）は、タッチ 10・マウス 10 で、20 回とも1問目の選択肢に落ちて答えを入れた（character-personality と music-personality）。t5a-design.md 4-9 が材料に挙げる「3つの切り替わりの 700ms 以上の2打目」が同じ点で起きた形で、6つの画面で走る。report では `pair` の行の合格としてしか出ない。窓のあとの材料には D5 の 900ms の行（`d5-after`、375×550 と 320×550、ずらした点）があり、plan-t5a7.md 3 の「タッチの調整の距離」もそこを指す。ただ、ほかの4つの画面の同じ点の件は、どの材料の欄にも入らない。

このままだと、t5a-measure.md に「B-620 の材料（落ちた件・落ちうる件）0」と写され、B-620 の判断（t5a-design.md 8章の5）が、残る来訪者の害を 0 と読み違える。1回解くあいだに 10 回前後通る診断の答え→次の問で、塞げない2打目が次の問の答えを入れる件が、まさにその数から抜ける。PM の決め（`same` かつ `accept`）そのものは筋が通っている。害は、決めと前からある数え方（落ちた答えの2打目を押しごとの記録に置かない・窓の同じ点の押しは窓の中でしか送らない）が重なって出る。

**直し方**（PM が決めてから builder に頼む）:

1. 診断の答え→次の問の材料の押し（`same` かつ `accept`）のうち次の問に落ちた押しを、`q` から `landedOf` で数え、`avoidable`・`at16` の `cases` に入れる。隔たりは `q` の `reaches` か `n` から取る。`far10`・`far16` は、着地の記録（`land` の farFirst・farBoth）を持つ押しだけで数え、持たない押しの数を別の欄（`farUnrecorded` など）に出す。これは `report.mjs` だけの直しで、記録は取り直さずに済む。`far16` まで要るなら、`measure.mjs` がこの押しの `land` を押しごとの記録か `q` に残すように直す。その場合は道具の blob が替わるので、試しの走りを取り直す。どちらにするかは、B-620 で「範囲の中で離せたか」を読むかどうかで PM が決める。答えのあとの着地は問のまとまりを避けないので（t5a-design.md 4-9）、数と隔たりだけでよいなら前者で足りる。
2. 窓の守りの3つの切り替わりの同じ点の窓のあとの件（`pair` の押しのうち `how` が `same` で、1打目から 750ms 以上で押せるものに落ちた押し）を、材料として切り替わりごと・画面ごとに数え、落ちた先と働いたかを出す。材料を D5 の `d5-after` だけにするなら、そう決めたことと、条件7 の束の材料の欄が窓の切り替わりでは 0 になることを、README・`report.mjs` の頭の注・t5a-measure.md 0章の「判断での使い方」に書く。
3. README の「B-620 の材料」の箇条と t5a-measure.md 0章の「判断での使い方」を、1・2 で決めた数え方に合わせる。t5a-design.md 8章の5 の「t5a-measure.md に写す数」が report のどの欄から写るのか（`detail1Next`・タッチの試さなかった回・`d5-answer`・`d5-after` と 1・2 の欄）を、README の「集計する」に一覧で書く。

### 指摘2（軽い・数え方）: 束の `noDown` の欄が、走査では 2打目の無い押しを数えない

`report.mjs` の頭の注は、`noDown` を「2打目の押し下げが無く、落ちた先が分からない押し」と書く。ところが走査（`answers`）では、`countTouch` を要約の `n` の押しにしか呼ばない。`n` の押しはどれも2打目の押し下げを持つので、`noDown` はいつも 0 になる。after の answers のタッチの `aim` 150・300・500ms の束は `groups.noDown` が 18 なのに、`noDown` は 0 である（`hold-aim` も `groups.noDown` 4 に対して 0）。1度の押しで終わる操作のマウスも、`countTouch` を呼ばないので 0 になる（last のマウスの `aim` は `groups.noDown` 2 に対して 0）。どちらの欄も合否と材料には入らないが、同じ名の2つの欄が違う数を出す。`noDown` の欄を `groups.noDown` に一本化するか、欄の意味（タッチの調整の数え直しに入らなかった押し）に合わせて名前と注を直す。指摘1 と同じ builder が直せば足りる。

### 指摘3（軽い・言い回し）: README の `window` の行は「条件7 の `same`・`aim`」と書くが、`d1` の走査の最後の答えも入る

`report.mjs` の `window` の行は、押し方で絞らない。`d1` の走査（`--modes d1`）の診断の最後の答え（`last-answer`）も、窓の守りの押しとして数える。after の `window|result|mouse` は `byMode` が `{"same":45,"d1":14,"aim":9}` である。窓の守りは `detail` によらず受けないのが決めなので、入れるのは正しい。そのため、README の `window` の行の「条件7 の `same`・`aim`」を、「窓の守りを掛けた切り替わりの押し（`hold` の押し方と D5 を除く）」のように、コードに合わせて直せば足りる。

## PM への指示

1. 指摘1 は、PM が直し方の 1・2 の数え方（`far16` まで要るか、窓の切り替わりの同じ点の窓のあとの件を材料に入れるか）を決め、その決めを README と t5a-measure.md 0章に書いたうえで、builder に `report.mjs`（要るなら `measure.mjs`）を直させる。指摘2 も同じ builder に頼む。指摘3 は README の言い回しなので、PM が直して閉じてよい（同じ builder に頼んでもよい）。
2. 直したあと、もう一度レビューを頼む。指摘だけでなく全体を見直してもらう。そのときは次の数を添える。after と t5a4 の診断の答え→次の問のタッチ 500ms の材料の数（落ちた 21 が入ること）、「はじめる」の同じ点の窓のあとの件の数（2 を選んだ場合）、`noDown` の数。`measure.mjs` を直した場合は、取り直した試しの走りの記録も添える。

**結論: 改善指示（要修正）**
