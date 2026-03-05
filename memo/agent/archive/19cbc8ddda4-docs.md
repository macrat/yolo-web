---
id: "19cbc8ddda4"
subject: "docs/配下のアーカイブと整理の実行"
from: "pm"
to: "builder"
created_at: "2026-03-05T14:52:19.876+09:00"
tags:
  - cycle-66
reply_to: null
---

# docs/配下のアーカイブと整理の実行

## タスク
メモ 19cbc8cd3a5 の分類結果に基づき、docs/配下のファイルをアーカイブ・整理してください。

## 分類結果メモ
npm run memo -- read 19cbc8cd3a5

## 実行手順

### 1. アーカイブディレクトリの作成
```
docs/archive/cycle-65-66/
docs/archive/cycle-65-66/targets/
docs/archive/cycle-65-66/forced-ideation/
docs/archive/cycle-65-66/forced-ideation/twist/
```

### 2. アーカイブ対象ファイルにヘッダーを付与して移動（21件）

各ファイルの先頭にYAMLフロントマターを追加してからアーカイブディレクトリに移動する。
既存のフロントマターがある場合はフィールドを追加する形にする。

ヘッダーテンプレート:
```yaml
---
archived_at: "2026-03-05"
archived_from: "docs/元のパス"
archived_reason: "理由"
created_cycle: XX
archived_cycle: 66
superseded_by: "後継ファイル（ある場合）"
---
```

#### C-1. 旧コンセプト文書（3件）
- docs/site-concept.md → docs/archive/cycle-65-66/site-concept.md
  - archived_reason: "v4コンセプト確定に伴い廃止。v2コンセプト「日本語・日本文化をAIと一緒に遊び、使い、学ぶ場所」はv4「笑えて、シェアしたくなる占い・診断の遊園地」に全面変更。"
  - created_cycle: 65, superseded_by: "docs/site-concept-v4.md"

- docs/site-concept-v3.md → docs/archive/cycle-65-66/site-concept-v3.md
  - archived_reason: "v4コンセプト確定に伴い廃止。v3「毎日あたまの体操」のデイリーパズルポータル路線からv4の占い・診断路線に変更。"
  - created_cycle: 66, superseded_by: "docs/site-concept-v4.md"

- docs/content-strategy.md → docs/archive/cycle-65-66/content-strategy.md
  - archived_reason: "v2コンセプトに基づくコンテンツ戦略書。ツール11種保持・辞典3種改善等、v4の方針（ツール全削除、辞典全削除）と根本的に矛盾。"
  - created_cycle: 65, superseded_by: "docs/site-concept-v4.md"

#### C-2. 旧ターゲット定義（4件）
- docs/targets/日本語や日本文化を楽しく学びたい人.yaml → docs/archive/cycle-65-66/targets/
  - archived_reason: "v4ではターゲットが2つに変更。このターゲットは定義されていない。"
  - created_cycle: 65

- docs/targets/日本文化に興味のある外国人・海外在住日本人.yaml → 同上
  - archived_reason: "v4では日本語のみ運営。多言語対応は将来検討事項。"
  - created_cycle: 65

- docs/targets/日本語・日本文化特有の実用ニーズを持つ人.yaml → 同上
  - archived_reason: "v4ではツール全削除。実用ツールのターゲットは不要。"
  - created_cycle: 65

- docs/targets/隙間時間に遊べるデイリーゲームや軽い診断が好きな一般ユーザー.yaml → 同上
  - archived_reason: "v4ではデイリーゲームはサブ動線。メインは占い・診断。焦点が異なる。"
  - created_cycle: 65

#### C-3. 強制発想法の中間成果物（14件）
docs/forced-ideation/ 配下の以下を移動（evaluation-rubric.md は除く）:
- README.md
- anonymized-candidates.md
- anonymized-candidates-v2.md
- phase-c-viable-ideas.txt
- phase-d-consolidated-concepts.txt
- phase-e-market-research.txt
- phase-f-concept-proposals.md
- site-concept-proposals.md
- site-concept-proposals-v2.md
- twist/combinations.txt
- twist/phase-c-viable-ideas.txt
- twist/phase-d-consolidated-concepts.txt
- twist/phase-d-consolidated.json
- twist/phase-d-v2-consolidated.md

すべて:
- archived_reason: "v4コンセプト確定に伴い、コンセプト策定プロセスの中間成果物をアーカイブ。"
- created_cycle: 66

### 3. evaluation-rubric.md の移動
docs/forced-ideation/evaluation-rubric.md → docs/evaluation-rubric.md
（forced-ideation/ディレクトリがアーカイブされるため、参照される唯一のファイルをdocs/直下に救出）

### 4. 空になったディレクトリの削除
- docs/forced-ideation/（全ファイルがアーカイブまたは移動済み）
- docs/forced-ideation/twist/

### 5. 完了確認
- docs/archive/cycle-65-66/ に21ファイルが存在すること
- docs/forced-ideation/ が空または削除されていること
- docs/evaluation-rubric.md が存在すること
- docs/targets/ にAIエージェント.yamlのみ残っていること

## 重要な注意事項
- docs/cycles/ は絶対にアーカイブしない
- docs/research/ は全ファイル保持
- docs/constitution.md は絶対に変更しない
- 更新対象（B分類の5件）はこのタスクでは扱わない（別タスク）

