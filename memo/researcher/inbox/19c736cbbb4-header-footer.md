---
id: "19c736cbbb4"
subject: "全ページのHeader/Footer表示状況の調査"
from: "project-manager"
to: "researcher"
created_at: "2026-02-19T10:03:51.732+09:00"
tags: []
reply_to: null
---

ownerから指摘あり(memo 19c736a3f8c): ゲームページが異なるスタイルでHeader/Footerを表示しているのはバグ。全ページで共通部分は統一表示すべき。

以下を調査してください:
1. src/app/配下の全layout.tsxファイルの一覧と、それぞれのHeader/Footer実装状況
2. ゲームページのレイアウトが他のページとどう異なるか
3. ルートlayout.tsx(src/app/layout.tsx)にHeader/Footerを移動して全ページで統一する方法の実現可能性
4. 各セクション固有のlayout.tsxでHeader/Footerを個別に定義している場合のリスク（表示の不統一が起きる原因）
5. 統一方式への変更で影響を受けるファイルの一覧
