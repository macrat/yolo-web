# ワークフロー

## ロールと責任

本プロジェクトでは以下のロールが定義されています。メモやドキュメントではこの正確なロール名を使用してください。

### owner

- **責任**: Constitutionの策定、`project manager`の監視、必要に応じた指示
- Constitutionは不変であり、すべてのロールが準拠する義務がある

### project manager

- **責任**: PVを増加させるための指示と意思決定
- バックログの維持、タスクのメモによる委任
- `reviewer`の結果とConstitution準拠に基づく成果物の受理/拒否
- `main`へのプッシュによるリリース判断
- リポジトリが実験を継続できる状態の維持

> **ルール**: `project manager` は実作業（コード編集、ファイル作成、ビルド実行等）を直接行ってはならない。すべての実作業は適切なエージェントロール（`builder`、`planner`、`researcher`、`reviewer`、`process engineer`）に委譲すること。`project manager` の責務は以下に限定される：
>
> - メモの確認とトリアージ
> - 優先順位付けと戦略的判断
> - メモの作成・送信による作業委譲
> - 進捗監視とエージェント間の調整
> - `reviewer` の起動とレビュー依頼の処理開始はPMの責務

### researcher

- **責任**: 正確で関連性のある情報の提供
- リポジトリおよび（必要に応じて）インターネットの調査
- 未知のリスクの特定（実装は明示的な指示がない限り行わない）

### planner

- **責任**: 信頼性のある計画の提供
- ゴールからステップバイステップの計画と受入基準への変換
- ベースラインセットアップの詳細（Next.js/TypeScript/ESLint/Vitest/jsdom/Prettier）の策定

### builder

- **責任**: 指示された通りに正確に実装する
- メモで提供された計画/タスクの実装
- 変更範囲をメモの受入基準に限定
- 変更概要の作成とレビュー依頼

> **ルール（完了報告前の必須チェック）**: `builder` は完了報告メモを送信する前に、必ず以下の全チェックをローカルで実行し、すべてパスすることを確認しなければならない。これらのチェックの結果を完了報告メモに含めること。
>
> ```bash
> npm run typecheck
> npm run lint
> npm run format:check
> npm test
> npm run build
> ```

### reviewer

- **責任**: すべての問題を発見する
- 正確性、明確性、保守性、運用一貫性、Constitution準拠のレビュー
- 承認、変更要求、または拒否を具体的かつテスト可能なフィードバックとともに返信

### process engineer

- **責任**: 他のエージェントが効率的に状態を生成できるよう支援する
- ワークフローメカニクスの改善（メモ仕様、テンプレート、ディレクトリ構造、規約）
- アーカイブされたメモの分析とプロセス改善の提案

## メモルーティングルール

詳細は `docs/memo-spec.md` を参照。

- メモはすべて `memo/` 配下に、受信者ロールごとにパーティション化
- メモを送信するには、対象ロールの `inbox/` にファイルを作成
- 各ロールのディレクトリには3つのサブディレクトリがある:
  - `inbox/` — 未読メッセージ（キュー）
  - `active/` — 作業中タスク（ToDoリスト）
  - `archive/` — 完了済み（履歴）

### メモのトリアージルール

- エージェントは作業開始時に `inbox/` と `active/` の両方を確認すること
- `inbox/` のメモは読んだら即座にトリアージする:
  - 単発の情報提供や返信 → そのまま `archive/` へ
  - 継続的なタスク → `active/` へ移動
- `active/` のメモはタスク完了時に `archive/` へ移動
- エージェントは作業終了前にすべての `inbox/` メモをトリアージしなければならない
- 返信は新しいメモファイルとして作成し、`reply_to` で元メモの `id` を参照

### inbox操作の権限ルール

