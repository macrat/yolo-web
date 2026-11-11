# cycle-320 の測りの道具のレビュー 第9回（HEAD cd2a0041）

対象: `docs/cycles/cycle-320/measure/`（measure.mjs・records.mjs・report.mjs・compare.mjs・targets.mjs・version.mjs・README.md ほか）と、cycle-316/t5a-measure.md 0章。要件は decision-landing.md の「直すもの」の「測りの道具」と「測りの合否（条件7・D5）」、carryover.md の「測りの道具」と「着地の直しの害の確かめ」、plan-t5a7.md 2b と 4（条件7 の診断の答えのマウスの `d1`）、t5a-measure.md 0章（「B-620 の材料と写す数」を含む）。plan-t5a7.md 3 の見積もりは対象から外した。記録は主の木の `tmp/cycle-320/measure-trial-4/`（前の measure.mjs の blob b6232408 で取ったもの）と `tmp/cycle-320/measure-trial-5/`（今の blob d744736c で取った短い走り）。

**結論: 承認**（判定を変える指摘は無い。下の指摘1〜3 は言い回し・写し方・記録で、PM が直して閉じる）

## 自分で確かめたこと

- **今の measure.mjs の変更**: `git diff c75a6b8c HEAD -- measure.mjs` は、`timingsOf` で、診断の答えの走査（`op` が `answers` で知識クイズでない本）のマウスに、どの間隔にも `d1` を足す所を、`--modes` で渡したときだけにする条件から外しただけである。押しの組み方・`clickCount` 1 の送り方・送り直しの扱い（`SINGLE_CLICK_MODES`）は変わっていない。最後の `filter` は残っており、`--modes read,hold-out` などを渡したときは `same`・`d1` を走らせない（害の確かめの組の例どおり）。`--modes` を渡さない条件7 の走りでは `same` と `d1` が両方走る。基準の版でも同じに走るので、2つの版で `d1` の束が比べられる。`npx prettier --check`（`measure/`・t5a-measure.md・plan-t5a7.md）と `node --check measure.mjs` は通った。
- **d1 が既定で入るか**（trial-5）: `tmp/cycle-320/measure-trial-5/after/answers-375x550.jsonl` の頭の行の `tool.measure` は HEAD の blob d744736c で、`--modes` 無しの走り（music-personality・マウス・300ms・最初の行と最後の行）に `same` の2回と `d1` の2回がある。`d1` の押しは、どれも `detail`・`clickDetail` が 1、`downGap` 295.5〜303.1ms、2打目が次の問の選択肢に落ちて答えを入れた（`worked` が `s`）。5-2 の確かめ `ck` は `[5,4,1,0,1]` と `[6,4,0,0,1]` で問の数 10 と合う。最初の行の `d1` は、9問目の2打目が10問目に答えて結果へ切り替わったので、最後の答えの押しが無い（`window` の `byMode.d1` が 1 なのはこのため）。記録の欠け（自前の `complete.mjs` で数え直し）は、4行すべてが数える行、誤り 0、`np` と `q` の長さが合い、見出しのほかの押しはどれも `landing`・`sent`・`reaches` を持つ。サーバー（pgid 21277）はもう動いていない。
- **合否の行と束**（trial-5）: `consecutive-mouse` は `seen` 28（`same` の答え 18 と `d1` の答え 10）、`tried` 17（`same` で次の問に落ちた押し）、`untried` 1（`same` で字に落ちた最後の行の9問目）、外れ 0。`detail1Next` は `{"d1":{"300":{"next":9,"worked":9}}}` で、`d1` の束の `material` の `cases` 9・`answered` 9 と同じである。`landedOf` を使わずに `q` から数え直しても（review-measure-8 の `material.mjs`）9・9 で、残りの1つは字に落ちた押しだった。前回の指摘1 で求めた、条件7 の置き場に `d1` の束が出て `detail1Next` が空にならないことは満たされた。
- **trial-4 の集計し直し**: HEAD の `report.mjs`（15fe21c3）で4つの置き場を集計し直した（`tmp/cycle-320/review-measure-9/report-*.jsonl`）。after の結果は `measure-trial-5/report-trial4-after.jsonl` とバイトで一致した。`rerun-7/` との差は、4つの置き場のどれも `d5-next` の行が足されたことだけである。`material` は自前の数え直しとすべての束で一致した（after は、タッチの 300ms 20・500ms 21、マウスの `d1` の 150ms 1・300ms 21・500ms 21、D5 の 300ms がずれごとに 19〜21）。
- **`d5-next`（前回の指摘2）**: 4つの置き場のどれでも、間隔とずれの 24 の組のすべてで、`answers-d5` の `same` の束の `groups.next ＋ marked.next` が `d5-answer` の `next` と `d5-next` の `next` の和と一致した。after の 300ms・0:−120 の `d5-next` の `next` 1 は、前回のレビューで見つけた知識クイズの「次へ」の1件である。300ms・0:−80 の `runs` が 17 なのは、最後の行の1問目の答えの2打目が「次へ」を押して2問目へ進み、1問目の「次へ」の押しが無かったためで（知識クイズの答えは守りを掛けず、80px のずれの答えは合否に入れない決めのとおり）、記録の欠けではない。
- **文の突き合わせ**: README の「測る」の表の `answers` の範囲に「診断のマウスの `d1`」が入り、「2打目の押し方」の段落は `d1` を条件7 の範囲の押し方と書き、「害の確かめの組」は `read`・`hold-out` だけを挙げる。README の「B-620 の材料」の段落、合否の行の `consecutive-mouse`・`d5-answer`・`d5-next` の説明、t5a-measure.md 0章の写す数の一覧、plan-t5a7.md 4 の `d1` の箇条、t5a-design.md 8章の5 の写す数は、互いに食い違わない。carryover.md の害の確かめの足す組の「マウスの `detail` 1 の2打目」は、既定で走るので足す操作が要らなくなっただけで、走る押しは同じである。compare.mjs は前回から変わっておらず（41ffb62e）、`d1` を線1 と連続の押しの守りの押しに入れている。
- 道具とサーバーは起こしていない（変更が押しの組の条件だけで、trial-5 の記録と trial-4 の `d1` の束で足りたため）。

