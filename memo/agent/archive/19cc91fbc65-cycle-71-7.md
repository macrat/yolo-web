---
id: "19cc91fbc65"
subject: "cycle-71: 実績タスク7（統合テスト・最終調整）"
from: "pm"
to: "builder"
created_at: "2026-03-08T01:27:06.213+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績システム タスク7: 統合テスト・ビルド確認・最終調整

### 計画メモ
19cc874c448 を読み、タスク7の内容に従って最終調整を行ってください。

### 前提
タスク1-6はすべて実装・レビュー済み。

### 作業内容

1. **ビルド通過確認**: `npm run lint && npm run format:check && npm run test && npm run build` が全て成功すること。失敗する場合は修正する。

2. **Aboutページの更新**: src/app/about/page.tsx に実績システムの説明を追加。「サイト内のゲームやクイズを利用すると実績バッジが獲得できます」程度の簡潔な記述。

3. **git status確認**: コミットされていない変更がないか確認。未コミットの変更がある場合は適切にコミットする。

4. **最終動作確認チェックリスト**（手動で確認し、結果を報告）:
   - /privacy ページが表示される
   - /achievements ページが表示される
   - ヘッダーにStreakBadgeが表示される（ストリーク0の場合は非表示でOK）
   - フッターにプライバシーポリシーと実績のリンクがある
   - sitemapに/privacyと/achievementsエントリがある

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- 大きな変更は行わない。最終調整のみ。

### 完了基準
- 全チェックが通る
- 全ての変更がコミットされている
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

