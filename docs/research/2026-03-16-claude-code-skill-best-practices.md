# Claude Codeスキル作成ベストプラクティス 調査レポート

- 調査日時: 2026-03-16
- 調査目的: Claude Codeスキルの作成ベストプラクティスの把握（既存スキルの品質向上および新規スキル作成の指針として）

---

## 1. SKILL.mdに何を書くべきか

### 含めるべき内容

SKILL.mdの本文（フロントマター以外のMarkdown部分）には、Claude がスキル発動後に従う **手順・方針・ワークフロー・例** を書く。

- **ステップバイステップの手順**: 複雑な処理を順序立てて記述する
- **判断基準**: 「どのような状況でどの選択肢を選ぶか」のガイドライン
- **テンプレート**: 出力フォーマットが決まっている場合は具体的なひな型
- **入出力の例（Input/Output ペア）**: 期待する動作を例示する
- **参照先ファイルへのリンク**: 詳細情報は別ファイルに委ねる（プログレッシブ・ディスクロージャー）
- **ユーティリティスクリプトの使い方**: 実行方法と期待する出力を示す

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 含めてはいけない内容

- **Claudeがすでに知っていること**: 「PDFとは何か」「Pythonとは何か」のような一般的な説明
- **時間に依存する情報**: 「2025年8月以前はXX APIを使う」のような賞味期限のある記述
  - 代替: `## Old patterns` セクションを設け、`<details>` タグで折りたたむ
- **選択肢の羅列**: 「pypdf または pdfplumber または PyMuPDF を使えます」のような複数提示
  - 代替: デフォルトを1つ示し、例外ケースのみ補足する

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 推奨される構成（セクション構造）

基本的な構成例（シンプルなスキル）:

```
# スキル名

## クイックスタート（最頻出のユースケースの手順）

## 高度な機能（参照先ファイルへのリンク）

## 注意事項
```

ワークフロー重視のスキル:

```
# スキル名

## ワークフロー概要（チェックリスト付き）

## ステップ1: ...
## ステップ2: ...
## ステップN: ...

## よくある問題と対処
```

### 推奨される長さ

- **SKILL.md本文は500行以内**に収める。超えた場合は別ファイルに分割する。
- 説明的なトークン（Claudeが既知の情報の説明）はゼロに近づける。
- 本文が長くなる場合は、プログレッシブ・ディスクロージャーを採用し詳細を参照ファイルに委ねる。

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

---

## 2. どう書くべきか

### 文体

- **命令形（Imperative）を基本とする**: "Run", "Check", "Use", "Analyze" など
- スキル本文内ではClaudeへの指示として書くため、「～してください」「～を行う」よりも端的な命令形が適切
- フロントマターの `description` のみ **三人称形式（Third person）** を用いる

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 詳細度（Degrees of Freedom）

スキルの内容に応じて、Claudeに与える自由度を3段階で設定する:

| 自由度       | 形式                                 | 使用場面                                             |
| ------------ | ------------------------------------ | ---------------------------------------------------- |
| 高（High）   | テキスト指示のみ                     | 複数のアプローチが有効、コンテキスト依存の判断が必要 |
| 中（Medium） | 擬似コード・パラメータ付きスクリプト | 推奨パターンはあるが多少の変動を許容                 |
| 低（Low）    | 具体的なスクリプト・パラメータなし   | フラジャイルな操作、一貫性が重要、特定の順序が必要   |

「Claudeを崖の両側にクリフのある細い橋を渡るロボット」と「危険のないオープンフィールドを歩くロボット」のアナロジーが公式に示されている:

- 橋を渡る場合 = データベースマイグレーションなど失敗が許されない操作 → 低自由度（詳細な手順と制約）
- 野原を歩く場合 = コードレビューなど文脈依存の判断 → 高自由度（方向性のみ指示）

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 例示の使い方

出力品質が例示に大きく依存するスキルでは、**Input/Output ペア**を提供する:

```markdown
## コミットメッセージの例

**例1:**
Input: JWT認証を追加した
Output:
​`
feat(auth): implement JWT-based authentication
Add login endpoint and token validation middleware
​`
```

例示は抽象的な説明よりも効果的に期待するスタイルと詳細度を伝えられる。

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### コード・コマンドの含め方

- コードブロック（` ```bash `, ` ```python `）で囲む
- スクリプト実行の場合は「実行するのか、参照として読むのか」を明示する:
  - 「`python scripts/analyze.py` を**実行して**フィールドを抽出する」→ 実行
  - 「`analyze.py` の抽出アルゴリズムについては**参照**してください」→ 読み込み
- **Windowsスタイルのパス（バックスラッシュ）は使用禁止**。常にUNIXスタイル（スラッシュ）を使う

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

---

## 3. 名前（name）の付け方

