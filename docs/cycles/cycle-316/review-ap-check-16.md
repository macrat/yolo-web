# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（16巡目）

判定: **改善指示（要修正）**

対象:

- review-ap-check-15.md の指摘への対応（decisions.md の15巡目の行、`.claude/rules/file-editing.md`、candidates.md の AP-WF32・AP-WF52、workflow.md の欠番）
- `docs/cycles/cycle-316/`（未追跡を含む）
- `docs/anti-patterns/` の5つのファイルの全体と `git diff -- docs/anti-patterns`、候補と欠番の番号の git の履歴
- split-plan.md 6 の手順0〜5

指摘は AP-WF38 のとおり、実体の誤り・虚偽の記録・規則に反する所に限った。時刻と原文は、主の jsonl（`7ec6fd95-….jsonl`）の 35446〜35529 行（15:32〜15:44）と、`subagents/agent-a1dda4830e1101d0a.jsonl`（15巡目の対処の planner）で確かめた。

## 指摘

### 重1 新しい規則は、B-754 の残りのサイクルのセッションに読み込まれない。「main に入れない」の判断が、セッションが main の木から始まることを数えていない

- **決定の前提**: decisions.md の15巡目の行は、hook でなく規則にした理由を「規則なら作業の初めから読み込まれ、書く前に手元にある」とし、規則を `paths` の無い形にして「すべての作業で読み込まれる」とした。同じ行の「main に入れない」は、規則を手順のコミットに入れず `design-rollout` にだけ入れる。理由に挙げたのは、急ぎのサイクルが `cycle-kickoff` の手順1で統合のブランチの `.claude/` を読むことだけである。
- **実際の読み込まれ方**:
  - Claude Code の文書（code.claude.com/docs/en/memory）には、「Rules without `paths` frontmatter are loaded at launch with the same priority as `.claude/CLAUDE.md`」とある。読み込むのは起動したとき、つまりセッションを始めた木からである。
  - B-754 の残りのサイクルのセッションは main から始まる（split-plan.md 2「次のサイクルのセッションは main から始まる」）。`design-rollout` に移るのは、`cycle-kickoff` の手順1の途中である。`cycle-kickoff` の手順1自身も、SessionStart の hook の報告について「セッションを始めた main の木の値」と書いている。規則の読み込みも同じで、起動したときの main の木には `file-editing.md` が無い。
  - 起動のあとでできた規則は、そのセッションのサブエージェントにも届かない。このレビュアーがその実例である。15:43:53 に起こされた時点で `file-editing.md`（15:40:37 に作成）はディスクにあった。しかし、このレビュアーの文脈に読み込まれたのは CLAUDE.md と constitution.md と、パスで読み込まれた `doc-directory.md` だけで、`file-editing.md` は無い。逆に、auto mode の案内（小さな機械的な変更に sed・heredoc・短いスクリプトを使ってよい）は、このレビュアーの文脈にも入っている。
- **後の作業を誤らせる所**:
  - 15巡目の重1 が数えたシェルでの書き換えの大半は、PM と builder がこれから `design-rollout` で進める B-754 の残りのサイクル（7 の表で十数サイクル）で起きうる。そのどのセッションにも、規則は読み込まれない。食い違う既定の案内だけが毎回入る。
  - 再発防止は「担保した」と記録されているのに、担保が働かない。
  - この規則が AP-WF28 の候補（守れなかったルールに、新しいルールを書き足して対処する）に当たらないと言える根拠は、AP の一覧のように点検のときだけ読まれるのではなく、起動したときから手元にあり、食い違う既定の案内より上に置かれることである。その根拠がまさに崩れている。
