---
id: "19cbc8a25ef"
subject: "docs/配下ファイルの分類と整理計画"
from: "pm"
to: "planner"
created_at: "2026-03-05T14:48:16.239+09:00"
tags:
  - cycle-66
reply_to: null
---

# docs/配下ファイルの分類と整理計画

## 背景
サイトコンセプトがv4に更新された。docs/配下には旧コンセプト（cycle-65以前）のファイルが多数残っており、AIが古い情報を誤って参照するリスクがある。Ownerから以下の指示:

1. 新コンセプト(v4)と整合しないものは更新するか、アーカイブ用ディレクトリに退避
2. アーカイブには日付またはサイクル番号ベースのサブディレクトリを設ける
3. 退避するファイルには作成日・廃止日・廃止理由のヘッダーを付与
4. 通常参照されるディレクトリはクリーンで整合性が取れた状態を保つ

## タスク
以下のファイルをすべて読み、3カテゴリに分類してください。

### 分類カテゴリ
A. **保持（変更不要）**: 新コンセプトv4と整合している、または普遍的なドキュメント
B. **更新して保持**: 新コンセプトv4に合わせて内容を更新する必要がある
C. **アーカイブ**: 旧コンセプトの産物で、docs/に残すとAIが誤参照するリスクがある

### 対象ファイル（すべて読むこと）
docs/配下のファイル一覧:
- docs/README.md
- docs/architecture-decision.md
- docs/backlog.md
- docs/blog-writing.md
- docs/constitution.md
- docs/content-quality-requirements.md
- docs/content-strategy.md
- docs/content-trust-levels.md
- docs/memo-spec.md
- docs/new-feature-guide.md
- docs/site-concept.md
- docs/site-concept-v3.md
- docs/site-concept-v4.md（最新、保持）
- docs/site-value-improvement-plan.md
- docs/targets/（ディレクトリ内全ファイル）
- docs/research/（ディレクトリ内全ファイル）
- docs/forced-ideation/（ディレクトリ内全ファイル）
- docs/cycles/（サイクル記録。歴史的記録なのでアーカイブ対象外の可能性が高いが、確認すること）

### 新コンセプトv4の参照
メモ 19cbc70b725 を読んでv4の内容を把握すること。

### 各ファイルについて回答してほしいこと
1. 分類（A/B/C）
2. 理由（なぜその分類か）
3. Bの場合: 具体的にどう更新すべきか
4. Cの場合: 作成時期（推定）と廃止理由

### アーカイブ設計の提案
- ディレクトリ構造の提案（例: docs/archive/cycle-65/ 等）
- 退避ファイルに付与するヘッダーのテンプレート提案

## 注意
- docs/cycles/ はサイクル実行記録であり、歴史的価値がある。安易にアーカイブしない。
- constitution.md は不変のルール。絶対に変更しない。
- coding-rules.md（docs/coding-rules.md）も確認対象に含めること（存在する場合）。