### 命名規則

- 使用可能文字: **小文字英字、数字、ハイフン**のみ
- 最大長: **64文字**
- XMLタグを含めない
- 予約語 "anthropic"・"claude" を含めない

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview ）

### 推奨命名形式

公式ドキュメントは **動名詞形（Gerund: 動詞 + -ing）** を推奨している:

| 良い例（動名詞形）       | 許容例（名詞句）       | 許容例（動詞形）       |
| ------------------------ | ---------------------- | ---------------------- |
| `processing-pdfs`        | `pdf-processing`       | `process-pdfs`         |
| `analyzing-spreadsheets` | `spreadsheet-analysis` | `analyze-spreadsheets` |
| `managing-databases`     | `database-management`  | `manage-databases`     |

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 悪い命名例

- 曖昧・汎用すぎる: `helper`, `utils`, `tools`, `documents`, `data`, `files`
- 予約語を含む: `anthropic-helper`, `claude-tools`
- コレクション内で命名パターンが不一致

### このプロジェクトの現状

現在の `.claude/skills/` を確認すると、`cycle-kickoff`, `cycle-planning`, `cycle-execution`, `cycle-completion`, `new-cycle-idea`, `contents-review`, `docs-management`, `recall-chat-history` という動詞+名詞形のパターンが使われている。これは許容範囲内だが、動名詞形（`kicking-off-cycle`）ではなく動詞形（`cycle-kickoff`）のスタイルに統一されている。一貫性は保たれており問題ない。

---

## 4. description の書き方

### 必須要素

1. **何をするか（What）**: スキルの機能を説明する
2. **いつ使うか（When）**: 発動すべきトリガーとなる状況・キーワードを含める

この2要素を1つの description に含めることが公式の強い推奨事項である。

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 技術的制約

- **三人称形式のみ**: description はシステムプロンプトに注入されるため、一人称・二人称は視点の不整合を引き起こす
  - 良い: "Processes Excel files and generates reports"
  - NG: "I can help you process Excel files"
  - NG: "You can use this to process Excel files"
- 最大1024文字
- XMLタグを含めない

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 良いdescriptionの例

```yaml
# PDFスキル
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Excelスキル
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.

# Git コミットヘルパー
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

### 悪いdescriptionの例

```yaml
description: Helps with documents         # 曖昧すぎる
description: Processes data               # 汎用すぎる
description: Does stuff with files        # 具体性ゼロ
```

### トリガー精度向上のテクニック

コミュニティの調査によると、description の最適化によってスキル発動率が大きく変わる:

- 最適化なし: 約20%の成功率
- 最適化済みdescription: 約50%の成功率
- フォースド評価フック付き: 約84%の成功率

「USE WHEN」言語と具体的なキーワードを使うことで精度が向上する。Claudeはembedding検索ではなくLLM推論でスキルを選択するため、description に実際のユーザー発話に近いキーワードを含めると効果的。

（出典: https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d ）

---

## 5. その他のフロントマターフィールド

### 公式定義フィールド一覧

（Claude Code固有のフィールドを含む。出典: https://code.claude.com/docs/en/skills ）

| フィールド                 | 必須/推奨                      | 説明                                                         |
| -------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `name`                     | 任意（省略時はディレクトリ名） | スラッシュコマンド名になる                                   |
| `description`              | 推奨                           | スキル発見に使われる。省略時はMarkdown本文の最初の段落を使用 |
| `argument-hint`            | 任意                           | オートコンプリート時に表示されるヒント。例: `[issue-number]` |
| `disable-model-invocation` | 任意                           | `true` にするとClaudeが自動的に発動しない。手動のみ          |
| `user-invocable`           | 任意                           | `false` にするとスラッシュメニューから非表示になる           |
| `allowed-tools`            | 任意                           | スキル実行中にClaudeが承認なしで使用できるツールを制限       |
| `model`                    | 任意                           | スキル実行中のモデルを上書き                                 |
| `context`                  | 任意                           | `fork` を設定するとサブエージェントとして独立実行            |
| `agent`                    | 任意                           | `context: fork` 時に使用するサブエージェントタイプ           |
| `hooks`                    | 任意                           | スキルのライフサイクルに紐付いたフック                       |

### 動的コンテキスト注入（Claude Code固有）

フロントマター内ではなく本文中で `` !`command` `` 構文を使うと、スキル実行前にシェルコマンドの出力を注入できる:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---
## Pull request context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`
```

### 変数置換（Claude Code固有）

| 変数                        | 説明                                 |
| --------------------------- | ------------------------------------ |
| `$ARGUMENTS`                | スキル呼び出し時に渡した引数すべて   |
| `$ARGUMENTS[N]` または `$N` | N番目の引数（0始まり）               |
| `${CLAUDE_SESSION_ID}`      | 現在のセッションID                   |
| `${CLAUDE_SKILL_DIR}`       | SKILL.mdが存在するディレクトリのパス |

（出典: https://code.claude.com/docs/en/skills ）

### 各フィールドの使いどころ

**`disable-model-invocation: true`** を使うべきケース:

- デプロイ、コミット、Slack送信など副作用のある操作
- タイミングをユーザーが制御したいワークフロー
- Claudeが「コードが整ってきたから」で勝手にデプロイするのを防ぐ

**`user-invocable: false`** を使うべきケース:

- バックグラウンドの知識（`legacy-system-context` など）
- ユーザーがスラッシュコマンドとして呼ぶ意味がないが、Claudeには自動適用してほしいもの

**`context: fork`** を使うべきケース:

- 大量の出力を生成する複雑な分析スキル
- メインの会話スレッドを汚染したくない多ステップ処理
- 独立した調査・リサーチタスク

（出典: https://code.claude.com/docs/en/skills および https://claudelog.com/faqs/what-is-context-fork-in-claude-code/ ）

---

## 6. 参照ファイルの設計

### ディレクトリ構造の基本

```
my-skill/
├── SKILL.md              # エントリーポイント（必須）
├── FORMS.md              # フォーム処理ガイド（必要時に読み込み）
├── REFERENCE.md          # APIリファレンス（必要時に読み込み）
├── EXAMPLES.md           # 使用例（必要時に読み込み）
└── scripts/
    ├── analyze.py        # ユーティリティスクリプト（実行のみ、読み込みなし）
    └── validate.py       # バリデーションスクリプト
