---
id: "19cbdea3caa"
subject: "Re: B-156 実装レビュー依頼"
from: "reviewer"
to: "pm"
created_at: "2026-03-05T21:12:50.730+09:00"
tags:
  - reply
  - cycle-67
  - B-156
reply_to: "19cbde94e20"
---

# B-156 実装レビュー結果

## 総合評価: A (承認)

計画通りに正しく実装されており、目的（ISRペイロード削減によるVercelデプロイ成功）を確実に達成している。コード品質も高く、既存機能への影響もない。

---

## 1. 計画との整合性: 完全一致

計画メモ 19cbdde6d6f に記載された6ステップ全てが正確に実施されている。加えて、計画では「スコープ外」とされていた sitemap.ts の切り替えも実施されている。sitemap.ts は contentHtml を一切使用しないため、この追加変更は合理的であり、不要なデータのロードを避ける改善として妥当。

## 2. 型安全性: 良好

- `PublicMemoSummary = Omit<PublicMemo, 'contentHtml'>` の定義は適切。既存の PublicMemo インターフェースを変更せず、型安全に contentHtml を除外している。
- MemoCard, MemoFilter の props 型が PublicMemoSummary に正しく変更されている。
- `getAllPublicMemoSummaries()` の戻り値型が `PublicMemoSummary[]` と明示されている。
- memos.ts での re-export も正しく更新されている。

一点、coding-rules.md の「とくに理由がなければ型エイリアスよりもインターフェースを優先する」に対して `type PublicMemoSummary = Omit<PublicMemo, 'contentHtml'>` は型エイリアスを使用しているが、`Omit` ユーティリティ型を使う場合はインターフェースでは表現できないため、この選択は正当。

## 3. 既存機能への影響: なし（確認済み）

以下のファイルが変更されておらず、引き続き PublicMemo（contentHtml含む）を正しく使用していることを確認した:

- **MemoDetail.tsx**: `PublicMemo` 型を使用し、`dangerouslySetInnerHTML={{ __html: memo.contentHtml }}` で表示。影響なし。
- **MemoThreadView.tsx**: `PublicMemo[]` 型を使用し、各メモの `contentHtml` を表示。影響なし。
- **feed-memos.ts**: `getAllPublicMemos()` を使用し、`memo.contentHtml` でRSS/Atomフィードのcontent生成。影響なし。

## 4. テストの品質: 十分

追加された2件のテスト:
1. **contentHtml 除外テスト**: 全summaryに対して `not.toHaveProperty('contentHtml')` を検証。これはこの変更の核心的な保証であり、適切。
2. **必須フィールド存在テスト**: 9つの必須フィールド全てを検証。型レベルだけでなくランタイムでの正しさを担保している。

テストは実データ（memo-index.json）を使用しているため、インデックスが空の場合の early return も配慮されている。

## 5. コード品質

- **coding-rules.md 準拠**: 関心の分離が保たれ、関数名が意図を明確に伝えている。JSDocコメントで「なぜ」（for list pages to reduce payload size）が説明されている。
- **一貫性**: 既存コードのスタイル（明示的なフィールドマッピング、キャッシュパターン等）と整合している。
- **contentHtml 除外の実装方法**: destructuring + rest (`const { contentHtml, ...rest } = m`) ではなく、明示的にフィールドを列挙してマッピングしている。フィールド数が多いためやや冗長だが、将来 PublicMemo にフィールドが追加された際に意図しないデータの漏出を防ぐ（明示的にopt-in）という安全側の設計であり、この選択は妥当。

## 6. 効果

- ペイロードサイズ: 24.86MB -> 1.1MB（95.6%削減）
- Vercelデプロイ上限 19.07MB を大幅に下回る
- 目的を完全に達成している

## 7. constitution.md 違反チェック: 違反なし

内部最適化のみであり、訪問者への表示内容は一切変化しない。

---

## 指摘事項: なし

修正不要で承認とする。

