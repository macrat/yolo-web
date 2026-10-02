# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（6巡目）

レビュー日: 2026-10-02
対象: [review-ap-check-5.md](./review-ap-check-5.md) の指摘への対応（手順のコミットを2つのスキル・`deploy.yml`・backlog の B-754 の行に絞った PM の決定と、それに合わせた split-plan.md 2・6、decisions.md、`cycle-completion` の手順7、planning.md の AP-P04・AP-P31）と、`docs/cycles/cycle-316/` の全体（未追跡を含む）、`docs/anti-patterns/` の workflow.md・planning.md・implementation.md・writing.md・candidates.md の全体。split-plan.md 6 の手順0〜5 は、文書・コマンド・作業ツリーの `.claude/hooks/` と `git show origin/main:<パス>` の main の hook の実物と突き合わせた。hook・take-screenshot・knowledge のコードと文の中身は別のレビュー（review-ap-fixes の巡）の範囲で、ここでは再発防止がどこで担保されたかの観点で見た。

この点検の対象の多くは内部記録なので、AP-WF38 のとおり、指摘は後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。

## 判定

**要修正**

前回の指摘はどちらも直った。手順のコミットは4つのパスに絞られ、main に入るのは main の木でも正しいものだけになった（2つのスキルが前提にする hook・ファイルは main にあることを確かめた）。本体の事例と経緯は外れ、走査の数も実体と合う。手順0〜5 は、PM が上から打てる。

残る重い点は1つで、手順のコミットを絞った結果、B-754 のあいだ main で動く急ぎのサイクルが、このサイクルで分かった環境の落とし穴（撮影の道具が起動しない・main の lock が npm 10 の `npm ci` で止まる）とその回避にたどり着く道を持たず、決定の記録もその費用を実体と違う形で数えている（中1）。ほかに、AP-WF06 が「使え」と定める SessionStart の報告が、統合のブランチのセッションでは main の木の値になる（軽1）。

## 確かめたこと（実測）

- **remote の状態**: `git ls-remote` で、main は 9c848bd0、`design-rollout-wip` は 20a29292（ローカルも同じ）、`cycle-316-records` は b42b12cf、`claude/cycle-kickoff-rv3l21` は 052c0cf9。`design-rollout` はまだ無い。ローカルの HEAD は da54202e。
- **手順0**: `git diff da54202e 83a8cbd9 -- .claude/skills/frontend-design/SKILL.md` は1つの hunk、`git diff da54202e` の同じファイルは3つの hunk。戻す前の文（「…と中身を見せる見本（色見本）は要素で渡し…」）は作業ツリーに1度だけあり、戻した先の文は da54202e に1度だけある。手順0 のコミットの入力を作業ツリーの `pre-commit-check.sh` に渡すと、exit 0 で何も出さなかった。
- **手順1**: `git diff --name-only --no-renames da54202e design-rollout-wip -- src` の65行と、作業ツリーの `src` の変更と未追跡の65行は一致し、65のパスはどれも `design-rollout-wip` の中身とバイト単位で同じ（消したパスは作業ツリーにも無い）だった。
- **手順2**: 作業ツリーの `src/`・`docs/`・`.claude/` の外に、`scripts/validate-blog-frontmatter.ts` の変更がある（05:19。review-ap-fixes-4.md のあとの hook の直しで、`pre-commit-check.sh` が使う `--content` の引数）。split-plan.md 6 の前書きは完了のものを「`docs/` の文書と、`.claude/` の hook・設定・スキル」と書くが、手順2 は `git add .` なので完了のコミットに入り、手順の確かめ（`git status --short -- src .claude/skills/frontend-design`）にも触れない。中身は review-ap-fixes の次の巡が見る。B-754 の行は197字で、`backlog-line-length-check.sh`（main と作業ツリーで同じ）の200字に収まる。
- **手順3**: main の `deploy.yml` の `on.push.branches` は `[main]` だけ。main の `block-destructive-git.sh` は `git switch`・`git merge`・`git branch -d`・`rm -rf .next` を止めず、force push を止める（`cycle-kickoff` の手順1 の「hook が止めます」は main でも正しい）。`docs/cycles/TEMPLATE.md` は main にある。main の `package.json` の `pre*` は生成の2つだけで、出力は決まった形で git に入っているか `.gitignore` にあるので、push の hook の検査のあとも `git status --short` は空のまま保てる。
- **手順5**: main の backlog を base、作業ツリーの backlog を ours、main の backlog の B-754 の行だけを作業ツリーの行にしたものを theirs として `git merge-file` を掛けると、衝突が1つ出た。split-plan.md 6 の「衝突しうる。衝突したら Edit で `design-rollout` の側の形に解く」と合う。2つのスキルは両方の側で同じ中身になるので衝突しない。
- **空き**: `/` の空きは 4.8GB、`.next` は 6.0GB で、そのうち `.next/dev` が 4.3GB。split-plan.md 6 の前書きの見積り（build の結果は `.next/dev` を除いて約 1.7GB、3GB を下回れば `.next/dev` などを消す）と合う。
- **ブランチを移ったあとの hook**: 公式の hooks のドキュメントは、settings の hooks の直接の編集は file watcher が拾うと書く。手順3 で main の木に移ると kill の hook の登録は外れ、手順5 で戻ると入る。split-plan.md 6 の手順3 の「main の木には `pkill` などを止める見張りが無い」は、この挙動と合う。
- **main の木の撮影と依存**: main の `take.ts` は `chromium.launch()` を引数なしで呼ぶ。main と同じ版の playwright（1.61.1）の `chromium.executablePath()` は `/opt/pw-browsers/chromium-1228/chrome-linux64/chrome` で、そのファイルは無い（`/opt/pw-browsers` にあるのは `chromium-1194` だけ）。main の `docs/knowledge/playwright-mcp.md` の節は「無限待機する JS」「バックグラウンドエージェントは MCP ツールにアクセスできない」「本番ビルドの実機検証の段取り」「PM 側の監視」の4つで、版の食い違いとその回避を書いた節は無い。main の `dependency-security.md` は `npm@11` に触れない。

