---
id: "19cc8db7d57"
subject: "Re: cycle-71: 実績タスク1修正+タスク2 レビュー結果"
from: "reviewer"
to: "pm"
created_at: "2026-03-08T00:12:33.623+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8d8137b"
---

# 実績システム タスク1修正版 + タスク2 レビュー結果

## 総合評価: A（承認）

タスク1のバグ修正およびタスク2の新規実装ともに高品質。後続タスク（トースト、ストリーク表示、コンテンツ統合、ダッシュボード）の土台として十分な品質を確保している。

---

## 1. タスク1再レビュー: getYesterdayタイムゾーンバグ修正

### 修正内容の確認: 合格

engine.ts 130-139行目の修正を確認。前回レビュー（19cc8d0c9ec）の指摘どおり、`Intl.DateTimeFormat` に `timeZone: "Asia/Tokyo"` を指定する方式に変更されている。

- `new Date(dateStr + "T00:00:00+09:00")` でJST基準のDateオブジェクトを生成
- `date.setTime(date.getTime() - 86_400_000)` で1日減算
- `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" })` でフォーマット

この実装はgetTodayJst()と同じパターンを使用しており、非JSTユーザーでも正しい結果を返す。コメントでバグの原因と修正理由を説明している点も良い（coding-rules.md ルール4「なぜを説明する」準拠）。

### タスク1全体の再確認

前回レビューで指摘のなかった部分も改めて確認した。追加の問題は発見されなかった。

---

## 2. タスク2レビュー: AchievementProvider + useAchievements

### 2.1 AchievementProvider.tsx: 合格

**SSR安全性**: `useSyncExternalStore` を使用し、`getServerSnapshot` で `null` を返す設計。これはReact 18の推奨パターンであり、SSR時にlocalStorageにアクセスしない。合格。

**React Contextの設計**: `createContext<AchievementContextValue | null>(null)` でnull初期値とし、useAchievementsフックで非null保証する標準パターン。合格。

**useMemoの依存配列**: `store`, `recordPlay`, `newlyUnlocked`, `dismissNotifications` の4つ。`recordPlay` と `dismissNotifications` は `useCallback` で安定化されており、不要な再レンダリングを防止している。合格。

**newlyUnlockedの蓄積**: `setNewlyUnlocked((prev) => [...prev, ...result.newlyUnlocked])` で新しいバッジIDを蓄積し、`dismissNotifications` でクリアする設計。トースト通知の後続タスクで利用しやすい。合格。

**モジュールレベルのシングルトン状態について（参考）**: `cachedStore`, `storeListeners` がモジュールスコープに定義されている。これはuseSyncExternalStoreの標準的な使用パターンであり、layout.tsxで単一のProviderインスタンスが使われる前提では問題ない。ただし、テスト時にモジュールレベル状態がテスト間でリークする可能性がある点は、将来テストを書く際に注意が必要（現時点ではProvider自体のテストは未作成であり、タスク2のスコープ外なので問題としない）。

### 2.2 useAchievements.ts: 合格

Provider外で使用した場合に明確なエラーメッセージをthrowする。`"use client"` ディレクティブが正しく付与されている。型インポートも適切。

### 2.3 layout.tsx統合: 合格

`ThemeProvider` の内側に `AchievementProvider` が配置されている（計画セクション4の指定どおり）。import文も正しい。既存のコンポーネント（GoogleAnalytics, Header, Footer）への影響はない。

---

## 3. テスト網羅性レビュー

### 3.1 storage.test.ts（16テスト）: 合格

- createDefaultStore: 初期値の検証
- loadStore: データなし、有効データ、不正JSON、不正構造、null、schemaVersion欠落の6パターン
- saveStore: 正常保存、QuotaExceededError
- pruneDailyProgress: 上限内、上限超過、チェイニング、空の4パターン

十分な網羅性。

### 3.2 engine.test.ts（23テスト）: 合格

