# メモ仕様

## ディレクトリ構成

メモはすべて `memo/` 配下に、受信者ロールごとにパーティション化されます。ディレクトリ名ではスペースをハイフンに置換します。

```
memo/
├── owner/
│   ├── inbox/
│   ├── active/
│   └── archive/
├── project-manager/
│   ├── inbox/
│   ├── active/
│   └── archive/
├── researcher/
│   ├── inbox/
│   ├── active/
│   └── archive/
├── planner/
│   ├── inbox/
│   ├── active/
│   └── archive/
├── builder/
│   ├── inbox/
│   ├── active/
│   └── archive/
├── reviewer/
│   ├── inbox/
│   ├── active/
│   └── archive/
└── process-engineer/
    ├── inbox/
    ├── active/
    └── archive/
```

## ルーティングルール

- メモを送信するには、対象ロールの `inbox/` ディレクトリに新しいメモファイルを作成する

## ライフサイクルルール（read → triage → respond）

1. ロールは作業開始時に `inbox/` と `active/` の両方を確認する
2. ロールは `inbox/` のメモを読み、即座にトリアージする:
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
- `public`（オプション、boolean）-- `true` の場合、メモはWebサイトのメモアーカイブ (`/memos`) で公開される。省略時またはfalseの場合は非公開。CLIで `--public true` または `--public false` で指定可能。

## テンプレート

### 汎用タスクメモ

```md
---
id: "<hex-unix-ms>"
subject: "<short subject>"
from: "<role name>"
to: "<role name>"
created_at: "YYYY-MM-DDTHH:MM:SS±ZZ:ZZ"
tags: ["tag1", "tag2"]
reply_to: null
---

## Context

<why this exists; link to related memo ids; relevant repo paths>

## Request

<what to do>

## Acceptance criteria

- [ ] <objective check>
- [ ] <objective check>

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- <other constraints>

## Notes

<risks, assumptions, options>
```

### 返信メモ

```md
---
id: "<hex-unix-ms>"
subject: "Re: <original subject>"
from: "<role name>"
to: "<role name>"
created_at: "YYYY-MM-DDTHH:MM:SS±ZZ:ZZ"
tags: ["reply"]
reply_to: "<original id>"
---

## Summary

<what you did / found>

## Results

<details>

## Next actions

<what should happen next, if anything>
```

### リサーチメモ（`project manager` → `researcher`）

必須項目:

- 回答すべき質問
- 調査済みリポジトリパス
- 外部ソース（使用した場合）
- 確信度 + 未知の事項

### プランニングメモ（`project manager` → `planner`）

必須項目:

- ゴール
- スコープ境界
- 受入基準
- 必要な成果物（ドキュメント/設定/コード）
- ロールバックアプローチ（概念的）

### 実装メモ（`project manager` → `builder`）

必須項目:

- 正確なスコープ
- 変更予定ファイル
- 受入基準
- 「変更禁止」リスト（ある場合）

### レビューメモ（→ `reviewer`）

必須項目:

- 変更内容（コミット参照またはファイルリスト）
- レビュー重点領域
- 受入基準チェックリスト

### プロセス改善メモ（→ `process engineer`）

必須項目:

- 観察された協調の非効率性
- 提案する変更
- トレードオフ
- プロセス変更のロールアウトとリバート計画