## 指摘

### 指摘1（軽い・言い回し）: README の extra の答えの組の段落が、比べる版を 5ea1ab89 と書く

README の「測る」の extra を持つ3本の答えの組の箇条は、「2つの版で問と配点は同じ」の証しに `git diff 2db1c7d9 5ea1ab89 -- src/play/quiz/data src/play/quiz/scoring.ts` を挙げる。条件7・D5 で比べる2つの版は `base`（2db1c7d9）と `after`（dac2972e）である。`git diff 2db1c7d9 dac2972e` も `git diff 5ea1ab89 dac2972e` も、この道では空だったので、答えの組の作り方は正しい。証しのコマンドを dac2972e に替え、害の確かめで比べる 5ea1ab89 とも同じことを添える。

### 指摘2（軽い・写し方）: 300ms のタッチの `material` は守りの境目の上にあり、写すときに分けて読む

守りの `TOUCH_CONSECUTIVE_MS` は 300ms で、条件7 のタッチの 300ms の走査と D5 の診断の答えの 300ms の走査は、離しからの間隔がちょうどその境目（298〜303ms）に来る。そのため、この束の `material` の `cases` と、守りに止められた押しの数の分かれ方は、間隔の 1〜2ms の揺れで決まる（after の D5 の 300ms・0:−10 では、次の問に落ちた 21 のうち 19 が `material` で、2 は 300ms 未満で止められた）。条件7 では、同じ押しが `touch-border` の帯（280〜320ms）に入ることが合否の行で分かるが、t5a-measure.md 0章の「B-620 の材料と写す数」の2つ目（タッチの `same` の束の `material`）と4つ目（D5 の `answers-d5` の `material`）は、その束が境目の上の値であることを書いていない。写す一覧の2つ目と4つ目に、「300ms の束は守りの境目の上の値で、守りが受けた押しと止めた押しの分かれは間隔の揺れで決まる。来訪者の頻度としては 500ms の束（と D5 の `d5-answer` の `next`）とあわせて読む」の旨を添える。数そのものは正しく出ているので、軽いものとする。

### 指摘3（軽い・サイクルの記録）: t5a-measure.md の2つの「状態」と 10章の「いまの道具」

- 0章の頭の「**状態**: … まだ持たない。それを足してレビューを通すまで、条件7・D5 の測りに使わない」は、このレビューで道具が通ったので、通った blob（measure.mjs d744736c・report.mjs 15fe21c3・compare.mjs 41ffb62e・records.mjs 9e07695b・version.mjs 72292f4c・knowledge.mjs d93ec11e）とこのレビューを指す形に書き替える。次は害の確かめの走りであること（carryover.md の T5a-7 の順）も添える。
- 10章の「いまの道具（blob `6a4f271b`。report.mjs は blob `77697d82`）」と「**いまの道具の1行の大きさと比**」は、書いた時の blob の話で、今の道具は d744736c である。10章は害の確かめの走りから出し直すので残してよいが、「いまの」を「blob `6a4f271b` の」などに替え、今の道具の話と読めないようにする。

## PM への指示

1. 指摘1〜3 は言い回し・写し方・記録なので、PM が直して閉じる。もう一度のレビューは要らない。
2. 道具は、carryover.md の T5a-7 の順のとおり、着地の直しの害の確かめの走り（5ea1ab89 と dac2972e、既定の組に `--modes read,hold-out` の組を足す）に使ってよい。その走りの記録が主の木の `tmp/` に残っているうちに、比べの出力と plan-t5a7.md 3 の見積もりの出し直しのレビューを頼む。

**結論: 承認**