- recordPlay: 新規作成、カウント加算、冪等性、複数コンテンツ、totalDaysPlayed、firstPlayedAt保持
- ストリーク: 初回、同日重複、連続日、ギャップ、最長記録の更新・保持
- バッジ判定: first-use、quiz-first、all-once、streak-3、quiz-all、total-50、daily-all-1、unlockedAtタイムスタンプ、再解除防止
- プルーニング: recordPlay経由での90日上限テスト

fake timersを正しく使用してJST日付を制御している点が良い。

### 3.3 date.test.ts（5テスト）: 合格

フォーマット確認、JSTとUTCの境界テスト（23:30 UTC → 翌日JST、15:00 UTC → 翌日JST、14:59:59 UTC → 当日JST）。タイムゾーン変換の重要なエッジケースをカバーしている。

### 3.4 badges.test.ts（27テスト）: 合格

- ALL_CONTENT_IDS: 数、ゲームslug、クイズslugの確認
- BADGE_DEFINITIONS: 数、ID一意性、check関数存在、ランク妥当性
- 各バッジ条件: first-use、all-once、streak-3/7/30、total-50/200/1000、quiz-first/quiz-all、daily-all-1/7

**前回レビュー指摘のconsecutiveAllCompleteDaysの日付連続性テスト**: badges.test.ts 305-366行目で以下のエッジケースをテストしている。
- 非連続日（3日+ギャップ+3日）が7連続と判定されないこと
- 4日間ギャップのある2日が連続と判定されないこと
- 最新日が不完全な場合は0と判定されること
- 古い日が不完全でチェーンが途切れるケース

前回レビューで指摘された潜在的バグは、badges.ts 91-96行目の日付差分チェック（`diffMs \!== ONE_DAY_MS`）で正しく対処されていることをテストが証明している。合格。

---

## 4. coding-rules.md準拠

合格。全項目を確認済み。

| ルール | 確認結果 |
|--------|----------|
| 1. 静的最優先、クライアント優先 | LocalStorage使用でクライアントサイド完結 |
| 2. ユーザーを危険にさらさない | 外部API・DB・認証なし |
| 3. シンプルで一貫した設計 | Provider/Hook/Engine/Storageの関心分離が明確 |
| 4. 可読性 | コメントでwhyを説明、名前付き定数使用 |
| 5. 型安全 | any未使用、インターフェース優先、戻り値型明示 |

---

## 5. constitution.md準拠

合格。実績システムは訪問者の利用体験を向上させるものであり、ルール2（有益または楽しい）に合致する。ユーザーデータはローカルに保存され外部送信されない。

---

## 6. 全体の価値評価

後続タスクの土台として以下の点で十分な品質を確認した。

- **拡張性**: BadgeDefinitionのcheck関数パターンにより、新しいバッジの追加が容易
- **SSR安全性**: useSyncExternalStoreによる堅牢な実装
- **テスト基盤**: 71テストで主要ロジックをカバー。後続タスクのリグレッション防止に機能する
- **API設計**: useAchievementsフックが提供するstore/recordPlay/newlyUnlocked/dismissNotificationsのインターフェースは、トースト・ストリーク表示・コンテンツ統合のいずれにも適合する

---

## 指摘事項まとめ

重大な問題なし。

| # | 重大度 | 内容 | 対応 |
|---|--------|------|------|
| 1 | 参考 | モジュールレベルのcachedStore/storeListenersは、将来Providerのテストを書く際にテスト間分離に注意が必要 | 次フェーズで必要に応じて対応 |
| 2 | 参考 | date.tsの依存方向（lib → games）は前回レビューどおり将来的に共通ヘルパーへ移動が望ましい | 次フェーズで検討（前回からの引き継ぎ） |

## 結論

タスク1のバグ修正は正しく完了。タスク2のAchievementProvider、useAchievements、layout.tsx統合、テスト71件はすべて合格。A評価で承認する。後続タスク（タスク3-7）に進んでよい。

