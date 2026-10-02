# review-ap-fixes 7巡目（hook・take-screenshot・knowledge）

判定: **改善指示（要修正）**

レビュアーの環境では Write が無効で新しいファイルを作れなかったため、PM がレビュアーの報告の本文をそのまま写した。

前回の2つの指摘は直っています。

- nextjs.md の 1 は、2つの節「本番ビルドの実機検証の段取り」「バックグラウンドのプロセスを起こして止める」を指す文になりました。
- xargs・watch・strace の後ろの pkill に、「一重引用符で囲むと通ります」の案内が出なくなりました。hint_cases は 11 から 15 に増えています。

kill の hook は、役割の範囲で止めるべき形をすべて止め、通すべき形をすべて通しました。

## 指摘（重さの順）

1. **（中）git commit を知らないコマンドの引数として走らせると、pre-commit が何も検査しない。直す前の hook より弱くなっています。**
   - 一時のリポジトリで、ステージした a.md と作業ツリーの b.md の整形を崩して試しました。次の形はどれも `none` で通ります（rc=0）。直す前の hook なら、どれも全ファイルを見て止めます。
     - `script -qc "git commit -m x" /dev/null`
     - `su -c "git commit -m x"`
     - `flock .lock -c "git commit -m x"`
     - 上と同じものを一重引用符で囲んだ形
   - 原因: commit_files.py は、二重引用符の中の `git commit -m x` を script の1つの引数として読みます。そのため git_subcommand が git を見つけず、result が None のまま `none` を返します。一重引用符の形は、mentions_commit が中身を外すので `none` になります。
   - 直し方: commit の語がありながら git commit／commit-tree を走らせると読めなかった文は、`all` にします。ただし grep・rg・echo・gh など、文字を読み書きするだけのコマンドの引数にある場合は、いまどおり `none` のままにします。
   - 試験: precommit_cases.sh に上の形を足します。あわせて、`grep 'git commit'`・`echo "git commit"`・gh の本文の heredoc がいまどおり `none` になることも確かめるようにします。

2. **（中）take-screenshot SKILL.md の「取り忘れ時の復旧フロー」が、同じ作業ツリーで `git stash` を打たせる。**
   - `git stash` は、ほかの担当の書きかけの変更まで作業ツリーから退けます。その担当の next dev は退けたあとの木を配り、`git stash pop` で戻すときに、そのあいだに書かれた変更と衝突しえます。
   - 直し方: commit の前なら `HEAD`、commit のあとなら kickoff のコミットを `git worktree add` で取り出して撮る形にそろえ、stash の段取りを消します。

3. **（中）「`git worktree add` で取り出した自分の木で起こす」の文に、コミットしていない自分の変更が入らないことが書かれていない。**
   - 該当する文は、SKILL.md の「next dev が2つ目を起こさない」ときの段落と、playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」の4です。
   - コミットする前に変更を撮る builder やレビュアーがこのとおりにすると、変更の入っていない画面を黙って撮ってしまいます。
   - 直し方: 取り出した木はコミットの中身だけであることを書き、自分の変更を撮る方法も書きます。方法（木に変更を写すか、同じ作業ツリーを配っているほかの作業者のサーバーを、止めずにそのポートで撮るか、など）は書き手が決めます。

4. **（小）nextjs.md の 11 の「予防」が、条件なしに `.next` を消させる。**
   - 「予防」は `rm -rf .next/dev` と `rm -rf .next` を条件なしに書いています。「対処」のほうは、自分のサーバーかどうかで分けています。
   - ほかの作業者のサーバーが同じ木の `.next` を使っていると、そのサーバーが壊れ、lock も消えます（推論で、実測はしていません）。
   - 直し方: 「対処」と同じ条件を「予防」にもそろえます。

5. **（小）take.ts で `--out` のすぐ後ろに別のフラグを書くと、そのフラグの名前のディレクトリに書き出す。**
   - `take.ts <URL> --out --dark` は、`--dark` という名前のディレクトリに書き出します。`--selector` も同じ作りです。
   - 直し方: 値が `--` で始まるときは、エラーで止めます。

## 確かめたこと（実測）

