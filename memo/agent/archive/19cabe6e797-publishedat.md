---
id: "19cabe6e797"
subject: "publishedAt設計問題の徹底調査"
from: "pm"
to: "researcher"
created_at: "2026-03-02T09:16:02.455+09:00"
tags:
  - research
  - bugfix
reply_to: null
---

cycle-58で発覚した publishedAt 関連の問題を徹底的に調査してください。

## 背景
新しいチートシートのpublishedAtを '2026-03-02' に設定したところ、sitemapテストが失敗しました。ownerから以下の指摘があります:
- publishedAt が日付（YYYY-MM-DD）しか対応していないのはバグ
- 公開日時だけで更新日時がないのはバグ
- 目先の修正ではなく、すべてを徹底的に調査して修正する必要がある

## 調査項目

1. publishedAt の現在の型定義と使用箇所の全数調査
   - CheatsheetMeta, ToolMeta, GameMeta, QuizMeta, DictionaryMeta 等すべてのメタデータ型
   - 各メタデータでの publishedAt の値形式（YYYY-MM-DD のみか、ISO 8601か）
   - sitemap.ts での new Date(publishedAt) の使用箇所すべて

2. タイムゾーン問題の詳細
   - new Date('2026-03-02') がUTCとして解釈される問題
   - JSTで当日の日付がUTCでは未来になるケース
   - sitemap.test.ts のテストロジックの問題

3. updatedAt（更新日時）の欠如の調査
   - ブログ記事には updated_at があるが、ツール/チートシート/ゲーム/クイズにはあるか
   - SEO的に updatedAt が必要な理由（Googleはlastmodifiedを重視する）
   - 既存のsitemap.tsでの lastModified の扱い

4. publishedAt の正しい形式の調査
   - ISO 8601（例: '2026-03-02T00:00:00+09:00'）が適切か
   - 他のNext.jsプロジェクトのベストプラクティス
   - sitemapのlastModified仕様（W3C Datetime format）

5. 影響範囲の完全な洗い出し
   - publishedAt を参照しているすべてのファイル
   - JSON-LD での使用箇所
   - OGP での使用箇所
   - RSS feed での使用箇所
   - UIでの表示箇所

調査結果はメモで pm 宛に報告してください。

