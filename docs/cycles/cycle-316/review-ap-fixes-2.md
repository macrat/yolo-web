# cycle-316 完了の処理 AP の点検の重い1〜3 への対処のレビュー（2回目）

レビュー日: 2026-10-02
対象: builder が [review-ap-fixes.md](./review-ap-fixes.md) の指摘1〜11 を受けて作り直したもの（`git diff` と未追跡のファイル）。

- `.claude/hooks/block-process-kill-and-browser-install.sh`（新規。旧 `block-process-kill.sh` は消した）・`.claude/hooks/lib/shell_scan.py`・`.claude/hooks/lib/commit_files.py`・`.claude/hooks/pre-commit-check.sh`・`.claude/settings.json`
- `.claude/hooks/stop-cycle-guard.sh`（差し戻しの文）
- `.claude/skills/take-screenshot/SKILL.md`・`scripts/take.ts`
- `.claude/skills/frontend-design/SKILL.md`（実機の項目の書き方）
- `docs/knowledge/playwright-mcp.md`・`nextjs.md`（§8 と、同じ差分にある §11）・`ai-agent-communication.md`

## 判定

**要修正**

前回の指摘1〜11 は、すべて直っている。kill の hook はシェルの文を引用符・置換・ヒアドキュメントで分けて読むようになり、前回の 73 の例と builder の例（止める 97・通す 56）はすべて期待どおりに分かれ、文書に書いた起こし方・止め方・完了の処理のコマンドはどれも通る。一方、新しく試した例で、(1) pre-commit が `git commit … 2>&1 | tail` とヒアドキュメントでメッセージを渡す `git commit -F -` で、ステージしたファイルを何も見ずに通す（前の hook より弱い）、(2) kill の hook が「ポートを空ける」ときに LLM がもっともよく書く `npx kill-port 3000` を通す、の2つが重い。ほかに、どちらの hook も約 128KB を超える文で何も見ずに通ること、nextjs.md §11 の「ppid が 1 の `next dev` を止める」が、新しい起こし方で起こしたほかの作業者のサーバーをそのまま指すこと、Next.js 16.3 の `next dev` が同じディレクトリで2つ目を起こさせず `kill <PID>` を勧めることが、文書に無いことを見つけた。

## 確かめたこと（実測）

試験はスクラッチパッドの `rev-ap-fixes-2/` に置いた（`k.py`・`k2.py`〜`k4.py`・`docs.py`・`big*.py`・`pt.sh`）。

