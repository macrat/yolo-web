# B-786 の設計: 担当ごとの作業ツリーと、コミットする人の決め方

根拠の行番号は b0681ac（ブランチ ccr-f5a32489-cmh8sa）のもの。

## 1. いまの形で衝突が起きる道

- **A. 他人の書きかけでコミット前の検査が止まる**: `.claude/hooks/pre-commit-check.sh`（`.claude/settings.json` 35-59 行の PreToolUse）は `.cwd` の木に cd してから `git status --porcelain` の全ファイルに prettier・eslint・残骸タグ・frontmatter の検査を掛ける（pre-commit-check.sh 22-23・41 行）。同じ木の別の builder の書きかけも対象になる（cycle-316/decisions.md 65・116 行）。
- **B. push 前の検査が他人の書きかけで落ちる**: `pre-push-check.sh` は `.cwd` の木（19-20 行）の全体に format:check・lint・typecheck・test・build を掛ける。`next dev` は同じディレクトリの2つ目を `.next/dev/lock` で、`next build` は2つ目を `.next/lock` で止める（`docs/knowledge/playwright-mcp.md` 93 行）。同じ木の `.next` をほかの担当がビルドし直すと、起動中のサーバーが `ChunkLoadError` を出す（同 118 行）。
- **C. 他人の変更が自分のコミットに入る**: index が木に1つなので `git add -A`・`git add .` が他人の変更を拾う（decisions.md 236 行。cycle-312 の PM の `git add -A`）。AP-WF50 は事後の問いにすぎない。`cycle-completion` の手順7（68・76 行）は「すべての変更を…コミット」「すべてのファイルをコミット」と書き、`git add .` を示す。
- **D. 名前で探して他人のプロセスを止める**: `pkill -f` で他の builder の vitest と自分のシェルを止めた（decisions.md 115 行）。共有の scratchpad で同じ名前の `server.pid` を使い、上書きされたファイルでほかの作業者のサーバーを止めた（decisions.md 117 行）。共有の木で起こしたサーバーは cwd もプロセスの名前も同じで見分けられない（playwright-mcp.md 109 行）。
- **E. 依頼側に決まりが無い**: `.claude/agents/` には `blog-writer.md` と `reviewer.md` だけがあり、builder の定義が無い。`.claude/rules/worktrees.md` は並行する担当を扱わない。

## 2. 決めた形

コミットに入るファイルを書く担当（builder・blog-writer、ほかに同じ仕事を頼む担当があればそれも）は、Agent の `isolation: "worktree"` で起こし、担当の木（`.claude/worktrees/agent-<id>`、枝 `worktree-agent-<id>`）で書いてコミットする。主の木では PM だけがコミットと push をする。`docs/cycles/` の記録だけを書く担当（reviewer・調べものなど）は木を作らず主の木で書き、PM がコミットする。決まりは「担当の木では担当がコミットし、主の木では PM だけがコミットと push をする」の一文になる。

担当の木でこの形が効く根拠（実測）:

- 担当の Bash の cwd は担当の木に留まる。PostToolUse の整形は担当の木で Edit・Write したファイルに効き、`.claude/rules/` の paths（coding-rules.md・testing.md など）も担当の木のファイルに当たる。
- 担当の木で担当が打った `git commit` では、pre-commit-check.sh の `.cwd` が担当の木になり、その木を検査する。担当の木に eslint の error（`@ts-ignore` と `as any`）を含む `src/__probe2.ts` を Write で作って `git commit` を打つと、hook が「ESLint check failed」で止め、出力のパスは担当の木（`.claude/worktrees/agent-<id>/src/__probe2.ts`）だった。よって hook は変えない（decisions.md 227・231・267 行と整合）。hook が eslint の warning では止めないのは、主の木でも同じ。
- 主の木の検査は `tmp/` を拾わない（eslint.config.mjs 27 行の `globalIgnores`、tsconfig.json 34 行の `exclude`、vitest.config.mts 25 行の `exclude`、prettier は `.gitignore` 30 行の `tmp/*`）。`.claude/worktrees/` は拾う。主の木の `git status --porcelain` に `?? .claude/worktrees/` が出るので、`git add .` が担当の木を入れ、pre-commit-check.sh が担当の木を検査しうる。第3節で除外を足す。

手順:

