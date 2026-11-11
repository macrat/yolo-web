# cycle-316 完了の処理 AP の点検の重い1〜3 への対処のレビュー

レビュー日: 2026-10-02
対象: builder が [review-ap-check.md](./review-ap-check.md) の重い1〜3 を受けて作ったもの。

- 新規 `.claude/hooks/block-process-kill.sh`・`.claude/hooks/lib/shell_parse.py`・`.claude/hooks/lib/commit_files.py` と `.claude/settings.json` への登録
- `.claude/hooks/pre-commit-check.sh`（検査をコミットに入るファイルに限る）
- `.claude/skills/take-screenshot/scripts/take.ts`・`SKILL.md`
- `docs/knowledge/playwright-mcp.md`（`playwright install` の出典、「バックグラウンドのプロセスを起こして止める」）・`docs/knowledge/nextjs.md` §8・`.claude/skills/frontend-design/SKILL.md` 41 行

## 判定

**要修正**

`take.ts` は動き、プロセスのグループで起こして止める手順も実測どおりに働く。一方、2つの hook が共有するシェルの語の分け方に穴があり、(1) LLM がよく書く形（`kill "$(pgrep -f x)"`・`for p in $(pgrep x); do kill $p; done`・`if …; then pkill x; fi`）を通し、(2) 同じ穴で pre-commit の検査が前より弱まる（`if`・`{ }`・`!`・`for … do git add` を含むコミットは、何も検査せずに通る）。ポートで探して止める形（`kill $(lsof -t -i:3000)`・`fuser -k`）と `kill -9 -1` も通り、cycle-316 の事故と同じ「ほかの作業者のサーバーを止める」がそのまま起こせる。作業ツリーの根に 3.8MB の wheel が残っていて、完了の処理の `git add .` で入る。

## 確かめたこと（実測）

- hook の入力の形は既存の hook（`block-destructive-git.sh`）と同じ `{"tool_input":{"command":…}}`。builder の `cases.py`（止める28・通す26）に加え、自分で73の例を作って `.claude/hooks/block-process-kill.sh` に流した（スクラッチパッドの `rev-ap-fixes/cases.py`・`cases2.py`）。結果は下の指摘1・3・8・9。1回の判定は、`kill`・`playwright` を含む文で 35〜47ms、含まない文で約 11ms。`skills` も `kill` を含むので、スキルのパスを含むコマンドの多くが Python まで進むが、速さは作業を妨げない。
- 通すべきもの（引用符の中の `pkill`・`grep -rn pkill`・`git log --grep=killall`・コミットメッセージ・ヒアドキュメントの本文・`python3 - <<PY` の中の `os.system('pkill x')`・`kill -- -"$(cat $DIR/server.pgid)"`・`kill -KILL -- -12345`・`kill $!`・`npx playwright test`・閉じていない引用符の `echo "it's`）は、どれも通った。
- pre-commit: 一時の git リポジトリ（スクラッチパッドの `rev-ap-fixes/pc.sh`）で、整形の崩れた未追跡の `bad.md` と追跡済みの `tracked.md` を置いて 37 の形を試した。`git add .`・`-A`・`--all`・`git add bad.md; git commit`・`git commit -am`・`-a -m`・`--all`・パス指定（`tracked.md`・`-- tracked.md`・`.`・`sub/..`）・`git -c … commit`・`git -C . add . && git -C . commit`（all に戻る）・`commit-tree`・`cd sub && git add ..`・`time`・`env`・変数の前置き・`--no-verify`・ヒアドキュメントのメッセージは、どれも `bad.md` か `tracked.md` を見つけて止めた。`git add mine.md && git commit` は `mine.md` だけを見て通し、`echo "git commit" > note.txt` は none で通した。日本語と空白・`'` を含むファイル名も正しく拾った。cycle-completion の手順7（`git add .` → commit）は作業ツリーで 103 のファイルを挙げ、`commit_files.py` は約 0.16 秒で終わる。
- 止められなかった形は指摘2（`if`・`{ }`・`!`・`"$(git commit …)"`・`for … do git add`）。
- `take.ts`: スクラッチパッドを cwd にして `about:blank` を撮ると、「playwright が求める版のブラウザが無いので、入っている Chromium で撮ります: /opt/pw-browsers/chromium-1194/chrome-linux/chrome」を出して6枚を保存し、exit 0（約 5.4 秒）。`@media (prefers-color-scheme: dark){:root{color-scheme:dark}}` のページを自分のサーバーで `--dark` で撮ると `_dark` の6枚で exit 0。
- サーバーの起こし方と止め方: `setsid bash -c 'echo $$ > "$0/server.pgid"; …' "$D" &` で、`$!`（19077）と書き出した PGID（19079）は違った（knowledge の記述のとおり）。`kill -- -<PGID>` の直後はグループに2つ残り、2秒おくと0になった（`<defunct>` の記述のとおり）。`npm start` を自分のグループで起こすと、木は `npm start`（20926）→ `sh -c next start`（20937）→ `next-server (v16.3.0)`（20938）で、`kill -- -20926` のあと3秒でグループは0、`lsof -iTCP:3193 -sTCP:LISTEN` は空になった。止めたのは自分の2つのグループだけである。
- `playwright install` の決まりの出典は、PM の確認として decisions.md 124 行にある。この決まりの文はサブエージェントの環境の指示には入っておらず、わたしは原文を確かめられない。knowledge の引用（decisions.md より長い）が原文どおりであることは PM の確認に頼っている。
- `.claude/hooks/lib/__pycache__/` は hook が走るたびにできるが、`.gitignore` 58 行で除かれている。

