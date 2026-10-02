# レビュー（3回目）: cycle-316 の分割（split-plan.md と関連の変更）

対象: 作業ツリーの `git diff -- docs .claude/skills/cycle-completion .claude/skills/cycle-kickoff` の全体、未追跡の `split-plan.md`・`review-split.md`・`review-split-2.md`・`t5a-measure.md`・`review-t5-13.md`、`git log da54202e..origin/design-rollout-wip --stat`、`origin/cycle-316-records`（8b707ebf）の `tmp-records/README.md` と木の中身。照らし合わせたものは、オーナーの言葉（2026-10-01）、`docs/constitution.md`、CLAUDE.md、`docs/anti-patterns/planning.md`・`workflow.md`・`candidates.md`、`.claude/hooks/` の全 hook と `.claude/settings.json`、`.github/workflows/deploy.yml`、`vercel.json`、`scripts/wait-for-ci.sh`、`package.json`。

確かめ方: リポジトリを scratchpad に clone し、いまの作業ツリー（変更と未追跡のファイル）を重ねて、split-plan.md 6 の手順1〜5と、4 の `git cherry-pick --no-commit` の戻し方を、push を除いて実際に打った（origin/main は 9c848bd0 に合わせ、push で進む origin/main は `update-ref` で代えた）。clone の中のコミットでも、Claude の pre-commit の hook はそのまま走った（clone の中で1度だけ、git 自身の hook の置き場を `-c core.hooksPath=/dev/null` で外したコミットを作った。衝突を作るための下地で、Claude の hook には触れていない）。

## 判定

**改善指示（changes-needed）**

第2回の指摘1〜7は、中身としてはすべて直っている。wip のコミットは中身・順とも 4 の表と合っており、表に書いた ID も合っている。しかし、6 の「完了の処理」をいま上から打つと、2か所で止まる。1つは、手順1がもう済んだ作業（ブランチを作って push する）を書いたままで、作業ツリーから途中の作業を外す手順が無いこと。もう1つは、main の木で push するときに `node_modules` が合わず、pre-push の hook が止めること。前者を読み飛ばして手順2の `git add .` を打つと、レビューを通っていない途中の作業がすべて完了のコミットに入る。

## 第2回の指摘の確かめ（1件ずつ）

| #   | 第2回の指摘                                                              | 結果       | 確かめたこと                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | T5-6 の報告の見立てが記録と合わず、上端を変える決定が §5 と T1 に反する  | 解消       | index.md のキャリーオーバーは、原因を「確かめていない」と書いた。上端が 107px になったのは T1 で 0-4 より前であることと、0-4 が10本だけを測ったことも書いた。上端は「T1 の決定と `DESIGN.md` §5 のまま変えない」とした。split-plan.md 7 の3つ目の行も同じ。上端を変えないので、T5a-2b の理由と T5a の測りは動かない。                                                                                               |
| 2   | `design-rollout-wip` が1コミットで、後のサイクルが自分の分を取り出せない | 解消       | タスクごとの5コミットに分かれた（下の「wip のコミットと 4 の表」）。戻し方（`cherry-pick --no-commit` → `restore --staged`）は、clone で衝突のある場合も含めて打った。衝突しても `CHERRY_PICK_HEAD` は残らず、`git restore --staged -- .` は衝突の印を外し、衝突の箇所は作業ツリーに残る。t5a-measure.md と review-t5-13.md は完了のコミットに入れることになった。                                                  |
| 3   | 次のセッションでは `tmp/` が無い                                         | ほぼ解消   | `cycle-316-records` に 3,665 ファイル・約 494MB が置かれた。文書の `tmp/` の参照 145 種を木と突き合わせた。無いものは、README の「写す時点で無かったもの」と「除いたもの」、名前の途中で切れた参照（`r2-*.png` など。木にはその名で始まるファイルがある）だけだった。秘密の値の形（`ghp_`・`sk-ant`・秘密鍵など）も探したが、見つからなかった。T5a-2 の道具と置き方の書き方には、まだ食い違いがある（指摘5）。      |
| 4   | 完了の処理の順と hook の下のコマンドが無い                               | 一部が残る | 6 に順とコマンドが書かれた。手順2〜5の順、`git diff --stat origin/main` で5つのパスだけを確かめる手順、衝突の解き方は、clone で打って正しかった。手順5では `docs/backlog.md` が B-755 の行で衝突し、書いてあるとおり `design-rollout` の側の形に解けた。ただし、手順1が古い（指摘1）。手順3・5の push は hook に止められる（指摘2）。手順3の書き出し方は、candidates.md が禁じる形で、trust-guard も鳴る（指摘3）。 |
| 5   | 分割の決定をオーナーに帰している（AP-WF24）                              | 解消       | split-plan.md は、オーナーの言葉を原文のまま引いた。そのうえで「PM はオーナーの言葉を受けて分割できるかを検討し、分割すると決めた」と書き、進め方はオーナーの指定とした。index.md の作業内容とキャリーオーバーも同じ書き方である。                                                                                                                                                                                  |
| 6   | rebase でなくマージにする理由が不正確                                    | 解消       | cycle-kickoff の手順1と split-plan.md 3 は、共有している push 済みのブランチで、rebase には force push が要り、hook が止めると書いた。`block-destructive-git.sh` の Pattern 10 が `--force` も `-f` も止めることも確かめた。                                                                                                                                                                                        |
| 7   | 細かな記述                                                               | 解消       | 週の利用上限の出どころは、オーナーの言葉だと明記した（split-plan.md 9行、AP-WF43 の発生件数）。AP-WF43 の発生件数は、「作業の量とそのあいだ他の修正を出荷できないことは数えたが、長いサイクルそのものの費用を数えなかった」と書き直した。B-754 のあいだのほかの項目と急ぎの不具合の扱いは、B-754 の行と cycle-kickoff の手順1に書いた。                                                                             |

