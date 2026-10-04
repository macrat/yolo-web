# B-786 の設計のレビュー（第2回）

対象: [b786-design.md](./b786-design.md) 第2稿（担当の木を `tmp/wt/<担当>` に PM が作る案）。判定: 要修正（critical 2・major 3・minor 2）。reviewer の報告を PM が写した。第1回の7件は手当て済み。

## 指摘

1. critical: サブエージェントの Bash は呼ぶたびに cwd が主の木へ戻り、Agent ツールに cwd を渡す引数も無い。担当が `cd tmp/wt/<担当> && git commit` を打っても hook の `.cwd` は主の木で、主の木がコミット済みなら pre-commit-check.sh（22-23・41-44 行）は何も検査せずに通す。「hook を変えずに A・B・C が消える」は成り立たない。
2. critical: PostToolUse の整形（`npx prettier --write`）は主の木の cwd で動き、`.gitignore` の `tmp/*` で tmp/ の下を無視する（reviewer が実測: 書き換わらず `--check` も rc=0）。eslint も `globalIgnores` の `tmp/**`（eslint.config.mjs 27 行）で外れる。
3. major: `.claude/rules/` の paths はプロジェクトの根からの相対で、`tmp/wt/<担当>/src/...` には coding-rules.md・testing.md・blog-writing.md などが当たらず、代わりに tmp-directory.md（コミットされない場所）と file-editing.md の「`./tmp/` はシェルで書いてよい」が当たる。
4. major: 2つ目からの担当を `git cherry-pick` で取り込むと担当の枝は作業ブランチの祖先にならず、`git branch -d` は拒み、`-D` は block-destructive-git.sh（137-138 行）が止める。
5. major: reviewer.md の tools に Write が無く、設計の「記録を1本書く」と食い違う。reviewer が担当の木で `npm run` を打つときの cwd も未決。
6. minor: 主の木の format:check・lint・typecheck・test は tsconfig・vitest・eslint・prettier の除外で tmp/ を拾わない（問題なし。根拠として書くとよい）。
7. minor: playwright-mcp.md の書き直しの範囲は、上の結論が決まってから全体を一貫した形で書く。

アンチパターン: 1・2 は前提（hook が木の境で効く）を実測せずに案の採否の根拠にした（planning.md の検証していない前提）。

## PM の実測（2026-10-04）

`isolation: "worktree"` で担当を起こし、担当の木で次を行った。

- pwd は `.claude/worktrees/agent-<id>`。Bash の cwd は担当の木に留まる。
- `git merge --ff-only ccr-f5a32489-cmh8sa` で起点を作業ブランチの HEAD（b0681ac）に進められた（main の先頭 4e98a53 は作業ブランチの祖先）。
- `cp -al /home/user/yolo-web/node_modules ./node_modules` が通った。
- Write した `src/__probe.ts`（`const a={b:1}`）は PostToolUse の整形で `const a = { b: 1 };` になり、そのとき testing.md・coding-rules.md が読み込まれた。Edit でも整形が効いた。
- 担当の木での `git commit` は通った（pre-commit の検査がその木を見たかは、出力に表れないので確かめていない）。
- 変更の残る木は `git worktree remove --force` で消せたが、コミットのある枝 `worktree-agent-a52d271328a2c0c7f` は `git branch -d` が「not fully merged」で拒んだ（指摘4を裏づける）。この枝はローカルにだけ残っている。

## PM の対応

担当の木は `isolation: "worktree"`（`.claude/worktrees/` の下）に戻し、起こした直後に担当が作業ブランチを `--ff-only` で取り込む形にする。指摘1〜3はこれで解ける見込みで、pre-commit の検査が担当の木で効くかは設計の段で実測する。4・5・7 は設計で決める。
