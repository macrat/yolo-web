# cycle-316 完了の処理 AP の点検の重い1〜3 への対処のレビュー（3回目）

レビュー日: 2026-10-02
対象: builder が [review-ap-fixes-2.md](./review-ap-fixes-2.md) の指摘1〜9 を受けて作り直したもの（`git diff` と未追跡のファイル）。

- `.claude/hooks/block-process-kill-and-browser-install.sh`・`.claude/hooks/lib/process_kill_check.py`・`.claude/hooks/lib/shell_scan.py`・`.claude/hooks/lib/commit_files.py`・`.claude/hooks/pre-commit-check.sh`・`.claude/settings.json`・`.claude/hooks/stop-cycle-guard.sh`
- `.claude/skills/take-screenshot/SKILL.md`・`scripts/take.ts`、`.claude/skills/frontend-design/SKILL.md`
- `docs/knowledge/playwright-mcp.md`・`nextjs.md`・`ai-agent-communication.md`

## 判定

**要修正**

前回の指摘1〜9 はすべて直っている。builder の試験（kill の hook 297 例・pre-commit 75 例・失敗の試験・実の作業ツリーの試験）はすべて期待どおりで、わたしが新しく作った例でも、名前やポートで探して止める定番の形はすべて止まり、文書に書いた起こし方・止め方・`kill -- -<PGID>`・grep・コミットメッセージ・完了の処理のコマンドはすべて通った。pre-commit は、試した形のうち1つ（長いオプションの省略形。指摘2）を除き、直す前の hook より弱くなる所が無かった。

残る重い点は1つで、hook の頭の文が「止める対象」に挙げる「共有の pid ファイルの取り違え」（このプロジェクトで実際に起きた形）を、hook がどの形でも止めないことである。ほかは軽い取りこぼしと文の誤りである。

## 確かめたこと（実測）

試験はスクラッチパッドの `rev-ap-fixes-3/` に置いた（`k.py` と `c1.txt`・`c3.txt`、`pc.sh`、`pr.sh` と `c-real.txt`・`c2.txt`）。

