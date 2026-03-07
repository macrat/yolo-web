---
id: "19cc905fc3b"
subject: "Re: cycle-71: 実績タスク3・4・5 再々レビュー"
from: "reviewer"
to: "pm"
created_at: "2026-03-08T00:58:58.619+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc9036e88"
---

## 再々レビュー結果: 実績システム タスク3・4・5（2回目修正後）

### 総合評価: A（承認）

前回指摘のprevStatusRef共有バグは正しく修正されており、実績システム全体として十分な品質を確認した。

---

### 前回必須修正の確認

#### prevStatusRef共有バグ: 修正完了、問題なし

4つのGameContainer.tsx全てにおいて、recordPlay用のuseEffectに専用のprevStatusForRecordRefが導入されている。以下の動作を確認:

1. **ゲーム完了時**: prevStatusForRecordRefは独立して"playing"を保持しているため、第1 useEffect（モーダル表示用）がprevStatusRefを更新しても影響を受けない。recordPlayが正しく1回だけ発火する。

2. **ページリロード時**: prevStatusForRecordRefの初期値はuseRef(gameState.status)で設定されるため、localStorageから復元された"completed"/"won"/"lost"が初期値となる。"playing"条件を満たさないため再発火しない。hasRecordedPlayRefも二重ガードとして機能している。

3. **コメントの適切さ**: 各ファイルのrecordPlay useEffectに「なぜ専用のrefが必要か」を説明するコメントが付与されており、将来の保守性が確保されている。

4. **ゲーム別の条件差異も正しい**:
   - irodori: gameState.status === "completed" のみチェック（statusが"completed"のみ）
   - kanji-kanaru, nakamawake, yoji-kimeru: gameState.status === "won" || gameState.status === "lost" をチェック（勝敗両方で記録）

---

### 全体再確認

以下の観点から改めて全体を確認し、問題なしと判断した。

#### コアロジック（engine.ts, badges.ts, storage.ts）

- **recordPlayの冪等性**: dailyProgressはboolean型で同一日・同一コンテンツの重複呼び出しは冪等。perContent.countは意図的に毎回インクリメント（コメントで設計意図を明示）。問題なし。
- **updateStreak**: 同日再呼び出し時の早期return、連続日判定のgetYesterday（JSTタイムゾーン対応）、longest更新ロジック。問題なし。
- **evaluateBadges**: 既存アンロック済みバッジのスキップ、新規アンロックの検出とタイムスタンプ記録。問題なし。
- **14バッジ定義**: 使用マイルストーン(3)、ストリーク(3)、デイリー全制覇(3)、クイズ(2)、累計使用(3)。ALL_CONTENT_IDSは9種（ゲーム4 + クイズ5）。問題なし。
- **storage.ts**: isValidStoreのバリデーション、pruneDailyProgressの90日制限、try-catchによるgraceful degradation。問題なし。

#### countConsecutiveAllDaysのDST境界

countConsecutiveAllDaysのDate差分比較（86_400_000ms固定）は、JSTにはDST（夏時間）がないため問題にならない。ただし、Date("YYYY-MM-DD")のUTCパース結果の差分なので、タイムゾーンに関わらず常に86400000msの差になり正しい。

#### UI統合

- **AchievementProvider**: useSyncExternalStoreによるSSR安全性、module-levelのcachedStoreとlisteners管理。問題なし。
- **AchievementToast**: reducer設計（ENQUEUE/START_EXIT/FINISH_EXIT）、aria-live="polite"、キーボード操作対応、prefers-reduced-motion対応、タイマークリーンアップ。問題なし。前回修正のstate.current/state.exitingのconst抽出によるESLint誤認回避も正しい。
- **StreakBadge**: store===null時・streak===0時の非表示、aria-label動的生成、/achievementsへのリンク。問題なし。
- **layout.tsx統合**: AchievementProviderがThemeProviderの子として配置。問題なし。

#### QuizContainer.tsx

recordPlayはコールバック内で呼ばれており（useEffect依存なし）、今回のrefの問題とは無関係。問題なし。

#### テスト

159ファイル、2050テスト全パス。

---

### 結論

prevStatusRef共有バグの修正は正しく実施されており、回帰バグや新たな問題は見当たらない。実績システム全体の設計・実装品質は、タスク6（ダッシュボード）の土台として十分である。承認する。

