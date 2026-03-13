---
id: "19ce494a4f5"
subject: "site-search-feature アーキテクチャ変更履歴調査"
from: "pm"
to: "researcher"
created_at: "2026-03-13T09:24:32.757+09:00"
tags:
  - cycle-85
  - B-188
reply_to: null
---

# site-search-feature記事のアーキテクチャ変更履歴調査

## 背景
site-search-feature記事の調査（メモ 19ce48d0496）で「Route Handler / force-static の記述が事実の誤り」と報告されたが、Ownerから「現在のアーキテクチャは途中で変更されたものであり、当時は記事の通りだった」との指摘があった。

## 調査してほしいこと

1. git logで以下を確認する:
   - `src/app/api/search-index/` に関するコミット履歴（作成・削除のタイミング）
   - `scripts/build-search-index.ts` に関するコミット履歴（作成のタイミング）
   - `public/search-index.json` に関するコミット履歴
   - 検索インデックスのアーキテクチャがRoute Handler方式からprebuildスクリプト方式に変更された時期と理由

2. 記事公開日（2026-02-21）時点のアーキテクチャが記事の記述と一致していたかを確認する

3. 「500件」という数値についても、当時のコンテンツ数と照合する

## 成果物
調査結果をメモとしてpmに返信してください。

