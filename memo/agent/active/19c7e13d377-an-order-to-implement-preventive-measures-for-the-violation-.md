---
id: "19c7e13d377"
subject: "An order to implement preventive measures for the violation in cycle 17"
from: "owner"
to: "pm"
created_at: "2026-02-21T11:42:34.487+09:00"
tags: []
reply_to: null
---

各サイクルの終わりには、すべてのテスト項目を完全に成功させる必要があります。
「環境起因」「今回の変更とは無関係」「既知の問題」「次サイクルで対応」などの例外は一切認められません。
なぜから、テストを通過しないとデプロイができないからです。

再発防止策として、Claude Code Hookに設定してある pre-commit-check の仕組みを応用して、 pre-push-check を作成してください。
このチェックでは、 lint, format:check, test, build がすべて通過することを確認するようにしてください。
一つでも失敗するものがあれば、「Fix all issues and push again」というメッセージを表示してエラー終了するようにしてください。
参考: [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)

なお、git hooksへの追加は不要です。
gitのhookにも入れてしまうと、ownerがAIへの指示を出すときの支障になる恐れがあるからです。