- **直すこと**（どの道を取るかは PM が決め、理由を記録する）:
  1. 規則を、セッションを始める木に置く。
     - 道の1つは、`file-editing.md` を split-plan.md 6 の手順3の手順のコミットに足すことである。この規則は main の木でも正しい。指す先（`.claude/settings.json` の PostToolUse の hook、`docs/anti-patterns/workflow.md` の AP-WF08）は、`git show origin/main:<パス>` で main にあることを確かめた。
     - そうするなら、次のものを合わせる。
       - split-plan.md 2: 入れるパスと前書き
       - split-plan.md 6 の手順3: `git add`、2つの差分、`git diff --name-only origin/main` に出るパスの数
       - split-plan.md 6 の手順5: 衝突の見込み。両方の側が同じ中身で足すので、衝突しない。
       - decisions.md の15巡目の「main に入れない」
     - `cycle-completion` の手順7は、手順のコミットを「統合のブランチへたどり着き、CI が走るのに要るものだけ」とし、あいだのサイクルには手順のコミットは要らないとしている。この一般の形も、セッションの初めに読み込まれるもの（`paths` の無い `.claude/rules/`・CLAUDE.md など）を統合のブランチで変えたときに、どう main に届けるかが読める形にする。手順のコミットの2つのスキルは完了のコミットと同じ中身にするので、スキルを直せば手順3の確かめはそのまま保たれる。
  2. このセッションの残りの作業（この点検の対処と手順0〜5）にも、規則は読み込まれていない。サブエージェントへの依頼文に、規則の中身（Edit・Write で書き、シェルで書かない）を毎回書いて渡す。今回の依頼文は「Write か Edit で書き（Bash で書かない）」と書いていて、この形である。
  3. 発生の扱いを PM が決めて記録する。この判断は、規則がどの木から読み込まれるかを確かめずに置いた前提に立っていた。6・7巡目に指された「main の木で欠けるものの数え漏らし」と同じ型でもある。AP-WF12（フレームワークの挙動を確かめずに書く。発生の欄に 316 は無い）と AP-WF41 のどちらに数えるかは、PM が決める。

### 中1 規則の「当たらない操作」が閉じた2つだけで、プロジェクトの正当な道具の出力まで禁じる形になっている

- 規則は「シェルでリポジトリのファイルを書かない」とし、当たらないものとして次の2つを挙げる。
  - git 自身が書く操作
  - `npm run format` のような整形の道具
- 当たらないものとして、`./tmp/` だけを名指して外している。そのため、git が追わないパスもこの規則の「リポジトリのファイル」に入ると読める。
- この文のままでは、次のものが禁じられる側に入る。
  - `npm install`: `package.json`・`package-lock.json` を書く。implementation.md の AP-I13 が、lock を `npm install` で更新するよう書いている。
  - `npm run generate:zen-antique-charset`: git が追う `src/data/zen-antique-charset.json` を書く。スクリプトの頭のコメントが、書体の版が上がったらこれで作り直すよう書いている。
  - `npm ci`・`npm run build`、`rm -rf .next`: split-plan.md 6 の手順3・5 と `cycle-kickoff` の手順1が使う。`node_modules` と `.next` を書くか消す。
- 文字どおりに読む担当は、lock や生成した表を Edit で手で書くか、規則に反して進むかの二択になる。B-754 の残りのサイクル（依存の入れ直し・T8 のテストの作り直しなど）で当たりうる。
- **直すこと**: 当たらないものを、閉じた2つの例でなく原理で書く。例えば次の形にする。
  - 禁じるのは、シェルをエディタとして使い、中身を組み立てて書くこと（python・sed・heredoc・リダイレクトによる書き換え）である。
  - 道具がその役目として書く出力は、この決まりに当たらない。git、パッケージの管理（`npm install`・`npm ci`）、整形と lint の自動の直し、ビルド、リポジトリの生成のスクリプトがこれに入る。
  - `./tmp/` の1文も、この原理の中に収める。

### 軽1 decisions.md の15巡目の「中1」が、済んだ訂正を「次の報告で正す」のまま残している

- decisions.md の15巡目の行は、中1 を「PM が次のオーナーへの報告で正す」と書いている。
- 実際には、PM は 15:39:41（35446 行のあと）のオーナーへの報告で、2文を正している。
  - `frontend-design` のスキルは PM 自身がスクリプトで書いた。
  - 14:22:31 の操作は「2つ目の道の前半と同じ向き」である。
- このままでは、後で読む側が、果たしていない約束が残っていると読む。
- 残りの3つのファイル（`cycle-kickoff/SKILL.md`・`take.ts`・`implementation.md`）を、主の jsonl で PM の Bash の書き込み（python の `open`・`sed -i`・`cat >`・`tee`・`git apply`）で探した。当たるものは無かった。訂正が `frontend-design` だけを正したのは、記録と食い違わない。
- **直すこと**: 中1 の行を、何時の報告で何を正したかの形にする。

## 確かめて問題がなかったもの

- **15巡目の重1 の記録**:
  - decisions.md の15巡目の行の数・行・時刻は、review-ap-check-15.md と合う。
  - 164・4304・4900・18626・34541 行の時刻と中身（python での書き換え）を、jsonl で見て確かめた。
  - 「戻し方」は、1回きりの逸脱と読ませない形で15巡目の行を指している。
  - AP-WF08・AP-WF29・AP-WF50 の発生の欄には、316 がある。
