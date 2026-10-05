# B-786 の設計のレビュー（第5回）

対象: [b786-design.md](./b786-design.md) 第5稿。判定: 要修正（major 1・minor 1）。reviewer の報告を PM が写した。第4回の3件は解消。

## 指摘

1. major: b784 との順序の依存が書かれていない。`.claude/worktrees/` が `.gitignore` に入る前は、いまの hook でも `?? .claude/worktrees/` がディレクトリとして prettier・eslint に渡り、PM のコミット前の検査が担当の木を丸ごと検査する（第1節 A と同じ道）。`-uall` ならハードリンクの node_modules まで並ぶ。`.gitignore` の目的に「pre-commit-check.sh も担当の木を拾わない」を足し、`.gitignore` と各 config の追加は担当を `isolation: "worktree"` で起こす最初の時点より前にコミットし、b784 の `-uall` はそのあとに入れる、と明記する。
2. minor: prettier 3 は `.gitignore` を既定で読むので、`.claude/worktrees/` を `.gitignore` に足せば prettier からも外れる。第3節に「prettier は `.gitignore` で外れるので別の設定は要らない」と1句足す。
