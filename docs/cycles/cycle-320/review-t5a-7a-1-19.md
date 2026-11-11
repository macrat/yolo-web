# T5a-7a-1 の道具のレビュー 第19回

対象: 担当の木 `.claude/worktrees/agent-a98793f663f2cdd15`、枝 `worktree-agent-a98793f663f2cdd15`（HEAD 662d5f53）。作業ブランチ `design-rollout`（HEAD d7ce632e）との差 `git diff design-rollout...worktree-agent-a98793f663f2cdd15` の6ファイル（measure.mjs・report.mjs・measure/README.md・plan-t5a7.md 3・4・t5a-measure.md 0章と10章・carryover.md）を白紙で読んだ。照らした決まりは constitution.md、CLAUDE.md、`.claude/rules/`、t5a-design.md 4-9 と 6章 条件7、主の木の index.md の作業内容 2・3 と補足事項、`docs/anti-patterns/implementation.md`・planning.md・workflow.md。サーバーは起こさず（走らせ直しは要らなかった。ポート 3147・3148 は空いている）、`tmp/cycle-320/t5a7a1-fix/` の記録を枝の report.mjs と design-rollout の report.mjs で集計して比べた。

**結論: 改善指示**（指摘 1件。文書と集計の小さな直しで、道具の記録の書き方と合否の数には誤りが無い）

## 自分で確かめたこと

- **合否の数が変わらないこと**: after-17・lo-17・syn-17・base-16・after-16・after-14・base-14・after-13・base-13・after-11・base-11 を design-rollout の report.mjs と枝の report.mjs で集計し、`resultView` と `flags.nameLow` を除いた全欄がどの置き場のどの束でも一致した。`flags.nameLow` の違いは、走査の `lo` を数えるようにした lo-17・syn-17 の 1 だけである。after-17 の 375×550 の「はじめる」は `at16.next` cases 15・far10 11・far16 10、`avoidable.next` cases 10・far10 6・far16 5 で、10-2 の記述と合う。
- **blob**: 枝の measure.mjs `6a4f271b`・report.mjs `daa1790c`・version.mjs `4657c81f`・knowledge.mjs `d93ec11e` で、after-17・lo-17 の頭の行の `measure` と t5a-measure.md 10章の状態の行・10-2 の記述と合う。Prettier と ESLint は変えたファイルで通る。carryover.md は 11,666B。
- **`heightEmpty` の丸め**: 変更後の版の `chooseLanding` は `ceil(max(plan.span.min, scrollable.min))`・`floor(min(plan.span.max, scrollable.max))` が空なら `plan.base` を返す。道具の `range` は同じ式、`heightEmpty` は打ち切りを除いた `ceil(plan.span.min) > floor(plan.span.max)` で、`ceil(max(a,s)) = max(ceil a, ceil s)`・`floor(min(b,t)) = min(floor b, floor t)` なので、範囲が空で `heightEmpty` が偽なら、空にしたのは送れる範囲の項である。結果への着地は `revealLanding(measureHeadedBoxPlan(...))`（QuizContainer.tsx 230行）で、`planHeadedBox` は空の範囲を `{base, base}` に置き換えない（置き換えるのは `planGroup` だけ）ので、`re` の 1 と 2 は漏れも重なりもなく分かれる。記録でも、after-10（`f96d07e7`）の japanese-culture は `land` が `[0, 7, 1, 7, 0, …]`、after-11 の character-personality は `[0, 6, 0, 7, 0, …]`、lo-14 は `[-143, 54, -143, 54, -143, …]`、lo-17 は `[-96, 160, -96, 161, -96, …]` で、どれも打ち切る前から空（いまの定義でも 1）である。10-2 の古い blob の回を `re` 1 と書いた箇条は、いまの定義と食い違わない。
- **`rv`・`re`・`lo`・`vp`・`resultView`**: after-16 の kotowaza-level・タッチ・最後の行の2走査は `vp` `[10, "last-next"]`・`rv` `[140, 215]`・`[126, 201]`・`re` 0 で、押しごとの記録の `land` は `[230, -28, 230, 0, 230, "first", 1, 1, 9.3, 9.3, 98, 0, 0]` と `[216, -42, 216, -14, 216, "first", 1, 1, 9.3, 9.3, 98, 0, 0]`、2打目は `/play/yoji-level` の (52, 772)・(52, 758) で、t5a-measure.md 10-1 の「結果の画面のリンク」の値（範囲 0〜230・−14〜216、隔たり 9.3px、98 に着いた）と合う。base-16 の 18 走査はどれも `vp` `[10, "last-next"]`（タッチ 12・マウス 6）。どの束も `expected` が走査の数と同じで `missing` 0。after-13 の `retry`（`rv` を書く blob `83d775a3`）は `rv` を持たず、`retry` の束が結果の数に紛れ込まないことも確かめた。syn-17 は lo-17 の要約の `re` だけを 2 にした合成で、`clampEmptyRuns` に入り `emptyRuns` から外れ、`lowInSpan` 1 になる。
- **続きとチャンクの受け入れ**: blob `f295c124`（81de3a56）から HEAD までの measure.mjs の差は、頭の注の詰め直し、`heightEmpty`・`resultSpan`、`vp` だけで、`beginViewportFile`・`checkFingerprint`・`openViewportFiles` の道筋は前の確かめのままである。`beginViewportFile` は回を測り始める前に1度だけ呼ばれ、測る回の残らないファイルには触れない。`--landing` の食い違いは `checkFingerprint`（置き場を作る）より前に止まる。
- **見積もり**: 1行の大きさを数え直した（base-16 の 375×800 の走査はタッチ 246.7・247.7B、マウス 158.3・159.7B、after-16 はタッチ 148.8・150.2B、マウス 123.3・124.5B、after-17 の `last` は 175.7B・198.3B、base-14 の `last` は 153.9B・208.1B、base-14 の走査は 237.3B・173.0B）。plan-t5a7.md 3 の2つの式は 2,835.35KB・2,670.58KB で、重みは 10-2 の表の要約の列と合う。9.5MB と残り 5.5MB も合う。`size-pack` は 350.16MiB で、4MB は約 1%、15MB は約 4%。plan-t5a7.md 3 の数えるコマンドは深い履歴で走り、いまは 0 を返す。
- **前回の指摘**: 1（比の幅 0.91〜1.42）・2（`re` の 1 の定義を `ceil`・`floor` で書き、`land` の四捨五入との違いを書く）・3（「`re` を 0・1・2 に分けたこと」、3つの道筋の箇条）は直っている。
- **文書どうし**: 上限（1MB・4MB・15MB）、`--landing`、基準の版で押しごとの記録を置かないこと、担当の境とコミットの時、`re` の 0・1・2、`clampEmptyRuns`、結果の画面のリンクの件は、plan-t5a7.md 3・4、README、report.mjs の頭の注、carryover.md、t5a-measure.md 0章・10章、index.md の作業内容 3 で食い違っていない。

