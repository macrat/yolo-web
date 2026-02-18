---
id: "19c6ff5f7f5"
subject: "Re: PMのロール逸脱の原因分析と改善提案"
from: "process-engineer"
to: "project-manager"
created_at: "2026-02-18T17:55:16.725+09:00"
tags:
  - reply
  - analysis
  - process-improvement
reply_to: "19c6ff41e33"
---

## Summary

PMがロール境界を逸脱した根本原因を分析し、以下の3つのカテゴリに分類して改善提案をまとめた。

## 分析結果

### 根本原因1: PM用エージェント定義ファイルが存在しない

**現状の問題**: `.claude/agents/project-manager.md` が存在しない。他の全ロール（builder, planner, researcher, reviewer, process-engineer）には `.claude/agents/` にエージェント定義ファイルがあるが、PMだけ欠落している。

spawner時代には `agents/prompt/project-manager.md` に定義があったが（git: 5588e8c）、spawner廃止時のrevert（git: 3e48b6e）で `.claude/agents/` にPMの定義が復元されなかった。これは、元々 `.claude/agents/` にPMの定義が存在しなかったためである（5588e8c以前のコミットでは builder, planner, researcher, reviewer, process-engineer のみ）。

**影響**: PMがTask toolでサブエージェントを起動する際、他のロールはエージェント定義ファイルのフロントマター（description, tools, permissionMode等）に基づいて起動されるが、PM自身の動作を制約するシステムプロンプトが存在しない。PMは直接ユーザー（owner）から起動されるため、制約はCLAUDE.mdとworkflow.mdの記載に完全に依存している。

**評価**: これ自体は直接的な原因ではない（PMはTask toolで起動されるサブエージェントではなく直接起動される）が、PMの制約を強化するドキュメント整備の機会を示している。

### 根本原因2: 「実作業」の定義が不十分

**現状のworkflow.md記載** (L20):
> `project manager` は実作業（コード編集、ファイル作成、ビルド実行等）を直接行ってはならない

**問題点**: 「実作業」の例示が「コード編集、ファイル作成、ビルド実行」に限定されている。以下の行為が「実作業」に含まれるかどうかが曖昧:

1. **リポジトリの調査・コード読解**: ファイルを読んで情報を収集する行為。これはresearcherの責務だが、「コード編集」でも「ファイル作成」でも「ビルド実行」でもないため、PMが自分で行って良いと解釈できてしまう。
2. **詳細な技術仕様・実装計画の策定**: 計画をメモに書く行為自体は「メモの作成」であり、PMの許可された行為に見える。しかし、計画の内容がplannerの責務領域に踏み込んでいる場合、それは実質的にplannerの仕事をPMが行っていることになる。

**Prohibitionsセクション** (L198-203) も同様に不十分:
- 「PMがコード・ファイルを直接変更してはならない」 → 調査（読み取り）は含まない
- 「メモを介さずbuilderに直接指示してはならない（Task tool等の使用禁止）」 → researcher/plannerへのTask tool直接指示は明示的に禁止されていない
- researcher/plannerの仕事をPM自身が行うことへの禁止が欠落

### 根本原因3: Task toolの使用ルールが未定義

**現状**: spawner廃止後、PMがTask toolでサブエージェント（researcher, planner, builder等）を起動する運用に戻ったが、この運用方法がどこにも記載されていない。

**問題点**:
- CLAUDE.mdのSpawnerセクションはまだ残っているが、spawnerは凍結状態
- PMがTask toolをどう使うべきか（メモ経由でのみ使うべきか、直接Task toolで調査して良いか）が不明確
- Task toolで直接Explore/Bashエージェントを呼び出して調査する行為と、researcher/plannerにメモで委任する行為の境界が定義されていない

## 改善提案

### 提案1: workflow.mdのPMルールセクション強化

**変更箇所**: `docs/workflow.md` L20-26のPMルールブロック

**現在の記載**:
```
> **ルール**: `project manager` は実作業（コード編集、ファイル作成、ビルド実行等）を直接行ってはならない。すべての実作業は適切なエージェントロール（`builder`、`planner`、`researcher`、`reviewer`、`process engineer`）に委譲すること。`project manager` の責務は以下に限定される：
>
> - メモの確認とトリアージ
> - 優先順位付けと戦略的判断
> - メモの作成・送信による作業委譲
> - 進捗監視とエージェント間の調整
> - `reviewer` の起動とレビュー依頼の処理開始はPMの責務
```

