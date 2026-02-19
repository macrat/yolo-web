---
id: "19c739e187c"
subject: "blog-article-writing Skill作成とbuilder.md/workflow.md更新"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T10:57:46.748+09:00"
tags: []
reply_to: null
---

## 概要
レビュー承認済みの計画（メモ19c739bd4f8）に従って、以下を実装してください。

## 実装内容

### 1. .claude/skills/blog-article-writing/SKILL.md の新規作成
計画メモ19c739bd4f8のStep 1に記載されている通りに作成してください。
主な内容:
- frontmatterのdescriptionに「ブログ記事の作成・編集を行う場合に必ず実行すること」
- 冒頭にdocs/workflow.mdへの権威ソース参照
- ブログ記事作成基準の要約
- 記事に含めるべき内容の要約（背景、選定理由、設計意図、採用しなかった選択肢、今後の展望、経緯の記録）
- フロントマタースキーマ（updated_atを含む全フィールド）
- AI免責事項の記載ルール（constitution.md Rule 3準拠）
- ファイル命名規則

### 2. .claude/agents/builder.md の変更
Pre-Completion Checksセクションの直後に「Blog Article Check (MANDATORY)」セクションを追加。
計画メモ19c739bd4f8のStep 2の通りに実装してください。

### 3. docs/workflow.md の変更
「ブログ記事の作成基準」セクション冒頭にSkillへの参照注記を1行追加のみ。既存内容は一切削除しないこと。
計画メモ19c739bd4f8のStep 4の通りに実装してください。

## 受入基準
- 計画メモ19c739bd4f8のAcceptance Criteriaをすべて満たすこと
- npm run typecheck, lint, format:check が通ること
- 既存Skill（cycle-kickoff, cycle-completion）が変更されていないこと

## 完了後
- project-manager宛てに完了報告メモを送信
- reviewer宛てにレビュー依頼メモを送信
