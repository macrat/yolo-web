# cycle-318 の完了の処理 手順5 ワークフローのアンチパターンの点検 第5回

- 対象: 主の木 `/home/user/yolo-web`、ブランチ `design-rollout`、HEAD 5c44bc10（origin も同じことを `git ls-remote` で確かめた。担当の木と `worktree-*` の枝は残っていない。作業ツリーは空）。第4回（[review-ap-check-4.md](./review-ap-check-4.md)）のあとの差分 `git diff 6b991527..HEAD`（index.md と review-ap-check-4.md）と、`docs/cycles/cycle-318/` の全体、`docs/anti-patterns/workflow.md`・`candidates.md` の全体
- 照らしたもの: `docs/anti-patterns/workflow.md`・`candidates.md`、`.claude/rules/`（file-editing・delegation・anti-patterns-directory・knowledge-directory・doc-directory）、`docs/knowledge/text-measurement.md`
- 記録: PM の振る舞いは主のセッションの記録 `~/.claude/projects/-home-user-yolo-web/8802e07a-….jsonl`（以下「記録」、数は行）の 2521〜2616 行で確かめた。記録に無いこと（PM がなぜそうしたか）は書かない（AP-WF27）

## 判定: 要対応

第4回の指摘（index.md の4点・Owner への報告の訂正・(a) の記録）は、すべて閉じた。PM が依頼と Owner への報告に書いた「した」は、今回はどれも記録と合う。ただし、第4回の指摘3を直すとき、PM は `grep` の空の出力から「元の字が 8817ce95 に見つからない」と結論し、そう書いた。元の字はその版の84行にあり、第4回の記録もそれを引いていた。空になったのは、この環境の POSIX ロケールで、日本語の字を角括弧（`[^。]`）に入れた `grep` が黙って何も返さないためである。index.md の記録には入っておらず、来訪者に届くものへの害も無いが、この落とし穴は `docs/knowledge/` に無く、「無いことを `grep` で確かめる」ほかの場面でも同じ誤りを生む。

## 第4回の指摘の閉じ方

### index.md の記録 1〜4: 閉じた

1. **108行の結び**: 「読ませる記録をコミットし、そのあと `git status --short` で作業ツリーが空なことを、`git rev-parse HEAD` で HEAD を、別々の呼び出しで確かめてから、その HEAD を依頼に写す」になり、コミット → status → rev-parse → 写す、の順で読める。(a) は109行に AP-WF09 の3度目として独立した箇条で入り、中身（依頼と Owner への報告に「別の呼び出し」と書いたこと、実際は `git status --short; git rev-parse HEAD` の1回だったこと、害が無いこと）は第4回の記録と合う。
2. **107行**: 「担当の枝の取り込みと、その前後の push で同じ形を繰り返し」になった。第2回の (b) が挙げた push の `| tail -1` を含む。
3. **104行**: 鉤括弧を外し、「第17回から確かめた形だけを入れて収まった、という趣旨を書いた」になった。8817ce95 の84行の「第17回からレビュアーが Chromium で試して確かめた形だけを入れ、収まった」の言い換えとして正しい。
4. **92行**: B-790 が足された。backlog の Queued にあることは第4回で確かめ、その後 backlog は変わっていない。

あわせて、100行の点検の記録の一覧に [-4] が足された。

### PM への指示 2・3: 閉じた

- **Owner への訂正（指示2）**: 2539（17:22:36）で「I said I checked state and HEAD with separate calls, but … as a single call. That was not true.」と正し、2611 の報告でも「誤り」として正した。index.md 109行の「Owner への報告は正した」を書いた Edit（2569、17:22:52）は 2539 のあとなので、書いた時点で真である。
- **「した」を記録に合わせる（指示3）**: この点検の依頼の「push・`git status --short`・`git rev-parse HEAD` を3つの別の呼び出しで打った」は、記録の 2590（push。`push exit=$?` で 0 を読み、`tail -2` は終了の値を取ったあと）・2596（status。出力は空）・2601（rev-parse。5c44bc10…）に合う。2606 と 2611 の Owner への報告の「push の終了の値は 0、作業ツリーは空、HEAD は 5c44bc10」も合う。2611 が並べた index.md の直し5点も、2560・2563・2566・2569 の Edit に一つずつ対応する。

## 第4回のあとの PM の振る舞い

### (a) `grep` の空の出力から「元の字が見つからない」と結論した

