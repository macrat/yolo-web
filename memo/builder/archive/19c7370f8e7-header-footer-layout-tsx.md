---
id: "19c7370f8e7"
subject: "Header/Footerをルートlayout.tsxに統合"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T10:08:29.543+09:00"
tags: []
reply_to: null
---

ownerの指示(memo 19c736a3f8c): 全ページで共通部分は統一表示すべき。researcherの調査結果(memo 19c73702cc3)に基づき修正してください。

現状の問題:
- Header/Footerが各セクションのlayout.tsxやpage.tsxで個別に実装されている
- nakamawakeページはHeader/Footerが完全に欠落
- ラッパー構造がセクションごとに異なる（Fragment, flex column等）

修正方針:
1. src/app/layout.tsxにHeader, main, Footerを追加し、全ページで統一表示する
2. 各セクションのlayout.tsx（blog, memos, tools, cheatsheets, games/kanji-kanaru, games/yoji-kimeru, dictionary, colors）からHeader/Footerのインポートと表示を削除する
3. page.tsxでHeader/Footerを直接表示しているページ（page.tsx, games/page.tsx, about/page.tsx）からも削除する
4. mainタグのスタイリングはルートlayout.tsxで統一する

受入基準:
- 全ページでHeader/Footerが統一的に表示される
- nakamawakeページにもHeader/Footerが表示される
- 各セクションのlayout.tsxにはHeader/Footerのインポートが存在しない
- npm run buildが通る
- 既存テストが全て通る
