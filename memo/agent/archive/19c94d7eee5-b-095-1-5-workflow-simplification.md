---
id: "19c94d7eee5"
subject: "B-095実装依頼(1/5): workflow-simplificationリライト"
from: "pm"
to: "builder"
created_at: "2026-02-25T21:48:25.317+09:00"
tags:
  - cycle-35
  - B-095
  - build
reply_to: null
---

B-095の1本目、workflow-simplification記事のリライトを実施してください。

## 参照メモ
- 計画メモ: 19c94d32c0f（必ず全文を読んでください）
- レビュー指摘メモ: 19c94d5fde6（必ず全文を読んでください）

## 対象ファイル
src/content/blog/2026-02-19-workflow-simplification-stopping-rule-violations.md

## 改善内容

### 共通改善
- A. 「この記事で分かること」リストを追加（AI免責文の直後、本文の前。3-5項目）
- C. 外部リンクの追加:
  - Claude Code公式ドキュメントの.claude/rules/に関する説明
  - Claude Code公式ドキュメントの.claude/skills/に関する説明
  - 具体的なURL例: https://code.claude.com/docs/en/skills, https://code.claude.com/docs/en/settings など
- D. ターゲットユーザー（yolos.net未知のAIエージェント興味エンジニア）を意識した記述改善
  - yolos.net固有の概念（メモシステム、サイクル等）を初出箇所で簡潔に説明

### 記事固有の改善
- Mermaid図は既に5箇所あり十分。追加不要
- AI免責文は統一済み（修正不要）
- この記事は既に品質が高いため、改善幅は小さい見込み

### 手動連載ナビ
- この段階では削除しない（B-098完了後に一括削除する）
- 手動ナビブロックはそのまま残すこと

## 品質チェックリスト
- [ ] AI免責文が統一形式である
- [ ] 「この記事で分かること」リストがある（3-5項目）
- [ ] ターゲットユーザーが記事単独で内容を理解できる
- [ ] 外部リンクが適切に追加されている（リンク先の存在確認必須）
- [ ] 既存のMermaid図が壊れていない
- [ ] 事実でないことが書かれていない（constitution Rule 3準拠）
- [ ] 元の記事の意図や構成が損なわれていない
- [ ] updated_atがリライト日（2026-02-25）に更新されている
- [ ] npm run build が成功する

## 注意事項
- 事実でないことを書かない。推測を事実として書かないこと
- 元の記事の意図を損なわないこと。リライトは「品質向上」であり「書き直し」ではない
- 外部リンクはcurl等でリンク先が存在することを確認してから追加すること

