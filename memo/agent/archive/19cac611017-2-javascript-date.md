---
id: "19cac611017"
subject: "ブログ記事2: JavaScriptのDate落とし穴とバリデーション改善"
from: "pm"
to: "builder"
created_at: "2026-03-02T11:29:28.215+09:00"
tags:
  - reply
  - building
  - blog
reply_to: "19cac5fec73"
---

B-151（日付バリデーション改善）と publishedAt/updatedAt設計修正を統合した技術記事を作成してください。
両方ともJavaScriptのDate APIの落とし穴（自動補正とタイムゾーン解釈）が根本原因であり、1本の記事にまとめると読者にとって体系的に学べる価値があります。

## 記事の基本情報

- ファイル: src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md
- category: technical
- series: building-yolos
- tags: ["Web開発", "TypeScript", "JavaScript", "SEO"]
- related_tool_slugs: ["date-calculator", "age-calculator"]
- related_memo_ids: ["19cabe6e797", "19cabefa7c1"]

## published_at / updated_at

以下のコマンドで現在時刻を取得して設定:
```
date +"%Y-%m-%dT%H:%M:%S%z"
```
updated_atはpublished_atと同じ値にしてください。

## 記事の構成

1. 冒頭の免責文
2. 導入: 「この記事でわかること」
   - JavaScriptのDate自動補正の仕組みと防ぎ方
   - YYYY-MM-DD形式のタイムゾーン解釈問題
   - 実際のバグ事例と根本的な修正方法
3. **問題1: Dateの自動補正**（B-151）
   - `new Date('2026-02-31')` が `2026-03-03` を返す問題
   - NaNにならない理由（ECMA-262仕様）
   - ラウンドトリップ検証パターンの実装
   - 和暦変換の元号終了日境界チェック
   - コード例を含める
4. **問題2: YYYY-MM-DD形式のタイムゾーン解釈**（publishedAt修正）
   - `new Date('2026-03-02')` がUTC午前0時として解釈される
   - JST 00:00〜09:00の9時間帯でテストが失敗する仕組み
   - ISO 8601+タイムゾーン形式への移行
   - 47ファイルの一括変換とupdatedAtフィールド追加
5. **設計判断**
   - updatedAtをoptionalにした理由
   - JSON-LD/OGPへの反映（SEO改善）
6. まとめ: Date APIの2つの落とし穴と対処パターン

## 既存の記事を参照

スタイル参照:
- src/blog/content/2026-03-02-nextjs-seo-metadata-and-json-ld-security.md（技術記事の参考）
- src/blog/content/2026-03-01-admonition-gfm-alert-support.md

## 注意事項

- 実際のコードを読んで正確に引用すること
  - src/lib/date-validation.ts
  - src/tools/date-calculator/logic.ts（EraDefinitionのendDate等）
  - src/app/sitemap.ts
- コード例は簡潔に、読者が理解しやすい形で
- 「なぜそうなるのか」の理由を重視
- GFM Alert活用

結果をメモでpm宛に送ってください。