- **前回の試験と builder の試験**: builder の `builder-killhook/cases.py`（前回のわたしの `cases.py`・`cases2.py` の例をすべて含む）は止める 97・通す 56 で食い違い 0、1回の判定は最大 63ms。builder の `precommit-test.sh` を自分のディレクトリに写して走らせ、48 の例で食い違い 0（約 27 秒）。前回の指摘2 の5つの形（`if`・`{ }`・`!`・`"$(git commit …)"`・`for … do git add "$f"`）は、どれも `all` に戻って止まった。
- **新しい抜け道（kill の hook）**: 65 の例を作って流した（`k.py`）。止まったのは、`kill -9 $(lsof -ti tcp:3000)`・`lsof -ti :3000 | xargs -r kill -9`・`kill -n 9 -1`・`kill -s KILL -1`・`kill -HUP -1`・`pids=$(lsof -t -i :3000)` の次の行の `kill $pids`・`for p in $PIDS`・`command kill`・`builtin kill`・`/bin/kill`・`env kill`・`sudo kill`・`xargs -a <(pgrep x) kill`・`pgrep x | xargs -I % kill %`・`exec pkill`・`nohup pkill … &`・`( pkill x )`・`$(pkill x)`・`if pgrep …; then pkill …; fi`・`ls | xargs -I{} sh -c 'pkill {}'`・`find /proc … -exec kill {} \;`・`pidof node | xargs kill`・`kill -TERM -- -$(pgrep -o -f 'next start')`、`playwright install` の `npx --package=playwright`・`npx @playwright/test install`・`node ./node_modules/playwright-core/cli.js install`・`npx playwright-core install`・`timeout 600 npx playwright install`・改行の後の `npx playwright install` など。通ったものは指摘2・9。
- **ふだんの作業を止めないか**: take-screenshot の SKILL.md の起こし方と止め方の2つのブロック、playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」の 3〜5 のブロックと `kill -KILL -- -"$(cat …)"`、nextjs.md §8 の6行のブロック、hook の案内（ERRMSG）の3つのコマンド、split-plan.md 6 の 1・3・5 のブロックと `git branch -d`・`df -h /`、`take.ts --out … --dark` を、プレースホルダを値に替えて kill の hook に流し、すべて exit 0 だった（`docs.py`）。ほかに、`git commit -m "fix: pkill を止める"`・`gh pr create --body 'pkill …'`・`npm run lint && … && npm run build`・`npx playwright test`・`npx playwright codegen`・`kill 12345`・`kill -0 "$(cat "$DIR/server.pgid")"`・`ps -o … -p 12345`・`lsof -nP -iTCP:3127 -sTCP:LISTEN` など 31 の作業のコマンドも通った。止めたのは、`kill` の後ろのリダイレクト（指摘6）と、`npx prettier --check "docs/pkill.md"` のように語そのものを含む引数（方針どおり）である。
- **速さ**: kill の hook は、`kill`・`fuser`・`playwright` を含む文で 28〜68ms（`skills` も `kill` を含むので、スキルのパスを含む文はここに入る）、含まない文で 10〜17ms。約 200KB のヒアドキュメントでも 28〜41ms（ただし指摘3）。`commit_files.py` は作業ツリーで `git add . && git commit` に 0.16 秒（109 行）、`git add <1ファイル> && git commit` の pre-commit の全体は 0.84 秒。作業を妨げる遅さは無い。
- **take.ts**: `about:blank` を `--out <スクラッチパッドの下>` で撮ると、入っている Chromium（`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`）で起動したことを表示し、6枚をその場所に保存して約 5.5 秒で終わった。既定の `tmp/screenshots/` には書かなかった。
- **プロセスのグループ**: `setsid bash -c 'echo $$ > "$0/s.pgid"; exec sleep 30' "$D" &` で起こしたプロセスは、起こした直後から ppid が 1 だった（指摘4 の根拠）。`kill -- -<PGID>` の1秒後はグループに1つ残り、さらに2秒おくと0になった（knowledge の `<defunct>` の記述のとおり）。止めたのは自分のグループだけである。
- **Next.js のソース（確認）**: `next start` が名前を `next-server (v16.3.0)` に替えるのは `node_modules/next/dist/server/lib/start-server.js` 180 行、`next dev` が子を起こすのは `cli/next-dev.js` 303 行の `fork` で、knowledge の記述と合う。`next dev` は `server/lib/router-utils/setup-dev-bundler.js` 162 行で `.next/dev/lock` を取り（`experimental.lockDistDir` は既定で true、`server/config-shared.js` 278 行）、取れなければ `build/lockfile.js` 181〜194 行で「Another next dev server is already running.」と、先にいるサーバーの PID と URL、`kill <PID>` を勧める文を出して終わる（指摘5）。
- **作業の残り**: 前回の wheel は消えていた。`git status --porcelain` の未追跡は `docs/cycles/cycle-316/` の文書・`src/` のファイル・新しい hook と `lib/` だけで、`lib/__pycache__/` と `.claude/.model-edited` は `.gitignore` で除かれている。旧 `block-process-kill.sh`・`shell_parse` を指す文は、サイクルの文書と `.model-edited` の外には無い。
- `playwright install` の決まりの文は、わたしの環境の指示には無く、原文は確かめられない。knowledge の引用が原文どおりであることは、PM の確認に頼っている。
- **hook に止められたこと（2回）**: (1) 試験の文（`cd $R; git reset -q; …; python3 - <<'PY'` の本文に `git add . && git commit` の文字を含むもの）を打ったところ、pre-commit が `all` と判定し、作業ツリーの `docs/cycles/cycle-316/split-plan.md`（ほかの担当が書いている途中のファイル）の整形の崩れで止めた。回り道はせず、その試験はコードを読んで確かめた（指摘1 と 3）。(2) この文書を Bash のヒアドキュメント（`cat > … <<'…'`）で書こうとしたところ、本文の「git commit」の文字に `backlog-line-length-check.sh`（範囲の外の既存の hook。文字の一致だけで起動する）が当たり、`docs/backlog.md` の 200 字を超える3行（L86 B-784・L101 B-623・L105 B-620。ほかの担当が書き換えている途中）で止めた。コミットではないので、ファイルを書く道具（Edit）で書いた。backlog の3行は、完了の処理のコミットの前に直す必要がある。

