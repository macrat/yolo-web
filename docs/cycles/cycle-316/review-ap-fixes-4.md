# cycle-316 完了の処理 AP の点検の重い1〜3 への対処のレビュー（4回目）

レビュー日: 2026-10-02
対象: builder が [review-ap-fixes-3.md](./review-ap-fixes-3.md) の指摘1〜5 を受けて直したもの（`git diff` と未追跡のファイル）。

- `.claude/hooks/block-process-kill-and-browser-install.sh`・`.claude/hooks/lib/`（`process_kill_check.py`・`shell_scan.py`・`commit_files.py`）・`.claude/hooks/pre-commit-check.sh`・`.claude/settings.json`・`.claude/hooks/stop-cycle-guard.sh`
- `.claude/skills/take-screenshot/SKILL.md`・`scripts/take.ts`、`.claude/skills/frontend-design/SKILL.md`
- `docs/knowledge/playwright-mcp.md`・`nextjs.md`・`ai-agent-communication.md`

## 判定

**改善指示（要修正）**

前回の指摘1〜5 はすべて直っている。kill の hook は、役割の範囲（このプロジェクトで実際に起きた形・名前やポートで探して止める定番の形・`playwright install`）で、わたしが新しく作った例も含めてすべて止め、文書・grep・コミットメッセージ・文書に書いた起こし方と止め方・`kill -- -<PGID>`・split-plan.md 6 の手順・cycle-completion の手順7 はすべて通した。

残るのは、pre-commit が直す前の hook より弱くなる所が1つ（指摘1。ステージした中身で検査する新しいブログ記事の「新規記事の updated_at は null」の検査が抜ける）と、軽い3つである。

## 確かめたこと（実測）

試験はスクラッチパッドの `rev-ap-fixes-4/` に置いた（`k.py`・`k2.py`・`docs.py`、一時のリポジトリ `blogrepo/`・`dirrepo/`）。

