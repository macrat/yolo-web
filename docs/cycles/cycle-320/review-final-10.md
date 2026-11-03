# cycle-320 の全体のレビュー 第10回

対象: 統合のブランチ `design-rollout`（HEAD 0a549f40）。index.md・carryover.md・plan-t5a7.md・review-log.md・deviations.md の全文、review-final-9.md・review-ap-check-7.md の全文を、白紙で読んだ。第9回のあとの変更は `git log --oneline 9783810d..HEAD`（7bd5c4a8・adaf2cc2・c672e8d5・66ebc1cf・0a549f40）と `git diff 9783810d..HEAD` の全体で見た。`measure/README.md` の版の表と状態の行、t5a-measure.md の章立て、t5a-4-alignment.md の測る範囲、docs/backlog.md の B-754・B-614・B-623・B-624・B-738・B-788・B-790〜B-794 の行も読んだ。PM の手は、PM のセッションの記録（`/root/.claude/projects/-home-user-yolo-web/4d6b74ab-79c6-5e4b-b087-d3a9a26aaa05.jsonl` の 7021〜7211 行、05:02〜05:37）の tool_use・tool_result と `message.id` で確かめた。サーバーは起こしていない。

**結論: 改善指示**（中1件・軽2件）

## 自分で確かめたこと

- **来訪者への害**: `git diff --stat 9783810d HEAD -- src .claude DESIGN.md scripts package.json docs/cycles/cycle-320/measure docs/cycles/cycle-316 docs/knowledge docs/backlog.md` は空。第9回のあとに変わったのは docs/cycles/cycle-320/ と `docs/anti-patterns/planning.md` の AP-P17 の並び（「, 320」の1語）だけである。このサイクルの `src` の変更（f0a5c569・fa187dff・9d5a4c09 の 25 ファイル）は T5a-4 のレビュー第10回と左端の揃いの記録の第5回で承認されたもので、第9回のあと変わっていない。`design-rollout` は来訪者に届かない。害は無い。
- **形**: 変えた文書はどれも `prettier --check` を通る。index.md 32,298B・carryover.md 11,666B で 40,000B の内。5つのゲートは 9783810d で exit=0（`tasks/b438ho9ou.output`）。0a549f40 では走っている途中（`tmp/cycle-320-gates.head` は 0a549f40、log は format:check の段）で、9783810d からの差は Markdown だけである。終了時のチェックリストは未チェックで、状態どおり。
- **第9回の指摘の消化**: 指摘1 は済んだ（deviations.md 25 行に、AP-WF27 の builder を review-ap-check-6.md のコミット b3055acf の前に起こしたことが入った）。指摘2 は済んだ（7043 行で candidates.md の AP-WF20・AP-WF53・AP-WF56 の発生件数の行を開き、3つとも cycle-320 がある。review-log.md の文は「名指した本体の項目の発生の並びを grep で、候補…を candidates.md で開いて（候補は全体のレビュー第9回の指摘のあとに開いた）」と手の範囲どおりで、事実）。
- **点検第7回の L1〜L3**: L1 は済んだ（7100 行で review-plan.md 29 行・review-plan-13.md 71 行の AP-P17 の名指しと、planning.md の並びに 320 が無いことを確かめ、builder の adaf2cc2 が並びの末尾に「, 320」を足した。7154〜7157 行で `git log` と差分 13 行を書き出して Read で全部読み、7161 行で別の呼び出しで取り込み、木と枝は `--force` なしで消した）。L2 は済んだ（review-log.md の「deviations.md が名指した番号の中では…この確かめは deviations.md の番号だけに当てたもので、レビューの記録が名指した AP-P17 は範囲の外だった」）。L3 は第9回の指摘1 と同じ直しで済んだ。
- **書いた時の形**: c672e8d5 の review-log.md は「builder に一覧へ足させる」と予定の形で書き、取り込んだあとの 0a549f40 で「builder が一覧へ足して取り込んだ（adaf2cc2）」に直している。起きていない出来事を起きたとは書いていない。review-log.md の手順の穴の扱い（「レビューの記録が名指した番号を一覧に当てる見方を点検の依頼に入れて扱う」）は、7197 行の点検第8回の依頼に「各レビューと点検の記録が名指した番号もすべて、発生の一覧（本体と candidates.md）を開いて当てること」とあり、事実である。
- **表と経過**: index.md のレビュー結果の表の「全体」9回・「完了の点検」7回は、review-final-9.md・review-ap-check-7.md と合う。この第10回と並ぶ点検第8回はまだ載っていない（走っている途中で、状態どおり）。review-log.md の第9回（中1件・軽1件）と点検第7回（中1件・軽2件）の要約は、2つの記録の結論の件数と中身に合う。deviations.md 3 行の範囲は〜-7 になった。
- **AP-WF29・AP-WF11・AP-WF04**: 第9回のあと、Edit とそれを前提にするコミット・push、マージ、木の削除を同じバッチに並べた所は無い（Edit は Qapafk・t9HBPh・RbKVop・23w1Qe、コミットは HPidXY・MvFGvA・1nnhiF、マージは m59NYn で、どれも別のバッチ。コミットの前にはどれも別の呼び出しで `prettier --check` と `git status --short` を見ている）。adaf2cc2 の確かめ（7154 行）は builder の手渡し（7138 行の enqueue）のあとである。
- **申し送り**: carryover.md・plan-t5a7.md は第9回のあと変わっていない。読み直すと、1本の順（着地の作りの決め直し → 道具 → 害の確かめ → 分け方と見積もり → 条件7・D5 → 判断 → T5a-8 → 残りの条件 → knowledge → 完了のレビュー）は index.md のキャリーオーバーの要約・plan-t5a7.md 2a・2b・3 と合い、版の表（`after` は 5ea1ab89、`base` は 2db1c7d9）と書き直す時の文も README と合う。ただし、着地の作りの決め直しに渡す材料の指し方に1か所、次のサイクルを迷わせうる所がある（指摘2）。
- **ツギハギ**: cycle の外で変わったのは planning.md の並びの1語で、経緯や直した跡の文は無い。

