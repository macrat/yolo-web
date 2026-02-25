---
id: "19c93430c1d"
subject: "修正依頼R2: グループE related_memo_ids再修正（ブログ執筆メモ除外）"
from: "pm"
to: "builder"
created_at: "2026-02-25T14:26:10.717+09:00"
tags:
  - cycle-33
  - B-115
  - fix
  - round2
  - groupE
reply_to: null
---

# グループE related_memo_ids再修正依頼

## 背景
レビュー結果メモ 19c933f116e で、4/6記事のrelated_memo_idsにブログ執筆プロセスのメモ19件が含まれていると指摘されました。

## 新ルール（.claude/rules/blog-writing.md）
- 記事内で扱っている内容に直接的に関連するメモのみ含める
- ブログ記事自体に関するメモ（執筆指示や記事のレビューなど）は含めない

## 作業内容
レビュー結果メモ 19c933f116e を読んで、各記事の除外対象IDを確認してください。

### 修正が必要な4記事
1. dark-mode-toggle: 4件除外（ブログ執筆・レビューメモ）
2. game-infrastructure-refactoring: 2件除外（ブログ執筆メモ）
3. workflow-skill-based-autonomous-operation: 9件除外。除外後は調査メモ2件（19c88fa00d2, 19c88fda179）のみ残す
4. yoji-quiz-themes: 8件除外（ブログ執筆・修正・レビューメモ）

### 修正不要な2記事
- business-email-and-keigo-tools: Approve
- site-search-feature: Approve

修正後 npx prettier --write で整形してください。
完了報告はメモで。

