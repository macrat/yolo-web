# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（18巡目）

判定: **改善指示（要修正）**

レビュアーの環境では Write が無効で新しいファイルを作れなかったため、レビュアーの報告の本文を PM がこのファイルにそのまま写した。

対象:

- review-ap-check-17.md の指摘への対応（`cycle-completion` の手順7、split-plan.md 2、index.md の補足事項、decisions.md の14巡目・17巡目の行）
- `docs/cycles/cycle-316/`（未追跡を含む）
- `docs/anti-patterns/` の5つのファイルの全体と `git diff HEAD -- docs/anti-patterns`、候補と欠番の番号の git の履歴
- `.claude/rules/file-editing.md`・`.claude/rules/anti-patterns-directory.md`、`cycle-kickoff`・`cycle-completion` の SKILL.md
- split-plan.md 6 の手順0〜5（作業ツリーの `.claude/hooks/` と、`git show origin/main:<パス>` の main の木と突き合わせた）

指摘は AP-WF38 のとおり、後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。時刻と原文は、主の jsonl（`7ec6fd95-….jsonl`）の 35572〜35648 行（15:57〜16:11）と、`subagents/agent-ab910c1422025884d.jsonl`（17巡目の対処の担当）で確かめた。

## 指摘

### 中1 B-786 が、`design-rollout` の1つ目のサイクルの作業として split-plan.md 7 と carryover.md に載っていない

- **決めたこと**:
  - decisions.md の「hook の取り消し」の行の「backlog」の項は、B-786 を起票したと書く。並行する担当が1つの作業ツリーとコンテナを共有して起きる問題を、hook でなく作業の分け方で直す項目である。
  - 着手は `design-rollout` の1つ目のサイクル（B-784 と同時）である。
  - 理由は次のとおりである。
    - B-754 の残りのサイクルは、どれも同じコンテナで builder とレビュアーを並行して動かす。
    - 症状を止めていた hook も取り消した。
    - 出荷の後まで送ると、残りのサイクルのたびに同じ事故の危険を負う。
  - backlog の B-786 の行（Deferred）も「着手: design-rolloutの1つ目のサイクル(B-784と同時)」と書く。
  - PM の前提（このレビューの依頼）も、この問題を B-786 で直すとしている。
- **後のサイクルが読む所に無い**:
  - split-plan.md 7 の表の1行目は、1つ目のサイクルの中身を T5-8b・T5-20d・T5-33 と B-784 と書く。B-786 は無い。
  - carryover.md の申し送りも、「`design-rollout` の1つ目のサイクルは、split-plan.md 7 の1行目の作業とあわせて B-784 … を行う」とだけ書く。
  - index.md にも B-786 は出てこない。
  - split-plan.md 7 は表のあとで「各サイクルの順と依存は decisions.md の決定と申し送り … に従う。上の表はそれに合わせてある」と書く。B-786 については、この文は事実と合わない。
- **後の作業を誤らせる所**:
  - 次のサイクルの PM は、1つ目のサイクルの範囲を split-plan.md 7 の表と carryover.md で決める。そこに B-786 が無い。
  - backlog の B-754 の行は「完成までほかの項目のサイクルは立てない」と書く。キックオフの手順3で Deferred の B-786 を見ても、B-754 のほかの項目として後回しにしうる。
  - B-786 が抜けると、このサイクルで見つけた問題の根への対処が、残りのサイクルのあいだ入らない。問題は、他人の書きかけでコミットの検査が止まること、名前で探して他人のプロセスを止めること、他人の変更がコミットに入ることである。再発防止が担保されない。
  - 1〜17巡目の点検は、B-786 が Deferred にあることだけを確かめていた（14巡目）。後のサイクルが読む文書に載っているかは見ていなかった。
- **直すこと**（planner に頼む）:
  - split-plan.md 7 の表の1行目に、B-786 を B-784 と並べて足す（何を直すかを一言で）。
  - carryover.md の1つ目のサイクルの申し送りにも、B-786 を B-784 と並べて書く。
  - 「上の表はそれに合わせてある」が真になる形にする。

### 軽1 `cycle-completion` の手順7は、手順のコミットのファイルを「Edit で当て」とだけ書く。main に無いファイル（新しい規則など）は Edit では作れない