- **review-ap-check-15.md の写し**:
  - 15:38:26 の hand-back の本文と、`### 重1` から末尾まで突き合わせた。
  - 違いは、jsonl の文字の化け2か所と、harness が付けた末尾の文だけである。PM は原文のまま写している（AP-WF08 に当たらない）。
- **規則の書き方**:
  - 既存の `.claude/rules/` の9つのファイルは、どれも `paths` の frontmatter を持つ（head で確かめた）。
  - `paths` の無い規則は起動したときに CLAUDE.md と同じ優先度で読み込まれる。これは文書のとおりである（重1 はどの木から読み込まれるかの問題）。
  - 「Edit・Write で書いたものだけが整形と残骸の検査を通る」は、`settings.json` の PostToolUse（`Edit|Write|MultiEdit` に prettier・`post-write-residue-check.sh`・`trust-guard.sh record`）と合う。
  - 「既定の案内より優先する」は、オーナーの 10-02 の言葉（hook について）を広げていない。
  - 15巡目の対処の planner は、すべて Edit・Write で書いた（subagent の jsonl の tool_use で確かめた。Bash は読み取りと `prettier --check` だけ）。
- **`docs/anti-patterns/` の変更**: ツギハギは無い。次のどれにも反しない。
  - `.claude/rules/anti-patterns-directory.md`
  - オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）
  - オーナーの 10-02 の言葉
  - AP-WF01・完了のチェックリスト・reviewer.md
- **AP-WF52 の欠番の行**:
  - 先例（AP-WF25・26、42〜44、45〜49）と同じ形である。
  - 詳細の在りか（decisions.md の15巡目の行）は実在する。
  - candidates.md・本体のどこにも、AP-WF52 は残っていない。
  - AP-WF52 はどのコミットにも入っていない。しかし、完了のコミットに入るレビューの記録が AP-WF52 を指すので、欠番として残すのは正しい。
- **AP-WF32 の候補**:
  - N=10 は、AP-WF08 の発生の欄（163, 168, 188, 228, 243, 288, 290, 294, 300, 316）と合う。
  - 昇格させない理由は、AP-WF28 の候補と同じ扱いとして書かれている。
- **hook の取り消し**:
  - `git diff HEAD -- .claude/hooks .claude/settings.json scripts .github` は空である。
  - `git diff origin/main HEAD -- .claude/hooks .claude/settings.json` も空である。
- **split-plan.md 6 の手順0〜5**: 上から打てる（重1 の直しで手順3のパスが変わる場合は、その直しのあとで改めて確かめる）。
  - 手順0:
    - HEAD は da54202e である。
    - `git diff da54202e 83a8cbd9 -- …/frontend-design/SKILL.md` の hunk は1つである。
    - 作業ツリーの `git diff da54202e` の hunk は4つである。
    - 置き換える前の文は作業ツリーに1つあり、da54202e の文も1つある。
    - pre-commit の hook が見るファイル（`git status --porcelain` の削除を除く123件）は、`prettier --check` を通る。そのうち JS/TS の55件は、eslint を通る。
  - 手順1:
    - `design-rollout-wip` はローカルも origin も 20a29292 である。
    - SKILL.md を除く `git diff --name-only da54202e design-rollout-wip` の64のパスと、作業ツリーの `src/` の変更は、1件を除いて一致する。
    - その1件は `src/play/quiz/solvedScreenHeadings.ts` の削除である。wip で `solvedScreenPhrases.ts` への名前の変更（R060）として検出され、`--name-only` には移した先しか出ない。
    - このとき `git add -A` は削除を載せない。しかし、`git switch` は移り先に無いファイルの削除を妨げず、戻るときに HEAD の版を戻す。同じ形の小さなリポジトリで確かめ、`git status --short` は空になった。手順は直さなくてよい。
    - `git diff design-rollout-wip -- src` に出る4つのファイルは未追跡で、wip の版と同じ中身である（cmp で確かめた）。
  - 手順3:
    - main の `deploy.yml` の `on.push.branches` は `[main]` である。
    - main の `wait-for-ci.sh` は、`gh` が無いとき exit 3 で終わり、skipped を失敗としない。このコンテナに `gh` は無い。
    - `block-destructive-git.sh` は、`switch`・`branch -d`・`rm -rf .next` を止めない。
  - 手順5:
    - origin/main は 9c848bd0 で、分かれ目と同じである。
    - `git log 9c848bd0..origin/main` は空である。
  - 空きは 4.6GB ある。
- **記録の数**:
  - review-log.md・review-response.md を除く review-\*.md は 418 本で、index.md・review-log.md と合う。
  - このファイルで 419 本になる。

## workflow.md の各項目の当てはめ（15巡目の受け取り 15:38 から、この点検の依頼 15:43 まで）

