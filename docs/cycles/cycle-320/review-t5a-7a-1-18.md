# T5a-7a-1 の道具のレビュー 第18回

対象: 担当の木 `.claude/worktrees/agent-a98793f663f2cdd15`、枝 `worktree-agent-a98793f663f2cdd15`（HEAD 42a1b4e8）。作業ブランチ `design-rollout`（HEAD 11de411d）との差 `git diff design-rollout...worktree-agent-a98793f663f2cdd15` の6ファイル（measure.mjs・report.mjs・measure/README.md・plan-t5a7.md 3・4・t5a-measure.md 0章と10章・carryover.md）を白紙で読んだ。とくに 42a1b4e8 の差（`heightEmpty`・`resultSpan`・`clampEmptyRuns`・見積もりの比）を、measure.mjs の `summarizeLanding`・`pressRecord`・`compactPress`・`summaryLine` と、変更後の版のソース（`tmp/measure-builds/after/src/lib/reveal.ts` の `planHeadedBox`・`chooseLanding`・`revealLanding`、`QuizContainer.tsx` の呼び出し）と突き合わせた。照らした決まりは constitution.md、CLAUDE.md、`.claude/rules/`、t5a-design.md 4-9 と 6章 条件7、主の木の index.md の作業内容 2・3 と補足事項、`docs/anti-patterns/implementation.md`・planning.md・workflow.md。サーバーは起こさず、`tmp/cycle-320/t5a7a1-fix/` の記録を枝の report.mjs と design-rollout の report.mjs で集計して比べた。

**結論: 改善指示**（指摘 3件。どれも文書の小さな直しで、道具のコードと合否の数には誤りが無い）

## 自分で確かめたこと

- **`heightEmpty` が `chooseLanding` と同じ範囲を同じ丸めで見ているか**: 道具の `landing.choice` は、止め所が `chooseLanding` の入り口で引数をそのまま JSON にしたもので、`plan.span` は関数が受けた値と同じである。結果への着地は `revealLanding(measureHeadedBoxPlan(...))` で、`planHeadedBox` の `span` は空を `{base, base}` に置き換えずにそのまま渡る（置き換えるのは `planGroup` だけ）。`chooseLanding` は `ceil(max(plan.span.min, scrollable.min))`・`floor(min(plan.span.max, scrollable.max))` が空なら `plan.base` を返し、道具の `range` は同じ式、`heightEmpty` は打ち切りの無い同じ式 `ceil(plan.span.min) > floor(plan.span.max)` である。`heightEmpty` が真なら打ち切った範囲も必ず空になる（`ceil(max(a, s)) ≥ ceil(a) > floor(b) ≥ floor(min(b, t))`）ので、`re` の 1 と 2 は「関数が s0 にした回」を漏れも重なりもなく分ける。`planHeadedBox` の範囲の3つの下限のうち、1/3 の項と「ボックスが入る高さなら丸ごと入る送り」の項は範囲を空にしえず、空にするのは名前の項（ボックスの上端から名前の下端までが画面の高さ − 16px を超える）だけで、4-9 の条件と合う（丸めの端は下の指摘2）。
- **合否の数が変わらないこと**: after-17・lo-17・syn-17・after-16・base-16・after-15・base-15・after-14・base-14・lo-14 を、design-rollout の report.mjs と枝の report.mjs で集計し、`resultView` と `flags` を除いた全欄（`groups`・`mayFall16`・`fellFar10`・`avoidable`・`at16`・`hitUnmatched`・`hitUnrecorded`・`gaps`・`bytes` ほか）がどの置き場のどの束でも一致した。after-17 の 375×550 の「はじめる」は `at16.next` cases 15・far10 11・far16 10、`avoidable.next` cases 10・far10 6・far16 5 で、10-2 の記述と合う。after-17 の頭の行の `measure` は `6a4f271b`（枝の measure.mjs の blob）、report.mjs の blob は `0aa74165` で文書と合う。
- **`rv`・`re`・`lo`・`resultView`**: after-17 の `last` 30 回はどれも `rv` と `re` 0 を持ち、両方の束が `expected` 15・`missing` 0・`clampEmptyRuns` 空・`lowInSpan` 0。lo-17 の character-personality は押しごとの記録の `land` が `[-96, 160, -96, 161, -96, …]`（打ち切る前から空）で `re` 1、`emptyRuns` `[…, 8, 549]`・`lowInSpan` 0。syn-17 は lo-17 の要約の `re` だけを 2 に書き換えた合成で（押しごとの記録は lo-17 と同じ）、`clampEmptyRuns` に入り `emptyRuns` から外れ、`lowInSpan` 1 になる。`re` 2 を道具が書く枝は実の走りで出ていないが、上のとおりコードで正しい。
- **見積もり**: 375×800 の 24 走査の1行（改行を含む）を束ごとに数え直した。基準の版はタッチ 246.7・247.7B（174B に対して 1.42）、マウス 158.3・159.7B（0.91・0.92）、全体 203.1B（1.17）。変更後の版はタッチ 148.8・150.2B（111B に対して 1.34・1.35）、マウス 123.3・124.5B（1.11・1.12）、全体 136.7B（1.23）。plan-t5a7.md 3 の2つの式は 2,835.35KB・2,670.58KB で文書の 2,835KB・2,671KB と合い、重みは 10-2 の表の要約の列（基準 124・125・355・1,675・18・90・156・54、変更後 145・80・355・1,582・18・108・94・54）と合う。9.5MB（2.9＋3.3＋3.3）と残り 5.5MB も合う。前回の指摘1（比のいちばん大きい値）・指摘3（8点）・指摘4（「基準の版と同じ取り方で」）は直っている。
- **続きとチャンクの受け入れ**: 42a1b4e8 の measure.mjs の差は `summarizeLanding` の `heightEmpty`、`pressRecord` の `resultSpan`、`summaryLine` の `re` の3か所だけで、`beginViewportFile`・`checkFingerprint`・`landingExpected` の道筋に触れていない（前回の確かめがそのまま効く）。
- **形と文書**: Prettier と ESLint は変えたファイルで通る。上限（1MB・4MB・15MB）、`--landing`、基準の版で押しごとの記録を置かないこと、担当の境とコミットの時、`re` の 0・1・2 と `clampEmptyRuns` は、plan-t5a7.md 3・4、README、report.mjs の頭の注、carryover.md、t5a-measure.md 0章・10章、index.md の作業内容 3（4MB・15MB）で食い違っていない。carryover.md は 11,666B。

