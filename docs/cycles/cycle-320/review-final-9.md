# cycle-320 の全体のレビュー 第9回

対象: 統合のブランチ `design-rollout`（HEAD 9783810d）。index.md・carryover.md・plan-t5a7.md・review-log.md・deviations.md の全文、review-final-8.md・review-ap-check-6.md の全文、`docs/knowledge/research-and-verification-techniques.md` の差分の節、`docs/anti-patterns/workflow.md` の AP-WF27 の行、candidates.md の cycle-320 の行、docs/backlog.md の B-754・B-788・B-792・B-793・B-794・B-738 の行を、白紙で読んだ。第8回のあとの変更は `git log --oneline 67328a01..HEAD`（dc57f2f1・c582fba1・b3055acf・a632844e・bb1b947b・9783810d）と `git diff 67328a01..HEAD` の全体で見た。PM の手は、PM のセッションの記録（`/root/.claude/projects/-home-user-yolo-web/4d6b74ab-79c6-5e4b-b087-d3a9a26aaa05.jsonl` の 6755〜7031 行、04:30〜05:02）の tool_use・tool_result と `message.id` で確かめた。AP-WF27 の builder の記録（subagents/agent-aafb465ca6f6ae625.jsonl）も見た。サーバーは起こしていない。

**結論: 改善指示**（中1件・軽1件）

## 自分で確かめたこと

- **来訪者への害**: `git diff --stat 67328a01 HEAD -- src .claude DESIGN.md scripts package.json` は空。第8回のあとに変わったのは docs/cycles/・`docs/anti-patterns/workflow.md`（AP-WF27 の発生に「, 320」）・`docs/backlog.md`（B-792 の1行）・knowledge の1段落だけである。`.github/workflows/deploy.yml` は `design-rollout` の push で CI を走らせるだけで、来訪者には届かない。害は無い。
- **形**: 変えた文書はどれも `prettier --check` を通る。index.md 32,298B・carryover.md 11,666B で 40,000B の内。B-792 の行はちょうど 200 字で、`backlog-line-length-check.sh` の線の内（「統合ブランチで扱う」と、並ぶ行の「統合のブランチの上で扱う」との言い方の違いは、この線に収めるためで、意味は同じ）。5つのゲートは HEAD 9783810d で走っている途中（`tmp/cycle-320-gates.head` は 9783810d、log はまだ format:check の段）。終了時のチェックリストは未チェックで、状態どおり。
- **第8回の指摘の消化**: 指摘1 は済んだ（6762 行で `git show 7b0b6de1` を書き出し、6773 行の Read が 59 行を最後まで返している。deviations.md 22 行の文は事実の形）。指摘2 は済んだ（deviations.md 23 行が 39 回＝28＋8＋3 で、a26b9e93・98e13952・67328a01 を名指す。B-792 も 39 回）。指摘3 は済んだ（「道具の第7〜9回」。2度の相手は「ほかの3人」）。指摘4 は済んだ（deviations.md 30 行に a26b9e93→98e13952 の件）。指摘5 は済んだ（index.md 45 行の頭が「決め直しと、3 の分け方と見積もりと 4〜6 を」で、33・46 行・plan-t5a7.md 2a・7 とそろう）。指摘6 は済んだ（review-log.md の第7回の要約が「builder が…直して取り込んだ（7b0b6de1）」）。指摘7 は済んだ（knowledge の根拠が、J1 が見つけた数・第7回の指摘1 が挙げたもの・節の書き手の実測・第8回の打ち直しを書き分け、直した跡は無い）。
- **点検第6回の K1〜K6**: K1 は a632844e で AP-WF27 の発生に「319, 320」が入った（並びの形はほかの行と同じ）。K2〜K4・K6 は上と同じ直しで済んだ。K5 の2人（T5a-4 の第2段の builder、アンチパターン集の初めの更新の builder）も「ほかの3人」に入っている。3人目の a745cbebc7d876c6a（道具のタッチの距離）は、K5 が「走っている途中の担当への事実の直し」として外すとしたもので、2度（2083・2208 行）はどちらも最初の手渡し（2320 行）より前に届いている。一方、中身は距離の定義の変更という軽微でない直しで、AP-WF10 の「同一タスクの軽微な修正に限る」から外れるとも読めるので、入れた判断は採れる。
- **AP-WF29 の再発**: 6755〜7031 行で、Edit とそれを前提にするコミット・push、マージ、木の削除を同じバッチに並べた所は無い（Edit は KMzVjK・fKM2AE・oe5XZT・TrPhgJ・ZiJAsS・zC4GCe・ZoXfLS、コミットは Yvisni・kSF7Uz・xTeXwM、マージは rbGcud・G9qySw で、どれも別のバッチ）。取り込みの前の `git log 作業ブランチ..枝` と差分の書き出しと Read（6859・6967）は、マージ（6870・6978）と別の呼び出しで、木と枝の削除も別。`--force` は無い。
- **AP-WF27 の文の時**: b3055acf の review-log.md は「builder に足させる」と予定の形で書き、取り込んだあと 9783810d で「builder が足して取り込んだ（a632844e）」に直している。起きていない出来事を起きたとは書いていない。
- **表と経過**: レビュー結果の表の「全体」8回・「完了の点検」6回は、review-final-8.md・review-ap-check-6.md と合う。この第9回と並ぶ点検第7回はまだ載っていない（走っている途中で、状態どおり）。review-log.md の第8回・点検第6回の要約は、2つの記録の指摘と件数（中2件・軽5件、中3件・軽3件）に合う。
- **申し送り**: carryover.md・plan-t5a7.md は第8回のあと変わっておらず、読み直しても、送ったもの（着地の作りの決め直し → 道具 → 害の確かめ → 分け方と見積もり → 条件7・D5 → 判断 → T5a-8 → 残りの条件 → knowledge → 完了のレビュー）の順と置き場は index.md のキャリーオーバーの要約と合う。次のサイクルが迷う所は見つからなかった。