1. **起こす前**: 担当に渡す中身がコミット済みであるように、PM は担当が読む・前提にする変更を主の木でコミットしておく。未コミットの変更は担当の木に入らない。並行して reviewer が主の木に書いている記録は、担当に渡す中身でなければ残っていてよい。
2. **起点を揃える**: `isolation: "worktree"` の起点は main の先頭で、作業ブランチの HEAD ではない（実測。main の先頭 4e98a53 は作業ブランチ b0681ac の祖先）。担当は最初に `git merge --ff-only <作業ブランチ>` で起点を作業ブランチの HEAD に進める。依頼に作業ブランチの名前と HEAD を書き、担当は進めたあと `git rev-parse HEAD` が一致することを確かめる。
3. **依存を置く**: 担当の木には `node_modules` と `.next` が無い。担当は `cp -al <主の木>/node_modules ./node_modules` でハードリンクの写しを置く。`npm ci` は1つにつき 954MB の場所と数分を使い、並行する担当の数だけ増える（ディスクの空き 28GB）。symlink は Turbopack が拒む（playwright-mcp.md 118 行）。ハードリンクは中身を主の木と他の木と分け合うので、担当の木では `node_modules` の下を書き換えない（`npm install` を打たない、パッケージのファイルを手で直さない、その場で書き換える道具を走らせない）。依存を変える仕事は主の木で1つだけ走らせ、並行させない。`.next` は写さず、要る担当が自分の木で作る。
4. **書いてコミットする**: 担当は自分の木の、依頼された変更だけをコミットする。push しない。試しのためのコミットを担当の木に作らない（枝は必ず作業ブランチへ取り込むので、試しは主の作業ブランチの歴史に残る）。終わったら枝の名前と HEAD を PM に返す。
5. **読む**: reviewer は主の木で動き、担当の木のパスと `git diff <作業ブランチ>...<担当の枝>` を読む。主の木のファイルは取り込みまで古いので、担当の変更の確かめに使わない。試験やビルドを担当の木で走らせるときは `cd <担当の木> && npm run <名前>` と1つのコマンドに書く。レビューの記録は主の木の `docs/cycles/<サイクル>/` に書き、PM がコミットする。
6. **撮る**: スクリーンショットは、担当の木で `setsid` で起こし、依頼に書いたポート（`PORT`）で待つサーバーだけを撮る。撮る前に `ls -l /proc/<PID>/cwd` が担当の木を指すことを確かめる。
7. **取り込む**: PM が主の木で `git merge <担当の枝>`（進められるなら fast-forward、並ぶ担当の2つ目からはマージのコミット）でする。`git cherry-pick` とファイルの写しは使わない。cherry-pick では担当の枝が作業ブランチの祖先にならず、`git branch -d` が拒み、`-D` は block-destructive-git.sh（137-138 行）が止める。衝突したら PM が担当に、担当の木で作業ブランチを取り込み直して解くよう頼む。
8. **消す**: 取り込んだら `git worktree remove <担当の木>` と `git branch -d <担当の枝>`。
   - 取り込む枝の採らないコミットは、担当がその枝で `git revert` してから取り込む。
   - 取り込まない枝は `git worktree remove` で木だけを消し、枝はローカルに残す。担当の枝は push しないのでコンテナと一緒に消え、残っても害は無い。`-D` の止めは回り道しない（`git branch --delete --force`・`git update-ref -d` を使わない）。
9. **push**: push するのは PM が主の木の作業ブランチだけで、担当の枝は origin に push しない。

## 3. 変えるもの