```

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview ）

### プログレッシブ・ディスクロージャーの実践

| レベル              | タイミング     | トークンコスト               | 内容                                  |
| ------------------- | -------------- | ---------------------------- | ------------------------------------- |
| Level 1: メタデータ | 常時（起動時） | スキル1件あたり約100トークン | フロントマターのnameとdescriptionのみ |
| Level 2: 指示       | スキル発動時   | 5,000トークン以下            | SKILL.md本文                          |
| Level 3+: リソース  | 必要に応じて   | 実質無制限                   | 参照ファイル・スクリプト              |

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview ）

### ファイル分割の判断基準

- SKILL.md本文が500行に近づいてきた → 別ファイルに分割する
- 特定の状況でのみ必要な詳細情報がある → 参照ファイルに分ける
- ドメイン別に分けると認知負荷が下がる → ドメイン別ファイルに整理する（例: `reference/finance.md`, `reference/sales.md`）

### 深いネスト参照を避ける

SKILL.md → advanced.md → details.md のような3階層以上の参照は避ける。Claudeが `head -100` で部分読み込みを行い、情報が欠落するリスクがある。

**参照は SKILL.md から1レベルのみ深くする**（SKILL.md → 参照ファイル）。

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 長い参照ファイルには目次を付ける

100行を超える参照ファイルには冒頭に目次を付ける。Claudeが部分読み込みした際もファイルの全体像を把握できるようになる。

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

---

## 7. 避けるべきパターン（アンチパターン）

### 公式が明示的に警告するアンチパターン

1. **過度な冗長性**: Claudeが既知の概念を長々と説明する
   - 「PDFとはPortable Document Formatの略で…」のような前置き
2. **選択肢の羅列**: 複数のライブラリ・アプローチを並べて「どれか使え」と指示する
3. **時間依存の情報**: 「2025年8月まではXXを使う」のような記述
4. **Windowsスタイルのパス**: `scripts\helper.py` のような記述（UNIX環境でエラー）
5. **深すぎるファイル参照**: 3階層以上の参照チェーン
6. **曖昧なスクリプト意図**: 「実行」なのか「参照」なのかを明示しない
7. **マジックナンバー**: `TIMEOUT = 47` のように根拠のない数値をスクリプトに書く

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

8. **一人称・二人称のdescription**: "I can help you..." または "You can use this..."
9. **MCPツール名の省略**: `bigquery_schema` ではなく `BigQuery:bigquery_schema` と完全修飾で書く

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### コミュニティが報告している問題

- **スキルが多すぎるとコンテキスト予算を超える**: description の文字数が16,000文字（コンテキストウィンドウの2%）を超えると、一部のスキルが除外される。`/context` コマンドで警告を確認できる。
  （出典: https://code.claude.com/docs/en/skills ）
- **`context: fork` は指示がないサブエージェントを生成する**: 「このAPIの規約を使って」のような参照系コンテンツにforkを設定すると、サブエージェントが受け取るのは指示のみで実行タスクがなく、意味のない結果になる。
  （出典: https://code.claude.com/docs/en/skills ）

---

## 8. テスト・評価方法

### 評価ファーストの開発アプローチ

公式が推奨するのは **「まず評価シナリオを作ってからスキルを書く」** という評価駆動開発:

1. スキルなしでClaudeに実際のタスクをやらせ、失敗・不足を文書化する
2. その失敗を再現する評価シナリオを3件以上作成する
3. ベースライン（スキルなし）の性能を測定する
4. 評価シナリオを通過するための最小限のスキルを書く
5. 評価 → 改善 → 評価のサイクルを回す

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 評価シナリオの構造

```json
{
  "skills": ["pdf-processing"],
  "query": "このPDFからテキストを抽出してoutput.txtに保存してください",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "適切なPDFライブラリを使ってPDFを読み込む",
    "全ページのテキストを欠落なく抽出する",
    "output.txtに読みやすい形式で保存する"
  ]
}
```

評価シナリオは自動実行の仕組みはなく、ユーザーが独自に評価システムを構築する必要がある。

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 複数モデルでテストする

スキルはモデルに依存して効果が変わるため、使用するすべてのモデルでテストする:

- **Claude Haiku**: 十分なガイダンスがあるか（Haikuは指示が少ないと迷う）
- **Claude Sonnet**: 明確で効率的か
- **Claude Opus**: 過剰説明になっていないか（Opusは冗長な説明が不要）

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

### 反復的改善のプロセス

公式が推奨する「Claude A / Claude B」方式:

- **Claude A（専門家）**: スキルのドラフト作成・改善を担当
- **Claude B（エージェント）**: 実際のタスクでスキルを使用してテスト
- Claude Bの行動を観察し（どのファイルを読んだか、どのステップを飛ばしたか）、Claude Aにフィードバックして改善する

スキルのナビゲーションを観察するポイント:

- **予期しない探索経路**: 想定外の順序でファイルを読んでいたら、構造が直感的でない可能性
- **参照の見落とし**: 重要なファイルへのリンクが不明瞭・不目立ちな可能性
- **特定セクションへの過度な依存**: そのコンテンツをSKILL.md本文に移すべきかもしれない
- **アクセスされないコンテンツ**: 不要なコンテンツか、参照のシグナルが弱い可能性

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

---

## 付録A: 公式チェックリスト（リリース前確認）

### コア品質

- [ ] descriptionが具体的でキーワードを含む
- [ ] descriptionに「何をするか」と「いつ使うか」の両方が含まれる
- [ ] SKILL.md本文が500行以内
- [ ] 詳細情報は別ファイルに分離されている（必要な場合）
- [ ] 時間依存の情報がない（またはold patternsセクションに隔離）
- [ ] 一貫した用語を使用している
- [ ] 例示が抽象的でなく具体的
- [ ] ファイル参照が1レベルのみの深さ
- [ ] プログレッシブ・ディスクロージャーを適切に使用
- [ ] ワークフローに明確なステップがある

### コードとスクリプト

- [ ] スクリプトがエラーを処理し、Claudeに丸投げしていない
- [ ] すべての数値に根拠のコメントがある
- [ ] 必要なパッケージがインストール済みか確認している
- [ ] Windowsスタイルのパスを使っていない（すべてスラッシュ）
- [ ] 重要な操作にバリデーション・フィードバックループがある

### テスト

- [ ] 評価シナリオが3件以上ある
- [ ] Haiku、Sonnet、Opusでテスト済み
- [ ] 実際のユースケースでテスト済み
- [ ] チームフィードバックを反映している（該当する場合）

（出典: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices ）

---

## 付録B: このプロジェクトの既存スキルの評価メモ

現在の `.claude/skills/` 内のスキルを本レポートの基準で評価した所感:

| スキル名           | description品質       | 本文品質                           | 気になる点                                                |
| ------------------ | --------------------- | ---------------------------------- | --------------------------------------------------------- |
| `cycle-kickoff`    | 中（what/whenが混在） | 良い（ステップが明確）             | descriptionが「いつ使うか」より「何をするか」に偏っている |
| `cycle-planning`   | 中                    | 良い                               | descriptionにキーワードトリガーが少ない                   |
| `cycle-execution`  | 中                    | 良い                               | 同上                                                      |
| `cycle-completion` | —                     | —                                  | 未確認                                                    |
| `new-cycle-idea`   | 中                    | 良い（参照構造が良い）             | descriptionが日本語のみ                                   |
| `contents-review`  | 良い（what/when明確） | 非常に良い（具体的チェックリスト） | `user-invocable: false`を適切に使用                       |
| `docs-management`  | 良い                  | 良い（配置先ルールが明確）         | —                                                         |

全体的に本文の質は高いが、descriptionの「いつ使うか（トリガーキーワード）」部分を強化することで自動発動の精度が向上する余地がある。