## 指摘（重い順）

### 1（重い） hook の語の分け方が、よく書かれる形の `kill`・`pkill` を見落とす

`shell_parse.py` は shlex で語に分けるので、(a) 二重引用符の中のコマンド置換が1つの語になって中を見ない、(b) `then`・`do`・`else`・`{`・`!` などの予約語をコマンドの名前とみなし、その後ろのコマンドを見ない、(c) `for` の変数を追わない。次はどれも exit 0 で通った。

```text
kill "$(pgrep -f next)"                 # ShellCheck SC2046 が勧める、引用符で囲む形
kill -9 "$(pgrep -f next-server)"
P="$(pgrep x)"; kill $P
for p in $(pgrep -f next-server); do kill $p; done
pgrep -f next | while read p; do kill $p; done
if true; then pkill x; fi
while true; do pkill x; done
{ pkill x; }
! pkill x
P=`pgrep x`; kill $P
sudo -u root pkill x
```

`block-process-kill.sh` の頭の「コマンド置換の中は見る」は、二重引用符の中については事実と違う。直すこと: 語に分けるときに引用符の種類を保ち（一重引用符の中は見ない、二重引用符の中の `$(…)`・バッククォートは木として読む）、予約語（`if then elif else fi do done while until for in case esac { } !`）を前置きとして外し、`for v in <置換>` の `v` と、バッククォートの代入も変数の追跡に入れる。`sudo` の引数を取るオプション（`-u`・`-g`・`-C`）も外す。上の例を `cases.py` に足して、止まることを確かめる。

### 2（重い） 同じ穴で、pre-commit の検査が前より弱まる

`commit_files.py` は同じ `shell_parse` を使うので、指摘1の (a)(b) の形の中の `git add`・`git commit` を見落とす。前の hook は「git commit」の文字列があれば変わった全ファイルを見ていたが、いまは次の形で何も見ずに通る（`bad.md` は整形の崩れた未追跡のファイル）。

