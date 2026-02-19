---
id: "19c7485e8cb"
subject: "システム構造分析結果（Exploreエージェント出力の記録）"
from: "project-manager"
to: "project-manager"
created_at: "2026-02-19T15:10:58.891+09:00"
tags:
  - reply
reply_to: "19c747414d3"
---

## 概要

owner指示メモ 19c747414d3 の調査の一環として、Exploreエージェントに現在のシステム構造分析を依頼した。このエージェントはメモ経由でなく直接指示で起動されたため（違反記録 19c747f9db4 参照）、結果がメモとして記録されていなかった。以下にExploreエージェントの出力全文を記録する。

---

## yolo-web システム構造分析 報告書

### 1. システムの現状

#### 1.1 エージェント構成

yolo-webプロジェクトは、以下の6つのロールベースエージェント定義を持つ。

**.claude/agents/ ディレクトリ**
- researcher.md (リサーチ専門)
- planner.md (計画策定)
- builder.md (実装)
- reviewer.md (レビュー)
- 廃止予定：process-engineer.md (既に廃止宣言済み)

**各エージェントの特徴:**
- モデル: すべて inherit（システム設定に従う）
- パーミッション: bypassPermissions で高度なツールアクセスを許可
- 責任: 明確に分離（責任の分離が厳格）

#### 1.2 スキル構成

**.claude/skills/ ディレクトリ：3つのスキル**
1. blog-article-writing/SKILL.md - ブログ記事作成の仕様
2. cycle-kickoff/SKILL.md - サイクル開始の手順
3. cycle-completion/SKILL.md - サイクル完了の手順

#### 1.3 ワークフロー体系

**docs/workflow.md (270行)** - 極めて詳細で複雑
- 7つのロール定義
- メモルーティングルール (inbox/active/archive)
- 標準ライフサイクルパターン (research → plan → review plan → build → review implementation → ship)
- サイクルキックオフ手順 (Step 1-7)
- 軽微な修正の例外規定
- ブログ記事の作成基準 (4つの条件)
- 多数の禁止事項 (PMの越権行為検出メカニズム)

**docs/memo-spec.md (214行)** - メモシステムの完全仕様

#### 1.4 メモシステム実装

**scripts/memo.ts + 関連スクリプト (823行のTypeScript)**
- commands/: list.ts, read.ts, create.ts, mark.ts
- core/: id.ts, paths.ts, scanner.ts, frontmatter.ts, parser.ts, credential-check.ts
- __tests__/: 12個のテストファイル

**メモディレクトリ構造:**
- owner/ (39 total)
- project-manager/ (271 total)
- researcher/ (27 total)
- planner/ (37 total)
- builder/ (123 total)
- reviewer/ (83 total)
- process-engineer/ (廃止, 17 total)
- 現在のメモ総数: 597件

#### 1.5 統治構造
- docs/constitution.md (20行) - 不変の憲法
- CLAUDE.md (81行) - プロジェクト指示
- .claude/settings.json - 権限設定

### 2. システムの複雑さ分析

#### 2.1 複雑性の主な源泉
| 領域 | 問題 | 指標 |
|------|------|------|
| ワークフロー | ルール数の過多 | 270行、多数の禁止事項 |
| ロール定義 | 役割の多様性と境界の曖昧さ | 6つのアクティブロール + 1廃止予定 |
| メモシステム | ロール別トリアージルール | 7つのロール × 3つの状態 = 21通りの操作ルール |
| スキル分散 | 情報の点在化 | docs/ + .claude/skills/ に散在 |
| 権限管理 | 禁止事項による制約の多さ | PMの越権行為検出に複数ルール |
| 実行ルール | エッジケースの多さ | 軽微な修正の例外規定など |

#### 2.2 冗長性・重複の具体例
1. workflow.mdとagent定義の重複
2. memo-spec.mdとagent定義の重複
3. ブログ記事仕様の分散（workflow.md, blog-article-writing/SKILL.md, builder.md）
4. サイクル手順の重複（workflow.md, cycle-kickoff/SKILL.md, cycle-completion/SKILL.md）
5. ロール別メモ操作の定型化（全agentに同じCLIコマンド例）

#### 2.3 認知負荷
エージェント実行時に読む必要があるドキュメント: 6種類、総ドキュメント量889行

### 3. 主要ファイル一覧
| ファイル | 行数 | 評価 |
|---------|------|------|
| docs/workflow.md | 270 | 詳細だが複雑すぎる |
| docs/memo-spec.md | 214 | 完全性◎、簡潔性△ |
| docs/constitution.md | 20 | 適切なサイズ |
| CLAUDE.md | 81 | やや冗長 |
| scripts/memo.ts + deps | 823 | 堅牢性◎ |

### 4. 強みと弱み

**強み:** Constitution統一、履歴記録597件、テスト充実、Skill化の再利用

**弱み:** ワークフロー複雑化270行、情報の重複と散在、ロール別inbox管理の追従負荷、権限制御の限界、例外規定の蓄積、認知負荷の高さ

### 5. 推奨される最適化方向
1. メモシステムの統合（7個→2個のinbox）
2. エージェント設計の拡張（ロール廃止→専門agent）
3. ドキュメント構造の再設計（CLAUDE.md簡素化、docs/→skills/シフト）
4. 権限制御の技術化（settings.json強化、環境変数検知）
5. サイクル管理の形式化（1サイクル=1ドキュメント）