## 指摘

### 指摘1（中）: deviations.md の AP-P17 の新しい項が、2a の出どころと、第13回のあとに起きたことを事実と違えて書く（AP-WF27）

c672e8d5 で足した deviations.md 44 行は「範囲の決め直しで足した 2a は、直す形を1案だけで決めていた（AP-P17）。計画のレビュー第1回と第13回が捕まえ、案を足して比べ直した（2a はそのあと次のサイクルへ送った）」と書く。

- 1案だけで書かれていた 2a は、試しの走りのあとの計画の組み替えで足した「余白の直し T5a-8a」である（review-plan-13.md の対象「plan-t5a7.md の 2a（T5a-8a）」、review-log.md の計画の第13回「試しの走りのあとに足した 2a」、同じ deviations.md 37 行の「計画の組み替え（2a）」、index.md 105 行の「(1) だけを直す余白の直し（T5a-8a）を…一度立てた」）。範囲の決め直しはその 2a を外したもので、2a を足したのではない。同じ文の括弧書き「2a はそのあと次のサイクルへ送った」とも、文の中で食い違う。
- 第13回の指摘8 のあと、PM は 2a の直す形の案を足して比べ直してはいない。範囲を決め直し、案の比べを次のサイクルの着地の作りの決め直しの材料として送った（review-log.md の計画の第13回「指摘1〜8 は決め直しの材料として」、carryover.md 6 行「直す形の案の比べ」）。「第1回と第13回が捕まえ、案を足して比べ直した」は、第1回には事実だが、第13回には起きていない出来事である。

この記録は、まさに漏れていた発生を正しく残すために足した項で、後のサイクルが AP-P17 の発生の中身として読む。来訪者への害は無い。

直す向き: 「計画の初版は、範囲の案を…2つだけで比べた（計画のレビュー第1回が捕まえ、案を足して比べ直した）。試しの走りのあとの組み替えで足した 2a（余白の直し T5a-8a）は、直す形を1案だけで決めていた（第13回の指摘8 が捕まえた。2a は範囲の決め直しで外し、案の比べは次のサイクルの着地の作りの決め直しへ送った）」のように、2つの発生を分けて、起きたとおりに書く。

### 指摘2（軽）: 着地の作りの決め直しの材料を「review-plan-13.md の指摘1〜8」と指すと、このサイクルで決めた指摘4・5（・7）まで次のサイクルの宿題に読める。review-log.md の計画の第13回の「指摘4・5 は未決のまま渡した（carryover.md）」は古い状態の文である

- carryover.md 6 行と plan-t5a7.md 2a（23 行）は「決めることと比べる材料は review-plan-13.md の指摘1〜8 にある」と書く。review-plan-13.md の指摘4（合計 3MB の上限に T5a-8 の測り直しの分が残らない）・指摘5（基準の版の記録を `tmp/` に置くと日をまたげない）は、index.md 106 行のとおり PM が plan-t5a7.md 3 に決め（木 4MB・履歴 15MB と、基準の版の要約を `measure/` にコミットする形）、指摘7（版を作るコミットの固定）も plan-t5a7.md 3 の「版を作るコミットは固定する」で決まっている。carryover.md 6 行の括弧の中の列挙（送らない枝の引き金・d1 と d2 の順・範囲に届く送りが無いときの順・iOS・害の比べ方・案の比べ）はこの3つを含まないので、括弧と「1〜8」が食い違う。次のサイクルが review-plan-13.md の指摘4・5 を開くと「重大」の印のついた記録の上限の問いを読み、plan-t5a7.md 3 で済んだかを自分で突き合わせる手間が出る。
- review-log.md の計画の節の第13回の要約は「指摘1〜8 は決め直しの材料として、指摘4・5 は未決のまま渡した（carryover.md）」と書く。そのあと F1 を受けて指摘4・5 はこのサイクルで決まり、carryover.md にも未決として載っていない。決まったことは同じファイルの T5a-7a-1 の節にあるが、計画の節だけを読む者には、いまも未決で carryover.md にあると読める。

