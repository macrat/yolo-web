# B-784 の設計: サイクルの文書の大きさをコミットの前に検査する

## 1. 実測（2026-10-04）

### 1-1. 文書の大きさ（`wc -c`・`wc -l`）

- ディレクトリ形式の index.md（32本）: 中央値 22,790 バイト、最大 103,081 バイト（cycle-313）。上位10%（大きい順に4本）は 92KB 以上で、cycle-313 103KB・315 95KB・312 94KB・302 92KB。ほかに 50KB を超えるのは cycle-301 66KB・311 51KB。cycle-316 の index.md はいま 44,304 バイトで、履歴では約 200KB まで大きくなった。
- decisions.md: cycle-316 の1本だけで、210,350 バイト・299 行（1行あたり約 700 バイト、最長 5,069 バイト）。後続のサイクルが毎回読む。
- carryover.md: cycle-302 113,496 バイト・651 行、cycle-316 48,948 バイト・50 行。
- そのほか: cycle-316 の t5-design.md 696KB・t4-design.md 528KB・t6-design.md 241KB、cycle-301 の review-log.md 198KB。担当のタスクのときだけ、節を選んで読まれる。
- 旧形式の単一ファイル（cycle-170 697KB・cycle-215 583KB）は参照のみで新しく作らない。

肥大は index.md だけでなく、後続が毎回読む decisions.md と carryover.md にも出ている。行の長さが10倍以上違うので、行数は大きさの目安にならない。

### 1-2. Read が一度に返す量

offset と limit を付けずに Read で読み、返った行までのバイト数を `head -<返った最後の行> <ファイル> | wc -c` で測った結果:

| ファイル                     | 大きさ    | 中身                         | 結果                                                                                                                                                                                        |
| ---------------------------- | --------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cycle-316/decisions.md       | 210,350 B | 長い1行の文の箇条書き        | エラーにならず、1〜82 行（51,621 B）だけを返した。末尾に「PARTIAL view … 77484 tokens, cap 25000」と、次に読む offset・limit の案内が付く。行の途中では切らず、上限に入る最後の行までを返す |
| cycle-316/split-plan.md      | 56,796 B  | 文とコードの段落、表は少ない | 全 203 行を返した                                                                                                                                                                           |
| cycle-316/t3-completion.md   | 80,342 B  | 表が中心                     | 全 286 行を返した                                                                                                                                                                           |
| cycle-316/review-response.md | 72,222 B  | 表が中心                     | 全 192 行を返した                                                                                                                                                                           |

- 上限はバイトでも行でもなく 25,000 トークンである。バイトあたりのトークンは中身で違い、decisions.md は約 2.7 バイトで1トークン（210,350 B が 77,484 トークン）で、51,621 B で切れた。文の多い split-plan.md は 56,796 B で切れず、表の列を揃える空白の多い文書は 80KB でも切れない。
- 測った中で最も早く切れたのは decisions.md の 51,621 B である。記号や英数字がもっと多い文書は、これより少ないバイトで切れうる。
- 切れても失敗にならず、返った部分だけを読んで先へ進めてしまえる。全体のトークン数は末尾の1行にしか出ない。

## 2. 対象と線

| 案  | 対象                                 | 判断                                                           |
| --- | ------------------------------------ | -------------------------------------------------------------- |
| A   | index.md だけ                        | いちばん大きい decisions.md が漏れる                           |
| B   | index.md・decisions.md・carryover.md | 採る。後続のサイクルとレビュアーが毎回全文を読むのはこの3本    |
| C   | cycle のディレクトリの .md すべて    | 設計書や棚卸しは節を選んで読むもので、誤って止めることが増える |

線の意味は「Read 1回で全文が返る」とする。毎回読む文書が切れると、読み手は切れたことに気づかずに返った部分だけで判断しうる（1-2）。

