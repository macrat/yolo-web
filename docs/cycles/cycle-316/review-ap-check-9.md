# cycle-316 完了の処理 手順5 ワークフローのアンチパターンの点検（9巡目）

レビュー日: 2026-10-02
対象: [review-ap-check-8.md](./review-ap-check-8.md) の指摘への対応（workflow.md の AP-WF24 の本文、implementation.md の AP-I14 の削除と AP-WF05 の発生、`frontend-design` スキルの「値を変えるときの手順」の足し、`cycle-kickoff` の手順1の急ぎのサイクルの発生の置き場、split-plan.md 2・3・4・6・8、decisions.md の8巡目の行）と、`docs/cycles/cycle-316/`（未追跡を含む）、`docs/anti-patterns/` の workflow.md・planning.md・implementation.md・writing.md・candidates.md の全体、このサイクルが `docs/anti-patterns/` に入れたすべての変更（`git diff -- docs/anti-patterns` と `git diff origin/main -- docs/anti-patterns`）。split-plan.md 6 の手順0〜5 は、文書・コマンド・作業ツリーの `.claude/hooks/` と `git show origin/main:<パス>` の main の hook と突き合わせた。hook・take-screenshot・knowledge のコードと文の中身は別のレビュー（review-ap-fixes の巡）の範囲で、ここでは再発防止がどこで担保されたかの観点で見た。

この点検の対象の多くは内部記録なので、AP-WF38 のとおり、指摘は後の作業を誤らせる実体の誤り・虚偽の記録・規則に反する所に限った。サイクルのディレクトリ（440 ファイル・約 9.9MB）は、index.md・decisions.md の完了の処理の行・split-plan.md・incident-1.md・review-ap-check-8.md を読み、残りは grep で AP の番号と当てはめの根拠を引いた。全文の通読はしていない。

## 判定

**改善指示（要修正）**

前回の3つの指摘は直った。AP-WF24 の本文は、拒否を許可待ちに置き換えないことと、判定が止めた理由が当たらない形でしか進めないことを、手順を持ち込まずに書いている。AP-I14 は本体から外れて AP-WF05 の発生に 316 が入り、手順は `frontend-design` スキルに移り、「AP-I14」は cycle-301 の候補の1つだけを指すようになった。急ぎのサイクルの発生は、main の `docs/anti-patterns/` に書かずにそのサイクルの文書に残す形が `cycle-kickoff` の手順1に入った。手順0〜5 は、下の実測のとおり PM が上から打てる。

残る重い点は2つで、どちらもこのサイクルが candidates.md に足した候補の番号と数え方が、過去のサイクルの記録と食い違っている所である。AP-WF42・AP-WF43 は、cycle-312 と cycle-313 が「混同を避けるため再利用しない」と決めて欠番に書いた番号で、その欠番の記載は cycle-313 の取り消しのコミットで消えていた。このサイクルはその番号を別の中身に使い、AP-WF42 は同じサイクルの中でも2つの中身に使っている（中1）。AP-WF42 候補の発生の欄は、同じ型の cycle-313 の発生を数えておらず、数えれば N=3 になる（中2）。ほかに、decisions.md に外した AP-I14 を指す行が1つ残っている（軽1）。急ぎのサイクルの発生を統合のブランチへ反映する役目が、次のサイクルの PM の記憶にしか置かれていない（軽2）。decisions.md の8巡目の行が、pre-commit の hook の直しと新しい AP-WF24 は食い違わないと、記録で裏付けずに書いている（軽3）。

## 確かめたこと（実測）