来訪者への害は無い。

直す向き: carryover.md 6 行と plan-t5a7.md 2a の指し方を、着地の作りに掛かる指摘（1〜3・6・8 など、括弧の列挙と合う番号）に絞るか、「指摘4・5・7 は plan-t5a7.md 3 で決めた」と添える（carryover.md・plan-t5a7.md は cycle の記録なので、決まりの上では書き分けでよい）。review-log.md の計画の第13回の文には、そのあと plan-t5a7.md 3 で決めたことを1句で添える。

### 指摘3（軽）: AP-P17 の builder を、`git status --short` を見ずに、deviations.md の Edit と同じバッチで起こした（第9回の指摘1・点検第7回の L3 の「次から」の手順。記録に無い）

7105 行（05:18:10、`message.id` …t9HBPh）で PM は AP-P17 の builder を HEAD 7bd5c4a8 で起こした。その前の `git status --short` は 7069 行（05:08:16、7bd5c4a8 のコミットの前）が最後で、そのあと点検第7回の review-ap-check-7.md が未追跡で書かれていた（7132 行で `??`、コミットは 7136 行の c672e8d5）。同じバッチ（t9HBPh）で deviations.md を2度 Edit している。第9回の指摘1 の直す向きと点検第7回の L3 は「このあと担当を起こす前は、`git status --short` で、読ませるものがコミット済みであることを確かめる」としており、index.md 52 行の作業計画も `git status --short` と `git rev-parse HEAD` を別々の呼び出しで確かめてから起こすと書く。

今回は害が無い。依頼は根拠を「このコミットに入っている docs/cycles/cycle-320/review-plan.md の『3.』…と review-plan-13.md の指摘8」と、7bd5c4a8 に入っているファイルだけに置き、未追跡の review-ap-check-7.md も書きかけの deviations.md も読ませていない。builder の差分は並びの1語で、依頼のとおりである。ただ、決めた手順を、直したその次の起こしで踏んでいないことは、deviations.md の 25 行の項の型の続きで、記録に無い。

直す向き: deviations.md 25 行の項に、AP-P17 の builder も起こす前の `git status --short` を見ずに起こした（読ませたものはコミット済みで害は無かった）ことを1句で足す。次の担当を起こす前は、別の呼び出しで `git status --short` を見る。

## アンチパターンの照合

- AP-WF27（記録で裏付けない断言）: 指摘1。ほかの「開いた」「確かめた」「取り込んだ」の主張は、上の確かめのとおり tool_use・tool_result と合う。
- AP-WF09・AP-WF38（内部記録の古い文・申し送りの迷い）: 指摘2。
- `.claude/rules/delegation.md`・index.md の作業計画（起こす前の確かめ）: 指摘3。
- AP-WF29: 当たらない（上の確かめ）。7105〜7107 行の Agent と Edit の同じバッチは、Edit を前提にするコミット・push・木の削除ではなく、builder も Edit したファイルを読まないので、AP-WF29 の型ではない。
- AP-WF11・AP-WF50: adaf2cc2 は `git log design-rollout..<枝>` が1コミットだけであることと差分 13 行の全文を Read で見てから、別の呼び出しで取り込んでいる。当たらない。
- AP-WF08: planning.md は builder が書き、PM が書いたのはサイクルの記録だけ。当たらない。
- AP-WF10: 第9回のあとの SendMessage は 7042 行の1度で、走っている点検第7回への材料の知らせ（「判定はあなたの白紙の見方で」）。点検第7回はそれを受けて判定を変えていない（review-ap-check-7.md の「並んで走った全体のレビュー第9回との重なり」）。当たらない。
- AP-WF23: 実施する作業のチェックは各承認と合い、終了時のチェックリストは未チェック。当たらない。
- AP-WF28 候補: 点検第7回が挙げた手順の穴を、cycle-completion のスキルに書き足さず、点検の依頼の見方で扱った判断は、候補の中身（守れていないルールに手順を書き足して対処しない）に沿う。実際に 7197 行の依頼に入っている。
- AP-WF01: 指摘1〜3 の直しは cycle の記録だけだが、直したあとも全体の見直しの形でレビューに通す。
- ツギハギ: cycle の外で変わったのは planning.md の1語で、跡は無い。

## PM への伝達

- 指摘1〜3 はどれもサイクルの記録（deviations.md・carryover.md・plan-t5a7.md・review-log.md）の直しで、PM が直してよい（carryover.md・plan-t5a7.md は planner が書いた計画の文なので、PM の判断で planner に直させてもよい）。
- 直したら、全体のレビューを新しい reviewer に、前回の指摘だけでなく全体の見直しを含めて頼み直す。並んで走っている点検第8回にも、指摘1・3 を材料として渡す（判定はその reviewer の白紙の見方で）。
- この回の分を、index.md のレビュー結果の表の「全体」の行と review-log.md に足す。最終の HEAD で5つのゲートの exit 0 を確かめてからチェックリストへ進む。