- 上限 50,000 バイト: 測った中で最も早く切れた 51,621 B（decisions.md）を下回る量。超えたらコミットを止める。切れ目との差は 3% ほどで、記号や英数字の多い文書では上限の手前で切れうるので、上限は「これを超えたら確実に切れる」線として置く。
- 注意 40,000 バイト: 切れ目から 2 割下の、どの中身でも Read 1回に収まると見込む線。毎回読む文書はこの下に保つ。超えたら注意を出してコミットは止めず、分ける作業をそのサイクルの中で行う。

2つの線はスクリプトの変数1か所に置く。

いまのファイルへの影響: 閉じたサイクルの index.md（cycle-301・302・311・312・313・315）と cycle-302 の carryover.md は変更されないので止まらない。cycle-316 の index.md（44KB）と carryover.md（49KB）は注意だけが出る。cycle-316 の decisions.md（210KB）は上限の4倍あり、このサイクルで分ける（4節）。

## 3. 検査の場所と案内

新しい hook `.claude/hooks/cycle-doc-size-check.sh` を `.claude/settings.json` の PreToolUse（matcher Bash）に backlog-line-length-check.sh と並べて置く。pre-commit-check.sh に入れないのは、prettier・eslint の失敗のあとに来て隠れるためと、backlog の行の長さと同じ「文書の形の検査」として独立させるためである。

- `git commit` を含むコマンドだけを見る。
- `git status --porcelain -uall` で変更があり（削除を除く）、`docs/cycles/cycle-[0-9]*/(index|decisions|carryover).md` に当たるファイルを `wc -c` で測る。`-uall` は、新しいサイクルのディレクトリを中のファイルごとに出させるためである（既定ではディレクトリ1行になり、最初のコミットの index.md が漏れる）。pre-commit-check.sh と同じく未ステージの変更も含む。
- 上限を超えたら exit 2 で止め、注意の線を超えただけなら stderr に注意を出して exit 0。

止めたときの案内:

```
サイクル文書が上限 50000 バイトを超えています（コミット中止）。
  docs/cycles/cycle-XXX/decisions.md: 210350 バイト
index.md・decisions.md・carryover.md は後続のサイクルとレビュアーが毎回全文を読む文書です。
上限は Read 1回で全文が返る量です。超えると Read は途中で切れ、残りを読まずに判断されます。
直し方: 長い中身を同じディレクトリの別ファイルに移し、元のファイルには1行の要約とリンクだけを残してください。
  例) 決定の経緯・レビューの経過 → review-log.md や decisions-t4.md などのタスク別のファイル
      元の行: 「- T4 の決定: <一言の要約>。詳細 [decisions-t4.md](./decisions-t4.md)」
index.md には計画・チェックリスト・完了サマリだけを書きます（.claude/rules/doc-directory.md）。
文を削って字数を詰めること、ほかのサイクルのファイルに移すことはしないでください。
```

注意の文は「サイクル文書が 40000 バイトを超えました（上限 50000）。このサイクルの中で別ファイルへ分けてください。」とファイルと大きさの行。

## 4. 変えるもの

### 4-1. 検査

- `.claude/hooks/cycle-doc-size-check.sh`（新規）: backlog-line-length-check.sh と同じ形（jq で command と cwd を取り、`git commit` だけを見る）。`LIMIT=50000`・`WARN=40000`。冒頭のコメントに線の意味（Read 1回で全文が返る量）と根拠（1-2 の実測）。実行権を付ける。
- `.claude/settings.json`: PreToolUse の Bash の hooks に1項目。
- `.claude/hooks/pre-commit-check.sh` 41 行: `git status --porcelain` を `git status --porcelain -uall` にする。同じ漏れで、新しいディレクトリの中のファイルが整形・lint・残骸の検査を通らずにコミットされる。直しは同じ1語で、この設計の確かめ方でまとめて確かめられるので、別に積まずにここで直す。この直しと新しい hook は、B-786 が `.gitignore` に `.claude/worktrees/` を足すコミットと同じコミットか、その後に入れる。先に入れると、主の木の `git status --porcelain -uall` に担当の木のファイルがすべて出て、検査の対象に入る。
- hook と settings.json の編集が権限の判定に拒まれたときは、ほかの道具や builder で同じ結果を追わず、作業を止めて PM に返す（AP-WF24）。

