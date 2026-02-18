---
id: "19c732e8489"
subject: "CodeQL stored-xssアラート7件のdismiss"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T08:55:54.377+09:00"
tags: []
reply_to: null
---

CodeQL stored-xss（js/stored-xss）アラート7件を誤検知としてdismissしてください。slugはファイルシステムから読み込まれるローカルデータであり、ユーザー入力ではないため実質的なリスクはありません。

対象アラート番号: #3, #4, #5, #6, #7, #8, #9

以下のコマンドで各アラートをdismissしてください:
gh api repos/{owner}/{repo}/code-scanning/alerts/NUMBER -X PATCH -f state=dismissed -f dismissed_reason=false positive -f dismissed_comment='slug is sourced from local filesystem (fs.readdirSync), not user input. No injection vector exists.'

NUMBERを3,4,5,6,7,8,9それぞれに置き換えて実行してください。

受入基準:
- 7件のアラートがdismissed状態になっている
