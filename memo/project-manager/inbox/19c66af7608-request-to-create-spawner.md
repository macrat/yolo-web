---
id: "19c66af7608"
subject: "Request to create spawner"
from: "owner"
to: "project-manager"
created_at: "2026-02-16T22:41:41+09:00"
tags:
  - request
reply_to: null
---

Claude Codeの実行効率を上げて自律的な動作を継続しやすくするために、以下のようなシステムを作ってください。

## 概要

メモの作成をトリガーにして、対応するエージェントを自動起動するためのシステム。
Project Managerが行っていたエージェントの管理をシステム化することで、コンテキストの節約と連続運転時間の拡張を狙う。

spawnerは以下のような流れで動作する。

1. ownerが `npm run spawner` コマンドで起動する。
2. spawnerが起動すると、まず `memo/*/inbox/` の中をチェックする。（ただし、ownerディレクトリは対象外とする）
   - メモがあれば、対応するエージェントを後述する方法で起動する。
   - メモが無い場合は、project-managerを起動する。
3. ループに入り、以下の2つの作業を行う。
   - `memo/*/inbox/` の中を監視し、新しいファイルが作られたら、対応するエージェントを起動する。（ただし、ownerディレクトリは対象外とする）
   - project-managerのinboxにメモが届いても、すでにproject-managerを実行中の場合は起動しない。言い換えると、project-managerのプロセスは同時に1つしか存在しない。
   - project-managerが停止したとき、project-managerのinboxにメモがある場合は再起動する。
   - すべてのエージェントが停止した場合は、メモの有無に関わらずproject-managerを起動する。
5. ownerがCtrl-Cを一回押すと、それ以上はエージェントを起動しなくなる。すべてのエージェントが停止したら、spawnerプロセスも停止する。
   もしもCtrl-Cが1秒以内に3回以上押された場合は、すべてのエージェントを強制停止して即座にspawnerが終了する。

## エージェントの起動方法

エージェントを起動するときは、 `SPAWNER_SPAWN_CMD` という環境変数にセットされたシェルコマンドを使う。
環境変数が設定されていなければ、デフォルトの `claude -p` コマンドが使用される。

コマンドには、引数としてエージェントごとのプロンプトが渡される。
このプロンプトは、本リポジトリの `/agents/prompt/${agent-name}.md` に保存する。
これらのファイルは、`/.claude/agents/${agent-name}.md` に保存されているものを移動して使うこと。
Claude Code用のカスタムエージェントは本システムのエージェントで置き換えるので、元のファイルは削除して良い。

プロンプトファイルには、 `$INPUT_MEMO_FILES` という特殊な値を書けるようにする。
この値は、起動のきっかけとなったメモファイルの名前で置き換えられる。
ただし、project-masterのプロンプトファイルだけはこの値を記述しない。なぜなら、後述するようにproject-masterは受信メモとエージェントが1対1で起動しないからである。

起動したエージェントの標準出力およびエラー出力は、 `/agents/logs/${datetime}_${agent-name}.log` に出力する。
datetimeはエージェントの起動日時、agent-nameは起動したエージェントの名前にする。
このディレクトリに保存するログには機密情報が含まれる可能性があるので、このディレクトリはgitignoreの対象とする。

エージェントは、原則として受信したメモ1つにつき1つが起動される。
たとえばspawnerの起動時にplannerのinboxに2通、builderのinboxに1通のメモがあったら、plannerが2人とbuilderが1人起動する。
ただし、project-managerだけは何通届いていても1つしか起動しない。
各エージェントは1回起動するごとに1つの受信メモだけを処理するが、project-managerは自分の手元にあるすべてのメモを処理する。
これは、project-managerが全体を調整する役割を持っていることに起因する。

## spawnerの出力

spawnerは、コンソールと `/agents/logs/${datetime}_spawner.log` の両方に以下のようなログを出力する。
datetimeはspawnerの起動日時である。

- 新たなメモの作成を検出したとき: `${datetime} [${from-agent}] -> [${to-agent}] ${subject}`
- エージェントを開始したとき: `${datetime} [${agent}] start` 
- エージェントが終了したとき: `${datetime} [${agent}] end`
- エラーが発生したとき: `${datetime} [${agent}] ${error-details}` もしくは `${datetime} ${error-details}`

ログはたとえば以下のようになる。

```
2026-02-16 23:07:00+09:00 [owner] -> [project-manager] Request to create spawner
2026-02-16 23:07:00+09:00 [project-manager] start
2026-02-16 23:07:01+09:00 [project-manager] -> [owner] Re: Request to create spawner
2026-02-16 23:07:02+09:00 [project-manager] -> [researcher] Research memo structure
2026-02-16 23:07:02+09:00 [researcher] start
2026-02-16 23:07:02+09:00 [project-manager] end
2026-02-16 23:14:00+09:00 [researcher] -> [project-manager] Re: Research memo structure
2026-02-16 23:14:00+09:00 [project-manager] start
2026-02-16 23:14:01+09:00 [researcher] end
```

## エラーへの対応

エージェントの起動に失敗した場合は、3回だけリトライする。
3回のリトライでも起動できなければ、Ctrl-Cを1回押されたときと同じ終了モードに入る。
すなわち、新たなエージェントの起動をやめ、現在起動中のすべてのエージェントが終了した時点でspawner自体も停止する。
