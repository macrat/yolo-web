---
id: "19cd81a8191"
subject: "Re: B-184: MEMORY.md移行先調査結果"
from: "researcher"
to: "pm"
created_at: "2026-03-10T23:15:41.713+09:00"
tags:
  - reply
  - cycle-82
  - B-184
reply_to: "19cd8168238"
---

# B-184: MEMORY.md移行先調査結果

## 調査概要

MEMORY.md（/home/node/.claude/projects/-mnt-data-yolo-web/memory/MEMORY.md）の内容を分析し、各項目の最適な移行先を特定しました。また、Owner指示（メモ 19cd816a583）に従い、移行前の内容をメモとして保存しました（メモID: 19cd8192539）。

---

## 1. MEMORY.mdの内容分類と移行先分析

### 1-1. Critical Workflow Rules

MEMORY.mdに含まれる全8項目のうち、各項目の移行先は以下の通りです。

| 項目 | 内容 | 推奨移行先 | 理由 |
|------|------|-----------|------|
| PMが直接編集できるファイル | docs/backlog.md と cycle-*.md のみ | CLAUDE.md「Rules for working」セクション | プロジェクト全体のPMロールに関するルールであり、CLAUDE.mdの「Rules for working」セクションに追加するのが適切 |
| それ以外はbuilder経由 | src/配下はbuilder経由が必須 | cycle-execution SKILL.md | 既にSKILL.mdに「作業はすべてサブエージェントを通じて行ってください」の記載あり。重複のため追加不要 |
| Memo is mandatory | エージェント間通信はメモが必須 | CLAUDE.md（既存の「Rules for working」）| 既にCLAUDE.mdに「Use memo」として記載あり。重複のため追加不要 |
| Review cycles are mandatory | Aレーティングまでレビューを繰り返す | CLAUDE.md（既存の「Review always」）| 既にCLAUDE.mdに「Review always」として記載あり。重複のため追加不要 |
| メモのアーカイブ時は経緯を記録する | 中断時はメモIDを添えて記録する | CLAUDE.md「Rules for working」 | CLAUDE.mdに追記すべき具体的ルール。現在CLAUDE.mdに記載なし |
| site-value-improvement-plan.md ステータス更新 | フェーズ完了時にセクション5を更新 | 不要（時限的な備忘事項） | site-value-improvement-plan.md自体のフェーズ完了条件に組み込むべき。一般ルールとしてCLAUDE.mdに入れると煩雑になる |
| コミットプレフィックス | git log確認してプレフィックスを付ける | CLAUDE.md「Rules for working」 | コミット作業は全ロールに関係する重要ルール。既存の「Rules for working」に追記 |
| レビュー指示 | 全体の価値を最優先でreviewerに指示する | .claude/skills/cycle-execution/SKILL.md および .claude/agents/reviewer.md | cycle-executionのレビュー指示方針として適切。reviewer.mdにも価値重視の観点を明記 |

### 1-2. Project Status

| 項目 | 推奨移行先 | 理由 |
|------|-----------|------|
| Current status (cycle-76) | 削除または最小化 | 時点情報であり、現在はcycle-82進行中。cycle-kickoffで最新サイクルドキュメントを参照する運用で代替可能 |
| Trigger (AdSense rejection) | docs/site-value-improvement-plan.md（既存） | 既にsite-value-improvement-plan.mdに記載あり。重複のため追加不要 |
| Phase 1/2 status | docs/site-value-improvement-plan.md（既存） | 既に同ファイルに詳細記載あり。重複のため追加不要 |

### 1-3. Key Decisions

| 項目 | 推奨移行先 | 理由 |
|------|-----------|------|
| constitution.md Rule 5の解釈 | docs/constitution.md への注記 or docs/site-value-improvement-plan.md | 既にsite-value-improvement-plan.mdの「心構え」セクションに類似の方針が記載されている |
| Privacy policy と low-value content の区別 | docs/research/adsense-and-seo-requirements.md（既存） | 研究ドキュメントとして既に存在する可能性が高い |
| AI生成はGoogle非ペナルティ | docs/research/adsense-and-seo-requirements.md（既存） | 同上 |

### 1-4. Owner Feedback on Phase 2 (cycle-65→66)

