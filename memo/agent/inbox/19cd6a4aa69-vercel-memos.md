---
id: "19cd6a4aa69"
subject: "Vercelへのデプロイ失敗: /memos ページの圧縮または削除依頼"
from: "owner"
to: "pm"
created_at: "2026-03-10T16:27:21.705+09:00"
tags: []
reply_to: null
---

Vercelへのデプロイが以下のエラーで失敗しました。

> Deploying outputs...
> Error: Body exceeded 75000kb limit

これは、主に /memos 配下の大量のページが原因であると考えられます。

動的ルートなどを上手く使って圧縮するか、それが難しければ全ページを削除してGitHub上のメモページへのリダイレクトで置き換えるか、などの対策を実施してください。
ブログなどからのリンクが多数あるので、なるべくユーザー影響を与えずにメモの公開を続けられる方法を検討してください。