### 4-2. 規則と案内

- `.claude/rules/doc-directory.md`: cycles の説明を、index.md・decisions.md・carryover.md は後続が毎回全文を読む文書で、40,000 バイト以下に保ち（Read 1回で全文が返る量）、50,000 バイトを超えるとコミットの前の検査で止まること、長くなる中身は同じディレクトリの別ファイルに分けて1行の要約とリンクを残すこと、を含む形に書き直す。
- `docs/cycles/TEMPLATE.md`: 冒頭のコメントに、決定や申し送りが長くなったら別ファイルに分けてリンクする、を1行。
- `docs/knowledge/ai-agent-communication.md`: 節「Claude Code の Read が一度に返す量」を足す。上限は 25,000 トークンで、返るバイト数は中身で違うこと（長い1行の文の箇条書きの decisions.md は 51,621 B で切れ、文とコードの split-plan.md は 56,796 B、表の多い文書は 80KB でも全文が返った）。記号や英数字の多い文書はもっと少ないバイトで切れうるので、一度で通読させたい文書は 40,000 バイトを安全な線とすること。超えるとエラーでなく、上限に入る最後の行までを返し、末尾の1行に全体のトークン数と次の offset・limit の案内が付くこと。大きい文書は offset・limit か Grep で読み、末尾の PARTIAL の行を見落とさないこと。1-2 の測り方（ファイルと大きさと返った行）を添える。
- `docs/anti-patterns/candidates.md`: AP-WF17 候補の節を消す。
- `docs/anti-patterns/workflow.md`: 機械の検査があるので本体に置かない項目の並び（AP-WF16・AP-WF22 の行）に、81・82 行と同じ形で「AP-WF17（毎回読むサイクル文書の肥大）: `.claude/hooks/cycle-doc-size-check.sh` が index.md・decisions.md・carryover.md の 50,000 バイト超えのコミットを機械検出するため、本体に置かなかった。（cycle-214, 215, 316で実際に発生していた）」を足す。文書の大きさは数えれば分かり、チェックリストで人が点検するより検査が確かなので、本採用しない。
- `docs/backlog.md`: B-784 を Done にする。

### 4-3. cycle-316 の decisions.md を分ける

decisions.md の行は記録した順に並び、行の書き出しが受け持ちのタスク（「T5-3b の PM の決定」など）を言う。行を書き出しのタスクで次のファイルに移す。中の並びは記録した順のまま、文は変えない。

| ファイル             | 移す行                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| decisions-t1-t3.md   | T1・T2・T3 と、それより前の全体の決定（テーマの切替・410・上端のナビ・`DESIGN.md` の規則）                          |
| decisions-t4.md      | T4                                                                                                                  |
| decisions-t5-*.md    | T5 と T5a。T5 の行だけで 51,492 B あるので、番号の範囲で decisions-t5-1.md・decisions-t5-2.md… に分ける             |
| decisions-t6-t12.md  | T6〜T12 への申し送り                                                                                                |
| decisions-process.md | 作業の進め方の決定（並行の作業ツリー・hook の取り消し・Backlog の更新・ADR・AP の点検の各巡目・完了の処理での判断） |

- どのファイルも注意の線の 40,000 バイト以下にする。超えるものはさらに範囲で分ける。
- decisions.md は索引にする。冒頭の説明のあと、ファイルごとに「- T4 の決定と申し送り（T4-1〜T4-19）: <一言の要約>。[decisions-t4.md](./decisions-t4.md)」の1行を並べる。
- 書き出しの語で行を探す使い方は変わらない（`grep -rn "<書き出し>" docs/cycles/cycle-316/decisions*.md`）。

指す側の付け替え:

