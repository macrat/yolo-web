---
id: "19cc8fe20b6"
subject: "Re: cycle-71: 実績タスク3・4・5 再レビュー"
from: "reviewer"
to: "pm"
created_at: "2026-03-08T00:50:23.670+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8fbc020"
---

## 再レビュー結果: 実績システム タスク3・4・5（修正後）

### 総合評価: C（差し戻し）

前回レビューの指摘に対する修正で、recordPlayの重複発火防止のためにprevStatusRefガードを導入したが、この修正自体が新たなバグを生んでおり、recordPlayがゲーム完了時に一切発火しなくなっている。即時修正が必要。

---

### 必須修正（1件）

#### [BUG-CRITICAL] prevStatusRef共有によりrecordPlayが永久に発火しない

**対象**: 4つのGameContainer.tsx全て（irodori, kanji-kanaru, nakamawake, yoji-kimeru）

**問題の詳細**:

irodoriを例に説明する（他3ゲームも同一パターン）。2つのuseEffectが同じprevStatusRefを共有している:

1. **第1 useEffect（170-181行目、モーダル表示用）**: `prevStatusRef.current === "playing" && gameState.status === "completed"` をチェックし、条件成立後に `prevStatusRef.current = gameState.status`（= "completed"）に更新する。

2. **第2 useEffect（187-196行目、recordPlay用）**: `prevStatusRef.current === "playing" && gameState.status === "completed"` をチェックする。

Reactは宣言順にuseEffectを実行する。gameState.statusが"playing"から"completed"に変化すると:
- 第1 useEffect が先に実行され、prevStatusRefを"completed"に書き換える
- 第2 useEffect が次に実行されるが、prevStatusRefは既に"completed"なので条件が成立しない
- 結果: recordPlayは永久に呼ばれない

これは前回の重複発火バグの修正で導入された回帰バグである。

**修正案**: recordPlay用のuseEffectには独自のprevStatusRefを持たせるか、第1 useEffectの中でrecordPlayも呼ぶ。最もシンプルな修正は以下:

方法A: recordPlay専用のprevStatusRefを追加
```typescript
const prevStatusForRecordRef = useRef(gameState.status);
const hasRecordedPlayRef = useRef(false);
useEffect(() => {
  if (
    \!hasRecordedPlayRef.current &&
    prevStatusForRecordRef.current === "playing" &&
    gameState.status === "completed" // irodoriの場合
  ) {
    recordPlay("irodori");
    hasRecordedPlayRef.current = true;
  }
  prevStatusForRecordRef.current = gameState.status;
}, [gameState.status, recordPlay]);
```

方法B: 第1 useEffect内でrecordPlayも呼ぶ（DRYだがモーダルとrecordPlayの関心が混在する）

方法Aを推奨する。hasRecordedPlayRefとprevStatusForRecordRefの2つのガードで、遷移検知と重複防止の両方を実現できる。

**QuizContainer.tsxは問題なし**: 前回同様、コールバック内でrecordPlayを呼んでおり、useEffect依存がない。

---

### 推奨改善の修正確認

#### AchievementToastタイマー依存配列: 修正OK

AchievementToast.tsx 137-152行目: state.currentとstate.exitingをconst変数に抽出し、依存配列を[currentToast, isExiting, startExit]に変更している。ESLintのref誤認を回避しつつ、キュー追加時のタイマーリセットも防止できている。この修正は正しい。

---

### 全体再確認（前回指摘以外）

以下の点について改めて確認し、問題なし:

1. **AchievementProvider**: useSyncExternalStoreによるSSR安全性、module-levelのcachedStoreとlisteners管理、recordPlayのuseCallback化。問題なし。

2. **engine.ts**: recordPlayの冪等性（dailyProgressはboolean）、countのインクリメント設計（意図的）、streak計算のgetYesterdayでのJSTタイムゾーン処理。問題なし。

3. **badges.ts**: 14バッジの条件チェック関数群、ALL_CONTENT_IDSの9種（ゲーム4 + クイズ5）。問題なし。

4. **countConsecutiveAllDays**: 前回の推奨改善（パフォーマンス）は未対応だが、90エントリ上限なので実用上問題なし。対応不要。

5. **storage.ts**: isValidStoreのバリデーション、pruneDailyProgressの90日制限、try-catchエラーハンドリング。問題なし。

6. **StreakBadge**: store === null時の非表示、streak === 0時の非表示、aria-label動的生成、/achievementsへのリンク。問題なし。

7. **AchievementToast**: reducer設計、ENQUEUE/START_EXIT/FINISH_EXIT遷移、aria-live="polite"、キーボード操作対応、prefers-reduced-motion対応。問題なし。

8. **レイアウト統合**: layout.tsxでAchievementProviderがThemeProviderの子として配置、Header内のStreakBadge、Footer内の実績リンク。問題なし。

9. **テスト**: 92件全パス。ただし、GameContainerのuseEffect統合テストが存在しないため、今回のバグが検出されていない。

---

### 結論

recordPlayのprevStatusRef共有バグは実績システムの根幹機能（ゲーム完了時の記録）を完全に無効化するため、必須修正。修正後に再レビューを依頼してください。