- **builder の試験**: `builder-killhook/cases.py` は止める 200・通す 162 で食い違い 0（1回の判定は最大 95ms、全体 16 秒）。`HEADER_ITEMS` の確かめ（hook の頭の文に挙げた項目ごとに、止める例が block に入っていること）も通った。`precommit-test.sh` は 100 の例で食い違い 0（64 秒）。前回の指摘2 の `git commit --mes "x"`・`--all-x` は all で止まり、指摘3 の `cat <<'EOF' | bash`・`echo "…" | bash`・`printf … | sh` も all で止まった。`failure-test.sh` は、lib の無い写しで kill の hook が exit 2、pre-commit が all に倒れて exit 2。`precommit-real.sh` の 13 の形は、どれも exit 0 で、`git add` で名指したファイルだけを見た（`{a,b}` の形だけ all）。
- **kill の hook（わたしの例、75 と 20）**: 止まったのは `kill $(ps -ef | grep next | grep -v grep | awk '{print $2}')`・`ps aux | grep "next dev" | … | xargs -r kill`・`PID=$(lsof -ti:3000); if [ -n "$PID" ]; then kill $PID; fi`・`lsof -ti:3000 | while read pid; do kill $pid; done`・`kill $(ss -ltnp | grep 3000 | grep -oP 'pid=\K\d+')`・`kill -9 -$(ps -o pgid= $(pgrep -f next-server) | tr -d ' ')`・`lsof -ti:3000 > "$DIR/server.pid"; kill $(cat "$DIR/server.pid")`・`xargs -r kill < <(lsof -ti:3000)`・`fuser -sk 3000/tcp`・`npx --yes kill-port 3127 3128`・`pnpm playwright install`・`npm exec --yes -- playwright install firefox`・`npx -y @playwright/test@1.61 install webkit` など 41 の形すべて。通ったのは `grep -rn "kill -- -" …`・`git commit -m "docs(knowledge): pkill と playwright install を止める hook"`・`gh pr create --body "$(cat <<'EOF' … kill $(pgrep x) … EOF)"`・`npx prettier --write .claude/hooks/block-process-kill-and-browser-install.sh`・`npx playwright test --grep install`・`kill $(cat d/server.pid)`・`kill -TERM -- "-$(cat "$DIR/server.pgid")"`・`xargs kill < d/server.pid`・`kill $(<d/server.pid)`・`kill -0 $(cat d/server.pid) && echo alive`・`pgrep -af next-server; ps -eo pid,pgid,args | grep '[n]ext'`・文書の起こし方と止め方の4行など 34 の形すべて。止めすぎは `while read -r p; do kill "$p"; done < d/server.pid`（自分の PID のファイルを繰り返しで読む形）で、方針（誤検知より取りこぼしを重く見る）の範囲である。通ってしまう形は指摘3 と「範囲の外」に書いた。
- **文書のコマンド（両方の hook・実の作業ツリーで判定だけ・`docs.py`）**: split-plan.md 6 の bash のブロック 12・cycle-completion の手順7 のブロック・playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」の3つ・nextjs.md の §8・take-screenshot の SKILL.md の4つを、置き場の札（`<作業の名前>` など）を実の値に替えて流した。kill の hook はどれも exit 0（10〜58ms）、pre-commit もどれも exit 0 だった（files で 0.1〜14.5 秒、commit の語の無いものは none）。split-plan.md 6 の手順3 の hook を確かめる4行（`printf '%s' '{"tool_input":{"command":"pkill -f next-server"}}' | bash …`）も、どちらの hook にも止められなかった。
- **起こし方と止め方の実地**: 文書の形（`PORT=3594 setsid bash -c 'echo $$ > "$0/server.pgid"; exec python3 -m http.server 3594' "$DIR" … &`）で自分のディレクトリにサーバーを起こした。`$!` は 6494、書き出した PGID は 6496 で違い、PGID のプロセスは起こした直後から PPID 1・PGID=SID=自分の PID だった（knowledge の記述のとおり）。`kill -- -"$(cat "$DIR/server.pgid")"` で止め、1秒後はグループに1つ残り、もう一度数えると 0、ポートは空いた。止めたのは自分が起こしたグループだけである。
- **pre-commit（一時のリポジトリ）**: ステージした中身と作業ツリーが違う新しいブログ記事で、直す前の hook は止め、直したあとの hook は通した（指摘1）。新しいディレクトリの中の未追跡のファイルは、all のときに直す前も後も見ない（指摘2）。
- **速さ**: kill の hook は、`kill`・`fuser`・`playwright` を含む文（`.claude/skills` のパスもここに入る）で 38〜95ms、含まない文で 10〜14ms。pre-commit は files で 0.1〜1.0 秒（`git add .` を含む完了の手順は 14.5 秒）、all で 14 秒前後。直す前の hook はいつもこの全体を見ていたので、遅くなる所は無い。
- **take.ts**: `about:blank` を `--out <スクラッチパッドの下>` で撮ると、「求める版のブラウザが無いので、入っている Chromium で撮ります: /opt/pw-browsers/chromium-1194/chrome-linux/chrome」と出し、6枚をその場所に保存して 5.7 秒で終わった。既定の `tmp/screenshots/` には書かなかった。
- **knowledge の事実**: `/opt/pw-browsers` の中身（`chromium`・`chromium-1194`・`chromium_headless_shell-1194`・`ffmpeg-1011`）と `chromium --version` が `Chromium 141.0.7390.37` であること、リポジトリの playwright-core が 1.61.1 であること、`setsid` で `$!` とグループの PID が違うこと、`<defunct>` を数えて少しおくと 0 になることは実測で合った。`package.json` の `dev`・`start` は `next dev`・`next start` でポートを決め打ちしていないので、`PORT=<番号>` が効く。dev の印（左下）は `next.config` に `devIndicators` の指定が無く、既定の位置である。frontend-design の4の (i) が指す「実装の技術」のスライダーの項に `touch-action: manipulation` がある。
- **stop-cycle-guard.sh**: 変わったのは頭の注と差し戻しの文だけで、判定（`stop_hook_active`・`completed_at`・`pause-cycle`）は前と同じ。文は、1回の停止につき1度だけ差し戻す実装と合う。
- **他人のプロセスを止めさせる手順**: hook の案内・take-screenshot・playwright-mcp.md・nextjs.md の §8 と §11 は、どれも自分の PGID のファイルでグループを止める形だけを書き、`next dev` の lock の文が勧める `kill <PID>` は打たないと書いている。他人のプロセスを止めさせる手順は無い。
- **ツギハギ**: SKILL.md・knowledge の3ファイル・2つの hook に、経緯の継ぎ足しや「以前は」の注は無い。`commit_files.py` の注の置き場の1つ（指摘4）を除く。frontend-design の `DataTable` の1文の差は、split-plan.md 6 の手順0 が分ける途中の作業で、この対処の範囲の外である。
- `playwright install` を使わない決まりの原文は、わたしの環境の指示には無いので確かめられない。PM の確認に頼っている。
- hook に止められたことは無い。

## 前回の指摘の解消

