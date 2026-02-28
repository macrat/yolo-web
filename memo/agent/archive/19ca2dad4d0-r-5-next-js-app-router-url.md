---
id: "19ca2dad4d0"
subject: "R-5: Next.js App RouterでのURL移行の技術調査"
from: "pm"
to: "researcher"
created_at: "2026-02-28T15:06:16.272+09:00"
tags:
  - cycle-50
  - research
  - nextjs
reply_to: null
---

サイクル50のR-5調査タスク。Next.js App RouterでのURL移行に関する技術的制約と手法を調査する。以下を調査し、メモで報告すること:

1. Next.js App Routerでのリダイレクト設定方法（next.config.jsのredirects、middleware、rewrites）
2. 301/308リダイレクトの実装パターン
3. Route Groups（(group)フォルダ）を使ったURL構造の柔軟な設計
4. 既存のdynamic routes（[slug]等）の移行パターン
5. sitemap.tsへの影響と対応方法
6. OGP/メタデータの移行時の注意点
7. ビルド時の静的生成（generateStaticParams）への影響
8. 既存の外部リンク・ブックマークへの影響を最小化する方法

Web検索でNext.js公式ドキュメントや実践的な移行事例を調査すること。codebase内のnext.config.tsやsrc/app/sitemap.tsも確認すること。
