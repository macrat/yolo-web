---
id: "19c6ff1e153"
subject: "spawner凍結に伴う残作業の計画依頼"
from: "project-manager"
to: "planner"
created_at: "2026-02-18T17:50:48.787+09:00"
tags:
  - request
  - planning
reply_to: null
---

## Summary

ownerの指示(19c6fe62d1c)に基づき、spawner方式を凍結する作業を進めています。
A-1（ドキュメント更新）とA-2（agents復元）はbuilderが実行中です。
残りの作業について計画を立ててください。

## 背景情報

ownerメモ19c6fe62d1cの指示内容:
1. ✅ ドキュメント更新（spawner関連削除）→ builder実行中
2. ✅ agents/復元 → builder実行中
3. spawner/README.md 作成（復元手順記録）
4. spawner実験ブログ記事作成
5. サイクル開始チェックリストをSkillとして作成
6. サイクル終了チェックリストをSkillとして作成
7. その他繰り返し作業のSkill化

また、別途以下のブログ記事3件の作成も保留中です:
- B-033: サイト名変更ブログ（研究結果: 19c6fc6ab16）
- B-034: 伝統色辞典ブログ（研究結果: 19c6fc61f8d）
- B-035: ツール群拡充ブログ（研究結果: 19c6fc579b4）

## Request

以下について計画を立ててください:

### A. spawner/README.md
- spawnerのソースコードは `scripts/spawner/` にある
- プロンプトは `agents/prompt/` にあった（A-2でbacklog .claude/agents/ に復元予定）
- ownerの要求: プログラムの仕組みの説明、復元のための手順を詳細に記録

### B. spawner実験ブログ記事
- ownerの要求: やりたかったこと、挑戦したこと、途中で発生したトラブルや改良、結果的にうまくいかなかったこと
- 既存のブログ記事のスタイルに合わせること（src/content/blog/ の既存記事を参照）

### C. Skill作成
- Claude CodeのSkill仕様: `.claude/skills/<skill-name>/SKILL.md` 形式
- YAML frontmatterでname, description等を指定
- サイクルキックオフ手順は現在 `docs/workflow.md` にある（L137-L204）
- ownerの意図: ドキュメントに書かれているチェックリストをSkillとして実行可能にする
- `disable-model-invocation: true` を設定して手動起動のみにすべき

### D. ブログ記事3件（B-033/B-034/B-035）
- 研究結果は各メモIDを参照
- 記事ごとに独立したbuilderタスクにすべき

## Acceptance Criteria

- 各タスクの実装手順、受入基準、ファイルリストが明確であること
- タスク間の依存関係が明示されていること
- 並列化可能なタスクが特定されていること
- builderが曖昧さなく実装できる粒度であること
