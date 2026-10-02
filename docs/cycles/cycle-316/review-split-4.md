# レビュー（4回目）: cycle-316 の分割（split-plan.md と関連の変更）

対象: 作業ツリーの `git diff -- docs .claude/skills/cycle-completion .claude/skills/cycle-kickoff` の全体、未追跡の `split-plan.md`・`t5a-measure.md`・`review-t5-13.md`・`review-split*.md`、`git log da54202e..origin/design-rollout-wip --stat`、`origin/cycle-316-records`（b42b12cf）の `tmp-records/README.md`。照らし合わせたものは、`docs/constitution.md`、CLAUDE.md、`docs/anti-patterns/planning.md`・`workflow.md`・`candidates.md`、`.claude/hooks/` の hook（block-destructive-git・pre-commit-check・pre-push-check・backlog-line-length-check・session-start-facts）、`.github/workflows/deploy.yml`、`scripts/wait-for-ci.sh`、`tsconfig.json`・`next-env.d.ts`・`src/__tests__/bundle-budget.test.ts`、`docs/knowledge/nextjs.md`、cycle-313 の index.md・incident-7.md・incident-8.md、cycle-314・cycle-315 の index.md。

確かめ方:

- リポジトリを scratchpad に clone し（origin は GitHub、push の先は存在しないパスに付け替えた）、いまの作業ツリー（変更 66・未追跡 10・削除 2）を重ねて、`git status --short` が元の作業ツリーと同じになることを確かめてから、split-plan.md 6 の手順1〜5を、push を除いて上から打った。push は `git update-ref` で origin の参照を進めて代えた。3つのファイルへの Edit は、手順の差分を当てて代えた。
- ディスクの空きが 963MB しか無いので（`df -h /`。98% 使用）、clone で `npm ci` と build は打たなかった。代わりに、2つの lock を空のディレクトリに置き、npm 10.9.7 と npm 11.21.0 で `npm ci --dry-run --ignore-scripts` を打った。フルスイートについては、planner の clone（scratchpad の `split-verify-5`・`split-verify-4`）に残った記録を読んだ。

## 判定

**改善指示（changes-needed）**

第3回の指摘1〜7は、すべて解消した。split-plan.md 6 の手順は、上から打って止まらずに通った（下の「手順を打った結果」）。(A)(B) の判断と、split-plan.md・2つのスキルへの書き方も正しい。ただし、PM が足した `docs/knowledge/dependency-security.md` の節には次の問題がある。(A) は原因と過去の記録を書いておらず、「cycle-316 で得た知見」とするのは誤りである。(B) は、`.next` の型の知見をすでに持つ `docs/knowledge/nextjs.md` §11 と別の場所に書かれ、`dependency-security.md` の主題とも合わない（指摘1）。ほかに、記録の軽い抜けが2つある。

## 第3回の指摘の確かめ（1件ずつ）

