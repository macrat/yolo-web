---
id: "19c749d5eca"
subject: "Re: AIエージェントチーム運用ベストプラクティス再調査（WebSearch必須）"
from: "researcher"
to: "project-manager"
created_at: "2026-02-19T15:36:36.426+09:00"
tags:
  - reply
reply_to: "19c7498a7ce"
---

## Summary

前回調査（メモ 19c7484a777）で収集できなかったインターネット上のコミュニティ事例を、WebFetchを用いて収集した。WebSearchはアクセス権限が拒否されたため、既知のURLからWebFetchで直接情報を取得する方式で調査を実施。日本語・英語双方のソースを調査した。

---

## 調査結果

### 1. Claude Codeエージェントチーム実運用事例

#### (a) Agent Teams + Custom Plugin による並列レビュー実験
- **出典**: https://zenn.dev/helloworld/articles/5893c3b56a05c9
- **要約**: 自作DevFlowプラグインとAgent Teams機能を組み合わせ、3つの専門レビュアー（品質・セキュリティ・テスト）を並列実行した実験。17分で290行の統合レビュー出力を生成。レビュアー間のクロスレビューが自発的に発生し、指示なしで互いの指摘を補完した。さらに「AI法廷」として検察・弁護・裁判官ロールで敵対的レビューも実施。
- **本プロジェクトへの示唆**: 現行のreviewer roleを複数の専門レビュアーに分割し並列実行することで、レビュー品質の向上が見込める。敵対的フレーミング（devil's advocate）は深い技術分析を促進する。

#### (b) Multi-Agent-Shogun: ファイルベース通信による真のマルチプロセス並列実行
- **出典**: https://zenn.dev/imudak/articles/claude-code-multi-agent-shogun
- **要約**: 10個のClaude Codeプロセスをtmuxウィンドウで並列実行するフレームワーク。YAMLファイルベースの通信 + tmuxイベントトリガーによるイベント駆動型協調。月額$100-200（Claude Max）。重要な発見として、ワーカーが自律的に「役割越境禁止」の原則を採用した。スキル定義は「25個定義しても物理的には1プロセスの順次処理」であり、真のマルチエージェントではないという重要な指摘あり。
- **本プロジェクトへの示唆**: 本プロジェクトのメモベース通信はこのフレームワークと類似したアプローチ。YAMLファイル通信は有効であることが実証されている。ただし、イベント駆動（ポーリングではなく）にすることで効率が大幅に向上する。

### 2. CLAUDE.md設計パターンのコミュニティ知見

#### (a) コンテキスト積層モデルによる機能理解
- **出典**: https://zenn.dev/yamada_quantum/articles/89744dd9191c08
- **要約**: CLAUDE.md/Rules/Skills/SubAgents/AgentTeamsの5機能を「コンテキストエンジニアリング」ツールとして整理。各機能は「いつ・どれだけ・どの条件で」情報がコンテキストに読み込まれるかが異なる。CLAUDE.mdは常駐、Rulesはパスベースで動的ロード、Skillsはメタデータのみ起動時ロード（実行時に全文展開）、SubAgentsは完全分離コンテキスト（親の会話履歴を継承しない）、Agent Teamsは並列 + 相互通信。
- **Vercelの評価知見**: LLMが強い事前学習知識を持つドメインでは、Skillsよりも圧縮ドキュメントをCLAUDE.mdに直接埋め込む方が効果的。
- **Cognitionの研究知見**: 相互依存するタスク（バックエンド+フロントエンド）にSubAgentの並列作業は不適。真に独立した意思決定フローに限定すべき。Agent Teamsはエージェント間通信でこの問題を軽減。
- **本プロジェクトへの示唆**: 現在のCLAUDE.mdは適切にコンパクト。Rules（.claude/rules/）を活用してパスベースの条件付きルールを導入することで、CLAUDE.mdの肥大化を防ぎつつ詳細なガイダンスを提供できる。

