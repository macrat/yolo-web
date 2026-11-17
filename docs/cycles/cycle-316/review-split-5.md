# レビュー（5回目）: cycle-316 の分割（split-plan.md と関連の変更）

対象: 作業ツリーの `git diff -- docs .claude/skills/cycle-completion .claude/skills/cycle-kickoff` の全体（2つのスキル・`docs/anti-patterns/candidates.md`・`docs/backlog.md`・`docs/knowledge/dependency-security.md`・`docs/knowledge/nextjs.md`・cycle-316 の index.md）、未追跡の `split-plan.md`・`t5a-measure.md`・`review-t5-13.md`・`review-split*.md`、`origin/design-rollout-wip`（20a29292）、`origin/cycle-316-records`（b42b12cf）。照らし合わせたものは、`docs/constitution.md`、CLAUDE.md、`docs/anti-patterns/planning.md`・`workflow.md`・`candidates.md`、`.claude/hooks/` の実物（block-destructive-git・pre-commit-check・pre-push-check・backlog-line-length-check・stop-cycle-guard・session-start-facts）、`.claude/settings.json`、`.prettierignore`・`.gitignore`、`.github/workflows/deploy.yml`・`vercel.json`・`scripts/wait-for-ci.sh`、`tsconfig.json`・`next-env.d.ts`・`src/__tests__/bundle-budget.test.ts`、`package-lock.json`（作業ツリーと origin/main）、cycle-313 の incident-7.md・incident-8.md とコミット 684c89f5、cycle-314・cycle-315 の index.md。

確かめ方: clone での通しは打っていない（空きは `df -h /` で 4.9GB。PM の指定どおり不要とした）。手順は文書とコマンドを hook の実物と突き合わせて読み、要る所だけ、作業ツリーを変えない形で確かめた（下の各項）。

## 判定

**改善指示（changes-needed）**

第4回の指摘1〜3と末尾の注意は、すべて解消した。knowledge の2節は、lock の中身・履歴、cycle-313 の記録、Next.js の生成物と合う。split-plan.md 6 の手順は、いまの作業ツリーと hook の実物に照らして、上から打てる。重い指摘・中の指摘は無い。ただし、軽い指摘が2つある（中間のサイクルが終わるときの B-754 の backlog の置き場が手順に無いこと、split-plan.md 4 の `cycle-316-records` のコミットが先端を指していないこと）。

## 第4回の指摘と注意の確かめ（1件ずつ）

