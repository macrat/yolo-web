# T5a-7a-1 の道具のレビュー 第16回

対象: 担当の木 `.claude/worktrees/agent-a98793f663f2cdd15`、枝 `worktree-agent-a98793f663f2cdd15`（HEAD c8a97b96）。`git diff design-rollout...worktree-agent-a98793f663f2cdd15` の6ファイル（measure.mjs・report.mjs・measure/README.md・plan-t5a7.md 3・4・t5a-measure.md 0章と10章・carryover.md）を白紙で読み、c8a97b96 の差（前回の指摘1・2 の直し）を別に読んだ。report.mjs は全文、measure.mjs は差の全体と、それが呼ぶ所・呼ばれる所（`pressRecord`・`keepReasons`・`leaveOf`・`followLeave`・`measureAnswers`・`measureLast` の終わり・`summaryLine`・`main`）を読んだ。照らした決まりは constitution.md、CLAUDE.md、`.claude/rules/`、t5a-design.md 6章 条件7、plan-t5a7.md 3〜5、index.md の作業内容 2・3 と補足事項、`docs/anti-patterns/implementation.md`・planning.md・workflow.md。サーバーは起こさず、tmp/cycle-320/t5a7a1-fix/ の base-16・after-16（と after-15・base-15 ほか）の記録を枝の report.mjs で集計し直した。

**結論: 改善指示**（指摘 2件。1 は来訪者に届く欠けを次の判断に渡す形の欠け）

## 自分で確かめたこと

- **道具の blob**: 枝の measure.mjs は `5d5e5c31`、report.mjs は `4af28f9e`。base-16・after-16 の頭の行の `tool.measure` は `5d5e5c31`、`landing` は基準の版で false、変更後の版で true。t5a-measure.md 10章の「状態」と 10-2 の blob の記述と合う。Prettier（`--check`）と ESLint は変えたファイルで通る。
- **`vp` と `expected` の定義**: `vp` は `outcome.leave.at`（`doublePress` の押しの番号）と同じ `record.i` の押しから取り、`record.last`（`band === total`）と、種類が診断なら `answer`・知識クイズなら `next` のときだけ `last-<種類>` にする。走査の離れ方を一つずつ当てた。(a) 診断の最後の答えの2打目が結果のリンクか「もう一度挑戦する」に落ちる → `last-answer` で `expected` に入る。(b) 知識クイズの最後の「次へ」の2打目が結果のリンクか「もう一度挑戦する」に落ちる → `last-next` で入る。(c) 知識クイズの最後の問の答え（`last` だが種類が `answer`）や途中の押しで離れる → 結果に切り替わらないので入らない。(d) 途中の答えの2打目が最後の問に答えを入れて（S）結果に切り替わる → 離れないので `!line.v` で入り、`toResult` はその押しの `rv` を持つ。どの形でも定義は正しい。1度の押しの操作（`last`）は押しの種類を `last-next`・`last-answer` とし、`report.mjs` はどの回も `expected` に入れるので、走査と食い違わない。`retry` の記録（after-11・after-13・base-8・base-11・base-13）に `rv` は無く、`resultView` に余分な回は入らない。
- **記録の値**: 枝の report.mjs で集計すると、base-16 の 375×800 の走査は、タッチの 90・300ms で `left` 6 ずつ、マウスで 3 ずつの計 18 走査が離れ、どれも `vp` が `[10, "last-next"]` で `rv` を持ち、4つの束のどれも `expected` 6・`missing` 0・`lowInSpan` 0。after-16 は kotowaza-level のタッチの最後の行の 90・300ms の 2 走査が離れ（`vp` `[10, "last-next"]`、`rv` `[140, 215]`・`[126, 201]`、`re` 0）、どの束も `expected` 6・`missing` 0・`spanEmpty` 0・`lowInSpan` 0。t5a-measure.md 10-2 の最後から3つ目の箇条の値と合う。
- **合否の数が変わらないこと**: after-16 の 375×550 の「はじめる」のタッチ 90ms は `at16.next` が cases 15・far10 11・far16 10、`avoidable.next` が cases 10・far10 6・far16 5、`hitUnmatched` は空で `hitUnrecorded` 0。base-16 は 0。押しごとの記録は 6,431B（10 押し）、要約は 3,472B で、10-2 の「直した道具での記録の大きさ」の値と合う。
- **前回の指摘の直し**: 指摘1（離れた走査の数え）は上のとおり直った。指摘2(a) の plan-t5a7.md 3 の重みの文は「「もう一度挑戦する」は 0.97 を 1.0 に切り上げた」になり、2(b) の 10-2 の「はじめる」は「163〜164B」になった。
- **文書どうし**: `expected` の定義（README の `resultView` の段落・report.mjs の頭の注・plan-t5a7.md 4 の「条件7」）、`vp` の欄（README の「走査の欄」）、上限（1MB・4MB・15MB）、`--landing`、続きとチャンクの受け入れの文は、plan-t5a7.md 3・4、README、carryover.md、t5a-measure.md 0章・10章、index.md の作業内容 3 で食い違っていない（index.md は主の木と枝で同じ）。続きとチャンクの受け入れの論理（`checkFingerprint`・`openViewportFiles`・`beginViewportFile`）は c8a97b96 で変わっておらず、第14回・第15回で確かめたとおり。