## 指摘（重い順）

### 中1 main で動く急ぎのサイクルが、このサイクルで分かった環境の落とし穴と回避にたどり着けない。決定の記録はその費用を実体と違う形で数えている（AP-WF12・AP-WF30・AP-WF41）

- decisions.md の5巡目の中1 の「理由」は、main に道具を入れないことの費用を「incident-1・2 の再発防止の hook と、`ai-agent-communication.md` のフォアグラウンドの確かめの手順を持たないこと」とし、それを受け入れると書く。実体と次の点で違う。
  - **撮影の道具が main の木で起動しない。** main の `take.ts` はライブラリの求める `chromium-1228` で起動しようとし、このコンテナには `chromium-1194` しか無い（上の実測）。このサイクルで見つけて直したもの（decisions.md の `take.ts` の行、`playwright-mcp.md` 35行目〜）だが、直した版も回避の知見も main に入らない。MCP のブラウザもこのコンテナでは起動しない。main の急ぎのサイクルは、AP-WF05 の4通りの撮影の手段を持たない。さらに、Playwright の起動の失敗は `npx playwright install` を勧める文を出し、main の木にはそれを止める hook が無い。環境の決まりに反してブラウザを入れることは、このサイクルで実際に起きた（decisions.md の T5-3b の第10回のレビュアーの行）。
  - **main の lock は npm 10 の `npm ci` で止まる。** split-plan.md 6 の手順3 がそう書き、回避（`npx -y npm@11 ci`）と原因は `design-rollout` の `dependency-security.md` にだけある。
  - **帰属が違う。** incident-2 の再発防止は AP-P01 の本文で、hook は無い。`block-process-kill-and-browser-install.sh` が防ぐのは `pkill -f` と `playwright install` の件（decisions.md の不安定な試験の builder・T5-3b の第2回と第10回のレビュアーの行）で、incident-1・2 ではない。4巡目の中1 の行の「incident-1・2 の再発防止の担保である `block-process-kill-and-browser-install.sh`」も同じ誤りである。
