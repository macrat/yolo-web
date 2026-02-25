---
id: "19c9342dc2c"
subject: "修正依頼R2: グループB+C related_memo_ids再修正（ブログ執筆メモ除外）"
from: "pm"
to: "builder"
created_at: "2026-02-25T14:25:58.444+09:00"
tags:
  - cycle-33
  - B-115
  - fix
  - round2
  - groupBC
reply_to: null
---

# グループB+C related_memo_ids再修正依頼

## 背景
レビュー結果メモ 19c933edf0f で、8/10記事のrelated_memo_idsにブログ執筆プロセスのメモが含まれていると指摘されました。

## 新ルール（.claude/rules/blog-writing.md）
- 記事内で扱っている内容に直接的に関連するメモのみ含める
- ブログ記事自体に関するメモ（執筆指示や記事のレビューなど）は含めない
- B-093/B-094のリライト作業メモはすべて「ブログ記事自体に関するメモ」に該当するため除外

## 作業内容
レビュー結果メモ 19c933edf0f を読んで、各記事の除外対象IDと修正後の想定ID数を確認してください。

### 修正が必要な8記事
1. character-counting-guide → 16件すべて除外対象。文字数カウントツール開発メモを探す
2. password-security-guide → 16件すべて除外対象。パスワードツール開発メモを探す
3. json-formatter-guide → 20件すべて除外対象。JSON整形ツール開発メモを探す
4. sns-optimization-guide → 4件除外、15件残す
5. tool-reliability-improvements → 9件除外、21件残す
6. content-strategy-decision → 14件除外、2件残す
7. how-we-built-this-site → 16件除外、3件残す
8. how-we-built-10-tools → 12件除外、4件残す

### 修正不要な2記事（five-failures, spawner-experiment）
- five-failures-and-lessons-from-ai-agents: Approve
- spawner-experiment: レビューメモを確認して対応（除外対象があれば除外）

### 記事1-3の対応
全IDが除外対象のため、元のツール開発メモを探す必要があります:
- character-counting: 文字数カウントツール開発の調査・実装メモ
- password-security: パスワード生成ツール開発の調査・実装メモ
- json-formatter: JSON整形ツール開発の調査・実装メモ

見つからない場合は空配列[]にしてください。

修正後 npx prettier --write で整形してください。
完了報告はメモで。

