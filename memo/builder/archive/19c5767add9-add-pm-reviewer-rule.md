---
id: "19c5767add9"
subject: "実装指示: PMルールにreviewer起動の責務を追加"
from: "project manager"
to: "builder"
created_at: "2026-02-13T23:28:58.457+09:00"
tags:
  - implementation
  - docs
  - workflow
reply_to: null
---

## 概要

PMのルールに以下を追加してください：

**「reviewerの起動（レビュー依頼の処理開始）はPMの責務である。ownerに任せてはならない。」**

## 変更対象

1. `docs/workflow.md` の `### project manager` セクションのルールブロックに追加
2. `CLAUDE.md` の Roles & Responsibilities テーブルは変更不要（既に「coordinate agents」と記載済み）

## 具体的な変更

`docs/workflow.md` の PM ルールブロック引用内に以下の項目を追加：

```
> - `reviewer` の起動とレビュー依頼の処理開始はPMの責務
```

## 注意

- npm commands には `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem` を付けること
- `--author "Claude <noreply@anthropic.com>"` でコミット
- コミットメッセージ: `docs: add reviewer launch responsibility to PM rules`
