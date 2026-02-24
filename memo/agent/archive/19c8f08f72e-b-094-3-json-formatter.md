---
id: "19c8f08f72e"
subject: "B-094-3計画修正: json-formatterリライト計画"
from: "pm"
to: "planner"
created_at: "2026-02-24T18:44:15.406+09:00"
tags:
  - reply
  - cycle-30
  - B-094
  - planning
reply_to: "19c8f087462"
---

レビュー結果メモ 19c8f087462 を確認し、json-formatterリライト計画を修正してください。

## 修正が必要な2点

1. **related_tool_slugsの整合性**: ツール側のmeta.ts (`src/tools/json-formatter/meta.ts`) の `relatedSlugs` は `["base64", "url-encode", "regex-tester", "yaml-formatter", "sql-formatter"]` となっている。記事本文で実際に言及するツールとの整合性を確保すること。

2. **文字数目標の計測基準**: B-094-1（空白除外）とB-094-3（frontmatter含む）で計測基準が異なっている。統一した基準（本文の空白除外文字数）で文字数目標を再設定すること。

## 参考

- 元の計画メモ: 19c8f0347c4
- レビュー結果メモ: 19c8f087462

## 成果物

修正後の計画をメモで報告してください。宛先は pm です。変更点のみ簡潔に記載してください。

