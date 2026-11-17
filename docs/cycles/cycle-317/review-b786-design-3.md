# B-786 の設計のレビュー（第3回）

対象: [b786-design.md](./b786-design.md) 第3稿（`isolation: "worktree"`＋`--ff-only` で起点を揃える案）。判定: 要修正（major 2・minor 4）。reviewer の報告を PM が写した。第2回の1〜5・7は手当て済み。

## 指摘

1. major: 担当の木で本物の `git commit` を打ったときに pre-commit の検査がその木を見ることを、模した hook の入力でしか確かめていない。結果が出るまで「hook は変えない」を決めない（planning.md の検証していない前提）。
2. major: 第3節の playwright-mcp.md「93 行の『`git worktree add` で取り出した木で起こし、自分の変更を patch で当てる』」は誤り。93 行は `next dev` の `.next/dev/lock` の項で、`git worktree add` は 118 行にあり、「patch で当てる」の文言は無い。
3. minor: 「書く担当」の範囲が曖昧。planner・researcher の定義が無く、計画の文書をどの木に書くかが決まっていない。「コミットに入るファイルを書く担当すべて」と定め、docs/cycles の記録だけを書く担当は主の木で書いて PM がコミットする、と書き分ける。
4. minor: 手順1（担当を起こす前に主の木をコミット済み）と手順5（reviewer が並行して主の木に記録を書く）がかみ合わない。手順1の目的は「担当に渡す中身がコミット済みであること」と書く。
5. minor: 第1節 D の「同 82 行」は直前の decisions.md と読み違える。82 行は作業者ごとの専用のディレクトリの決まりで、取り違えの記録ではない。出典をはっきり書く。
6. minor: `cp -al` の写しは、`npm install` 以外でも node_modules の下をその場で書き換えると主の木と他の木に及ぶ。決まりを「node_modules の下を書き換えない」に広げる。

## PM の実測（指摘1）

`isolation: "worktree"` の担当に、担当の木で `src/__probe2.ts` を Write で作らせて、`git commit` を単独で打たせた。

- `no-unused-vars`（eslint の warning）だけのときはコミットが通った（`dcfddcb`）。hook は eslint の warning では止めないので、これでは決着しない。
- `@ts-ignore` と `as any`（eslint の error 2件）にすると、`pre-commit-check.sh` が「ESLint check failed」で止め、出力のパスは担当の木（`.claude/worktrees/agent-ae170970c57f79e1e/src/__probe2.ts`）だった。担当の木で打ったコミットでは、hook の `.cwd` が担当の木になり、その木を検査する。

担当の木は `git worktree remove --force` で消した。実測でできた枝 `worktree-agent-a52d271328a2c0c7f`・`worktree-agent-ae170970c57f79e1e` は probe のコミットを持ち、ローカルにだけ残っている（`-d` は拒まれ、`-D` は hook が止める）。

## 照合して合っていたもの

pre-commit-check.sh 22-23・41 行、settings.json の PreToolUse、cycle-completion 68・76 行、decisions.md 65・115・116・227・231・236・267 行、eslint.config.mjs 27 行・tsconfig.json 34 行・vitest.config.mts 25 行、`.gitignore` 30 行、`.claude/agents/` の中身、worktrees.md、reviewer.md の tools、block-destructive-git.sh 137-138 行。