## 前回の指摘の解消

| 指摘                        | 結果                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 語の分け方                | 解消。`shell_scan.py` が二重引用符の中の `$(…)`・バッククォートを読み、予約語を外し、`for`・`while`・`read` と変数を追う。前回の例はすべて止まる |
| 2 pre-commit が弱まる       | 前回の5つの形は解消（`all` に戻る）。ただし新しい穴がある（指摘1）                                                                               |
| 3 ポートで探す形・`kill -1` | `lsof`・`fuser -k`・`ps -C`・`killall5`・`-1` の的は解消。`npx kill-port`・`fuser --kill`・`ss`・`netstat` は通る（指摘2）                       |
| 4 wheel                     | 解消                                                                                                                                             |
| 5 `next start` の子         | 解消。ソースと合う                                                                                                                               |
| 6 SKILL.md のポートと確かめ | 解消。ただし `next dev` の lock が抜けている（指摘5）                                                                                            |
| 7 書き出しの場所            | 解消（`--out`）                                                                                                                                  |
| 8 起こし方によらず          | 解消。`npm init playwright@latest` は通る（指摘9）                                                                                               |
| 9 小さな誤検知と取りこぼし  | 解消。`pgrep -P`・`-g` は止める側にそろえ、knowledge と ERRMSG に書いた                                                                          |
| 10 文の誤り                 | 解消（`commit-tree` の文・hook の名前・nextjs.md §8 の `DIR` と他人のサーバーの扱い）                                                            |
| 11 ステージした中身         | 解消（`I` の行で `git show :<path>` を検査）。frontmatter の新旧の判定が効かない残りは B-785 に起票済み                                          |

## 指摘（重い順）

### 1（重い） pre-commit が、リダイレクトとヒアドキュメントを付けた `git commit` でステージしたファイルを見ない

`commit_files.py` の `simple_commands` は、shlex で `<`・`>` を区切りの字にしたうえで、リダイレクトの演算子と行き先を、ほかの語と同じにコマンドの引数に入れている（86〜89 行は、両方の枝が同じ `current.append(tok)` で、効いていない）。そのため `git commit` の後ろのリダイレクトがパスとして読まれ、`parse_commit` が「パスを指定したコミット」と判定して、ステージしたものを外す。整形の崩れた `bad.md` をステージした一時のリポジトリで、次はどれも files（空）・exit 0 で通った。

| コマンド                               | 判定                |
| -------------------------------------- | ------------------- |
| `git commit -m x 2>&1 \| tail -3`      | files（空）・exit 0 |
| `git commit -m x 2>&1`                 | files（空）・exit 0 |
| `git commit -F - <<'EOF'`（本文）`EOF` | files（空）・exit 0 |
| `git commit -F- <<EOF`（本文）`EOF`    | files（空）・exit 0 |

`2>&1 | tail` は LLM が出力を短くするためによく付け、`-F -` とヒアドキュメントは複数行のメッセージの書き方として一般的である。前の hook は「git commit」の文字があれば変わった全ファイルを見ていたので、ここは前より弱い。`git add` の側も `git add mine.md 2>/dev/null` は `all` に倒れるだけで、たまたま安全な側にいる。

直すこと: 語に分けるときに、リダイレクトの演算子（`>`・`>>`・`<`・`<<`・`<<-`・`<<<`・`>&`・`&>`、前に付く fd の数字を含む）とその行き先を引数から外す。あるいは `git add`・`git commit` の引数にリダイレクトが残ったら決められないとして `all` にする。上の4つと、`git add . && git commit -m x 2>&1 | tail -5`・`git commit -m x < /dev/null` を `precommit-test.sh` に足す。あわせて、同じ文の中で `git add` 以外にインデックスを変えるもの（`git mv`・`git rm`・`git checkout <rev> -- <path>`・`git restore --staged`・`git update-index`・`git apply --cached`・`git merge --no-commit`・`git cherry-pick -n`）が `git commit` の前にあれば、hook の時点で読んだステージの中身では決められないので `all` にする（コードを読んで確かめた。この試験は上のとおり hook に止められたので打っていない）。

### 2（重い） kill の hook が、ポートを空けるよく使われる形を通す

cycle-316 の事故の本質は「自分が起こしたと確かめていないプロセスを止める」ことで、次の形は名前やポートで探して止める点で `pkill` と同じ害を持つが、exit 0 で通った。

