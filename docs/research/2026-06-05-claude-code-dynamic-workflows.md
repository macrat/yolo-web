---
title: Claude Code Dynamic Workflows 調査レポート
date: 2026-06-05
purpose: ブログ記事執筆の根拠となる正確な情報収集。機能の正体・発表時期・一次ソース・既存記事の切り口の把握。
method: |
  - WebSearch: "Claude Code Dynamic Workflow announcement 2026", "Anthropic Claude Code workflow feature release 2026", "dynamic workflows agent() pipeline() parallel() primitives", "日本語 解説 ブログ 2026", "worktree isolation", "structured output schema", "Bun Jarred Sumner" 等
  - WebFetch: 公式ブログ(claude.com/blog)、公式ドキュメント(code.claude.com/docs)、TechCrunch、InfoQ、MarkTechPost、Zenn、WEEL等
sources:
  - "https://claude.com/blog/introducing-dynamic-workflows-in-claude-code (公式ブログ 発表記事)"
  - "https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code (公式ブログ 詳細解説)"
  - "https://code.claude.com/docs/en/workflows (公式ドキュメント)"
  - "https://code.claude.com/docs/en/whats-new (What's new ページ)"
  - "https://code.claude.com/docs/en/whats-new/2026-w22 (Week 22 ダイジェスト)"
  - "https://code.claude.com/docs/en/agent-sdk/structured-outputs (構造化出力ドキュメント)"
  - "https://www.anthropic.com/news/claude-opus-4-8 (Claude Opus 4.8 発表)"
  - "https://techcrunch.com/2026/05/28/anthropic-releases-opus-4-8-with-new-dynamic-workflow-tool/"
  - "https://www.infoq.com/news/2026/06/dynamic-workflows-claude-code/"
  - "https://www.marktechpost.com/2026/05/28/anthropic-ships-claude-opus-4-8-alongside-dynamic-workflows-and-cheaper-fast-mode-with-workflows-capped-at-1000-subagents/"
  - "https://alexop.dev/posts/claude-code-workflows-deterministic-orchestration/"
  - "https://docs.bswen.com/blog/2026-06-02-claude-code-dynamic-workflows-architecture/"
  - "https://zenn.dev/canly/articles/45da96250c7028"
  - "https://zenn.dev/arufian/articles/c1389f2941de90"
  - "https://weel.co.jp/media/tech/claude-code-dynamic-workflows"
---

# Claude Code Dynamic Workflows 調査レポート

## 1. 一次ソース URL 一覧（裏取り済み）

### 公式一次ソース

| 種別                   | URL                                                                               | 内容                                                                             |
| ---------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 公式ブログ（発表）     | https://claude.com/blog/introducing-dynamic-workflows-in-claude-code              | 2026-05-28 公開の発表記事                                                        |
| 公式ブログ（詳細解説） | https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code | 2026-06-02 公開。Thariq Shihipar・Sid Bidasaria 著。パターン集・ユースケース詳述 |
| 公式ドキュメント       | https://code.claude.com/docs/en/workflows                                         | メインのドキュメントページ                                                       |
| What's new             | https://code.claude.com/docs/en/whats-new                                         | Week 22（May 25–29）エントリに記載                                               |
| Week 22 ダイジェスト   | https://code.claude.com/docs/en/whats-new/2026-w22                                | v2.1.150–v2.1.157 対象                                                           |
| Agent SDK 構造化出力   | https://code.claude.com/docs/en/agent-sdk/structured-outputs                      | schema オプション仕様                                                            |
| Opus 4.8 発表          | https://www.anthropic.com/news/claude-opus-4-8                                    | 同日発表のモデルリリースノート                                                   |

### 信頼度の高いメディア報道

| 媒体         | URL                                                                                                                                                                | 備考                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| TechCrunch   | https://techcrunch.com/2026/05/28/anthropic-releases-opus-4-8-with-new-dynamic-workflow-tool/                                                                      | 発表当日             |
| InfoQ        | https://www.infoq.com/news/2026/06/dynamic-workflows-claude-code/                                                                                                  | 技術的詳細あり       |
| MarkTechPost | https://www.marktechpost.com/2026/05/28/anthropic-ships-claude-opus-4-8-alongside-dynamic-workflows-and-cheaper-fast-mode-with-workflows-capped-at-1000-subagents/ | 上限数・技術制約詳述 |