- **builder の試験**: `builder-killhook/cases.py` は止める 171・通す 126 で食い違い 0、1回の判定は最大 84ms（全体 12.9 秒）。`precommit-test.sh` は 75 の例で食い違い 0（44 秒）。前回の指摘1 のリダイレクトとヒアドキュメントの7つの形、インデックスを変える git の8つの形、200KB の文の3つの形はどれも期待どおりだった。`failure-test.sh` は、lib の無い写しで kill の hook が exit 2、pre-commit が all に倒れて exit 2 だった。`precommit-real.sh` の3つの形は、どれも files で、`git add` で名指したファイルだけを見て exit 0 だった。
- **kill の hook（わたしの例、61）**: 止まったのは、`P=$(lsof -t -i:3000) && [ -n "$P" ] && kill -9 $P`・`for port in 3000 3001; do lsof -ti:$port | xargs -r kill; done`・`kill $PID $(pgrep x)`・`kill -9 "${PIDS[@]}"`・`bash -c "lsof -ti:3000 | xargs kill"`・`git commit -m "fix" && kill $(pgrep node)`・`npx kill-port`（ポートなし）など。通ったのは、`kill -- -"$(cat "$DIR/server.pgid")"; rm -rf "$DIR"`・`kill -TERM -$(cat "$DIR/server.pgid") 2>/dev/null; …; kill -KILL …`・`kill -0 -"$(cat "$DIR/dev.pgid")" && echo alive`・`kill -9 $(jobs -p)`・`lsof -i :3000`・`ss -ltnp | grep 3000`・`ps aux | grep -E 'next|vitest' | grep -v grep`・`rg -n "fuser" .claude/hooks`・`git log -S'pkill' --oneline`・`npx prettier --write docs/knowledge/playwright-mcp.md .claude/hooks/block-process-kill-and-browser-install.sh`・`vitest run src/kill-switch`・`npm run test -- src/kill`・`tmux kill-session -t x` など。止めすぎは、`xargs -0 grep -l pkill < files`・`find … -exec grep -l pkill {} +`・`python3 -c "print('pkill')"`・`docker kill abc`・`systemctl kill foo`・`npx playwright install --list` で、どれも方針（誤検知より取りこぼしを重く見る）の範囲で、案内の最後の行（一重引用符で囲めば通る）で抜けられる。通ってしまう形は指摘1・3・4。
- **起こし方と止め方の実地**: 文書の形（`setsid bash -c 'echo $$ > "$0/dev.pgid"; exec …' "$DIR" … &`）で、自分のディレクトリに `python3 -m http.server 3593` を起こし、`kill -- -"$(cat "$DIR/dev.pgid")"` で止めた。どのコマンドも hook を通り、1秒後はグループに1つ残り（`<defunct>`）、さらに2秒おくと 0 になり、ポートは空いた（knowledge のとおり）。止めたのは自分のグループだけである。Bash ツールのシェルは、コマンドごとに自分の PGID と SID を持っていた（`kill 0` を許しても、ほかの作業者には届かない）。
- **pre-commit（一時のリポジトリ、21 の例・`pc.sh`）**: `git commit --amend --no-edit`・`git add -u`・`git add :/`・`git commit --only <パス>`・`git commit -m x 2>&1 | tee log.txt`・`git commit -qm x && git push`・`git commit --file=- <<EOF`・`git -c core.hooksPath=/dev/null commit`・`git --no-pager commit`・`git add sub` と `git add -A sub/`・`git stash && git commit`（all）は、どれもステージした崩れたファイルか足したファイルを見て止めた。`git add mine.md && git commit -m "fix: 日本語 (#1)"`・`git add 'mine.md' && git commit -m 'x'` は、ほかの崩れたファイルを見ずに通った。日本語と空白を含むパスも `git add --dry-run` の出力から正しく拾う。食い違ったのは `git commit --mes "x"`（指摘2）と、`.gitignore` に入れたファイルを `git add -f` で足す形である。後者は Prettier 3 が `.gitignore` のファイルを見ないためで、前の hook も同じく見ないので、弱くなってはいない。
- **完了の処理のコマンド（実の作業ツリーで判定だけ・`pr.sh`）**: split-plan.md 6 の手順0（`git commit -m … -- .claude/skills/frontend-design/SKILL.md`。files で1ファイル・1.1 秒）、手順2（`git status --short`〜`git push origin HEAD:design-rollout` の4行。files で 112 ファイル・20 秒）、手順3 の後半（5行。files で4ファイル・1.2 秒）、手順5 の衝突の解決（`git add docs/backlog.md && git commit --no-edit`。0.6 秒）、cycle-completion の手順7 のブロック（files で 112 ファイル・21 秒）は、どれも exit 0 で、誤って止めなかった。`git add <自分のパス> && git commit -m "$(cat <<'EOF' … EOF)"`（空行と Co-Authored-By の行を含む）は files で 0.8 秒、`… 2>&1 | tail -3` も同じだった。`-m` の中の `\``・`\$`・`{a,b}` の形は all になり（14 秒）、見たファイルがきれいなので通った。kill の hook は、このどれにも掛からなかった。
- **速さ**: kill の hook は、`kill`・`fuser`・`playwright` を含む文（`.claude/skills` のパスを含む文もここに入る）で 36〜84ms、含まない文で 10〜13ms。pre-commit は files で 0.6〜1.2 秒、all で 14〜21 秒（このツリーの変わったファイル 110 本。前の hook はいつもこの全体を見ていた）。作業を妨げる遅さは無い。
- **take.ts**: `about:blank` を `--out <スクラッチパッドの下>` で撮ると、「求める版のブラウザが無いので、入っている Chromium で撮ります: /opt/pw-browsers/chromium-1194/chrome-linux/chrome」と出し、6枚をその場所に保存して 5.6 秒で終わった（`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`、リポジトリの playwright-core は 1.61.1）。既定の `tmp/screenshots/` には書かなかった。
- **knowledge の事実**: `tsconfig.json` の `include` に `.next/types/**/*.ts` と `.next/dev/types/**/*.ts` があること、`next-env.d.ts` が `./.next/types/routes.d.ts` を import すること、`pre-push-check.sh` が build より前に typecheck を走らせること（36〜40 行）、`bundle-budget.test.ts` が `build-manifest.json` が無いと全体を飛ばすこと（319 行の `describe.skipIf`）は、ファイルで確かめた。「`.next` を丸ごと消しても typecheck は通る」は、TypeScript 6.0.3 が解決できない副作用の import を既定でエラー（TS2882）にするので疑い、リポジトリの `tsconfig.json` と同じ形の `next-env.d.ts` だけを置いた写しで確かめた。`skipLibCheck: true` で `.d.ts` の中の import は検査されず、exit 0 だった（記述のとおり）。
- **stop-cycle-guard.sh**: 変わったのは頭の注と差し戻しの文だけで、判定（`stop_hook_active`・`completed_at`・`pause-cycle`）は前と同じである。文は、1回の停止につき1度だけ差し戻すという実装と合う。
- **ツギハギ**: 2つの hook・`lib/`・take-screenshot の SKILL.md・knowledge の3ファイル・frontend-design の SKILL.md に、経緯の継ぎ足しや「以前は」の注は無い。前回の指摘9 の frontend-design の T9 への申し送りは消えている。frontend-design の `DataTable` の1文の差は、split-plan.md 6 の手順0 が分ける途中の作業で、この対処の範囲の外である。
- **他人のプロセスを止めさせる手順**: hook の案内・take-screenshot・playwright-mcp.md・nextjs.md の §8 と §11 は、どれも自分の PGID のファイルでグループを止める形だけを書き、`next dev` の lock の文が勧める `kill <PID>` は打たないと書いている。他人のプロセスを止めさせる手順は無い。
- `playwright install` を使わない決まりの文は、わたしの環境の指示には無いので、原文は確かめられない。PM の確認に頼っている。
- hook に止められたことは無い。一時のリポジトリを作るコマンド（`cd $R && … commit -qm init`）で、pre-commit が `cd "$変数"` を理由に all で実の作業ツリーを見たが、崩れたファイルが無く通った（設計どおり）。

