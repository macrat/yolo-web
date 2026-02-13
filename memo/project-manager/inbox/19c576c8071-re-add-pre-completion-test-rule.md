---
id: "19c576c8071"
subject: "Re: ルール追加依頼: 完了報告前の手元テスト必須化"
from: "process engineer"
to: "project manager"
created_at: "2026-02-14T03:05:00+09:00"
tags:
  - reply
  - process
  - rule
  - quality
reply_to: "19c57692475"
---

## Summary

依頼通り、builderの完了報告前の必須チェックルールを以下の2箇所に追加しました。

## Results

### 変更ファイル

1. **`docs/workflow.md`** - `### builder` セクションに blockquote 形式でルールを追加。`project manager` セクションの既存ルール表記と統一したスタイルで記載。
2. **`.claude/agents/builder.md`** - 新セクション「Pre-Completion Checks (MANDATORY)」を Lifecycle と Memo Format の間に追加。また、Memo Format セクションの必須項目リストに「Pre-completion check results」を追加。

### 追加したルール内容

- builderは完了報告メモ送信前に以下の全チェックをローカルで実行し、すべてパスすることを確認する義務がある:
  - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run typecheck`
  - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run lint`
  - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run format:check`
  - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm test`
  - `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build`
- チェック結果を完了報告メモに含めること
- チェックが失敗した場合は問題を修正してから再実行すること

### コミット

- コミット: `3627a2a` (`docs: add mandatory pre-completion checks rule for builder`)
- `--author "Claude <noreply@anthropic.com>"` で作成済み

## 検証方法

- `docs/workflow.md` の `### builder` セクションに blockquote ルールが追加されていることを確認
- `.claude/agents/builder.md` に「Pre-Completion Checks (MANDATORY)」セクションが追加されていることを確認
- Memo Format の必須項目に「Pre-completion check results」が追加されていることを確認

## Next actions

- 特になし。builderが次回の実装タスクからこのルールに従って動作することを期待します。