- **remote とローカル**: `git ls-remote` で、main は 9c848bd0、`claude/cycle-kickoff-rv3l21` は 052c0cf9、`design-rollout-wip` は 20a29292（ローカルも同じ）、`cycle-316-records` は b42b12cf。`design-rollout` はまだ無い。ローカルの HEAD は da54202e で、インデックスは空。`/` の空きは 4.7GB。
- **手順0**: `git diff da54202e 83a8cbd9 -- .claude/skills/frontend-design/SKILL.md` は1つの hunk。作業ツリーの同じファイルは da54202e から4つの hunk（完了の直しの3つと `DataTable` の1文）。
- **手順0・1 の通し（使い捨ての clone）**: scratchpad に `git clone --shared` で clone を作り、da54202e の上に、作業ツリーの `src/` の変更（65 のパス。削除2つを含む）と `frontend-design` の SKILL.md を写した。手順0の文を置き換えると hunk は3つになり、そのファイルだけのコミットのあと `git status --short` は空だった。続けて手順1の4つのコマンドをそのまま打ち、`git switch` は2回とも通り、最後の `git status --short -- src .claude/skills/frontend-design` も、`git status --short` の全体も空だった。
  - `git diff --name-only da54202e design-rollout-wip` は、`solvedScreenHeadings.ts` → `solvedScreenPhrases.ts` を名前の変更として扱うので、消えた側の `src/play/quiz/solvedScreenHeadings.ts` を出さない（`--name-status` で `R060`）。そのため手順1の `git add -A` はこの削除を載せないが、`git switch` が作業ツリーで消えたファイルのまま移り先の木（そのファイルが無い）へ移り、戻るときに da54202e の中身で戻すので、上のとおり結果は空になる。手順は直さなくてよい。
  - 手順0のコミットの上で 83a8cbd9 を `git cherry-pick --no-commit` すると、SKILL.md は「Hunk #1 succeeded at 142 (offset 4 lines)」で当たった（split-plan.md 4 の注と合う）。
  - この clone を作るとき、1度目に `git checkout -q -b claude/cycle-kickoff-rv3l21 da54202e` を打ち、`block-destructive-git.sh` が「git checkout <file-path>」として止めた。止めた理由は引数の `/` を作業ツリーのファイルを戻す形と見たことで、新しい clone の中のブランチの切り替えには当たらないので、split-plan.md が使う `git switch` で打ち直した。使い終えた clone は消した。
- **手順のコマンドと hook**: 手順0〜5 のコマンド（`git commit … -- <パス>`・`git add -A -- $(…)`・`git switch`・`git switch -c cycle-316-steps origin/main`・`rm -rf .next`・`npx -y npm@11 ci`・`git push origin HEAD:design-rollout`・`git push origin HEAD:main`・`git merge origin/main`・`git commit --no-edit`・`git branch -d cycle-316-steps` ほか、計26本）を、作業ツリーと `git show origin/main:` の `block-destructive-git.sh` に入力として渡し、どれも exit 0 だった。main の `settings.json` の PreToolUse の hook のうち、手順3の `git commit` に掛かる `backlog-line-length-check.sh` は1行 200 字を超える行で止める。作業ツリーの backlog の B-754 の行は 200 字ちょうどで、超える行は無い。
- **手順3の当てるファイル**: `git diff origin/main` で、`cycle-kickoff`・`cycle-completion` の SKILL.md と `stop-cycle-guard.sh` を読んだ。8巡目の直しで `cycle-kickoff` の手順1に足した文（急ぎのサイクルの発生をそのサイクルの文書に記録し、次のサイクルが手順5で反映する）は、main にある `docs/anti-patterns/`・`docs/cycles/`・`cycle-completion` の手順5を前提にするだけで、main の木でも正しい。作業ツリーの版が完了のコミットの版なので、手順3の `git diff claude/cycle-kickoff-rv3l21 -- <当てるパス>` が空になる形は保たれる。
- **`docs/anti-patterns/` の変更**: `git diff -- docs/anti-patterns`（HEAD との違い）と `git diff origin/main -- docs/anti-patterns` の全体を読んだ。AP の番号は `git log -S"AP-WF42" -- docs/anti-patterns`・`git log -S"AP-WF43" -- docs/anti-patterns` で履歴を引いた（下の中1）。
- **記録の数**: review-log.md・review-response.md を除く review-\*.md は 409 本で、index.md の「409 本」と合う（この記録で 410 本になる）。

