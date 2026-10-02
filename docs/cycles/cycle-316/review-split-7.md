# レビュー（7回目）: cycle-316 の分割（split-plan.md と関連の変更）

対象: 作業ツリーの `git diff -- docs .claude/skills/cycle-completion .claude/skills/cycle-kickoff` の全体（2つのスキル・`docs/anti-patterns/candidates.md`・`docs/backlog.md`・`docs/knowledge/dependency-security.md`・`docs/knowledge/nextjs.md`・cycle-316 の index.md）、未追跡の `split-plan.md`・`t5a-measure.md`・`review-t5-13.md`・`review-split*.md`、`.claude/hooks/` の実物（pre-commit-check・pre-push-check・block-destructive-git・backlog-line-length-check・post-write-residue-check・trust-guard・session-start-facts・stop-cycle-guard）と `.claude/settings.json`。照らし合わせたものは、`docs/constitution.md`、CLAUDE.md、`docs/anti-patterns/planning.md`・`workflow.md`・`candidates.md`、`tsconfig.json`・`next-env.d.ts`・`package.json`・`.prettierignore`・`vercel.json`・origin/main の `deploy.yml`・`scripts/wait-for-ci.sh`・`src/__tests__/bundle-budget.test.ts`。

確かめ方: clone での通しは打っていない（PM の指定どおり）。作業ツリー・index・ブランチは変えず、要る所だけ scratchpad で確かめた（小さな合成のリポジトリで手順1の `git switch` の往復、`git merge-file` で手順5の backlog のマージ、`tsc` で `.next/types` が無いときの型の検査）。

## 判定

**承認（approved）**

第6回の指摘1は解消した。split-plan.md 6 の手順は、いまの作業ツリー・origin のブランチ・hook の実物に照らして上から打てる。次のセッションは、main から手順と文書だけで正しく続けられる。重い・中・軽いのどの指摘も無い。下の「注意」は文書の直しを求めるものではない。

## 第6回の指摘の確かめ

| #   | 第6回の指摘                                                            | 結果 | 確かめたこと                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `nextjs.md` §11 が、commit の hook が typecheck を走らせると書いている | 解消 | 題が「typecheck と push の hook が落ちる」、冒頭が「手で打つ `npm run typecheck` が落ちるほか、push の hook（`pre-push-check.sh`）は build より前に typecheck を走らせる」、対処が「typecheck と push をやり直す」、予防が「typecheck や push の前に」になり、commit の語は §11 にも nextjs.md 全体にも残っていない。`pre-push-check.sh` の順（format check → lint → typecheck → test → build）、`pre-commit-check.sh` が typecheck を走らせないこと、`tsconfig.json` の include（`.next/types/**/*.ts`・`.next/dev/types/**/*.ts`）、`next-env.d.ts` の `.next/types/routes.d.ts` の import、`bundle-budget.test.ts` の `describe.skipIf(!buildExists)`（`.next/build-manifest.json` が無いと全体を飛ばす）は、どれも本文と合う。`.next/types` が無いときに `tsc --noEmit`（6.0.3）が通ることも、`next-env.d.ts` と同じ import を持つ小さな作りで確かめた（`noUncheckedSideEffectImports` を true にしても通る）。index.md の「実施する作業」の §11 の要約も本文と合う。 |

index.md のレビュー結果の表に、6巡目の行（軽い1、builder の直し）が、1〜5巡目と同じ形で入った。

## 手順（split-plan.md 6）を実物と突き合わせた結果

