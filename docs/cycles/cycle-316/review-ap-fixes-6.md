# cycle-316 完了の処理 AP の点検の重い1〜3 への対処のレビュー（6回目）

レビュー日: 2026-10-02
対象: [review-ap-fixes-5.md](./review-ap-fixes-5.md) のあとの `git diff` と未追跡のファイルのうち、次のもの（全体の見直しを含む）。

- `.claude/hooks/block-process-kill-and-browser-install.sh`・`.claude/hooks/lib/`（`process_kill_check.py`・`shell_scan.py`・`commit_files.py`）・`.claude/hooks/pre-commit-check.sh`・`.claude/hooks/tests/`・`.claude/settings.json`・`.claude/hooks/stop-cycle-guard.sh`・`scripts/validate-blog-frontmatter.ts`
- `.claude/skills/take-screenshot/SKILL.md`・`scripts/take.ts`
- `docs/knowledge/playwright-mcp.md`・`nextjs.md`・`ai-agent-communication.md`

## 判定

**改善指示（要修正）**

hook の本体は、役割の範囲で止めるべき形をすべて止め、通すべき形をすべて通した。pre-commit は試した形のどれでも直す前の hook より弱くならず、ステージした中身を見るぶん強くなっている。試験はリポジトリに入り、すべて通り、一時のファイルを残さない。残るのは、knowledge の古い1か所（指摘1）と、止めたときの案内の文の小さな誤り（指摘2）である。

## 指摘（重さの順）

### 1. `docs/knowledge/nextjs.md` の「1. 専用ルートを足したあとの開発サーバーは…」の対処が、新しい起こし方の決まりと食い違う（中）

