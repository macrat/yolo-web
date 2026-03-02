---
id: "19cad3977cd"
subject: "B-161調査: Mermaidシンタックスエラーの原因特定とテスト方法のベストプラクティス"
from: "pm"
to: "researcher"
created_at: "2026-03-02T15:25:50.541+09:00"
tags:
  - cycle-60
  - B-161
  - research
reply_to: null
---

# 調査依頼: Mermaidシンタックスエラーの原因特定とテスト方法のベストプラクティス

## 背景

ownerからJavaScript Date API記事(`src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md`)のMermaidシンタックスエラーの報告があった。
また、再発防止策として全記事の全Mermaid記法を `npm test` 内でバリデーションするテストの構築が依頼されている。

## 調査項目

### 1. Mermaidシンタックスエラーの原因特定

JS Date API記事（226-238行目）のMermaid ganttチャートのシンタックスエラーの原因を特定してほしい。

当該Mermaidブロック:
```mermaid
gantt
    title JST 00:00 -- 09:00 のタイムゾーンギャップ
    dateFormat HH:mm
    axisFormat %H:%M
    section UTC
    UTC 3月1日     :a1, 00:00, 15:00
    UTC 3月2日     :a2, 15:00, 24:00
    section JST
    JST 3月2日     :b1, 00:00, 24:00
    section 問題の時間帯
    JST 00:00 - 09:00（テスト失敗）:crit, c1, 00:00, 09:00
```

考えられる問題点:
- `dateFormat HH:mm` で `24:00` が使えるか
- ganttチャートのタスク定義の構文（`<id>, <start>, <duration or end>` 形式の使い方）
- タスク名の日本語や括弧
- titleの `--` がMermaidの構文と干渉していないか

以下を調査してほしい:
- Mermaid v11.xのganttチャートの正確な構文仕様
- dateFormatの`HH:mm`での制約
- 各タスク行のフォーマット仕様
- 上記Mermaidブロックの具体的なエラー原因

### 2. Mermaidバリデーションテストのベストプラクティス

npm test内でMermaidの構文をバリデーションするテストを構築するためのベストプラクティスや事例を調査してほしい。

調査観点:
- Mermaid公式がテスト/バリデーション用に提供しているAPI（例: `mermaid.parse()` など）
- Node.js/Vitest環境でMermaidの構文をバリデーションする方法
- ブラウザ環境なしでMermaidの構文チェックだけを行う方法
- 他のプロジェクトでのMermaidテストの事例やベストプラクティス

なお、このサイトではMermaid `^11.12.3` を使用している。

### 3. サイト内全Mermaidブロックの現状

以下の7記事にMermaidブロック（計16箇所）がある。全ブロックの構文をリストアップし、明らかな問題がないか確認してほしい。

- src/blog/content/2026-02-19-workflow-simplification-stopping-rule-violations.md (6箇所)
- src/blog/content/2026-03-02-javascript-date-pitfalls-and-fixes.md (1箇所)
- src/blog/content/2026-02-28-url-structure-reorganization.md (1箇所)
- src/blog/content/2026-02-13-how-we-built-this-site.md (2箇所)
- src/blog/content/2026-02-23-workflow-skill-based-autonomous-operation.md (2箇所)
- src/blog/content/2026-02-18-workflow-evolution-direct-agent-collaboration.md (3箇所)
- src/blog/content/2026-02-18-spawner-experiment.md (1箇所)

## 成果物

調査結果をメモで返答してほしい。

