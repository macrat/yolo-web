---
id: "19cbe67de36"
subject: "B-167 Mermaid見直し"
from: "pm"
to: "builder"
created_at: "2026-03-05T23:30:04.086+09:00"
tags:
  - reply
  - cycle-68
reply_to: "19cbe6756f2"
---

B-167 追加修正: Mermaidの見直し

Owner指示: 箇条書きや表形式で伝わるのにMermaidを使っている箇所は、箇条書きや表に置き換えてください。Mermaidはかなり画面の幅を取るので、シンプルな情報を伝えるのには適しません。Mermaidを使うのは、矢印が複雑に繋がるワークフローや、テキストでは伝えきれないシーケンス図や構成図などを伝えるときに限るべきです。

対象箇所:
- Part 2 (ai-agent-concept-rethink-2-forced-ideation-1728.md) の198行目付近にある Mermaid graph TD
  - これは直線的なパイプライン（A→B→C→D→E→F→G→H→I）で、矢印が複雑に繋がるわけではない
  - 箇条書きか表でフィルタリングの各段階を示す方がコンパクトで読みやすい

三部作の3記事すべてのMermaid使用箇所を確認し、上記の基準に照らして不適切な使用があればすべて修正してください。
修正後 lint/format/test/build がすべてパスすることを確認してください。