| #   | 第3回の指摘                                                                   | 結果 | 確かめたこと                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 手順1が済んだ作業を書いたままで、作業ツリーから途中の作業を外す手順が無い     | 解消 | 6 の手順1は「途中の作業を作業ツリーから外す」になった。`git add -A -- …`・`git switch design-rollout-wip`・`git switch claude/cycle-kickoff-rv3l21` を clone で打った。結果、完了のもの（変更 6・未追跡 6）だけが残り、`src/` と frontend-design スキルは消えた。手順2の頭にも `git status --short` が置かれた。4・6 の冒頭・index.md のキャリーオーバーは、`design-rollout-wip` を「push した」と、済んだこととして書いている。                                                       |
| 2   | 手順3・5の push を pre-push の hook が止める（`node_modules` が木と合わない） | 解消 | 手順3の `switch` の直後に `npx -y npm@11 ci` と `rm -rf .next` が置かれ、手順5の `switch` の直後に `npm ci` と `rm -rf .next` が置かれた。cycle-kickoff の手順1にも、マージのあとで `npm ci` と `rm -rf .next` を打つことが書かれた。cycle-completion の手順7にも、ブランチを移ってプッシュするときの規則として書かれた。planner の clone の記録では、手順2・3・5のどの木でも、format:check・lint・typecheck・test・build が通っている（`split-verify-5` の `s2-*`・`s3-*`・`s5-*`）。 |
| 3   | 手順3の `git show … > <パス>` が AP-WF21 の記録に反し、trust-guard も鳴らす   | 解消 | 3つのファイルも Edit で当てる手順になった。当てる前に `git diff origin/main...claude/cycle-kickoff-rv3l21` で差分を見て、当てたあとで `git diff claude/cycle-kickoff-rv3l21 -- <3つ>` が空になることを確かめる。clone では、差分（84行）が main の上にそのまま当たり、確かめの diff は空だった。                                                                                                                                                                                       |
| 4   | main の急ぎのサイクルの番号が、統合のブランチのサイクルと重なる               | 解消 | cycle-kickoff の手順5は、両方のブランチの `docs/cycles/` の最新に1を足すことを、いまいない側のブランチの見方（`git ls-tree`）とともに書いた。split-plan.md 3 も同じである。                                                                                                                                                                                                                                                                                                            |
| 5   | T5a の道具・records の置き方と使い方・T11 の扱い・README の「どちらも」       | 解消 | split-plan.md 4 は、置き方（`tmp-records/` と `tmp-records/scratchpad/`）、3つの道具とその置き場、`git archive … \| tar -x` での書き出し、T5a-2 の builder の道具が無いことを書いた。7 の2行目は、残っているのはレビュアーの道具だけなので、それを元に組み直すと書いた。T11 の行は、読めないものを参照している文を、その事実に合わせて書き直すと書いた。README（b42b12cf）は「どれも」に直り、`--strip-components` の使い方と道具ごとの置き場が split-plan.md 4 と食い違わない。       |
| 6   | t5a-measure.md の頭に、要修正のままであることが書かれていない                 | 解消 | 冒頭の段落のすぐ下に、太字で「レビュー第10回（review-t5a-2-10.md）で要修正のままで、ここにある値は承認されていない。T5a のサイクルが直してレビューを続ける。」が入った。                                                                                                                                                                                                                                                                                                               |
| 7   | `cycle-316-records`（約 494MB）を fetch のたびに取りに行く                    | 解消 | 6 の手順3は `git fetch origin main` に、cycle-kickoff の手順1は `git fetch origin main <統合のブランチ>` になった。split-plan.md 4 の「取り方」は、records を使うサイクルだけが名指して取ると書いた。                                                                                                                                                                                                                                                                                  |

## 手順を打った結果（clone。push を除く）

- **手順1**: 上の表の1のとおり。`[slug]` を含むパスも載った。
- **手順2**: `git status --short` に `src/` は出ない。`git add .` と commit が通った（pre-commit の hook も通った）。
- **手順3**: `git switch -c cycle-316-steps origin/main` は origin/main（9c848bd0）を追う設定で作られた。2つのスキルと `candidates.md` に差分を当て、`deploy.yml` の `on.push.branches` に `design-rollout` を足し、`backlog.md` の B-754 の行だけを差し替えた。main の B-754 は Queued の表にあり、差し替えたあとの行は197字だった。このあと、`git diff --stat origin/main` は5つのパスだけを示した。
- **手順5**: `git merge origin/main` は `docs/backlog.md` の1か所だけで衝突した（main の側の Queued の B-755 の行。`design-rollout` の側では Deferred に移してある）。`design-rollout` の側の形に解き、`git add` と `git commit --no-edit` でマージが終わった。マージのコミットが完了のコミットに足すのは `deploy.yml` の1行だけだった。push を `update-ref` で代えたあとで、`git branch -d cycle-316-steps` は通った。
- **lock**: npm 10.9.7 の `npm ci` は、main の lock では `Missing: typescript@5.9.3 from lock file` で止まり、cycle-316 の lock では通った。npm 11.21.0 では両方とも通った。したがって、手順5の `npm ci`（npm 10）も、`design-rollout` の CI（Node 24・npm 11）も lock では止まらない。
- **`.next`**: `next-env.d.ts` は `./.next/types/routes.d.ts` を副作用の import で読む。`.next` を消した木でも、typecheck は通る（planner の `split-verify-4` の `main2-typecheck.log`）。`bundle-budget.test.ts` は `.next/build-manifest.json` が無いと全体を飛ばすので、`rm -rf .next` のあとで試験が先に走っても落ちない。消さずに cycle-316 の `.next` のまま main の木を検査すると、`.next/types/validator.ts` の TS2307 と bundle-budget で落ちることも、同じ記録（`main-typecheck.log`・`main-test.log`）で確かめた。
- **hook**: 手順のコマンドは、block-destructive-git のどのパターンにも当たらない（このレビューの clone の準備で、`git checkout <ブランチ>` が Pattern 5 に止められた。手順は `git switch` を使うので当たらない）。

## 指摘（重さの順）

### 1. knowledge の新しい節で、(A) の原因と過去の記録が抜け、(B) が置き場を誤っている（中。`docs/knowledge/dependency-security.md`）