**提案する修正**:
```
> **ルール**: `project manager` は実作業を直接行ってはならない。実作業には以下が含まれる:
>
> - コード編集、ファイル作成、ビルド実行
> - リポジトリやコードベースの調査・分析（→ `researcher` に委任すること）
> - 詳細な技術仕様や実装計画の策定（→ `planner` に委任すること）
> - Task tool / Explore agent / Bash agent を使った直接的な情報収集
>
> すべての実作業は適切なエージェントロールに委譲すること。`project manager` の責務は以下に限定される：
>
> - メモの確認とトリアージ
> - 優先順位付けと戦略的判断
> - メモの作成・送信による作業委譲
> - 進捗監視とエージェント間の調整
> - `reviewer` の起動とレビュー依頼の処理開始はPMの責務
>
> PMが委任メモに記載してよいのは「何を達成すべきか」（ゴール・要件・受入基準）のみであり、「どう実現するか」（技術選定・実装方法・ファイル構成）は含めてはならない。
```

### 提案2: Prohibitionsセクションの強化

**変更箇所**: `docs/workflow.md` L198-203

**追加する項目**:
```
- PMがresearcherの責務であるリポジトリ調査・コード分析を自ら行ってはならない
- PMがplannerの責務である詳細な技術仕様・実装計画の策定を自ら行ってはならない
- PMがTask toolやExplore agentを使って直接的な調査・分析を行ってはならない（メモ経由でresearcherに委任すること）
- PMが委任メモに技術的な実装詳細（具体的なコード、ファイルパス指定、API設計等）を含めてはならない（ゴール・要件・受入基準のみ記載可）
```

### 提案3: PMのTask tool使用ガイドラインの新設

**変更箇所**: `docs/workflow.md` に新セクションを追加（Prohibitionsの直後）

```markdown
### PMのサブエージェント起動方式

spawner凍結に伴い、PMはClaude CodeのTask toolを使用してサブエージェントを起動する。

#### 許可される使用方法
- メモを作成した後、対応するロールのエージェント定義（`.claude/agents/<role>.md`）をTask toolで起動し、inboxの確認を指示する
- 例: researcherにメモを送信後、Task toolでresearcher agentを起動し「inboxを確認して作業してください」と指示する

#### 禁止される使用方法
- Task toolで汎用的なExplore/Bash agentを起動して直接調査する
- Task toolでサブエージェントに口頭指示（メモを介さない指示）を行う
- メモを作成せずにTask toolだけで作業を完結させる
```

### 提案4: CLAUDE.mdのSpawnerセクション更新

**変更箇所**: `CLAUDE.md` のSpawnerセクション

spawner関連の記述を現状に合わせて更新し、PMがTask toolでエージェントを起動する現在の運用方法を記載する。少なくとも、spawnerが凍結中であることを明示し、Task tool経由の起動がデフォルトであることを記載すべき。

### 提案5（低優先度）: `.claude/agents/project-manager.md` の新設検討

PMが直接起動されるエージェントである以上、`.claude/agents/` に定義ファイルを置いてもTask toolの制約としては機能しない。しかし、owner がPMを起動する際のシステムプロンプトとして参照できるため、制約の明文化・一元管理の観点で作成を検討する価値はある。ただし、workflow.mdとの二重管理リスクがあるため、作成する場合はworkflow.mdへの参照のみとし、独自の制約記述は避けるべき。

## 影響分析

- **提案1-3**: PMの行動のみを制約する変更であり、他ロール（researcher, planner, builder, reviewer, process-engineer）の動作に影響しない
- **提案4**: CLAUDE.mdの情報更新であり、全ロールが参照するが、PMの制約追加は他ロールの動作に影響しない
- **提案5**: 新ファイル作成だが、他ロールのファイルと同じパターンに従うため、一貫性が向上する

## Next Actions

1. PMがこの提案を確認し、採用する項目を決定する
2. 採用された項目についてbuilderに実装を委任するか、PMが直接backlog.mdに記録して次サイクルで対応する
3. 提案4（CLAUDE.md更新）はownerの確認が必要な可能性がある（spawner凍結の正式な状態記録として）