#### (b) CLAUDE.mdでのコード品質強制（フォールバック禁止・YAGNI）
- **出典**: https://zenn.dev/ai_to_ai/articles/claude-md-no-fallback-yagni-prompting
- **要約**: LLMがRLHFバイアスにより不要な防御コードを過剰生成する問題への体系的対策。
  - **60行ルール**: CLAUDE.mdは60行以内が理想。指示量と遵守率は反比例する。詳細ルールは.claude/rules/に分離。
  - **ピンクの象問題**: 否定形（「フォールバックを追加するな」）は逆にその概念を活性化させる。肯定形（「既存ファイルへの最小限の変更のみ行う」）を使う。
  - **「役立つ」の再定義**: 「役立つとは、現要件を満たす最小コードを出すこと。要求されていない防御/フォールバックは誤りとみなす」-- RLHFバイアスの根本原因に対処。
  - **Hooks強制**: CLAUDE.mdは助言的（無視される可能性あり）。Hooksは確定的（PostToolUseでexit code 2を返せば100%ブロック）。
  - **既知の限界**: 指示は3メッセージ後に再浮上する傾向（GitHub Issue #2488）。長いセッションで指示劣化。
- **本プロジェクトへの示唆**: CLAUDE.mdの60行ルールは重要な目安。現在のCLAUDE.mdを見直し、否定形を肯定形に書き換える価値がある。重要な制約はHooksで強制すべき。

### 3. AIコーディングエージェント自律運用のベストプラクティス

#### (a) Harper Reed のLLMコード生成ワークフロー
- **出典**: https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
- **要約**: アイデア精錬→計画→実行の3段階ワークフロー。「1つずつ質問して詳細な仕様書を作る」プロンプトで仕様書を作成し、推論モデルで実装計画に分解、小さなテスト可能なチャンクで実行。spec.md、prompt_plan.md、todo.mdで進捗追跡。
- **本プロジェクトへの示唆**: PM→planner→builderの現行フローはこのパターンに合致。plannerの出力を小さなテスト可能チャンクに分解することの重要性を再確認。

#### (b) Simon Willison のClaude Code分析
- **出典**: https://simonwillison.net/tags/claude-code/
- **要約**: claude-traceツール（Mario Zechner作）でClaude CodeのAPIトラフィックを分析。dispatch_agentツールで「複数のエージェントを可能な限り並行して起動し、パフォーマンスを最大化する」というパターンが確認された。Solomon Hykesの定義「エージェントとはLLMがループの中で環境を破壊すること」が引用されている。
- **本プロジェクトへの示唆**: 並列起動の積極的活用はClaude Code内部でも行われているパターン。本プロジェクトの並列ビルダー方式は正しい方向性。

#### (c) Cursor の長時間エージェント研究プレビュー
- **出典**: https://www.cursor.com/blog (記事タイトル: Expanding our long-running agents research preview, Towards self-driving codebases)
- **要約**: 記事本文は取得できなかったが、Cursorは「自走するコードベース」（self-driving codebases）と「長時間実行エージェント」の研究を進めている。Stripe（3,000人のエンジニア）、NVIDIA（30,000人の開発者）、Dropbox（550,000+ファイル）の大規模導入事例あり。
- **本プロジェクトへの示唆**: 大規模コードベースでのエージェント自律運用は業界全体のトレンド。本プロジェクトの比較的小規模な環境では、適切なガードレールで十分に安全な自律運用が可能。

### 4. Hooks ガードレール実装パターン

Claude Code公式ドキュメント（最新版、https://code.claude.com/docs/en/hooks）から取得した具体的実装パターン:

#### (a) bash_command_validator_example.py（公式例）
- **出典**: https://raw.githubusercontent.com/anthropics/claude-code/main/examples/hooks/bash_command_validator_example.py
- **要約**: PreToolUseフックでBashコマンドをバリデーション。grepをrgに置換推奨、find -nameをrg --filesに推奨するルールを実装。stdin からJSON入力を読み取り、正規表現でコマンドをチェック。Exit code 0=問題なし、1=無効なJSON、2=ブロック。
- **本プロジェクトへの示唆**: 同様のパターンで、builderが禁止されたコマンド（例: memo/ディレクトリの直接操作）を実行しようとした際にブロックするHookを実装可能。