## 指摘（重い順）

### 中1 AP-WF42・AP-WF43 は、過去のサイクルが「再利用しない」と決めた欠番で、このサイクルはその番号を別の中身に使い、AP-WF42 は同じサイクルの中でも2つの中身を指している（workflow.md の欠番の決まり・AP-WF12）

- **欠番だった**: cycle-312 は AP-WF42・43・44 の候補を起票して消し、「AP-WF42・43・44 は使用済みとして扱い、次は AP-WF45 から採る」と決めた（cycle-312/incident-16.md）。cycle-313 は 5bc7ef9b で workflow.md の欠番の節に「AP-WF42・AP-WF43・AP-WF44: cycle-312 で候補として新設後に同サイクル内で撤回・削除された欠番（詳細 cycle-312/incident-16.md）。混同を避けるため再利用しない。」と書き、自分が起票して消した AP-WF45〜49 も同じ形で足した（d50e8008 は「次は AP-WF50 から採る」と書いた）。この2行は、cycle-313 の取り消しのコミット 91a0c1a0 が `docs/anti-patterns/` を cycle-313 の開始時点へ戻したときに消え、戻し入れられなかった（`git show 91a0c1a0^:docs/anti-patterns/workflow.md` の72・73行にあり、91a0c1a0 の版に無い）。いまの workflow.md の欠番の節は AP-WF16・22・25・26 だけを書く。
- **このサイクルが使った**: 2026-09-24 の c67ebfaf が candidates.md に「AP-WF42 候補: サブエージェントの完了を、コマンドで能動的に待っていないか」を足し、89db69f5 で取り下げた。incident-1.md の13行目はいまもこの番号でその候補を書く。4日後の d46491c4 が、同じ AP-WF42 を「並行して作業する担当がいるとき、自分のコミットに他人のステージ済みの変更を巻き込んでいないか」に使った。作業ツリーは AP-WF43 を「進め方の案を比べるとき…」に使っている。AP-WF43 は cycle-312 で2つの別の中身（incident-2.md の「サイクル進行中にターンを終了させていないか」と、incident-16.md の2代目）に使われていて、これが3つ目になる。
- **同じ誤りの繰り返し**: cycle-313/incident-2.md の #9 は「アンチパターン候補の次の空き番号は AP-WF42」と思い込み、git のインデックスの共有の候補を AP-WF42 で起票した誤りを記録している（847f60f3。5bc7ef9b で AP-WF46 へ改番）。このサイクルは、同じ主題の候補を同じ AP-WF42 で起票した。欠番の記載が消えていたので、番号を選ぶ側が開く workflow.md と candidates.md からは気づけない状態だった。
- **害**: cycle-312・313・316 の文書（cycle-316/incident-1.md、cycle-312/incident-2.md・incident-16.md、cycle-313/incident-2.md・incident-3.md・incident-5.md）が同じ番号で別の候補を指し、後のサイクルが「AP-WF42 候補」「AP-WF43 候補」を引いたときに、どの候補の話か、発生をどこに数えるかを取り違える。8巡目の中2 の直し（decisions.md の217行目）は「AP-I14」の番号の重なりを `git log -S` で確かめたが、同じ確かめを、このサイクルが新しく採った workflow の候補の番号には掛けていない。
- 直すこと（扱いは PM が決め、文は planner が書く）: workflow.md の欠番の節に、消えた欠番（AP-WF42〜44 の cycle-312、AP-WF45〜49 の cycle-313）と、このサイクルで起票して取り下げた AP-WF42（c67ebfaf・89db69f5。incident-1.md）を、先例の1行の形で戻すか足す。いまの2つの候補は、使ったことの無い番号へ改める（`git log -S` で確かめる）。改めた番号に合わせて、候補を指す文（split-plan.md 4 の `cherry-pick` の段の「AP-WF42 候補」と 8 の「AP-WF43 候補」、decisions.md の188行目、index.md の「実施する作業」の B-754 の分割の行の「AP-WF43 候補」など。`grep -rn "AP-WF4[23]" docs .claude` で拾う）を直す。cycle-316/incident-1.md の13行目の「AP-WF42 候補」は、取り下げた候補の当時の名として正しいので書き換えない。

