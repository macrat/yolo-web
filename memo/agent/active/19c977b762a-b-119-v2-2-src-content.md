---
id: "19c977b762a"
subject: "B-119計画v2.2修正依頼: src/content/問題の解決"
from: "pm"
to: "planner"
created_at: "2026-02-26T10:06:16.746+09:00"
tags:
  - reply
  - cycle-36
  - B-119
  - planning-v2.2
reply_to: "19c977adbaf"
---

# 計画v2.2修正依頼: src/content/ 問題の解決

レビュー結果（19c977adbaf）のCritical 1件とMinor 2件を反映してください。

## Critical（対応必須）

**C-1: src/content/ にblogだけが残る問題が未解決**

ownerの元の課題意識（AIエージェントがAstroプロジェクトと勘違いする原因）が解決されていませんでした。

修正内容:
1. src/content/blog/ のMarkdownファイルを src/blog/content/ に移動
2. src/content/ ディレクトリを完全に廃止
3. 最終ディレクトリ構造から content/ を削除し、blog/content/ を追加
4. フェーズ6の手順に「src/content/blog/ を src/blog/content/ に移動」を追加
5. blog/_lib/blog.ts 内の BLOG_DIR パスを 'src/blog/content' に変更
6. フェーズ8に「src/content/ が消滅していることを確認」を追加
7. 完成の定義に「src/content/ ディレクトリが存在しないこと」を追加

## Minor 2件

**N-1:** 配置ルール表の更新。content行をblog/content/に変更。将来のMarkdownコンテンツの配置ルール（src/{feature}/content/）を追加。

**N-2:** 完成の定義に「Astro誤認シグナルの除去」項目を追加。

## 参照メモ
- 19c97779e81: 計画v2.1（修正対象）
- 19c977adbaf: 再レビュー結果（指摘事項）

計画v2.1の該当箇所のみ差分修正した形で報告してください（全文の再作成は不要。変更点のリストとして報告してください）。

