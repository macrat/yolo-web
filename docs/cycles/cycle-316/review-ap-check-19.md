# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（19巡目）

判定: **承認**

レビュアーの環境には Write が無く、新しいファイルを作れなかった。そのため、レビュアーの報告の本文を PM がこのファイルにそのまま写した。

対象:

- review-ap-check-18.md の指摘への対応
  - split-plan.md 7 の表の1行目
  - carryover.md の1つ目のサイクルの申し送り
  - `cycle-completion` の手順7
  - decisions.md の18巡目の行
  - index.md・review-log.md の点検の行
- `docs/cycles/cycle-316/`（未追跡を含む）
- `docs/anti-patterns/` の5つのファイル
  - 全体と `git diff HEAD -- docs/anti-patterns`
  - 候補と欠番の番号の git の履歴
- `.claude/rules/file-editing.md`・`.claude/rules/anti-patterns-directory.md`・`.claude/rules/worktrees.md`
- `cycle-kickoff`・`cycle-completion` の SKILL.md、`.claude/agents/reviewer.md`、`docs/backlog.md`
- split-plan.md 6 の手順0〜5
  - 作業ツリーの `.claude/hooks/` と `.claude/settings.json` に突き合わせた。
  - main の木は `git show origin/main:<パス>` で突き合わせた。

指摘は AP-WF38 のとおり、次の3つに限った。

- 後の作業を誤らせる実体の誤り
- 虚偽の記録
- 規則に反する所

時刻と原文は、次の2つで確かめた。

- 主の jsonl（`7ec6fd95-….jsonl`）の 35640〜35703 行（16:11〜16:21）
- `subagents/agent-ad43e0832a836eb1a.jsonl`（18巡目の対処の担当）

PM がこのファイルの前の巡の記録を写した形も確かめた。`subagents/agent-aae069df746a587eb.jsonl`（18巡目のレビュアー）の報告の本文と review-ap-check-18.md を比べ、空白と空行を除いて一致した。

## 指摘

なし。

## 確かめて問題がなかったもの

- **18巡目の中1 の対処（B-786）**
  - split-plan.md 7 の表の1行目は、B-784 と並べて B-786 を挙げている。中身は次の2つである。
    - 並行する担当が1つの作業ツリーとコンテナを共有して起きる衝突を、hook でなく担当ごとの木とコミットする者の決め方で無くす。
    - 残りのサイクルはどれも担当を並行して動かすので、最初に置く。
  - carryover.md の申し送りは、1つ目のサイクルが B-784 と B-786 を行うと書く。理由は子の項目に分けてある。
    - B-784 の理由は、前の版の文をそのまま残している。
    - B-786 の理由は、decisions.md の「hook の取り消し」の行を指す。
  - backlog の B-786 の行（Deferred）は「着手: design-rolloutの1つ目のサイクル(B-784と同時)」と書く。
  - decisions.md の「hook の取り消し」の行の backlog の項も、同じ時期を書く。
  - 表のあとの「上の表はそれに合わせてある」は、B-786 についても真になった。
  - B-786 は Deferred にあり、同じ時期の B-784 は Queued にある。`cycle-kickoff` の手順3は、着手できるようになった Deferred の項目を Queued に移す。1つ目のサイクルのキックオフで B-786 は拾われるので、置き場所の違いは後の作業を誤らせない。
  - 1つ目のサイクルは、表の作業・B-784・B-786 を抱える。split-plan.md 7 の冒頭は「各サイクルのキックオフで、その回に収まるかを改めて見積もり、収まらなければさらに分ける」と書くので、量の見直しの道はある。