**(A) の原因と出どころ**: 節は「npm 11 が書いた `package-lock.json` には npm 10 の `npm ci` が通らないものがあり…（lock は壊れていない）」とし、冒頭は「cycle-316 で得た知見」とする。しかし、この失敗の原因は cycle-313 ですでに突き止められている。

- 原因は、`vite-tsconfig-paths` の下の `tsconfck` の optional peer `typescript@^5.0.0` を、ルートの `typescript` 6.0.3 が満たさないことである。npm 10 は、それを満たす入れ子の typescript 5.x を lock に求める。lock にその入れ子が無いと、`Missing: typescript@5.9.3` で止まる。出どころは cycle-313 の incident-7.md・incident-8.md、index.md の 788 行、コミット 684c89f5 の本文である。
- このレビューでも lock を読んで確かめた。cycle-316 の lock には `node_modules/vite-tsconfig-paths/node_modules/typescript`（5.9.3）があり、main の lock には無い。入れ子のある lock は npm 10 と npm 11 の両方で通る。cycle-316 の lock は、このサイクルのコンテナ（npm 10）で書かれ、入れ子を持つ。lock の履歴にも、この入れ子を足すコミットと消すコミット（Dependabot のものを含む）が並んでおり、どの版の npm が書いたかで入れ子の有無が変わる形をしている。
- 根から直す方法（`vite-tsconfig-paths` を外して Vite の `resolve.tsconfigPaths` に移す）は cycle-313 で通ったが、cycle-313 の revert で戻された。`npx npm@11… ci` で入れる回避は、cycle-314・cycle-315 の index.md に書かれている。

いまの書き方では、読んだ者は「npm の版の違い」という環境の問題として受け取り、原因（optional peer）と根からの直し方に行き着けない。cycle-313 の incident-7 は、まさにこの失敗を「環境の制約」として扱ったことを事故とした。knowledge がその見方に戻ってはならない。

**(B) の置き場**: 「ブランチを移って…`.next` も消す（tsconfig が含む `.next/types` が…typecheck が落ちる）」は依存の話ではない。`.next` の型のファイルが残って typecheck が落ちることは、`docs/knowledge/nextjs.md` §11 がすでに扱っている（`.next/dev/types/` について）。しかも §11 は「`npm run build` は別の `.next/types/` を作り直して通る」と書くだけで、`.next/types/` そのものが別の木の build の結果のまま残る場合を扱っていない。pre-push の hook は build の前に typecheck を走らせるので、ここで落ちる。同じ種類の知見が2つのファイルに分かれ、`dependency-security.md` の題（「…・lock ファイル」）とも合わない。新しい節の書き方も、`.next` を消す理由を `npm ci` を打ち直したことに結び付けているが、消す理由はブランチを移ったことで、`npm ci` とは関わりがない。

直し方:

- `dependency-security.md` の節は (A) だけにし、原因（`tsconfck` の optional peer と、入れ子の有無）、入れ子のある lock は両方の版で通ること、根から直す方法と、それが cycle-313 で戻されたこと、回避（`npx -y npm@11 ci`）と、その回避が cycle-314 から使われていることを書く。根拠には cycle-313 の incident-7.md と、cycle-316 での実測を挙げる。冒頭の「最後の節は…cycle-316 で得た知見」も、それに合わせて直す。
- (B) は `nextjs.md` §11 に入れる。§11 を「`.next/types/` と `.next/dev/types/` が別の木のものだと、commit と push の typecheck が落ちる」形に書き直し、ブランチを移ったときに `rm -rf .next` を打つこと、`bundle-budget.test.ts` も `.next` の build の結果を読むこと、根拠（cycle-316。main の木を cycle-316 の `.next` のまま検査して、TS2307 と bundle-budget で落ちた）を足す。元の節に後から書き足した跡が残らないようにする（CLAUDE.md のツギハギ禁止）。
- split-plan.md 6 と2つのスキルの (A)(B) の書き方は、それ自体は正しいので変えなくてよい。

### 2. index.md のレビュー結果の表に第3回の行が無く、「実施する作業」の分割の項目も knowledge の変更を挙げていない（軽い。index.md）

- 「レビュー結果」の表には、B-754 の分割の第1回（review-split.md）と第2回（review-split-2.md）の行がある。しかし、第3回（review-split-3.md。重い2・中3・軽い2、改善指示）の行は無い。第3回の指摘を受けた直し（手順1の書き換え・`npm ci`・Edit での当て方・番号・fetch・records の書き方、README の直し）とその担当（planner・builder・PM）を、第1回・第2回と同じ形で足す。このレビュー（第4回）の行も、同じく足す。
- 「実施する作業」の「B-754 の分割」の項目は、直すものとして「2つのスキル・backlog・AP-WF43 候補」を挙げている。このサイクルで足した knowledge の節（指摘1で直すもの）が、そこに無い。