| コマンド                                                  | commit_files.py の出力   | hook |
| --------------------------------------------------------- | ------------------------ | ---- |
| `if true; then git add . && git commit -m x; fi`          | files（空）              | 0    |
| `{ git add .; git commit -m x; }`                         | files（空）              | 0    |
| `for f in bad.md; do git add "$f"; done; git commit -m x` | files（空）              | 0    |
| `git add . && ! git commit -m x`                          | none（AP-WF24 も見ない） | 0    |
| `git add . && echo "$(git commit -m x)"`                  | none                     | 0    |

hook の頭は「文から決められないときは全ファイルを見る」と書くが、これらは決められないと判定されず、「入るファイルは無い」か「コミットしない」と誤って決められている。直すこと: 指摘1の直しを `commit_files.py` にも効かせる。加えて、予約語・`for`・`while` の中で `git add` の引数が変数のとき（`"$f"`）は決められないとして `all` に戻す。前置きの絞り込み（`git[[:space:]].*commit`）に当たったのに、語に分けた木の中に `git commit` が見つからず、かつその語が引用符やヒアドキュメントの中だけにあると言い切れないときも `all` に戻す。上の5つを builder の `precommit-test.sh` に足す。

### 3（重い） ポートで探して止める形と `kill -1` を止めない

cycle-316 の事故の本質は「自分が起こしたと確かめていないプロセスを止める」ことで、名前で探す形と同じ害を持つ次の形が通る。

- `kill $(lsof -t -i:3000)`・`lsof -t -i:3000 | xargs kill`・`fuser -k 3000/tcp`: 「ポートを空ける」ときに LLM がもっともよく書く形で、そのポートで待ち受けているほかの作業者のサーバーを止める。
- `kill -9 -1`（`kill -- -1`）: コンテナの中はどの作業者も root なので、すべての作業者のプロセスと自分のシェルを止める。
- `ps -C next-server -o pid= | xargs kill`・`kill $(ps -C node -o pid=)`: `ps -C` はコマンドの名前で選ぶが、grep を通さないので「名前で探す」に数えられていない。
- `killall5`

直すこと: `lsof`（`-t` か `-i` を持つもの）と `fuser` を探す側（`is_lookup`）に入れ、`fuser -k` そのものを止める。`kill` の引数に `-1` のグループ（`-1`・`-- -1`・`-9 -1`）があれば止める。`ps` の `-C`・`--command` を探す側に入れる。`killall5` を止める。止めたときの案内（ERRMSG）と knowledge の「使わない」の文に、ポートで探す形を足す。

### 4（重い） 作業ツリーの根に 3.8MB の wheel が残り、完了の処理の `git add .` で入る

`shellcheck_py-0.11.0.1-py2.py3-none-manylinux1_x86_64.manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_5_x86_64.whl`（3,800,600 バイト、03:05、builder の作業の時間）がリポジトリの根にあり、`.gitignore` に当たらない。cycle-completion の手順7の `git add .` でコミットに入る（`commit_files.py` も挙げた）。一時のファイルは `./tmp/` かスクラッチパッドに置く規則（CLAUDE.md「Use ./tmp/ directory」）にも反する。消して、ほかに作業の残りが根や `docs/` に無いかを `git status --porcelain` で確かめる。

### 5（中） `next start` が `next-server` の子を作る、は事実と違う

playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」3 は「`npm start` は `next start` を起こし、`next start` は `next-server` の子を作る」、nextjs.md §8 は「`next start` は `next-server` の子を作るので、親の PID だけを止めると `next-server` が残る」と書く。Next 16.3.0 の `next start` は子を作らず、自分のプロセスの名前を `next-server (v16.3.0)` に替える（`node_modules/next/dist/server/lib/start-server.js` 180 行 `process.title = …`）。実測の木も `npm start` → `sh -c next start` → `next-server (v16.3.0)` で、`next-server` は `next start` のプロセスそのものである。残るのは、`npm`（または `sh`）を止めてもその子の `next start`（＝`next-server`）が止まらないからである。グループごと止める結論は変わらないが、仕組みの文を「`npm start` は `sh` を通して `next start` を起こし、`next start` は自分の名前を `next-server` に替える。`npm` の PID を止めても子の `next-server` は止まらない」の形に直す。`next dev` については take-screenshot の SKILL.md の「`npm run dev` の PID を止めても `next-server` の子が残る」があるので、`next dev` が子を作るかも実測してから書く。