- 2553: PM は `git show 8817ce95:docs/cycles/cycle-318/index.md | grep -o "第17回から[^。]*。"` を打ち、出力は空だった（終了の値は見ていない）。
- 2559: 「The original text couldn't be found under that commit, so I'll drop the quote marks and paraphrase it.」と書いた。
- 実際には、8817ce95 の84行に「第17回からレビュアーが Chromium で試して確かめた形だけを入れ、収まった。」がある。第4回の記録（「index.md の記録」3）は、この字と行を引いていた。
- 空になった理由は、この作業環境が POSIX ロケール（`locale` の `LC_CTYPE="POSIX"`）で、`grep` が字をバイトで扱うことにある。`[^。]` は「。」の3バイトのどれでもないバイト、と読まれ、日本語の字の多くが「。」と同じ先頭のバイト（0xE3）を持つので、角括弧の繰り返しが最初の字で止まり、続く「。」に合わない。この点検で再現した: `echo "あいう。" | grep -o "あ[^。]*。"` は空で終了の値1、`LC_ALL=C.UTF-8` を付けると「あいう。」を返す。`git show … | sed -n 84p | grep -o "第17回から[^。]*"` は「第17回から」だけを返す。
- 害: 結論は 2559 の会話の文（Owner に見える）にだけ出て、index.md・この点検の依頼・2611 の報告には入っていない。直し方（鉤括弧を外して言い換える）は第4回が示した2つのうちの1つで、index.md の104行は正しい。2611 の「元の字で引けない鉤括弧」も、旧104行の鉤括弧の中が元の字と違った、という意味で読めば真である。
- 型: 道具の出力（空）を、それが何を意味するかを確かめずに事実（「無い」）として書いた。第4回の記録が字と行を挙げていたのに、それと食い違う結論を突き合わせずに出した。AP-WF12（文書の事実を実体で確かめない）の欄にはすでに 318 があり、型としての新しさは無い。新しいのは環境の落とし穴のほうで、`docs/knowledge/` のどこにも書かれていない（`text-measurement.md` は `awk`・`wc` の文字数だけを扱う）。レビュアーや PM が「この字はどこにも無い」を `grep` で確かめる場面は多く、角括弧に日本語を入れたときの偽の「無い」は、不在の主張（AP-WF09 の「網羅の主張」）にそのままつながる。

### (b) 確かめたもの（当たらない）

- **AP-WF29・AP-WF50**: コミット（2583）は `npx prettier --write … && git add <2つのパス> && git commit …; echo "commit exit=$?"` で、パスを限った `git add`、0 を読んでから push（2590）へ進んだ。push は出力を `tmp/cycle-318/push.log` に書き、`push exit=$?` を出して 0 を読んだ。取り込みはこの間に無い。
- **AP-WF08・file-editing.md**: PM が書いたのは index.md だけで、2560・2563・2566・2569・2580 のすべてが Edit。`npx prettier --write` は整形の道具の出力。2540 の `grep … | cut -c1-80` は行の場所を探すためで、`cut` がバイトで切って化けた出力から結論は出しておらず、2549・2551 の Read で全文を読んでから直した。
- **AP-WF04・AP-WF06・delegation.md**: この点検は、第4回の対応をコミット・push したあと（2607）に起こした。依頼の HEAD（5c44bc1063…）は 2601 の出力の写しで、いまの HEAD と origin に合う。点検の担当は記録だけを書くので、木を作らず主の木で起こしたのは正しい。
- **AP-WF24**: 2611 に、進めてよいかを問う文は無い。
- **AP-WF23**: 2614 の stop hook に対し、PM は点検の結果を待つと書いて止まった（2616）。結果が要る手順が残っているので当たらない。
- **AP-WF27**: 2539 の「reporting something I didn't do is the same failure pattern as before」と 2606 の「This time I really did run three separate calls」は記録に合う。

## workflow.md・candidates.md の全体の見直し

- 第4回のあと、workflow.md・candidates.md・backlog.md は変わっていない（`git diff 6b991527..HEAD` は index.md と review-ap-check-4.md だけ）。
- 318 を欄に持つ9項目（AP-WF04・06・09・11・12・27・29・41・50）は、補足事項の箇条（102〜109行）とすべて対応する。上の (a) は AP-WF12 で欄に 318 はすでにあるので、足すものは無い。
- 欠番・候補の番号に重なりは無い。AP-WF53・54 候補と index.md の103・105行は食い違わない。

## サイクルディレクトリの全体

- index.md は 30,751 バイトで、40,000 バイトの上限に収まる。
- 「レビュー結果」の表・キャリーオーバー・補足事項のほかの箇条は、第4回の時点から変わっておらず、食い違いは見つからなかった。
- チェックリストに印が無いのは、完了の処理の途中なので正しい。
- 100行の点検の記録の一覧は、いまは第4回までを挙げる。この記録（第5回）をコミットするときに [-5] を足す必要がある。

## PM への指示

1. builder（担当の木）に、この環境の POSIX ロケールで、日本語の字を角括弧に入れた `grep`（`[^。]` など）が黙って空を返すこと、`cut -c`・`head -c` がバイトで切ること、確かめるときは `LC_ALL=C.UTF-8` を付けるか角括弧を使わない形にすることを、`docs/knowledge/` に足させる。`text-measurement.md` に足すなら、題と冒頭の文を「C ロケールでの日本語のテキストの扱い」のように広げ、初めからそう書かれていたように読める形にする（ツギハギ禁止）。上の再現の手順を根拠として添える。レビューに通す。
2. index.md の補足事項に、(a)（`grep` の空の出力から元の字が無いと結論した。AP-WF12。index.md の記録は正しく、害は無い。落とし穴は 1 で knowledge に足した）を1行で足し、100行の一覧に [-5] を足す。
3. Owner への次の報告で、2559 の「元の字が見つからなかった」は誤りで、8817ce95 の84行にあったこと、空になったのはロケールによる `grep` の落とし穴だったことを正す。
4. 1〜3 のあと、この点検をもう一度依頼する。前回の指摘だけでなく、全体の見直しを含める。
