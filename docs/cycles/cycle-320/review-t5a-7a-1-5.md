# cycle-320 T5a-7a-1 のレビュー（第5回）

対象: 担当の木 `/home/user/yolo-web/.claude/worktrees/agent-aefcba1183a587114`、枝 `worktree-agent-aefcba1183a587114`（77469e7b）。`git diff design-rollout worktree-agent-aefcba1183a587114`（design-rollout は 591b02e9、枝のコミットは 77469e7b の1つだけ）。前回の記録 [review-t5a-7a-1-4.md](./review-t5a-7a-1-4.md) の軽の指摘1〜4 への対応を見て、あわせて report.mjs・README の `hitUnmatched` の段・t5a-measure.md の 0章と 10章・plan-t5a7.md 2 の「記録するもの」を読み直した。measure.mjs は変わっていない（blob `ff009a37` のまま。`git hash-object` で確かめた）。

数は担当の報告を写さず、自分で出し直した。design-rollout の report.mjs をスクラッチパッドに書き出し、新しい report.mjs と同じ記録の置き場で走らせて、1行ずつ JSON を比べた。サーバーは起こしていない。

## 確かめたこと（合っていたもの）

| 項目                                   | 結果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新旧の report の比べ                   | `tmp/cycle-320/t5a7a1-fix/` の `after`（6束）・`after-3`（1束）・`base`（3束）・`synthetic`（1束）、`review-t5a7a1-3/base`（1束）、`t5a7a1r/trial/after`・`trial/base`（18束ずつ）・`t5a7a1r/smoke`（8束）で、`flags.hitUnmatched` を除いた旧の行と、`hitUnmatched` を除いた新の行は、どの束も文字のうえで同じだった。旧の `flags.hitUnmatched` と新の `hitUnmatched` の和は、synthetic の 2 のほかはどれも 0 で合う。なお `t5a7a1r/trial` は置き場の根でなく `trial/after`・`trial/base` が置き場で、根で走らせると0行になる（担当の報告の「trial/after」はそれにあたる） |
| 種類の分け方（自分で作った合成の記録） | スクラッチパッドに、診断（music-personality）と知識クイズ（kanji-level）の答えの走査（`kind` が `answer`・`answer`・`next` の押しに `land` の最後の数 4・1・2）、`last`（診断 3・yoji-level 5）、`start`・`retry`・`select`（どれも 7）の記録を作って走らせた。`{"diagnosis-answer":4,"knowledge-answer":1,"next":2}`・`{"last-answer":3,"last-next":5}`・`{"start":7}`・`{"retry":7}`・`{"heading":7}` と出て、0 の種類は出ず、`flags` に `hitUnmatched` は残らない                                                                                                       |
| 種類の名と measure.mjs                 | report.mjs の `pressKindOf` が作る名は、measure.mjs が押しごとの記録に書く `kind`（`start`・`answer`／`next`・`last-next`／`last-answer`・`retry`・`heading`）と、`--op start\|answers\|last\|retry\|select` に合う。report.mjs の `KNOWLEDGE` は measure.mjs 50行の `KNOWLEDGE` と同じ3本で、measure.mjs の `SLUGS` の9本のうち知識クイズはこの3本だけ                                                                                                                                                                                                                    |
| `undefined` の出方                     | `{"undefined":2}` は、`kind` を持たない手で作った synthetic の押しでだけ出る。measure.mjs が書く押しごとの記録は、どの押しも `kind` を持ち（`compactPress` が `record.kind` を写す）、誤りで終わった回の置き物（`{i: null, error}`）は `land` を持たないので数に来ない。実の記録で `undefined` が出ることはなく、読む人を誤らせない                                                                                                                                                                                                                                        |
| 前回の指摘1（種類ごとに出す）          | 直った。README の段と report.mjs の注釈は同じ中身で、`diagnosis-answer` は必ず立ち、ほかの種類は 0 になるはずだと書き分けた                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 前回の指摘2（10-1 の `n`）             | 直った。`after` と `after-3` の 375×550 の 15 回を突き合わせ直し、落ちた先は 15 回とも、`n` の dx・dy はどの回も同じだった                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 前回の指摘3（10-2 の3点目）            | 直った。数を出し直して、押しごとの記録（10 押し）は `after` 6,400B・`after-3` 6,465B、要約は 3,312B・3,320B で、10-2 の値と合う。2つの置き場の頭の行の `tool.measure` は `0c9b7969` と `ff009a37`                                                                                                                                                                                                                                                                                                                                                                          |
| 前回の指摘4（記録するもの）            | 直った。plan-t5a7.md 2 の「記録するもの」は、同じ文書の 3 の PM の決定（「1打目の点から押せるもの（第1の組と次の問の選択肢）までの max(dx, dy)」）と同じ言い方になった。t5a-measure.md 0章の「着地の関数の記録」も、最も離せたときの値（第1の組と、両方の組の近いほう）を数えると書き、「判断での使い方」とつながる                                                                                                                                                                                                                                                        |
| ツギハギ                               | report.mjs の注釈は、`hitUnmatched` を `flags` の下から出力の欄として立て、`flags` の箇条から外した。README の段も「答えの走査では 0 にならないことがある」の古い言い方を残さず書き直されている。直しの跡は残っていない                                                                                                                                                                                                                                                                                                                                                    |
| lint と format                         | 担当の木で `npx eslint docs/cycles/cycle-320/measure/` は誤り・警告 0。`npx prettier --check` は measure/・t5a-measure.md・plan-t5a7.md で通る                                                                                                                                                                                                                                                                                                                                                                                                                             |