## wip のコミットと 4 の表

`git log da54202e..origin/design-rollout-wip --stat` を、4 の表と1行ずつ突き合わせた。順・ID・題・中身は表と合う。

- 3001f167 T5-33（`savedLayout.ts`・`ReservedResultArea.tsx` とその試験）
- 83a8cbd9 T5-8b と T5-20d（`DataTable`・frontend-design スキルの `DataTable` の文・ゲーム3本の結果の表。`ResultTable.tsx` の削除を含む）
- d124e336 T5-6（43ファイル。改名 `solvedScreenHeadings` → `solvedScreenPhrases`、新しい `resultTexts.ts`・`readingTableCells.ts` を含む）
- 364a88b0 T5-13（ユーモア辞典の詳細）
- 20a29292 T5a-2b（`character-personality.ts` の3行）

5つ目は `character-personality.ts` だけを変える。3・4はこのファイルに触れないので、2つ目のサイクルで先に戻せるという説明は正しい。作業ツリーの途中の作業と `design-rollout-wip` の木は、65 のパスで同じだった（`git add` で載せて `git switch design-rollout-wip` が通ったことで確かめた）。

## 指摘（重さの順）

### 1. 6 の手順1が済んだ作業を書いたままで、作業ツリーから途中の作業を外す手順が無い（重い。split-plan.md 6・4、index.md のキャリーオーバー）

`design-rollout-wip` は、もうローカルにも origin にもある（20a29292）。ところが、作業ツリーにはまだ途中の作業が残っている（`git status --short` に `src/` の変更と frontend-design スキルが出る）。builder は、作業ツリーから外さずに、`git commit-tree` でコミットを作ったからである。

- 手順1を書いてあるとおりに打つと、最初の `git switch -c design-rollout-wip` が `fatal: a branch named 'design-rollout-wip' already exists` で止まる。そのまま `git switch design-rollout-wip` を打っても、未追跡の4ファイル（`resultTexts.ts` など）が上書きされるとして止まる（clone で確かめた）。
- 手順1を「済んだ」として飛ばし、手順2の `git add .` を打つと、レビューを通っていない途中の作業がすべて完了のコミットに入り、`design-rollout` に push される。この取り違えを防ぐ手順が、いまの文書には無い。手順2の前の `git status --short` の確かめも、手順1の中にしか書いていない。
- 6 の冒頭の括弧（「手順1の `design-rollout-wip` の push だけは…」）、手順1の「`git log --oneline -5` で読み、表に書き入れる」、4 の「完了の処理の初め（6 の手順1）に…残して push し」、index.md のキャリーオーバーの「完了の処理の初めに…残して push する」も、済んだことを先のこととして書いている。

clone で次の手順を打ち、途中の作業だけが外れて、完了のものが残ることを確かめた（パスに `[slug]` を含むが、git は文字どおりにも照らすので載る）。

```bash
git add -A -- $(git diff --name-only da54202e design-rollout-wip)
git switch design-rollout-wip
git status --short          # 完了のもの（docs・2つのスキル・backlog・candidates）だけ
git switch claude/cycle-kickoff-rv3l21
git status --short          # 同じく完了のものだけ。src/ と frontend-design スキルが出ないこと
```