- main の急ぎのサイクルの PM は、cycle-316 の文書（decisions.md・split-plan.md）を main の木で読めない。main に入る文のうち急ぎのサイクルに触れるのは、`cycle-kickoff` の手順1の「本番で急ぎの不具合が出たときだけは、main の上でそれを直すサイクルを立てます」だけで、main の道具と知見が統合のブランチより古いことも、新しいものがどこにあるかも書いていない。撮影や `npm ci` で詰まったとき、その PM はこのサイクルが払った調べを一からやり直すか、上のとおり環境の決まりに反する道へ誘われる。
- 「main で道具を使うのは急ぎのサイクルだけで、それはまれである」は優先度の評価で、それを、そのサイクルに回避への道を渡さない範囲の根拠に使うのは AP-WF30 の形に当たる。一部だけを入れると食い違いが出るという理由は知見と kill の hook には当てはまるが、`stop-cycle-guard.sh` の変更（差し戻しの文とコメントだけで、ほかのファイルを指さず、main の `stop_hook_active` の作りの上で正しい）には当てはまらない。前の版（4巡目）の手順のコミットは kill の hook と `take.ts` を main に入れていたので、絞る改稿がその防御を外し、外した費用を数え漏らした（AP-WF41）。
- 直すこと（どれを選ぶかは PM が決め、文は planner が書く）: main の急ぎのサイクルが、統合のブランチにある新しい道具と知見にたどり着ける形にする。たとえば、main に入る `cycle-kickoff` の手順1の急ぎのサイクルの文に、一般の形で「main の道具と知見は統合のブランチより前の版で、統合のブランチのあいだに見つけた環境の落とし穴と回避は統合のブランチの `.claude/`・`docs/knowledge/` にある。道具が動かないときは `git show origin/<統合のブランチ>:<パス>` で読む」ことを書く（`cycle-completion` の手順7 の一般の形も、それに合わせる）。自己完結して main で正しい `stop-cycle-guard.sh` を手順のコミットに入れるかも、そこで決める。decisions.md の5巡目の「理由」の費用の数え方（撮影の道具・`npm ci`・帰属）を実体に合わせ、4巡目の行の帰属の誤りも直す。AP-WF30 に当たると判断したら、workflow.md の発生の欄に 316 を足す。

### 軽1 AP-WF06 が「使え」と定める SessionStart の報告が、統合のブランチのセッションでは main の木の値になる（AP-WF06・AP-WF12）

- workflow.md の AP-WF06 は「最新サイクルの番号と状態は SessionStart フック（`.claude/hooks/session-start-facts.sh`）が実測して配るので、それを使う」と書く。このフックはセッションの開始の時の作業ツリーの `docs/cycles/` を数える。B-754 のあいだ、次のセッションは main で始まるので、開始の報告は main の最新（いまなら cycle-315 の完了）で、`design-rollout` の最新（cycle-316 以降）と違う。これが約20サイクル、毎回続く（compact のときの SessionStart は移ったあとの木を数えるので、ずれるのは開始の時の報告である）。
- `cycle-kickoff` の手順1（移ってから最新のサイクルの文書を読む）と手順5（両方のブランチを見て番号を決める）は正しい値に導くので、キックオフの番号は誤らない。誤りうるのは、AP-WF06 の文に従って開始の報告をそのまま使う場面（サブエージェントや記録にサイクルの番号と状態を書くとき）である。
- 直すこと（planner）: 統合のブランチで進むあいだは開始の報告が main の木の値であることが、AP-WF06 か `cycle-kickoff` の手順1のどちらかから読めるようにする（どちらに書くかは PM が決める。ツギハギにならない形で書く）。

## workflow.md の各項目の当てはめ

