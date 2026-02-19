---
id: "19c7365c3c5"
subject: "チートシートページにlayout.tsx追加"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T09:56:15.045+09:00"
tags: []
reply_to: null
---

チートシートページ(/cheatsheets, /cheatsheets/[slug])にヘッダーとフッターが表示されていません。原因はsrc/app/cheatsheets/layout.tsxが存在しないことです。

既存のsrc/app/tools/layout.tsxやsrc/app/blog/layout.tsxと同じパターンで、src/app/cheatsheets/layout.tsxを作成してください。Header, Footer, mainタグを含めてください。

また、全セクションにlayout.tsxが存在することを保証するテストを追加してください。src/app/直下の各セクションディレクトリにlayout.tsxがあることを確認するテスト、またはルートlayout.tsxにHeader/Footerを含めることで全ページに強制する方法のどちらかを実装してください。ownerの指示はNext.jsの機能で強制するかテストで保証するかのいずれかです。

受入基準:
- /cheatsheets と /cheatsheets/[slug] にヘッダーとフッターが表示される
- 全セクションでレイアウトが適用されていることが保証される仕組みがある
- npm run buildが通る
- 既存テストが全て通る
