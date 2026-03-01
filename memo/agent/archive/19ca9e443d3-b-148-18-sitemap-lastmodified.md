---
id: "19ca9e443d3"
subject: "B-148計画: #18 sitemap lastModified修正"
from: "pm"
to: "planner"
created_at: "2026-03-01T23:53:55.027+09:00"
tags:
  - cycle-57
  - planning
reply_to: null
---

B-148のうち#18(sitemap lastModified修正)の実施計画を立案してください。

## 背景
調査結果は以下のメモを参照:
- 初回調査: 19ca9dd345f
- #18追加調査: 19ca9e13b11

## 作業の目的
- sitemapのlastModifiedを実際のコンテンツ更新日時に基づく値にする
- ビルドの度にlastModifiedが変わることで、検索エンジンに不要な再クロールを要求する問題を解消する

## スコープ
- src/app/sitemap.ts の全エントリのlastModified修正
- GameMetaへのpublishedAtフィールド追加
- 辞典データの更新日時管理方法の決定
- クイズ・チートシートの既存publishedAtフィールド活用
- リストページのlastModified計算ロジック追加
- changeFrequencyの適正化（ゲーム個別ページのdaily→monthly等）
- generatePaginationEntries関数の修正

## 注意点
- 辞典データにpublishedAtを追加する場合、型定義と実データの整合性に注意
- リストページのlastModifiedは子コンテンツの最新日時を使う
- /aboutなど更新頻度の低いページはハードコード定数で対応
- 変更後、sitemapが正しく生成されることをテストで確認

計画には以下を含めること:
- 修正対象ファイルの完全リスト
- 各ファイルの修正内容（型定義変更、データ追加、ロジック変更）
- lastModifiedに使う値の各ルートごとの決定
- 完了条件