## 前回の指摘の解消

| 指摘                               | 結果                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1 リダイレクトとヒアドキュメント   | 解消。`without_redirects` で語から外し、試験の7つの形はすべて止まる。インデックスを変える git も all になる                              |
| 2 ポートを空ける形                 | 解消。`kill-port`・`fkill`・`fuser --kill`・`ss`・`netstat`・`\| sh`・探すコマンドが書いた PID のファイルは止まる                        |
| 3 128KB と例外                     | 解消。どちらも標準入力で渡し、kill の hook は判定の失敗で止め、pre-commit は 1行目が想定外なら all にする                                |
| 4 nextjs.md §11                    | 解消。自分の PGID で止め、自分のものでない `next dev` は止めずに知らせる形になった                                                       |
| 5 `next dev` の lock               | 解消。SKILL.md と playwright-mcp.md の4に書かれ、`next build` の `.next/lock` も本番ビルドの段取りにある                                 |
| 6 `kill` の後ろのリダイレクト      | 解消。5つの形が通る                                                                                                                      |
| 7 all の案内                       | 解消。all で止めたときだけ、ほかの担当のファイルを整形しないことと打ち直し方を案内し、commit の語が無い文は none になる                  |
| 8 hook の頭の文と ERRMSG           | `-m "…"` の扱いは実際の動きと合った。ただし頭の文に、実際には止めない「共有の pid ファイルの取り違え」が入った（指摘1）                  |
| 9 文の細かな誤り・残りの取りこぼし | 解消（playwright-mcp.md の2つの文、frontend-design の申し送り、ai-agent-communication.md の根拠、効いていない枝、`npm init playwright`） |

## 指摘（重い順）

### 1（重い） hook の頭の文が「止める」と書く「共有の pid ファイルの取り違え」を、hook がどの形でも止めない

