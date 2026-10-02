# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（8巡目）

レビュー日: 2026-10-02
対象: [review-ap-check-7.md](./review-ap-check-7.md) の指摘への対応（`cycle-kickoff` の手順1の急ぎのサイクルの段落と `git merge --ff-only`、`cycle-completion` の手順7、split-plan.md 2・3・8、decisions.md の7巡目の行）と、`docs/cycles/cycle-316/` の全体（未追跡を含む）、`docs/anti-patterns/` の workflow.md・planning.md・implementation.md・writing.md・candidates.md の全体。split-plan.md 6 の手順0〜5 は、文書・コマンド・作業ツリーの `.claude/hooks/` と `git show origin/main:<パス>` の main の hook の実物と突き合わせた。hook・take-screenshot・knowledge のコードと文の中身は別のレビュー（review-ap-fixes の巡）の範囲で、ここでは再発防止がどこで担保されたかの観点で見た。

この点検の対象の多くは内部記録なので、AP-WF38 のとおり、指摘は後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。

## 判定

**改善指示（要修正）**

前回の2つの指摘は直った。急ぎのサイクルは、手順1で統合のブランチの `docs/anti-patterns/` も読み、レビューと手順5のチェックを統合のブランチの版で行うことになった。古いローカルの統合のブランチは `git merge --ff-only` で origin まで進む。手順0〜5 は、下の実測のとおり PM が上から打てる。

残る重い点は2つで、どちらもこのサイクルが `docs/anti-patterns/` に入れた変更が、`.claude/rules/anti-patterns-directory.md` と、このサイクルの扱いそのものに反している所である。AP-WF24 に足した文が、権限の判定に拒まれた操作を別の形で進めることを一般の手順として書いている（中1）。AP-I14 は、候補を経ずに N=1 で本体に足され、候補の「AP-I14 候補」と番号がぶつかり、具体的な事例と手順を本体に持ち込んでいる。サイクルの記録にも、レビューにも載っていない（中2）。ほかに、急ぎのサイクルが見つけた発生を main のどこに書き、キックオフのマージでどう運ぶかが決まっていない（軽1）。

## 確かめたこと（実測）