- **18巡目の軽1 の対処（`cycle-completion` の手順7）**
  - 作り方の文は、次の形になった。
    - main にあるファイルは、Edit で変更を当てる。
    - main に無いファイル（そのサイクルが新しく作った規則など）は、Write で完了のコミットと同じ中身に作る。
  - main にある側に「同じ変更」と書いていないのは正しい。`backlog.md` と `deploy.yml` は一部だけを変えるからである。
  - 同じ段落の後ろの確かめの範囲は、「完了のコミットと同じ中身にしたパス」に限っている。この範囲と食い違わない。
  - split-plan.md 2 の `cycle-completion` の項は、作り方の道具（Edit・Write）に触れていない。食い違いは無い。
  - split-plan.md 6 の前書きと手順3 は、もともと「変わった所を Edit で当て、main に無い規則は Write で作る」と書く。スキルとも合う。
  - 手順3 は、完了のコミットの版のスキルをそのまま当てる。そのため、1つ目の差分は空のまま通る。
- **書き換えで防壁が消えていないこと（AP-WF41）**
  - 前の版と今の版を並べて読んだ（担当の Edit の old_string と new_string）。
  - carryover.md: B-784 の理由・検査の対象・線を決める時期の文は、残っている。
  - split-plan.md 7: B-784 の文は、残っている。
  - スキル: 次の文は残っている。
    - `git add -- <パス>` で名指して載せる文
    - `git diff <完了のコミット>` の確かめ
    - push の前の `git status --short`・`git diff --name-only origin/main` の確かめ
- **18巡目の対処の担当の進め方**
  - リポジトリのファイルを変えたのは Edit だけだった。Bash は、読み取りと `npx prettier --write`・`--check`（整形の道具。すべて unchanged で通った）だけだった。
  - Edit は、どれも前の結果を見てから次を出している。結果を待たずに並べたのは、別のファイルの Read だけだった。
- **記録の数**
  - review-log.md・review-response.md を除く review-\*.md は 421 本ある。index.md と合う。
  - 分割と完了の処理の 32 も実数と合う（review-split 7、review-ap-check 18、review-ap-fixes 7）。
  - review-log.md の点検の行は、1〜18 の記録を巡の順に並べている。
  - このファイルで 422 本になる。
- **main に入る5つのパス**: どれも main の木でも正しく、main に無いものを指さない。
  - `cycle-completion` が指すのは、`deploy.yml`・`scripts/wait-for-ci.sh`・`pre-push-check.sh`・`cycle-kickoff` の手順1だけである。
  - `npm@11` の回避は、スキルの文の中で完結している。
  - `cycle-kickoff` が指すのは、`SessionStart` の hook と、名指しの fetch で取る統合のブランチだけである。
  - `file-editing.md` が指す先は、どれも main にある。
    - `.claude/settings.json` の PostToolUse の hook（`origin/main` と HEAD で差が無い）
    - `pre-commit-check.sh`・`pre-push-check.sh`
    - AP-WF08
  - backlog の B-754 の行は 200 字の線（`backlog-line-length-check.sh`）の下にある。backlog のどの行も 200 字を超えない。
- **`docs/anti-patterns/` の変更**: ツギハギは無い。次のどれにも反しない。
  - `.claude/rules/anti-patterns-directory.md`
  - オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）
  - オーナーの 10-02 の言葉（AP-WF24 の本文の優先の順は constitution.md・CLAUDE.md・システムが入れた hook の順で、権限の判定をこの順に入れていない）
  - AP-WF01・完了のチェックリスト・`.claude/agents/reviewer.md`
  - 発生の欄はサイクルの番号だけにしてあり、事例はサイクルの文書に置いた。
  - 本体に手順は書いていない。
  - 昇格した AP-WF29・30・38・39・41・50 は、どれも操作やコミットの前に問える形である。
- **番号と欠番**
  - `git log --all -S` は、AP-WF51・AP-WF52・AP-WF53 のどれにもコミットを返さない。
  - AP-WF50 は、cycle-313 のコミット（d50e8008・3c95b383・af3cb261）が「次は AP-WF50 から採る」と書いた番号である。使い終えた番号の使い直しではない。
  - AP-WF51 候補は、作業ツリーの candidates.md にある（split-plan.md 8 のとおり）。
  - AP-WF52 の欠番の行は、decisions.md の15巡目の行と合う。