- 手順7は、手順のコミットに入れるものとして、セッションの初めに読み込まれるもの（`paths` の無い規則・CLAUDE.md など）のうち、そのサイクルが変えたものを挙げる。
- このサイクルの `file-editing.md` のように、そのサイクルが新しく作った規則は main の木に無い。
- 同じ段落の作り方の文は、「手順のコミットを作るときは、ファイルを Edit で当て」とだけ書く。Edit は、在るファイルしか変えられない。
- 書かれたとおりに進めて止まると、担当はほかの道を探す。ほかの道は、どれも規則か hook に当たる。
  - `git show … > <パス>` はシェルで書く形で、`file-editing.md` が禁じている。
  - `git checkout <コミット> -- <パス>` と `git restore --source` は、`block-destructive-git.sh` が止める。
- split-plan.md 6 の手順3 は「規則は main に無いファイルなので … Write で同じ中身に作る」と正しく書いている。一般の形のスキルだけが Edit に限っている。
- このスキルは手順のコミットで main に入り、そのあいだのサイクルも使う。
- **直すこと**（builder に頼む）:
  - 作り方の文を、在るファイルは Edit で当て、main に無いファイルは Write で作る形にする。
  - split-plan.md 6 の手順3 の1つ目の差分は、そのまま空で通る。スキルを変えると手順のコミットに入る版も変わるが、手順3 は完了のコミットの版をそのまま当てるからである。
  - split-plan.md 2 の `cycle-completion` の項の要約と食い違わないかも見る。

## 確かめて問題がなかったもの

- **17巡目の中1 の対処（`cycle-completion` の手順7）**:
  - 依存の段は、次の3つをスキルの文の中で完結させている。
    - lock を書き換えずに入れること
    - `npm install` を打たないこと
    - `npx -y npm@11 ci` で入れること
  - スキルは `docs/knowledge/` の節を指していない。main の `dependency-security.md` に `npm@11` の節が無いことを、`git show origin/main:` で確かめた。
  - 手順のコミットの作り方は、次の形になった。
    - `git add -- <パス>` で名指して載せる。
    - push の前に、`git status --short` と `git diff --name-only origin/main` を確かめる。
    - そのあいだのサイクルの項も、「上と同じく」でこれを掛ける。
  - スキルが書く止まる理由（lock を書いた npm によって入れ子の有無が変わり、npm 10 の `npm ci` が止まる）は、design-rollout の `dependency-security.md` の原因の説明と食い違わない。
  - split-plan.md 2 の `cycle-completion` の項は、この形に合わせてある。
  - 17巡目の対処の担当（`agent-ab910c1422025884d`）がリポジトリのファイルを変えたのは、Edit だけだった。Bash は、読み取りと `npx prettier --write`（整形の道具）だけだった。
- **17巡目の軽1・軽2 の対処**:
  - index.md の補足事項は、`review-ap-check.md` から `review-ap-check-17.md` までのすべてを指す。並びは review-log.md の点検の行にある。
  - decisions.md の14巡目の行は、15:28:58 の報告で何を正したかの形になっている。
- **記録の数**: review-log.md・review-response.md を除く review-\*.md は 420 本で、index.md・review-log.md と合う。このファイルで 421 本になる。
- **main に入る5つのパス**: どれも main の木でも正しく、main に無いものを指さない。
  - `cycle-kickoff` が指すのは、`SessionStart` の hook（`session-start-facts.sh`）と、名指しの fetch で取る統合のブランチだけである。
  - `cycle-completion` が指すのは、`deploy.yml`・`scripts/wait-for-ci.sh`・`pre-push-check.sh` だけで、どれも main にある。
  - `file-editing.md` が指す先は、17巡目が main で確かめたとおりである。
  - backlog の B-754 の行が指すのは、`cycle-kickoff` の手順1（手順のコミットで main に入る）と、統合のブランチの split-plan.md である。
  - main の `deploy.yml` の `on.push.branches` は `[main]` である。
- **`docs/anti-patterns/` の変更**: ツギハギは無い。次のどれにも反しない。
  - `.claude/rules/anti-patterns-directory.md`
    - 発生の欄は、サイクルの番号だけにしてある。AP-WF02・AP-WF27・AP-P04・AP-P31・AP-P34・AP-I13 の事例の文は外し、事例はサイクルの文書に置いた。
    - 本体に手順は書いていない。B-786 の根を候補に起こさなかった判断も、この Don't に合う。
  - オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）
    - 昇格した AP-WF29・30・38・39・41・50 は、どれも操作やコミットの前に問える形である。
  - オーナーの 10-02 の言葉
    - AP-WF24 の本文の優先の順は、constitution.md・CLAUDE.md・システムが入れた hook の順である。
    - 権限の判定はこの順に入れていない。Owner の判断ではないと、別に書いている。
  - AP-WF01・完了のチェックリスト・`.claude/agents/reviewer.md`