## 指摘

1. **plan-t5a7.md 3 の基準の版の答えの走査の比の幅が、括弧の中の値と合わない（直す）**。「答えの走査 0.99〜1.42（375×550 の4本で 1.36、200% の4本で 0.99、375×800 の知識クイズ3本の 24 走査の束ごとに 0.91〜1.42）」で、括弧の中にいちばん小さい 0.91 があるのに、幅の下が 0.99 になっている。変更後の版の箇条（1.11〜1.35 が括弧の中の値の幅と合う）とそろえて、「0.91〜1.42」に直す。
2. **`re` の 1 の定義が、README では `land` の2・3つ目（`Math.round` の値）で書かれ、道具の判定（`ceil`・`floor`）と端で食い違う（直す）**。README の `re` は「打ち切る前の範囲（見せる範囲の高さから決まる `land` の2・3つ目）がもう空だったなら 1」とするが、`land` の2・3つ目は `Math.round(plan.span.min)`・`Math.round(plan.span.max)` で、道具は `ceil(min) > floor(max)` で決める。打ち切る前の範囲が 1px より狭く整数の送りを含まないとき（例: 10.3〜10.7。ボックスの上端から名前の下端までが画面の高さ − 16px より1px 未満だけ低い回）、`land` は `[10, 11]` と空でなく見えるのに `re` は 1 になり、記録を突き合わせる者は食い違いに見える。この回は 4-9 の「超えるとき」に厳密には当たらないが、関数は整数の送りしか選ばないので s0 にし、`emptyRuns` に値が残るので見落としにはならない。直す形の例: README の定義を、t5a-measure.md 10-2 と measure.mjs の注に合わせて「打ち切る前の範囲を関数と同じ `ceil`・`floor` で丸めて整数の送りが無ければ 1（範囲が 1px より狭く整数の送りを含まない回も入る）」と書き、`land` の2・3つ目は四捨五入の値なので端では見分けに使えないことが分かるようにする。report.mjs の頭の注の「高さで空」も同じ意味であることが分かる一言にそろえる。
3. **文の小さな読みにくさ2つ（直す）**。(a) t5a-measure.md 10-2 の「blob ごとの直しと確かめ」の頭の「上の8点のうち走査の `lo`・`vp` と `re` の 2 は」は、「`re` の値 2」か「`re` の2点目」か読み分けにくい。「`re` を 0・1・2 に分けたこと」のように書く。(b) plan-t5a7.md 3 の「同じファイルの版が重なるのは、次の3つの道筋だけである」の下の箇条が4つあり、4つ目（「前の2つで重なるのは…約 0.37MB」）は道筋ではなく大きさの注である。4つ目を親の段落か3つの道筋の後の地の文に出し、箇条の数を3つにそろえる。

## PM への伝達（builder の指摘ではない）

- 前回と同じく、主の木の index.md の「レビューの経過」の表と作業内容 2 は T5a-7a-1 を「第10回で承認」としたままで、第11回〜第18回のレビューと、この続きの直し（基準の版の押しごとの記録・`rv`／`re`（0・1・2）・上限 4MB／15MB・`--landing`・`accept` の行・`vp`・`clampEmptyRuns`）が書かれていない。取り込みのときにそろえる。

## 再レビューの頼み方

PM は、指摘1〜3 を builder に直させる（どれも文書と注の直しで、measure.mjs のコードを変えないなら blob は替わらず走らせ直しは要らない。measure.mjs の注を直して blob が替われば、t5a-measure.md 10章の blob の記述をそろえ、変更後の版の「はじめる」を走らせ直して合否の数が変わらないことを確かめさせる）。そのうえで、前回までの指摘だけでなく全体の見直しを含めて、もう一度レビューに出す。
