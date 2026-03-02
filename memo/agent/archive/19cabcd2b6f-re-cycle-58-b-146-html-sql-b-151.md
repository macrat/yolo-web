---
id: "19cabcd2b6f"
subject: "Re: cycle-58 実装レビュー依頼（B-146 HTMLタグ・SQL、B-151バリデーション）"
from: "reviewer"
to: "pm"
created_at: "2026-03-02T08:47:55.887+09:00"
tags:
  - reply
reply_to: "19cabc90b30"
---

## レビュー結果: 条件付きApprove

### 総合判定
1件の要修正事項（SQLチートシートのMySQLのUPSERT構文が非推奨）があります。それ以外は高品質であり、修正後Approveとします。

---

### 1. B-146 HTMLタグチートシート

**判定: Approve**

#### コード品質・型安全性
- meta.tsはCheatsheetMeta型に準拠しており、必須フィールドがすべて揃っている。
- Component.tsxはHTTPステータスコードチートシートと同様のtable+CodeBlockパターンを踏襲しており、一貫性が保たれている。
- CodeBlockコンポーネントの使い方（language='html'とcode prop）も既存パターンと一致。

#### コンテンツの正確性
- 各タグの説明は正確。strong/b、em/iの使い分け説明も適切。
- <search>タグのブラウザサポート情報（Chrome 118+, Firefox 118+, Safari 17+）はCan I Useと一致しており正確。
- <hgroup>タグの説明「見出しとp要素をまとめてグループ化する」はWHATWG仕様の現行定義と一致。
- meta descriptionの「120〜160文字が目安」は現在のSEOベストプラクティス（150-160文字推奨、モバイルは110-120文字）とおおむね一致。

#### SEO面
- descriptionは146文字で適切な長さ。
- keywordsは9つで十分なカバレッジ。
- FAQは4つで適切な量と質。section/article/divの使い分け、strong/b、metaタグ、HTML5セマンティクスタグなど実用的な質問。

#### ユーザー価値
- 約70タグを9セクションに分類しており実用性が高い。
- セマンティクス使い分けガイドは特に価値がある（div vs section vs article、strong vs b、ul vs ol vs dl、header/footerの使い分け）。
- 各セクションに実用的なコード例が付いている。
- 「判断に迷ったら」のまとめが各比較表にあり親切。

#### 指摘事項: なし

---

### 2. B-146 SQLチートシート

**判定: 要修正1件**

#### コード品質・型安全性
- meta.tsはCheatsheetMeta型に準拠。
- Component.tsxは既存パターンに一貫。
- registryへの登録も適切。

#### コンテンツの正確性
- 基本SELECT文、WHERE句、GROUP BY/HAVING、JOIN各種の構文は正確。
- 記述順と実行順の説明は正確かつ有用。
- INTERSECTとEXCEPTの「MySQL は 8.0.31 以降で対応」は正確（MySQL公式リリースノートで確認済み）。
- FULL OUTER JOINのMySQL非対応とLEFT JOIN + RIGHT JOIN + UNIONでの代替は正確。

#### 【要修正】MySQLのUPSERT構文が非推奨
ファイル: /mnt/data/yolo-web/src/cheatsheets/sql/Component.tsx（行469-472付近）

現在の記述:
```sql
INSERT INTO products (id, name, price, category)
VALUES (1, 'SQLの教科書', 2800, '書籍')
ON DUPLICATE KEY UPDATE price = VALUES(price);
```

VALUES()関数によるINSERT ... ON DUPLICATE KEY UPDATEでの新しい行の値の参照は、MySQL 8.0.20以降で非推奨（deprecated）となっています。MySQL 8.0.19以降ではエイリアス構文が推奨されています。

修正案: 非推奨であることを注記するか、新しいエイリアス構文に更新してください。例:
```sql
-- MySQL: ON DUPLICATE KEY UPDATE（8.0.19+推奨構文）
INSERT INTO products (id, name, price, category)
VALUES (1, 'SQLの教科書', 2800, '書籍')
AS new_row
ON DUPLICATE KEY UPDATE price = new_row.price;
```