## 指摘

1. **after-16 で見えた、結果の画面での離れを、来訪者に届く欠けとして次の判断に渡していない（直す）**。after-16 の kotowaza-level・375×800・タッチ・最後の行の 90・300ms の2走査では、変更後の版で最後の「次へ」の2打目が、結果の画面のおすすめのリンク（`/play/yoji-level`）にタッチの調整で寄せられ（1打目の点 y 763・749 に対して2打目の `click` は y 772・758）、ページを離れた。来訪者は、全問を解いた直後に結果を読めないまま別のクイズへ移される。押しごとの記録の着地の記録は、範囲が `[0, 230]`・`[0, 216]` で空ではないのに、`farFirst`・`farBoth` がどちらも 9.3px で、範囲のどこへ送ってもリンクから 10px（道具の面と Android のいちばん小さい面の半辺）離せない。`report.mjs` では `at16.first`・`avoidable.first` の cases 1・far10 0・far16 0 で、plan-t5a7.md 5 の「第1の組に落ちた件が 0」に当たる件だが、着地の関数では避けられず、8章の選択肢（組みを直す・第2の組を外すなど）を要する型である。次のサイクルは測りの前に着地の作りを決め直すので（carryover.md の順）、この件はその材料になる。ところがいまは、t5a-measure.md 10-2 の道具の確かめの箇条（`5d5e5c31` の箇条）に、`vp` と `expected` の確かめとして「2 走査が … おすすめのリンクに落ちて離れ」とあるだけで、10-1 の「ここで見えた件」にも、carryover.md の「着地の作りの決め直し」（材料は review-plan-13.md の「はじめる」の件だけ）にも、index.md の補足事項「試しの走りで見つけた着地の作りの欠け」（「はじめる」の (1)(2) だけ）にも無い。直す形の例: t5a-measure.md 10-1 の「ここで見えた件」に、試しの走りの値（条件7 の値ではない）として、画面・本・行・間隔・入力、落ちた先、範囲と `farFirst` 9.3px、基準の版では同じ 24 走査のうち 18 走査が同じ所で離れたことを書き、carryover.md の「着地の作りの決め直し」の材料にこの件を足す（index.md の補足事項は PM が取り込みのときに合わせる）。決め直しが結果の画面のリンクの扱いも比べに入れるよう、決めることの一つとして書く。
2. **report.mjs の頭の注の折り返しの崩れ（直す）**。52行目「`//     押しの2打目で離れた走査。離れた押しは要約の vp）の数と、そのうち rv の無い回の数。条件7 は結果への切り替わりのすべての回で値を求めるので、missing は 0 のはずである。`」は表示幅が約 172 桁で、ほかの注の行（120 桁以内）の折り返しにそろっていない。c8a97b96 で文を足した所が折り返されずに残ったもので、足した跡が見える。前後の行（51〜52行目）を詰め直す。

## 再レビューの頼み方

PM は、指摘1・2 を builder に直させ（1 は t5a-measure.md 10-1 と carryover.md の文書。2 は report.mjs の注で、記録の書き方は変わらない。report.mjs の blob が替わるので、t5a-measure.md 10-2 の report.mjs の blob の記述もそろえる）、全体の見直しを含めてもう一度レビューに出す。