```text
npx kill-port 3000                     # 「port 3000 is already in use」への定番の答え
npx -y kill-port 3000 3001
npx fkill-cli :3000
fuser --kill 3000/tcp                  # -k の長い名前
ss -ltnp | grep 3000 | awk '{print $6}' | xargs kill
netstat -tlnp | grep :3000 | awk '{print $7}' | cut -d/ -f1 | xargs kill -9
ps -ef | grep next | awk '{print "kill " $2}' | sh
pgrep -f next > next.pid; kill $(cat next.pid)
```

`npx kill-port <port>` は「ポートが使われている」のエラーへの答えとして多くの記事が勧める形で（[dhiwise](https://www.dhiwise.com/blog/design-converter/how-to-use-npx-kill-port-to-stop-running-processes)・[Yogesh Chavan](https://blog.yogeshchavan.dev/quick-way-to-fix-the-port-is-already-in-use-error)）、LLM が書く見込みは `fuser -k` より高い。`ss`・`netstat` は `lsof` の無い環境で使われる形である。

直すこと: `KILLERS_RE` に `kill-port`・`fkill`（`fkill-cli` を含む）を足し、`fuser` の判定に `--kill` を足す。`LOOKUPS` に `ss`・`netstat` を足す。文の中に名前やポートで探すコマンドがあり、その出力を `sh`・`bash` に流す形（`| sh`・`| bash`）も止める。PID のファイルを許す形は、同じ文の中に探すコマンドがあれば止める（`$(cat …pid)` を変数と同じ扱いにする）。上の例を `cases.py` に足し、ERRMSG と knowledge の「使わない」の列に `kill-port` を足す。

### 3（中） どちらの hook も、約 128KB を超える文と Python の例外で、何も見ずに通す

kill の hook は文を環境変数 `HOOK_COMMAND` で、pre-commit は `commit_files.py` の引数で Python に渡す。Linux では1つの引数・環境変数の文字列は 128KB（`MAX_ARG_STRLEN`）までなので、それを超えると `python3` と `dirname` の起動が「Argument list too long」で失敗し、kill の hook は `DETECTED` が空のまま exit 0 になる。実測で、約 127KB のヒアドキュメントの後ろの `pkill -f next-server` は止まり、約 143KB・193KB では exit 0 で通った（`big3.py`）。pre-commit も同じく `COMMIT_FILES` が空になり、1行目が `none` でないまま進んで `TARGETS` が空で exit 0 になる（コードを読んで確かめた）。大きなファイルをヒアドキュメントで書いてからコミットする文はありうる。また、どちらも Python が例外で終わったとき（`commit_files.py` が捕まえるのは `Undecidable` と `ValueError` だけ）は、同じく何も見ずに通る。

PM の方針（取りこぼしの方が害が大きい）に合わせ、失敗したら安全な側に倒す。文は標準入力か一時のファイルで渡す。kill の hook は、Python が0以外で終わったら、少なくとも `pkill|killall|kill-port|fuser.*-k|playwright\S*\s+install` の文字の一致で止める。pre-commit は、`commit_files.py` が0以外で終わるか1行目が `files`・`all`・`none` のどれでもなければ、`all` として扱う。それぞれの試験に 200KB の例を足す。

### 4（中） nextjs.md §11 の「孤児の `next dev` を止める」が、新しい起こし方のほかの作業者のサーバーを指す

§11 の対処は「孤児の `next dev` とその子の `next-server` がいれば止め（`ps -o ppid=` が 1 で、cwd がリポジトリのもの）」と書く。ところが playwright-mcp.md と take-screenshot が勧める `setsid … &` で起こしたプロセスは、起こした直後から ppid が 1 になる（実測）。同じ作業ツリーで動くほかの作業者の dev サーバーは cwd もリポジトリなので、§11 の条件にそのまま当たり、§8 と playwright-mcp.md の「止めるのは自分のグループだけ」と食い違う。PID の数字を的にする `kill` は hook を通るので、この文に従うと事故がもう一度起こる。§11 の予防の「自分の起動した `next dev` と子の `next-server` の両方を止めるよう指示する」も、グループで止める今の手順と言い方がそろっていない。

直すこと: §11 の対処を「自分のグループが残っていれば、PGID のファイルでグループごと止める。自分のものでない `next dev` が `routes.d.ts` を書き直し続けているときは止めず、PM に知らせる（または別の worktree で検査する）」の形に直し、ppid と cwd で見分ける文を消す。予防も「起こしたグループごと止める（playwright-mcp.md の節）」にそろえる。

### 5（中） `next dev` は同じディレクトリで2つ目を起こさず、`kill <PID>` を勧める。手順に無い

Next.js 16.3.0 の `next dev` は `.next/dev/lock` を取り、取れないと先にいるサーバーの PID と URL を出して「`kill <PID>` で止めて起こし直せ」と勧めて終わる（ソースで確認。上の「確かめたこと」）。take-screenshot の SKILL.md の起こし方は、同じ作業ツリーでほかの作業者が `next dev` を動かしていると、ポートを変えても `dev.log` にこの文を出して終わる。勧められた `kill <PID>` は数字の的なので hook を通り、ほかの作業者のサーバーを止める。SKILL.md と playwright-mcp.md は、どちらもこの場合に触れていない。

直すこと: SKILL.md の起こし方の後と playwright-mcp.md の節に、「ログに `Another next dev server is already running` が出たら、それはほかの作業者のサーバーなので、勧められた `kill` は打たない。同じ作業ツリーのサーバーなので出ている URL を撮ってよいが、相手がいつ止めるかわからないので、自分で止められるサーバーが要るときは `git worktree add` で取り出した木で起こす」の形の1項を足す。`next build` も `.next/lock` で同じく2つ目を止めるので（`build/index.js` 621 行）、本番ビルドの段取りの項にも一言そえる。

### 6（中） `kill` の後ろのリダイレクトを的と読み、案内の文が誤る

`kill_targets` はリダイレクトを的として読むので、次は止まり、Detected は「kill の的が許す形でない: 2>/dev/null」と出る。

```text
kill -- -"$(cat "$DIR/server.pgid")" 2>/dev/null || true
kill $! 2>/dev/null
kill %1 >/dev/null 2>&1
kill 12345 2> /dev/null
```

1つめは knowledge の止め方に、止める先がもう無いときの出力を消すために LLM がよく付ける形で、許すべき形である。案内の文はリダイレクトを的と呼ぶので、読んだ作業者が理由を取り違え、別の書き方を試し始める。直すこと: 指摘1 と同じく、リダイレクトの演算子と行き先を `kill` の引数から外す（`shell_scan` で語を作るときに外せば、両方の hook に効く）。上の4つを `cases.py` の通す側に足す。

### 7（中） pre-commit が `all` で止めたとき、ほかの担当のファイルを整形させる案内になる

`all` の判定は、`git … commit` の文字を含むが単純でない文のすべてに掛かる。その中には、わたしの試験の文のように、コミットしない文も入る（`cd $R` があると、コミットするかを決める前に決められないと判定する）。止めたときの案内は「下のファイルに `npx prettier --write` を打て」だけで、`all` で見たことも、挙げたファイルがほかの担当の書きかけでありうることも書かない。実際、わたしが受けた案内は、ほかの担当が書いている途中の `split-plan.md` を整形せよと読めた。従うと、ほかの担当のファイルを書き換える。

直すこと: (a) `all` で止めたときは、その旨と、自分のファイルでなければ整形せずに `git add <自分のパス>` と `git commit` を単純なコマンドの並びで打ち直すことを案内に書く。(b) 単純でない文でも、一重引用符の中・シェル以外へのヒアドキュメントの本文・コメントを除いて `commit` の語が無ければ `none` にする（`shell_scan` の外し方をそのまま使えば、PM の方針の範囲で取りこぼしは増えない）。

### 8（軽） hook の頭の文と ERRMSG の最後の行が事実と違う

hook の 19〜20 行は「コミットメッセージの `-m "…"` に pkill などの語を書くと止まる（ヒアドキュメントで書けば通る）」と書くが、先頭の語が `git` の区切りは見ないので、`git commit -m "fix: pkill を止める"`・`git commit -m "kill -9 -1 を止める"`・`git commit -m "npx playwright install を止める"` はどれも通る。止まるのは、`-m "…"` の中のバッククォートや `$(…)`（実際に走るので止めて正しい）と、`git`・`gh`・`echo` などでないコマンドの二重引用符の引数（`npx prettier --check "docs/pkill.md"`・`python3 x.py --note "pkill"`）である。ERRMSG の最後の行も同じ前提で書かれている。実際に止まる場合に合わせて書き直す。

### 9（軽） 文の細かな誤りと取りこぼしの残り

- playwright-mcp.md 35 行の「（入れる操作そのものは通るが、使わない）」は、hook が止めると直後の文が書くのと並ぶと、「hook を通る」と読める。「入れることはできるが、決まりに反するので入れない」の形に直す。
- playwright-mcp.md 107 行の「名前やポートで探すコマンドと同じ文の中では、変数を的にする `kill` も止めるので、探すコマンドと止めるコマンドは別に打つ」は、「探した PID を、別のコマンドで止めればよい」とも読める。言いたいのは「自分の PGID を変数に入れて止めるときは、確かめの `ps`・`lsof` と同じ文に入れない」なので、そう書く（実測で、`G=$(cat …pgid); kill -- -"$G"; sleep 2; ps -eo pgid= | awk …` は止まり、`$(cat …)` を直に書く形は通った）。
- frontend-design の SKILL.md 66 行「B-754 の T9 に送られている実機の項目は、T9 のサイクルがこの3つに振り分ける。」は、T9 を終えると古くなる、特定のタスクへの申し送りで、スキルの本文に置くものでない。同じことは split-plan.md 162 行の T9 の行が書いている（拾う grep に `.claude/skills` と `docs/backlog.md` を含む）ので、スキルからは消す。
- ai-agent-communication.md の2つめの項目（フォアグラウンドで動いているかを確かめる手順）に、根拠の別（推論か）が無い。ほかの項目と同じく末尾に書く。
- `commit_files.py` 86〜89 行の効いていない枝を消す（指摘1 で直すときに一緒に）。
- 通ったが、優先は低いもの: `npm init playwright@latest`（雛形がブラウザを入れる）、`npx playwright 'install' webkit`（一重引用符の中を外すため）。前者は `PLAYWRIGHT_RE` に `(init|create) playwright` を足せば止まる。後者は方針の範囲として、通ると知っている形として `cases.py` に残す。

## 来訪者への効き方

hook は来訪者に直接は見えないが、ほかの担当の確かめ（撮影・試験）を途中で壊すと、確かめの抜けた変更が出荷に近づく。指摘2・4・5 は、cycle-316 の事故と同じ「ほかの作業者のサーバーを止める」がまだ起こせる道で、design-rollout の残りのサイクルでは、並行して撮る・試す作業がふえる。指摘1・3 は、整形や残骸のタグの崩れたファイルがコミットに入る道である。`take.ts` が `--out` で並行して撮れるようになり、起こし方・止め方の手順が実測と合ったことは、UI の変更ごとの撮影（AP-WF05）を確かにする。ここは目的を果たしている。

## アンチパターンの当てはめ

- implementation.md AP-I02（個別ケースのハードコード）: 語の分け方は根本から直った。残る取りこぼし（指摘2）は「止める名前」の表の漏れで、表に足す形の直しでよい。ただしリダイレクト（指摘1・6）は `shell_scan` の語の作り方の問題で、表に足すのでなく分け方で直す。
- workflow.md AP-WF09（網羅の主張）: hook の頭の「`-m "…"` に書くと止まる」（指摘8）は、試した例の範囲を超えた主張である。
- workflow.md AP-WF12（事実の実体確認）: 指摘4（`setsid` の ppid）・指摘5（`next dev` の lock）は、手順を実際の起こし方で確かめれば見つかった。
- ツギハギ: hook・`lib/`・knowledge・take-screenshot の SKILL.md に経緯の継ぎ足しは見当たらない。frontend-design の 66 行（指摘9）だけが、特定のタスクへの申し送りとして残っている。

## PM への依頼

指摘があるので、次のとおり進めてください。

1. builder に指摘1〜9 を直させてください（`shell_scan.py`・`commit_files.py`・2つの hook・take-screenshot の SKILL.md・knowledge の3ファイル・frontend-design の SKILL.md）。直すときは、この文書の例（止めるもの・通すもの・200KB の例・ステージした `bad.md` とリダイレクトの例）を builder の `cases.py` と `precommit-test.sh` に足し、すべてが期待どおりに分かれることを示させてください。
2. 直したあと、もう一度レビューを依頼してください。そのときは、前回の指摘だけでなく、hook・スキル・knowledge の全体を見直す範囲にしてください。