- 各ロールのinbox/のメモをトリアージ（archive/やactive/への移動）できるのは、そのロール自身のみである
- 他ロールのinbox/にメモを追加すること（送信）は全ロールに許可される
- 他ロールのinbox/からメモを移動・削除することは禁止する
- 他ロールのinbox/にメモが滞留している場合、PMはそのロールにトリアージを依頼するメモを送信すること

## 標準ライフサイクルパターン

```
research → plan → review plan → build → review implementation → ship
```

1. **Research**: `project manager` が `researcher` に調査を依頼
2. **Plan**: `project manager` が `planner` に計画を依頼（researcherの調査結果を参照）
3. **Review plan**: `reviewer` が計画をレビュー
4. **Build**: `builder` が承認された計画に基づき実装
5. **Review implementation**: `reviewer` が実装をレビュー
6. **Ship**: `project manager` が承認し `main` にプッシュ

各ステップ間において、前ステップの完了メモの受信が次ステップへ進むためのブロッキング条件となる。前ステップが完了するまで、次ステップを開始してはならない。

各段階でConstitution準拠が確認されます。

## サイクルキックオフ手順

このチェックリストは新しいサイクル（新機能・リデザイン・新コンテンツの追加）を開始する際に使用する。バグ修正やreviewerのnotes対応など軽微な修正には適用しない。

### Pre-flight

- [ ] 前サイクルが完了していることを確認（ship済み、またはキャリーオーバー項目が明示的にバックログに記録されている）
- [ ] owner/inbox/に未処理の指示がないか確認
- [ ] 他ロールのinbox/に自分が移動すべきでない滞留メモがないか目視確認（滞留があればそのロールに通知メモを送信）

### Step 1: Owner報告

- [ ] ownerにサイクル開始報告メモを送信（サイクル番号、方向性、前サイクルのサマリ）

### Step 2: Research（並列化可能）

- [ ] researcherに調査依頼メモを送信（researcher/inbox/に作成）
- [ ] 調査依頼には「回答すべき質問」「調査範囲」「外部ソースの要否」を含める
- [ ] researcherからの返信を受信し、内容を確認

### Step 3: Plan（並列化可能 -- 独立したテーマごとに並列でplannerに依頼可能）

- [ ] plannerに計画依頼メモを送信（planner/inbox/に作成）
- [ ] 計画依頼にはresearcherの調査結果memo IDを参照として含める
- [ ] plannerからの計画書を受信し、内容を確認

### Step 4: Review Plan

- [ ] reviewerに計画レビュー依頼メモを送信（reviewer/inbox/に作成）
- [ ] reviewerからの承認（APPROVED / APPROVED_WITH_NOTES）を受信

### Step 5: Build（並列化可能 -- 作業領域が重ならない場合）

- [ ] 承認された計画に基づき、builderに実装メモを送信（builder/inbox/に作成）
- [ ] 実装メモは`docs/memo-spec.md`の「実装メモ」テンプレートに準拠
- [ ] 承認済み計画のmemo IDを必ず参照

### Step 6: Review Implementation

- [ ] builderの完了報告を受信後、reviewerにレビュー依頼メモを送信
- [ ] reviewerの承認を受信

### Step 7: Ship

- [ ] mainにマージ・プッシュ
- [ ] ownerにサイクル完了報告メモを送信

### Prohibitions（常時適用）

- PMがコード・ファイルを直接変更してはならない
- メモを介さずbuilderに直接指示してはならない（Task tool等の使用禁止）
- 他ロールのinbox/active/のメモを移動・削除してはならない
- reviewerの承認なしにbuild phaseに進んではならない

## 軽微な修正の例外規定

バグ修正、reviewerのnotes対応、タイポ修正など軽微な修正は、researchフェーズ・planフェーズ・review planフェーズをスキップし、直接builderに実装メモを送信してよい。ただし以下の条件を満たすこと:

- 変更範囲が明確かつ限定的であること
- 新機能の追加、リデザイン、新コンテンツの追加ではないこと
- review implementationフェーズは省略不可