### 中2 AP-WF42 候補の発生の欄が、同じ型の cycle-313 の発生を数えていない。数えれば N=3 になり、昇格を検討する段に入る（`.claude/rules/anti-patterns-directory.md`・AP-WF12）

- AP-WF42 候補（中1 で番号を改める候補）は「`git add <自分のファイル>` のあとに `git commit` すると、ほかの担当が先にステージしていた変更も同じコミットに入る」型で、発生を「N=2（cycle-312, 316）」と書く。312 は、8ca36da7 が手順を書いた形を理由に消した旧 AP-WF42（`git add -A`）を同じ型として数えている。
- cycle-313/incident-1.md の「根本原因」は、サブエージェントが `src/blog/content/` の31ファイルをステージした直後に PM が `git add docs/cycles/cycle-313/index.md && git commit` を打ち、`git commit` がインデックス全体を拾って PM のコミット 8a80e0f に31記事と名前の変更が同居した、と書く。いまの候補の概要そのものである。cycle-313 はこれを候補（847f60f3 の AP-WF42、5bc7ef9b で AP-WF46。発生は cycle-313 の中で2回）にし、d50e8008 で「cycle-312 で同じ主題の AP-WF42 が違反として削除済みであり、番号を変えて出し直したもの。この領域は `.claude/hooks/block-destructive-git.sh` の守備範囲で、フックの隙間は B-637、共有ゲートの衝突は B-689 が扱う」として消した。B-689 はいま【中止】（cycle-313 の誤った作業選択の副産物）である。
- 312 の旧 AP-WF42 を、手順を書いた形で消された候補の発生として数えるなら、同じく消された 313 の発生も数えるのが一貫する。数えると N=3（cycle-312, 313, 316）で、`.claude/rules/anti-patterns-directory.md` の「N≥3 で本体への昇格を検討する」の段に入る。decisions.md の177行目は、cycle-313 の取り消しで消えた 313 の発生について「ほかに欠けたものは無かった」と書くが、その確かめは取り消しの直前に 313 を持っていた項目との突き合わせで、取り消しより前に cycle-313 の中で消えた AP-WF46 は範囲の外だった。
- 直すこと（PM が決め、planner が書く）: 発生の欄に 313 を足し（詳細は cycle-313/incident-1.md）、N≥3 の候補として、昇格させるか、cycle-313 の判断（hook の守備範囲）を引き継いで機械の側で担保するかを決める。気づける時（コミットを打つ前に、インデックスに何が載っているかを見る時）があるので、オーナーの規則の「気づく方法がないこと」には当たらない。どちらにしても、cycle-313 が消した理由のうち、いまも成り立つもの（hook の隙間の B-637）と成り立たないもの（B-689 は中止）を決定の行に書く。decisions.md の177行目の「ほかに欠けたものは無かった」も、確かめた範囲が分かる形に直す。

### 軽1 decisions.md の135行目が、外した AP-I14 を指したまま残っている（AP-WF41）

- 135行目（T5-12・T5-20d のレビューを受けた決定の (2)）は、T5-8b について「`DataTable` を使う全ての面の前と後を撮って確かめる（AP-I14）」と書く。split-plan.md 7 は「各サイクルの順と依存は decisions.md の決定と申し送り…に従う」とし、T5-8b は統合のブランチの1つ目のサイクルが受け持つ。そのサイクルが「AP-I14」を引くと、いま candidates.md にある cycle-301 の「防御的な機構を、それが守るものが無い組み合わせにも一律に掛けていないか」に行き当たる。
- 8巡目の中2 の直しは、t4-design.md と t5-8b-design.md の「AP-I14」を「AP-WF05」に直し、review-\*.md は記録なので書き換えないとしたが、decisions.md のこの行は数えていなかった。
- 直すこと: 135行目の括弧を、t5-8b-design.md と同じく AP-WF05（必要なら `frontend-design` スキルの「値を変えるときの手順」）を指す形にする。