- **前提**: HEAD は da54202e、ローカルと origin の `design-rollout-wip` は 20a29292、origin の `cycle-316-records` は b42b12cf、origin に `design-rollout` はまだ無く、`origin/main` は 9c848bd0（`git ls-remote`）。5つのコミットの題と順は 4 の表と同じ。`git diff da54202e design-rollout-wip` の64の既存のパスは作業ツリーと `cmp` で同じで、作業ツリーのほかの変更は完了のもの（`docs/`・2つのスキル・backlog・candidates.md・未追跡の文書）だけである。`df -h /` の空きは 4.9GB（3GB の線より上）、`.next` は 6.0GB のうち `.next/dev` が 4.3GB、それを除く build の結果は 1.8GB で、文書の「約 1.7GB」と合う。`next dev` は動いていない。
- **完了の手順6の `npm run format`（`prettier --write .`）**: 手順1より前に打つので途中の作業のファイルにも掛かるが、それらは `prettier --check` を通るので書き換わらず、手順1の `git switch design-rollout-wip` を妨げない。
- **手順1**: `git diff --name-only` は改名を新しいパスだけで出すので、`src/play/quiz/solvedScreenHeadings.ts` → `solvedScreenPhrases.ts`（R060）の消した側はインデックスに載らない。同じ形（改名・書き換え・ほかの未コミットの変更）を合成のリポジトリで打ち、`git switch` の往復が両方とも通って、戻ったあとに消した側のファイルが戻り、ほかの変更だけが残ることを確かめた。手順の結果は文書のとおりになる（下の「注意」）。
- **手順2**: 完了のものだけの木で、`git add .`・`git commit`・`git push origin HEAD:design-rollout` は block-destructive-git のどのパターンにも当たらない。backlog は200字を超える行が無い（最長は変えていない B-588 の200字、B-754 は197字）ので backlog-line-length-check を通る。対象の文書は `prettier --check` を通る。
- **手順3**: main の B-754 は Queued の表の最初の行で、`design-rollout` の側の行も Queued にあるので、Edit は1行の差し替えで済み、差し替えたあとの main の backlog も200字を超えない。`docs/backlog.md` は `.prettierignore` にあり、`.prettierignore` は main と同じ。
- **手順5のマージ**: 合流点（9c848bd0）・作業ツリーの backlog・B-754 の行を差し替えた main の backlog を `git merge-file` に掛け、B-755 の1行を挟む衝突が1つだけ出ることを確かめた（文書の「衝突しうる」のとおりで、`design-rollout` の側の形に解く＝B-755 の行を消す、で正しい）。`git push` で `origin/main` の追跡の参照が更新されるので、手順5の `git merge origin/main` は手順のコミットを取り込む。
- **CI**: origin/main の `deploy.yml` は `on.push.branches: [main]` で、手順3がそこに `design-rollout` を足す。`vercel.json` は main だけを出荷する。`wait-for-ci.sh` は `gh` が無いと exit 3 で、文書の GitHub の MCP での確かめ（skipped を失敗としない）は、このスクリプトの `jq` の条件と同じ。

## 次のセッションが main から続けられるか

- main に手順のコミットが入れば、session-start-facts と stop-cycle-guard は cycle-315 を完了と見る。backlog の Queued の B-754 の行が `design-rollout` と `cycle-kickoff` の手順1を指し、手順1のコマンドは hook に止められない。移った先の `design-rollout` の lock は入れ子の typescript を持つ（`package-lock.json` に1件、origin/main には0件）ので、手順1の `npm ci` は npm 10.9.7 で通る。`dependency-security.md` の最後の節の事実（`tsconfck` の optional peer `typescript@^5.0.0`、ルートの 6.0.3、入れ子の 5.9.3、`vitest.config.mts` と `package.json` の `vite-tsconfig-paths`、684c89f5 の題）は実物と合う。
- 番号は `cycle-kickoff` の手順5の両方のブランチを見る規則で 317 になる。1つ目のサイクルは split-plan.md 7 の表の1行目と 4 の表から、戻すコミット（3001f167・83a8cbd9）と戻し方を引ける。最後のサイクルの手順は `cycle-completion` の手順7と split-plan.md 7 の最後の行で揃っている。

## 確かめて問題が無かったこと

- **ツギハギ**: 2つのスキル、`candidates.md` の AP-WF43 候補、knowledge の2節（`nextjs.md` §11 は3つの合わなくなり方を同じ形で並べ、対処と予防もそれに対応する）、backlog の行は、どれも初めからその形で書かれたものとして読め、経緯の注記や「追記」の跡は無い。cycle-316 の文書は経緯を書いてよいサイクルの文書である。
- **backlog の200字**: 超える行は無い。
- **文書からの新しい `tmp/` の参照**: スキル・knowledge・backlog・candidates.md の追加に `tmp/` とスクラッチパッドの参照は無い。cycle-316 の文書の `tmp/` は `cycle-316-records` の置き方と T11 の書き写しの説明だけで、t5a-measure.md には無い。
- **整形**: 対象のファイルは `prettier --check` を通る。
- **AP**: workflow.md・planning.md・candidates.md に照らして、該当する型は見当たらない。

## 注意（文書の直しは求めない）

- 手順1で、改名した `solvedScreenHeadings.ts` の消した側はインデックスに載らず、`git switch design-rollout-wip` の成功が確かめるのは、移り先にあるパスの中身だけである。消した側は移り先の木に無いので、往復で正しく戻り、結果は変わらない。手順1の `git status --short` で `src/` が出ないことの確かめが、これも含めて押さえている。
- 前回の注意2つ（新しいセッションで完了の処理を打つと trust-guard が1度だけ警告すること、`git push origin --delete …` でもフルスイートが走ること）は、いまも同じである。

## PM へ

指摘は無い。承認とする。このレビュー（7巡目）の行を index.md のレビュー結果の表に足してから、split-plan.md 6 の手順に進んでよい。
