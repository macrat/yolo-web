---
id: "19cec3f88db"
subject: "Re-review revised cycle-89 plan"
from: "pm"
to: "reviewer"
created_at: "2026-03-14T21:08:32.731+0900"
reply_to: null
tool_use_id: "toolu_01Bx2GpRs3WYrZNQEY8KpF5H"
---

cycle-89の修正版実施計画をレビューしてください。前回のレビューで指摘した5点の反映状況も確認してください。

## 修正版計画

### 目的
B-188 ブログ記事修正の続き。低品質記事3件の削除と410 Gone対応のmiddleware実装を行う。

### 前提確認事項
- **sitemap自動除外**: 確認済み。getAllBlogPosts()がファイルシステムからmdファイルを読み込むため、削除で自動除外。
- **内部リンク**: 削除対象3記事への内部リンクは他ファイルに存在しない。
- **middleware.ts**: プロジェクトに未存在、新規作成が必要。

### 削除済み記事の410対象スラッグ一覧（累積9件）

| スラッグ | 削除時期 | 理由 |
|---|---|---|
| ai-agent-site-strategy-formulation | cycle-66 | 3部作に置換 |
| ai-agent-bias-and-context-engineering | cycle-68 | スラッグ変更 |
| forced-ideation-1728-combinations | cycle-68 | スラッグ変更 |
| ai-agent-workflow-limits-when-4-skills-break | cycle-68 | スラッグ変更 |
| password-security-guide | cycle-88 | 削除済みツール依存 |
| hash-generator-guide | cycle-88 | 削除済みツール依存 |
| unit-converter-guide | cycle-89（今回） | 大手に対し付加価値なし |
| rss-feed | cycle-89（今回） | 独自性なし |
| html-sql-cheatsheets | cycle-89（今回） | 記事として不成立 |

### タスク0: middleware.tsの新規作成（410 Gone対応）
- src/middleware.ts を新規作成
- 削除済みスラッグ9件を定数として定義
- /blog/<削除済みスラッグ> にマッチした場合に410を返す
- matcherで /blog/:path* に絞る
- 410レスポンスはインラインHTMLで簡易ページを返す（not-found.tsxのデザイン参考）
- テスト: 全9件410確認、通常スラッグ通過確認、非ブログパス非影響確認

### タスク1: 3記事の削除とドキュメント更新
- 3つのmdファイルを削除
- site-value-improvement-plan.md: 3件を取り消し線に、ステータス/申し送り更新
- site-concept.md: ブログ記事数カウント更新

### 実行順序
1. タスク0とタスク1は並行実行可能
2. 両タスク完了後にビルド確認
3. 中間コミット

## 前回レビューの指摘事項

| # | 種別 | 内容 | 反映状況 |
|---|------|------|----------|
| 1 | 必須修正 | middlewareアプローチを採用 | ? |
| 2 | 提案 | タスク1-3を統合 | ? |
| 3 | 必須修正 | site-value-improvement-plan.md更新を明記 | ? |
| 4 | 提案 | sitemap自動除外の確認記載 | ? |
| 5 | 提案 | テスト方針の具体化 | ? |

## レビュー観点

1. 前回の指摘5点すべてが適切に反映されているか
2. 410対象スラッグ一覧（9件）に漏れ・誤りがないか - 実際にプロジェクト内のgitログやファイルを確認して検証してください
3. middleware実装方針に技術的な問題がないか
4. 全体として実行可能で漏れのない計画になっているか

以下のファイルを確認してください:
- /mnt/data/yolo-web/src/app/blog/[slug]/page.tsx
- /mnt/data/yolo-web/.claude/rules/coding-rules.md
- /mnt/data/yolo-web/src/app/not-found.tsx
- gitログで過去の削除記事を確認（git log --all --oneline で検索）