対処の文は「`npm run build && npx next start` で本番のビルドを起動して行う」のままである。この形は、ポートを決めず（3000 番のほかの作業者のサーバーと取り合う）、プロセスのグループも PGID のファイルも作らず、前に置くと Bash ツールが返らない。同じファイルの 2・11 と `playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」「本番ビルドの実機検証の段取り」は、自分専用のディレクトリ・自分で選んだポート・`setsid` のグループで起こし、並行するときは `git worktree add` の木でビルドする形にそろえたので、1 だけが古い段取りを指している。読んだ作業者は 1 のとおりに起こし、止めるときに名前やポートで探す形に向かいやすい（cycle-316 の事故の形）。1 の対処を、2 の4 と同じく「本番ビルドの実機検証の段取り」と「バックグラウンドのプロセスを起こして止める」を指す文に直す。

### 2. `xargs`・`watch` などの後ろの `pkill` で止めたとき、「一重引用符で囲むと通ります」の案内が出るが、囲んでも通らない（小）

`watch -n1 pkill node` は `pkill（ほかのコマンドの引数の中の語）` として止まり、hook は「その引数を一重引用符で囲むと通ります」と添える。`command_index` が `xargs`・`watch`・`strace` などのコマンドを走らせる前置きを飛ばさないので、`pkill` がコマンドの名前でなく引数と読まれるためである。止めること自体は正しく、案内どおりに `'pkill'` と囲んでも1語だけの一重引用符は読むので通らない（`watch` は中身も文として読む。囲んだ形は、試すコマンドが kill の hook に止められたので打たず、`shell_scan.py` の `BARE_WORD_RE` と `CODE_ARG_RE` から読んだ）。抜け道にはならないが、案内が誤っていて、作業者は同じコマンドを打ち直して止められる。後ろのコマンドを走らせる前置き（`xargs`・`watch` ほか）を `command_index` で飛ばすか、案内を出す条件からそれらを外し、試験の `hint_cases` に `echo node | xargs pkill`・`watch -n1 pkill node`（案内なし）を足す。

## 確かめたこと（実測）

試験の道具はスクラッチパッドに置いた（`k.py`・`block.txt`・`allow.txt`・`b2.txt`・`pc.sh`・`mk.sh`、一時のリポジトリ `r1`〜`r8`）。

- **hook の試験**: `bash .claude/hooks/tests/run.sh` はすべて合格（kill の hook は止める 206・通す 169 で食い違い 0、1回の判定は最大 79ms、案内の 11、pre-commit の 112、判定の失敗の 2）。全体 85 秒。走らせる前後で `.claude/hooks/lib/__pycache__` の中身は変わらず（`PYTHONDONTWRITEBYTECODE`）、`/tmp` に `tmp.*` は残らなかった。
- **ほかの検査との食い違い**: `npx prettier --check .claude docs/knowledge scripts/validate-blog-frontmatter.ts` は通り、`npx eslint scripts/validate-blog-frontmatter.ts .claude/skills/take-screenshot/scripts/take.ts` と `npx tsc --noEmit` はエラーを出さなかった。試験は `.py`・`.sh` で、vitest の対象（`*.test.*`）・eslint・tsc の対象に入らない。pre-commit が `--ignore-path .prettierignore` だけを使う点は、`git ls-files -ci --exclude-standard` が画像しか返さない（prettier が読まない）ので、`format:check` と結果が食い違うファイルは今は無い。
- **kill の hook（わたしの例、約 150）**: 止めたのは、`pkill -f next-server`・`killall node`・`killall5 -9`・`npx -y kill-port 3000`・`npx --package=kill-port kill-port 3000`・`npx fkill-cli node`・`npx cross-port-killer 3000`・`fuser --kill 3000/tcp`・`kill $(pgrep -f vitest)`・``kill `pgrep node` ``・`kill -9 "$(lsof -ti:3000)"`・`lsof -ti:3000 | xargs -I % kill %`・`ps -ef | grep [n]ext | awk '{print $2}' | while read p; do kill $p; done`・`PIDS="$(lsof -ti:3000)"; [ -n "$PIDS" ] && kill $PIDS`・`pgrep -f next > /tmp/x.pid; kill $(cat /tmp/x.pid)`・`kill $(ps -C node -o pid=)`・`pgrep node | sed 's/^/kill /' | sh`・`echo 'kill $(pgrep node)' | sh`・`bash -s <<'X'`（本文に `kill $(pgrep node)`）・`python3 -c "…os.system('pkill node')"`・`kill -9 -- -1`・`kill -n 9 0`・`python3 -m playwright install chromium`・`node node_modules/playwright/cli.js install`・`npx -p playwright playwright install`・`npx playwright-core install`・`npx 'playwright' 'install'`・`pnpm exec playwright install --with-deps`・`npm create playwright@latest` など。通したのは、`grep`・`rg`・`sed`・`awk`・`find`・`gh pr create` と、hook のファイルの名前（`block-process-kill-…`）を引数に持つ `npx prettier`・`git diff`・`cp`・`chmod`・`shellcheck`、`-m "$(cat <<'MSG' … MSG)"` に `pkill`・`xargs kill` を書いたコミット、`'docs/pkill.md'` の一重引用符、`python3 -c "import os; os.kill(1234, 9)"`、`docker kill`・`tmux kill-session`、`kill 12345`・`kill -TERM -12345`・`kill -s TERM -- -12345`・`kill $!`、knowledge と SKILL の起こし方・止め方・確かめ方の3つ、`kill $(< "$DIR/server.pgid")`、`ps -eo pid,pgid,args | grep '[n]ext-server'` など。取りこぼしは無かった。
- **文書のコマンドを実際に流す**: knowledge の形で `setsid bash -c 'echo $$ > "$0/t.pgid"; exec sleep 77' "$S" … &` を自分のスクラッチパッドに起こした。シェルはジョブ制御が入っていて（`[1]+ Done` が出る）、`$!`（7404）はすぐ終わり、書き出した PGID（7406）は PPID 1・PGID 7406 だった。`kill -- -"$(cat "$DIR/t.pgid")"` と同じ文の `ps -eo pgid= | awk …| wc -l` は hook に止められず、直後は 1、2 秒おいて 0（`<defunct>` の記述どおり）。止めたのは自分が起こしたグループだけである。
- **pre-commit（一時のリポジトリ）**: ステージした中身が崩れて作業ツリーが直っているときは止め（I）、逆は通し、`-am` では作業ツリーを見て止めた。ほかの担当の未追跡・未ステージの崩れたファイルがあっても `git add mine.md && git commit -m x` は通し、`-am` は止めた。`sub` から `git add ../mine.md`・`git add b.md`・`git commit -m x b.md`、`cd sub && git commit -m x -- b.md`、空白を含むパス、`| tail -3`、改行で区切った `git add`・`git commit -m "<成果>"`・`git push` は、どれも期待どおりだった。ステージした中身の lint（`no-var`）・JSX の `\u`・末尾の `</content>`・ブログの frontmatter（新規記事の `updated_at`）は、どれも作業ツリーが直っていても止め、報告はリポジトリのパスで出た。マージで衝突を解いた `git commit --no-edit` は、相手の側から入る崩れたファイルを見て止めた（直す前の hook も見ていた）。split-plan.md 6 の手順0〜5 のコマンドの形は、手順0 が名指した1ファイルだけ、手順2 の `git add .` が作業ツリーの全部を見て、ほかは `none` か期待どおりだった。
- **速さ**: kill の hook は、関係する語の無いコマンドで 12ms、`kill -- -"$(cat …)"` で 46ms。pre-commit は1ファイルのコミットで 0.7 秒、`commit_files.py` はこのリポジトリで 62ms。
- **take.ts**: `npx tsx … take.ts "data:text/html,<h1>hello</h1>" --out <scratchpad>/shots` で、「playwright が求める版のブラウザが無いので、入っている Chromium で撮ります: /opt/pw-browsers/chromium-1194/chrome-linux/chrome」と出て6枚を `--out` に書き、`tmp/screenshots` は増えなかった。
- **knowledge の事実**: `/opt/pw-browsers` は `chromium`（`chromium-1194/chrome-linux/chrome` へのリンク）・`chromium-1194`・`chromium_headless_shell-1194`・`ffmpeg-1011`（と `.links`）で、`chromium --version` は `Chromium 141.0.7390.37`。`playwright-core` が求めるのは 1228。Next.js は 16.3.0 で、`start-server.js` の `process.title = next-server (v16.3.0)`、`next-dev.js` の `fork`、`setup-dev-bundler.js` の `distDir/lock`、`lockfile.js` の `Another … server is already running.` と `kill <pid>` を勧める文、`build/index.js` の `next build` の lock を確かめた。`analyze-bigquery` の 2026-03-28 も SKILL の文と合う。他人のプロセスを止めさせる手順は、対象の文書にも `.claude/skills`・`.claude/agents`・`.claude/rules`・`docs/knowledge`・`docs/anti-patterns` にも無かった。

## 範囲の外（記録だけ）

- 作ったスクリプトのファイルを `bash /tmp/s.sh` で走らせる形、`xargs kill < pids.txt`・`cat pids.txt | xargs kill`、`kill -9 $(cat /tmp/next.pid)` など、共有の場所の PID のファイルを使う形は通る（knowledge の専用のディレクトリの決まりで防ぐ範囲）。
- `GIT_INDEX_FILE=… git commit` は、既定の索引を見て `files` になる（直す前の hook も既定の索引の `git status` を見ていた）。

## 参考（指摘ではない）

- `stop-cycle-guard.sh` の差し戻しの文は、2度目の終了は止めないことを明かすようになった。バックグラウンドのサブエージェントを待つときにコマンドで待たせないための文で、条件（ほかに進められる作業が無いとき）も書いてあるが、急いで終えたい偏りへの抑えは弱まる。完了の処理のアンチパターンの点検で、`pause-cycle` の記録と同じく、この形で終えたターンが待つだけのものだったかを見ると確かである。
- このレビューの途中で、一時のリポジトリで打った `git checkout -q a.md` が `block-destructive-git.sh` に、試す文字列を二重引用符で `for` に並べたコマンドが kill の hook に止められた。どちらも回り道はせず、前者は一時のリポジトリを作り直す形に、後者は引用符で囲んだヒアドキュメントで書いたファイルから試す形（それまでと同じ道具）で進めた。後者は頭の文に書いた読み方どおりの止め方で、誤りではない。
