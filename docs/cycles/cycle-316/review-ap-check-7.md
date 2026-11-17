# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（7巡目）

レビュー日: 2026-10-02
対象: [review-ap-check-6.md](./review-ap-check-6.md) の指摘への対応（`cycle-kickoff` の手順1の急ぎのサイクルの段落と SessionStart の報告の文、`cycle-completion` の手順7、手順のコミットに足した `stop-cycle-guard.sh`、split-plan.md 2・3・6・8、decisions.md の6巡目の行、workflow.md の AP-WF30）と、`docs/cycles/cycle-316/` の全体（未追跡を含む）、`docs/anti-patterns/` の workflow.md・planning.md・implementation.md・writing.md・candidates.md の全体。split-plan.md 6 の手順0〜5 は、文書・コマンド・作業ツリーの `.claude/hooks/` と `git show origin/main:<パス>` の main の hook の実物と突き合わせた。hook・take-screenshot・knowledge のコードと文の中身は別のレビュー（review-ap-fixes の巡）の範囲で、ここでは再発防止がどこで担保されたかの観点で見た。

この点検の対象の多くは内部記録なので、AP-WF38 のとおり、指摘は後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。

## 判定

**改善指示（要修正）**

前回の2つの指摘は直った。main に入る `cycle-kickoff` の手順1が、急ぎのサイクルに統合のブランチの `.claude/`・`docs/knowledge/` を読ませ、SessionStart の報告が main の木の値であることも書いた。`stop-cycle-guard.sh` は main の木でも自己完結して正しく、decisions.md の費用の数え方と帰属は実体と合う。手順0〜5 は、下の実測のとおり PM が上から打てる。

残る重い点は1つで、急ぎのサイクルが読む先が `.claude/`・`docs/knowledge/` に限られ、このサイクルで本体に昇格したアンチパターンと AP-I14 に届かない（中1）。前回の中1 と同じ形の欠けが、アンチパターン集の側に残っている。ほかに、キックオフの手順1が、同じコンテナに古い統合のブランチが残っているときに古い木の上で始めさせうる（軽1）。

## 確かめたこと（実測）

