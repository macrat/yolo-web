# B-786 の設計のレビュー（第6回）

対象: [b786-design.md](./b786-design.md) 第6稿。判定: 要修正（minor 1）。reviewer の報告を PM が写した。第5回の2件は解消（b784-design.md との順序の言い方も一致）。行番号の照合、変えるものの過不足、CLAUDE.md の役割、ツギハギ禁止、docs/anti-patterns/ は問題なし。

## 指摘

1. minor: 第1節 C の「`cycle-completion` の手順7（68・76 行）は…`git add .` を示す」は、b0681ac の SKILL.md では 68 行が「すべての変更を…」、76 行が「必ずすべてのファイルをコミット」で、`git add .` は 80 行。72 行には「`git add .` は使いません」という逆の向きの記述もある。「（68・76 行。80 行で `git add .` を示す）」のように書き分ける。