### 3. 最後のサイクルの手順に、統合のブランチを片付けることが無い（軽い。cycle-completion の手順7、split-plan.md 1）

cycle-completion の手順7の「最後のサイクル」は、`deploy.yml` と backlog から統合のブランチの名前を外して、main にマージして出荷するところまでを書く。しかし、`design-rollout` を origin から消すことは書いていない。split-plan.md 1 の「出荷」も同じである。`design-rollout-wip` と `cycle-316-records` には消す時期が書かれているのに、統合のブランチだけが出荷のあとも残る。キックオフの手順1は backlog を見て動くので、残っても誤って移る心配は無い。ただ、統合のブランチが残っていると、後のセッションは、使い終えたものか進行中のものかをブランチの一覧から見分けられない。手順7の最後のサイクルの文に、出荷の CI を確かめたあとで `git push origin --delete <統合のブランチ>` で消すことを足す。split-plan.md 1 の「出荷」にも一言足す。

## 確かめて問題が無かったこと

- **wip のコミット**: `git log da54202e..origin/design-rollout-wip --stat` は 3001f167（T5-33）・83a8cbd9（T5-8b と T5-20d。frontend-design スキルを含む）・d124e336（T5-6）・364a88b0（T5-13）・20a29292（T5a-2b）で、4 の表と順・ID・中身が合う。ローカルの `design-rollout-wip` と origin のものは同じ（20a29292）である。
- **(A)(B) の判断**: (A) は、手順3の main の木でだけ要る。main の lock を直すことは、この手順のコミット（来訪者に見える変更を含まないもの）の範囲を外れるので、npm 11 で入れる判断は妥当である。cycle-316 の lock は両方の版で通るので、手順5とキックオフの `npm ci`（npm 10）も、CI（npm 11）も止まらない。(B) は、ブランチを移るたびに打つ規則として、2つのスキルに一般の形で書かれている。どちらのスキルの文も、統合のブランチの運用を最初から書いた形で読め、ツギハギは無い。
- **次のセッション**: main の上では、Queued の B-754 の行が `design-rollout` と cycle-kickoff の手順1を指す。手順1の `git fetch origin main design-rollout` のあとの `git switch design-rollout` は、origin のブランチを追うローカルのブランチを作る。移った先の最新のサイクルは、完了した cycle-316 である。手順5の番号は、main の 315 と `design-rollout` の 316 から 317 になる。1つ目のサイクルは、split-plan.md 7 の表の1行目と 4 の表から、`cherry-pick --no-commit` で戻すコミット（1・2）を引ける。session-start-facts と stop-cycle-guard は、どちらのブランチでも最新のサイクルを完了と見るので止めない。
- **backlog**: 200字を超える行は無い（最長は変えていない B-588 の行の200字。B-754 は197字）。
- **文書からの新しい `tmp/` の参照**: 足された `tmp/` は、どれも `cycle-316-records` の置き方の説明（`tmp/<パス>` → `tmp-records/<パス>`）か、一般の言い方である。ファイルを指す新しい参照は無い。t5a-measure.md と review-t5-13.md には `tmp/` の参照が無い。
- **ツギハギ**: split-plan.md・index.md はサイクルの文書で、経緯を書いてよい。2つのスキルと AP-WF43 候補に、後から書き足した跡は無い。knowledge の節については、指摘1のとおりである。

## PM へ

指摘が1つ以上あるので、次のとおり進めてください。

1. 指摘1の knowledge の直し（`dependency-security.md` の節と `nextjs.md` §11）は builder に、指摘2の index.md の直しと指摘3の split-plan.md の直しは planner に、指摘3の cycle-completion の手順7の直しは planner か builder にさせる。
2. 直したあと、もう一度レビューを依頼する。そのときは、今回の指摘だけでなく全体を見直させる。

あわせて、手順を打つ前の注意を書いておく（文書の指摘ではない）。いま `/` の空きは 963MB しかない。手順2の push の hook は、6GB ある `.next` の上で build を走らせ、手順3は `npm ci` で `node_modules`（約 954MB）を入れ直す。そこで、始める前に `df -h /` を確かめ、要らなくなった scratchpad の clone（`split-verify-4`・`split-verify-5`。計 3.5GB ほど）を消して、空きを作っておくのが安全である。手順3の `npx -y npm@11 ci` と `rm -rf .next` の順を入れ替えて、`.next` を先に消すと、空きの少ないときでもより安全になる。
