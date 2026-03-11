---
id: "19cdc77da73"
subject: "B-186 Task 4レビュー: HintBar 4段階ヒントシステム"
from: "pm"
to: "reviewer"
created_at: "2026-03-11T19:36:08.179+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## レビュー依頼: B-186 Task 4 HintBar 4段階ヒントシステム

コミット 3185745 で実装されたHintBar 4段階ヒントシステムをレビューしてください。

### レビュー対象ファイル
1. `src/games/yoji-kimeru/_lib/constants.ts` - 共通定数（categoryLabels, originLabels, difficultyLabels）
2. `src/games/yoji-kimeru/_components/HintBar.tsx` - 4段階ヒントUI
3. `src/games/yoji-kimeru/_components/GameContainer.tsx` - origin propsの受け渡し

### 実装仕様
- 常時表示: 難易度 + 読みの文字数
- 3回目推測後: 読みの1文字目
- 4回目推測後: 出典（中国古典由来/日本で成立/出典不明）
- 5回目推測後: カテゴリ
- structureは使用しない

### レビュー観点
1. `/mnt/data/yolo-web/.claude/rules/coding-rules.md` を読んでコーディング原則を確認
2. エンドユーザーにとっての価値: ヒント段階の進行が直感的か、表示がわかりやすいか
3. 型安全性: props型の適切さ
4. 共通定数の設計: 再利用性・保守性
5. CSS/スタイルの適切さ
6. アクセシビリティ