- `.claude/agents/builder.md`（新規）と `.claude/agents/blog-writer.md`: 第2節の手順2〜4（起点を `--ff-only` で揃えて確かめる・`cp -al` で依存を置き `node_modules` の下を書き換えない・自分の木の依頼された変更だけをコミットし、試しのコミットを作らない）。主の木と他の木に触らない。プロセスは自分が `setsid` で起こした PGID だけを止め、サーバーは自分の木から依頼のポートで起こす（playwright-mcp.md の「バックグラウンドのプロセスを起こして止める」を指す）。push しない。枝の名前と HEAD を返す。
- `.claude/agents/reviewer.md`: tools に `Write(/docs/cycles/**)` を足し、記録を新しいファイルとして書けるようにする。本文に第2節の手順5・6と、書くのはレビューの記録1本で、コミットしないことを書く。
- `.claude/rules/worktrees.md`: paths は `.claude/worktrees/**` のまま。本文を第2節の手順2〜4・8の担当の側（起点を揃える・依存を置き書き換えない・自分の木だけをコミットする・push しない・取り込みはマージで PM がする・ファイルを主の木に写さない・採らないコミットは revert する）に書き直す。
- `.claude/rules/` の常時読まれる規則（PM の依頼の決まり）: コミットに入るファイルを書く担当は必ず `isolation: "worktree"` で起こし、依頼に作業ブランチの名前と HEAD・ポートを書く。`docs/cycles/` の記録だけを書く担当は主の木で書かせる。手順1のとおり渡す中身をコミット済みにしてから起こす。並行させるのは触るファイルが重ならない担当だけ。依存を変える仕事は主の木で1つだけ。取り込みと消し方は第2節の手順7・8。push するのは作業ブランチだけで、担当の枝は push しない。reviewer とスクリーンショットの担当には、見る木のパス・枝・ポートを書く。主の木では PM 以外にコミットさせない。
- `.gitignore` に `.claude/worktrees/`、eslint.config.mjs の `globalIgnores`・tsconfig.json の `exclude`・vitest.config.mts の `exclude` に `.claude/worktrees/**` を足す。主の木の `git add .`・pre-commit-check.sh・format:check・lint・typecheck・test が担当の木を拾わない。prettier は `.gitignore` を読むので、prettier には別の設定は要らない。この追加は、担当を `isolation: "worktree"` で起こす最初の時点より前にコミットする。それより前に担当の木があると、主の木の `git status --porcelain` に `?? .claude/worktrees/` が出て、PM のコミット前の検査が担当の木を丸ごと prettier・eslint に掛ける（第1節 A と同じ道）。B-784 が pre-commit-check.sh に入れる `-uall`（b784-design.md）は、この追加と同じコミットかそのあとに入れる。
- `docs/knowledge/playwright-mcp.md`: 結論に合わせて、関わる3か所を一貫した形で書き直す。
  - 93 行の「止めずに、自分で取り出した別のディレクトリ（`git worktree add` で取り出した木）で起こすか…」と、続く「`git diff HEAD -- <自分のパス> > "$DIR/mine.patch"` … `git -C <木> apply "$DIR/mine.patch"` で木に当ててから起こす」は、共有の木で書いた未コミットの変更を別の木へ運ぶ手順で、担当の木で書く担当には要らない。担当の木では自分の木でそのまま起こす、を主に書き直し、patch の手順は消す（主の木で書く担当はサーバーを起こす仕事を受けない）。
  - 109 行の「共有の作業ツリーで起こしたサーバーは…cwd もプロセスの名前（`next-server`）も同じなので、それでは見分けられない」は、担当の木で起こしたものは `ls -l /proc/<PID>/cwd` がその木を指すことで見分ける、を主に書き直す。
  - 118 行の「確かめるコミットを `git worktree add` で別に取り出し、そこでビルドして起動する。worktree の `node_modules` はシンボリックリンクにすると Turbopack が拒むので、`cp -al` でハードリンクの写しを置く」は、担当の木の依存の置き方と同じ知見として残し、ハードリンクの写しでは `node_modules` の下を書き換えない、を足す。担当の木で書く形では `.next` をほかの担当とは分けるので、同じ行の `ChunkLoadError` の記述は共有の木で動くときの事実として残す。
- `cycle-kickoff` の手順7: コミットに入るファイルを書く担当は担当の木で起こし、コミットと push は主の木で PM、を1文で。
- `cycle-completion` の手順7: 本文を書き直す。「すべての変更を…コミットしてプッシュ」の前に、動いている担当が無い・取り込むと決めた枝が全部取り込まれている・`git worktree list` に主の木しか無い（あれば第2節の手順7・8で取り込むか木を消す）を確かめる文と、push するのは作業ブランチだけ、を置く。担当の木は `.gitignore` で外れるので、`git add .` と「すべてのファイルをコミット」は主の木の変更だけを載せ、そのまま正しい。点検の文と同じ節に収める。
- `docs/anti-patterns/workflow.md` AP-WF50: 問いを、主の木で PM が取り込むときの「取り込む枝のコミットが依頼した担当のものだけか」と、担当がコミットするときの「自分の木の、依頼された変更だけか」に書き直す。
- hook（`pre-commit-check.sh`・`pre-push-check.sh`・`block-destructive-git.sh`）は変えない。

## 4. 残る危険

1. 起点を揃えずに書くと、main の先頭の古いコードの上で書く。担当の最初の手順で `rev-parse` を確かめて担保する。
2. 依存の用意を省いた木では hook の `npx prettier`/`eslint`/`tsx` が失敗する。担当の最初の手順の `cp -al` で担保する。
3. ハードリンクの写しで `node_modules` の下を書き換えると主の木と他の木も変わる。担当の木で書き換えない決まりで担保する。
4. 取り込みの衝突。触るファイルの重なりで並行を決めて減らす。
5. コンテナは共有なので、ポート・CPU・メモリ・ディスクの取り合いと、`pkill -f` を打てば他人を止める害は残る。builder.md・blog-writer.md の決まりで担保する。
6. Playwright の MCP は木と無関係に1つで foreground でしか動かない。依頼に木とポートを書き、撮る前に cwd を確かめる決まりで担保する。
7. `isolation: "worktree"` の自動の片付けは変更の無い木だけ。取り込んだ木と枝の消し忘れは、完了の処理の手順7の点検で拾う。取り込まない枝はローカルに残るが、push しないので害は無い。
