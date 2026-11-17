# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（17巡目）

判定: **改善指示（要修正）**

レビュアーの環境では Write が無効で新しいファイルを作れなかったため、レビュアーの報告の本文を PM がこのファイルにそのまま写した。

対象:

- review-ap-check-16.md の指摘への対応（`.claude/rules/file-editing.md`、split-plan.md 2・6、`cycle-completion` の手順7、decisions.md の16巡目の行、workflow.md の AP-WF12、candidates.md の AP-WF32）
- `docs/cycles/cycle-316/`（未追跡を含む）
- `docs/anti-patterns/` の5つのファイルの全体と `git diff HEAD -- docs/anti-patterns`、候補と欠番の番号の git の履歴
- `.claude/rules/file-editing.md`・`.claude/rules/anti-patterns-directory.md`、`cycle-kickoff`・`cycle-completion` の SKILL.md
- split-plan.md 6 の手順0〜5

指摘は AP-WF38 のとおり、後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。時刻と原文は、主の jsonl（`7ec6fd95-….jsonl`）の 35300〜35577 行（15:10〜15:57）と、`subagents/agent-a13ebb5bc691aa90c.jsonl`（16巡目の対処の planner）で確かめた。

## 指摘

### 中1 `cycle-completion` の手順7に足した「あいだのサイクルの手順のコミット」は、書かれたとおりに打つと main の木の `npm ci` で止まる。止まったときの npm の案内に従うと、lock の書き換えが `git add .` で main に入りうる

- **16巡目の対処で足した道**:
  - 手順7の「そのあいだのサイクル」は、次のものを変えたサイクルに、手順のコミットを作って main に push させる。
    - セッションの初めに読み込まれるもの（`paths` の無い規則・CLAUDE.md など）
    - 2つのスキル
  - 同じ手順7の push の段は、ブランチを移ってプッシュするとき（「統合のブランチの手順のコミットなど」）は、移った直後に `rm -rf .next` と `npm ci` で依存をその木に合わせる、と書く。
  - コードの例は `git add .` と `git commit` である。
- **main の木の `npm ci` は止まる**:
  - 確かめ方: main の `package-lock.json` と `package.json` を scratchpad に写し、このコンテナの npm 10.9.7 で `npm ci --dry-run --ignore-scripts` を打った。
  - 結果: `EUSAGE` で止まった。出た文は「`Missing: typescript@5.9.3 from lock file`」と「Please update your lock file with `npm install` before continuing.」である。
  - split-plan.md 6 の手順3 はこれを知っていて、`npx -y npm@11 ci` を使う。
  - `docs/knowledge/dependency-security.md` も、回避は lock を書き換えずに `npx -y npm@11 ci` で入れることだと書く。
  - スキルの文だけが `npm ci` のままである。
  - main の lock は、B-754 の最後のマージまで今の形のまま残る。そのあいだに手順のコミットを作るサイクルは、どれもここで止まる。
- **後の作業を誤らせる所**:
  - スキルに従った担当は、まず止まる。npm の案内のとおり `npm install` を打つと、main の木の `package-lock.json` が書き換わる。
  - スキルの確かめは、完了のコミットと同じ中身にしたパスの `git diff` だけで、ほかのパスが混ざっていないことは確かめない。
  - そのまま `git add .` を打つと、lock の変更が手順のコミットに入る。main への push で、本番の依存の木が変わる。
  - 手順のコミットは「来訪者に見える変更を含まない」ことが前提なので、この前提が崩れる。
  - split-plan.md 6 の手順3 は、push の前に、`git status --short` と `git diff --name-only origin/main` に出るパスが決めたものだけであることを確かめている。スキルの一般の形には、この確かめが無い。
  - 16巡目の対処で書き換えた箇所が、前からある `npm ci` の文と組み合わさって新しく生んだ欠陥で、AP-WF41 の型である。AP-WF41 の発生の欄には 316 がすでにあるので、番号は足さなくてよい。