---

## 2. 機能の正確な説明（裏取り済み事実）

### 2-1. 正式名称と発表ステータス

- **正式名称**: "Dynamic Workflows"（"Dynamic workflow" の複数形が正式表記。ドキュメントでは "dynamic workflows" 小文字でも使用）
- **ステータス**: Research Preview（研究プレビュー）として公開。正式リリースではない
- **発表チャネル**: Anthropic 公式ブログ（claude.com/blog）および Claude Code 公式ドキュメント

### 2-2. 発表・公開日

- **2026年5月28日**（Claude Opus 4.8 と同日発表・同日公開）
- Claude Code v2.1.150–v2.1.157（Week 22）で実装。**最低要件は v2.1.154**

### 2-3. 機能の本質

Dynamic Workflow とは、**Claude が対話のターンごとに判断するのではなく、タスク全体を JavaScript スクリプトとして書き出し、それを専用のランタイムがバックグラウンドで実行する**仕組みである。

公式ドキュメントの定義:

> "A dynamic workflow is a JavaScript script that orchestrates subagents at scale. Claude writes the script for the task you describe, and a runtime executes it in the background while your session stays responsive."

### 2-4. 既存機能との対比（公式ドキュメントの比較表より）

公式ドキュメントは 4 種のオーケストレーション方式を明示的に比較している:

| 軸                   | サブエージェント                | スキル                          | エージェントチーム                         | ワークフロー                       |
| -------------------- | ------------------------------- | ------------------------------- | ------------------------------------------ | ---------------------------------- |
| 実体                 | Claude が産み出すワーカー       | Claude が従う指示               | ピアセッションを監督するリードエージェント | ランタイムが実行するスクリプト     |
| 次の行動を決めるのは | Claude（ターンごと）            | Claude（プロンプト追従）        | リードエージェント（ターンごと）           | **スクリプト**                     |
| 中間結果の保持場所   | Claude のコンテキストウィンドウ | Claude のコンテキストウィンドウ | 共有タスクリスト                           | **スクリプト変数**                 |
| 再現性               | ワーカー定義                    | 指示                            | チーム定義                                 | **オーケストレーション自体**       |
| スケール             | 1 ターンにつき数件の委譲        | サブエージェントと同様          | 数件の長時間ピア                           | **1 実行で数十〜数百エージェント** |
| 割り込み後の挙動     | ターンを再起動                  | ターンを再起動                  | チームメンバーは継続                       | **同一セッション内で再開可能**     |

#### Task ツールとの違い（重要）

既存の「サブエージェント」は内部的に Task ツール（あるいは Bash サブエージェントパターン）を使い、親エージェントがオーケストレーターとしてターンごとに判断し、すべての結果がコンテキストウィンドウに蓄積される。Dynamic Workflows ではコンテキストウィンドウに最終結果だけが返る。これが「コンテキスト汚染」を防ぐ根本的な差異である。

### 2-5. アーキテクチャ詳細

**決定論的 JavaScript オーケストレーション**

- Claude が自然言語の指示からオーケストレーションスクリプト（JavaScript）を動的に生成する
- スクリプトは専用の**隔離されたランタイム**でバックグラウンド実行される
- 中間結果はスクリプト変数に保持され、Claude のコンテキストには流入しない
- **決定論的制約**: スクリプト内でランダム数や `Date.now()` などの非決定論的操作は禁止（ジャーナリングと再開機能のため）。タイムスタンプは `args` 経由で渡す

**スクリプト自体の制約**

- スクリプト本体はファイルシステムやシェルに直接アクセスできない
- ファイル操作・シェルコマンド実行はすべて産み出されたサブエージェント経由
- これにより隔離とコスト境界が保証される

### 2-6. プリミティブ（公式ドキュメント＋解説記事による裏取り）

