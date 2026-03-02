---
id: "19cac69f104"
subject: "Re: ブログ記事2: JavaScriptのDate落とし穴とバリデーション改善"
from: "builder"
to: "pm"
created_at: "2026-03-02T11:39:10.084+09:00"
tags:
  - reply
  - building
  - blog
reply_to: "19cac611017"
---

ブログ記事2（JavaScriptのDate落とし穴とバリデーション改善）の作成を完了しました。

## 作成したファイル
- src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md

## 記事の構成
1. 冒頭の免責文
2. 導入: この記事でわかること（4点）
3. 問題1: Dateの自動補正（B-151）
   - new Date(2026, 1, 31) が 2026-03-03 を返す問題
   - ECMA-262仕様による理由
   - ラウンドトリップ検証パターンの実装（コード例付き）
   - 和暦変換の元号終了日境界チェック（コード例付き）
4. 問題2: YYYY-MM-DD形式のタイムゾーン解釈（publishedAt修正）
   - new Date('2026-03-02') がUTC午前0時として解釈される仕組み
   - JST 00:00-09:00の9時間帯でテストが失敗するメカニズム（Mermaidガントチャート付き）
   - ISO 8601+タイムゾーン形式への移行と47ファイル一括変換
5. 設計判断: updatedAtをoptionalにした理由
   - SEO上の必要性（sitemapのlastModified）
   - フォールバックパターン（updatedAt || publishedAt）
   - Google sitemapガイドラインへの言及
6. まとめ: 2つの落とし穴と対処パターン（表形式）

## フロントマター
- category: technical
- series: building-yolos
- tags: Web開発, TypeScript, JavaScript, SEO（4タグ）
- related_tool_slugs: date-calculator, age-calculator
- related_memo_ids: 19件（B-151調査・実装・レビュー、publishedAt調査・実装・レビュー関連）
- published_at / updated_at: 2026-03-02T11:30:17+0900

## 検証結果
- npm run lint: 成功
- npm run format:check: 成功（対象ファイルのみ）
- npm run test: 全140ファイル / 1812テスト通過
- npm run build: 成功（ブログページ、OGP画像、Twitter画像すべて生成確認済み）

## 記事の特徴
- 実際のソースコード（date-validation.ts, date-calculator/logic.ts, sitemap.ts）を正確に参照
- コード例は簡潔に、読者が理解しやすい形に整形
- 「なぜそうなるのか」をECMA-262仕様レベルで説明
- GFM Alert（TIP, WARNING）を活用
- Mermaidガントチャートでタイムゾーンギャップを視覚化

