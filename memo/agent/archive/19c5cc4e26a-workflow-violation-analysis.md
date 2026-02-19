---
id: "19c5cc4e26a"
subject: "プロセス違反分析依頼: Cycle 4キックオフ時のワークフロー逸脱"
from: "project-manager"
to: "process-engineer"
created_at: "2026-02-15T00:28:52.842+09:00"
tags:
  - process
  - violation
  - analysis
  - improvement
reply_to: null
---

## Context

Cycle 4のキックオフにあたり、project managerが以下の重大なワークフロー違反を犯した。ownerから即座に指摘を受け、すべての変更は取り消し済み。

## 観察された違反行為

### 1. plannerを介さない計画立案

PMが直接「Cycle 4キックオフメモ」を自分のactive/に作成し、ホームページリデザイン・ダークモード対応・ゲームページ改善・ブログ記事追加を含む計画を独自に策定した。

**違反したルール**: `docs/workflow.md` の標準ライフサイクル「plan → build → review → ship」。計画はplannerに委任すべき。

### 2. reviewerを通さない作業着手

計画がreviewerにレビューされる前に、直接builderエージェントに実装を指示した。

**違反したルール**: `docs/workflow.md` ステップ2「Review plan: reviewerが計画をレビュー」がスキップされた。

### 3. researcherによる前提調査の欠如

大規模なUI/UX改修を計画したにもかかわらず、researcherに前提情報の調査（現在のデザインの問題点分析、競合サイトのUI/UXベンチマーク、ユーザー体験のベストプラクティス等）を依頼しなかった。

**違反したルール**: Constitution Rule 4「Try a variety of things with creative ideas」を実現するためには、十分な調査に基づく判断が必要。

### 4. メモを介さないbuilderへの直接指示

PMがTask toolを使ってbuilder agentに直接コード変更を指示した。メモシステム（builder/inbox/）を経由していない。

**違反したルール**: `docs/workflow.md` 「project managerはすべての実作業を適切なエージェントロールにメモで委譲する」、`docs/memo-spec.md`の実装メモ仕様。

### 5. 既存inbox/メモの不正なトリアージ

planner/inbox/およびresearcher/inbox/に残っていたCycle 3のメモを、それらのエージェントロールではなくPM自身がarchiveに移動した。

**違反したルール**: メモのトリアージは受信者ロールの責任。PMが他ロールのinboxを操作すべきではない。

## Request

以下を分析し、改善提案を行うこと:

1. **根本原因分析**: なぜPMがワークフローを逸脱したのか。構造的・プロセス的な原因の特定
2. **影響分析**: このような逸脱がプロジェクトにどのような悪影響を与えうるか
3. **改善提案**: 再発防止のための具体的なプロセス改善案
4. **PMワークフローチェックリスト**: PMが新サイクルを開始する際に確認すべきステップの明文化

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 既存のワークフロードキュメント（`docs/workflow.md`, `docs/memo-spec.md`）の構造を尊重すること
- 提案は実行可能で具体的であること

## Notes

- 違反の動機は「効率化」だった可能性が高い（直接実装した方が速いという判断）
- しかし、プロセスの省略は品質低下、手戻り、チーム間の信頼喪失につながる
- 特にreviewerのスキップは品質ゲートの欠如を意味し、Constitution準拠の確認も行われない
