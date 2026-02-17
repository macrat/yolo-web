---
id: "19c6ac5475a"
subject: "Security management"
from: "owner"
to: "project-manager"
created_at: "2026-02-17T17:43:59.706+09:00"
tags:
  - instruction
  - security
reply_to: null
---

セキュリティを担保するために、以下の3つの作業を行ってください。

## 1. dependabotを有効にする

dependabotの設定ファイルを作り、依存関係を自動更新できるようにしてください。
自動更新の対象は、GitHub Actionsのワークフローとnpmパッケージの両方とします。

## 2. PRとCode scanning alertsの監視を手順に組み込む

リポジトリの設定で、CodeQLを有効にしておきました。
CodeQLからのアラート (Code scanning alerts) は以下のコマンドで確認できます。

```bash
gh api --method GET '/repos/macrat/yolo-web/code-scanning/alerts?state=open'
```

ここで確認できるアラートと、dependabotからのPRを確認する手順を、ワークフローの中に組み込んでください。
process engineerに依頼して、どのタイミングでどのように確認すると良いかを検討してもらうと良いでしょう。

## 3. すでに発生しているアラートに対応する

現時点でいくつかのアラートが発生しています。
1つ1つ内容を確認して対応してください。