### 軽2 急ぎのサイクルが記録した発生を統合のブランチへ反映する役目が、次のサイクルの PM の記憶にしか置かれていない（AP-WF12）

- `cycle-kickoff` の手順1は、統合のブランチの次のサイクルが、キックオフで main をマージしたあと、マージで入った急ぎのサイクルの記録を `cycle-completion` の手順5で統合のブランチのアンチパターン集に反映する、と書く。一方、その時に開く `cycle-completion` の手順5は「今回のサイクルディレクトリ全体と `docs/anti-patterns/workflow.md` を reviewer に読ませる」だけで、急ぎのサイクルの記録（別のサイクルのディレクトリにある）を読ませることも、反映することも書いていない。キックオフで読んだ1段落を、完了の処理まで PM が覚えている必要がある。このサイクルのように、キックオフから完了まで週の上限による中断と文脈の取り直しが挟まると抜けやすい。review-ap-check.md の重い2 が退けた「以後の依頼文には必ず書く」（PM の記憶にしか残らない約束）と同じ形である。
- 直すこと（PM が決め、planner が書く）: キックオフの手順1の同じ段落で、マージで急ぎのサイクルの記録が入ったときは、新しいサイクルの index.md の「実施する作業」に、その発生を手順5で反映する行を置く、とするか、`cycle-completion` の手順5に同じことを書く（どちらか一方）。2つのスキルを直したら、split-plan.md 6 の手順3の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことを保つ。

### 軽3 decisions.md の215行目が、pre-commit の hook の直しと新しい AP-WF24 は食い違わないと、記録で裏付けずに書いている（AP-WF27）

- 215行目は、AP-WF24 の新しい本文（判定が止めた理由が変更そのものにあるときに、同じ結果を判定に掛からない別の道で果たさない）について「上の pre-commit の hook の直しが止められて回り道をしなかった扱いとも食い違わない」と書く。
- 65行目の記録は、PM が「stage したファイルがあればそれだけを確かめる形」（HEAD の index.md の283行目）に hook を直そうとした操作が、権限の判定に「自分の検査の仕組みを変える操作」として止められ、そのあと完了の処理で builder が同じ向きの直し（そのコミットに入るファイルだけを検査する形）を `.claude/hooks/pre-commit-check.sh` に入れた、と書く。止めた理由は変更そのものに当たる（このセッションの記録の要約も、拒否の種類を「Self-Modification」と書く）。builder の書き込みは、セッションの記録（`subagents/agent-a940f69232edb910c.jsonl`）で 2026-10-02 03:13〜05:48 にどれも成功している。Claude Code の文書（permission-modes）は、auto mode では `.claude` への書き込みもサブエージェントの操作も判定に掛かると書く一方、クラウドのセッションはファイルの編集を先に許すとも書く。builder の書き込みが判定を経て許されたのか、判定に掛からなかったのかは、サイクルの文書にも上の記録にも無い。前者なら食い違わず、後者なら新しい AP-WF24 が戒める形そのものになる。
- 直すこと（PM が決める）: 判定を経たかを記録で確かめられるなら、それを65行目に書いて215行目の主張を裏付ける。確かめられないなら、215行目の「食い違わない」を、確かめられないことが分かる形に改め、65行目の「回り道はしなかった」も builder の直しとのつながりが読める形にする。後者の場合に、この直しを完了のコミットに入れるか、AP-WF24 の発生として扱うかは PM が決める。

## workflow.md の各項目の当てはめ