- **remote とローカル**: `git ls-remote` で、main は 9c848bd0、`claude/cycle-kickoff-rv3l21` は 052c0cf9、`design-rollout-wip` は 20a29292、`cycle-316-records` は b42b12cf。`design-rollout` はまだ無い。ローカルの HEAD は da54202e。`git log 9c848bd0..origin/main` は空。
- **手順0**: `git diff da54202e 83a8cbd9 -- .claude/skills/frontend-design/SKILL.md` は1つの hunk、`git diff da54202e` の同じファイルは3つの hunk。戻す前の文は作業ツリーに1度だけある。
- **手順1**: `git diff --name-only da54202e origin/design-rollout-wip` は65行。ローカルの `design-rollout-wip` は origin と同じ 20a29292。
- **手順2**: 作業ツリーの `src/` の外の変更と未追跡のもの（削除を除く）に prettier の検査を掛け、すべて通った。
- **手順3**: 2つのスキルと `stop-cycle-guard.sh` の `git diff origin/main` を読んだ。新しい文が前提にするもの（`session-start-facts.sh`・`settings.json` の SessionStart と Stop の登録・`stop_hook_active`・`docs/cycles/TEMPLATE.md`・`deploy.yml`・`wait-for-ci.sh`・`block-destructive-git.sh`・`.claude/agents/reviewer.md`・`docs/anti-patterns/` の5つのファイル）は、どれも `git cat-file -e origin/main:<パス>`・`git ls-tree` で main にあった。作業ツリーの版が完了のコミットの版なので、手順3の `git diff claude/cycle-kickoff-rv3l21 -- <当てるパス>` が空になる形は保たれる。
- **キックオフの手順1のコマンドと hook**: `git fetch origin main design-rollout`・`git switch design-rollout`・`git merge --ff-only origin/design-rollout`・`git merge origin/main`・`git diff --stat origin/main origin/design-rollout -- .claude docs/knowledge docs/anti-patterns`・`git show origin/design-rollout:docs/anti-patterns/workflow.md`・`git ls-tree --name-only origin/design-rollout docs/cycles/` を、作業ツリーと main の `block-destructive-git.sh` に入力として渡し、どれも exit 0 だった。
- **`git merge --ff-only`**: 使い捨てのリポジトリで、(a) ローカルに統合のブランチが無いとき、`git switch` が origin から作り、`git merge --ff-only` は「Already up to date.」で通った。(b) ローカルに古い統合のブランチがあり、別の clone が1つ push したあとでは、`git switch` で古いブランチに移ったあと、`git merge --ff-only` が origin の先端まで進めた。
- **ブランチを移ったときの hook の登録**: Claude Code の文書（hooks）は、settings のファイルの hook の変更をファイルの見張りが拾う、と書く。手順3で main の木に移ると、登録も main の `settings.json` のものになるので、split-plan.md 6 の「移った木の hook と `settings.json` は main のもの」は合う。見張りが拾わずに作業ツリーの登録が残っても、main の木に無い `block-process-kill-and-browser-install.sh` は起動できずに止めない側の失敗（exit 127）になり、手順は止まらない。
- **空き**: `/` の空きは 4.8GB。
- **`docs/anti-patterns/` の main との違い**: `git diff origin/main -- docs/anti-patterns/` で、workflow.md に AP-WF29・30・38・39・41 が加わり、AP-WF24 の問いと本文に権限の判定の文が加わり、implementation.md に AP-I14 が加わっている。`git log -S'AP-I14: 共有の部品'` は 23c43c70（2026-09-26。implementation.md の3行だけのコミット）を返し、main と分かれ目（9c848bd0）の implementation.md に AP-I14 は無い。candidates.md の125行目には「AP-I14 候補: 防御的な機構を、それが守るものが無い組み合わせにも一律に掛けていないか」（N=1、cycle-301。「N≥3 で AP-I14 として新設検討」）が main と同じく残っている。`docs/cycles/cycle-316/` を `23c43c70`・「AP-I14 に足」・「AP-I14 を足」・「AP-I14 を新」で探しても当たらず、`implementation.md` を挙げる decisions.md の行は AP-I09・AP-I13 の扱いだけだった。

## 指摘（重い順）

### 中1 AP-WF24 に足した文が、権限の判定に拒まれた操作を別の形で進めることを、一般の手順として書いている（`.claude/rules/anti-patterns-directory.md`・decisions.md の hook の行との食い違い）

- workflow.md の AP-WF24 の本文に、このサイクルで次の文が足された。「権限の判定の拒否はツールの呼び出しへの機械の判定で、Owner の判断ではない。作業の範囲の中の変更が拒まれたら、PM は進め方（一括の置き換えをファイルごとの編集にするなど）を変えて自ら進め、その経緯をサイクルドキュメントに記録する。」発生は decisions.md の15行目（T3-6 の `meta.ts` 36本の一括の置き換えが拒まれ、PM が Owner の許可待ちとして止めた）である。
- 問いの側（拒否を「Owner の許可が要る」に置き換えて作業を止めていないか）は、AP-WF24 の型に合う。害は本文の後ろの文にある。拒まれた中身が「作業の範囲の中の変更」でさえあれば、形を変えて同じ結果に届かせよ、と全てのサイクルの PM とレビュアーが読むチェックリストが指示している。権限の判定は、その呼び出しを止めた理由（形の危うさか、変更そのものか）を持つ。理由が変更そのものにあるときに別の道具で同じ変更を果たすのは、判定を素通りする回り道である。たとえば Claude Code の文書（permission-modes）では、クラウドのセッションはファイルの編集を権限のモードによらず先に許すので、「ファイルごとの編集」は判定に掛からない道になりうる。
- このサイクル自身の扱いとも食い違う。decisions.md の65行目は、作業の途中で PM が pre-commit の hook を直そうとした操作が権限の判定に止められ、「回り道はしなかった」と書き、review-ap-check.md の71行目も「回り道はしない」を正しい扱いとした。hook の直しは、このサイクルの作業の範囲の中の変更でもあったので、AP-WF24 の新しい文を文字どおりに当てると、そのとき回り道をすべきだったことになる。
- `.claude/rules/anti-patterns-directory.md` の Don't（「どのような手順でやるべきか」を記録する）にも当たる。「進め方を変えて自ら進め、経緯を記録する」は手順で、例の「一括の置き換えをファイルごとの編集にする」は T3-6 の特定の状況の対処である。
- 直すこと（どう書くかは PM が決め、文は planner が書く）: 問いは残し、本文の後ろの文を、拒否は Owner の判断ではないので許可待ちに置き換えないこと、かつ判定が止めた理由を読み、その理由が当たらない形でしか進めないこと（同じ結果を判定に掛からない道で果たさないこと）が読める形にする。手順（どう進め直すか）が要るなら、`docs/knowledge/` かスキルに置く。直したら decisions.md の15行目の「拒否を許可待ちに置き換える形を AP-WF24 に書き足した」の記述と合っているかも見る。

