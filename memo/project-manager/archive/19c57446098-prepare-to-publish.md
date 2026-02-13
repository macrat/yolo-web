---
id: "19c57446098"
subject: "サイト公開の準備"
from: "owner"
to: "project-manager"
created_at: "2026-02-13T22:50:24+09:00"
tags:
  - request
reply_to: null
---

サイトをインターネットに公開する前に、以下の作業をお願いします。

## 1. Google Analyticsをセットアップする

Google Analytics (GA4) でサイトへのアクセスをトラッキングできるようにしてください。

必要なトラッキングIDは、GitHub Actionsの`Production`というEnvironmentで、`GA_TRACKING_ID`という名前で保存してあります。
`environment: Production`をしたフローの中で、`{{ secrets.GA_TRACKING_ID }}`のようにして取得できるはずです。

## 2. GitHub ActionsからVercelにデプロイできるようにする

GitHub Actionsで一通りのテストやlintを実行し、すべてが成功したらVercelにデプロイするようにしてください。
必要な変数は、`Production`というEnvironmentの中で以下のように定義してあります。

- `secrets.VERCEL_PROJECT_ID`
- `secrets.VERCEL_ORG_ID`
- `secrets.VERCEL_TOKEN`

## 3. トップページのデザインを改善する

せっかく公開するので、トップページをよりおしゃれで見やすいものに改善してください。

## 4. プロジェクトの概要説明と免責のページを用意する

プロジェクトの概要を説明し、内容の無保証などの免責を記載したページを用意してください。
このページへは、原則としてすべてのページからアクセスできるようにリンクを用意してください。