- **remote とローカル**: `git ls-remote` で、main は 9c848bd0、`claude/cycle-kickoff-rv3l21` は 052c0cf9、`design-rollout-wip` は 20a29292、`cycle-316-records` は b42b12cf。`design-rollout` はまだ無い。ローカルの HEAD は da54202e。
- **手順0**: `git diff da54202e 83a8cbd9 -- .claude/skills/frontend-design/SKILL.md` は1つの hunk、`git diff da54202e` の同じファイルは3つの hunk。戻す前の文（「…と中身を見せる見本（色見本）は要素で渡し…」）は作業ツリーに1度だけある。
- **手順1**: `git diff --name-status da54202e design-rollout-wip` には改名が1つ（`solvedScreenHeadings.ts` → `solvedScreenPhrases.ts`、R060）あり、手順1の `git diff --name-only`（改名を拾う既定）は移った先の名前だけを出す（65行。`--no-renames` なら66行）。消した側の名前はインデックスに載らないが、使い捨てのリポジトリで同じ形（改名した先だけを `git add`、元の名前は作業ツリーで消えたまま、ほかに未追跡の完了のもの）を作り、`git switch <wip>`・`git switch <元>` を往復させると、元の名前のファイルが戻り、完了のものだけが残った。手順1はこのままで正しい。
- **手順2**: 作業ツリーの `src/` の外の変更と未追跡のもの（削除を除く）に prettier の検査を掛け、すべて通った。`.claude/hooks/lib/__pycache__/` と `.claude/.model-edited` は `.gitignore` にあり、`git add .` に入らない。
- **手順3**: 2つのスキルと `stop-cycle-guard.sh` の `git diff origin/main` を読み、完了のコミットの版が、`design-rollout` にしか無い hook・ファイル・節を指さないことを確かめた（`session-start-facts.sh`・`block-destructive-git.sh`・`docs/cycles/TEMPLATE.md`・`deploy.yml` は main にある。`stop-cycle-guard.sh` の新しい文は main の版の `stop_hook_active` の作りの説明で、ほかのファイルを指さない）。main の `block-destructive-git.sh` は作業ツリーと同じ中身で、`git switch -c cycle-316-steps origin/main` と `git branch -d` を止めない。main の `pre-commit-check.sh` は `git status --porcelain` の変わったファイルをすべて見るが、手順2のあとの木は clean なので、手順3のコミットで見られるのは当てた5つだけである（`docs/backlog.md` は main の `.prettierignore` にある）。
- **手順5**: 前回の `git merge-file` の確かめ（backlog が衝突し、`design-rollout` の側の形に解く）から、backlog と2つのスキル・`stop-cycle-guard.sh` の中身は変わっていない。B-754 の行は作業ツリーで197字。
- **空き**: `/` の空きは 4.9GB。
- **main の木の道具とアンチパターン**: main の `take.ts` は47行目で `chromium.launch()` を引数なしで呼び、`/opt/pw-browsers` にあるのは `chromium-1194` だけ（前回の実測と同じ）。`docs/anti-patterns/` の4つの本体の項目の番号を main と作業ツリーで突き合わせると、作業ツリーにだけあるのは workflow.md の AP-WF29・30・38・39・41 と implementation.md の AP-I14 の6つだった（planning.md・writing.md は番号の並びが同じ。AP-P01 の本文の広げは main に無い）。`cycle-completion` の手順5は「`docs/anti-patterns/workflow.md` を reviewer に読ませ」と書き、reviewer.md も `/docs/anti-patterns/` の4つを参照させる。
- **古いローカルの統合のブランチ**: 使い捨てのリポジトリで、ローカルに `dr` を作ったあと、別の clone が `dr` に1つ push した状態から、キックオフの手順1の `git fetch origin main dr`・`git switch dr` を打つと、ローカルの古い `dr` に移り、「Your branch is behind 'origin/dr' by 1 commit」と出るだけで、木は古い版のままだった。

## 指摘（重い順）

### 中1 急ぎのサイクルが、このサイクルで本体に昇格したアンチパターンと AP-I14 に届かない（AP-WF12・AP-WF41）

- 前回の中1 の直しで、main に入る `cycle-kickoff` の手順1は、急ぎのサイクルに `git diff --stat origin/main origin/<統合のブランチ> -- .claude docs/knowledge` を見させ、違うファイルを `git show` で読ませる形になった。`cycle-completion` の手順7と split-plan.md 2・3・8 も「新しい道具と知見を読んでから進む」と書く。アンチパターン集はこの読む先に入っていない。
- main の木のアンチパターン集には、上の実測のとおり、AP-WF29・30・38・39・41 と AP-I14 が無い（workflow.md の5つは main では candidates.md の候補で、candidates.md は「通常のレビューで読み込む必要はありません」と書く）。急ぎのサイクルの完了の処理の手順5の点検と、そのサイクルのレビュアー（reviewer.md の参照）は、main の木の一覧で当てはめる。たとえば AP-I14（共有の部品の見た目を変えたら、それを使うすべてのページを撮り比べる。このサイクルの発生）は、急ぎの不具合の直しが共有の部品に触るときにこそ要るが、その点検に出てこない。AP-P01 の本文の広げ（incident-2 の再発防止）も同じである。
- decisions.md の5巡目の「費用」と6巡目の中1 の行は、main に入れないことの費用を、道具（撮影・`npm ci`・kill の hook）と知見と incident-1 の担保だけで数え、アンチパターン集の古さを数えていない。split-plan.md 2 は「main は古い道具・アンチパターン・知見の一貫した形のまま保たれ」と書きながら、急ぎのサイクルへの道は道具と知見にだけ渡している。前回の中1 と同じ形の欠けが、直しの範囲の外（アンチパターン集）に残った。
- 直すこと（どれを選ぶかは PM が決め、文は planner が書く）: `cycle-kickoff` の手順1の急ぎのサイクルの段落の読む先に `docs/anti-patterns` を含め、そのサイクルのレビューと完了の処理の点検は統合のブランチの版（`git show origin/<統合のブランチ>:docs/anti-patterns/<ファイル>`）で当てることが読めるようにする。`cycle-completion` の手順7の「新しい道具と知見」と、split-plan.md 2・3・8 の文をそれに合わせ、decisions.md の6巡目の行にこの扱いを書く。2つのスキルを直したら、split-plan.md 6 の手順3の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことを保つ。

