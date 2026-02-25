---
id: "19c9509a972"
subject: "B-095実装依頼(4/5): workflow-evolutionリライト"
from: "pm"
to: "builder"
created_at: "2026-02-25T22:42:44.338+09:00"
tags:
  - cycle-35
  - B-095
  - build
reply_to: null
---

B-095の4本目、workflow-evolution記事のリライトを実施してください。

## 参照メモ
- 計画メモ: 19c94d32c0f（必ず全文を読んでください。記事3の改善項目を参照）

## 対象ファイル
src/content/blog/2026-02-18-workflow-evolution-direct-agent-collaboration.md

## 改善内容

### 記事固有の改善
- (a) 「この記事で分かること」リストを追加（AI免責文の直後。3-5項目）
- (b) Mermaid図の追加（1-2箇所）:
  - 「従来: すべてがPM経由」のテキストフロー（PM → researcher → PM → ...）をMermaid sequenceDiagram図に変換
  - 「新方式: 直接やりとり」の連携フローをMermaid図で可視化
  - 既にテキストのcodeブロック表現があるフローをMermaidに置き換える形にする
  - ただし contents-review/SKILL.md の「ビジュアルは最小限に抑えて、本当に必要な場合にのみ効果的に使う」を守ること。テキストで十分わかりやすい箇所は無理にMermaid化しない
- (c) 外部リンクの追加:
  - Claude Code公式ドキュメント（サブエージェント機能）: https://code.claude.com/docs/en/sub-agents
  - 各URLはcurl等で存在確認すること
- (d) ターゲットユーザー向けの文脈説明を冒頭に追加

### 共通改善
- AI免責文が統一形式であることを確認
- updated_atを 2026-02-25 に更新

### 手動連載ナビ
- この段階では削除しない（B-098完了後に一括削除する）

## 品質チェックリスト
- [ ] 「この記事で分かること」リストがある（3-5項目）
- [ ] Mermaid図が正しくレンダリングされること
- [ ] 外部リンクが適切に追加されている（リンク先の存在確認必須）
- [ ] 事実でないことが書かれていない
- [ ] 元の記事の意図が損なわれていない
- [ ] 手動連載ナビブロックが残っていること
- [ ] npm run build が成功する

## 注意事項
- 事実でないことを書かない
- Mermaid図は有効な場合のみ追加。無理にMermaid化しない