| #    | 第4回の指摘・注意                                                                                                 | 結果 | 確かめたこと                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1(A) | `dependency-security.md` の節に原因と過去の記録が無く、「cycle-316 で得た知見」としている                         | 解消 | 節の題が「optional peer の衝突で、環境の制約ではない」になり、原因（`tsconfck` の optional peer `typescript@^5.0.0` とルートの 6.0.3、入れ子の有無）、入れ子のある lock は両方の版で通ること、根からの直し方と cycle-313 の revert（91a0c1a0）で戻されたこと、回避と cycle-314 からの使用、根拠（incident-7・8、684c89f5、cycle-314・315 の index.md、cycle-316 の再現）を書いた。冒頭も「原因は cycle-313 で突き止めた」に直った。事実との突き合わせは下の「knowledge の2節」。                                                 |
| 1(B) | `.next` の型の知見が `nextjs.md` §11 と別の場所にあり、§11 は `.next/types/` が別の木のまま残る場合を扱っていない | 解消 | `dependency-security.md` から消え、§11 が「`.next/` の型ファイルがいまの木と合わないと…」に書き直された。合わなくなり方を3つ（ルートの移動・ブランチの移動と別の木での検査・書きかけ）に並べ、対処・予防・根拠をそれぞれに当てている。`.next` を消す理由はブランチを移ったことに結び付き、`npm ci` とは切り離された。後から書き足した跡は無く、1つの節として読める。                                                                                                                                                             |
| 2    | index.md のレビュー結果に第3回の行が無く、「実施する作業」が knowledge の変更を挙げていない                       | 解消 | 表に「B-754 の分割 3巡目」「4巡目」の行が、第1回・第2回と同じ形で入った。「B-754 の分割」の項目に、`dependency-security.md` と `nextjs.md` §11 に書くことが入った。                                                                                                                                                                                                                                                                                                                                                              |
| 3    | 最後のサイクルの手順に、統合のブランチを消すことが無い                                                            | 解消 | `cycle-completion` の手順7の最後のサイクルの文に、手順8で出荷の CI を確かめたあと `git push origin --delete <統合のブランチ>` で消すこと（とその理由）が入った。split-plan.md 1 の「出荷」と 7 の表の最後の行にも入り、`design-rollout-wip`（7 の5行目）・`cycle-316-records`（4 と 7 の最後の行）と合わせて、3つのブランチすべてに消す時期がある。`git push origin --delete …` は block-destructive-git のどのパターン（`--force`・`-f` など）にも当たらない。                                                                  |
| 注意 | 空きが少ない。始める前に `df -h /` を確かめ、`.next` を `npm ci` より先に消す                                     | 解消 | split-plan.md 6 の冒頭に、`df -h /` の確かめ、3GB を下回るときに消してよいもの（検証用の clone と `.next/dev`）、手順3・5で `.next` を先に消す理由が入った。手順3・5のコマンドも `rm -rf .next` → `npm ci` の順になった。`cycle-kickoff` の手順1（`merge` → `rm -rf .next` → `npm ci`）と `cycle-completion` の手順7の文も同じ順である。いまの空きは 4.9GB で、`split-verify-*` はもう無い。`.next` は 6.0GB（うち `.next/dev` が 4.3GB で、build の結果は約 1.7GB。split-plan.md の数と合う）、`node_modules` は 954MB である。 |

## knowledge の2節を事実と突き合わせた結果

- **lock の中身**: 作業ツリーの `package-lock.json` には `node_modules/vite-tsconfig-paths/node_modules/typescript`（5.9.3。`optional`・`peer`）があり、その上の `node_modules/vite-tsconfig-paths/node_modules/tsconfck`（3.1.6）は `peerDependencies` に `typescript: ^5.0.0` を、`peerDependenciesMeta` で `optional: true` を持つ。origin/main の lock には入れ子が無い。ルートの `typescript` は両方とも 6.0.3。
- **lock の履歴**: `git log -S'"node_modules/vite-tsconfig-paths/node_modules/typescript"' -- package-lock.json` は、5a37f92a（cycle-316）・f029a85c・7c9e8502・274f6b41（Dependabot）・a7b17277・2c5c7f16（Dependabot）・b9f2cfca・7d58bb8c・e73ffc78 を返す。入れ子を足すコミットと消すコミットが並び、Dependabot のものを含む、という記述と合う。
- **cycle-313 の記録**: コミット 684c89f5 の本文は、原因（`tsconfck` の optional peer をルートの 6.0.3 が満たさず、lock に入れ子が無い）と直し方（`resolve.tsconfigPaths` へ移して `tsconfck` ごと消す）を書く。incident-7.md の「`npm ci` を「環境の制約」として扱っていた」（121行〜）と incident-8.md の 72・93・96 行も同じ。684c89f5 は origin/main に無く、`vitest.config.mts` と `package.json` はいまも `vite-tsconfig-paths` を使う（cycle-313 の revert 91a0c1a0）。「Vite がテストのたびに案内を出す」も、`node_modules/vite/dist/node/chunks/node.js` の `resolve.tsconfigPaths` の案内の文（Vite 8.1.5）で確かめた。
- **回避**: cycle-314 の index.md 197行と cycle-315 の 682行は `npx npm@11.19.1 ci` を書く。knowledge の `npx -y npm@11 ci` とは版の書き方だけが違い、同じ回避である。
- **`nextjs.md` §11**: `tsconfig.json` の `include` は `.next/types/**/*.ts` と `.next/dev/types/**/*.ts` を含み、`next-env.d.ts`（`.gitignore` の対象で、build が書く）は `./.next/types/routes.d.ts` と `root-params.d.ts` を副作用の import で読む。`.next/types/` と `.next/dev/types/` の両方に `validator.ts` と `routes.d.ts` がある。`bundle-budget.test.ts` は `describe.skipIf(!buildExists)` で、`build-manifest.json` が無いと全体を飛ばす。読み込む先が無い副作用の import を持つ `next-env.d.ts` は、TypeScript 6.0.3 の `tsc` で通ることを scratchpad の小さな木で確かめた（`.next` を丸ごと消しても typecheck が通る、という記述の裏付け）。