### 軽1 キックオフの手順1が、ローカルに古い統合のブランチが残っているとき、その古い木の上でサイクルを始めさせる（AP-WF12）

- 手順1のコマンドは `git fetch origin main <統合のブランチ>`・`git switch <統合のブランチ>`・`git merge origin/main` で、ローカルの統合のブランチを `origin/<統合のブランチ>` に進める段が無い。ローカルにその名のブランチが無ければ `git switch` は origin から作るので正しいが、同じコンテナで前に統合のブランチを使っていて、そのあと別のセッションが push していると、上の実測のとおり古いローカルに移り、警告の1行のほかは何も止めない。そのサイクルは古い木の上で計画と作業を進め、完了の push が fast-forward でないとして拒まれるまで気づかない（force push は hook が止めるので、壊れはしないが、やり直しかマージが要る）。このサイクルのコンテナは、週の利用上限で止まったあとも同じ作業ツリーで続いていた（ローカルに `main`・`design-rollout-wip` が残っている）ので、同じコンテナでセッションが続くことは起こりうる。
- 直すこと（planner）: 手順1で、移ったあとローカルの統合のブランチが `origin/<統合のブランチ>` と同じか、それを含むことを確かめさせる（例: `git merge --ff-only origin/<統合のブランチ>` を `git merge origin/main` の前に置く）。直したら中1 と同じく、手順3の確かめがそのまま通ることを保つ。

## workflow.md の各項目の当てはめ

