# B-786 の設計のレビュー（第1回）

対象: [b786-design.md](./b786-design.md)（b0681ac）。判定: 要修正（major 3・minor 4）。reviewer は Write を使えなかったので、PM が報告をこのファイルに写した。

## 根拠の照合

合っていた: decisions.md 65・115・116 行、settings.json 35-59 行、hook が `.cwd` に cd してから `git status --porcelain` を取ること（pre-commit-check.sh 22-23・41 行、pre-push-check.sh 19-20 行）、playwright-mcp.md 82・109 行、cycle-completion の手順7（68・76 行）、builder.md が無いこと、worktrees.md の paths と中身、`.gitignore` に `.claude/worktrees/` が無いこと、ディスクの空き 28GB。

## 指摘

1. major: reviewer は主の木で動くが、担当の変更は取り込みまで担当の枝にしか無い。reviewer が古い主の木を見て承認するか、担当の木に書く。何を読むか（担当の木のパスか `git diff <作業ブランチ>...<担当の枝>` か）と、スクリーンショットでどの木のサーバーを見るかを決め、reviewer.md と依頼の規則に入れる。
2. major: 書く担当は builder だけでない。`.claude/agents/blog-writer.md` にも、自分の木だけ・push しない・枝と HEAD を返す、の決まりが要る。書く担当をすべて挙げる。
3. major: 担当の木がどのコミットから起きるかが決まっていない。`isolation: "worktree"` が既定のブランチから起こすなら、統合のブランチでは古いコードの上で書く。主の木の未コミットの変更も見えない。担当を起こす前に主の木をコミット済みにすることと、起点が作業ブランチの HEAD でなければ案3に切り替えることを決める。
4. minor: C の decisions.md 265 行は AP-WF08 の当てはめ。`git add -A` は 236 行。
5. minor: B の playwright-mcp.md 111 行は「根拠」の段落。`.next/lock` の取り合いは 118 行（と 93 行）。
6. minor: playwright-mcp.md 118 行の `cp -al`（ハードリンク）による `node_modules` の置き方と比べていない。比べた理由と、knowledge との食い違いをどう揃えるかを書く。
7. minor: cycle-completion の手順7の前に点検を足すだけでは、同じ手順の「すべての変更を…コミット」と `git add .` が残る。本文に織り込むか、織り込まない理由を書く。

## 問題が無かったもの

A・B の hook を変えない判断（decisions.md 227・231・267 行と整合）、D の記述、E・AP-WF50 の問いの付け替え・`.gitignore` の追加。

## PM の対応

すべて妥当として直す。指摘3は PM が実測した: `isolation: "worktree"` で起こした担当の木は `.claude/worktrees/agent-<id>`、枝 `worktree-agent-<id>` で、起点は作業ブランチの HEAD（b0681ac）でなく main の先頭（4e98a53）だった。`node_modules` と `.next` は無かった。変更の無い木と枝は自動で消えた。
