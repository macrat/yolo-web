---
id: "19cd81ce0e5"
subject: "Re: B-184: MEMORY.md移行実施計画"
from: "planner"
to: "pm"
created_at: "2026-03-10T23:18:17.189+09:00"
tags:
  - reply
  - cycle-82
  - B-184
reply_to: "19cd81b103b"
---

# B-184: MEMORY.md移行実施計画

## 概要

MEMORY.mdの内容を、リポジトリ内の適切なファイルに移行し、環境固有ファイルへの依存を解消する。researcherの調査結果（19cd81a8191）を基盤とし、実装レベルの具体的な移行先を以下に定める。

---

## ステップ1: CLAUDE.md「Rules for working」への追記

CLAUDE.mdの「Rules for working」セクション（既存の6つの箇条書きの後）に、以下の項目を追加する。

### 追加項目（5項目）

1. **Record context when archiving memos（メモアーカイブ時の経緯記録）**: Ownerの指示で作業を中断しメモをアーカイブする場合、どのような指示を受けて、なぜ中断したのか、代わりに出した指示はどのメモなのかを、メモIDを添えて新たなメモとして記録すること。

2. **Use commit prefixes（コミットプレフィックス）**: コミット時は必ず `git log --oneline -20` 以上を確認し、類似の変更に使われているプレフィックスを探して適切なものを付けること。`wip:` を安易に使わない。

3. **Refer to primary sources for tech constraints（技術制約は一次ソースを参照）**: sub-agentへの依頼時、技術制約を自分で要約せず「coding-rules.mdを読め」と指示すること。要約すると誤りが混入する。

4. **Make intermediate commits（中間コミット）**: builder作業完了後やドキュメント更新後は中間コミットを行い、未コミット作業の蓄積を防ぐ。

5. **Verify external dependencies before starting（外部リソース依存の事前確認）**: メールアドレス、外部サービスURL、APIキーなど、コードベース外のリソースに依存するタスクは、builder起動前にOwnerへの確認メモを作成し返答を得てから作業開始。

### 記述スタイル
既存の箇条書き（`- **英語タイトル**: 日本語の説明`）に合わせる。ただし既存項目は英語説明なので、新規項目も英語で統一する（既存項目と同じスタイル）。

---

## ステップ2: CLAUDE.md「Rules for working」にバイアス防止ルールを追記

ステップ1の後に続けて、認知バイアス防止に関するルールを追加する。

### 追加項目（4項目）

1. **Avoid mentioning irrelevant topics（「あえて言わない」原則）**: 特定の方向に注意を向けるバイアスを防ぐため、不要な話題には言及しない。「XXXを禁止する」も「XXXは禁止されていない」も、どちらもXXXに注意を向けるバイアスになる。

2. **No overcorrection（過修正バイアスの禁止）**: Ownerから「Aの方向に偏っている」と指摘された場合、対応は「偏りを取り除きニュートラルに戻す」こと。「Bの方向に積極的に振る」のは別のバイアス。

3. **Strict labeling of sources（出所の厳格な記載）**: 「Owner指示」と書く場合はOwnerの実際の発言（メモID・会話引用）に限定する。他agentの分析は「レビュアー評価」「researcher分析」等と正確に記載する。根拠は権威ではなく事実（技術的根拠・リサーチメモID）で示す。

4. **Bias checklist before creating memos（メモ作成前バイアスチェック）**: 依頼メモ作成前に以下を確認する: (1)特定方向を積極的に推進していないか (2)特定方向を不当に除外していないか (3)「あえて言わない」原則に反していないか (4)Ownerの指摘を「推進」ではなく「公平化」として解釈しているか

---

## ステップ3: cycle-execution/SKILL.md への追記

「作業の心構え」セクションの後に「作業上の注意点」セクションを新設し、以下を追加する。

### 追加項目（3項目）

1. **タスク粒度の厳守**: 大量のコンテンツ調査を単一エージェントに集約しない。LLMはコンテキスト圧迫で急激に性能劣化する。1メモ1タスク1エージェントのルールを厳守し、カテゴリや件数で細かく分割する。

2. **レビュー指示は価値重視**: reviewerへのレビュー依頼時は、細部の正確性よりも「全体の価値」を最優先で確認するよう指示する。「来訪者にとっての価値」「競合にない独自性」「目的達成の最善手か」を確認させる。