- **番号と欠番**:
  - `git log --all -S` は、AP-WF51 と AP-WF52 のどちらにもコミットを返さない。
  - AP-WF52 の欠番の行は、decisions.md の15巡目の行と合う。
  - AP-P22 の発生の欄から 316 を外したことと、AP-I14 を本体から外したことは、decisions.md の各行のとおりである。
- **split-plan.md 6 の手順0〜5**: 上から打てる。
  - 前提:
    - HEAD は da54202e、origin/main は 9c848bd0 で、分かれ目は 9c848bd0 である。
    - `design-rollout-wip` は、ローカルも origin も 20a29292 である。
    - origin に `design-rollout` はまだ無い。
    - `/` の空きは 4.6GB ある。
  - 手順0:
    - `git diff da54202e 83a8cbd9 -- …/frontend-design/SKILL.md` の hunk は1つで、手順に引いた2つの文と合う。
    - 置き換える前の文は、作業ツリーに1つある。
    - 作業ツリーの `git diff da54202e` の hunk は4つで、1つ戻せば3つになる。
  - 手順1:
    - SKILL.md を除く `git diff --name-only da54202e design-rollout-wip` は64のパスで、作業ツリーの `src/` の変更（未追跡を含む）は65である。
    - 違いは `solvedScreenHeadings.ts` の1件だけである。
      - wip ではこのファイルは改名（R060 → `solvedScreenPhrases.ts`）なので、`--name-only` には新しい名前だけが出る。
      - 作業ツリーでは削除で、wip にもこのファイルは無い。
      - `git switch` は止まらず、戻るとこのファイルは HEAD の中身に戻る。
    - 16巡目の扱いのとおりで、手順を直さなくてよい。
  - 手順2:
    - da54202e の `package.json`・`package-lock.json` は、このコンテナの npm 10.9.7 の `npm ci --dry-run --ignore-scripts` を通った。
    - main の `tsconfig.json`・`eslint.config.mjs`・`vitest.config.mts` は、どれも `tmp` を除外している。main の木でも、push の hook が `tmp/` の412件の中身で落ちることはない。
  - 手順3:
    - origin/main と da54202e で、2つのスキルと `deploy.yml` に差は無い。
    - 規則は origin/main に無い（`git cat-file -e` が無いと返す）。Write で作る手順と合う。
    - main の backlog の B-754 は Queued の行で、作業ツリーの B-754 も Queued の行である。Active は両方とも空である。
  - 手順4・5:
    - `block-destructive-git.sh` は、手順のどのコマンドも止めない。見たのは `switch`・`switch -c … origin/main`・`push origin HEAD:<ブランチ>`・`branch -d`・`rm -rf .next`・`merge` である。
    - `pre-push-check.sh` は、「git push」を含むコマンドで、いまの作業ツリーにフルスイートを掛ける。手順どおり、ブランチを移るたびに `.next` と依存を合わせれば、push するコミットと同じ木で検査される。
    - `git diff HEAD -- .claude/hooks .claude/settings.json scripts .github` は空で、取り消した hook は残っていない。

## workflow.md の各項目の当てはめ（17巡目の受け取り 16:08:04 から、この点検の依頼 16:11:38 まで。サイクル全体は前の巡の当てはめと decisions.md の各行のとおり）

- **AP-WF01**: 17巡目の3件への対処を、この点検に回している。この点検の2件に対応したあと、全体の見直しを含めて、もう一度点検を受ける。
- **AP-WF02・AP-WF05**: このあいだに、来訪者に見える変更は無い。当たらない。
- **AP-WF03**: 担当への依頼は、直す範囲と PM の決定（どの道を取るか）を渡した。スキルの文は担当が書いた。当たらない。
- **AP-WF04**:
  - PM は、担当の hand-back（16:10:56）を受けてから、PM の判断（参照を外す）を返した。
  - 2度目の hand-back（16:11:26）を受けてから、この点検を頼んだ（16:11:38）。
  - 当たらない。
- **AP-WF06**:
  - PM の初めの依頼文は、`docs/knowledge/dependency-security.md` の回避を指す形を指示していた。main の木に無い節を指す形である。
  - 担当が `git show origin/main:` で確かめて指摘し、PM は参照を外す形に改めた。
  - コミットの前に正されたので、記録に残る誤りは無い。
- **AP-WF07**: 1つの担当に、17巡目の1つの対処（3件）を頼んだ。並行する担当は無い。16巡目の扱いと同じで、当たらない。
- **AP-WF08**:
  - このあいだ PM がリポジトリに書いたのは、review-ap-check-17.md の Write の1回だけである。
  - Write が無効だったレビュアーの報告を、そのまま写したものである（ファイルの5行目）。
  - 当たらない。