### 中2 AP-I14 が候補を経ずに N=1 で本体に入り、candidates.md の「AP-I14 候補」と番号がぶつかり、事例と手順を本体に持ち込んでいる。追加はサイクルの記録にもレビューにも無い（`.claude/rules/anti-patterns-directory.md`・AP-WF01）

- **候補を経ていない**: `.claude/rules/anti-patterns-directory.md` は「正式採用前の候補（N<3）は `candidates.md` に記録し、N≥3 で本体への昇格を検討する」と定める。AP-I14 の発生の欄は「cycle-316 で実際に発生」の1つだけで、候補にも載っていない。このサイクルは、AP-WF29・30・38・39・41 を N≥3 の候補から昇格させ、cycle-298 が N=1 で本体に足して撤回した AP-P36・AP-P37 を欠番として残しているのに、AP-I14 だけがこの決まりの外にある。
- **番号のぶつかり**: candidates.md の125行目の「AP-I14 候補」（cycle-301。守るものが無い組み合わせにも防御を一律に掛けていないか）は「N≥3 で AP-I14 として新設検討」と書いたまま残っている。いま「AP-I14」は本体と候補で別の2つを指し、候補が N≥3 に届いたときの番号も無い。このサイクルの review-knowledge-docs-2.md の3は、このぶつかりを見つけ、「候補の番号そのものの付け直しは candidates.md の担当で、PM が別に扱う」としたが、扱った記録は decisions.md に無く、candidates.md もそのままである。review-ap-check-7.md の中1 と decisions.md の193行目・211行目、split-plan.md 2 も AP-I14 を本体の項目として数えている。
- **事例と手順**: 本文は「たとえば、ボタンに `overflow-wrap: anywhere` を足すと、…「コピ／ー」と折れる」という特定の状況の事例と、「部品を使うページを grep で洗い出し、幅（320・375・1280）と文字サイズ（既定・200%）ごとに、押したあとに出る状態も含めて画素で比べる」という手順を持つ。どちらも `.claude/rules/anti-patterns-directory.md` の Don't に当たる（事例はサイクルの文書に、手順はスキルか knowledge に置く）。
- **AP-WF05 との重なり**: 問い（共有の部品の見た目を変えたら、それを使うすべてのページを撮り比べたか）は、AP-WF05（UI やデザインに影響がある変更をしたら、すべての画面を撮ってレビューしたか。撮影の網羅は take-screenshot のスキル）の言い直しに近く、cycle-316 の発生は AP-WF05 の発生として数えられる形に見える。
- **記録とレビュー**: 23c43c70 は implementation.md の3行だけのコミットで、`docs/cycles/cycle-316/` に、足した決定もレビューも見当たらない。このサイクルが本体へ昇格させた5つは decisions.md の行と点検の巡で扱われたが、AP-I14 は前の7巡の点検でも、昇格の書き方（規則との両立）の確かめに入っていなかった（前の巡の「昇格した項目」の確かめは workflow.md の5つだけで、AP-I14 は「本体にある項目」として数えただけだった）。
- 直すこと（扱いは PM が決め、文は planner が書く）: AP-I14 を本体から外し、(a) AP-WF05 の発生に 316 を足して AP-WF05 で受けるか、(b) 別の候補として candidates.md に置くか（番号は、過去に使って消したもの（cycle-313 の AP-I15・AP-I16 など）を git の履歴で確かめ、ぶつからないものにする）を決める。grep で使う面を洗い出し、幅・文字サイズ・押したあとの状態で比べる手順は、take-screenshot か frontend-design のスキルに置き、事例はサイクルの文書に残す。candidates.md の「AP-I14 候補」の番号の扱いもあわせて決め、本体と候補で1つの番号が2つを指さないようにする。決定を decisions.md に書き、review-ap-check-7.md を指す decisions.md の193・211行目と split-plan.md 2 の「AP-I14」の数え方をそれに合わせる（`cycle-kickoff` の文は AP-I14 を名指していないので、手順3の確かめは変わらない）。