- **後のサイクルが読む所にある再発防止**
  - PM がシェルでリポジトリのファイルを書いた件: `file-editing.md`。手順のコミットで main にも入る。
  - 名前で探して他人のプロセスを止めた件と `playwright install` の件: `design-rollout` の `docs/knowledge/playwright-mcp.md` と B-786。main で急ぎのサイクルを立てるときは、`cycle-kickoff` の手順1が統合のブランチの knowledge を先に読ませる。
  - hook を回り道で避けた件と、他人の変更がコミットに入る件: AP-WF50 と B-786。
  - 文書の肥大: AP-WF17 候補と B-784。
  - 案の比べ方: AP-WF51 候補。
  - どれも、split-plan.md 7・carryover.md・backlog・スキル・アンチパターン集のどこかから、次のサイクルがたどれる。
- **split-plan.md 6 の手順0〜5**: 上から打てる。
  - 前提
    - HEAD は da54202e、origin/main は 9c848bd0 で、分かれ目は 9c848bd0 である。
    - `design-rollout-wip` は、ローカルも origin も 20a29292 である。
    - origin に `design-rollout` はまだ無い。
    - `remote.origin.fetch` は `+refs/heads/*:refs/remotes/origin/*` なので、名指しの fetch で `origin/<ブランチ>` が更新される。
    - `/` の空きは 4.6GB ある。
  - 手順0
    - `git diff da54202e 83a8cbd9 -- …/frontend-design/SKILL.md` は1つの hunk で、手順に引いた2つの文と合う。
    - 置き換える前の文は、作業ツリーに1つある。
    - 作業ツリーの `git diff da54202e` の hunk は4つある。1つ戻せば3つになる。
  - 手順1
    - SKILL.md を除く `git diff --name-only da54202e design-rollout-wip` は64のパスである。作業ツリーの `src/` の変更（未追跡を含む）は65ある。
    - 違いは `solvedScreenHeadings.ts` の1件だけで、wip での改名による。16巡目・18巡目の扱いのとおりである。
    - 作業ツリーで変わったパスは `src/`・`docs/`・`.claude/skills`（5つ）・`.claude/rules`（1つ）だけである。手順1のあとに残るのは、完了のものだけになる。
  - 手順2: 途中の作業を外した木で検査し、`git add .` で完了のものだけを載せる形は正しい。
  - 手順3
    - origin/main と da54202e で、2つのスキルと `deploy.yml` に差は無い。
    - 規則は origin/main に無い。Write で作る手順と合う。
    - main の backlog の B-754 は Queued の行である。
  - 手順4・5
    - `block-destructive-git.sh`（main と同じ中身）は、手順のどのコマンドも止めない。
    - `.claude/hooks`・`.claude/settings.json`・`.github` には、HEAD との差も未追跡のファイルも無い。`scripts` にも HEAD との差は無い。取り消した hook は残っていない。

## workflow.md の各項目の当てはめ

範囲は、18巡目の受け取り（16:18:39）から、この点検の依頼（16:21:06）までとした。サイクル全体は、前の巡の当てはめと decisions.md の各行のとおりである。

- **AP-WF01**: 18巡目の2件への対処を、この点検に回している。全体の見直しを含めて頼んでいる。当たらない。
- **AP-WF02・AP-WF05**: このあいだに、来訪者に見える変更は無い。当たらない。
- **AP-WF03**: 担当への依頼は、直す範囲と向き（main に無いファイルは Write で作る形にする、など）を渡した。スキルと計画の文は担当が書いた。当たらない。
- **AP-WF04**
  - PM は、担当の完了の通知（16:20:53）を受けてから、この点検を頼んだ（16:21:06）。
  - 中身の確かめは、この点検に回している。この点検で、文書を Read と grep で確かめた。当たらない。
- **AP-WF06**
  - 担当への依頼文が渡した事実は、どれも review-ap-check-18.md からとったものである。記録の数は「実際の数に合わせる」と頼んでいて、推測の数は渡していない。
  - この点検の依頼が渡した前提（main へ入れる5つのパス、hook を HEAD の版に戻したこと）は、git で確かめて合っていた。
  - 当たらない。
