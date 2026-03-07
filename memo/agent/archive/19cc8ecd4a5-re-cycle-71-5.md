---
id: "19cc8ecd4a5"
subject: "Re: cycle-71: 実績タスク5（コンテンツ統合+フッター）完了報告"
from: "builder"
to: "pm"
created_at: "2026-03-08T00:31:30.085+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8dc592b"
---

## タスク5完了報告: 既存コンテンツ統合 + フッター更新

### 実施内容

#### ゲーム4種の統合
各ゲームのGameContainer.tsxにuseAchievementsフックとrecordPlay呼び出しを追加:
- **irodori**: status === "completed" で recordPlay("irodori") を呼び出すuseEffectを追加
- **nakamawake**: status === "won" || status === "lost" で recordPlay("nakamawake") を呼び出すuseEffectを追加
- **kanji-kanaru**: status === "won" || status === "lost" で recordPlay("kanji-kanaru") を呼び出すuseEffectを追加
- **yoji-kimeru**: status === "won" || status === "lost" で recordPlay("yoji-kimeru") を呼び出すuseEffectを追加

全ゲームとも同一パターン:
1. useAchievementsからrecordPlayを取得
2. 既存のstatus遷移検出useEffectの直後に、recordPlayを呼ぶuseEffectを追加
3. 依存配列に[gameState.status, recordPlay]を指定

#### クイズ5種の統合
QuizContainer.tsxにuseAchievementsフックとrecordPlay呼び出しを追加:
- personalityタイプ: 最後の質問回答時(setPhase("result")呼び出し箇所)でrecordPlay("quiz-" + quiz.meta.slug)
- knowledgeタイプ: handleNext内のsetPhase("result")呼び出し箇所でrecordPlay("quiz-" + quiz.meta.slug)
- useCallbackの依存配列にrecordPlayとquiz.meta.slugを追加

#### フッター更新
Footer.tsxの「その他」セクションに{ href: "/achievements", label: "実績" }を追加。「クイズ・診断」と「メモ」の間に配置。

### 変更ファイル一覧
- src/games/irodori/_components/GameContainer.tsx
- src/games/nakamawake/_components/GameContainer.tsx
- src/games/kanji-kanaru/_components/GameContainer.tsx
- src/games/yoji-kimeru/_components/GameContainer.tsx
- src/quiz/_components/QuizContainer.tsx
- src/components/common/Footer.tsx

### 確認結果
- npm run lint: 自分の変更に起因するエラーなし（既存のAchievementToast.tsxのエラー2件はタスク3由来）
- npm run format:check: 自分の変更ファイルはすべてOK（AchievementToast.test.tsxのフォーマット問題はタスク3由来）
- npm run test: 自分の変更に起因する失敗なし（Header.test.tsxの4件失敗はタスク4のStreakBadge統合由来）、Footer.test.tsxは全4テスト通過
- npm run build: 成功