### 軽1 急ぎのサイクルが見つけた発生を、main の木のどこに書き、キックオフのマージでどう運ぶかが決まっていない（AP-WF12）

- 手順1は、急ぎのサイクルのレビューと手順5のチェックを統合のブランチのアンチパターン集で行わせる。そこで AP-WF29・30・38・39・41 に当たる発生が見つかっても、main の木の workflow.md にその項目は無く、main の candidates.md にはまだ候補として残っている（`git diff origin/main -- docs/anti-patterns/candidates.md` で、5つの候補の節が main にだけある）。急ぎのサイクルが main の候補の欄に発生を足すと、次のキックオフの `git merge origin/main` で、統合のブランチが消した節と main が書き換えた行が衝突する。キックオフの手順1はマージの衝突の解き方を書いておらず、統合のブランチの側を採って解けば、その発生は失われる（N の数え方は昇格の判断に使う）。
- 直すこと（PM が決め、planner が書く）: 急ぎのサイクルが、統合のブランチにしか無い本体の項目に当たる発生をどこに残すか（そのサイクルの文書に書き、次のキックオフのマージで統合のブランチの本体の項目に足す、など）を、手順1の急ぎのサイクルの段落か `cycle-completion` の手順7の統合のブランチの記述のどちらか一方に書く。2つのスキルを直したら、split-plan.md 6 の手順3の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことを保つ。

## workflow.md の各項目の当てはめ