直し方: 6 の手順1を、いまの状態（wip は push 済み、作業ツリーに残っている）から作業ツリーを外す手順に書き換える。上の手順でもよい（`git stash` は、捨てる `git stash drop` を hook が止めるので、退けた分が残り続ける）。手順2の頭にも `git status --short` で `src/` が無いことを確かめる一文を置く。4・6 の冒頭・index.md のキャリーオーバーの「push する」は、済んだこととして書き直す。

### 2. 手順3と手順5の push を pre-push の hook が止める（`node_modules` が main の木と合わない）（重い。split-plan.md 6、cycle-kickoff の手順1）

`pre-push-check.sh` は、push を打つ作業ツリーで typecheck・test・build を走らせ、そのときにはいまの `node_modules` を使う。しかし、cycle-316 で `package.json` が変わっている。main にある `next-themes` が外され、`budoux` が足された。いまの `node_modules` に `next-themes` は無い（`ls node_modules/next-themes` が無い）。

- 手順3では `origin/main` の木（`cycle-316-steps`）から push する。clone で main の木を書き出し、いまの `node_modules` で `tsc --noEmit` を走らせると、`src/components/ThemeProvider/index.tsx` などが `Cannot find module 'next-themes'` で落ちた。typecheck で止まり、main に push できない。
- 手順3のあとで `npm ci` を打てば手順3は通る。しかし、手順5で `claude/cycle-kickoff-rv3l21` に戻ると、今度は `budoux` が無い。手順5の push も止まる。
- 6 の冒頭の「手順2・3・5の push は、push するコミットと同じ中身の木で検査される」は、`node_modules` が木と合っていることを前提にしている。手順3・5では、この前提が成り立たない。
- 次のサイクルのセッションも、main から始まって `design-rollout` に移る（cycle-kickoff の手順1）。そのセッションの `node_modules` が main の `package-lock.json` から入っていれば、`budoux` が無く、型・試験・build が落ちる。手順1は「そのブランチに移り、`origin/main` をマージしてから」としか書いていない。

hook に止められると、回り道に誘われる（補足事項の builder の件と同じ形）。

直し方: 6 の手順3の `git switch -c cycle-316-steps origin/main` の直後と、手順5の `git switch claude/cycle-kickoff-rv3l21` の直後に、`npm ci` を置く。理由も一言書く（`package.json` がブランチで違うため）。cycle-kickoff の手順1にも、統合のブランチに移ってマージしたあとで依存を入れ直す（`npm ci`）ことを書く。最後のサイクルが main にマージして push するときも同じである。

### 3. 手順3の `git show … > <ファイル>` は、candidates.md が禁じている書き戻しで、trust-guard の注入の警告も鳴らす（中。split-plan.md 6 の手順3）

手順3は、2つのスキルと `candidates.md` を `git show claude/cycle-kickoff-rv3l21:<パス> > <パス>` で書き出す。

- `docs/anti-patterns/candidates.md` の AP-WF21 の取り下げの記録は、「Edit/Write を使わず `git show` + bash で書き戻す」運用を、安全策を回避するハッキングとし、「絶対に採ってはならない。ファイル編集は常に Edit/Write を使うこと」と定めている。手順は、この形をそのまま使っている。
- `.claude/skills` と `docs/anti-patterns` は、`trust-guard.sh` の守る面である。Bash で書き換えると、PostToolUse の check が「プロンプトインジェクション警告…git から正しいファイルを復元してください」を出す（exit 2）。予告の無いまま手順の途中でこれが出ると、PM が復元に走るか、警告を読み流す癖が付く。

直し方: 3つのファイルも、`deploy.yml` や `backlog.md` と同じく Edit で直す。差分は小さい（cycle-kickoff +2行、cycle-completion の手順7、candidates.md の AP-WF42・AP-WF43 の2節）。`git diff origin/main claude/cycle-kickoff-rv3l21 -- <パス>` で差分を見てから当てればよい。push の前の `git diff --stat origin/main` の確かめは、そのまま残す。

### 4. main で急ぎの不具合を直すサイクルの番号が、統合のブランチのサイクルと重なる（中。cycle-kickoff の手順1・手順5、split-plan.md 3）

