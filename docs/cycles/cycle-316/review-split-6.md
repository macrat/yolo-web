# レビュー（6回目）: cycle-316 の分割（split-plan.md と関連の変更）

対象: 作業ツリーの `git diff -- docs .claude/skills/cycle-completion .claude/skills/cycle-kickoff` の全体（2つのスキル・`docs/anti-patterns/candidates.md`・`docs/backlog.md`・`docs/knowledge/dependency-security.md`・`docs/knowledge/nextjs.md`・cycle-316 の index.md）、未追跡の `split-plan.md`・`t5a-measure.md`・`review-t5-13.md`・`review-split*.md`、`origin/design-rollout-wip`（20a29292）、`origin/cycle-316-records`（b42b12cf）。照らし合わせたものは、`docs/constitution.md`、CLAUDE.md、`docs/anti-patterns/planning.md`・`workflow.md`・`candidates.md`、`.claude/hooks/` の実物（block-destructive-git・pre-commit-check・pre-push-check・backlog-line-length-check・stop-cycle-guard・session-start-facts・trust-guard）、`.claude/settings.json`、`.github/workflows/deploy.yml`・`vercel.json`・`scripts/wait-for-ci.sh`、`git log` の hook と knowledge の履歴、このコンテナの reflog。

確かめ方: clone での通しは打っていない（空きは `df -h /` で 4.9GB。PM の指定どおり不要とした）。手順は文書とコマンドを hook の実物と突き合わせて読み、要る所だけ、作業ツリー・index・ブランチを変えない形で確かめた（scratchpad での `git merge-file`・`git apply --check` など）。

## 判定

**改善指示（changes-needed）**

第5回の指摘1・2と末尾の注意は、すべて解消した。split-plan.md 6 の手順は、いまの作業ツリー・origin のブランチ・hook の実物に照らして、上から打てる。次のセッションは、main から手順と文書だけで正しく続けられる。重い指摘・中の指摘は無い。ただし、軽い指摘が1つある（`docs/knowledge/nextjs.md` §11 が、commit の hook が typecheck を走らせると書いていて、事実と違う）。

## 第5回の指摘と注意の確かめ（1件ずつ）

| #    | 第5回の指摘・注意                                                                                  | 結果 | 確かめたこと                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | 中間のサイクルが終わるとき、B-754 の backlog の行をどこに置くかが `cycle-completion` の手順7に無い | 解消 | 手順7の統合のブランチの項が、最初・そのあいだ・最後の3つのサイクルを並べた。そのあいだのサイクルは「手順1で統合のブランチに移り、手順4で Queued から Active に移して始めたサイクル」と定義され、完了のコミットで Queued の同じ行に戻し、main への手順のコミットは要らない、とある。`cycle-kickoff` の手順4（Queued から選ぶ）と合い、main の行と `design-rollout` の行が同じに保たれる。split-plan.md 1（B-754 の残りのサイクル）と 2（`cycle-completion` の直しの要約）も同じ中身に直っている。 |
| 2    | split-plan.md 4 の `cycle-316-records` のコミットが先端を指していない                              | 解消 | 4 が b42b12cf を書く。`git ls-remote` で origin の先端が b42b12cf であること、その README の直し（第3回の指摘5）のコミットであること、`tmp-records/scratchpad/` に `t5-6`・`t5-33`・`rev-t5a2` があることを確かめた。                                                                                                                                                                                                                                                                            |
| 注意 | `gh` が無く、`wait-for-ci.sh` が exit 3 で終わる。手順5を CI の確かめで区切る                      | 解消 | 手順4が、exit 3 のときに GitHub の MCP で `macrat/yolo-web`（`git remote -v` と一致）の run を手順のコミットの SHA で引き、すべて完了して `conclusion` が success（skipped は失敗としない。`wait-for-ci.sh` の `jq` の条件と同じ）であることを確かめ、確かめるまで手順5へ進まない、と書く。手順5は push と `wait-for-ci.sh` のブロックと `git branch -d` のブロックに分かれ、区切る理由も書いてある。`command -v gh` はいまも何も返さない。                                                      |

index.md のレビュー結果の表に、5巡目の行（軽い2、planner の直し）が、1〜4巡目と同じ形で入った。

