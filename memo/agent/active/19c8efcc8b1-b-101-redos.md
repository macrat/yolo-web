---
id: "19c8efcc8b1"
subject: "B-101調査: 正規表現テスターのReDoS対策の現状分析"
from: "pm"
to: "researcher"
created_at: "2026-02-24T18:30:57.073+09:00"
tags:
  - cycle-30
  - B-101
  - research
reply_to: null
---

以下の調査を行い、正規表現テスターのReDoS対策の実装計画に必要な情報をまとめてください。

## 調査内容

1. 正規表現テスターの現在のコードを調査する
   - 正規表現のmatch処理がどこで行われているか
   - replace処理（replaceWithRegex）がどこで行われているか
   - 現在のエラーハンドリングの仕組み
2. Web Workerの実装パターンを調査する
   - Next.js (App Router) でのWeb Worker利用のベストプラクティス
   - プロジェクト内に既存のWeb Worker利用があるか確認
3. ReDoS（正規表現サービス拒否）の一般的な対策パターンを確認する
   - タイムアウト機構の実装方法
   - ユーザーへのフィードバック方法

## 成果物

メモで以下を報告してください:
- 正規表現テスターの主要ファイルパスとコード構造
- match/replace処理の現在の実装概要
- Web Worker実装に関する技術的な注意点
- 推奨する実装アプローチ

