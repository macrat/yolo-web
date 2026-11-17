# T5a-7a-1 の道具のレビュー 第20回

対象: 担当の木 `.claude/worktrees/agent-a98793f663f2cdd15`、枝 `worktree-agent-a98793f663f2cdd15`（HEAD eff543a5）。作業ブランチ `design-rollout`（HEAD 5292d63e）との差 `git diff design-rollout...worktree-agent-a98793f663f2cdd15` の6ファイル（measure.mjs・report.mjs・measure/README.md・plan-t5a7.md 3・4・t5a-measure.md 0章と10章・carryover.md）を白紙で読み、とくに eff543a5（`spanMissing`）を report.mjs の `resultView` の数えと measure.mjs の `pressRecord`・`summaryLine` と突き合わせた。照らした決まりは constitution.md、CLAUDE.md、`.claude/rules/`、t5a-design.md 4-9 と 6章 条件7、主の木の index.md の作業内容 3 と補足事項、`docs/anti-patterns/implementation.md`・planning.md・workflow.md。サーバーは起こさず（走らせ直しは要らなかった。ポート 3147・3148 は空いている）、`tmp/cycle-320/t5a7a1-fix/` の記録を枝の report.mjs と design-rollout の report.mjs で集計して比べた。

**結論: 承認**（指摘 0件）

## 自分で確かめたこと

- **合否の数が変わらないこと**: after-17・lo-17・syn-17・syn-19・base-16・after-16・after-15・base-15・after-14・base-14・lo-14・after-13・base-13・after-11・base-11 を両方の report.mjs で集計した。違うのは `resultView`（design-rollout の report.mjs には無い）と、lo-14 の `flags.nameLow`（走査の `lo` を数えるようにした分の 1）だけで、`groups`・`avoidable`・`at16`・`mayFall16`・`hitUnmatched`・`bytes` ほかの欄はどの束も同じだった。after-17 の 375×550 の「はじめる」は `at16.next` cases 15・far10 11・far16 10、`avoidable.next` cases 10・far10 6・far16 5、`mayFall16.next` 5 で、10-2 の記述と合う。
- **`spanMissing`**: 着地の関数を持つ版の束では、after-17・lo-17・syn-17・after-16・after-14・lo-14・after-13・after-11 のどの束も 0、基準の版の束では出ない。syn-19 は lo-17 の要約の character-personality の行から `re` だけを消した合成で（押しごとの記録は lo-17 と同じ）、`spanRecorded` 1・`spanMissing` 1・`spanEmpty` 0 になり、その回は `lo` を持つので `lowInSpan` にも 1 で出る。`rv` の無い回は `missing`、`rv` があって `re` の無い回は `spanMissing`、`re` の 1・2 は `emptyRuns`・`clampEmptyRuns` に出るので、結果に切り替わるはずの回の値が黙って消える道は残っていない。`rv` の1つ目（ボックスの上端）は、結果の名前を結果のボックスがあるときにだけ取るので、`rv` のある回では欠けない。`retry` の回は `rv` を持たず（after-11・after-13・base-8 ほか、`rv` の書き方は `83d775a3` から変わっていない）、`select` は問の見出しで測るので、結果の数に紛れ込まない。
- **blob と大きさ**: 枝の measure.mjs は `6a4f271b`、report.mjs は `77697d82` で、after-17 の頭の行の `measure` と t5a-measure.md 10章の状態の行・10-2 の記述と合う。after-17 の「はじめる」の要約 3,467B・押しごとの記録 6,397B も 10-2 と合う。375×800 の 24 走査の1行は、基準の版でタッチ 246.7・247.7B、マウス 158.3・159.7B、全体 203.1B、変更後の版でタッチ 148.8・150.2B、マウス 123.3・124.5B、全体 136.7B で、10-2 と plan-t5a7.md 3 の比と合う。
- **見積もり**: plan-t5a7.md 3 の2つの式は 2,835.35KB・2,670.58KB、重みは 10-2 の表の要約の列（合計 2,597KB・2,436KB）と合う。9.5MB（2.9＋3.3＋3.3）と残り 5.5MB、「もう一度挑戦する」の1ファイル約 0.37MB（1,920 行 × 194B）も合う。`size-pack` は 350.16MiB（深い履歴）で、4MB・15MB は約 1%・約 4%。
- **続きとチャンクの受け入れ**: `beginViewportFile`・`checkFingerprint`・`openViewportFiles` は第19回の確かめのあと変わっていない。回を測り始める前に1度だけ呼ばれ、測る回の残らないファイルに触れず、決定の記録でいまのチャンクまでたどれなければ止まる。`--landing` の食い違いは置き場を作る前に止まる。
- **文書どうし**: `spanMissing` と `runs`・`boxTop`・`nameBottom`・`spanRecorded` の意味は、report.mjs の頭の注・README の段落・plan-t5a7.md 4 で同じに書かれている。上限（1MB・4MB・15MB）、`--landing`、基準の版で押しごとの記録を置かないこと、担当の境とコミットの時、`re` の 0・1・2、`clampEmptyRuns`、結果の画面のリンクの件は、plan-t5a7.md 3・4、README、carryover.md、t5a-measure.md 0章・10章、index.md の作業内容 3 で食い違っていない。10-2 の直した道具の「8点」は箇条の数と合う。
- **形**: Prettier と ESLint は変えたファイルで通る。担当の木に未コミットの変更は無い。carryover.md は 11,666B、index.md は 31,850B。
- **前回の指摘1**（`re` の欠けた回を数える所が無い）は、上のとおり直っている。

## PM への伝達（builder の指摘ではない）

- 前回までと同じく、主の木の index.md の「レビューの経過」の表と作業内容 2 は T5a-7a-1 を「第10回で承認」としたままで、第11回〜第20回のレビューとこの続きの直しが書かれていない。補足事項の「試しの走りで見つけた着地の作りの欠け」も、carryover.md に足した結果の画面のリンクの件に触れていない。取り込みのときにそろえる。
- `git log design-rollout..worktree-agent-a98793f663f2cdd15` には、別の担当の枝 `worktree-agent-aa3e0c54c933174b0` を取り込んだマージ（6155d4cd・bfdc167c）と 48b25fb2 が入っている。取り込む前に、`.claude/rules/delegation.md` の「取り込んで消す」2 のとおり、どれも依頼した担当のコミットかを確かめる。
