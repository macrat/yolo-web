# B-786 の実装のレビュー（第1回）

対象: 主の木の未コミットの変更（b786-design.md 第3節の実装）。判定: 要修正（major 1・minor 2）。reviewer の報告を PM が写した。第3節の項目はすべて設計どおりに入り、`npm run lint`・`npm run typecheck` は通り、`.claude/worktrees/` の除外も効いた。

## 指摘

1. major: `.claude/skills/take-screenshot/SKILL.md` 45 行に、playwright-mcp.md から消した手順（`git worktree add` の木で起こし、`mine.patch` を `git -C <木> apply` で当てる）が残り、根拠として指す節にもう無い。担当の木で起こしたサーバーを依頼のポートで撮る形に書き直す。79 行（取り忘れたときに `git worktree add` で過去の状態を取り出す手順）も新しい形に合うか見直す。
2. minor: `docs/knowledge/nextjs.md` 165・167 行の対処（`git worktree add` で取り出した別の木で検査をやり直す）は「同じ作業ツリーで動くほかの作業者」が前提。担当の木ごとに `.next` が分かれる形に揃える。
3. minor: `.claude/rules/worktrees.md` の paths（`.claude/worktrees/**/*`）は、PM や reviewer が主の木から担当の木のファイルを読むときに読み込まれ、担当向けの手順を自分への指示と取り違えうる。冒頭に対象（担当の木で書く担当）を書く。

## PM の判断

blog-writer の tools に Write を足した（担当の木で記事を新しく作るため）。常に読まれる規則の置き場所は `.claude/rules/delegation.md` とした。
