# T5a-7a-1 の道具のレビュー 第15回

対象: 担当の木 `.claude/worktrees/agent-a98793f663f2cdd15`、枝 `worktree-agent-a98793f663f2cdd15`（HEAD f80d9099）。`git diff design-rollout...worktree-agent-a98793f663f2cdd15` の6ファイル（measure.mjs・report.mjs・measure/README.md・plan-t5a7.md 3・4・t5a-measure.md 0章と10章・carryover.md）を白紙で読んだ。report.mjs は全文を、measure.mjs は差の全体と、それが呼ぶ所・呼ばれる所（`checkFingerprint`・`openViewportFiles`・`beginViewportFile`・`pressRecord`・`keepReasons`・`leaveOf`・`measureAnswers`・`summaryLine`・`main`）を読んだ。照らした決まりは constitution.md、CLAUDE.md、`.claude/rules/`、t5a-design.md 4-9 と 6章 条件7、t5a-measure.md 5-2（最後の「次へ」のあとと離れた走査）と 10-1 の「手順の確かめ」、index.md の作業内容 2・3、`docs/anti-patterns/implementation.md`・planning.md・workflow.md。サーバーは起こさず、tmp/cycle-320/t5a7a1-fix/ の記録を枝の report.mjs で集計し直し、合成の置き場を tmp/cycle-320/review15/syn/ に作って試した。

**結論: 改善指示**（指摘 2件と、PM への申し送り1件。1 は条件7 の「結果への切り替わりのすべての回」の数えに掛かる）

## 自分で確かめたこと

- **道具の blob**: 枝の measure.mjs は `823019d0`、report.mjs は `027f3fbb`。f80d9099 での measure.mjs の差は頭の注の折り返しだけで、記録の書き方は `f295c124` と同じ。after-15・base-15 の頭の行の `tool.measure` は `823019d0`、base-14・after-14・lo-14 は `f295c124`。前回の指摘5(a)（注の途中の切れ）は直っている。
- **合否の数が変わらないこと**: 枝の report.mjs で after-14 と after-15 の 375×550 の「はじめる」を集計すると、どちらも `at16.next` が cases 15・far10 11・far16 10、`avoidable.next` が cases 10・far10 6・far16 5、`hitUnmatched` は空で `hitUnrecorded` 0。base-14・base-15 は 0。`resultView` の足しは束の数を出すだけで、ほかの数に触らない。
- **`resultView` が数える回だけを数えること**: report.mjs の `resultView` の数えは、誤りの行（`r` に `error`）と `f` の無い行の `continue` のあとにあるので、送り直した行と誤りの行は入らない。合成の置き場（`last` に、送り直し1行＋数える行の回、誤りだけの回、誤りのあと数える行に `rv` が無い回、`re` 1・`lo` 1 の回、`re` 0・`lo` 1 の回。`answers` に、離れた走査と `rv` の無い走査）で、`last` は `runs` 4・`resent` 1・`errors` 2・`unresolved` 1、`resultView` は `expected` 4・`missing` 1・`spanEmpty` 1（`emptyRuns` はその回だけ）・`lowInSpan` 1、`answers` は `expected` 1・`missing` 1 で、コードの読みと合った。誤りだけで残った回は `expected` に入らず `unresolved` に出る。
- **記録の値**: base-14・after-14 のどの `last` と走査の束も `missing` 0・`lowInSpan` 0、変更後の版の `emptyRuns` は空。lo-14 は `spanEmpty` 1・`emptyRuns` が character-personality の `[8, 489]`・`lowInSpan` 0 で `flags.nameLow` 1 と同じ回。after-10（`f96d07e7`）の 200% の `last` は `emptyRuns` が japanese-culture の `[9, 549]`。t5a-measure.md 10-2 の値と合う。
- **1行の大きさ（バイト、改行込み）**: base-14 の走査は 375×550 が 138〜282B・平均 237.2B、200% が 130〜286B・平均 173.0B（8本の平均 205B、比 1.36・0.99・1.18）。after-14 の走査の束の平均は 126.5B・130.2B（比 1.14・1.17）。`last` は base-14 が 153.9B・208.1B（0.91・1.23）、after-14 が 175.2B・198.4B。「はじめる」のタッチは base-14 163.1B・base-15 163.9B、after-14 210.5B・after-15 208.1B、after-15 の押しごとの記録は 10 押しで 6,417B（1押し 641.7B）、要約は 3,446B。見積もりの算術 124×0.95＋125×1.36＋355×1.23＋1,675×1.0＋18×1.2＋90×1.2＋156×1.4＋54×1.2＝2,812KB、145×1.04＋80×1.17＋355×1.18＋1,582×1.04＋18×1.2＋108×1.2＋94×1.3＋54×1.2＝2,647KB で、2.9MB の上の線・約 2.65MB と合う。
- **続きとチャンクの受け入れの道筋**: f80d9099 で論理は変わっておらず、前回 hole-14・hole-14-bad で確かめたとおり。
- **文書どうし**: 上限（1MB・4MB・15MB）、基準の版の押しごとの記録の扱い、`--landing`、続きの測りの文（前回の指摘3）、比の取り方（前回の指摘4）、数えるコマンドの `s+0`（前回の指摘5(b)）は、plan-t5a7.md 3・4、README、carryover.md、t5a-measure.md 0章・10章、index.md の作業内容 3 で食い違っていない。Prettier（`--check`）と ESLint は変えたファイルで通る。carryover.md は 11,160B。

