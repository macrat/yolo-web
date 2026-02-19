# メモ仕様

## ディレクトリ構成

メモはすべて `memo/` 配下に、受信者ごとにパーティション化されます。
ownerは人間ユーザー、agentはLLMエージェントを指します。各受信者の下には、メモの状態に応じて `inbox/`, `active/`, `archive/` の3つのサブディレクトリがあります。

```
memo/
├── owner/
│   ├── inbox/
│   ├── active/
│   └── archive/
└── agent/
    ├── inbox/
    ├── active/
    └── archive/
```

## ルーティングルール

- すべてのメモ操作は必ずメモCLIツール（`npm run memo`）を使用すること。`memo/` ディレクトリを直接操作（ファイルの作成、移動、編集、削除）することは禁止する
- メモを送信するには、 `npm run memo -- create` を使用して、送信先の `inbox/` に新しいメモファイルを作成する

## メモの粒度ルール

**1メモ1タスクの原則**: 1つのメモには1つの作業依頼のみを含めること。複数の作業を依頼する場合は、作業ごとに独立したメモを作成すること。

**背景**: LLMエージェントはコンテキスト量の増加に伴い出力品質が劣化する。本プロジェクトではエージェントを小さな単位で起動し、メモによるやりとりに限定することで高品質なコンテキストを実現している。1つのメモに複数タスクを含めると、この設計意図が損なわれる。

## ライフサイクルルール（read → triage → respond）

1. 作業開始時に `inbox/` と `active/` の両方を確認する
2. `inbox/` のメモを読み、即座にトリアージする:
   - 単発の情報提供や返信 → `archive/` へ移動
   - 継続的なタスク → `active/` へ移動
3. `active/` のメモはタスク完了時に `archive/` へ移動する
4. エージェントは作業終了前にすべての `inbox/` メモをトリアージしなければならない
5. 返信が必要な場合、`reply_to` で元メモの `id` を参照する**新しい**メモファイルを依頼者の `inbox/` に作成する

## メモIDとファイル名

- `id` はUNIXタイムスタンプ（ミリ秒）を**16進数**でエンコードしたもの（ゼロパディングなし）
- ファイル名: `<id>-<kebab-case-subject>.md`
- `reply_to` は返信先メモの `id`

## メモフォーマット（YAMLフロントマター + Markdownボディ）

すべてのメモファイルは以下のYAMLフロントマターで始まる必要があります：

- `id`
- `subject`
- `from`
- `to`
- `created_at`（ISO-8601 タイムゾーン付き）
- `tags`（リスト）
- `reply_to`（新規スレッドの場合は null）

## CLIコマンドリファレンス

すべてのメモ操作は `npm run memo` コマンドを通じて行う。`memo/` ディレクトリの直接操作は禁止。

### `npm run memo -- list [options]`

メモの一覧を表示する。タブ区切りで `id`, `reply_to`, `created_at`, `from`, `to`, `state`, `subject` を出力。

オプション:

- `--state <state>` -- "inbox", "active", "archive", "all"（デフォルト: "all"）
- `--from <from>` -- 送信元でフィルタ
- `--to <to>` -- 送信先でフィルタ
- `--tag <tag>` -- タグでフィルタ（複数回指定で AND 条件）
- `--limit <number>` -- 表示件数（デフォルト: 10）
- `--fields <fields>` -- 表示フィールドをカンマ区切りで指定

### `npm run memo -- read <id>`

指定した ID のメモ内容をそのまま表示する。

### `npm run memo -- create <from> <to> <subject> [options]`

新しいメモを作成する。作成成功時は ID を出力。

オプション:

- `--reply-to <id>` -- 返信先メモの ID
- `--tags <tags>` -- タグ（カンマ区切り）
- `--body <body>` -- 本文（省略時は標準入力から読み取り）
- `--skip-credential-check` -- 機密情報チェックをスキップ

### `npm run memo -- mark <id> <state>`

メモの状態を変更する。`<state>` は "inbox", "active", "archive" のいずれか。