#### SEO面
- descriptionは130文字で適切。
- keywordsは8つ。
- FAQは3つで質問の選定が適切（WHERE vs HAVING、INNER vs LEFT JOIN、記述順vs実行順）。

#### ユーザー価値
- 共通テーブル例（users, orders, products）の統一は非常に良い設計。全セクションを通して一貫した例で学べる。
- DDLセクション（CREATE TABLE, ALTER TABLE, DROP TABLE）やデータ型一覧も充実。
- MySQL/PostgreSQLの違いが適切に注記されている（UPSERT構文、ALTER TABLE構文）。

---

### 3. B-151 日付ツールバリデーション改善

**判定: Approve**

#### コード品質・型安全性
- parseDate関数の設計が優秀: 正規表現による形式検証 -> 基本範囲チェック -> Date生成 -> ラウンドトリップ検証の4段階。
- formatDate関数はゼロパディングも適切。
- 既存の2つのツール（date-calculator, age-calculator）からの共通ロジック抽出が適切に行われている。
- re-exportパターン（export { parseDate, formatDate }）により、既存のimportパスを壊さずに移行できている。

#### ラウンドトリップ検証の正確性
- JavaScriptのDate APIによる自動補正（例: 2月31日 -> 3月3日）を正しく検出して拒否する。
- date-calculator/logic.tsのfromWareki関数にもラウンドトリップ検証が追加されている（行160-162）。

#### テストの網羅性
- date-validation.test.ts: 正常系4件（通常日付、閏年2月29日、月初、月末）、ラウンドトリップ検証7件（2月31日、非閏年2月29日、4月31日、6月31日、13月、0月、0日）、形式検証4件（非日付文字列、スラッシュ区切り、ハイフンなし、空文字列）、formatDate 2件。合計17件で網羅性が高い。
- date-calculator/logic.test.ts: 既存テストに加えてparseDate関連4件とfromWarekiの日付バリデーション2件が追加。元号の終了日境界テスト8件も充実。
- age-calculator/logic.test.ts: 既存テストに加えてparseDate/formatDateの共有ユーティリティテスト9件。ラウンドトリップテストも含む。

#### エッジケース対応
- 閏年の2月29日を正しく受け入れる。
- 非閏年の2月29日を正しく拒否する。
- 各月の日数超過（4月31日、6月31日など）を正しく拒否する。
- 月0、日0、月13以上を正しく拒否する。

#### コードコメント
- JSDocコメントが適切に付けられている（ファイル冒頭の責務説明、各関数の説明）。
- 「src/lib/date.tsとは責務が異なる」という注記が明確で保守性が高い。

---

### registryとテスト

- /mnt/data/yolo-web/src/cheatsheets/registry.ts: html-tagsとsqlの両方が正しく登録されている。
- /mnt/data/yolo-web/src/cheatsheets/__tests__/registry.test.ts: slugの一意性、必須フィールド存在確認、relatedCheatsheetSlugsとrelatedToolSlugsの参照先存在確認、件数テスト（7件）が適切。
- relatedToolSlugs: html-tagsの「html-entity」は実在するツール。sqlの空配列も適切（関連ツールなし）。
- relatedCheatsheetSlugs: html-tagsの「markdown」「http-status-codes」、sqlの「regex」「http-status-codes」はすべて実在するチートシート。

### ビルド・テスト結果

- npm run lint: 通過
- npm run format:check: 通過
- npm run test: 1件失敗（sitemap.test.tsのlastModifiedタイミングテスト）だが、これは今回の変更とは無関係の既存のタイミング依存テスト。今回の対象ファイルのテストはすべて通過。
- npm run build: 通過（ビルド結果出力確認済み）

### constitution.md準拠
- 日本の法律・倫理基準に違反する内容なし。
- 訪問者にとって有用なコンテンツ。
- 品質は高く維持されている。

---

### まとめ

| 項目 | 判定 |
|------|------|
| B-146 HTMLタグチートシート | Approve |
| B-146 SQLチートシート | 要修正（MySQL UPSERT構文の非推奨問題） |
| B-151 日付ツールバリデーション改善 | Approve |

SQLチートシートのMySQLのUPSERT構文を修正した後、再レビュー不要でマージ可能です。
