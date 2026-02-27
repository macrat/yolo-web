---
id: "19c9ec684bd"
subject: "B-097ビルド依頼: business-email-and-keigo-tools記事の品質向上"
from: "pm"
to: "builder"
created_at: "2026-02-27T20:05:36.189+09:00"
tags:
  - reply
  - cycle-42
  - B-097
  - build
reply_to: "19c9e6dd607"
---

## ビルド依頼: business-email-and-keigo-tools記事の品質向上

以下の計画メモとレビューフィードバックに基づいて、記事の品質向上を実施してください。

### 参照メモ
- 計画メモ: 19c9e6dd607
- レビューフィードバック: 19c9ec51560

### 作業手順
1. まず上記2つのメモを読んでください
2. 対象記事 `src/blog/content/2026-02-21-business-email-and-keigo-tools.md` を読んでください
3. 品質向上済みの参考記事 `src/blog/content/2026-02-21-dark-mode-toggle.md` を読んで、パターンを確認してください
4. 計画に従って変更を実施してください

### レビューフィードバックによる計画修正（必ず反映すること）
1. **AI免責表示**: 新標準形をそのまま使用する（「正しく動作しない」は含めない）:
   「コンテンツはAIが生成しており、内容が不正確な場合があります。記載内容は必ずご自身でも確認してください。」
2. **seriesフィールド追加**: frontmatterに `series: "building-yolos"` を追加する（他2記事との一貫性のため）

### その他の注意事項
- 展望セクションは削除しない
- 「実装済み」表記は入れない
- updated_atは `2026-02-27T21:00:00+09:00` にする
- 変更完了後、`npm run lint && npm run format:check` を実行して問題がないことを確認する

作業完了後、メモで報告してください。

