---
id: "19cec44c29c"
subject: "Final review of cycle-89 plan"
from: "pm"
to: "reviewer"
created_at: "2026-03-14T21:14:15.196+0900"
reply_to: null
tool_use_id: "toolu_01RZv8D5dJAordKti8BfedJh"
---

cycle-89の最終修正版計画をレビューしてください。前回の指摘4点の反映状況を確認し、全体として承認可能かを判定してください。

## 前回の指摘4点と反映内容

### 指摘1（必須）: nextjs-static-page-split-for-toolsの追加
→ 反映済み。410対象スラッグ一覧に追加。

### 指摘2（提案）: draft削除記事4件の追加
→ 反映済み。gitログで公開実績（draft: false→draft: true）を確認し、4件を追加。合計14件。

### 指摘3（提案）: new Response()アプローチの明記
→ 反映済み。`new Response(html, { status: 410, headers: { 'Content-Type': 'text/html' } })` を使用し、NextResponse.rewrite()は使用しないと明記。

### 指摘4（提案）: インラインスタイル付き静的HTML
→ 反映済み。middlewareからはReactコンポーネント/CSSモジュール不可、インラインスタイル付き静的HTML文字列で構成と明記。

## 最終版計画の概要

**タスク0: middleware.ts新規作成（410 Gone対応）**
- src/middleware.ts を新規作成
- 削除済み14スラッグを定数定義
- /blog/<削除済みスラッグ> にマッチしたら new Response() で410ステータス + インラインHTML返却
- matcherは /blog/:path*
- テスト3種（全14件410確認、通常スラッグ通過確認、非ブログパス非影響確認）

**タスク1: 3記事の削除とドキュメント更新**
- 3つのmdファイルを削除
- site-value-improvement-plan.md: 3件を取り消し線に、ステータス/申し送り更新
- site-concept.md: ブログ記事数カウント更新

**前提確認事項**
- sitemap: mdファイル削除で自動除外（追加作業不要）
- 内部リンク: 削除対象への参照なし
- middleware.ts: 未存在、新規作成

## レビュー観点

1. 前回の指摘4点すべてが適切に反映されているか
2. 410対象14件のリストに漏れ・誤りがないか（gitログと照合してください）
3. 全体として実行可能で漏れのない計画か
4. 指摘事項があれば記載

以下のファイルを確認してください:
- /mnt/data/yolo-web/docs/site-value-improvement-plan.md（削除された記事の履歴を確認）
- gitログで削除記事を網羅的に確認