## 指摘

1. **走査の「結果に切り替わるはずの回」が、結果に切り替わった押しの2打目で離れた走査を外す（直す）**。report.mjs は `expected` を「`last` のどの回と、2打目で離れなかった走査」（`head.op === "answers" && !line.v`）で数え、README の `resultView` の段落、report.mjs の頭の注、plan-t5a7.md 4 の「条件7」の文も同じ定義で書いている（この定義は前回のレビューの直す形の例が示したもので、前回の例が誤っていた）。しかし `measureAnswers` は最後の答え（知識クイズは最後の「次へ」）の2打目が結果の画面のリンクや「もう一度挑戦する」に落ちたときも `leave` を立てて止まり、要約に `v` を書く。この走査は結果に切り替わっており、条件7 の「結果への切り替わりのすべての回」に入るのに、`expected` から外れ、`rv` が欠けても `missing` に出ない。その回に `rv` があれば `runs` にだけ入り、`runs` が `expected` を越える。起こりうる件で、t5a-measure.md 10-1 の「手順の確かめ」は試しの走りで「最後の答えで結果の「もう一度挑戦する」に1回」離れたと書き、5-2 の「最後の答え・最後の「次へ」のあと」（変更前の版の参考の値）は 375×800 の kanji-level・kotowaza-level・yoji-level で最後の「次へ」の2打目が結果の画面のリンクに落ちて離れたと書く。どちらも条件7 の値が要る回である。いまの要約には、離れた押しが結果に切り替えた押しかを示す欄が無いので（`v` は移った先だけ、`np` だけでは問の数が分からない）、report.mjs だけでは直せない。直す形の例: measure.mjs の走査の要約に、離れさせた押しが結果に切り替えた押し（`record.last` で、診断の答えか知識クイズの「次へ」）であることの印か、離れた押しの帯の番号と種類を持たせ（t5a-measure.md 5-2 の「離れた所（本・問の番号・押しの種類・間隔）」にも要る）、report.mjs はその走査も `expected` に数える。README・report.mjs の頭の注・plan-t5a7.md 4 の定義の文も合わせ、measure.mjs の blob が替わるので、t5a-measure.md 10-2 の blob と走らせ直しの値を新しい走りにそろえる。確かめには、結果の画面で離れる走査を含む走り（例: 375×800 の kanji-level の走査か、それを模した合成の要約）で、`expected` に入って `missing` 0 になることを見る。
2. **細かい所（文を直す）**。(a) plan-t5a7.md 3 の基準の版の箇条は、重みを「どの操作も確かめた比のいちばん大きい値（答えの走査 1.36、最後の答え 1.23、「もう一度挑戦する」は 1.0）」と書くが、「もう一度挑戦する」の確かめた比は 0.97 で、1.0 は切り上げた値である。「確かめた比のいちばん大きい値（「もう一度挑戦する」は 0.97 を 1.0 に切り上げた）」のように、事実のとおりに書く。(b) t5a-measure.md 10-2 の基準の版の「「はじめる」はタッチ 163B（blob `f295c124`・`823019d0`）」は、`823019d0` の base-15 では 163.9B で、ほかの値（変更後の版の 210.5B を 211B、押しごとの記録の 641.7B を 642B）と同じく四捨五入すれば 164B である。「163〜164B」と書く。

## PM への申し送り（builder の直しではない）

- index.md の作業内容 2 の「第10回で承認を受けた」とレビューの表の T5a-7a-1 の行（回数 10）は、第11回からの道具の直しとレビューを映していない。取り込みのときに PM が書き直す。

## 再レビューの頼み方

PM は、指摘1・2 を builder に直させ（指摘1 は measure.mjs の走査の要約と report.mjs の `expected`、README・plan-t5a7.md 4・report.mjs の頭の注の文、t5a-measure.md 10-2 の blob と値。2 は文書）、結果の画面で離れる走査を含む走りの記録とともに、全体の見直しを含めてもう一度レビューに出す。