- **AP-WF01（最後の修正のあとのレビュー・全指摘への対応）**: 前回の2つの指摘は直しが入り、この巡で確かめた。review-ap-fixes は4巡目が要修正で、そのあと 05:19〜05:20 に `pre-commit-check.sh`・`lib/` の3つ・`scripts/validate-blog-frontmatter.ts` が書き換わっている。次の巡とこの点検の承認が揃うまで完了のコミットを作らないゲートは、index.md の「実施する作業」の未チェックの行と split-plan.md 6 の前書きにあり、守られている。
- **AP-WF02（来訪者目線のレビュー・過去の失敗の参照）**: この巡の変更は手順と記録で、来訪者に見える変更は無い。中1 は、main の急ぎのサイクルが来訪者に出す修正を撮って確かめられるかに関わる。
- **AP-WF03（builder への過剰に具体的な指示）**: この巡の直しは PM と planner の文書で、builder への依頼文は記録に無い。新しい発生は見つからなかった。
- **AP-WF04（完了通知・構造の変更の実体確認）**: 「手順のコミットを4つに絞った」「AP-P04・AP-P31 の事例と経緯を外した」「走査は91行・発生の欄の外は2行」の主張を、split-plan.md・`git diff origin/main`・planning.md の word diff で確かめ、実体と合った。
- **AP-WF05（4通りの撮影）**: この巡で来訪者に見える変更は無い。`design-rollout` の上の撮影の道具は直っているが、main の急ぎのサイクルは撮影の手段を持たない（中1）。
- **AP-WF06（渡す事実の確認）**: split-plan.md 6 の期待の出力（hunk の数・`src` の65行・4つのパス・backlog の衝突）は実測と合った。SessionStart の報告を使えという本文は、統合のブランチのセッションでは誤った値を渡す（軽1）。
- **AP-WF07（1エージェント1タスク・同じファイルの並行アサイン）**: この点検のあいだにも builder が hook を直しているが、この点検が見る文書とは触るファイルが重ならない。
- **AP-WF08（PM の代行）**: 文書の直しは planner、決定は PM で、記録の上で新しい発生は見つからなかった。
- **AP-WF09（形式的な通過・網羅の主張）**: 前回の軽1 の直しは、走査した行の数を項目の種類ごとに書き、実体（workflow.md 27・planning.md 35・implementation.md 14・writing.md 15）と合う。網羅の主張は数で支えられている。
- **AP-WF10（SendMessage での継続）**: 巡ごとに別のファイルで、白紙のレビュアーで回している。材料は無い。
- **AP-WF11（PM の通読・並べ読み）**: 2つのスキルの main の版と完了の版を並べ、前提の hook とファイルが main にあることは確かめられていた。main の木の道具（`take.ts`）と、このサイクルで見つけた環境の落とし穴を並べれば、中1 に気づけた。
- **AP-WF12（計画の事実の実体確認）**: 手順の前提（hook の挙動・`deploy.yml`・backlog の行・空き・道具の版）は実体と合った。決定の費用の数え方と帰属は実体と違う（中1）。
- **AP-WF13（隣接タスクへの越境）**: 新しい発生は見つからなかった。
- **AP-WF14（数の採否を一次集計で）**: このレビューは、`src` の65のパスの中身、hunk の数、remote の ref、B-754 の行の字数、空き、`chromium.executablePath()` の有無、backlog の3方向のマージを、git とファイルとコマンドで一次集計した。
- **AP-WF15（完了処理後の補修の振り分け）**: push の前で、まだ当たらない。
- **AP-WF23（チェックリストの先行チェック）**: 終了時のチェックリストは1つも付いていない（正しい）。`completed_at` は 02:50 に入っているが、`cycle-completion` の手順5 は直したあと手続きを最初からやり直させ、手順1で更新し直すので、チェックリストの先行チェックには当たらない。
- **AP-WF24（Owner への委任・駆動源の帰属）**: この巡で足した文に、駆動源をオーナーに帰す書き方は見つからなかった。split-plan.md はオーナーの言葉を事実の出典として引き、分けると決めた者を PM に置いている。
- **AP-WF27（内心の断言）**: この巡で足した文に、記録で裏付かない内心の断言は見つからなかった。
- **AP-WF29（自分のツールの結果を確かめてから進む）**: 手順0 は Edit の置き換える前の文の一致を確かめに使い、コミットのあと `git status --short` を見させる。手順3 は `git diff` の空と4つのパスを見てから push させ、手順4・5 は CI の成功を確かめてから次へ進ませ、`git branch -d` を区切って打たせる。この項目に沿っている。
- **AP-WF30（評価の結論を対応範囲を縮める根拠に使う）**: 急ぎのサイクルが「まれである」ことを、そのサイクルに回避への道を渡さない根拠に使っている（中1）。
- **AP-WF38（内部記録のレビューの観点）**: この点検は観点を限って頼まれており、その観点の中で指摘した。数え方や言い回しの揺れ（split-plan.md 6 の前書きの完了のものの言い方など、手順を誤らせないもの）は挙げていない。
- **AP-WF39（効率の規律で品質のレビューを打ち切る）**: 止める巡を先に決めた形跡は無い。中1 は main の急ぎのサイクルの品質の確かめに関わる実体の指摘なので、打ち切る理由は無い。
- **AP-WF41（改稿で同型の欠陥を新しく入れる・防壁の消失）**: 4巡目から5巡目へ手順のコミットを絞る改稿が、main に入る予定だった kill の hook と `take.ts` の直しを外し、外した費用を数え漏らした（中1）。前回の軽1 の直しは、直したと書いた範囲と実体が合う。