## 手順（split-plan.md 6）を hook の実物と突き合わせた結果

- **手順1**: `git diff --name-status da54202e origin/design-rollout-wip` の 65 の項目（`.claude/skills/frontend-design/SKILL.md` と `src/`。変更60・削除1・改名1・追加3。改名の元の `solvedScreenHeadings.ts` は `--name-only` に出ないが、作業ツリーで消えていて、移り先の木にも無いので `git switch` を止めない）について、作業ツリーと `origin/design-rollout-wip` が同じであることを確かめた（追跡しているものは `git diff origin/design-rollout-wip -- <パス>` が未追跡の4つだけを示し、その4つは `cmp` で同じ）。完了のもの（`docs/`・2つのスキル・backlog・candidates.md）は wip のコミットが触らないので、`git switch` で持ち越される。ローカルの `design-rollout-wip` は origin と同じ 20a29292 を指す。
- **手順2**: いまの作業ツリー（途中の作業を含む）で `tsc --noEmit --incremental false` が通った（`.next/dev/types` は 2026-09-28 の `next dev` のもので、`.next/types` は今日の build のもの。どちらの `validator.ts` の import 先も、手順1で外すものを含まず、いまの木にある）。手順1はルートのファイル（`page`・`route`）を足し引きしないので、push の hook の typecheck はこの `.next` のまま通る見込みである。
- **手順3**: origin/main（9c848bd0）は、作業ブランチとの合流点そのもので、main は 3つのファイル・backlog・`deploy.yml`・`package.json`・lock のどれも変えていない。そのため、`git diff origin/main...claude/cycle-kickoff-rv3l21` の差分を Edit で当てると、`git diff claude/cycle-kickoff-rv3l21 -- <3つ>` は空になる。main の B-754 は Queued の表の1行で、差し替えだけで済む。`docs/backlog.md` は `.prettierignore` の対象なので、pre-commit の prettier に掛からない。main の `generate:toolbox-registry` は経路を並べ替えて書くので、push の hook のあとで作業ツリーが汚れず、手順5の `git switch` を止めない。
- **手順4・5**: `git push origin HEAD:main` は remote-tracking の `origin/main` を進めるので、手順5の `git merge origin/main` は手順のコミットを取り込む。`cycle-316-steps` は origin/main を追う設定で作られ、push のあと origin/main に含まれるので、`git branch -d` が通る（`-D` ではないので Pattern 11 にも当たらない）。`vercel.json` は `"**": false`・`"main": true` なので、`design-rollout` への push は配備されない。
- **hook**: 手順のコマンドは `git switch`・`git add`・`git commit`・`git merge`・`git push origin HEAD:<ブランチ>`・`git push origin --delete`・`git branch -d` だけで、block-destructive-git の 11 のパターンのどれにも当たらない。pre-commit の AP-WF24 のコミットの文の確かめは、PM が書く文の注意として残る。backlog の最長の行は200字（B-588。変えていない行）、B-754 は197字。
- **次のセッション**: main から始めると、Queued の B-754 の行が `design-rollout` と `cycle-kickoff` の手順1を指す。手順1で移った先の最新のサイクルは完了した cycle-316 で、stop-cycle-guard と session-start-facts は、どちらのブランチでも最新のサイクルを完了と見る。番号は main の 315 と `design-rollout` の 316 から 317 になる。1つ目のサイクルは split-plan.md 7 の表の1行目と 4 の表から、戻すコミット（`3001f167`・`83a8cbd9`）を引ける。

## 指摘（重さの順）

### 1. 中間のサイクルが終わるとき、B-754 の backlog の行をどこに置くかが手順に無い（軽い。`cycle-completion` の手順7）