hook の頭（5〜7 行）は「止める対象は、このプロジェクトで実際に起きた形（pkill -f・共有の pid ファイルの取り違え・playwright install）と、…」と書く。ところが `kill` の的の `$(cat <…pid か …pgid のファイル>)` は、名前やポートで探すコマンドが同じ文で書いたものでない限り、置き場によらず通る。次はどれも exit 0 だった。

```text
kill $(cat /tmp/claude-0/-home-user-yolo-web/<セッション>/scratchpad/server.pid)
S=/tmp/claude-0/x/scratchpad; kill $(cat $S/server.pid)
kill -9 $(cat server.pid)
kill $(cat tmp/server.pid)
kill -9 $(cat "$S/server.pid")
```

cycle-316 の事故（playwright-mcp.md の根拠の「共有の scratchpad の `server.pid` の取り違えでほかの作業者のサーバーを止めた」）は、まさにこの形である。PM の方針は、このプロジェクトで実際に起きた形を止める範囲に入れ、取りこぼしを誤検知より重く見るとしている。いまは knowledge の1（作業者ごとの専用のディレクトリ）だけが防いでいて、頭の文を読んだ人は hook が止めると受け取る。前回の指摘8（頭の文が実際の動きと違う）と同じ型の誤りが、書き直した所に新しく入った（AP-WF41）。

直すこと: PID のファイルの置き場を見る判定を足す。的の `$(cat …)`・`$(< …)` のパスが、共有の場所の直下（ディレクトリの無い名前、`tmp/`・`/tmp/`・`$TMPDIR`・`./` の直下、名前が `scratchpad` のディレクトリの直下）を指すときは止める。パスの頭が変数のときは、同じ文の代入（`S=…`）から分かればその値で判定し、分からなければ通す（専用のディレクトリを変数で書く文書の形 `"$DIR/server.pgid"` は通ったままにする）。止めたときの案内に、knowledge の1（専用のディレクトリに置く）を指す1行を足す。上の5つの例（変数で値の分からない最後のものは通ると知っている形として）と、`kill -- -"$(cat "$DIR/server.pgid")"`・`kill $(cat tmp/cycle-316/x/server.pid)` を通す例を `cases.py` に足す。判定を足さないと決めるなら、頭の文から「共有の pid ファイルの取り違え」を外し、それは knowledge の1 で防ぐと書く。どちらにするかは、方針（実際に起きた形は止める）に照らして決める。

### 2（軽） pre-commit が、長いオプションの省略形（`--mes`）を付けた `git commit` でステージしたファイルを見ない

git は長いオプションを一意な省略形でも受け付ける（`--mes` は `--message`）。`parse_commit` は知らない長いオプションを引数なしとして読み、続く `"x"` をパスと読むので、「パスを指定したコミット」としてステージしたものを外し、files（空）・exit 0 で通った（ステージした崩れた `staged.md` で確かめた）。前の hook は変わったファイルをすべて見ていたので、この形だけは前より弱い。LLM がふだん打つ形ではないので軽い。

直すこと: `parse_commit` で、知っている長いオプション（引数を取るもの・取らないもの）のどれとも一致しない `--` のオプションは決められないとして all にする。`git commit --mes "x"` と `git commit --all-x`（存在しないオプション）を `precommit-test.sh` に足す。

### 3（軽） 文字として出した文をシェルに流す形（`… | bash`）を、どちらの hook も文字として扱う

`cat <<'X' | bash`（本文に `pkill -f next`）と `echo "pkill -f next" | bash` は kill の hook を通った。kill の hook が `| sh` を止めるのは、同じ文に名前やポートで探すコマンドがあるときだけで、シェル以外へのヒアドキュメントの本文と、先頭の語が `echo`・`cat` の区切りは読まないためである。pre-commit も、`cat <<'EOF' | bash`（本文に `git add . && git commit -m x`）は commit の語が無いとして none になる（`commit_files.py` に流して確かめた）。前の hook は文字の一致で見ていたので、pre-commit のこの形は前より弱い。どちらも、エージェントがよく打つ形ではない。