- **AP-WF09**: 各項目を、jsonl・git・ディスクの実物と突き合わせた。手順1 のパスは、64と65の数を数えて突き合わせた。違う1件の理由は、git の改名の検出で確かめた。
- **AP-WF10**:
  - 16:11:01 の SendMessage は、同じ担当の同じ対処（17巡目の中1）の中の判断を返したもので、新しいタスクではない。
  - 点検は、新しいレビュアーに頼んだ。
  - 当たらない。
- **AP-WF11**:
  - PM は 16:11:07 と 16:11:42 に、オーナーへ対処の中身を報告した。承認の判断はまだ下していない。
  - 承認の前に、PM が次のものを自分で通読し、並べ読みする。
    - 規則
    - 2つのスキル
    - split-plan.md 6・7
    - carryover.md
  - 中1 は、split-plan.md 7・carryover.md を backlog・decisions.md と並べ読みすれば気づける形である。
- **AP-WF12**:
  - 中1 は、B-786 を起票したときに、後のサイクルが読む split-plan.md 7 と carryover.md へ載せたかを確かめなかった漏れである。
  - backlog と decisions.md には正しく書かれているので、前提と実体の食い違いではない。数えない。
- **AP-WF13・AP-WF14・AP-WF15・AP-WF23**:
  - 並行のアサインは無い。
  - 数は一次の集計で確かめた。
  - 完了の処理の前である。
  - 終了時のチェックリストにチェックは無い（正しい）。
  - いずれも当たらない。
- **AP-WF24**:
  - 16:11:07 の報告は、担当が出した判断の要る点（main に無い節への参照）を、PM が自分で決めて（参照を外す）伝えている。許可を求める文は無い。
  - `~/.claude/stop-hook-git-check.sh`（システムの hook）の「コミットせよ」には、PM が理由を書いて従わなかった（16:08:25・16:11:10・16:11:46）。これは、オーナーの 10-02 の言葉と、完了のコミットを点検の承認のあとに置く決まりに合う。
  - 当たらない。
- **AP-WF27**: このあいだの報告は、点検の指摘と対処の事実を書いていて、過去の内心を断言していない。当たらない。
- **AP-WF29**:
  - 担当は、Edit の結果を見たあとで prettier を掛けている。
  - PM は、hand-back を見たあとで次の依頼を打っている。
  - 当たらない。
- **AP-WF30**:
  - 評価の結論で対応の範囲を縮めた所は、見つからなかった。
  - 根から直す道（`vite-tsconfig-paths` を外す）をこのサイクルで決めない判断は、範囲を縮めるものではない。担うサイクルの振り分けで、理由が decisions.md にある。
- **AP-WF38**: この点検の依頼は、観点を実体の誤り・虚偽の記録・規則に反する所に限っている。当たらない。
- **AP-WF39**: 来訪者に届く成果物のレビューを打ち切った所は無い。当たらない。
- **AP-WF41**:
  - 17巡目の対処は依存の段を書き換えたが、前版の防壁は消していない。`rm -rf .next` も、そのあいだのサイクルの CI の確かめも残っている。
  - 書き換えた作り方の文は、「Edit で当て」を残した。この文が、16巡目で足した「セッションの初めに読み込まれるもの」（新しく作る規則を含む）と同じ段落で組み合わさると、作れないファイルが出る（軽1）。
  - 16巡目に足したものと前からある文の組み合わせで生まれた欠陥で、AP-WF41 の型である。AP-WF41 の発生の欄には 316 がすでにあるので、番号は足さない。
- **AP-WF50**:
  - このあいだにコミットは無い。
  - split-plan.md 6 は、手順0 でパスを名指し、手順1 で途中の作業を外してから `git add .` を打つ。手順3 はパスを名指して載せる。
  - 当たらない。

---

指摘が2件あるので、次のとおり進めること。

1. 中1 は、planner に split-plan.md 7 の表の1行目と carryover.md の申し送りへ B-786 を足させる。
2. 軽1 は、builder に `cycle-completion` の手順7の作り方の文を直させる（スキルの変更）。split-plan.md 2 の要約と食い違えば、planner に合わせさせる。
3. 扱いは、planner に記録させる。
   - decisions.md に18巡目の行を足す。
   - index.md と review-log.md の点検の行に、18巡目（要修正）を足す。
   - index.md の補足事項の一覧（いま `review-ap-check-17.md` まで）に、このファイルを含める。
   - 記録の数を 421 本にする。
4. 直したあと、もう一度このレビューを頼む。範囲には、前回の指摘だけでなく全体の見直しも含める。依頼文には、規則の中身（Edit・Write で書き、シェルで書かない）を引き続き書いて渡す。
