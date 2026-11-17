# cycle-316 完了の処理 AP の点検の重い1〜3 への対処のレビュー（5回目）

レビュー日: 2026-10-02
対象: builder が [review-ap-fixes-4.md](./review-ap-fixes-4.md) の指摘を受けて直したもの（`git diff` と未追跡のファイル）と、全体の見直し。

- `.claude/hooks/block-process-kill-and-browser-install.sh`・`.claude/hooks/lib/`（`process_kill_check.py`・`shell_scan.py`・`commit_files.py`）・`.claude/hooks/pre-commit-check.sh`・`.claude/settings.json`・`.claude/hooks/stop-cycle-guard.sh`・`scripts/validate-blog-frontmatter.ts`
- `.claude/skills/take-screenshot/SKILL.md`・`scripts/take.ts`
- `docs/knowledge/playwright-mcp.md`・`nextjs.md`・`ai-agent-communication.md`

## 判定

**改善指示（要修正）**

前回の指摘はすべて直っている。builder の試験はすべて期待どおりで、わたしが新しく作った例でも、名前やポートで探して止める定番の形と `playwright install` はすべて止まり、文書・grep・コミットメッセージ・文書に書いた起こし方と止め方・`kill -- -<PGID>`・split-plan.md 6 の手順・cycle-completion の手順7 はすべて通った。pre-commit は、試した形のすべてで直す前の hook より弱くなる所が無く、ふだんのコミットでは 14 秒から 0.9 秒に速くなった。

残るのは、hook の試験がリポジトリに無く、頭の文がそれを指していること（指摘1）、区切りを引用符で囲まないヒアドキュメントの本文の中で実際に走る置換を読まないこと（指摘2）と、軽い2つである。

## 確かめたこと（実測）

試験はスクラッチパッドの `rv5/` に置いた（`mycases.py`・`more.py`・`pc.sh`・`lint.sh`、一時のリポジトリ `repo/`・`lrepo/`）。