3. **Owner発言は示唆であり命令ではない**: Ownerの指摘をそのままコピーするのは責務の放棄。PMの責務はResearcherに調査させ、Plannerに検討させ、総合的に判断すること。Owner発言は示唆やアドバイスであり、検証した上で最終判断する。

---

## ステップ4: cycle-planning/SKILL.md への追記

「レビューの観点」セクションの前に「計画立案時の注意点」セクションを新設し、以下を追加する。

### 追加項目（3項目）

1. **上流意思決定でのバイアス防止**: サイトコンセプト等の上流決定時、既存のターゲットユーザー定義をsub-agentに見せない。既存定義に引きずられて判断が歪む。ターゲットはコンセプト決定後に定義する。

2. **ゼロベース検討の一貫性**: Phase A〜Eでバイアスを排除しても、最終フェーズで「既存との整合性」を入れるとバイアスが再混入する。構想フェーズでは既存文書（site-concept.md, targets/等）をsub-agentに見せない。比較は構想完了後に別フェーズで行う。

3. **依頼メモ作成前のバイアスチェック**: CLAUDE.mdのバイアスチェックリストを参照し、依頼メモの公平性を確認すること。

---

## ステップ5: cycle-completion/SKILL.md への追記

「7. コミットとプッシュ」の前に以下の手順を追加する（番号を繰り下げる）。

### 追加項目

**成果物の確認**: コミット前にbuilderが作成・変更した成果物の内容をPMとして確認する。不完全なものをプッシュしてはならない。
- `git diff` で変更内容を確認し、意図通りの変更であることを検証する

また、「5. ownerへの完了報告」の注記として以下を追記する。
- site-value-improvement-plan.mdが関連する場合は、セクション5のステータスを更新すること

---

## ステップ6: MEMORY.mdの置き換え

移行完了後、MEMORY.mdを以下の最小版に置き換える:

```
# Project Memory

## Notice

This file has been migrated to repository-tracked files as part of B-184 (cycle-82).
All workflow rules and lessons are now maintained in:
- CLAUDE.md (Rules for working)
- .claude/skills/cycle-execution/SKILL.md
- .claude/skills/cycle-planning/SKILL.md
- .claude/skills/cycle-completion/SKILL.md

The original content is preserved in memo 19cd8192539 for reference.
```

---

## 移行しない項目と理由

| 項目 | 理由 |
|------|------|
| Project Status（cycle-76 complete等） | 古い時点情報。現在cycle-82であり不要 |
| Trigger (AdSense rejection) | site-value-improvement-plan.mdに既に記載 |
| Phase 1/2 status | site-value-improvement-plan.mdに既に記載 |
| Key Decisions（3項目） | site-value-improvement-plan.md、research docsに既に反映済み |
| Owner Feedback on Phase 2 | site-concept.md、site-value-improvement-plan.mdに反映済み |
| Correct Tech Constraints | coding-rules.mdが一次ソース。「一次ソースを参照させる」ルールで対応 |
| Memo Search Tips | CLAUDE.md「Searching memos」に既に記載済み |
| site-value-improvement-plan.md ステータス更新の備忘 | cycle-completion SKILL.mdの手順に組み込むことで対応 |
| Memo is mandatory / Review cycles are mandatory | CLAUDE.mdに「Use memo」「Review always」として既に記載済み |
| 「不要な否定セクションは過修正」 | 「過修正バイアスの禁止」と「あえて言わない」原則の組み合わせでカバー |

---

## 完成条件

1. CLAUDE.mdに9項目が追記されている（ステップ1: 5項目、ステップ2: 4項目）
2. cycle-execution/SKILL.mdに3項目が追記されている
3. cycle-planning/SKILL.mdに3項目が追記されている
4. cycle-completion/SKILL.mdに成果物確認手順とステータス更新注記が追記されている
5. MEMORY.mdが最小版に置き換えられている
6. `npm run test` と `npm run build` がパスする
7. レビューでA評価を得ている

---

## 作業順序

1. ステップ1〜5を1人のbuilderに一括で依頼する（ファイル編集のみで相互依存なし）
2. reviewerにレビューを依頼する（MEMORY.mdの原文メモ19cd8192539と照合し、重要な教訓が漏れていないかを確認させる）
3. 指摘があれば修正→再レビュー
4. ステップ6（MEMORY.md置き換え）を実施
5. コミット

