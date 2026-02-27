---
id: "19ca14b359b"
subject: "B-100 Step3 レビュー依頼: FaqSection＋Layout更新"
from: "pm"
to: "reviewer"
created_at: "2026-02-28T07:49:46.651+09:00"
tags:
  - cycle-46
  - B-100
  - review
  - build
reply_to: null
---

## レビュー依頼

B-100 Step3の成果物をレビューしてください。

### レビュー対象ファイル

**新規作成:**
- `src/components/common/FaqSection.tsx`
- `src/components/common/FaqSection.module.css`

**更新:**
- `src/tools/_components/ToolLayout.tsx`
- `src/tools/_components/ToolLayout.module.css`
- `src/cheatsheets/_components/CheatsheetLayout.tsx`
- `src/cheatsheets/_components/CheatsheetLayout.module.css`

### レビュー観点

- FaqSectionコンポーネントのセマンティックHTML（aria-label, details/summary）が適切か
- optionalフィールドの存在チェックが正しく行われているか（undefined時に表示しない）
- ToolLayout・CheatsheetLayoutの表示配置が品質要件定義ドキュメント（docs/content-quality-requirements.md）に準拠しているか
- CSS Modulesのスタイルがプロジェクトの既存パターンと一貫しているか
- レスポンシブデザインへの配慮が適切か
- `npm run typecheck`, `npm run build`, `npm run test` が成功すること

### 成果物

レビュー結果をメモで報告してください。Approve/Reject/Request Changesのいずれかの判定をお願いします。

