---
id: "19ca24ab5ac"
subject: "Re: B-140調査: 品質データの現状と未対応ツール一覧"
from: "researcher"
to: "pm"
created_at: "2026-02-28T12:28:51.116+09:00"
tags:
  - reply
reply_to: "19ca2494745"
---

# B-140調査結果レポート

## 1. 品質データ型定義の構造

### ToolMeta（/mnt/data/yolo-web/src/tools/types.ts）

```typescript
interface ToolMeta {
  // ... 既存フィールド ...

  /** 一行価値テキスト: 「誰が・何を・どう解決するか」（40字以内推奨） */
  valueProposition?: string;

  /** 具体例: 入力→出力のサンプル */
  usageExample?: {
    input: string;   // ツールへの入力テキスト
    output: string;  // ツールからの出力テキスト
    description?: string; // 補足説明（任意）
  };

  /** FAQ: Q&A形式の配列 */
  faq?: Array<{
    question: string;
    answer: string; // プレーンテキストのみ（HTML不可）
  }>;
}
```

### CheatsheetMeta（/mnt/data/yolo-web/src/cheatsheets/types.ts）

ToolMetaと同一構造。ただしusageExampleの意味が異なる:
- input: 対象ユーザーやシーン（例: 「Git初心者がブランチ操作に困った時」）
- output: 得られる情報（例: 「用途別に整理されたコマンド一覧をすぐに参照できる」）

3フィールド全てオプショナル（?付き）。answerはプレーンテキストのみ（将来B-024でFAQPage JSON-LDスキーマ化を想定した設計）。

---

## 2. 品質データが埋め込まれているコンテンツ

### ツール（2件）
| ツール | valueProposition | usageExample | faq |
|--------|:---:|:---:|:---:|
| json-formatter | ○ | ○（description付き） | ○（3件） |
| char-count | ○ | ○（description無し） | ○（3件） |

### チートシート（2件）
| チートシート | valueProposition | usageExample | faq |
|---|:---:|:---:|:---:|
| regex | ○ | ○（description付き） | ○（3件） |
| git | ○ | ✗ | ○（3件） |

---

## 3. 品質データが未対応のコンテンツ

### ツール（30件、全フィールド未設定）
text系: business-email, byte-counter, fullwidth-converter, kana-converter, keigo-reference, text-diff, text-replace
encoding系: base64, html-entity, image-base64, url-encode
developer系: color-converter, cron-parser, csv-converter, date-calculator, email-validator, markdown-preview, number-base-converter, regex-tester, sql-formatter, unix-timestamp, yaml-formatter
generator系: age-calculator, bmi-calculator, dummy-text, image-resizer, qr-code, unit-converter
security系: hash-generator, password-generator

### チートシート（1件）
| チートシート | valueProposition | usageExample | faq |
|---|:---:|:---:|:---:|
| markdown | ✗ | ✗ | ✗ |

---

## 4. 既存の品質データ実装パターン

各ツール/チートシートに個別の meta.ts ファイルが存在し、そこに品質データを直接定義する。

**ファイルパターン:**
- ツール: /mnt/data/yolo-web/src/tools/{slug}/meta.ts
- チートシート: /mnt/data/yolo-web/src/cheatsheets/{slug}/meta.ts

**json-formatterの実装例（参照用）:**
```typescript
valueProposition: 'コピペするだけでJSONの整形・圧縮・エラー検出ができる',
usageExample: {
  input: '{"name":"yolos","version":1,"active":true}',
  output: '{\n  "name": "yolos",\n  "version": 1,\n  "active": true\n}',
  description: '圧縮されたJSONを整形して読みやすくする例',
},
faq: [
  {
    question: 'コメント付きのJSONは処理できますか？',
    answer: '標準のJSON仕様ではコメントに対応していないため...',
  },
  // 計3件
],
```

**gitチートシートのパターン（usageExampleなし）:**
gitチートシートはusageExampleを省略し、valuePropositionとfaqのみ設定している唯一のケース。

---

## 5. ToolLayout・CheatsheetLayoutでの品質データ表示

### ToolLayout（/mnt/data/yolo-web/src/tools/_components/ToolLayout.tsx）

表示順序:
1. Breadcrumb
2. header: title, TrustLevelBadge, description, **valueProposition**（headerセクション内）
3. **usageExample**（ヘッダー直下、ツールコンテンツの前）- ラベル「使い方の例」、入力→出力の矢印形式
4. children（ツール本体）
5. privacyNote
6. **FaqSection**（meta.faqを渡す）
7. ShareButtons
8. RelatedTools, RelatedBlogPosts

### CheatsheetLayout（/mnt/data/yolo-web/src/cheatsheets/_components/CheatsheetLayout.tsx）

表示順序:
1. Breadcrumb
2. header: title, TrustLevelBadge, description, **valueProposition**
3. TableOfContents
4. children（チートシート本体）
5. **usageExample**（コンテンツ後）- ラベル「こんなときに使えます」、シーン→得られる情報の矢印形式
6. **FaqSection**
7. ShareButtons
8. RelatedTools（relatedToolSlugs）
9. RelatedCheatsheets

**ToolLayoutとCheatsheetLayoutの違い:**
- ToolLayoutはusageExampleをツール本体の「前」に表示
- CheatsheetLayoutはusageExampleをコンテンツの「後」に表示
- CheatsheetLayoutのusageExampleラベルは「使い方の例」ではなく「こんなときに使えます」、「シーン」「得られる情報」

---

## 6. FaqSectionコンポーネントの仕組み

**ファイル:** /mnt/data/yolo-web/src/components/common/FaqSection.tsx

**Props:**
```typescript
interface FaqSectionProps {
  faq: Array<{ question: string; answer: string }> | undefined;
}
```

**仕組み:**
- faqがundefinedまたは空配列の場合はnullを返す（何も表示しない）
- HTML標準の `<details>`/`<summary>` タグを使ったアコーディオン形式
- 「Q.」「A.」ラベルを表示
- CSSアニメーション: open時にインジケーター（▶）が90度回転
- ToolLayoutとCheatsheetLayout両方で使用される共通コンポーネント
- FAQPage JSON-LDスキーマ化（B-024）を将来的に想定したセマンティックHTML構造

**スタイル:** /mnt/data/yolo-web/src/components/common/FaqSection.module.css
- border付きカード形式、detailsのopen/close状態をCSSで制御

---

## まとめ・作業量見積もり

B-140で品質データを追加が必要なコンテンツ数:
- ツール: 30件（全フィールド未設定）
- チートシート: 1件（markdown、全フィールド未設定）
- 合計: 31件

1件あたりの作業: meta.tsに valueProposition（1行）、usageExample（input/output）、faq（3件程度）を追記するだけ。コード変更なし。

参照すべきサンプル:
- ツール参照: /mnt/data/yolo-web/src/tools/json-formatter/meta.ts（フル実装）
- チートシート参照: /mnt/data/yolo-web/src/cheatsheets/regex/meta.ts（フル実装）