| 指摘                                   | 結果                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 頭の文の「共有の pid ファイル」      | 解消。頭の文から外し、knowledge の「バックグラウンドのプロセスを起こして止める」の1（作業者ごとの専用のディレクトリ）で防ぐと書いた。`cases.py` に通ると知っている形として6つ |
| 2 `--mes` などの長いオプションの省略形 | 解消。知らない長いオプションは all になり、`--mes`・`--all-x` は止まる                                                                                                        |
| 3 `… \| bash`                          | 解消。kill の hook は流す文も読み、pre-commit は all にする                                                                                                                   |
| 4 `node -e "…"`・`python3 -c "…"`      | 解消。コードを走らせる前置きの二重引用符の中も文として読み、2つの例は止まる                                                                                                   |
| 5 `/opt/pw-browsers` の中身            | 解消。ヘッドレスの殻と ffmpeg を含めた記述になり、実測と合う                                                                                                                  |

## 指摘（重い順）

### 1（中） ステージした中身で検査する新しいブログ記事で、「新規記事の updated_at は null」の検査が抜ける（直す前より弱い）

pre-commit は、ステージした中身が作業ツリーと違うファイル（I）を一時のディレクトリ（`$STAGED_DIR/<パス>`）に書き出し、`validate-blog-frontmatter.ts` にその一時のパスを渡す。ところが検証の `isNewFile(file)` は `git log -- <file>` で履歴の有無を見ており、リポジトリの外の一時のパスでは git が失敗し、`catch` で「新規でない」と返す。そのため、新しい記事を `updated_at` に値を入れたままステージし、そのあと作業ツリーを書き足した（`AM` の）状態で `git commit -m x` を打つと、直したあとの hook は exit 0 で通し、直す前の hook は「新規記事の updated_at は null にしてください」で exit 2 で止めた（スクラッチパッドの `rev-ap-fixes-4/blogrepo/` で確かめた。`git add <記事> && git commit` の形は W になるので止まる）。止まったときの文も、記事のパスでなく一時のパスで出る。

直すこと: 検証に、表示と `git log` に使うリポジトリのパスと、中身を読む場所を別に渡せるようにする（例: `validate-blog-frontmatter.ts` が `<中身のファイル>=<リポジトリのパス>` の形か、標準入力と `--path` を受ける）。pre-commit は I のブログ記事にそのリポジトリのパスを渡す。上の形（新しい記事・`AM`・`updated_at` に値）を `precommit-test.sh` に足し、exit 2 になることを示す。あわせて、I のファイルを一時のパスで渡すほかの検査（残骸タグ・JSX エスケープ）の文が、一時のパスでなくリポジトリのパスを出していることを確かめる（いまは `$name` を出していて合っている）。

### 2（軽） all のとき、新しいディレクトリの中の未追跡のファイルを見ない

`commit_files.py` の `changed_files` と、判定が失敗したときの `pre-commit-check.sh` の代わりの `git status --porcelain` は、未追跡のディレクトリを `newdir/` の1行にまとめて返す。hook は `[ -f "$f" ]` でそれを外すので、all のときは新しいディレクトリの中のファイルを1つも見ない。`if true; then git add . && git commit -m x; fi`（all）は、`newdir/bad.md`（整形の崩れたファイル）があっても exit 0 で通った（直す前の hook も同じく通したので、弱くはなっていない）。files の `git add .` は `git add --dry-run` が1つずつ返すので止まる。all は「決められないので、作業ツリーの変わったファイルをすべて見る」と書いた逃げ道で、このプロジェクトは新しい道具やページをディレクトリごと足すことが多い。

直すこと: 2か所とも `git status --porcelain --untracked-files=all`（`-z` の方も）にする。上の形を `precommit-test.sh` に足す。

### 3（軽） 止めたときの案内の最後の行が、本当に止めるべきコマンドにも「一重引用符で囲むと通る」と教える

案内の最後の行（「その語を git・gh・echo 以外のコマンドの文字の引数（ファイル名など）に書いただけなら、その引数を一重引用符で囲むと通ります」）は、`playwright install` や `pkill` を止めたときにも出る。一重引用符の中は読まないので、`'pkill' -f next-server`・`npx playwright 'install' webkit`・`npx 'playwright' install webkit` はどれも exit 0 で通った。わざと抜ける相手を止めるのは役割の外だが、hook 自身が止めた直後に抜け方を示すと、止められたエージェントが「hook の案内に従った」つもりでコマンドの名前やサブコマンドを囲んで打ち直す道ができる。