直すこと: 文の中に、標準入力を文として読むシェル（`reads_stdin_as_script` が真の区切り）があれば、kill の hook はヒアドキュメントの本文と一重引用符の中も読んで判定し、pre-commit は all にする。上の3つの形を、それぞれの試験に足す。

### 4（軽） `node -e "…"`・`python3 -c "…"` の二重引用符の中の `kill` を語として読まない

`node -e "require('child_process').execSync('lsof -ti:3000 | xargs kill')"` と `python3 -c "import os; os.system('kill $(lsof -t -i:3000)')"` は通った。二重引用符の中を1つの区切りとして読み、語を空白だけで分けるので、`'kill` や `os.system('kill` が `kill` と一致しないためである。後者の `$(lsof …)` は Bash が先に走らせるコマンド置換で、探すコマンドは文の中にある。エージェントがよく打つ形ではないので軽い。

直すこと: コードを走らせる前置き（`CODE_ARG_RE` が拾う `node -e`・`python -c` など）に渡す二重引用符の中身は、一重引用符のときと同じく、それ自体を文として読む。あるいは、方針の範囲の外として、上の2つを通ると知っている形として `cases.py` に残す。

### 5（軽） playwright-mcp.md の「入っているのは `/opt/pw-browsers/chromium` … だけ」が事実と違う

`/opt/pw-browsers` には、`chromium`（`chromium-1194/chrome-linux/chrome` へのリンク）と `chromium-1194` のほかに、`chromium_headless_shell-1194` と `ffmpeg-1011` がある（`ls -la` で確認）。この文は今回書き直した段落の頭にある。「入っているブラウザは Chromium 141（`chromium-1194`。`/opt/pw-browsers/chromium` はその本体へのリンク）と、そのヘッドレスの殻だけで、リポジトリの playwright が求める版は無い」の形に直す（求める版が無いことは、take.ts が代わりの Chromium で起動したことで確かめた）。

## 来訪者への効き方

hook とスキルは来訪者に直接は見えないが、並行する撮影と試験をほかの作業者が途中で壊すと、確かめの抜けた変更が出荷に近づく。名前やポートで探して止める形・`playwright install` が止まり、起こし方と止め方の文書がそのまま hook を通って実際に動くこと、pre-commit がほかの担当の書きかけのファイルで止めずに、自分のコミットのファイルを数秒で見ることは、design-rollout の残りのサイクルの並行作業を確かにする。ここは目的を果たしている。指摘1 は、cycle-316 で実際に起きた「ほかの作業者のサーバーを止める」道がまだ開いていることで、並行して撮る作業が増えるほど起きやすい。

## アンチパターンの当てはめ

- workflow.md AP-WF41（改稿で過去に指摘された型の欠陥を新しく入れる）: 指摘1。前回の指摘8 で頭の文を直したときに、試していない「止める対象」が入った。
- workflow.md AP-WF09（網羅の主張）: 指摘1 の頭の文は、hook が止める範囲を試した例より広く書いている。
- implementation.md AP-I02（個別ケースのハードコード）: 止める名前の表の足し方は表の漏れの直しとして妥当で、リダイレクトとシェルに渡す文の扱いは `shell_scan` の読み方で直っている。指摘3・4 も、読み方（標準入力を文として読むシェル・コードを走らせる前置きの二重引用符）で直す。
- workflow.md AP-WF12（事実の実体確認）: knowledge の事実は、指摘5 を除いてファイルと実測で合った。
- ツギハギ: 見当たらない。

## PM への依頼

指摘があるので、次のとおり進めてください。

1. builder に指摘1〜5 を直させてください（`process_kill_check.py`・`commit_files.py`・`shell_scan.py`・2つの hook・`docs/knowledge/playwright-mcp.md`）。直すときは、この文書の例を `builder-killhook/cases.py` と `precommit-test.sh` に足し、すべてが期待どおりに分かれることを示させてください。指摘1 で判定を足すか頭の文を直すかは、PM が方針に照らして決めてから指示してください。
2. 直したあと、もう一度レビューを依頼してください。そのときは、前回の指摘だけでなく、hook・スキル・knowledge の全体を見直す範囲にしてください。