## 手順（split-plan.md 6）を実物と突き合わせた結果

- **前提**: HEAD は da54202e、ローカルの `design-rollout-wip` は origin と同じ 20a29292、origin に `design-rollout` はまだ無い（`git ls-remote`）。`git diff --name-only da54202e design-rollout-wip` の65のパスは、作業ツリーと `design-rollout-wip` で同じ（追跡しているものは差分が未追跡の4つだけで、その4つは `cmp` で同じ）。作業ツリーのほかの変更は、完了のもの（`docs/`・2つのスキル・backlog・candidates.md・未追跡の文書）だけである。
- **手順1**: コマンドは `git add -A`・`git switch` だけで、block-destructive-git のどのパターンにも当たらない。trust-guard の check は、`.claude/.model-edited` に2つのスキルと candidates.md が載っているので、このセッションのうちは手順1の `git switch` で鳴らない（下の「注意」）。
- **手順2**: 手順1のあとの木は `src/` を足し引きしない（ルートのファイルの増減が無い）ので、push の hook の typecheck は今の `.next` のまま通る見込みで、build は `.next` を作り直す。空きは 4.9GB で、build の結果（約 1.7GB）は既存の `.next` を置き換える。
- **手順3**: `git switch -c cycle-316-steps origin/main` は checkout のパターンに当たらない。`origin/main`（9c848bd0）は作業ブランチの祖先で、合流点そのもの（`git merge-base --is-ancestor`）。main の B-754 は Queued の表の最初の行で、`design-rollout` の側の行も Queued にあるので、Edit は1行の差し替えで済む。Edit のあとの PostToolUse の `prettier --write` は `.prettierignore` の `docs/backlog.md` を飛ばし、pre-commit の整形の検査は変えた5つのパスに掛かる。
- **手順5のマージ**: scratchpad で、合流点の backlog・作業ツリーの backlog（`design-rollout` の側）・B-754 の行を差し替えた main の backlog を `git merge-file` に掛けた。B-754 の行は両方の側で同じなので合うが、そのすぐ下で `design-rollout` の側が B-755 の行を消しているため、B-755 の1行を挟む衝突が1つ出る（文書の「衝突しうる」のとおりで、`design-rollout` の側の形に解く＝B-755 の行を消す、で正しい）。2つのスキルと candidates.md は両方の側で同じ中身、`deploy.yml` は main の側だけが変える。
- **手順5のあと**: `cycle-316-steps` は `origin/main` を上流として作られ、手順3の push で `origin/main` に含まれるので、`git branch -d` が通る（`-D` ではない）。
- **`design-rollout-wip` の戻し方（4）**: 20a29292（T5a-2b）は `character-personality.ts` の3行だけを変え、ほかの4つのコミットはそのファイルに触れない。da54202e の同じファイルに `git apply --check` で当たることを確かめた（2つ目のサイクルで 3・4 より先に戻せる、という記述と合う）。5つのコミットの題と順は 4 の表と同じ。`git restore --staged -- .` は Pattern 9 の例外（`--staged` だけ）に入る。
- **hook**: pre-push-check は「git push」を含むコマンドすべてに掛かるので、`git push origin --delete …` でもフルスイートが走る（止めはしない。時間が掛かるだけ）。

## 次のセッションが main から続けられるか

- このコンテナの reflog では、セッションの初めの取得は `fetch --depth 50 origin main` で、main だけを浅く取る。次のセッションも同じなら、`cycle-316-records`（オブジェクトで約 309MB）は名指して取らない限り入らず、4 の「それを使うサイクルだけが取る」は成り立つ。`cycle-kickoff` の手順1の `git fetch origin main design-rollout` は、remote の fetch の設定（`+refs/heads/*:refs/remotes/origin/*`）で `origin/design-rollout` を作るので、続く `git switch design-rollout` は追跡のブランチを作って移れる。
- main で始めると、session-start-facts は cycle-315 を完了と報告し、backlog の Queued の B-754 の行が `design-rollout` と `cycle-kickoff` の手順1を指す。移った先の最新は cycle-316（完了の処理で `completed_at` が入る）で、stop-cycle-guard も完了と見る。番号は手順5の `git ls-tree --name-only origin/main docs/cycles/`（実際に打って cycle-315 が最新と出た）と `design-rollout` の 316 から 317 になる。
- 1つ目のサイクルは、split-plan.md 7 の表の1行目と 4 の表から、戻すコミット（3001f167・83a8cbd9）と戻し方を引ける。最後のサイクルの手順（`deploy.yml` と backlog から名前を外す・main をマージして `HEAD:main` に push・CI のあとで `design-rollout` と `cycle-316-records` を消す）も、`cycle-completion` の手順7と split-plan.md 7 の最後の行で揃っている。