- **builder の試験**: `builder-killhook/cases.py` は止める 203・通す 164 で食い違い 0、`HEADER_ITEMS` の確かめも通り、1回の判定は最大 83ms（全体 16 秒）。`precommit-test.sh` は 107 の例で食い違い 0（67 秒）。`failure-test.sh` は、lib の無い写しで kill の hook が exit 2、pre-commit が all に倒れて exit 2。`precommit-real.sh` の形は、どれも exit 0 で、名指したファイルだけを見た（`{a,b}` の形だけ all）。
- **kill の hook（わたしの例、止める 43・通す 41、食い違い 0、最大 62ms）**: 止まったのは `kill -9 $(lsof -ti tcp:3000 -sTCP:LISTEN)`・`lsof -ti:3000 | xargs --no-run-if-empty kill -9`・`kill -9 $(ps -ef | grep '[n]ext dev' | awk '{print $2}')`・`PID=$(lsof -t -i:3000); if [ -n "$PID" ]; then kill -9 $PID; fi`・`for pid in $(ps -eo pid,comm | awk '/node/ {print $1}'); do kill $pid; done`・`kill -9 $(ss -lptn 'sport = :3000' | grep -oP 'pid=\K\d+')`・`fuser -TERM -k 3000/tcp`・`fuser 3000/tcp | xargs kill`・`kill -15 -$(ps -o pgid= $(pgrep -f next) | tr -d ' ')`・`kill -- -$$`・`(npm start &) ; sleep 5; pkill -f "next start"`・`npx --yes kill-port 3000 && npm run dev`・`sudo npx playwright install-deps chromium`・`npm exec --yes -- playwright install webkit`・`yarn dlx playwright install`・`npx --package @playwright/test playwright install chromium` など。通ったのは、`-m "$(cat <<'EOF' … \`pkill -f\` … EOF)"` のコミット、`gh pr create --body "$(cat <<'EOF' … EOF)"`、`rg -n 'pkill|killall' .claude docs`、`npx prettier --check .claude/hooks/lib/process_kill_check.py …`、`bash -n` と `python3 -m py_compile` での hook の確かめ、`npm install -D playwright`・`npm ls playwright`・`npx playwright --help | grep install`、`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node tmp/x.mjs`、`kill %1 %2`・`kill -9 $!`、`kill -s TERM -- -"$(cat d/server.pgid)"`、take.ts の起動など。
- **文書のコマンド**: playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」の起こし方と止め方の形で、自分のディレクトリに `sleep 60` を起こし、止めた。kill の hook はどちらも通した。`$!`（9151）と書き出した PGID（9153）は違い、PGID のプロセスは PPID 1 だった。Bash ツールのシェルはジョブ制御が入っていて（`$-` に `m`）、背景のジョブがグループの頭になるので `setsid` が fork する。knowledge の記述と合う。`kill -- -"$(cat "$DIR/t.pgid")"` の1秒後はグループに1つ残り、2秒おいて数え直すと 0 だった（knowledge の `<defunct>` の記述どおり）。止めたのは自分が起こしたグループだけである。cycle-completion の手順7（`git add .` から push まで）は、pre-commit が files で作業ツリーの変わった 117 のファイルすべてを見た（`git status` の数と同じ）。split-plan.md 6 の手順0（パスを指定したコミット）は、名指した `frontend-design/SKILL.md` だけを見た。
- **pre-commit（一時のリポジトリ、`pc.sh` の 19 と `lint.sh` の4）**: `sub` から `git add bad2.md`・`git add ../bad.md`、空白・日本語・`[ ]` を含むパス、ステージした日本語のパス、`[slug]` のディレクトリの `-am`、ほかのファイルを足すときのステージ済みの崩れたファイル、`--amend`・`-qm`・`-m x -m y`・`-n`・`--message`・`-v -s`・`--no-gpg-sign`・一重引用符のメッセージは、どれも崩れたファイルを見て止めた。ほかの崩れたファイルがあっても、自分のファイルを足すだけのコミットは通した（改行で区切った形も）。lint は、リポジトリの `eslint.config.mjs` を写した一時のリポジトリで、ステージした中身が `jsx-a11y/alt-text` に反し作業ツリーが直っているときに止め、逆のときに通し、`git add` で足す形でも止めた。直す前の hook は作業ツリーの中身しか見なかったので、ここは強くなっている。
- **pre-commit の、直す前より弱くなる所**: 見つからなかった。`.prettierignore` だけを使う形は、`git ls-files -ci --exclude-standard` の追跡している無視のファイルが画像だけ（`--ignore-unknown` で飛ばす）なので、止める所が増えるだけである。ブログの記事は、作業ツリーと同じときは記事のパスを、ステージした中身が違うときは一時のファイルを `--content` で渡し、新規の判定（`git log`）は記事のパスで行う。前回の指摘1 の形は builder の試験の「4巡目」で止まる。
- **速さ**: 実の作業ツリーで、`git add docs/knowledge/nextjs.md && git commit -m x` の判定は、直す前の hook が 14.0 秒、直した hook が 0.9 秒。all に倒れる `if true; then … fi` の形は、どちらも 13.8 秒前後で、遅くなる所は無い。kill の hook は最大 83ms。
- **take.ts**: スクラッチパッドの HTML を `--out <スクラッチパッドの下>` で撮ると、「求める版のブラウザが無いので、入っている Chromium で撮ります: /opt/pw-browsers/chromium-1194/chrome-linux/chrome」と出し、6枚をその場所に保存した。`PLAYWRIGHT_BROWSERS_PATH` は `/opt/pw-browsers`。
- **knowledge の事実**: `/opt/pw-browsers/chromium` のリンク先（`chromium-1194/chrome-linux/chrome`）、中身の4つ、`Chromium 141.0.7390.37`、playwright 1.61.1 が求める chromium の revision 1228（入っていない）は実測で合った。`next dev` の lock の文（`Another next dev server is already running.`・PID と `kill <PID>` を勧める文）は `node_modules/next/dist/build/lockfile.js`、`.next/dev` と `.next` の lock は `setup-dev-bundler.js`・`build/index.js`、`next start` の `process.title` と `next dev` の `fork` も、Next.js 16.3.0 のコードで確かめた。BigQuery の GA の数が 2026-03-28 からであることは `analyze-bigquery` スキルと合う。
- **他人のプロセスを止めさせる手順**: hook の案内・take-screenshot・playwright-mcp.md・nextjs.md の §8 と §11 は、どれも自分の PGID のファイルでグループを止める形だけを書き、lock の文が勧める `kill <PID>` は打たないと書いている。他人のプロセスを止めさせる手順は無い。
- **stop-cycle-guard.sh**: 変わったのは頭の注と差し戻しの文だけで、`stop_hook_active` で1回の停止につき1度だけ差し戻す実装と合う。
- **整形・lint**: 対象の文書・スキル・`take.ts`・`validate-blog-frontmatter.ts`・`settings.json` は prettier を通り、`take.ts` と `validate-blog-frontmatter.ts` は eslint を通った。新しい hook は実行の権限を持つ。`.claude/hooks/lib/__pycache__/` は `.gitignore` の `__pycache__/` で外れる。
- `playwright install` を使わない決まりの原文は、わたしの環境の指示には無いので確かめられない。PM の確認に頼っている。
- hook に止められたことは無い。

