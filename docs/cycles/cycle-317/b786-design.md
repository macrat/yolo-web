# B-786 の設計: 担当ごとの作業ツリーと、コミットする人の決め方

根拠の行番号は b0681ac（ブランチ ccr-f5a32489-cmh8sa）のもの。

## 1. いまの形で衝突が起きる道

- **A. 他人の書きかけでコミット前の検査が止まる**: `.claude/hooks/pre-commit-check.sh`（`.claude/settings.json` 35-59 行の PreToolUse）は `.cwd` の木に cd してから `git status --porcelain` の全ファイルに prettier・eslint・残骸タグ・frontmatter の検査を掛ける（pre-commit-check.sh 22-23・41 行）。同じ木の別の builder の書きかけも対象になる（cycle-316/decisions.md 65・116 行）。
- **B. push 前の検査が他人の書きかけで落ちる**: `pre-push-check.sh` は `.cwd` の木（19-20 行）の全体に format:check・lint・typecheck・test・build を掛ける。`next build` は並行する `next build` と `.next/lock` を取り合い、`next dev` は同じ木の2つ目を `.next/dev/lock` で止める（`docs/knowledge/playwright-mcp.md` 93・118 行）。
- **C. 他人の変更が自分のコミットに入る**: index が木に1つなので `git add -A`・`git add .` が他人の変更を拾う（decisions.md 236 行。cycle-312 の PM の `git add -A`）。AP-WF50 は事後の問いにすぎない。`cycle-completion` の手順7（68・76 行）は「すべての変更を…コミット」「すべてのファイルをコミット」と書き、`git add .` を示す。
- **D. 名前で探して他人のプロセスを止める**: `pkill -f` で他の builder の vitest と自分のシェルを止めた（decisions.md 115 行）。共有の木では cwd も名前も同じで見分けられない（playwright-mcp.md 109 行）。共有の scratchpad の `server.pid` の取り違え（同 82 行）。
- **E. 依頼側に決まりが無い**: `.claude/agents/` には `blog-writer.md` と `reviewer.md` だけがあり、builder の定義が無い。`.claude/rules/worktrees.md` は並行する担当を扱わない。

## 2. 決めた形

書く担当は Agent の `isolation: "worktree"` で起こし、担当の木（`.claude/worktrees/agent-<id>`、枝 `worktree-agent-<id>`）で書いてコミットする。主の木では PM だけがコミットと push をする。決まりは「担当の木では担当がコミットし、主の木では PM だけがコミットと push をする」の一文になる。

担当の木でこの形が効く根拠（実測）:

- 担当の Bash の cwd は担当の木に留まる。PostToolUse の整形は担当の木で Edit・Write したファイルに効き、`.claude/rules/` の paths（coding-rules.md・testing.md など）も担当の木のファイルに当たる。
- pre-commit-check.sh は、`.cwd` が担当の木なら担当の木を検査する。担当の木に整形の崩れた `src/__probe.ts` をシェルで置き、`.cwd` をその木にした `git commit` の入力を hook に渡すと、prettier の検査で rc=2 で止まった。同じ時点で `.cwd` を主の木にすると rc=0 で通った（主の木は担当の木の書きかけを見ない）。よって hook は変えない。
- 主の木の検査は `tmp/` を拾わない（eslint.config.mjs 27 行の `globalIgnores`、tsconfig.json 34 行の `exclude`、vitest.config.mts 25 行の `exclude`、prettier は `.gitignore` の `tmp/*`）。`.claude/worktrees/` は拾う。主の木の `git status --porcelain` に `?? .claude/worktrees/` が出るので、`git add .` が担当の木を入れうる。下の第3節で除外を足す。

手順:

1. **起こす前**: PM は主の木の変更をすべてコミットする（`git status --short` が何も出さない）。未コミットの変更は担当の木に入らない。
2. **起点を揃える**: `isolation: "worktree"` の起点は main の先頭で、作業ブランチの HEAD ではない（実測。main の先頭 4e98a53 は作業ブランチ b0681ac の祖先）。担当は最初に `git merge --ff-only <作業ブランチ>` で起点を作業ブランチの HEAD に進める。依頼に作業ブランチの名前と HEAD を書き、担当は進めたあと `git rev-parse HEAD` が一致することを確かめる。
3. **依存を置く**: 担当の木には `node_modules` と `.next` が無い。担当は `cp -al <主の木>/node_modules ./node_modules` でハードリンクの写しを置く。`npm ci` は1つにつき 954MB の場所と数分を使い、並行する担当の数だけ増える（ディスクの空き 28GB）。symlink は Turbopack が拒む（playwright-mcp.md 118 行）。ハードリンクは中身を主の木と分け合うので、担当の木では依存を変えない（`npm install` を打たない）。依存を変える仕事は主の木で1つだけ走らせ、並行させない。`.next` は写さず、要る担当が自分の木で作る。
4. **書いてコミットする**: 担当は自分の木の変更だけをコミットする。push しない。終わったら枝の名前と HEAD を PM に返す。
5. **読む**: reviewer は主の木で動き、担当の木のパスと `git diff <作業ブランチ>...<担当の枝>` を読む。主の木のファイルは取り込みまで古いので、担当の変更の確かめに使わない。試験やビルドを担当の木で走らせるときは `cd <担当の木> && npm run <名前>` と1つのコマンドに書く。レビューの記録は主の木の `docs/cycles/<サイクル>/` に書き、PM がコミットする。
6. **撮る**: スクリーンショットは、担当の木で `setsid` で起こし、依頼に書いたポート（`PORT`）で待つサーバーだけを撮る。撮る前に `ls -l /proc/<PID>/cwd` が担当の木を指すことを確かめる。
7. **取り込む**: PM が主の木で `git merge <担当の枝>`（進められるなら fast-forward、並ぶ担当の2つ目からはマージのコミット）でする。`git cherry-pick` とファイルの写しは使わない。cherry-pick では担当の枝が作業ブランチの祖先にならず、`git branch -d` が拒み、`-D` は block-destructive-git.sh（137-138 行）が止める。衝突したら PM が担当に、担当の木で作業ブランチを取り込み直して解くよう頼む。
8. **消す**: 取り込んだら `git worktree remove <担当の木>` と `git branch -d <担当の枝>`。取り込まないと決めた変更は、担当がその枝で `git revert` してから取り込む。枝は作業ブランチの祖先になり、`-d` で消せ、主の木の中身は変わらない。