- **AP-WF01（最後の修正のあとのレビュー・全指摘への対応）**: 8巡目の3つの指摘は直り、この巡で確かめた。review-ap-fixes の6巡目（review-ap-fixes-6.md）はまだ記録が無い。完了のコミットをその承認とこの点検の承認のあとに置くゲート（index.md の「実施する作業」の未チェックの行と split-plan.md 6 の前書き）は守られている。
- **AP-WF02（来訪者目線のレビュー・過去の失敗の参照）**: この巡の変更は手順と記録とアンチパターン集で、来訪者に見える変更は無い。共有の部品の撮り比べを `frontend-design` スキルの「値を変えるときの手順」に置いたので、後のサイクルの部品の変更に、使うすべてのページを撮り比べる観点が渡る。
- **AP-WF03（builder への過剰に具体的な指示）**: この巡の依頼文は記録に無い。新しい発生は見つからなかった。
- **AP-WF04（完了通知・構造の変更の実体確認）**: 8巡目の行の主張（AP-I14 を外した、t4-design.md と t5-8b-design.md の参照を直した、SKILL.md の hunk が3つになり 83a8cbd9 が4行ずれて当たる）を、grep と使い捨ての clone で確かめ、実体と合った。decisions.md の135行目の取りこぼしは軽1。
- **AP-WF05（4通りの撮影）**: この巡で来訪者に見える変更は無い。cycle-316 の T4-16 の発生が AP-WF05 の欄に入った。
- **AP-WF06（渡す事実の確認）**: split-plan.md 6 の期待の出力（hunk の数・パスの数・5つのパス）は実測と合った。
- **AP-WF07（1エージェント1タスク・同じファイルの並行アサイン）**: この点検のあいだ、HEAD・インデックス・`git status --short` の数は始めと終わりで同じで、読んだ文書は動かなかった。
- **AP-WF08（PM の代行）**: スキル・アンチパターン集・split-plan.md の文は planner、決定は PM、と decisions.md の行は書く。新しい発生は見つからなかった。
- **AP-WF09（形式的な通過・網羅の主張）**: 8巡目の直しは「AP-I14」の番号の重なりを `git log -S` で確かめたが、同じサイクルで新しく採った workflow の候補の番号（AP-WF42・43）には同じ確かめを掛けていない（中1）。decisions.md の177行目の「ほかに欠けたものは無かった」は、確かめた範囲（取り消しの直前に 313 を持っていた項目）より広く読める（中2）。この点検も、サイクルのディレクトリの全文は通読しておらず、読んだ範囲は冒頭に書いた。
- **AP-WF10（SendMessage での継続）**: 巡ごとに別のファイルで、白紙のレビュアーで回している。
- **AP-WF11（PM の通読・並べ読み）**: workflow.md の欠番の節と candidates.md の番号を、過去のサイクルの事故報告と並べて読めば、中1 に気づけた。
- **AP-WF12（計画の事実の実体確認）**: 手順の前提（hook の挙動・`deploy.yml`・backlog の行と長さ・空き・`--ff-only`・名前の変更を含む手順1）は実体と合った。候補の番号と発生の数は過去のサイクルの実体と合っていない（中1・中2）。急ぎのサイクルの発生の反映が手順の上で担保されていない（軽2）。
- **AP-WF13（隣接タスクへの越境）**: 新しい発生は見つからなかった。
- **AP-WF14（数の採否を一次集計で）**: hunk の数、パスの数（`--name-only` と `--name-status --no-renames` の違いを含む）、remote の ref、backlog の行の字数、AP の番号の履歴、記録の数を、git とファイルとコマンドで一次集計した。
- **AP-WF15（完了処理後の補修の振り分け）**: push の前で、まだ当たらない。
- **AP-WF23（チェックリストの先行チェック）**: 終了時のチェックリストは1つも付いていない（正しい）。`completed_at`（02:50）は、`cycle-completion` の手順5のやり直しで手順1から更新し直す。
- **AP-WF24（Owner への委任・駆動源の帰属）**: 新しい本文は問いと害の形で、手順と事例を持たない。この巡で足した文に、駆動源をオーナーに帰す書き方は見つからなかった。このサイクル自身の hook の直しとの関係は、記録で裏付いていない（軽3）。
- **AP-WF27（内心の断言）**: 215行目の「食い違わない」は、確かめていない事実（builder の書き込みが判定を経たか）に立つ（軽3）。
- **AP-WF29（自分のツールの結果を確かめてから進む）**: 手順0〜5は、Edit の一致、`git status --short` の空、`git diff` の空と5つのパス、CI の成功を見てから次へ進ませ、`git branch -d` を区切って打たせる。この項目に沿っている。
- **AP-WF30（評価の結論を対応範囲を縮める根拠に使う）**: この巡の直しに、まれさや影響の小ささを範囲を縮める根拠にした記述は見つからなかった。軽2 も、急ぎのサイクルがまれであることを理由に退けない。
- **AP-WF38（内部記録のレビューの観点）**: この点検は観点を限って頼まれており、その観点の中で指摘した。中1・中2 は後のサイクルが候補を取り違え、昇格の判断を誤る実体の誤り、軽1 は後のサイクルを別の候補へ導く参照、軽2 は後の作業の抜け、軽3 は記録で裏付かない主張である。
- **AP-WF39（効率の規律で品質のレビューを打ち切る）**: 止める巡を先に決めた形跡は無い。
- **AP-WF41（改稿で同型の欠陥を新しく入れる・防壁の消失）**: 8巡目の直しは、AP-I14 の参照を2つの設計の文書で直し、decisions.md の1行を残した（軽1）。AP-WF24 の書き直しは、自分のサイクルの hook の直しとの整合を、裏付けのないまま主張した（軽3）。消えた防御の文は見つからなかった（AP-WF24 の新しい本文は前の版の「許可待ちに置き換えない」を保っている）。