cycle-kickoff の手順1は、本番の急ぎの不具合だけは main の上で直すサイクルを立てるとしている。一方で手順5は、サイクルの番号を「前回のサイクルドキュメントの番号に1を足したもの」とする。main の上の最新は cycle-315 なので、急ぎのサイクルは cycle-316 になる。これは、`design-rollout` の cycle-316（と、その後の 317 以降）と重なる。次のキックオフで main を `design-rollout` にマージすると、`docs/cycles/cycle-316/index.md` が両方の側で足されて衝突し、1つのディレクトリに2つのサイクルが混ざる。急ぎの道を手順に書いた以上、その道が番号で壊れないようにしておく必要がある。

直し方: cycle-kickoff の手順1の急ぎの不具合の文に、番号は統合のブランチを含めた最新の番号に1を足すことを書く（例: `git ls-tree --name-only origin/design-rollout docs/cycles/` で確かめる）。統合のブランチの側のキックオフも、main の側の急ぎのサイクルを数に入れる。統合のブランチの名前は backlog から引けるので、手順1の一般の書き方のままで書ける。

### 5. T5a の行が、builder の測りの道具が残っていないことを映していない。records の置き方と使い方の書き方も、README と食い違う（中。split-plan.md 4・7、index.md のキャリーオーバー）

- **T5a の道具**: 7 の2つ目の行は「測りの道具は `cycle-316-records` から使う（4）」とする。index.md のキャリーオーバーも「T5-6・T5a のサイクルは測りの道具をそこから使い」とする。しかし、README によれば、T5a-2 の builder の道具は測りのあとで消されている（t5a-measure.md 0章「測り終えて書き出しごと消した。上の手順の文で組み直せる」）。残っているのは、レビュアーが再測りに使った `scratchpad/rev-t5a2/`（4-4 の近似の `<style>` を `scan.cjs` に持つ）だけである。T5a のサイクルは、t5a-measure.md の手順の文から道具を組み直すのか、レビュアーの道具を元にするのかを決めることになる。行には、残っているのはレビュアーの道具だけだと書き、どちらにするかを T5a のサイクルが決めることも書く。
- **置き方**: 4 は「`tmp-records/` に、元のパスのまま残して」とし、読み方を `tmp-records/<パス>` だけで示している。実際には、スクラッチパッドのものは `tmp-records/scratchpad/<パス>` にある（文書の参照は `/tmp/claude-0/.../scratchpad/...`）。T5-6 と T5-33 の道具もここにある。また、画像を除いたディレクトリと、写す時点で無かったファイルがある（README の「除いたもの」「写す時点で無かったもの」）。4 は、対応と除いたもの・無かったものを README（`git show origin/cycle-316-records:tmp-records/README.md`）が持つことを示し、スクラッチパッドの置き方も一言書く。4 の「T5-6・T5a-2 の測りの道具」には T5-33 の道具（`scratchpad/t5-33/m/`）も入っているので、それも書く。
- **使い方**: 4 は、道具を使うときも `git show` で作業ツリーの `tmp/` に書き出すとしている。しかし、T5-6 の `m/lib.cjs` は `require("../node_modules/playwright")` で読む。README も「道具のディレクトリをリポジトリを写した作業場の直下に置き」とする。`tmp/scratchpad/t5-6/m/` に書き出すと、`../node_modules` が無いので動かない。また、道具はディレクトリごと（T5-6 は 31 ファイルとその下の画像）なので、`git show` で1ファイルずつ書き出すのは現実的でない。`git archive origin/cycle-316-records tmp-records/scratchpad/t5-6/m | tar -x -C <置き場>` のように、ディレクトリごと書き出す書き方にする。置き場は README と食い違わないように決める。
- **T11**: 7 の T11 の行は「`cycle-316-records` から参照先を読んで本文に書き写す」とする。README の「写す時点で無かったもの」（`tmp/t1a/` の全体、`tmp/lh/before/` など）と、画像を除いたディレクトリは、読めない。T11 はそれをどう書くか（失われたと書く、など）を決めることになる。行にそのことを書いておく。
- README の「## 測りの道具」の頭の「どちらも」は、3つ（T5-6・T5a-2・T5-33）を指すので「どれも」になる（records の側の小さな直し）。

### 6. t5a-measure.md の頭に、レビューの途中で要修正であることが書かれていない（軽い。t5a-measure.md）

第2回で、測りの文書を完了のコミットに入れるなら「レビュー前であることは文書の頭に書く」とした。split-plan.md 4 と index.md は「第10回で要修正のまま」と書いたが、t5a-measure.md 自身の頭には何も無い。この文書は `design-rollout` の上で T5a-7 や B-620（backlog の Deferred が「T5a-2 の測りの条件7」を材料に挙げている）から直に開かれる。開いた者が承認された値として読まないよう、冒頭の段落に「レビュー第10回（review-t5a-2-10.md）で要修正のまま。T5a のサイクルが直す」の一文を置く。