- **直すこと**（どの形にするかは PM が決め、理由を記録する）:
  1. main へ移って依存を入れる段が、main の lock で通らないときに、lock を書き換えない道へ導くようにする。例えば次の形がある。
     - スキルの文を、その木の lock を書き換えずに入れる形にする。通らないときは `docs/knowledge/dependency-security.md` の回避に従う、と読めるようにする。
     - 根から直す道（`vite-tsconfig-paths` を外す。knowledge の「根からの直し方」）を、どのサイクルで取るか決める。
  2. 手順のコミットを push する前に、確かめる段をスキルの一般の形に入れる。確かめるのは、`git status --short` と `git diff --name-only origin/main` に出るパスが、手順のコミットに入れると決めたものだけであることである。split-plan.md 6 の手順3 がすでにしている確かめと同じである。スキルの変更は builder の担当なら builder に頼む。
  3. `cycle-completion` の SKILL.md を変えると、手順のコミットに入る版も変わる。split-plan.md 6 の手順3 の1つ目の差分（完了のコミットと同じ中身か）が、そのまま空で通る形を保つ。

### 軽1 index.md の補足事項の点検の一覧が、12巡目で止まっている

- index.md の「補足事項」の3つ目の項目は、完了の処理の点検の記録を `review-ap-check.md` から `review-ap-check-12.md` までの12本だけ並べる。続けて「指摘を受けた扱いは decisions.md の各行に書いた」とある。
- 実際の記録は16本ある。同じ index.md の「レビュー結果」の表と review-log.md の行は、16巡目まで載せている。
- 13巡目から16巡目の対処の行（decisions.md の「補足（レビューの表）」）は、表の行だけを直していて、この一覧には足していない。
- このままでは、後で読む側がこの一覧を記録の全部と読む。13〜16巡目の記録と、そこで決めたこと（新しい規則・AP-WF52 の欠番など）にたどり着けない。
- **直すこと**: 一覧を、記録のすべて（この17巡目を含む）を指す形にする。

### 軽2 decisions.md の14巡目の行が、済んだ訂正を「次のオーナーへの報告で正す」のまま残している

- decisions.md の14巡目の行（中1）の最後の文は、15:22:43 の報告の「このサイクルは、それを読まずに進めていました」について、「PM は次のオーナーへの報告で正す」と書いている。
- 実際には、PM は 15:28:58 のオーナーへの報告で、これを正している（jsonl の 35424 行）。
  - 報告の原文は「前回、「このサイクルは止められたときの道が書かれた文を読まずに進めていた」と書きました。これは記録で裏付けられない、私の思い込みでした。」である。
  - そのあとに、記録が示す事実を並べている。
- 16巡目の軽1 は、15巡目の行の同じ形を直させた。14巡目の行は、16巡目の点検も見落としていた。
- このままでは、後で読む側が、果たしていない約束が残っていると読む。
- **直すこと**: 14巡目の行の最後の文を、15:28:58 の報告で何を正したかの形にする。

## 確かめて問題がなかったもの

- **16巡目の重1 の対処（規則を main へ）**:
  - Claude Code の文書（code.claude.com/docs/en/memory）は、「Rules without `paths` frontmatter are loaded at launch with the same priority as `.claude/CLAUDE.md`」と書く。決定の前提は文書と合う。
  - このレビュアーの文脈にも、`file-editing.md` は読み込まれていない。
    - 読み込まれたのは、CLAUDE.md・constitution.md と、パスで読み込まれた `doc-directory.md` だけである。
    - ファイルは、このレビュアーが起こされた 15:57:14 の時点でディスクにあった。
    - セッションの起動のあとにできた規則がサブエージェントにも届かないことを、もう一度示す。
  - hook の設定について、文書（code.claude.com/docs/en/hooks）は「Direct edits to hooks in settings files are normally picked up automatically by the file watcher」と書く。起動したときの木に縛られるのは、規則と CLAUDE.md の側である。手順7の「セッションの初めに読み込まれるもの」の例の挙げ方は、文書と食い違わない。
  - 規則が指す先は、main の木にある。`git show origin/main:<パス>` で次のものを確かめた。
    - `.claude/settings.json` の PostToolUse（`Edit|Write|MultiEdit` に prettier・`post-write-residue-check.sh`・`trust-guard.sh record`）
    - `package.json` の `lint:fix`・`format`・`generate:*`
  - cycle-316 が変えたもののうち、起動したときに読み込まれるものは `file-editing.md` だけである。`git diff --stat origin/main -- CLAUDE.md docs/constitution.md .claude/rules` は空で、`paths` の無い規則はこの1つだけだった。
  - 5つのパスとその扱いは、次の文書のあいだで食い違わない。
    - split-plan.md 2・6 の前書き・手順3・手順5
    - decisions.md の16巡目の行
    - `cycle-completion` の手順7
