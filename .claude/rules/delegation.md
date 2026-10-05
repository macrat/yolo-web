# 担当の起こし方とコミットの持ち主

担当の木では担当がコミットし、主の木では PM だけがコミットと push をする。

## 担当を起こす

- コミットに入るファイルを書く担当（builder・blog-writer、ほかに同じ仕事を頼む担当）は、必ず Agent の `isolation: "worktree"` で起こす。担当は自分の木（`.claude/worktrees/agent-<id>`、枝 `worktree-agent-<id>`）で書いてコミットする。担当の側の手順は `.claude/rules/worktrees.md` にある。
- `docs/cycles/` の記録だけを書く担当（reviewer・調べものなど）は木を作らず、主の木で書かせる。記録は PM がコミットする。主の木では PM 以外にコミットさせない。
- 起こす前に、担当が読む・前提にする変更を主の木でコミットしておく。未コミットの変更は担当の木に入らない。
- 依頼には、作業ブランチの名前と `git rev-parse HEAD`、サーバーを起こすなら使うポート（`PORT`）を書く。
- 並行させるのは、触るファイルが重ならない担当だけにする。依存（`package.json`・`package-lock.json`）を変える仕事は主の木で1つだけ走らせ、ほかと並行させない。
- reviewer とスクリーンショットの担当には、見る担当の木のパス・枝・ポートを書く。

## 取り込んで消す

1. 担当が返した枝を、主の木で `git merge <担当の枝>` で取り込む（進められるなら fast-forward、並ぶ担当の2つ目からはマージのコミット）。`git cherry-pick` とファイルの写しは使わない。cherry-pick では担当の枝が作業ブランチの祖先にならず、`git branch -d` で消せない。
2. 取り込む前に、取り込む枝のコミットが依頼した担当のものだけかを `git log <作業ブランチ>..<担当の枝>` で確かめる。採らないコミットがあれば、担当にその枝で `git revert` させてから取り込む。
3. 衝突したら、担当に、担当の木で作業ブランチを取り込み直して解くよう頼む。
4. 取り込んだら `git worktree remove <担当の木>` と `git branch -d <担当の枝>` で消す。取り込まない枝は `git worktree remove` で木だけを消し、枝はローカルに残す。`git branch -D`・`git branch --delete --force`・`git update-ref -d` は使わない。

## push

push するのは PM が主の木の作業ブランチだけで、担当の枝は origin に push しない。