- `cycle-316/carryover.md`:
  - 「タスクから decisions.md の申し送りへの索引」を「タスクから決定と申し送りへの索引」にし、冒頭の説明を、挙げた書き出しのあとにその行のあるファイルを括弧で添える形に書き直す。各タスクの行の書き出しごとに、移した先のファイル名を添える（例「T5-3b の PM の決定」（decisions-t5-1.md））。
  - 36・37 行の「decisions.md の完了の処理の3巡目の行」「decisions.md の「hook の取り消し」の行」を decisions-process.md に、40 行の [decisions.md](./decisions.md) を索引としての decisions.md のまま残す。
  - 47 行（T9）の grep のコマンドの `docs/cycles/cycle-316/decisions.md` を `docs/cycles/cycle-316/decisions*.md` にし、「[decisions.md](./decisions.md) の「WebKit の確かめ方」」を移した先のファイルにする。
- `cycle-316/index.md` 169・177・181・182 行: 決定と申し送りの入口としての decisions.md（索引）は残し、特定の行を指す所（「hook の取り消し」の行・「完了の処理での判断」の行）は decisions-process.md にする。
- ほかの指す側は列挙せず、`grep -rln "decisions" docs .claude` で拾ったもののうち、閉じた記録（`review-*.md`・`incident-*.md`）と旧形式の単一ファイル以外のすべてで、decisions.md の特定の行を指す所を移した先のファイルにする。いま当たるのは、cycle-316 の `split-plan.md`・`t5-design.md`・`t5a-design.md`・`t5-20f-design.md`・`t5-8b-design.md`・`t5-inventory.md`・`t6-design.md`、`docs/backlog.md`（B-597 → decisions-t1-t3.md）、`docs/anti-patterns/workflow.md`（AP-WF52 → decisions-process.md）、`docs/anti-patterns/candidates.md` 55 行（AP-WF08 の候補が指す点検の15巡目の行 → decisions-process.md）である。grep に当たる `docs/research/` のファイルは URL の中の語で decisions.md を指しておらず、cycle-317 の文書もこの設計の記録なので、どちらも対象にしない。
- 閉じた記録（`review-*.md`・`incident-*.md`）は書き換えない。そこからのリンクは索引の decisions.md に着き、そこから移した先へ進める。

### 4-4. 確かめ方

- 50,000 バイトを超える index.md を既存のサイクルのディレクトリに置いて `git commit` が止まり、案内が出ること。
- 追跡されていない新しいディレクトリ（`docs/cycles/cycle-999/`）の index.md が上限を超えると止まること。同じディレクトリの整形の崩れた .md で pre-commit-check.sh が止まること。
- 40,000〜50,000 バイトの carryover.md では注意だけが出てコミットが通ること。変更していない cycle-313 の index.md では何も出ないこと。
- 主の木の `git status --porcelain -uall` に `.claude/worktrees/` が出ないこと。
- 分けたあと、cycle-316 の decisions*.md がどれも 40,000 バイト以下で、元の 299 行がどれか1つのファイルにちょうど1回ずつあること（行を並べ替えて元と突き合わせる）。carryover.md の索引の書き出しが、添えたファイルの中で1件ずつ見つかること。
- 試しに置いたファイルは消し、コミットに残さない。

## 5. 残る危険

1. Bash の外（人が直接打つコミットなど）からのコミットはこの hook を通らない。
2. 一部だけをステージしたとき、作業ツリーの大きさで判定する。
3. hook はコマンドの `.cwd` の木で `git status` を取る。`git -C <木> commit` や `cd <木> && git commit` では `.cwd` とコミットする木がずれ、別の木を測る。担当ごとの木で、その木を cwd にしてコミットする B-786 の方針（b786-design.md）が前提である。
4. 上限の直下で、別ファイルへ移さずに文を詰めてすり抜けうる。案内で禁じるが、機械では見分けられない。
5. 名前の違う「毎回読む文書」（split-plan.md など）は漏れる。対象は正規表現に足せる形にする。
6. 上限 50,000 バイトは測った切れ目（51,621 B）と 3% しか離れておらず、記号や英数字の多い文書は上限の手前で切れうる。一度で通読できることを守るのは注意の 40,000 バイトで、注意が出たらそのサイクルの中で分ける運用に頼る。
7. Read の上限（25,000 トークン）が変わると線の意味がずれる。線は変数1か所なので、knowledge の測り方で測り直して合わせる。