- **AP-WF01（最後の修正のあとのレビュー・全指摘への対応）**: 前回の2つの指摘は直しが入り、この巡で確かめた。review-ap-fixes は5巡目（review-ap-fixes-5.md、05:46）が改善指示で、そのあとも `.claude/hooks/` の `pre-commit-check.sh`・`block-process-kill-and-browser-install.sh`・`lib/` が書き換わっている。完了のコミットをその次の巡とこの点検の承認のあとに置くゲート（index.md の「実施する作業」の未チェックの行と split-plan.md 6 の前書き）は守られている。index.md と review-log.md の「5巡目がレビュー中」は、5巡目の判定に合わせて PM が更新する。
- **AP-WF02（来訪者目線のレビュー・過去の失敗の参照）**: この巡の変更は手順と記録で、来訪者に見える変更は無い。中1 は、急ぎのサイクルが来訪者に出す修正を、過去の失敗の一覧で点検できるかに関わる。
- **AP-WF03（builder への過剰に具体的な指示）**: この巡の直しは PM と planner の文書で、builder への依頼文は記録に無い。新しい発生は見つからなかった。
- **AP-WF04（完了通知・構造の変更の実体確認）**: 「手順のコミットに `stop-cycle-guard.sh` を足した」「`git diff --name-only origin/main` に5つ」「急ぎのサイクルの段落を足した」の主張を、split-plan.md 6 の手順3と2つのスキル・hook の `git diff origin/main` で確かめ、実体と合った。
- **AP-WF05（4通りの撮影）**: この巡で来訪者に見える変更は無い。急ぎのサイクルは、手順1で `take.ts` の直しと `playwright-mcp.md` の回避を読めるようになった。
- **AP-WF06（渡す事実の確認）**: split-plan.md 6 の期待の出力（hunk の数・`src` のパス・5つのパス・backlog の衝突）は実測と合った。SessionStart の報告の扱いはキックオフの手順1に書かれた。AP-WF06 の本文は変えず、スキルの側で導く決定は decisions.md の6巡目の行にある。
- **AP-WF07（1エージェント1タスク・同じファイルの並行アサイン）**: この点検のあいだにも builder が hook を直しているが、この点検が見る文書と触るファイルは重ならない。
- **AP-WF08（PM の代行）**: 文書の直しは planner、決定は PM で、記録の上で新しい発生は見つからなかった。
- **AP-WF09（形式的な通過・網羅の主張）**: decisions.md の6巡目の「2つのスキルの新しい文は…main にあることを確かめ」は、指された hook・ファイルを main の木で確かめ、合った。アンチパターン集の本体の項目の違いは、番号を4つのファイルとも main と突き合わせて数えた（作業ツリーにだけあるのは6つ）。
- **AP-WF10（SendMessage での継続）**: 巡ごとに別のファイルで、白紙のレビュアーで回している。材料は無い。
- **AP-WF11（PM の通読・並べ読み）**: 2つのスキルの main の版と完了の版、main の木の道具とこのサイクルの回避は並べて読まれた。main の木のアンチパターン集と作業ツリーのものを並べれば、中1 に気づけた。
- **AP-WF12（計画の事実の実体確認）**: 手順の前提（hook の挙動・`deploy.yml`・backlog の行・空き・道具の版）は実体と合った。急ぎのサイクルの費用にアンチパターン集の古さが数えられていない（中1）。手順1は、ローカルの統合のブランチが origin と同じことを前提にしている（軽1）。
- **AP-WF13（隣接タスクへの越境）**: 新しい発生は見つからなかった。
- **AP-WF14（数の採否を一次集計で）**: このレビューは、hunk の数、`src` のパスと改名、remote の ref、B-754 の行の字数、空き、アンチパターン集の本体の項目の番号、`chromium.launch()` と `/opt/pw-browsers` を、git とファイルとコマンドで一次集計した。
- **AP-WF15（完了処理後の補修の振り分け）**: push の前で、まだ当たらない。
- **AP-WF23（チェックリストの先行チェック）**: 終了時のチェックリストは1つも付いていない（正しい）。`completed_at`（02:50）は、`cycle-completion` の手順5のやり直しで手順1から更新し直す。
- **AP-WF24（Owner への委任・駆動源の帰属）**: この巡で足した文に、駆動源をオーナーに帰す書き方は見つからなかった。carryover.md と split-plan.md は、分けると決めた者を PM に置いている。
- **AP-WF27（内心の断言）**: この巡で足した文に、記録で裏付かない内心の断言は見つからなかった。
- **AP-WF29（自分のツールの結果を確かめてから進む）**: 手順0は Edit の置き換える前の文の一致を確かめに使い、コミットのあと `git status --short` を見させる。手順3は `git diff` の空と5つのパスを見てから push させ、手順4・5は CI の成功を確かめてから次へ進ませ、`git branch -d` を区切って打たせる。この項目に沿っている。
- **AP-WF30（評価の結論を対応範囲を縮める根拠に使う）**: 前回の中1 の「急ぎのサイクルはまれである」は根拠から外れ、発生の欄に 316 が足された。中1 は数え漏らし（AP-WF12）で、まれさを根拠にした記述は見つからなかった。
- **AP-WF38（内部記録のレビューの観点）**: この点検は観点を限って頼まれており、その観点の中で指摘した。言い回しや数え方の揺れで手順を誤らせないものは挙げていない。
- **AP-WF39（効率の規律で品質のレビューを打ち切る）**: 止める巡を先に決めた形跡は無い。review-ap-fixes も、5巡目の改善指示のあと次の巡へ進む形になっている。
- **AP-WF41（改稿で同型の欠陥を新しく入れる・防壁の消失）**: 前回の中1 の直しは、指摘で名指された道具と知見だけに読む先を渡し、同じ形のアンチパターン集を範囲に入れなかった（中1）。直した所そのもの（スキルの文・split-plan.md・decisions.md の帰属）に新しい欠陥は見つからなかった。

## 昇格した項目の書き方と、ほかの規則との両立