## 指摘

### 指摘1（中）: AP-WF27 の builder を、読ませる review-ap-check-6.md をコミットする前に起こした（`.claude/rules/delegation.md`。deviations.md 25 行の型の再発で、記録に無い）

6911 行（04:42:11、`message.id` …TrPhgJ）で PM は AP-WF27 の builder を起こし、依頼に「根拠は主の木の docs/cycles/cycle-320/deviations.md の…と、docs/cycles/cycle-320/review-ap-check-6.md の K1」と書いた。このとき review-ap-check-6.md は未追跡で（6821・6945 行の `git status --short` に `?? docs/cycles/cycle-320/review-ap-check-6.md`）、コミットしたのは 6948 行（04:42:37、b3055acf）である。依頼に写した HEAD は c582fba1 で、その木に review-ap-check-6.md は無い。

delegation.md は「起こす前に、担当が読む・前提にする変更を主の木でコミットしておく」と定め、index.md の作業計画（52 行）も同じ手順を書く。deviations.md 25 行は、全体のレビュー第6回の直しの builder を、読ませる review-final-6.md をコミットする前に起こした件を手順を外れたこととして書いており、点検第6回の J6 は「同じ形は再発していない」と確かめていた。そのあとの再発で、deviations.md にも review-log.md にも無い。

来訪者への害は無い。builder は主の木の絶対のパスで `grep -n "K1" docs/cycles/cycle-320/review-ap-check-6.md` を読み（subagents の記録）、足したのは「, 320」の1か所で、K1 のとおりである。

直す向き: deviations.md 25 行の項に、AP-WF27 の builder も review-ap-check-6.md をコミットする前に起こしたことを1句で足す。次からは、読ませる記録を先にコミットし、`git status --short` を見てから起こす。

### 指摘2（軽）: review-log.md の点検第6回の要約の「PM が名指した項目の一覧をどれも開いて」が、開いていない候補を含む（AP-WF27・AP-WF09）

review-log.md の点検第6回の要約は「PM が名指した項目の一覧をどれも開いて、漏れが AP-WF27 だけであることを確かめ」と書く。そのとき PM が打ったのは 6893 行の繰り返しで、deviations.md が名指す AP ごとに `grep -h -A2 "^- $ap:" docs/anti-patterns/*.md` で発生の並びを取った。この形は candidates.md の「## AP-WF20 候補: …」の見出しに当たらないので、AP-WF20・AP-WF53・AP-WF56 は「(not a numbered item / candidate)」と出て、並びは見ていない。AP-WF23 は 6897〜6905 行で開き直して cycle-320 を確かめたが、3つの候補は、6755 行より後に candidates.md を開いた呼び出しが無い。

結果そのものは正しい（わたしが candidates.md を開くと、AP-WF20・AP-WF53・AP-WF56 の候補の発生件数にはどれも cycle-320 がある）。ただ、記録は確かめ切ったと書いており、手の範囲より広い。

来訪者への害は無い。

直す向き: 「deviations.md が名指す項目の発生の並びを開いて（候補は前の更新で入れたもの）」のように手の範囲どおりに書くか、candidates.md の3つを開いて確かめてから今の文を残す。

## アンチパターンの照合

- AP-WF27（記録で裏付けない断言）: 指摘2。指摘1 は記録の漏れで、虚偽の文ではない。
- AP-WF06・delegation.md（起こす前のコミット）: 指摘1。
- AP-WF29: 当たらない（上の確かめ）。
- AP-WF11: 取り込んだ2つの枝（c582fba1・a632844e）は、差分をファイルに書き出して Read で全文を返させてから、別の呼び出しで取り込んでいる（6859〜6870・6967〜6978）。当たらない。
- AP-WF08: AP-WF27 の発生・B-792・knowledge は builder が書き、PM が書いたのはサイクルの記録だけ。当たらない。
- AP-WF01: a632844e（アンチパターン集の1語）と c582fba1 はこの回が見た。指摘1・2 の直しは記録だけなので、直したあとも全体の見直しの形でレビューに通す。
- AP-WF23: 実施する作業のチェックは各承認と合い、終了時のチェックリストは未チェック。当たらない。
- ツギハギ: cycle の外の3つ（workflow.md・backlog.md・knowledge）の変わった所に、経緯や直した跡の文は無い。

## PM への伝達

- 指摘1・2 はどちらも PM の記録（deviations.md・review-log.md）の直しで、PM が直してよい。
- 直したら、全体のレビューを新しい reviewer に、全体の見直しを含めて頼み直す。並んで走っている点検第7回にも、指摘1 を材料として渡す（判定はその reviewer の白紙の見方で）。
- この回の分を、index.md のレビュー結果の表の「全体」の行と review-log.md に足す。最終の HEAD で5つのゲートの exit 0 を確かめてからチェックリストへ進む。
