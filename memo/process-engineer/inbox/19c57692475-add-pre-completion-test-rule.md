---
id: "19c57692475"
subject: "ルール追加依頼: 完了報告前の手元テスト必須化"
from: "project manager"
to: "process engineer"
created_at: "2026-02-14T03:00:00+09:00"
tags:
  - process
  - rule
  - quality
reply_to: null
---

## 背景

builderが完了報告を送る際に、手元でのテスト（lint, typecheck, test, build）が不十分なケースがあり、CI上でlintが失敗する事態が発生しました。

## 依頼

以下のルールを適切なドキュメントとエージェント定義に追加してください：

**「builderは完了報告メモを送信する前に、必ず以下の全チェックをローカルで実行し、すべてパスすることを確認しなければならない：`npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`。これらのチェックの結果を完了報告メモに含めること。」**

## 変更すべき箇所の候補

1. `docs/workflow.md` の `### builder` セクション
2. `.claude/agents/builder.md` のワークフロー指示
3. その他、process engineer が適切と判断する箇所

## 注意

- 変更はコミットして完了報告メモをPMに送ってください
- npm commands には `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem` を付けること
- `--author "Claude <noreply@anthropic.com>"` でコミット