## 前回の指摘の解消

| 指摘                                           | 結果                                                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 ステージした中身の新しいブログ記事           | 解消。記事のパスと中身のファイルを `--content` の組で渡し、`AM` の新しい記事で `updated_at` に値があれば止まる。報告も記事のパスで出る                                    |
| 2 all のときの新しいディレクトリの中のファイル | 解消。2か所とも `--untracked-files=all` になり、`newdir/bad.md` で止まる                                                                                                  |
| 3 案内が一重引用符での抜け方を教える           | 解消。案内は「ほかのコマンドの引数の中の語」で止めたときだけ出て、`'pkill' -f next-server`・`npx playwright 'install' webkit`・`npx 'playwright' install webkit` は止まる |
| 4 `INDEX_KEEPING` の注の置き場                 | 解消。注は `INDEX_KEEPING` の直前にある                                                                                                                                   |

## 指摘（重さの順）

### 指摘1（中）: hook の試験がリポジトリに無く、頭の文がそれを指している

`block-process-kill-and-browser-install.sh` の頭の文は「項目ごとの止める例は、試験の cases.py の HEADER_ITEMS にある」と書くが、`cases.py` はこのセッションのスクラッチパッド（`builder-killhook/`）にしか無く、リポジトリのどこにも無い（`find . -name cases.py` は何も出さない）。pre-commit の試験（`precommit-test.sh`・`failure-test.sh`）も同じで、パスはスクラッチパッドに決め打ちされている。

効き方: セッションが終わると、頭の文は無いファイルを指し、読んだ作業者は探して見つけられない（ツギハギ禁止の「一貫した状態」に反し、事実と合わない記述が残る）。2つの hook は、約 40KB の文の読み方のコードの上に、5巡のレビューで見つかった細かい形（リダイレクト・長いオプションの省略形・`| bash`・コードを走らせる前置き・ステージした中身の記事など）を、止める 203・通す 164・pre-commit 107 の例で守っている。この例が失われると、design-rollout の残りのサイクルで hook を直す者は、前に塞いだ形がまた開いても気づけない。

直すこと: 試験をリポジトリの中（たとえば `.claude/hooks/tests/`）に置き、1つのコマンドで走らせられるようにする（一時のリポジトリは `mktemp -d` で作り、スクラッチパッドのパスを決め打ちしない。`node_modules` はリポジトリのものを指す）。頭の文の参照と、pre-commit の側の参照もその場所に合わせる。走らせ方は、hook を直すときに走らせるよう、頭の文か knowledge に1行書く。

### 指摘2（中）: 区切りを引用符で囲まないヒアドキュメントの本文の、実際に走る置換を読まない

`shell_scan.py` は、シェル以外に渡すヒアドキュメントの本文を区切りを問わずすべて外す。区切りを引用符で囲まない（`<<EOF`）本文の中の `$(…)` とバッククォートは bash が実際に走らせる（`printf '%s' "$(cat <<EOF` の本文に `` `echo RAN` `` を書くと `RAN` が出ることを確かめた）が、hook はそれを読まない。次の3つは、どれも exit 0 で通った。

- `-m "$(cat <<EOF` の本文に ``fix: `pkill -f next-server` を止める`` を書いたコミット
- `-F - <<EOF` の本文に `fix: $(pkill -f next)` を書いたコミット
- `gh pr create --body "$(cat <<EOF` の本文に `` `kill $(pgrep x)` `` を書いたもの