`cycle-kickoff` の手順4は「Queued から選んで Active に移動」する。`design-rollout` の上の2つ目以降のサイクルも、B-754 を Active に移して始める。しかし、`cycle-completion` の手順7の統合のブランチの項は、最初のサイクル（backlog の項目に統合のブランチの名前を書く）と最後のサイクル（名前を外す）だけを書き、そのあいだのサイクルが終わるときに B-754 をどこへ戻すかを書いていない。cycle-316 は、B-754 を Active から Queued に戻し、「進行中」の文の行にした。後のサイクルがこれに倣わず Active に残すと、`design-rollout` の backlog だけ B-754 が Active になり、main の行（Queued）と置き場が食い違う。次のキックオフの手順4も「Queued から選ぶ」と合わなくなる。手順7の統合のブランチの項に、そのあいだのサイクルは、完了のコミットで項目を Queued の同じ行に戻すことを、最初と最後のサイクルと並べて1文で書く。

### 2. split-plan.md 4 の `cycle-316-records` のコミットが先端を指していない（軽い。split-plan.md 4）

「孤立したブランチ `cycle-316-records` に残し、origin に push した（8b707ebf）」とあるが、origin の先端は b42b12cf（README の読み方と道具の置き方を直したコミット）である。8b707ebf の README は第3回の指摘5で直す前のもので、`git show 8b707ebf:tmp-records/README.md` で読むと、直した点（「どれも」・`--strip-components`・道具ごとの置き場）を欠く。読み方の文はブランチの名で読ませているので実害は小さいが、T11 と records を使うサイクルが頼る文書なので、先端の b42b12cf を書く（4 の表の `design-rollout-wip` の行と同じく、いま指すべきコミットを書く）。

## 確かめて問題が無かったこと

- **ツギハギ**: 2つのスキル・`candidates.md` の AP-WF43 候補・knowledge の2節・backlog の行は、どれも初めからその形で書かれたものとして読め、経緯の注記や「追記」の跡は無い。`dependency-security.md` は題と冒頭を内容に合わせて直している。`nextjs.md` §11 の題・本文・対処・予防・根拠は、3つの合わなくなり方に一貫して対応する。cycle-316 の文書（split-plan.md・index.md）は経緯を書いてよいサイクルの文書である。
- **backlog の200字**: 200字を超える行は無い。
- **文書からの新しい `tmp/` の参照**: 足された `tmp/` は、`cycle-316-records` の置き方の説明（`tmp/<パス>` → `tmp-records/<パス>`、`/tmp/claude-0/.../scratchpad/<パス>`）だけで、ファイルを指す新しい参照は無い。t5a-measure.md には `tmp/` もスクラッチパッドの参照も無い。review-t5-13.md のスクラッチパッドの語は作業の説明で、参照先のファイルを要さない。
- **整形**: 対象のファイルは `prettier --check` を通る。
- **AP**: workflow.md・planning.md・candidates.md に照らして、該当する型は見当たらない。hook を回り道で避けた件（index.md の補足事項の最後の項）は、完了の処理の AP の点検で扱うと記録されている。

## PM へ

指摘が2つあるので、次のとおり進めてください。

1. 指摘1の `cycle-completion` の手順7の直しは planner か builder に、指摘2の split-plan.md 4 の直しは planner にさせる。index.md のレビュー結果の表には、このレビュー（5巡目）の行を足す。
2. 直したあと、もう一度レビューを依頼する。そのときは、今回の指摘だけでなく全体を見直させる。

あわせて、文書の指摘ではない注意を書いておく。このコンテナには `gh` が無い（`command -v gh` が何も返さない）ので、手順4・5の `bash scripts/wait-for-ci.sh` は exit 3 で「Actions で確かめよ」と返して終わる。CI は GitHub の MCP で、push したコミットの SHA の run（手順4は手順のコミット、手順5はマージのコミット）を引いて、`conclusion` が success であることを確かめる。手順5のブロックを1つのコマンドとして流すと、`wait-for-ci.sh` が exit 3 で終わっても次の `git branch -d` が走るので、`wait-for-ci.sh` までで区切って打つ。