## 指摘（重さの順）

### 1. `nextjs.md` §11 が、commit の hook が typecheck を走らせると書いている（軽い。`docs/knowledge/nextjs.md` §11）

§11 は、題で「commit と push の typecheck が落ちる」、冒頭で「commit と push の hook は build より前に typecheck を走らせるので、「build は通るのに commit や push だけが落ちる」形で現れる」、予防で「`rm -rf .next/dev` を挟んでから commit する」と書く。しかし、いまの `pre-commit-check.sh` は、変えたファイルの prettier と eslint・残骸の検出・ブログの front matter しか走らせず、typecheck は走らせない（冒頭の注記「フルスイート (lint全体 / typecheck / test / build) は pre-push-check.sh が push 前に独立再実行する」）。commit の typecheck は f37b5822（2026-07-16）で外れた。`.husky` も `core.hooksPath` も無い。§11 の初めの観察（cycle-265、2026-06）は commit の typecheck があった頃のもので、それが古くなったまま、今回の書き直しで「commit と push の hook は…」という文が足された。知見を読んで「commit が落ちたのは `.next` のせいか」と探す後のセッションを、無い原因へ向かわせる。題・冒頭・対処・予防を、push の hook（`pre-push-check.sh`。typecheck は build より前）と手で打つ `npm run typecheck` に合わせて直す（「commit」を消し、予防は「push の前に」とする）。

## 確かめて問題が無かったこと

- **ツギハギ**: 2つのスキル（`cycle-completion` の手順7の3項目、`cycle-kickoff` の手順1・5）、`candidates.md` の AP-WF43 候補、knowledge の2節、backlog の行は、どれも初めからその形で書かれたものとして読め、経緯の注記や「追記」の跡は無い。手順7の3項目は同じ形（そのサイクルの定義 → backlog の扱い → push 先 → main の扱い）で並ぶ。cycle-316 の文書は経緯を書いてよいサイクルの文書である。
- **backlog の200字**: 200字を超える行は無い（最長は B-588 の200字で、変えていない行。B-754 は197字）。
- **文書からの新しい `tmp/` の参照**: 足された `tmp/` は、`cycle-316-records` の置き方の説明と T11 の書き写しの説明だけで、ファイルを指す新しい参照は無い。t5a-measure.md には `tmp/` もスクラッチパッドの参照も無い。review-t5-13.md のスクラッチパッドの語は作業の説明である。
- **整形**: 対象のファイルは `prettier --check` を通る。
- **AP**: workflow.md・planning.md・candidates.md に照らして、該当する型は見当たらない。

## PM へ

指摘が1つあるので、次のとおり進めてください。

1. 指摘1の `docs/knowledge/nextjs.md` §11 の直しを builder にさせる（題・冒頭・対処・予防の「commit」を、push の hook と手で打つ typecheck に合わせる）。index.md のレビュー結果の表には、このレビュー（6巡目）の行を足す。
2. 直したあと、もう一度レビューを依頼する。そのときは、今回の指摘だけでなく全体を見直させる。

文書の指摘ではない注意を2つ書いておく。

- 完了の処理を新しいセッションで打つと、SessionStart で `.claude/.model-edited` が空になるので、最初の Bash のあとに trust-guard が、コミットしていない2つのスキル・`candidates.md`・`frontend-design` のスキルを「Edit/Write 以外で変わった」と1度だけ警告する。中身はレビューを通した変更なので、`git diff` で中身を見て意図したものと確かめれば進めてよい（止める hook ではない）。
- `pre-push-check.sh` は「git push」を含むコマンドに掛かるので、手順の `git push origin --delete …`（4・7）でもフルスイートが走り、数分かかる。
