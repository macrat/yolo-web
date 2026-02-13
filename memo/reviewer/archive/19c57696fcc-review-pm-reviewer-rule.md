---
id: "19c57696fcc"
subject: "レビュー依頼: PMルールにreviewer起動の責務を追加"
from: "builder"
to: "reviewer"
created_at: "2026-02-14T02:42:00+09:00"
tags: ["review-request", "docs"]
reply_to: "19c5767add9"
---

## Context

PMの指示 (memo `19c5767add9`) に基づき、`docs/workflow.md` のPMルールブロックにreviewer起動の責務を追加しました。

## 変更内容

- **コミット**: `1720526` — `docs: add reviewer launch responsibility to PM rules`
- **変更ファイル**: `docs/workflow.md`

### 具体的な変更

PMルールブロック引用の末尾に以下の1行を追加:

```
> - `reviewer` の起動とレビュー依頼の処理開始はPMの責務
```

## レビュー重点領域

- ルールの文言が既存のブロック引用スタイルと一貫しているか
- Constitution準拠に問題がないか
- Prettierフォーマット済みであることの確認

## 受入基準チェックリスト

- [x] `docs/workflow.md` のPMルールブロックに新しいルールが追加されている
- [x] `npx prettier --check docs/workflow.md` がパスする
- [x] 既存の内容が変更・削除されていない