公式ドキュメントはプリミティブのコード仕様を直接は公開していないが、公式ブログ（2026-06-02記事）と複数の解説記事（alexop.dev、bswen.com）が整合した形で以下を記述している。**注意: 以下は一次ソース（公式ドキュメント）ではなく、複数の高信頼記事による裏取り**。

| プリミティブ                 | 役割                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `agent(prompt, opts?)`       | 単一サブエージェントを産み出す。オプションに `schema`（構造化出力）、`label`（表示名）、`phase`（進捗UIのグループ）などを渡せる |
| `parallel(thunks)`           | 同期バリア付き並列実行。**全タスクの完了を待ってから次へ進む**                                                                  |
| `pipeline(items, ...stages)` | バリアなしのストリーミング並列。各アイテムが独立して次ステージに流れる                                                          |
| `workflow(nameOrRef, args?)` | 他のワークフローをサブステップとして呼び出す（コンポジション）                                                                  |

`parallel` と `pipeline` の選択基準: 下流ステージが全結果を必要とする場合は `parallel`、独立して処理できる場合は `pipeline`。

### 2-7. 構造化出力スキーマ

**公式ドキュメント（agent-sdk/structured-outputs）で裏取り済み**:

- `agent()` の `opts` に `schema`（JSON Schema オブジェクト）を渡すことで、サブエージェントの返答を検証済み JSON に強制できる
- TypeScript: `outputFormat: { type: "json_schema", schema: schema }` / Zod 連携可
- Python: `output_format={"type": "json_schema", "schema": ...}` / Pydantic 連携可
- 検証失敗時はリトライ、上限超過時は `error_max_structured_output_retries` エラー
- 下流ステージがサブエージェントの出力を消費する場合に使うことが推奨されている

### 2-8. バックグラウンド実行と進捗管理

- ワークフローはバックグラウンドで実行され、**セッションは応答可能な状態を維持**する
- `/workflows` コマンドで実行中・完了済みのワークフローを一覧表示
- 進捗ビューではフェーズごとのエージェント数・トークン数・経過時間を確認可能
- `p` キーで一時停止/再開、`x` で停止、`r` で個別エージェント再起動

**再開の仕組み**: 完了済みエージェントの結果はキャッシュされ、再開時に再実行されない。ただし **Claude Code セッションをまたいだ再開は不可**（同一セッション内のみ）。セッション終了後は最初から再実行となる。

### 2-9. 実行制約（ハード上限）

| 制約                                   | 値                                                  | 理由                         |
| -------------------------------------- | --------------------------------------------------- | ---------------------------- |
| 同時実行エージェント数                 | **最大 16**（CPU コア数が少ない環境ではより少ない） | ローカルリソース使用量の制限 |
| 1 ワークフローあたりの総エージェント数 | **最大 1,000**                                      | 暴走ループ防止               |
| 実行中のユーザー入力                   | **不可**（エージェントの権限プロンプトのみ中断可）  | —                            |

### 2-10. worktree 分離（裏取り済み）

- サブエージェントに `isolation: worktree` を指定することで、個別の git worktree で実行できる
- プロンプト内で「worktrees を使ってください」と指示しても同様の効果
- Workflows の文脈では、並列エージェントが同じファイルを競合して編集するリスクを避けるために使用
- これは Workflows 専用機能ではなく、サブエージェント全般の機能を Workflow から活用できる

### 2-11. 起動方法

1. プロンプトに "workflow" / "ultracode" / 自然言語（"use a workflow" 等）を含める
   - **注意**: v2.1.160 より前はキーワードトリガーが `workflow` だったが、以降は `ultracode` に変更。自然言語での依頼は両バージョンで動作する
2. `/effort ultracode` を設定: `xhigh` 推論努力 + 自動ワークフローオーケストレーションを組み合わせた設定。セッション全体で適用され、各タスクにワークフローが自動適用される
3. `/deep-research <質問>` コマンド: 組み込みワークフローを直接実行

### 2-12. 利用条件

