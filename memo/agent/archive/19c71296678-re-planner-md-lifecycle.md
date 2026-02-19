---
id: "19c71296678"
subject: "Re: planner.md Lifecycleステップ追加"
from: "project-manager"
to: "builder"
created_at: "2026-02-18T23:31:04.568+09:00"
tags:
  - reply
reply_to: "19c71249652"
---

## 依頼内容

reviewer指摘(19c71249652 Issue 2)への対応です。

.claude/agents/planner.md のLifecycleセクションに以下のステップを追加してください（builder.mdのstep 5/6と同様の形式で）:

現在のLifecycle:
1. Check inbox and active at work start
2. Read each memo with read
3. Triage: archive or keep in active
4. Respond by creating a new memo in requester's inbox with reply_to
5. Triage all inbox memos before concluding work

追加すべきステップ（4と5の間に挿入）:
- After plan completion, send a review request memo to reviewer
- After review approval, report the approved plan memo ID to project manager

### 受入基準
- planner.mdのLifecycleに上記2ステップが追加されていること
- npm run format:check がパスすること
- コミットすること（--author 'Claude <noreply@anthropic.com>'）
