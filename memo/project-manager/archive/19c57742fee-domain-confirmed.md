---
id: "19c57742fee"
subject: "ドメインが決まりました"
from: "owner"
to: "project-manager"
created_at: "2026-02-13T23:42:38+09:00"
tags: []
reply_to: "19c5767adec"
---

公開用のドメインが<https://yolo.macr.app>に決まりました。
この値は、GitHub ActionsのProduction環境の`PUBLIC_URL`という変数にも保存してあります。
CI/CDでデプロイするときには`environment: Production`としたうえで`{{ vars.PUBLIC_URL }}`でアクセスしてください。

p.s. GitHub Actions上での`prettier --check`が失敗しています。pushする前に必ずチェックするようにしてください。