## 昇格した項目の書き方と、ほかの規則との両立

- AP-WF29・30・38・39・41 は、どれも問いとその害の2段で書かれ、事例はサイクルの番号だけで、候補にあった正しい姿・対症療法の手順・旧い候補の番号の名残は持ち込まれていない。発生の欄は項目ごとに1つで、継ぎ足しの括弧は無い。AP-WF23・AP-WF24 の欄も1つにまとまっている。
- オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）: AP-WF29 は次の操作に進む前に結果を読む時、AP-WF30 は対応の範囲を決める時、AP-WF38 はレビューを頼む文を書く時、AP-WF39 はレビューを止める判断をする時、AP-WF41 は改稿を出す時とレビューを頼む時に、害が出る前に気づける。どれも規則に反しない。
- AP-WF01・完了のチェックリスト: AP-WF38 は観点を頼む時に限り、限った観点の中の指摘にはすべて対応させるので、指摘を閉じずに残す道を作らない。AP-WF39 はレビューを結果で止めさせないので AP-WF01 を強める側にある。
- `.claude/agents/reviewer.md`: レビュアーは頼まれた観点の中で見逃さずに指摘し、範囲の外ではアンチパターンに当たる問題を指摘する、と読めば AP-WF38 と両立し、範囲の外から出た指摘にも AP-WF01 のとおり対応するので、どちらかに反する道は残らない。この点検もその読み方で行った（中1・軽1 は範囲の外にも見えるが、どちらもアンチパターンに当たるものとして挙げた）。
- AP-WF17 候補を本体に置かず B-784 の機械の検査に回した判断と、AP-WF28 候補を候補に置く判断は、`.claude/rules/anti-patterns-directory.md` の移管の Do と cycle-293 の結論に合う。
- 再発防止の担保の先: incident-1 は `stop-cycle-guard.sh` の差し戻しの文と `ai-agent-communication.md`、incident-2 は AP-P01 の本文、`pkill -f`・`playwright install`・共有の pid ファイルの件は kill の hook と `playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」に入っている。どれも `design-rollout` の上にあり、統合のブランチのセッションには効く（`stop-cycle-guard.sh` は main と同じ登録のまま中身が移った先の版になり、kill の hook は移った先の `settings.json` で登録される）。main の急ぎのサイクルには効かず、その扱いが中1 である。

## 前回の指摘の扱い

| 前回                                                        | いま                                                                                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 中1（`docs/knowledge/` を丸ごと main に入れる）             | 手順のコミットが2つのスキル・`deploy.yml`・B-754 の行に絞られ、直った。絞ったことで main の急ぎのサイクルの道が欠けた（中1） |
| 軽1（本体の事例と経緯・直していない所を「直した」と書いた） | AP-P04 の事例と AP-P31 の経緯が外れ、走査の数（91行・欄の外は2行）と decisions.md の4巡目の軽3 の行が実体と合う。直った      |

## PM への依頼

指摘は1つ以上あるので、次のとおり進めてください。

1. 中1 の、main の急ぎのサイクルにどう道を渡すか（`cycle-kickoff` の手順1の文か、`stop-cycle-guard.sh` などを手順のコミットに入れるか）は PM が決め、`cycle-kickoff`・`cycle-completion`・split-plan.md・decisions.md の文は planner に直させてください。軽1 の文も planner に直させてください。2つのスキルを直したら、split-plan.md 6 の手順3 の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことも保ってください。
2. review-ap-fixes の次の巡が承認になったら、index.md と review-log.md のその行を更新してください。この点検（6巡目）の行も足してください。
3. 直したあと、もう一度このレビューを依頼してください。そのときは、前回の指摘だけでなく、サイクルのディレクトリと `docs/anti-patterns/` の全体を見直す範囲にしてください。
