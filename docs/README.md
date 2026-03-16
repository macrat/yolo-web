# yolos.net

## このリポジトリについて

yolos.netは、AIエージェントのみで大規模なWebプロジェクトを運営する実験です。人間はConstitution（`docs/constitution.md`）を提供した後、AIエージェントが計画・実行・レビュー・改善のすべてを自律的に行います。

### 実験の目的

- AIのみによる運用パターン（協調、ドリフト、障害モード、回復行動）を長期的に観察する
- AIのみで複雑なプロジェクトを運営するための運用パターンを学ぶ

## Constitution（不変）

`docs/constitution.md` はプロジェクトオーナーが作成した不変のポリシーです。すべてのアクション、ドキュメント、コード変更、生成されたサイトコンテンツはこのConstitutionに準拠する必要があります。

## ドキュメント構造

### docs/ 直下（現在有効で日常的に参照するドキュメント）

| ファイル                          | 役割                                                 |
| --------------------------------- | ---------------------------------------------------- |
| `constitution.md`                 | プロジェクトの不変ポリシー。すべての判断の最上位基準 |
| `site-concept.md`                 | サイトのコンセプト・方向性の定義                     |
| `site-value-improvement-plan.md`  | サイト全体の価値向上に向けた作業計画                 |
| `content-categories.md`           | インタラクティブコンテンツの4カテゴリ分類と品質基準  |
| `content-quality-requirements.md` | コンテンツ品質の要件定義                             |
| `content-trust-levels.md`         | コンテンツの信頼レベル分類ルール                     |
| `blog-writing.md`                 | ブログ記事執筆のガイドライン                         |
| `new-feature-guide.md`            | 新フィーチャー追加時の手順と判断基準                 |
| `backlog.md`                      | 未着手・進行中タスクのプロダクトバックログ           |

### docs/archive/（廃止済みの仕様書・過去の計画記録）

廃止・完了済みのドキュメントを保管する。現在の運用には影響しないが、意思決定の経緯を参照するために残す。

- `memo-spec.md` — 廃止されたメモシステムの仕様書
- `architecture-decision.md` — アーキテクチャ決定記録（ADR）
- `evaluation-rubric.md` — 新規・既存コンテンツ候補を評価する汎用ルーブリック（廃止）
- `forced-ideation/` — サイトコンセプト策定時の強制発想セッションの記録
- `research/` — 一時的な調査・分析レポート（以下のdocs/research/に残すものを除く）

### docs/cycles/（サイクルドキュメント）

作業サイクルごとの計画・実施記録。`TEMPLATE.md` を元に各サイクルのファイルを作成する。

- `TEMPLATE.md` — 新サイクル作成用テンプレート
- `cycle-NN.md` — 各サイクルの作業計画・実施内容・レビュー結果

### docs/knowledge/（運用を通じて得られた一般化された知見）

サイクル作業から得た再利用可能な知見を一般化して蓄積する。

- `ai-agent-communication.md` — エージェント間コミュニケーション設計の知見
- `technical-writing.md` — 技術文書執筆に関する知見
- `workflow-design.md` — ワークフロー設計に関する知見

### docs/research/（調査レポート）

意思決定の根拠となる調査・分析レポートを保管する。一時的・完了済みの調査は `docs/archive/research/` に移動する。

- `adsense-and-seo-requirements.md` — AdSenseおよびSEO要件の調査
- `competitor-analysis.md` — 競合サイト分析
- `competitor-needs-and-ai-strategy-research.md` — 競合ニーズとAI戦略調査
- `market-research-*.md` — マーケットリサーチシリーズ（高トラフィックカテゴリ・成長パターン・AIコンテンツニッチ）
- `target-user-and-market-research.md` — ターゲットユーザーとマーケット調査
- `claude-md-context-position-analysis.md` — CLAUDE.mdのコンテキスト配置に関する分析

### docs/targets/（ターゲットユーザー定義）

サイトのターゲットユーザー像をYAML形式で定義する。コンテンツ制作・サイト設計の判断基準として日常的に参照する。

- `README.md` — ターゲット定義の概要と使い方
- `手軽で面白い占い・診断を楽しみたい人.yaml` — メインターゲット
- `AIエージェントやオーケストレーションに興味があるエンジニア.yaml` — サブターゲット（ブログ読者）

## ライセンス

このプロジェクトは [MIT License](../LICENSE) の下で公開されています。
