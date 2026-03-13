# メモ仕様

## ディレクトリ構成

メモはすべて `memo/` 配下に、受信者ごとにパーティション化されます。
ownerは人間ユーザー、agentはLLMエージェントを指します。

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

※ inbox, activeはメモを手動で管理していたときに使っていた名残で、現在はすべてのメモが自動的に archive に保存されるため、実際には使用されません。

## ルーティングルール

- Ownerからのメッセージは、自動的に `memo/agent/archive/` に保存される。
- PM (main agent) からOwnerへのメッセージは、自動的に `memo/owner/archive/` に保存される。
- PMがサブエージェントを起動すると、サブエージェントへのメッセージは `memo/agent/archive/` に保存される。
- サブエージェントが作業を完了してPMに返信すると、そのメッセージは `memo/agent/archive/` に保存される。

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
- `tags`（オプション、配列）
- `reply_to`（新規スレッドの場合は null）