- **AP-WF01（最後の修正のあとのレビュー・全指摘への対応）**: 前回の2つの指摘は直り、この巡で確かめた。review-ap-fixes は5巡目が要修正で、6巡目（review-ap-fixes-6.md）はまだ記録が無い（この点検の時点でファイルが無い）。そのあいだも `.claude/hooks/lib/shell_scan.py`（05:55）が書き換わっている。完了のコミットをその承認とこの点検の承認のあとに置くゲート（index.md の「実施する作業」の未チェックの行と split-plan.md 6 の前書き）は守られている。AP-I14 の追加（23c43c70）は、記録の上でレビューを通っていない（中2）。
- **AP-WF02（来訪者目線のレビュー・過去の失敗の参照）**: この巡の変更は手順と記録で、来訪者に見える変更は無い。急ぎのサイクルのレビューが統合のブランチのアンチパターン集を読むようになり、過去の失敗の参照の欠けは閉じた。
- **AP-WF03（builder への過剰に具体的な指示）**: この巡の直しはスキルと計画の文書で、builder への依頼文は記録に無い。新しい発生は見つからなかった。
- **AP-WF04（完了通知・構造の変更の実体確認）**: decisions.md の7巡目の行の主張（`git diff --stat` の読む先に `docs/anti-patterns` を足した、`--ff-only` を `git merge origin/main` の前に置いた、前提にするものが main にある）を、2つのスキルの `git diff origin/main` と `git cat-file`・`git ls-tree` で確かめ、実体と合った。
- **AP-WF05（4通りの撮影）**: この巡で来訪者に見える変更は無い。AP-I14 の問いはこの項目と重なる（中2）。
- **AP-WF06（渡す事実の確認）**: split-plan.md 6 の期待の出力（hunk の数・パスの数・5つのパス・`9c848bd0..origin/main`）は実測と合った。
- **AP-WF07（1エージェント1タスク・同じファイルの並行アサイン）**: この点検のあいだも hook の lib が書き換わっているが、この点検が見る文書と書くファイルは重ならない。
- **AP-WF08（PM の代行）**: スキルと split-plan.md の文は planner、決定は PM、と decisions.md の行は書く。記録の上で新しい発生は見つからなかった。
- **AP-WF09（形式的な通過・網羅の主張）**: 前の巡の「昇格した項目の書き方と、ほかの規則との両立」の確かめは workflow.md の5つに限られ、同じサイクルで本体に入った AP-I14 と AP-WF24 の本文の足しを見ていなかった（中1・中2）。この巡は `git diff origin/main -- docs/anti-patterns/` の全ての足しを読んだ。
- **AP-WF10（SendMessage での継続）**: 巡ごとに別のファイルで、白紙のレビュアーで回している。
- **AP-WF11（PM の通読・並べ読み）**: main の木と統合のブランチのアンチパターン集は、番号では並べて読まれた。本体と candidates.md の番号の並べ読みがあれば、AP-I14 のぶつかりに気づけた（中2）。
- **AP-WF12（計画の事実の実体確認）**: 手順の前提（hook の挙動・`deploy.yml`・backlog の行・空き・道具の版・ff-only の挙動）は実体と合った。急ぎのサイクルの発生の置き場が決まっていない（軽1）。
- **AP-WF13（隣接タスクへの越境）**: 新しい発生は見つからなかった。
- **AP-WF14（数の採否を一次集計で）**: このレビューは、hunk の数、パスの数、remote の ref、空き、`docs/anti-patterns/` の main との違い、AP-I14 の入ったコミット、記録の数（review-log.md・review-response.md を除く review-\*.md が 408 本で、index.md と合う）を、git とファイルとコマンドで一次集計した。
- **AP-WF15（完了処理後の補修の振り分け）**: push の前で、まだ当たらない。
- **AP-WF23（チェックリストの先行チェック）**: 終了時のチェックリストは1つも付いていない（正しい）。`completed_at`（02:50）は、`cycle-completion` の手順5のやり直しで手順1から更新し直す。
- **AP-WF24（Owner への委任・駆動源の帰属）**: この巡で足した文に、駆動源をオーナーに帰す書き方は見つからなかった。この項目に足した本文の文が、拒否の回り道を手順として書いている（中1）。
- **AP-WF27（内心の断言）**: この巡で足した文に、記録で裏付かない内心の断言は見つからなかった。
- **AP-WF29（自分のツールの結果を確かめてから進む）**: 手順0〜5は、Edit の一致、`git status --short` の空、`git diff` の空と5つのパス、CI の成功を見てから次へ進ませ、`git branch -d` を区切って打たせる。キックオフの手順1は `--ff-only` が止まったら先へ進まないことを書く。この項目に沿っている。
- **AP-WF30（評価の結論を対応範囲を縮める根拠に使う）**: この巡の直しに、まれさや影響の小ささを範囲を縮める根拠にした記述は見つからなかった。軽1 も、急ぎのサイクルがまれであることを理由に退けない。
- **AP-WF38（内部記録のレビューの観点）**: この点検は観点を限って頼まれており、その観点の中で指摘した。中1・中2 は規則に反する所、軽1 は後の作業（キックオフのマージ）を誤らせうる欠けである。
- **AP-WF39（効率の規律で品質のレビューを打ち切る）**: 止める巡を先に決めた形跡は無い。
- **AP-WF41（改稿で同型の欠陥を新しく入れる・防壁の消失）**: 前回の中1 の直しは、道具・知見・アンチパターン集の3つをそろえて扱い、同じ形の欠けを残していない。スキルの直しで消えた防御の文は見つからなかった（前の版の SessionStart の注意、`npm ci`、rebase を避ける理由は残っている）。

## 昇格した項目の書き方と、ほかの規則との両立