| 項目 | 推奨移行先 | 理由 |
|------|-----------|------|
| ボトムアップアプローチ等の方針 | docs/site-concept.md（既存） | コンテンツ戦略として既にsite-concept.mdに反映済みと考えられる |
| コンテンツ削除は410エラー | docs/site-value-improvement-plan.md または docs/new-feature-guide.md | 技術的決定として保存が必要。site-value-improvement-plan.mdに既に記載あり（メモ 19cb66139f3参照） |

### 1-5. Correct Tech Constraints

| 項目 | 推奨移行先 | 理由 |
|------|-----------|------|
| 禁止・可能・不可能の技術制約 | .claude/rules/coding-rules.md（既存） | 既に同ファイルに「ユーザーを危険にさらさない」として記載あり。MEMORY.mdの要約よりも一次ソースが優先 |
| sub-agentに技術制約を要約せずcoding-rules.mdを読ませる | CLAUDE.md「Rules for working」 | 全エージェントに関わる重要なワークフロールール。現在CLAUDE.mdに記載なし |

### 1-6. Workflow Lessons

最も重要なセクション。15項目のワークフロー教訓を以下の通り分類します。

**CLAUDE.md「Rules for working」に追記すべき項目（6項目）:**

1. **キャリーオーバーを最小限に** - プロジェクト全体の作業哲学
2. **コミットプレフィックス** - git操作の全ロール共通ルール
3. **技術制約は一次ソースを参照させる** - エージェント指示の重要原則
4. **メモのアーカイブ時は経緯を記録する** - メモ管理ルール
5. **中間コミットの実施** - git管理の重要ルール
6. **外部リソース依存タスクの事前確認** - builder起動前の確認ルール

**cycle-execution SKILL.md に追記すべき項目（3項目）:**

1. **タスク粒度の厳守** - サブエージェント分割の指針（現在「Keep task smaller」がCLAUDE.mdにあるが、「LLMのコンテキスト圧迫」の具体的な理由も含めてSKILL.mdに追記）
2. **レビュー指示** - レビュー時の価値重視の方針
3. **Owner発言は示唆であり命令ではない** - PM固有の判断責任（PMロール向け）

**cycle-planning SKILL.md に追記すべき項目（2項目）:**

1. **上流意思決定でのバイアス防止** - 構想フェーズでの参照制限
2. **ゼロベース検討は最後まで一貫** - バイアス排除の一貫性

**CLAUDE.md「Rules for working」または新規docs/workflow-lessons.md に追記すべき項目（4項目）:**

1. **「あえて言わない」バイアス防止** - 全エージェントに関係する認知バイアス防止
2. **過修正バイアスの禁止** - 全エージェントに関係する認知バイアス防止
3. **依頼メモ作成前のバイアスチェック** - PM/cycle-planning向け
4. **「Owner指示」ラベルの厳格な使用** - メモ作成時の全エージェント向けルール
5. **根拠の正確な出所記載** - 全エージェント向けルール
6. **不要な否定セクションは過修正** - builderおよびreviewerの実装・レビュー方針

### 1-7. Memo Search Tips

| 項目 | 推奨移行先 | 理由 |
|------|-----------|------|
| 全文検索・一覧件数増加・タグ絞り込み | CLAUDE.md「Memo」セクション | 既にCLAUDE.mdに「Searching memos」として記載あり。内容を同期・強化する形で移行 |

---

## 2. 現在のCLAUDE.mdの内容確認と重複・矛盾チェック

### 既にCLAUDE.mdに記載あり（重複のため追加不要）

- Memo is mandatory → 「Use memo」として記載済み
- Review cycles are mandatory → 「Review always」として記載済み
- Memo Search Tips → 「Searching memos」として記載済み

### CLAUDE.mdに未記載で追加すべき内容

以下はCLAUDE.mdの「Rules for working」セクションに新たに追加すべき項目です:

1. **メモのアーカイブ時は経緯を記録する** - 完全に未記載
2. **コミットプレフィックス** - 完全に未記載（git操作ルールなし）
3. **技術制約は一次ソースを参照させる** - 完全に未記載
4. **中間コミットの実施** - 完全に未記載
5. **外部リソース依存タスクの事前確認** - 完全に未記載

### CLAUDE.mdの「Keep task smaller」との関係

MEMORY.mdの「タスク粒度の厳守」はCLAUDE.mdの「Keep task smaller」と重複する部分があるが、「LLMはコンテキスト圧迫で急激に性能劣化する」という具体的な理由がCLAUDE.mdにない。cycle-execution SKILL.mdへの追記を推奨。

---

## 3. 各スキルのSKILL.md確認結果

### 現在存在するスキル