直すこと: 次のどちらかにする。(a) 案内の最後の行を、止めた理由が「引数の中の語」に当たりうるとき（判定の理由が `pkill` などの名前の一致で、その語が区切りの先頭の語でないとき）だけ出し、`playwright install` と、先頭の語が `pkill`・`killall` などのときは出さない。(b) 一重引用符で囲んだ語が区切りの先頭（コマンドの名前）か `playwright` の直後にあるときは、引用符を外して読む。どちらでも、上の3つの形を `cases.py` の block に足す。

### 4（軽） `commit_files.py` の `INDEX_KEEPING` の注が、間に入った `COMMIT_LONG_NO_ARG` に隔てられている

55〜57 行の注（「同じ文にあっても、hook の時点で読んだインデックスを変えない git のサブコマンド…」）の直後に `COMMIT_LONG_NO_ARG` とその注が入り、注が指す `INDEX_KEEPING` は 66 行にある。読む人は 55〜57 行の注を `COMMIT_LONG_NO_ARG` のものと取り違える。あとから定数を差し込んだ跡で、ツギハギ禁止に当たる。

直すこと: `COMMIT_LONG_NO_ARG` を `COMMIT_LONG_WITH_ARG` の直後へ移し、55〜57 行の注を `INDEX_KEEPING` の直前に置く。

## 範囲の外（記録だけ。指摘にはしない）

役割（よく打つ誤ったコマンドを止める見張り。わざと抜けようとする相手は止めない）の外の、通る形を記録する。

- 共有の場所の pid ファイルを的にする `kill $(cat server.pid)`（方針どおり hook では止めず、knowledge の決まりで防ぐ）。
- `python3 - <<'PY'` の本文の `os.system('pkill …')`・`subprocess.run(['pkill', …])`（シェル以外へのヒアドキュメントの本文は読まない）。
- 別々の Bash の呼び出しに分けた探しと止め（1回目に `pgrep`、2回目に `kill 12345`）。
- `kill 1`・`kill $PPID`（数字と変数は通す）。
- `npm run <スクリプト>` の中身の `pkill`（いまの `package.json` にそういうスクリプトは無い）。
- pre-commit: `GIT_INDEX_FILE=… git commit`（別のインデックスを見ない。直す前も同じ）、`git \` で改行を挟んだ `commit`、`git 'commit'`（どちらも直す前も同じく見ない）。

## 来訪者への効き方

hook とスキルは来訪者に直接は見えないが、並行する撮影と試験をほかの作業者が途中で壊すと、確かめの抜けた変更が出荷に近づく。名前やポートで探して止める形と `playwright install` が止まり、文書の起こし方と止め方がそのまま hook を通って動くこと、pre-commit がほかの担当の書きかけのファイルで止まらずに自分のコミットのファイルを数秒で見ることは、design-rollout の残りのサイクルの並行作業を確かにしている。指摘1 は、来訪者に見える記事の日時（新しい記事が「更新した」と見える改訂の偽装）の検査が、ある形で抜けることで、記事の信頼に直に関わる。

## アンチパターンの当てはめ

- workflow.md AP-WF41（改稿で過去に指摘された型の欠陥を新しく入れる）: 指摘1 は、ステージした中身を見るように作り直したときに、パスに頼る検査（`git log -- <file>`）が一時のパスで黙って効かなくなった。前の指摘（リダイレクト・ヒアドキュメントで検査が抜ける）と同じ「作り直しで検査が黙って抜ける」型である。
- implementation.md（試験の網羅）: `precommit-test.sh` はブログの frontmatter の検査を I の形で1つも試していない。指摘1 の例を足すことで埋まる。
- workflow.md AP-WF12（事実の実体確認）: knowledge の事実は実測とファイルで合った。
- ツギハギ: 指摘4。

## PM への依頼

指摘があるので、次のとおり進めてください。

1. builder に指摘1〜4 を直させてください（`pre-commit-check.sh`・`scripts/validate-blog-frontmatter.ts`・`commit_files.py`・`block-process-kill-and-browser-install.sh`、必要なら `shell_scan.py`・`process_kill_check.py`）。直すときは、この文書の例を `builder-killhook/cases.py` と `precommit-test.sh` に足し、すべてが期待どおりに分かれることを示させてください。指摘3 の (a) と (b) のどちらにするかは、方針（よく打つ誤ったコマンドを止める見張り）に照らして PM が決めてから指示してください。
2. 直したあと、もう一度レビューを依頼してください。そのときは、前回の指摘だけでなく、hook・スキル・knowledge の全体を見直す範囲にしてください。