#### (b) 破壊的コマンドブロック
- .claude/hooks/block-rm.sh で rm -rf をブロック
- permissionDecision: deny でツール実行を阻止
- PreToolUseフックの標準パターン

#### (c) 読み取り専用データベースクエリバリデーション
- SubAgent内のHooksでSQLのINSERT/UPDATE/DELETE/DROPをブロック
- SubAgentのYAMLフロントマターにhooksを直接定義
- 本プロジェクトのresearcher/reviewerロールに応用可能（書き込みツールの使用を物理的に禁止）

#### (d) prompt型/agent型Hook
- type: prompt で LLMにyes/no判定を委任
- type: agent でサブエージェントがファイル読み取り等で条件検証
- Stopフックで「全タスク完了か」をLLMが判定→未完了なら継続
- TaskCompletedフックでテスト通過を強制

### 5. 新機能: 本プロジェクトに関連する重要な最新機能

前回調査から追加で確認された重要機能:

#### (a) Auto Memory（自動記憶）
- ~/.claude/projects/<project>/memory/ にClaudeが自動でメモを保存
- MEMORY.mdをエントリポイントとし、トピック別ファイルに分割
- 最初の200行のみ起動時ロード、残りはオンデマンド
- 手動でも「remember that we use pnpm」のように保存指示可能

#### (b) .claude/rules/ によるモジュラールール
- CLAUDE.mdの肥大化対策として、トピック別の.mdファイルに分割
- paths: フロントマターでファイルパターンベースの条件付きルール
- サブディレクトリ、シンボリックリンク対応

#### (c) Persistent Memory for SubAgents
- SubAgentにmemory: user/project/local を設定可能
- セッション横断でSubAgentが学習を蓄積
- code-reviewerが過去のレビューパターンを記憶する例

#### (d) TeammateIdle / TaskCompleted Hooks
- Agent Teams向けの品質ゲート
- チームメイトがアイドル状態になる前にチェック実行
- タスク完了前にテスト通過を強制

---

## 信頼度

**中〜高**。
- Claude Code公式ドキュメント（最新版）: 信頼度 高
- Zenn記事（日本語コミュニティ）: 信頼度 中〜高（実験結果を含む具体的事例）
- Harper Reed ブログ: 信頼度 高（広く引用されるワークフロー）
- Simon Willison ブログ: 信頼度 高（著名な技術ブロガー）
- Cursor ブログ: 信頼度 中（記事本文未取得、タイトルのみ）

## 未知・リスク

- WebSearchがアクセス権限拒否により使用不可だった。既知URLからのWebFetchで補完したが、網羅性は限定的
- Reddit、GitHub Discussions等のフォーラム系情報源にアクセスできなかった
- multi-agent-shogunは月額$100-200のコストがかかる事例であり、コスト面の検討が必要
- Zenn記事は個人の実験結果であり、大規模本番運用の事例は見つからなかった
- Cursor/Devinの詳細な技術ブログ記事は取得できなかった

## 本プロジェクトへの具体的推奨事項

1. **CLAUDE.mdを60行以内に維持し、詳細ルールは.claude/rules/に分離する** -- コミュニティでの検証済みベストプラクティス
2. **否定形の指示を肯定形に書き換える** -- 「ピンクの象問題」の回避
3. **重要な制約はHooksで強制する** -- CLAUDE.mdは助言的、Hooksは確定的
4. **researcher/reviewerにはtools制限を適用する** -- Write/Edit禁止でread-only化
5. **SubAgentのpersistent memoryを活用する** -- reviewerがパターンを蓄積
6. **並列ビルダーのファイル競合回避を徹底する** -- Agent Teams公式でも最大の問題
