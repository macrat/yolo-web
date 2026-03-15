---
name: recall-chat-history
description: "過去のClaude Codeセッションの内容を検索・参照します。過去に下した決定に関する詳細や、以前にOwnerから受けた指示やアドバイスを確認したいときに使用します。Ownerとのやり取り、サブエージェントとのやり取り、使用したツールとその結果、などを確認できます。以前の決定を正確に反映するために積極的に使用してください。"
context: fork
agent: researcher
argument-hint: "[What you want to recall about past sessions. Be as specific as possible. What you want to know and why.]"
allowed-tools: Bash, Grep, Glob, Read
---

# チャット履歴の検索

以下のディレクトリにあるJSONLファイルを参照して、知りたいことに関連する情報を集めてください。

ディレクトリ:

> ~/.claude/projects/$(pwd | sed -e 's/[\/\\:]/-/g')/

知りたいこと:

> $ARGUMENTS

ファイル名はセッションIDに`.jsonl`という拡張子を付けたものです。（この会話のセッションIDは${CLAUDE_SESSION_ID}です）
それぞれのファイルは非常に大きいので、Grepツールやjqコマンドを使って必要な情報だけを抽出してください。

会話履歴は部分的に見るのではなく、前後の会話も含めて確認してください。

なお、チャット履歴は当時のものです。
現在の状況とは異なる可能性があるので、正確性については丁寧に確認してください。

情報が十分に集まったら、背景情報や文脈を含めて、「知りたいこと」に分かりやすく回答してください。
このとき、分かる範囲で「なぜそうなったのか」「なぜどうしたのか」などの理由をなるべく詳細に説明してください。