## 指摘

1. **変更後の版で `re` の欠けた回を数える所が無く、送れる範囲で空になった回（`re` 2）が黙って落ちうる（直す）**。plan-t5a7.md 4 は「変更後の版では、結果に切り替わったどの回も `rv` と `re` を持つ」と書くが、条件7 の表に写す値として挙げるのは `missing`（`rv` の無い回）・`emptyRuns`・`clampEmptyRuns`・`lowInSpan` だけである。README の `resultView` の段落も同じ4つ（と `expected`）だけを書き、`runs`・`boxTop`・`nameBottom`・`spanRecorded` を書いていない（report.mjs の頭の注にはある）。結果への着地の記録が取れなかった回は `re` を持たず、`emptyRuns` にも `clampEmptyRuns` にも入らない。高さで空の回は名前がはみ出すので `lowInSpan` に拾われるが、送れる範囲で打ち切って空になり名前が見えている回は、どこにも出ずに消える。これは t5a-design.md 6章 条件7 の「範囲が空で s0 にした回は、その旨と値を記録する」と、この直しの目的の「値の欠けた回を分けて数える」に届かない。道具は止め所を置けたことはページごとに確かめるが、結果の着地の呼び出しごとに記録が取れたことは確かめない。いまの記録では、変更後の版のどの束も `spanRecorded` が `runs` と同じだが、数が出ていても読む決まりが無い。直す形の例: report.mjs の `resultView` に、頭の行の `landing` が true の束で `rv` があって `re` の無い回の数（例: `spanMissing`）を出し、README の段落と plan-t5a7.md 4 の「分けて書く」値に入れて「変更後の版では 0 のはずで、0 でなければ PM に報告する」とする。あわせて、README の段落に `runs`・`boxTop`・`nameBottom`・`spanRecorded` の意味も書く。report.mjs を直したら、10-2 の report.mjs の blob をそろえ、記録の置き場を集計し直して合否の数が変わらないことを確かめる。measure.mjs を変えないなら、走らせ直しは要らない。

## PM への伝達（builder の指摘ではない）

- 前回と同じく、主の木の index.md の「レビューの経過」の表と作業内容 2 は T5a-7a-1 を「第10回で承認」としたままで、第11回〜第19回のレビューと、この続きの直しが書かれていない。補足事項の「試しの走りで見つけた着地の作りの欠け」も「はじめる」の型だけで、carryover.md に足した結果の画面のリンクの件（知識クイズの最後の「次へ」の2打目が、結果を読めないままおすすめのリンクで別のクイズへ移される型）に触れていない。取り込みのときにそろえる。

## 再レビューの頼み方

PM は、指摘1 を builder に直させる。そのうえで、前回までの指摘だけでなく全体の見直しを含めて、もう一度レビューに出す。