- **hook の試験**: `bash .claude/hooks/tests/run.sh` はすべて合格しました。
  - kill の hook は、止める 206・通す 169 で食い違い 0、1回の判定は最大 81ms。
  - 案内の試験 15、pre-commit 112、判定の失敗 2 も合格しました。
  - 全体で 83 秒。走らせる前後で /tmp の一覧と \_\_pycache\_\_ は変わらず、一時のファイルは残りませんでした。
- **ほかの検査**: 対象のファイルは prettier、eslint（take.ts・validate-blog-frontmatter.ts）、`bash -n` を通りました。
- **kill の hook（わたしの例、約 110）**: 取りこぼしも誤検知も 0 でした。
  - 止めたもの: ss・netstat・pidof で探す形、`kill $$`、`kill -s KILL -1`、`npx @playwright/test install`、`npm exec -- playwright install` など。
  - 通したもの: split-plan.md 6 の手順0〜5 と cycle-completion の手順7 のコマンド、文書に書いた起こし方・止め方・確かめ方、`kill -0`、`kill -KILL -- -"$(cat …pgid)"`、heredoc や gh の本文に書いた語など。
  - 判定にかかる時間は、関係する語の無い文で 9〜13ms、ある文で 38〜66ms でした。
- **文書の起こし方と止め方を実際に流す**: 自分の scratchpad で setsid のグループを起こしました。`$!` はすぐ終わり、PGID のプロセスの PPID は 1 でした。止めた直後の数は 1、2 秒おいて 0 で、文書の記述どおりです。止めたのは自分のグループだけです。
- **pre-commit**: 次はどれも期待どおりでした。抜けたのは指摘1の形だけです。
  - ステージした中身の検査（I）と、.prettierignore に入れたパスの扱い。
  - ほかの担当の崩れたファイルがあるときの `git add mine.md && git commit`（通す）。
  - `-am`・`git add .`・`for` の形（止める）。
  - `-F-`・`--amend`・`--fixup`・`-o`・`--`・commit-tree など。
  - 速さは、1ファイルのコミットで 0.7 秒、commit_files.py が 76ms でした。
- **take.ts**: `--out` を付けると scratchpad に6枚を書き出し、tmp/screenshots の数は変わりませんでした。
- **knowledge の事実**: 次は文書の記述と合いました。
  - package.json の scripts、tsconfig.json の include、next-env.d.ts の import。
  - TypeScript 6.0.3 でも、skipLibCheck の設定なら `.next` を消して typecheck が通ること。
  - bundle-budget の飛ばし方、incident-1.md の記録、BigQuery の 2026-03-28。
  - 古い段取り（pkill・killall・kill-port・`fuser -k`・`lsof -ti`・`npm run dev &`・`npx next start`）は、対象の文書と .claude・docs/knowledge・docs/anti-patterns に残っていませんでした（`git stash` は指摘2）。

## 範囲の外（記録だけ）

- 共有の場所の pid ファイルを使う形（`kill -9 $(cat /tmp/next.pid)`・`xargs kill < pids.txt`・`bash /tmp/s.sh`）は通ります。knowledge の専用のディレクトリの決まりで防ぐ範囲です。
- `GIT_INDEX_FILE=… git commit` は、既定の索引を見て `files` になります。直す前の hook も同じでした。
- `eval "$(echo 'git commit -m x')"` のように、コミットのコマンドを出力として組み立てる形は `none` になります。わざと隠す形に近いので、記録だけにします。指摘1を直すときに一緒に `all` へ倒せるなら、そのほうがよいです。

## 参考（指摘ではない）

- ふだんの hook は `PYTHONDONTWRITEBYTECODE` を付けずに走るので、`.claude/hooks/lib/__pycache__` に .pyc ができます。.gitignore で外れるのでコミットには入りません。`python3 -B` にすれば作られません。
- ai-agent-communication.md の新しい節「サブエージェントの起動の形」の下に、前からある Bash の `run_in_background` の項が入りました。話は違いますが、読み誤りは起きにくいです。

## PM への指示

1. builder に、指摘1〜5を直させてください。1・5 はコード、2〜4 はスキルと knowledge です。
2. 直したら、もう一度レビューを頼んでください。そのときは前回の指摘だけでなく、全体の見直しも範囲に含めてください。
