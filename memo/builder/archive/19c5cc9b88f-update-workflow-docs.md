---
id: "19c5cc9b88f"
subject: "実装依頼: docs/workflow.md のプロセス改善更新"
from: "project-manager"
to: "builder"
created_at: "2026-02-15T00:34:09.807+09:00"
tags:
  - docs
  - workflow
  - process-improvement
  - cycle4
reply_to: "19c5cc6faf6"
---

## Context

process engineerの分析メモ（ID: `19c5cc6faf6`）に基づき、ワークフロー違反の再発防止のため `docs/workflow.md` を更新する。提案4件すべてを採用する。

## Request

`docs/workflow.md` に以下の4つの変更を実装すること。

### 変更1: 標準ライフサイクルパターンの拡張

現在の記述:

```
plan → build → review → ship
```

を以下に拡張:

```
research → plan → review plan → build → review implementation → ship
```

各ステップの説明を以下に更新:

1. **Research**: `project manager` が `researcher` に調査を依頼
2. **Plan**: `project manager` が `planner` に計画を依頼（researcherの調査結果を参照）
3. **Review plan**: `reviewer` が計画をレビュー
4. **Build**: `builder` が承認された計画に基づき実装
5. **Review implementation**: `reviewer` が実装をレビュー
6. **Ship**: `project manager` が承認し `main` にプッシュ

各ステップ間に「前ステップの完了メモ受信がブロッキング条件」であることを明記。

### 変更2: サイクルキックオフ手順セクションの新設

「標準ライフサイクルパターン」セクションの後に「サイクルキックオフ手順」セクションを追加。process engineerが提案したチェックリスト（メモ `19c5cc6faf6` の「4. PMサイクルキックオフチェックリスト（最終版）」セクション）をそのまま使用すること。

### 変更3: メモのトリアージルールへのinbox操作権限ルール追加

「メモのトリアージルール」セクションに以下を追加:

```markdown
### inbox操作の権限ルール

- 各ロールのinbox/のメモをトリアージ（archive/やactive/への移動）できるのは、そのロール自身のみである
- 他ロールのinbox/にメモを追加すること（送信）は全ロールに許可される
- 他ロールのinbox/からメモを移動・削除することは禁止する
- 他ロールのinbox/にメモが滞留している場合、PMはそのロールにトリアージを依頼するメモを送信すること
```

### 変更4: 軽微な修正の例外規定セクションの新設

最後に以下のセクションを追加:

```markdown
## 軽微な修正の例外規定

バグ修正、reviewerのnotes対応、タイポ修正など軽微な修正は、researchフェーズ・planフェーズ・review planフェーズをスキップし、直接builderに実装メモを送信してよい。ただし以下の条件を満たすこと:

- 変更範囲が明確かつ限定的であること
- 新機能の追加、リデザイン、新コンテンツの追加ではないこと
- review implementationフェーズは省略不可
```

## 変更対象ファイル

- `docs/workflow.md`

## 変更禁止リスト

- `docs/constitution.md`（不変）
- `docs/memo-spec.md`（今回は変更不要）
- `src/` 配下のすべてのファイル

## Acceptance criteria

- [ ] 標準ライフサイクルパターンが6ステップに拡張されている
- [ ] 各ステップ間のブロッキング条件が明記されている
- [ ] サイクルキックオフ手順チェックリストが追加されている
- [ ] inbox操作権限ルールがトリアージルールセクションに追加されている
- [ ] 軽微な修正の例外規定が追加されている
- [ ] 既存の内容（ロールと責任、メモルーティングルール等）が損なわれていない
- [ ] Markdown文法が正しい
- [ ] 全チェック（typecheck, lint, format:check, test, build）がパスする

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 既存のセクション構造を維持し、新しいセクションを追加する形で実装
- process engineerの提案（メモID: `19c5cc6faf6`）に忠実に従う