### 6（中） take-screenshot の SKILL.md の dev サーバーの起こし方に、ポートと止まったことの確かめが足りない

- `npm run dev` をポートを決めずに起こすので、ほかの作業者の dev サーバーが 3000 にいると、撮る URL を誤ってほかの作業者（別の作業ツリーや別の変更）のサーバーに当てうる。knowledge の手順と同じく `PORT=<自分で選んだ番号>` を付け、撮る URL はそのポート（またはログの `Local:` の行）にすると書く。
- 止めたあとの確かめが `wc -l` だけで、knowledge の「直後は `<defunct>` が数に入るので少しおいて数え直す」「ポートが空いたことも確かめる」が無い。実測でも直後は2で、2秒後に0だった。直後に2を見た作業者が、同じ hook に止められない別の形で止めにかかる恐れがある。hook の案内（ERRMSG）も同じく `<defunct>` の注意が無い。3か所（SKILL.md・ERRMSG・nextjs.md §8）の手順は knowledge の節と食い違わないようにそろえるか、要点だけを書いて knowledge の節を指す。
- Bash ツールはコマンドごとにシェルの変数を引き継がないので、起こすコマンドと止めるコマンドを別に打つと `$DIR` が空になり、`cat "/dev.pgid"` で止め損ねる。`DIR` は止めるコマンドの中でも書き直す（または値をそのまま書く）と添える。

### 7（中） `take.ts` の書き出しの場所が、knowledge の「書き出しはすべて専用のディレクトリに」と食い違う

playwright-mcp.md の新しい節の 1 は「PGID・ログ・スクリーンショットなどの書き出し…をすべてその下に置く」と書くが、`take.ts` は cwd の `tmp/screenshots/` に固定で書き、SKILL.md も「プロジェクトルートの `tmp/screenshots/` に保存」と書く。並行するレビュアーの画像が同じ場所に混ざる（名前は秒までの時刻と URL なので、同じ URL を同じ秒に撮ると上書きされる）。`take.ts` に書き出し先の指定（例 `--out <dir>`）を足して SKILL.md に書くか、knowledge の文を「`take.ts` の画像は `tmp/screenshots/` に入る」と事実に合わせるか、どちらかにする。

### 8（中） 「起こし方によらず `playwright install` を止める」は言い過ぎ

playwright-mcp.md 35 行と hook の頭の文が言うのに対し、次は通った。

```text
npx -p playwright playwright install webkit
node node_modules/playwright/cli.js install webkit
node node_modules/.bin/playwright install
```

`playwright_install` に、`npx -p <pkg> <bin>` の形と、`node` に渡した最初の引数が `playwright` のパッケージの `cli.js`・`.bin/playwright` である形を足すか、knowledge の文を「よく使う起こし方の `playwright install` を止める」に弱める。

### 9（軽） 誤検知と取りこぼしの小さなもの

- 自分の子やグループを探して止める `kill $(pgrep -P $$)`・`kill -- -$(pgrep -g 1234 | head -1)` も止める。knowledge の「自分のグループを読むだけの `ps`・`pgrep` は止めない」と並べると、`ps -p`・`-g` は除くのに `pgrep -P`・`-g` は除かない扱いの差が読み手にわからない。`pgrep` の `-P`・`-g`・`-s` を探す側から外すか、knowledge に「`pgrep` の結果は、自分の子やグループでも `kill` に渡さない」と書く。
- コメントの中の `;` で区切った語を止める（`ls; # done; pkill later` が exit 2）。`commenters = ""` で `#` を語として残しているためで、語の頭の `#` から行末までを捨てればよい。
- `pgrep x > p.txt; kill $(cat p.txt)`・`readarray -t P < <(pgrep x); kill ${P[@]}` は通る。ファイルを通す形まで追う必要は無いが、テストの例に「通ると知っている形」として残しておくと、後で直す人が範囲を誤らない。