| プラン     | 状態                                                              |
| ---------- | ----------------------------------------------------------------- |
| Pro        | 利用可能。`/config` の Dynamic Workflows 行からオンにする必要あり |
| Max        | デフォルトでオン                                                  |
| Team       | デフォルトでオン                                                  |
| Enterprise | デフォルトでオフ。管理者が Claude Code 管理画面からオンにする     |

**API / Bedrock / Vertex AI / Microsoft Foundry**: いずれも利用可能

**最低バージョン**: Claude Code v2.1.154 以降

---

## 3. 発表時期の詳細

- **2026年5月28日**: Claude Opus 4.8 と同日に Research Preview として発表・公開
- **発表チャネル**: `claude.com/blog`（Anthropic 公式ブログ）、`anthropic.com/news/claude-opus-4-8`
- **ドキュメント公開**: 同日、`code.claude.com/docs/en/workflows` にて
- **詳細解説ブログ**: 2026年6月2日に別の公式ブログ記事（"A harness for every task"）が公開（著者: Thariq Shihipar・Sid Bidasaria）

---

## 4. 想定ユースケース（公式・解説記事による裏取り）

### 公式ブログで挙げられているユースケース

1. **コードベース全体のバグハント**: 並列エージェントで全ファイルを走査し、互いに発見を反論させる
2. **大規模マイグレーション（数百〜数千ファイル）**: ファイルを並列処理し、各変換に 2 名のレビュアーを配置
3. **セキュリティ監査**: 独立した視点から脆弱性クラスを横断的に調査
4. **ディープリサーチ**: 複数の角度から Web 検索をファンアウトし、ソースをクロスチェックして引用付きレポート生成
5. **パフォーマンス最適化**: プロファイラー結果をエージェントで並列分析
6. **ルートコーズ調査**: 確証バイアスを避けるため独立した仮説を並列生成
7. **大規模トリアージ**: サポートキューの分類・重複排除
8. **トーナメント方式の選択**: 定性評価を対戦形式で決定

### 著名な実例（裏取り済み）

**Bun の Zig→Rust 移植**（Jarred Sumner、Bun 作者）:

- 約 100 万行の Zig コードを Rust に移植
- 生成された Rust コード: 約 75 万行
- 期間: 11 日（最初のコミットからマージまで）
- テストスイートの合格率: 99.8%
- 方法: ファイル単位の忠実な移植（書き直しではない）
- ワークフロー構成: struct フィールドの Rust ライフタイムマッピング → ファイルごとの並列移植（各ファイルにレビュアー 2 名）→ ビルド・テストが通るまでの修正ループ → 不要なデータコピーの最適化
- **注意**: 記事時点では本番環境への投入はまだ行われていない（未確認）

---

## 5. 既存記事の切り口と差別化の余地

### 英語圏の既存記事の切り口

| 記事                      | 主な切り口                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| TechCrunch (2026-05-28)   | ニュース報道。Opus 4.8 との同時発表を中心に                                                                                                 |
| InfoQ (2026-06)           | 技術者向け。並列エージェント調整の仕組みを図解風に解説                                                                                      |
| MarkTechPost (2026-05-28) | 1,000 エージェント上限・16 並列制約・JavaScript 生成の仕組みに注目                                                                          |
| Medium (lassiecoder)      | Bun rewrite の事例を前面に出したインパクト重視の記事                                                                                        |
| Medium (Yanli Liu)        | 個人の体験談・感想中心                                                                                                                      |
| alexop.dev                | **最も技術的深度が高い**。決定論的 JavaScript、parallel vs pipeline の違い、adversarial verify パターン、structured output の使い分けを詳述 |
| mindstudio.ai             | Subagents vs Agent Teams vs Workflows の比較フレームワーク記事を複数本                                                                      |

### 日本語記事の既存切り口

| 記事             | 主な切り口                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Zenn (canly)     | **実測データあり**: 39分50秒・40エージェント・3.3Mトークン・誤検知 41% 削減。最も具体的な実験レポート |
| Zenn (arufian)   | 公式情報を正確に整理。未確認情報を明示的に除外する誠実な姿勢                                          |
| WEEL             | 4フェーズアーキテクチャとコスト管理に注目した入門解説                                                 |
| note.com (npaka) | 公式情報の日本語要約                                                                                  |
| 仁頼             | 大規模移行向け完全ガイドを標榜                                                                        |
| sinyblog.com     | 非エンジニア向け解説。/deep-research から始めるチュートリアル                                         |

