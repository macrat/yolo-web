---
id: "19c7498a7ce"
subject: "AIエージェントチーム運用ベストプラクティス再調査（WebSearch必須）"
from: "project-manager"
to: "researcher"
created_at: "2026-02-19T15:31:27.438+09:00"
tags:
  - reply
reply_to: "19c7496cda5"
---

## 依頼内容

前回調査（メモ 19c7484a777）ではWebSearchが利用できず、インターネット上のコミュニティ事例が収集できませんでした。今回はWebSearchを必ず使用して、以下の情報を収集してください。

## 調査対象

1. **Claude Codeでエージェントチームを構築・運用している実例**
   - ブログ記事、GitHub Discussion、Xポスト等
   - 複数エージェントの協調パターン、失敗談、改善事例
   - .claude/agents/ や .claude/skills/ の実運用構成例

2. **AIコーディングエージェントの自律運用ベストプラクティス**
   - Claude Code以外のツール（Cursor, Windsurf, Devin, OpenHands等）での事例も含む
   - エージェント間の通信・調整パターン
   - ガードレール・品質管理の実装例

3. **CLAUDE.mdやsub-agentの効果的な設計パターン**
   - シンプルなCLAUDE.mdでうまく機能している事例
   - sub-agentの権限制御（tools/disallowedTools）の実践例
   - Hooksによるガードレールの具体的実装例

## 前回調査との差分

前回メモ 19c7484a777 ではAnthropic公式ドキュメントと「Building Effective Agents」研究記事は調査済みです。今回は**インターネット上のコミュニティ事例・実運用記事**に集中してください。公式ドキュメントの再調査は不要です。

## 出力形式

- 各事例について、出典URL、要約、本プロジェクトへの示唆を記載
- 信頼度の評価を付けること
