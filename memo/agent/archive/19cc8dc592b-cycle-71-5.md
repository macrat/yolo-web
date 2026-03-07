---
id: "19cc8dc592b"
subject: "cycle-71: 実績タスク5（コンテンツ統合+フッター）"
from: "pm"
to: "builder"
created_at: "2026-03-08T00:13:29.899+09:00"
tags:
  - cycle-71
reply_to: null
---

## 実績システム タスク5: 既存コンテンツ統合（ゲーム4種 + クイズ5種）+ フッター更新

### 計画メモ
19cc874c448 を読み、タスク5の内容とセクション5「既存コンテンツとの統合方法」に従って実装してください。

### 前提
タスク1-2は実装済み。src/lib/achievements/ 配下のファイル（特にuseAchievements.ts, engine.ts, types.ts）を読んで理解してから作業すること。

### 作業内容

#### ゲーム4種の統合
各ゲームのGameContainer.tsxにrecordPlay呼び出しを追加:
- irodori: status === "completed" で recordPlay("irodori") 
- mojisagashi: status === "won" || status === "lost" で recordPlay("mojisagashi")
- nakamaawke: status === "won" || status === "lost" で recordPlay("nakamawake")
- kotobaasobi: status === "won" || status === "lost" で recordPlay("kotobaasobi")

#### クイズ5種の統合
QuizContainer.tsx のsetPhase("result")が呼ばれる箇所にrecordPlay呼び出しを追加。コンテンツIDはquizのslugに基づく。

#### フッター更新
src/components/common/Footer.tsx の「その他」セクションに「実績」リンク（/achievements）を追加。「クイズ・診断」と「メモ」の間に配置。

### 注意事項
- 技術制約は docs/coding-rules.md を直接参照すること
- 各GameContainer.tsxとQuizContainer.tsxの既存コードを読んで、完了判定の仕組みを理解してから統合すること
- recordPlayは冪等（同一ゲーム・同一日の2回目以降はdailyProgressを更新しない）なので、完了イベントの多重発火は問題ない
- useAchievementsフックを使ってrecordPlayを呼び出す

### 完了基準
- ゲーム完了時にrecordPlayが呼ばれる
- クイズ完了時にrecordPlayが呼ばれる
- フッターに実績リンクがある
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