- **16巡目の中1 の対処（規則の当たらない操作）**:
  - 規則は、禁じるもの（中身を自分で決めてシェルで書くこと）と、当たらないもの（道具がその役目として書く出力）を、原理で分けている。
  - `npm install`・`npm ci`・`npm run generate:*`・ビルド・`rm -rf .next` は、当たらない側に入る。split-plan.md 6 と `cycle-kickoff` の手順1のコマンドは、どれも規則に反しない。
  - `.claude/skills`・`.claude/agents`・`docs/knowledge` に、コミットに入るファイルをシェルで書かせる案内は無い。シェルのリダイレクトは、作業者ごとのディレクトリ（`$DIR`）へ書くものだけだった。
- **16巡目の軽1 の対処**: 15巡目の行の中1 は、15:39:41 の報告で正した2文の形になっている。jsonl の 35484 行と合う。
- **16巡目の対処の書き方**:
  - planner（`agent-a13ebb5bc691aa90c`）の tool_use で、リポジトリのファイルを変えたのは Write 1回と Edit だけである。
  - Bash は、読み取りと `prettier --check` と、scratchpad の中で git の挙動を試したものだけだった。
  - PM は 15:52 から 15:57 のあいだに、Bash でファイルを書いていない。
- **`docs/anti-patterns/` の変更**: ツギハギは無い。次のどれにも反しない。
  - `.claude/rules/anti-patterns-directory.md`
  - オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）
  - オーナーの 10-02 の言葉（AP-WF24 の本文は、優先の順を hook について書き、権限の判定を含めていない）
  - AP-WF01・完了のチェックリスト・`.claude/agents/reviewer.md`
- **番号と欠番**:
  - `git log --all -S` で、次のことを確かめた。
    - AP-WF51・AP-WF52 を返すコミットは無い。
    - AP-WF50 は、cycle-313 の「次は AP-WF50 から採る」の文にだけ出る。
    - AP-I14 の本体の項目（23c43c70）は origin/main に無く、decisions.md の「中2（AP-I14）」の行のとおり外してある。candidates.md の AP-I14 候補（cycle-301）は残っている。
  - 欠番の AP-WF42〜44・45〜49 の2行は、cycle-312/incident-16.md・cycle-313/incident-5.md と合う。origin/main の欠番の節に無いのは、取り消しのコミット 91a0c1a0 が消したためで、decisions.md の9巡目の行のとおりである。
  - AP-WF12 の発生の欄の 316 は、16巡目の重1 の前提（規則がどの木から読み込まれるかを確かめずに置いた）に合う。
- **AP-WF28 の候補と新しい規則**:
  - 規則は、守れなかった決まり（AP-WF08・AP-WF21 の記録）を言い直したものに見える。しかし、手順のコミットで main に入れば、点検のときだけ読まれる一覧と違って、起動したときから手元にある。食い違う既定の案内より上に置かれる、という違いも保たれる。
  - hook にしない判断は、前提として受けた。AP-WF32 の候補の「止めすぎる害と取りこぼす害を比べてから決める」という文は、取り消した hook の教訓と合う。
