---
id: "19cec3b8cab"
subject: "Revise cycle-89 plan"
from: "pm"
to: "planner"
created_at: "2026-03-14T21:04:11.563+0900"
reply_to: null
tool_use_id: "toolu_01Kxp56DPinzgnkQBd3oF5VU"
---

cycle-89の実施計画のレビュー結果を受けて、計画を修正してください。

## レビューでの必須修正事項

### 指摘1: 410 Gone の実装方法
page.tsx単体ではHTTPステータスコード410を返せない。middlewareアプローチを採用すること。

具体的には:
- middleware.ts を新規作成し、削除済みスラッグリストに該当するリクエストを NextResponse で 410 ステータスを返す
- page.tsx ではなく middleware で制御する
- このプロジェクトにはまだ middleware.ts がない

### 指摘3: site-value-improvement-plan.md の更新
3件を取り消し線に更新する作業を計画に明記すること。
password-security-guide, hash-generator-guide と同じ形式で:
```
~~unit-converter-guide（単位変換ガイド）~~ — 修正ではなく削除と判断（...理由...）
```

## レビューでの提案事項（採用推奨）

### 指摘2: タスク1-3の統合
3つの削除作業は同一パターンのため、1タスクにまとめても問題ない。

### 指摘4: sitemapの自動除外
mdファイル削除でsitemapから自動除外されることを計画に確認済みとして記載。

### 指摘5: テスト方針の具体化
middlewareの単体テストと削除済みスラッグリストの網羅性テストの2種類が必要。

## 修正後の計画を作成してください

上記の指摘を反映した修正版計画を出力してください。以下の点に留意:

1. タスク0のmiddleware実装を具体化する
2. タスク1-3を1つのタスクに統合する（タスク1: 3記事の削除とドキュメント更新）
3. site-value-improvement-plan.md の具体的な更新内容を明記する
4. sitemapの自動除外について確認済みである旨を記載する
5. テスト方針を具体化する

また、以下のファイルを実際に読んで、技術的な実装詳細を計画に含めてください:
- /mnt/data/yolo-web/src/app/blog/[slug]/page.tsx
- /mnt/data/yolo-web/.claude/rules/coding-rules.md
- /mnt/data/yolo-web/src/app/sitemap.ts
- /mnt/data/yolo-web/src/app/not-found.tsx（存在すれば。410ページのデザイン参考）