- AP-WF29・30・38・39・41 は、どれも問いとその害の2段で書かれ、事例はサイクルの番号だけで、候補にあった正しい姿・対症療法の手順・旧い候補の番号の名残は持ち込まれていない。発生の欄は項目ごとに1つで、どれも別々のサイクルを数えている（同じサイクルの中で数を増やしていない）。AP-WF38・AP-WF41 の 313 は、cycle-313 の18巡目の記録（cycle-313/review-log.md・incident-7.md）に裏付き、取り消しの 91a0c1a0 で落ちたものを戻した経緯は decisions.md の3巡目の行にある。AP-WF41 の 316 は review-ap-check.md、AP-WF39 の 316 は decisions.md の T4 の設計の行と review-log.md の T3-9 の行、AP-WF29 の 316 は decisions.md の index.md の直しと push の行、AP-WF30 の 316 は decisions.md の6巡目の行に詳細がある。
- オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）: AP-WF29 は次の操作に進む前に結果を読む時、AP-WF30 は対応の範囲を決める時、AP-WF38 はレビューを頼む文を書く時、AP-WF39 はレビューを止める判断をする時、AP-WF41 は改稿を出す時とレビューを頼む時に、害が出る前に気づける。どれも規則に反しない。`.claude/rules/anti-patterns-directory.md` の Don't（手順を書く・特定の事例を書く）にも当たらない。
- AP-WF01・完了のチェックリスト: AP-WF38 は観点を頼む時に限り、限った観点の中の指摘にはすべて対応させるので、指摘を閉じずに残す道を作らない。AP-WF39 はレビューを結果で止めさせないので AP-WF01 を強める側にある。
- `.claude/agents/reviewer.md`: レビュアーは頼まれた観点の中で見逃さずに指摘し、範囲の外ではアンチパターンに当たる問題を指摘する、と読めば AP-WF38 と両立し、範囲の外から出た指摘にも AP-WF01 のとおり対応するので、どちらかに反する道は残らない。この点検もその読み方で行った（軽1 は範囲の外にも見えるが、AP-WF12 に当たるものとして挙げた）。
- AP-WF17 候補を本体に置かず B-784 の機械の検査に回した判断と、AP-WF28 候補を候補に置く判断は、`.claude/rules/anti-patterns-directory.md` の移管の Do と cycle-293 の結論に合う。
- 再発防止の担保の先: incident-1 は `stop-cycle-guard.sh` の差し戻しの文（main と `design-rollout` の両方に入る）と `ai-agent-communication.md`、incident-2 は AP-P01 の本文、`pkill -f`・`playwright install`・共有の pid ファイルの件は kill の hook と `playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」に入っている。統合のブランチのセッションにはどれも効く。main の急ぎのサイクルには、道具と知見は手順1の読む先として届くが、AP-P01 の本文と昇格した項目と AP-I14 は届かない（中1）。

## 前回の指摘の扱い

| 前回                                                        | いま                                                                                                                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 中1（急ぎのサイクルが環境の落とし穴と回避にたどり着けない） | 手順1が `.claude/`・`docs/knowledge/` を読ませ、`stop-cycle-guard.sh` が手順のコミットに入り、decisions.md の費用と帰属が実体に合った。直った。同じ形の欠けがアンチパターン集に残る（中1） |
| 軽1（SessionStart の報告が main の木の値になる）            | キックオフの手順1に、移ってから `docs/cycles/` を見ることと、SessionStart の報告が main の木の値であることが書かれた。直った                                                               |

## PM への依頼

指摘は1つ以上あるので、次のとおり進めてください。

1. 中1 の、急ぎのサイクルにアンチパターン集をどう読ませるかは PM が決め、`cycle-kickoff`・`cycle-completion`・split-plan.md・decisions.md の文は planner に直させてください。軽1 の文も planner に直させてください。2つのスキルを直したら、split-plan.md 6 の手順3の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことも保ってください。
2. review-ap-fixes の次の巡が承認になったら、index.md と review-log.md のその行を更新してください。この点検（7巡目）の行も足し、記録の数を合わせてください。
3. 直したあと、もう一度このレビューを依頼してください。そのときは、前回の指摘だけでなく、サイクルのディレクトリと `docs/anti-patterns/` の全体を見直す範囲にしてください。