## 3. 変えるもの

- `.claude/agents/builder.md`（新規）と `.claude/agents/blog-writer.md`: 書く担当はこの2つで、同じ決まりを入れる。第2節の手順2〜4（起点を `--ff-only` で揃えて確かめる・`cp -al` で依存を置く・自分の木だけを書いてコミットする）。主の木と他の木に触らない。依存を変えない。プロセスは自分が `setsid` で起こした PGID だけを止め、サーバーは自分の木から依頼のポートで起こす（playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」を指す）。push しない。枝の名前と HEAD を返す。
- `.claude/agents/reviewer.md`: tools に `Write(/docs/cycles/**)` を足し、記録を新しいファイルとして書けるようにする。本文に第2節の手順5・6（担当の木のパスと `git diff <作業ブランチ>...<担当の枝>` を読む、`cd <担当の木> && npm run …` の形、見るサーバーの cwd を確かめる）と、書くのはレビューの記録1本で、コミットしないことを書く。
- `.claude/rules/worktrees.md`: paths は `.claude/worktrees/**` のまま。本文を第2節の手順2〜4・8の担当の側（起点を揃える・依存を置く・自分の木だけをコミットする・push しない・取り込みはマージで PM がする・ファイルを主の木に写さない）に書き直す。
- `.claude/rules/` の常時読まれる規則（PM の依頼の決まり）: 書く担当は必ず `isolation: "worktree"` で起こし、依頼に作業ブランチの名前と HEAD・ポートを書く。起こす前に主の木をコミット済みにする。並行させるのは触るファイルが重ならない担当だけ。依存を変える仕事は主の木で1つだけ。取り込みと消し方は第2節の手順7・8。reviewer とスクリーンショットの担当には、見る木のパス・枝・ポートを書く。主の木では PM 以外にコミットさせない。
- `.gitignore` に `.claude/worktrees/`、eslint.config.mjs の `globalIgnores`・tsconfig.json の `exclude`・vitest.config.mts の `exclude` に `.claude/worktrees/**` を足す。主の木の `git add .`・format:check・lint・typecheck・test が担当の木を拾わない。
- `docs/knowledge/playwright-mcp.md`: 結論に合わせて関わる節を一貫した形で書き直す。93 行の「`git worktree add` で取り出した木で起こし、自分の変更を patch で当てる」は、担当の木で書く担当には要らず、主の木で読む担当がコミット済みの中身を起こすときの手順に範囲を絞る。118 行の `cp -al` は、担当の木の依存の置き方と同じ知見として残し、ハードリンクの写しでは依存を変えない、を足す。109 行の見分け方は、担当の木では `/proc/<PID>/cwd` で見分けられる、を主に書き直す。
- `cycle-kickoff` の手順7: 書く担当は担当の木で起こし、コミットと push は主の木で PM、を1文で。
- `cycle-completion` の手順7: 本文を書き直す。「すべての変更を…コミットしてプッシュ」の前に、動いている担当が無い・担当の枝が全部取り込まれている・`git worktree list` に主の木しか無い（あれば第2節の手順7・8で取り込むか消す）を確かめる文を置く。担当の木は `.gitignore` で外れるので、`git add .` と「すべてのファイルをコミット」は主の木の変更だけを載せ、そのまま正しい。点検の文と同じ節に収める。
- `docs/anti-patterns/workflow.md` AP-WF50: 問いを、主の木で PM が取り込むときの「取り込む枝のコミットが依頼した担当のものだけか」と、担当がコミットするときの「自分の木の、依頼された変更だけか」に書き直す。
- hook（`pre-commit-check.sh`・`pre-push-check.sh`）は変えない（第2節の実測。decisions.md 227・231・267 行と整合）。

## 4. 残る危険

1. 起点を揃えずに書くと、main の先頭の古いコードの上で書く。担当の最初の手順で `rev-parse` を確かめて担保する。
2. 依存の用意を省いた木では hook の `npx prettier`/`eslint`/`tsx` が失敗する。担当の最初の手順の `cp -al` で担保する。
3. ハードリンクの写しで担当が依存を書き換えると主の木と他の木も変わる。担当の木で依存を変えない決まりで担保する。
4. 取り込みの衝突。触るファイルの重なりで並行を決めて減らす。
5. コンテナは共有なので、ポート・CPU・メモリ・ディスクの取り合いと、`pkill -f` を打てば他人を止める害は残る。builder.md・blog-writer.md の決まりで担保する。
6. Playwright の MCP は木と無関係に1つで foreground でしか動かない。依頼に木とポートを書き、撮る前に cwd を確かめる決まりで担保する。
7. `isolation: "worktree"` の自動の片付けは変更の無い木だけ。取り込んだ木と枝の消し忘れは、完了の処理の手順7の点検で拾う。