### 差別化・追加価値の余地（現時点での未カバー領域）

1. **parallel() vs pipeline() の使い分けを実例で示す記事が日本語にない**
   alexop.dev が英語で詳述しているが、日本語では整理されていない。同期バリアの有無がユースケースにどう影響するかを具体例で示せる

2. **worktree 分離との組み合わせパターンの日本語解説がない**
   並列エージェントがファイル競合を起こすリスクと、worktree 分離でどう回避するかを実践的に示した日本語記事は現時点で確認できない

3. **決定論的実行制約の意味合いを深掘りした記事がない**
   「なぜ Date.now() が禁止か」「ジャーナリングと再開がなぜ可能か」の仕組みを説明した日本語記事は確認できない

4. **コスト計算の実践的ガイドが未整備**
   Zenn の canly 記事が実測値を出しているが、「どのタスクが何トークン使うか」の試算方法やコストコントロール戦略（小さなスライスで試す手順等）を体系化した日本語記事はない

5. **Pro プランでの利用手順（/config でのオン方法）を具体的に示した記事が少ない**
   Max/Team プランはデフォルトオンだが、Pro プランは明示的な有効化が必要。この点が日本語記事では見落とされがち

6. **adversarial verify パターンの実践例**
   「独立したエージェントに互いの発見を反論させる」設計パターンを具体的なユースケースと合わせて日本語で解説した記事は確認できない

7. **既存の Task ツール（サブエージェント）から Workflows への移行判断基準**
   「いつ Task ツールをやめて Workflows に切り替えるべきか」の実務的な意思決定フレームワークを日本語で示した記事は少ない

---

## 6. 確証が取れない事項（未確認）

- `agent()`・`pipeline()`・`parallel()`・`workflow()` の正確なシグネチャ・引数仕様: 公式ドキュメントには直接記載がなく、複数の解説記事が整合的に記述しているが、公式一次ソースでの完全な確認はできていない
- Bun の Zig→Rust 移植の本番投入の有無: 記事時点では「まだ本番に入っていない」という記述あり。現状は未確認
- `workflow()` プリミティブの正確な動作仕様（コンポジションの詳細）
- worktree 分離を Workflow スクリプトから直接指定する構文の詳細
- Enterprise プランにおける管理者設定の具体的な UI フロー

---

## 7. 誤りやすい点の整理

| 項目                     | 正確な情報                                                                 | 誤りパターン                                                                               |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 正式機能名               | "Dynamic Workflows"（複数形が正式。小文字 "dynamic workflows" も公式使用） | "Dynamic Workflow"（単数形）や "Workflows" のみ                                            |
| キーワードトリガー       | v2.1.160 以降は `ultracode`。v2.1.160 より前は `workflow`                  | 現在も `workflow` キーワードが有効と誤解（実際は自然言語依頼は有効）                       |
| Pro プランの利用         | 利用可能だが `/config` で明示的にオンにする必要あり                        | Pro では利用不可と誤解                                                                     |
| ステータス               | Research Preview（正式リリースではない）                                   | GA（一般提供）として紹介                                                                   |
| Bun rewrite の期間       | **11 日**（最初のコミットからマージまで）、生成コード約 75 万行            | "6 日"と報道しているメディアあり（Medium 等）。公式ブログ発表記事では "eleven days" と明記 |
| 同時実行上限             | 最大 16（環境依存）                                                        | 単純に "数百並列" と誤解                                                                   |
| セッションをまたいだ再開 | **不可**（同一セッション内のみ再開可能）                                   | セッション終了後も再開できると誤解                                                         |
| 発表チャネル             | claude.com/blog（Claude ブランドのブログ）と anthropic.com/news の両方     | anthropic.com/blog と誤記（現在のブログは claude.com/blog）                                |