### 7. `cycle-316-records` が約 494MB あり、`git fetch origin` のたびに取りに行く（軽い。split-plan.md 4・6）

リポジトリの pack は約 340MB である。records の木は約 494MB で、画像は圧縮がほとんど効かない。6 の手順3の `git fetch origin` と、各サイクルのキックオフのマージの前の fetch は、全ブランチを取るので、records も取りに行く。新しいセッションの clone が全ブランチを取るなら、そこでも重くなる。records を消すのは出荷のサイクルまで先である。

直し方: 6 の手順3と cycle-kickoff の手順1の fetch を、要るブランチだけにする（`git fetch origin main`、`git fetch origin main design-rollout`）。4 の「records は読むときだけ `git fetch origin cycle-316-records` で取る」はそのままでよい。重さを受け入れるなら、そう書く。

## 確かめて問題が無かったこと

- **hook**: 手順2〜5のコマンドのうち、`git switch -c … origin/main`・`git restore --staged -- .`・`git push origin --delete design-rollout-wip`・`git branch -d cycle-316-steps` は、`block-destructive-git.sh` のどのパターンにも当たらない（`git branch -d` は小文字なので Pattern 11 に当たらない）。`cycle-316-steps` は `origin/main` を追う設定で作られる。push で `origin/main` が進めば、`-d` は「上流にマージ済み」として通る。なお、`git checkout -q -b …` のように `-b` の前に別の旗を置くと Pattern 5 に止められた（このレビューの clone で起きた）。手順は `git switch` を使っているので、当たらない。
- **pre-commit と backlog の行の長さ**: 手順2の完了のコミット・手順3の手順のコミット・手順5のマージのコミットを clone で作り、いまの作業ツリーに対する pre-commit の hook が通ることを確かめた。backlog で200字を超える行は無い（いちばん長いのは B-588 の200字で、変えていない行。B-754 は197字。main の側で B-754 の行だけを差し替えても197字）。
- **手順5のマージ**: 2つのスキル・`candidates.md`・`deploy.yml` は衝突しない。`backlog.md` は B-755 の行だけで衝突し、文書の解き方で `design-rollout` の側の形に解ける。git は stdin が端末でないときマージの文を編集させないので、`git merge origin/main` は待ち状態にならない。
- **出荷されないこと**: `vercel.json` は `"**": false, "main": true` である。`deploy.yml` は CI のジョブだけで、出荷のジョブを持たない。`design-rollout` を `on.push.branches` に足しても、出荷は起きない。
- **次のセッションの入口**: main の上で、B-754 の行が `design-rollout` と split-plan.md を指す。cycle-kickoff の手順1は、最新のサイクルを読む前にブランチを移るよう書いている。`design-rollout` の上の最新は、完了した cycle-316 になる。`stop-cycle-guard.sh` は、どちらのブランチでも最新のサイクルが完了しているので止めない。
- **ツギハギ**: cycle-kickoff の手順1の段落と cycle-completion の手順7は、統合のブランチの運用を最初から書いた形で読める。AP-WF43 候補はほかの候補と同じ形である。split-plan.md・index.md はサイクルの文書なので、経緯を書いてよい。
- **文書からの新しい `tmp/` の参照**: 今回の変更が足した `tmp/` は、どれも「`tmp/` を参照している箇所」という一般の言い方か、records の置き方の説明である。新しく `tmp/` の下のファイルを指す参照は無い。
- **補足事項の hook の件**: builder が `git commit-tree` で pre-commit を避けたことを記録した。PM がその後 pre-push のフルスイートを通して push したことと、以後の依頼文の対処も書いた。完了の処理の AP の点検で扱うとした。記録として足りている。

## PM へ

指摘が1つ以上あるので、次のとおり進めてください。

1. split-plan.md と index.md の直し（指摘1・2・4・5・6・7）は planner に、cycle-kickoff の手順1の直し（指摘2の `npm ci`・指摘4の番号・指摘7の fetch）は planner か builder に、`cycle-316-records` の README の直し（指摘5の「どちらも」）は builder にさせる。指摘1の手順は、上の clone で打った形を出発点にしてよい。ただし、書き換えたあと、手順1〜5を上から通しで（push を除いて）clone で打ち直して確かめさせる。
2. 直したあと、もう一度レビューを依頼する。そのときは、今回の指摘だけでなく全体を見直させる。