### 10（軽） 文の細かな誤り

- `commit_files.py` の頭の「`git commit-tree` は、ステージしたものから作った木をコミットにする」は誤り。`commit-tree` は引数に渡した木のオブジェクトをコミットにし、索引を読まない（ふつうは `git write-tree` の結果を渡す）。検査の扱い（ステージしたものと add したものを見る）は保守的でよいので、文を「`git commit-tree` に渡す木はふつう `git write-tree` で索引から作るので、ステージしたものを見る」の形に直す。
- hook の名前 `block-process-kill.sh` が `playwright install` も止める。knowledge と frontend-design のスキルが場所を指しているので迷いはしないが、名前から中身が読めない。名前を広げる（例 `block-shared-env-hazards.sh`）か、2つの hook に分ける。
- nextjs.md §8 の手順は `$DIR` を定めずに使い、「古い `next-server` がポートにいる」原因が自分のグループでないとき（ほかの作業者のサーバー）にどうするか（別のポートで起こす）を書いていない。冒頭に `DIR=…` の行と、自分のものでなければ止めずにポートを替える1文を足す。

### 11（軽・前からの限界） ステージしたものと作業ツリーが違うファイルは、作業ツリーの中身を検査する

builder の `precommit-test.sh` の最後の例（ステージした中身は崩れ、作業ツリーは整っている）は通る。前の hook も同じで、この直しで弱まったものではない。コミットに入るのはステージした中身なので、`git show :<path>` を一時のファイルに書いて検査するのが正しい。今回の範囲で直さないなら backlog に起票する。

## 来訪者への効き方

hook は来訪者に直接は見えないが、止め損ねた `pkill`・`kill $(lsof …)` がほかの担当の確かめ（撮影・試験）を途中で壊すと、確かめの抜けた変更が出荷に近づく。pre-commit の弱まりは、整形や残骸のタグの崩れたファイルがコミットに入る道を前より広げる。`take.ts` が動くようになったことは、UI の変更ごとの4枚の撮影（AP-WF05）を確実にし、後続のおよそ20のサイクルの確かめの質を上げる。ここは目的を果たしている。

## アンチパターンの当てはめ

- implementation.md AP-I02（個別ケースのハードコード）: 指摘1〜3 の穴は、shlex の上に前置きと形を1つずつ足していく作りから来ている。例を足すたびに別の形が漏れるので、引用符の種類と予約語を扱える分け方に直すのが根本の直しである（指摘1）。
- workflow.md AP-WF09（網羅の主張）: 「起こし方によらず」（指摘8）と、hook の頭の「コマンド置換の中は見る」（指摘1）は、試した例の範囲を超えた主張である。
- workflow.md AP-WF12（事実の実体確認）: 指摘5（`next start` の子）。
- CLAUDE.md の一時のファイルの規則: 指摘4。
- ツギハギ: 書き換えた knowledge・スキル・hook に、経緯や注記の継ぎ足しは見当たらない。frontend-design の 41 行の括弧書きは、決まりの出典を指す説明として本文に溶けている。

## PM への依頼

指摘があるので、次のとおり進めてください。

1. builder に指摘1〜11 を直させてください（hook・`commit_files.py`・`shell_parse.py`・`take.ts`・SKILL.md・knowledge。wheel の削除を含む）。直すときは、この文書の例をすべて builder の試験のスクリプトに足し、止めるべきものが止まり、通すべきもの（このレビューの「確かめたこと」の2つめの項目）が通ることを示させてください。
2. 直したあと、もう一度レビューを依頼してください。そのときは、前回の指摘だけでなく、hook・スキル・knowledge の全体を見直す範囲にしてください。