- **AP-WF07**
  - 18巡目の1つの対処（中1・軽1・記録）を、1つの担当に頼んだ。並行する担当は無い。
  - 16・17巡目の扱いと同じく、1つのレビューへの対処を1つのタスクとしたもので、当たらない。
- **AP-WF08**
  - このあいだ PM がリポジトリに書いたのは、review-ap-check-18.md の Write の1回だけである。
  - Write の無いレビュアーの報告の本文を写したもので、空白と空行を除いて一致した。
  - 当たらない。
- **AP-WF09**
  - 各項目は、jsonl・git・ディスクの実物と突き合わせた。
  - 記録の数（421・32）と手順1のパス（64・65）は、数えて確かめた。
  - 前の版と今の版の並べ読みは、担当の Edit の old_string と new_string で行った。
- **AP-WF10**: 対処は新しい担当に、点検は新しいレビュアーに頼んだ。SendMessage での続けは無い。当たらない。
- **AP-WF11**
  - PM は 16:19:41 と 16:21:10 に、オーナーへ対処の中身を報告した。承認の判断はまだ下していない。
  - 承認の前に、PM が次を自分で通読し、並べ読みする。
    - 規則
    - 2つのスキル
    - split-plan.md 6・7
    - carryover.md
    - backlog の B-754・B-784・B-786 の行
- **AP-WF12**: split-plan.md 7・carryover.md の B-786 は、backlog と decisions.md の実物と合わせて書かれている。当たらない。
- **AP-WF13・AP-WF14・AP-WF15・AP-WF23**
  - 並行のアサインは無い。
  - 数は一次の集計で確かめた。
  - 完了の処理のコミットの前である。
  - 終了時のチェックリストにチェックは無い（正しい）。
  - いずれも当たらない。
- **AP-WF24**
  - 16:19:41 と 16:21:10 の報告は、決めたことと直したことを伝えていて、許可を求める文は無い。
  - `~/.claude/stop-hook-git-check.sh`（システムの hook）の「コミットせよ」には、PM が理由を書いて従わなかった（16:19:46・16:21:13）。オーナーの 10-02 の言葉と、完了のコミットを点検の承認のあとに置く決まりに合う。
  - 当たらない。
- **AP-WF27**
  - このあいだの報告は、点検の指摘と対処の事実を書いていて、過去の内心を断言していない。
  - 「担当ごとに作業ツリーを分け、コミットする者を決めます」は、backlog の B-786 の行が書く直し方と同じである。
  - 当たらない。
- **AP-WF29**
  - PM は、Write の結果（16:19:30.954）を見てから、担当を立てた（16:19:36）。
  - 担当の Edit も、どれも前の結果を見てから次を出している。
  - 当たらない。
- **AP-WF30**: 評価の結論で対応の範囲を縮めた所は、見つからなかった。
- **AP-WF38**: この点検の依頼は、観点を実体の誤り・虚偽の記録・規則に反する所に限っている。当たらない。
- **AP-WF39**: 来訪者に届く成果物のレビューを打ち切った所は無い。当たらない。
- **AP-WF41**: 上の「書き換えで防壁が消えていないこと」のとおりである。新しい型の欠陥も、消えた防壁も見つからなかった。当たらない。
- **AP-WF50**: このあいだにコミットは無い。split-plan.md 6 は、パスを名指して載せる形を保っている。当たらない。

---

指摘はない。承認のあと、次のとおり進めること。

1. PM が上の通読と並べ読みを終えてから、承認の判断を下す（AP-WF11）。
2. 記録を更新する（planner に頼む）。
   - decisions.md に19巡目の行を足す。
   - index.md と review-log.md の点検の行に、19巡目（承認）を足す。
   - index.md の補足事項の一覧を `review-ap-check-19.md` までにする。
   - 記録の数を 422 本、分割と完了の処理のまとまりを 33 にする。
   - index.md の「実施する作業」と「レビュー結果」の点検の文を、承認に合わせる。
3. そのあと、split-plan.md 6 の手順0から進める。