効き方: コミットメッセージや PR の本文を、Markdown のバッククォートでコマンドを囲んでヒアドキュメントで書くのは、エージェントがいちばんよく打つ形の1つで、区切りの引用符を落とすこともある。このサイクルとその後のサイクルのメッセージは `pkill -f next-server` そのものを話題にするので、引用符を落とすと、文を書いただけのつもりで同じコンテナのほかの作業者のサーバーを止める。hook はすでに `-m "…"` の中のバッククォートと `$(…)` を「実際に走る」として止めており、同じ理由の形がヒアドキュメントの側で抜けている。役割の「よく打つ誤ったコマンド」の範囲の中である。

直すこと: 区切りを引用符で囲まないヒアドキュメント（`<<EOF`・`<<-EOF`）の本文は、外す前に、中の `$(…)` とバッククォートの中身だけを区切りとして読む（本文の地の文は読まない）。引用符で囲んだもの（`<<'EOF'`・`<<"EOF"`）は今のまま外す。頭の文の「読み方」もそれに合わせて書き、上の3つを止める側に、同じ本文を `<<'EOF'` で書いたものを通す側に足す。

### 指摘3（低）: knowledge の「hook が通す形・止める形」の列が hook と食い違う

`playwright-mcp.md` の「バックグラウンドのプロセスを起こして止める」の末尾は、hook が「`kill` の的は数字・`-<PGID>`・`$!`・`%<ジョブ>`・`$(jobs -p)`・`$(cat <…pid か …pgid のファイル>)` と変数だけを通す」と書く。hook は `$(< …)` と、探すコマンドの無い文の xargs も通す（頭の文にもそう書いてある）。止める側の列も、`kill 0`（自分のシェルのグループ）と `kill-ports`・`cross-port-killer` を挙げていない。どれも作業者を危ない側へ誤らせはしないが、knowledge と hook の頭の文が別の列を持ち、一方だけを読んだ者は違う事実を受け取る。

直すこと: knowledge の列を hook の頭の文と同じにするか、列を書かずに hook の頭の文を指す。

### 指摘4（低）: nextjs.md §8 の手順が、起こした直後に確かめる

nextjs.md の §8「解消の手順」の bash のブロックは、`PORT=3127 setsid … exec npm start …&` の次の行で `curl -I http://localhost:3127/path` を打つ。このまま1つの呼び出しで流すと、サーバーが待ち受ける前に `curl` が走って接続を拒まれ、200 を確かめる行が働かない。take-screenshot の SKILL.md の同じ形は「ログに Ready が出てから」と書いている。ポートが空いているかの確かめ（playwright-mcp.md の2）もこのブロックには無い。

直すこと: `curl` の前に「ログに Ready が出てから」を書き（無限に待たない）、起こす前に `lsof -nP -iTCP:3127 -sTCP:LISTEN` で空きを確かめる行を足すか、playwright-mcp.md の手順を指す。

## 範囲の外（記録だけ。指摘にはしない）

役割（よく打つ誤ったコマンドを止める見張り。わざと抜けようとする相手は止めない）の外の、通る形を記録する。前回の記録（共有の場所の pid ファイル・`python3 - <<'PY'` の本文・別々の呼び出しに分けた探しと止め・`kill 1`・`kill $PPID`・`npm run` の中身・`GIT_INDEX_FILE`）は変わらない。

- `python3 - <<EOF`（区切りを引用符で囲まない形）の本文の `os.system('pkill x')`。指摘2 を直しても、`$(…)` とバッククォートでないので読まない。
- `npm i -D @playwright/browser-webkit` のように、入れたときにブラウザを落とすパッケージ。
- pre-commit: `G=git; $G commit -m x`（直す前の hook も見ない）。

## 来訪者への効き方

hook とスキルは来訪者に直接は見えないが、並行する撮影と試験をほかの作業者が途中で壊すと、確かめの抜けた変更が出荷に近づく。名前やポートで探して止める形と `playwright install` が止まり、文書の起こし方と止め方がそのまま通って動くこと、pre-commit がほかの担当の書きかけのファイルで止まらずに自分のコミットのファイルを1秒弱で見ることは、design-rollout の残りのサイクルの並行作業を確かにしている。指摘1 は、その守りを後のサイクルが保てるかに、指摘2 は、cycle-316 で実際に起きた「ほかの作業者のサーバーを止める」が、コミットメッセージを書くだけで起こりうる道に関わる。