- **split-plan.md 6 の手順0〜5**: 上から打てる（中1 は、このサイクルの手順でなく、後のサイクルが使うスキルの問題である）。
  - 前提:
    - HEAD は da54202e、origin/main は 9c848bd0 で、2つの分かれ目と同じである。
    - `design-rollout-wip` は、ローカルも origin も 20a29292 である。origin に `design-rollout` はまだ無い。
    - `/` の空きは 4.6GB ある。
  - 手順0:
    - `git diff da54202e 83a8cbd9 -- …/frontend-design/SKILL.md` の hunk は1つで、手順に引いた2つの文と一字ずつ合う。
    - 置き換える前の文は作業ツリーに1つあり、da54202e の文も1つある。
    - 作業ツリーの `git diff da54202e` の hunk は4つで、1つ戻せば3つになる。
    - pre-commit の hook と同じ集め方（`git status --porcelain` の削除を除く124件）で、`prettier --check` を通った。そのうち JS/TS の55件は eslint を通った。
  - 手順1:
    - SKILL.md を除く `git diff --name-only da54202e design-rollout-wip` の64のパスと、作業ツリーの `src/` の変更は、`solvedScreenHeadings.ts` の削除の1件を除いて一致した。この1件の扱いは16巡目のとおりで、手順を直さなくてよい。
    - 未追跡の4つのファイルは、wip の版と cmp で同じだった。
  - 手順3:
    - origin/main と da54202e で、2つのスキルと `deploy.yml` に差は無い。Edit で同じ変更を当てれば、1つ目の差分は空になる。
    - main の backlog の B-754 は Queued の行で、作業ツリーの B-754 も Queued の行である。
    - main の `deploy.yml` の `on.push.branches` は `[main]` である。`vercel.json` は main だけをデプロイする。
    - main の lock は、npm 10 の `npm ci` で止まる（中1 の実測）。手順は `npx -y npm@11 ci` を使うので通る。
  - 手順4・5:
    - `scripts/wait-for-ci.sh` は main と同じで、`gh` が無いと exit 3 で終わる。
    - `pre-push-check.sh`・`pre-commit-check.sh`・`block-destructive-git.sh` は main と同じである。どれも `switch`・`branch -d`・`push origin HEAD:<ブランチ>`・`rm -rf .next` を止めない。
    - `git diff HEAD -- .claude/hooks .claude/settings.json scripts .github` は空で、取り消した hook は残っていない。
- **記録の数**:
  - review-log.md・review-response.md を除く review-\*.md は 419 本で、index.md・review-log.md と合う。
  - このファイルで 420 本になる。

## workflow.md の各項目の当てはめ（16巡目の受け取り 15:52:18 から、この点検の依頼 15:57:14 まで。サイクル全体は前の巡の当てはめと decisions.md の各行のとおり）

- **AP-WF01**: 16巡目の3件への対処を、この点検に回している。この点検の3件に対応したあと、全体の見直しを含めて、もう一度点検を受ける。
- **AP-WF02・AP-WF05**: このあいだに、来訪者に見える変更は無い。サイクル全体の画面の変更は、各タスクのレビューで撮って見ている。当たらない。
- **AP-WF03**: planner への依頼は、直す範囲と PM の決定（どの道を取るか）を渡した。規則とスキルの文は planner が書いた。当たらない。
- **AP-WF04**: planner の hand-back（15:57:02）を受けてから、この点検を頼んだ（15:57:14）。対処の確かめは、この点検が担う。当たらない。
- **AP-WF06**: 依頼文の事実を確かめた。
  - 手順のコミットの5つのパスは、split-plan.md 2 と合う。
  - hook を HEAD の版に戻したことは、`git diff HEAD` が空であることと合う。
  - 規則の要点は、`file-editing.md` と合う。
  - 当たらない。