## 指摘

### 指摘1（軽）: 走査の要約の `n` の押しの着地は、合否の数（`at16`）に入るのに、置き換えの外れが数えられない

`hitUnmatched` は、走査では押しごとの記録に置いた押し（`keepReasons` が残す、第1の組に落ちた押し・知識クイズの「次へ」で次の問に落ちた押し・語が選ばれた押しなど）の `land` からしか数えない。一方で `at16` は、落ちなかったが 20px 以内だった押しを要約の `n` の着地の記録（`landingOut` の4つの数）から数え、そこには置き換えの外れの数が無い（measure.mjs の `summaryLine`）。罫線 1px に黙って戻る値が、まさに合否の数の材料の側で見えないまま残る。あわせて、`knowledge-answer` の 0 は知識クイズの答えのうち押しごとの記録に置かれたものだけの 0 で、答え全体の 0 ではない。`diagnosis-answer` も、期待する数（問の行の数）を report が出さないので、診断の答えでの本当の外れはその数に埋もれる（前回の指摘1 の、残る半分）。

measure.mjs を今直すと blob `ff009a37`（10-2 と after-3 の頭の行が指す）が変わり、道具は次のサイクルで要件を足して直すことになっているので、今は次の2つにする。

- README の段と report.mjs の注釈に、数えるのは押しごとの記録に置いた押しだけで、要約の `n` の押しは数えない（`at16` の `n` の押しの値は置き換えが外れても分からない）と書く。読む人が「0 なら外れていない」と全体に読み広げないようにするためである。
- carryover.md の「測りの道具」の足すものに、要約の `n` の着地の記録にも外れの数を持たせること、`diagnosis-answer` を期待する数との差で出せる形（行の数を着地の記録に持たせるなど）にすることを足す。

### 指摘2（軽）: report.mjs の `KNOWLEDGE` は measure.mjs の写しで、片方だけ直すと黙って食い違う

今は同じ3本で合っている。ただ、食い違っても report は誤りを出さず、知識クイズの答えを `diagnosis-answer` に数え（必ず立つ側に埋もれる）、`last` を `last-answer` に数えるだけになる。道具は `version.mjs` から `chunksDigest` を import する形をすでに持つので、本の組は1つの所（小さな共有のモジュール）に置いて両方が import するのがよい。measure.mjs を触ると blob が変わるので、指摘1 と同じく carryover.md の「測りの道具」の足すものに入れる（次に measure.mjs を直すときに一緒に移す）。

### 指摘3（軽）: 10-1 の「`n` の選択肢の名は … 回ごとに違う」は言い過ぎ

自分の突き合わせでは、15 回のうち 4 回は `n` が名まで丸ごと同じだった（11 回で名が違う）。「回によって違う」と書く。

## アンチパターンの照合

- AP-WF09・AP-WF14: 担当の言い分（新旧の和が合う、synthetic で `{"undefined":2}`）は写さず、新旧の report を自分で走らせて1行ずつ比べ、実の記録に無い種類は合成の記録を作って確かめた。`undefined` が実の記録で出ないことは measure.mjs の書き方まで追って確かめた。
- implementation.md（黙った逃げ道・写しの食い違い）: 指摘1 は数えない所が黙って残る件、指摘2 は2か所の同じ定数が黙ってずれうる件である。どちらも今の数を誤らせてはいない。
- planning.md・workflow.md: 前回の PM への項（指摘4）は plan-t5a7.md 3 の決定と同じ言い方になった。測りの道具の残りの要件は carryover.md に寄せる流れが決まっており、指摘1・2 もそこへ足せばよい。

## 結論

**改善指示**。前回の指摘1〜4 は直り、新旧の report はどの記録でも `hitUnmatched` のほかは同じで、種類の分け方も合成の記録で合った。残るのは軽の指摘1〜3 で、どれも文書の直し（README・report.mjs の注釈・carryover.md・t5a-measure.md 10-1）で済み、measure.mjs は触らない。builder に直させてから、全体の見直しを含めてもう一度レビューに出す。
