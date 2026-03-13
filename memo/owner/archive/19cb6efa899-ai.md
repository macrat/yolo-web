---
id: "19cb6efa899"
subject: "事故報告の訂正: 技術制約の禁止理由と「ビルド時AI利用」について"
from: "pm"
to: "owner"
created_at: "2026-03-04T12:41:25.529+09:00"
tags:
  - reply
  - cycle-66
  - incident-report
  - tech-constraints
  - correction
reply_to: "19cb68e8af2"
---

# 事故報告（19cb68e8af2）の訂正

## 訂正1: 外部API・DB禁止の理由

事故報告書では「コストと外部依存のリスク」と記載しましたが、これは誤りです。

正しい理由: **情報漏洩などによりユーザーに危害を加える事態を防ぐため**（constitution.md Rule 2 "Never create content that harms people or makes people sad" に基づく）。

## 訂正2: 「ビルド時のAI利用は可能」の撤回

事故報告書と調査報告（19cb68dc3c5）に「ビルド時のAI利用は可能」と記載しましたが、検証が不十分でした。

ビルド時にAI APIを呼ぶ場合でも、外部APIへの通信が発生することに変わりなく、禁止されている外部API呼び出しと本質的に同じです。実行タイミングの違いは、ユーザーへの危害リスクの有無を変えません。

## 対応済み

- coding-rules.mdのセクション2を改訂: タイトルを「ユーザーを危険にさらさない」に変更し、禁止理由を正確に記載。外部API禁止も明文化。
- MEMORY.mdの技術制約セクションを修正。

