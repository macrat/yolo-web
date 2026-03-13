---
id: "19cd698d48d"
subject: "【事故報告】push済みコミットのamendとwipプレフィックス誤用"
from: "pm"
to: "owner"
created_at: "2026-03-10T16:14:26.061+09:00"
tags:
  - cycle-80
  - incident
reply_to: null
---

# 事故報告: push済みコミットのamendとwipプレフィックス誤用

## 事実経緯

1. PMが緊急修正指示メモの訂正版をコミットした際、git logを確認せず `wip:` プレフィックスを付けた。この作業は完了済みタスクであり、`wip:` は不適切だった。
2. Ownerから「何に対するwipか」と指摘を受けた。
3. PMは `git commit --amend` でコミットメッセージを修正した。しかし、このコミットは既にリモートにpush済みだったため、通常のpushが不可能になった。
4. `git push --force` を試みたところ、block-destructive-git.sh hookがブロックした。
5. Ownerが手動で `git push --force` を試みたが、GitHubのリポジトリルールにより拒否された。
6. `git reset --soft` で元のコミット(7d31582)に復元した。ファイル内容への影響はなし。

## 問題点

### 1. git logを確認せずにコミットメッセージを作成した

PMはコミットメッセージの作成時にgit logを確認しなかった。直近のgit logを確認すれば、完了済み作業に `wip:` が不適切であることは明白だった。

PMが `wip:` を機械的に付けた背景には、MEMORY.md（~/.claude/projects/配下の環境固有ファイル）に記載された「builder作業完了後やドキュメント更新後は `wip:` プレフィックスで中間コミットを行う」というルールがある。このルールは過去の特定の文脈で追加されたその場限りの指示であり、コミットプレフィックスの使い分け基準として不完全である。

**構造的な問題**: MEMORY.mdはPMが作成した不完全なメモであり、その場限りの指示や文脈を欠いた断片的なルールを含んでいる。これがリポジトリ内の正式なドキュメント（CLAUDE.md、skills等）と同等の権威を持つかのように参照されている。B-184「MEMORY.mdの整理とリポジトリへの移行」が未実施であり、MEMORY.mdの不完全なルールがリポジトリ内の正式なドキュメントに統合・整理されていないことが根本原因の一つ。

### 2. `git commit --amend` がhookでブロックされなかった

block-destructive-git.sh は `git push --force`, `git reset --hard`, `git checkout .` 等をブロックするが、`git commit --amend` はブロック対象に含まれていない。push済みコミットに対するamendは、必然的にforce pushを要求する操作であり、結果として同等の危険性を持つ。今回はforce pushがGitHubリポジトリルールで最終的に防がれたが、hookの段階で防げるべきだった。

**構造的な問題**: hookが「破壊的操作の結果（force push）」をブロックしているが、「破壊的操作の原因（push済みコミットのamend）」をブロックしていない。

## 再発防止策の提案

### 提案1: block-destructive-git.sh に `git commit --amend` を追加

AIエージェントがamendを使う正当なケースは限定的であり、一律ブロックしても実害は小さい。

### 提案2: B-184（MEMORY.mdの整理とリポジトリへの移行）の優先度見直し

MEMORY.mdの断片的なルールが誤った判断の原因になった。MEMORY.mdに蓄積されたワークフロールールや教訓をリポジトリ内の適切な場所（CLAUDE.md、.claude/skills/等）に整理・統合し、文脈を補完した正式なドキュメントにすることで、同種の問題を防げる。

