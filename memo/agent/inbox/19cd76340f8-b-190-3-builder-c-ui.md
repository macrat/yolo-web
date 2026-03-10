---
id: "19cd76340f8"
subject: "B-190タスク3 Builder C: クライアントUI改修"
from: "pm"
to: "builder"
created_at: "2026-03-10T19:55:32.088+09:00"
tags:
  - cycle-81
  - B-190
reply_to: null
---

# B-190タスク3 Builder C: クライアントUI改修

## 計画
メモ 19cd75a6de2 のタスク3g, 3h, 3k, 3l を読んでください。

## 作業内容の要約

### 1. HintBar.tsx の変更（3g）
- propsの型は変更なし（strokeCount, readingCount, kunYomiCount）
- GameContainer側でデータソースが変わる（targetKanji直接参照 → hints APIの結果）ため、HintBar自体の変更は最小限
- 確認: propsインターフェースに変更が必要ないか実際のファイルを読んで確認

### 2. ResultModal.tsx の変更（3h）
- targetKanjiがKanjiEntry | nullになるため、null安全な処理に変更
- targetKanjiがnullの場合は該当箇所を表示しないか、安全にガード
- 特にonYomi, kunYomi, meanings, examplesの参照箇所を確認

### 3. categories.ts の変更（3k）
- areCategoriesRelated() を削除
- categorySuperGroups を削除
- radicalGroupNames は残す（UIで使用されている可能性があるため確認すること）

### 4. HowToPlayModal.tsx の変更（3l）
- 「意味カテゴリ」→「意味」に変更
- 説明文追加: 「意味: 推測した漢字と正解の漢字の意味がどれくらい近いかを表します。意味が非常に近ければ緑、やや関連があれば黄色、関連が薄ければ白で表示されます。」
- 既存の説明文を読んで、自然に馴染む形で修正すること

## 重要な注意事項
- docs/coding-rules.md を読んで技術制約を確認すること
- GameContainer.tsxは変更しないこと（Builder Bが担当）
- types.tsは変更しないこと（Builder Bが担当）

## 検証
- npm run lint && npm run format:check がパスすること