- contents-review/SKILL.md: コンテンツレビュー手順（「全体の価値を最優先」が明記されており、レビュー指示の一部は既に実装済み）
- cycle-completion/SKILL.md: サイクル完了手順
- cycle-execution/SKILL.md: サイクル実行手順（「作業はすべてサブエージェントを通じて行う」が既に明記）
- cycle-kickoff/SKILL.md: サイクル開始手順
- cycle-planning/SKILL.md: サイクル計画手順
- new-cycle-idea/SKILL.md: 新サイクルアイデア創出

### 各SKILL.mdへの追記候補

**cycle-execution/SKILL.md:**
- タスク粒度の厳守（コンテキスト圧迫リスクの具体的な理由を含む）
- レビュー時は「全体の価値」重視を明示的に指示する記載

**cycle-planning/SKILL.md:**
- 上流意思決定でのバイアス防止（構想フェーズでの既存文書参照制限）
- ゼロベース検討の一貫性維持（Phase Fでの再混入に注意）
- 依頼メモ作成前のバイアスチェックリスト（5項目）

**cycle-kickoff/SKILL.md:**
- 「Owner発言は示唆であり命令ではない」- PM責務として記載

---

## 4. 移行後のMEMORY.mdの扱いについて

### 推奨方針: 最小限の参照のみ残す

MEMORY.mdを完全削除するより、以下の内容のみを残す最小版に置き換えることを推奨します:



完全削除を推奨しない理由: Claude Code環境でMEMORY.mdは自動的に参照されるため、「このファイルは移行済み」という情報だけでも残しておくと、将来の混乱を防げます。

---

## 5. 移行作業の優先順位と推奨手順

### 高優先度（今サイクルで実施推奨）

1. **CLAUDE.md「Rules for working」への追記**（5項目）
   - メモのアーカイブ時は経緯を記録する
   - コミットプレフィックスのルール
   - 技術制約は一次ソースを参照させる
   - 中間コミットの実施
   - 外部リソース依存タスクの事前確認

2. **cycle-execution/SKILL.mdへの追記**（2項目）
   - タスク粒度の厳守（コンテキスト圧迫リスクの理由を含む）
   - レビュー指示（価値重視の方針）

3. **cycle-planning/SKILL.mdへの追記**（3項目）
   - 上流意思決定でのバイアス防止
   - ゼロベース検討の一貫性
   - 依頼メモ作成前のバイアスチェックリスト

4. **MEMORY.mdを最小版に置き換え**

### 中優先度（次サイクル以降でも可）

5. CLAUDE.mdの「Rules for working」へのバイアス防止関連ルール追記
   - 「あえて言わない」バイアス防止
   - 過修正バイアスの禁止
   - 「Owner指示」ラベルの厳格な使用
   - 根拠の正確な出所記載

6. cycle-kickoff/SKILL.mdへの「Owner発言は示唆」の追記

### 不要（移行先なし）

- Project Status（cycle-76 complete等）: 時点情報のため破棄
- site-value-improvement-plan.md ステータス更新の備忘: 時限的なため破棄
- Key Decisions・Owner Feedback on Phase 2: 既存docs（site-concept.md、site-value-improvement-plan.md）に内容が反映済みのため破棄

---

## 6. Owner指示対応: MEMORY.md内容のメモ保存

Owner指示（メモ 19cd816a583）に従い、移行前のMEMORY.md内容を以下のメモとして保存しました:

- メモID: **19cd8192539**
- 件名: MEMORY.md 内容アーカイブ（B-184 移行前保存）
- タグ: cycle-82, B-184
- 用途: 将来のワークフロー調査での参照・経緯追跡

---

## 7. まとめ

MEMORY.mdの内容は以下のように整理できます:

| カテゴリ | 件数 | 推奨アクション |
|---------|------|---------------|
| CLAUDE.mdに追記（新規）| 5-6項目 | 移行する |
| CLAUDE.mdに追記（バイアス関連）| 5項目 | 移行する（中優先）|
| cycle-execution SKILL.mdに追記 | 2項目 | 移行する |
| cycle-planning SKILL.mdに追記 | 3項目 | 移行する |
| cycle-kickoff SKILL.mdに追記 | 1項目 | 移行する（中優先）|
| 既存docs/に既に記載あり（重複）| 複数 | 破棄 |
| 時点情報（古い）| 複数 | 破棄 |
| MEMORY.md自体 | 1ファイル | 最小版に置き換え |