## このサイクルが `docs/anti-patterns/` に入れた変更と、ほかの規則との両立

- **昇格した5つ（AP-WF29・30・38・39・41）**: どれも問いとその害の2段で書かれ、事例はサイクルの番号だけで、候補にあった対症療法の手順や旧い候補の番号の名残は持ち込まれていない。発生の欄はどれも N≥3 で、別々のサイクルを数えている（316 の発生は、AP-WF29 が decisions.md の146行目、AP-WF30 が207行目、AP-WF39 が32行目と review-log.md の T3-9 の行、AP-WF41 が review-ap-check.md の62行目に裏付く。AP-WF38・AP-WF41 の 313 は decisions.md の177行目と cycle-313 の18巡目の記録に裏付く）。どれも害が出る前に気づける時があり、オーナーの規則に反しない。AP-WF38 は限った観点の中の指摘にすべて対応させるので AP-WF01・完了のチェックリストと両立し、`.claude/agents/reviewer.md`（頼まれた範囲で見逃さずに指摘し、範囲の外でもアンチパターンに当たる問題は指摘する）とも、範囲の外から出た指摘にも AP-WF01 のとおり対応すると読めば両立する。この点検もその読み方で行った。
- **本文を変えた項目**: AP-WF24 は、問いに権限の判定の拒否を許可待ちに置き換えないことを加え、本文は手順を持たない（軽3 はこのサイクルの記録の側の問題）。AP-P01 は合否の線の必要性と見込みを含め、AP-P22 の発生から 316 を外した（decisions.md の161行目）。AP-WF02・AP-WF27・AP-P04・AP-P31・AP-P34・AP-I13 は事例と経緯を外し、AP-WF23・AP-WF24・AP-P34 の2つ目の発生の欄を1つにまとめた。AP-WF28 の欄の古い数を外した。どれもツギハギの跡を残していない。
- **発生の欄の足し**: AP-WF01・05・06・07・24 と AP-I09 の 316 は、decisions.md と review-ap-check.md の行に裏付く。
- **外した項目**: AP-I14 は本体から外れ、AP-WF05 の発生で受けた。欠番に書かない理由（main の本体に入ったことが無く、番号は cycle-301 の候補が持ち続ける）は decisions.md の217行目にあり、成り立つ。
- **candidates.md**: AP-WF17 候補（N=3）は、本体に置かず B-784 の機械の検査で担保する扱いで、`.claude/rules/anti-patterns-directory.md` の「機械的に強制できるものは強制の実装へ移管する」に合う。AP-WF42・AP-WF43 候補は、番号（中1）と AP-WF42 の発生の数（中2）が過去の記録と合わない。番号を改めるときは、発生の欄の個々の事例（コミット 106e161・`twitter-image.tsx`・計画17巡などの数）を、cycle-301/incident-1.md の #13 が是正したとおり、サイクルの番号と詳細の在りかだけにする（`.claude/rules/anti-patterns-directory.md` の Don't「特定の状況に特化した具体的な事例を記録する」）。
- **再発防止の担保の先**: incident-1 は `stop-cycle-guard.sh` の差し戻しの文（main と `design-rollout` の両方に入る）と `ai-agent-communication.md` の「サブエージェントの起動の形」、incident-2 は planning.md の AP-P01 の本文、`pkill -f`・`playwright install`・共有の pid ファイルの件は `block-process-kill-and-browser-install.sh`（作業ツリーの `settings.json` に登録がある）と `playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」、共有の部品の撮り比べ（T4-16）は `frontend-design` スキルの「値を変えるときの手順」と AP-WF05、B-754 の分割の型は AP-WF43 候補（中1 で番号を改める）、文書の肥大は B-784（split-plan.md 7 の1つ目のサイクル）に置かれている。統合のブランチのセッションにはどれも効き、main の急ぎのサイクルには `cycle-kickoff` の手順1の読む先として届く。急ぎのサイクルが見つけた発生の戻り道は軽2。

## 前回の指摘の扱い

| 前回                                | いま                                                                                                                                                                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 中1（AP-WF24 に足した文）           | 本文は、拒否を許可待ちに置き換えないことと、判定が止めた理由が当たらない形でしか進めないことだけを書き、手順と例を外した。直った。このサイクルの hook の直しとの整合の主張は軽3                                                          |
| 中2（AP-I14）                       | 本体から外し、AP-WF05 の発生に 316 を足し、手順は `frontend-design` スキルへ、番号は cycle-301 の候補だけが持つ形にした。t4-design.md・t5-8b-design.md・split-plan.md 4・6 も合っている。直った。decisions.md の135行目の取りこぼしは軽1 |
| 軽1（急ぎのサイクルの発生の置き場） | `cycle-kickoff` の手順1に、main の `docs/anti-patterns/` に書かずにそのサイクルの文書に記録し、次のサイクルが反映する形が入り、split-plan.md 2・3・8 も合っている。置き場は決まった。反映の担保は軽2                                     |

## PM への依頼

指摘は1つ以上あるので、次のとおり進めてください。

1. 中1 の欠番の記載と2つの候補の番号、中2 の AP-WF42 候補の発生の数と N≥3 の扱い、軽2 の反映の担保の置き場、軽3 の記録の扱いは PM が決め、`docs/anti-patterns/`・スキル・split-plan.md・decisions.md・index.md の文は planner に直させてください（軽1 の参照の直しも planner に）。2つのスキルを直したら、split-plan.md 6 の手順3の `git diff` の確かめがそのまま通る（完了のコミットと同じ中身）ことも保ってください。
2. review-ap-fixes の6巡目の判定が出たら、index.md と review-log.md のその行を更新してください。この点検（9巡目）の行も足し、記録の数を合わせてください。
3. 直したあと、もう一度このレビューを依頼してください。そのときは、前回の指摘だけでなく、サイクルのディレクトリと `docs/anti-patterns/` の全体（このサイクルが入れたすべての変更と、候補の番号の履歴を含む）を見直す範囲にしてください。