- **AP-WF07**: 1つの planner に1つの対処（16巡目の3件）を頼み、並行する担当は無い。当たらない。
- **AP-WF08**:
  - このあいだ、PM はリポジトリのファイルを書いていない。
  - review-ap-check-16.md は、レビュアーの報告をそのまま写している。
  - 当たらない。
- **AP-WF09**: 各項目を、jsonl・git・ディスクの実物と突き合わせた。main の木の `npm ci` は、文書を読むだけでなく実際に打って確かめた。
- **AP-WF10**: 16巡目の対処は、新しい planner に頼んだ。前の planner への SendMessage での継続ではない。当たらない。
- **AP-WF11**:
  - PM は 15:57:20 に、オーナーへ対処の中身を報告した。
  - このあいだ、PM が直したファイルを自分で読んだ tool_use は無い。
  - 報告の要約は実物と合っていて、承認の判断はまだ下していない。
  - 承認の前に、PM が規則・スキル・split-plan.md 6 を自分で通読する。
- **AP-WF12**: 16巡目の前提の誤りは、AP-WF12 の発生として記録された。この巡で、`cycle-completion` の手順7の依存の入れ直しの文が、main の木の実体（lock）と合わないことを見つけた（中1）。
- **AP-WF13・AP-WF14・AP-WF15・AP-WF23**:
  - 並行のアサインは無い。
  - 数は一次の集計で確かめた。
  - 完了の処理の前である。
  - 終了時のチェックリストにチェックは無い（正しい）。`completed_at` の付け直しは、split-plan.md 6 の手順2 にある。
  - いずれも当たらない。
- **AP-WF24**:
  - このあいだの報告に、許可を求める文は無い。
  - `~/.claude/stop-hook-git-check.sh`（システムの hook）の「コミットせよ」には、PM が理由を書いて従わなかった（15:52:41・15:57:23）。これは、オーナーの 10-02 の言葉（hook は CLAUDE.md より下）と、完了のコミットを点検の承認のあとに置く決まりに合う。
  - 当たらない。
- **AP-WF27**:
  - 15:52:38 と 15:57:20 の報告は、点検の指摘と対処の事実を書いていて、過去の内心を断言していない。
  - 14巡目の行の「次の報告で正す」は、内心ではなく記録の誤りとして、軽2 に挙げた。
- **AP-WF29**: 依頼の Agent の呼び出しは、それまでの呼び出しの結果を見たあとで打っている。当たらない。
- **AP-WF30**: 評価の結論で対応の範囲を縮めた所は、見つからなかった。
- **AP-WF38**: この点検の依頼は、観点を実体の誤り・虚偽の記録・規則に反する所に限っている。当たらない。
- **AP-WF39**: 来訪者に届く成果物のレビューを打ち切った所は無い。当たらない。
- **AP-WF41**:
  - 16巡目の対処は、15巡目の「main に入れない」を改めた。そのとき、前版の防壁は消していない。
  - しかし、あいだのサイクルに手順のコミットの道を足したことで、前からある `npm ci` の文と `git add .` の例が、main の木で誤りを生む形になった（中1）。
  - 14巡目の行の「次の報告で正す」は、16巡目が直させた15巡目の行と同じ型の残りである（軽2）。
- **AP-WF50**:
  - このあいだにコミットは無い。
  - split-plan.md 6 は、手順0 でパスを名指し、手順1 で途中の作業を外してから `git add .` を打つ。
  - 当たらない。

---

指摘が3件あるので、次のとおり進めること。

1. 中1 の形を PM が決め、`cycle-completion` の手順7を builder に直させる（スキルの変更）。split-plan.md 6 の手順3 の1つ目の差分が空で通る形を保つ。決めた形と理由は、planner に decisions.md へ記録させる。
2. 軽1・軽2 は、planner に index.md の補足事項の一覧と decisions.md の14巡目の行を直させる。
3. 直したあと、前回の指摘だけでなく全体の見直しも範囲に含めて、もう一度このレビューを頼む。依頼文には、規則の中身（Edit・Write で書き、シェルで書かない）を引き続き書いて渡す。