- **AP-WF01**: 15巡目の指摘への対処を、この点検に回している。この点検の3件に対応したあと、全体の見直しを含めてもう一度点検を受ける。
- **AP-WF02・AP-WF05**: このあいだに、来訪者に見える変更は無い。当たらない。
- **AP-WF03**: planner への依頼は、規則に書く中身の要点を渡した。これは決定（何を禁じるか）で、実装の書き方を literal に決めたものではない。規則の文は planner が書いた。当たらない。
- **AP-WF04**: planner の hand-back（15:42:46・15:43:43）を受けてから、追加の判断を渡し、この点検を頼んだ。当たらない。
- **AP-WF06**: 依頼文の事実は、15巡目のレビュアーが確かめたもので、出どころを示して渡している。ただし、PM が planner に渡した判断（2）「main に入れない」は、規則が起動したときの木から読み込まれることを確かめていない（重1）。
- **AP-WF07**: 1つの planner に1つの対処を頼んだ。並行する担当は無い。当たらない。
- **AP-WF08**:
  - review-ap-check-15.md の写しは原文のままである。当たらない。
  - 15巡目が指した PM の代行は、記録と規則で受けた。15:38 以後、PM が Bash でリポジトリのファイルを書いた呼び出しは無い（15:39:15 の Bash は `ls` と `head` だけ）。
- **AP-WF09**: 項目ごとに、jsonl・git・ディスクの実物と突き合わせた。名前の変更の1件のように、数が合わないところは原因まで確かめた。
- **AP-WF10**: 15:42:57 の SendMessage は、同じ planner の同じ対処への、PM の判断3つの追加である。軽微な続きの範囲に入る。レビューの再依頼ではない。当たらない。
- **AP-WF11**: このあいだ、PM は規則のファイルを読まずにオーナーへ中身を報告している（15:43:03）。ただし、報告の要約は実物と合っていて、承認の判断はまだ下していない。承認の前に、PM が規則とこの点検の直しを自分で通読する。
- **AP-WF12**: 重1 の前提（規則の読み込まれ方）は、フレームワークの挙動を確かめずに置いたもので、これに当たりうる。扱いは重1 の3。
- **AP-WF13・AP-WF14・AP-WF15・AP-WF23**:
  - 並行のアサインは無い。
  - 数は一次の集計で確かめた。
  - 完了の処理の前である。
  - 終了時のチェックリストにチェックは無い（正しい）。`completed_at` の付け直しは手順2 にある。
  - いずれも当たらない。
- **AP-WF24**:
  - このあいだの報告に、許可を求める文は無い。
  - `~/.claude/stop-hook-git-check.sh`（システムの hook）の「コミットせよ」に対しては、PM が理由を書いて従わなかった。オーナーの 10-02 の言葉（hook は CLAUDE.md より下）と、完了のコミットを点検の承認のあとに置く決まりに合う。
  - 当たらない。
- **AP-WF27**:
  - 15:39:41 の訂正は、記録に合う。
  - 「hook ではなく規則にした理由」の文は PM の判断の説明で、過去の内心の断言ではない。
  - 当たらない。
- **AP-WF29**:
  - 15:39:15 の Write と Bash（読み取り）は同じバッチだが、Bash は Write の結果に依らない。
  - planner の起動は、Write の成功を見たあとである。
  - 当たらない。
- **AP-WF30**: 評価の結論で対応の範囲を縮めた所は見つからなかった。
- **AP-WF38**: この点検の依頼は、観点を限っている。当たらない。
- **AP-WF39**: 来訪者に届く成果物のレビューを打ち切った所は無い。当たらない。
- **AP-WF41**:
  - 15巡目の改稿で、AP-WF52 を外し、AP-WF21 の記録との食い違いは消えた。
  - 足した「main に入れない」は、6・7巡目に指された型（main の木で欠けるものを、急ぎのサイクルの側だけで数える）を新しく入れている（重1）。
- **AP-WF50**: このあいだにコミットは無い。当たらない。

---

指摘が3件あるので、次のとおり進めること。

1. 重1 の道を PM が決める。決めた形で、planner に split-plan.md・decisions.md・`cycle-completion` の手順7（スキルの変更は builder の担当なら builder）を直させる。
2. 中1 は、planner（規則の文）に直させる。
3. 軽1 は、planner に decisions.md の中1 の行を直させる。
4. 直したあと、前回の指摘だけでなく全体の見直しを範囲に含めて、もう一度このレビューを頼む。依頼文には、規則の中身（Edit・Write で書き、シェルで書かない）を引き続き書いて渡す。