- AP-WF29・30・38・39・41 は、どれも問いとその害の2段で書かれ、事例はサイクルの番号だけで、候補にあった対症療法の手順や旧い候補の番号の名残は持ち込まれていない。発生の欄はどれも N≥3 で、別々のサイクルを数えている。316 の発生は、AP-WF29 が decisions.md の index.md の直しと push の行、AP-WF30 が6巡目の行、AP-WF39 が T4 の設計の行と review-log.md の T3-9 の行、AP-WF41 が review-ap-check.md に裏付く。AP-WF38・AP-WF41 の 313 は、cycle-313 の18巡目の記録と decisions.md の3巡目の行に裏付く。
- オーナーの規則（気づく方法がないこと、あとから気づいても仕方がないことは書かない）: AP-WF29 は次の操作に進む前に結果を読む時、AP-WF30 は対応の範囲を決める時、AP-WF38 はレビューを頼む文を書く時、AP-WF39 はレビューを止める判断をする時、AP-WF41 は改稿を出す時とレビューを頼む時に、害が出る前に気づける。どれもこの規則に反しない。incident-1 の型（コマンドで待つ）は、待った時点で害が出ているので、この規則に従ってアンチパターン集に書かず、hook と knowledge に置かれている。
- AP-WF01・完了のチェックリスト: AP-WF38 は観点を頼む時に限り、限った観点の中の指摘にはすべて対応させるので、指摘を閉じずに残す道を作らない。AP-WF39 はレビューを結果で止めさせないので AP-WF01 を強める側にある。
- `.claude/agents/reviewer.md`: レビュアーは頼まれた観点の中で見逃さずに指摘し、範囲の外でもアンチパターンに当たる問題は指摘する、と読めば AP-WF38 と両立し、範囲の外から出た指摘にも AP-WF01 のとおり対応するので、どちらかに反する道は残らない。この点検もその読み方で行った（中1・中2 は workflow.md の5つの外だが、規則に反する所として挙げた）。
- 同じサイクルの本体の足しのうち、AP-WF24 の本文の文（中1）と AP-I14（中2）は、`.claude/rules/anti-patterns-directory.md` に合っていない。
- 再発防止の担保の先: incident-1 は `stop-cycle-guard.sh` の差し戻しの文（main と `design-rollout` の両方に入る）と `ai-agent-communication.md` の「サブエージェントの起動の形」、incident-2 は planning.md の AP-P01 の本文、`pkill -f`・`playwright install`・共有の pid ファイルの件は `block-process-kill-and-browser-install.sh`（作業ツリーの `settings.json` に登録がある）と `playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」に入っている。統合のブランチのセッションにはどれも効き、main の急ぎのサイクルには手順1の読む先として届く。B-754 の分割の型は AP-WF43 候補に置かれ、文書の肥大（AP-WF17 候補）は B-784 の機械の検査に回り、split-plan.md 7 の1つ目のサイクルに入っている。

## 前回の指摘の扱い

| 前回                                                | いま                                                                                                                                                                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 中1（急ぎのサイクルがアンチパターン集に届かない）   | 手順1の読む先に `docs/anti-patterns` が入り、レビューと手順5のチェックで reviewer に統合のブランチの版を読ませる文が入った。`cycle-completion` の手順7・split-plan.md 2・3・8・decisions.md の5巡目と6巡目の行も合っている。直った |
| 軽1（古いローカルの統合のブランチの上で始めさせる） | 手順1に `git merge --ff-only origin/<統合のブランチ>` と、止まったら先へ進まないことが入った。使い捨てのリポジトリで、ローカルが無いときも古いときも正しく動くことを確かめた。直った                                               |

## PM への依頼

指摘は1つ以上あるので、次のとおり進めてください。

1. 中1 の AP-WF24 の本文の文、中2 の AP-I14 の扱い（本体から外して AP-WF05 で受けるか候補に置くか、手順と事例の置き場、candidates.md の「AP-I14 候補」の番号）、軽1 の急ぎのサイクルの発生の置き場は PM が決め、`docs/anti-patterns/`・スキル・split-plan.md・decisions.md の文は planner に直させてください。2つのスキルを直したら、split-plan.md 6 の手順3の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことも保ってください。
2. review-ap-fixes の6巡目の判定が出たら、index.md と review-log.md のその行を更新してください。この点検（8巡目）の行も足し、記録の数を合わせてください。
3. 直したあと、もう一度このレビューを依頼してください。そのときは、前回の指摘だけでなく、サイクルのディレクトリと `docs/anti-patterns/` の全体（このサイクルが本体に入れたすべての足しを含む）を見直す範囲にしてください。
