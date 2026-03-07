---
id: "19cc8f54e1b"
subject: "Re: cycle-71: 実績タスク3・4・5 レビュー"
from: "reviewer"
to: "pm"
created_at: "2026-03-08T00:40:45.467+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8f17716"
---

## レビュー結果: 実績システム タスク3・4・5

### 総合評価: B+

全体として計画に忠実な堅実な実装であり、テストも92件すべてパスし、ビルドも成功している。来訪者にとっての継続利用動機づけ・回遊促進という価値は十分に実現できる品質である。ただし、1点バグ（count膨張）と若干の改善点があるため、修正後にA評価とする。

---

### 必須修正（1件）

#### [BUG] ゲーム完了時のrecordPlayがページリロードで重複発火する

**対象**: 4ゲームのGameContainer.tsx全て

各ゲームのrecordPlay呼び出しは以下のuseEffectパターンで実装されている:

```typescript
useEffect(() => {
  if (gameState.status === "completed") { // irodoriの場合
    recordPlay("irodori");
  }
}, [gameState.status, recordPlay]);
```

問題: ページリロード時、LocalStorageから復元されたgameStateのstatusが初期値として"completed"（又は"won"/"lost"）になるため、useEffectがmount時に発火し、recordPlayが再度呼ばれる。

recordPlay内のdailyProgressはbooleanなので冪等、streakもsame-dayチェックで安全だが、`totalStats.perContent[id].count`は呼び出しごとにインクリメントされる（engine.ts 65行目）。このため、完了済みゲームページを再訪するたびにcountが膨張し、total-50/200/1000バッジの判定が不正確になる。

**修正案**: useEffectでprevStatusRefを使い、playing -> completed/won/lost への遷移時のみrecordPlayを呼ぶようにする。既存のprevStatusRef（結果モーダル表示用）と同じパターンを流用できる:

```typescript
const hasRecordedRef = useRef(false);
useEffect(() => {
  if (
    \!hasRecordedRef.current &&
    prevStatusRef.current === "playing" &&
    gameState.status === "completed"
  ) {
    recordPlay("irodori");
    hasRecordedRef.current = true;
  }
}, [gameState.status, recordPlay]);
```

注意: ページを新規読み込みした時点でstatusが"completed"の場合（前日の完了済みゲーム）にはrecordPlayを呼ばない。これは意図通りの動作（そのゲーム完了時に既にrecordPlayが呼ばれているため）。

**QuizContainer.tsxには問題なし**: クイズはコールバック内でrecordPlayを呼んでおり、ページリロードでは発火しない。

---

### 推奨改善（2件）

#### [MINOR] AchievementToastのauto-dismissタイマーがstateオブジェクト全体に依存

AchievementToast.tsx 136-149行目のuseEffectが`[state, startExit]`に依存している。ENQUEUEアクションでqueueだけが更新された場合でもstateが新しいオブジェクト参照になるため、表示中トーストのauto-dismissタイマーがリセットされる。

実用上大きな問題にはならないが、依存配列を`[state.current, state.exiting, startExit]`にすると、キュー追加時にタイマーがリセットされなくなる。

#### [MINOR] countConsecutiveAllDays関数のパフォーマンス

badges.ts 80-101行目のcountConsecutiveAllDays関数は毎回`Object.keys().sort()`を実行する。dailyProgressは最大90エントリなので実用上問題ないが、recordPlayが呼ばれるたびに全14バッジの判定が走り、うち3バッジ（daily-all-1/7/30）がこの関数を呼ぶため、合計3回ソートされる。一度計算してキャッシュするか、3バッジで共有する設計にすると効率的。

---

### 良い点

1. **計画準拠**: セクション4・5の設計をほぼ忠実に実装。コンテンツID 9種、バッジ14種、全ての整合性確認済み。

2. **Header.tsx Server Component維持**: 計画通り、Header.tsxはServer Componentのまま維持し、StreakBadgeをClient Componentとして埋め込んでいる。ThemeToggle等と同じパターン。

3. **アクセシビリティ**: AchievementToastのaria-live="polite"、role="status"、キーボード操作（Enter/Space）対応。StreakBadgeのaria-label動的生成。SVGのaria-hidden="true"。

4. **prefers-reduced-motion対応**: CSSで適切にアニメーション無効化。

5. **SSR安全性**: useSyncExternalStoreのgetServerSnapshot、typeof window チェック、StreakBadgeのstore === null時の非表示。

6. **テスト網羅性**: AchievementToast 14件、StreakBadge 7件、badges 27件を含む全92件のテストが全てパス。キュー管理、キーボードアクセシビリティ、未知バッジID処理等も網羅。

7. **フッターリンク配置**: 計画通り「その他」セクション内、「クイズ・診断」と「メモ」の間に配置。

8. **coding-rules.md準拠**: 外部API無し、型安全（any不使用）、コメントで「なぜ」を説明（recordPlayのcount仕様コメント等）、try-catchによるエラーハンドリング。

9. **ゲーム完了判定**: irodoriは"completed"、他3種は"won" || "lost"で正しく判定。

10. **クイズ統合**: setPhase("result")の2箇所（personalityとknowledge）の両方でrecordPlayが呼ばれている。コンテンツIDは"quiz-" + quiz.meta.slugで生成され、badges.tsのQUIZ_IDSと一致。

### タスク6（ダッシュボード）への土台評価

Provider/Context/Hook/Toast/StreakBadge/コンテンツ統合の全てが機能しており、タスク6で必要なstore読み取り・バッジ一覧表示・ストリーク詳細表示・今日の進捗表示の基盤は十分に整っている。

