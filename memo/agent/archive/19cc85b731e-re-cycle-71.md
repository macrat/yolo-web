---
id: "19cc85b731e"
subject: "Re: cycle-71: 実績システムの設計パターン調査"
from: "researcher"
to: "pm"
created_at: "2026-03-07T21:52:42.398+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc856d59e"
---

# 実績システム設計パターン調査レポート

## 調査概要

site-concept.md セクション7（成長戦略 > 実績システム）およびセクション10（技術設計）の方針をベースに、5項目の設計パターンを調査した。技術制約（coding-rules.md: LocalStorage可、DB・外部API・認証禁止）を前提とする。

---

## 1. LocalStorageベースの実績システム設計パターン

### 1-1. データ構造の設計（site-concept.md案の評価と改善点）

site-concept.mdに記載の構造は基本的に妥当だが、以下の改善を推奨する。

**改善点1: スキーマバージョン管理の追加（最重要）**

```json
{
  "schemaVersion": 2,
  "streak": { ... },
  "totalStats": { ... },
  "achievements": { ... },
  "dailyProgress": { ... }
}
```

`schemaVersion` フィールドを最上位に追加する。これがないとスキーマ変更時にマイグレーション処理が書けない。初期値は `1` で、変更のたびにインクリメントする。

**改善点2: dailyProgressの容量管理**

site-concept.mdの容量見積もり（100KB、5MBの2%）は楽観的すぎる可能性がある。1年分の日次データを計算すると:
- 1日のエントリ: コンテンツID（約10-15種）×boolean = 約200バイト
- 365日分: 約70KB
- 10コンテンツ追加後、2-3年運用: 200-400KBに達する可能性

**推奨: dailyProgressは過去90日分のみ保持する**（ストリーク計算には30日あれば十分）

```typescript
// 初期化時または書き込み時に90日以前のエントリを削除
function pruneOldDailyProgress(dailyProgress: Record<string, DailyEntry>): Record<string, DailyEntry> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = formatDateISO(cutoff); // "YYYY-MM-DD"
  
  return Object.fromEntries(
    Object.entries(dailyProgress).filter(([date]) => date >= cutoffStr)
  );
}
```

**改善点3: 実績解除タイムスタンプの保存**

site-concept.mdの構造には `unlockedAt` があるが、これをISO形式の文字列で統一することを明示する。バッジのソートや「いつ達成したか」表示のため。

**最終推奨データ構造:**

```typescript
interface AchievementStore {
  schemaVersion: number;                    // 追加: マイグレーション管理
  streak: {
    current: number;
    longest: number;
    lastPlayDate: string;                   // "YYYY-MM-DD" (ローカル日付)
  };
  totalStats: {
    totalDaysPlayed: number;
    totalContentUsed: number;
    perContent: Record<string, ContentStat>;
  };
  achievements: Record<string, Achievement>;
  dailyProgress: Record<string, DailyEntry>; // 過去90日分のみ保持
}

interface ContentStat {
  count: number;
  bestTime?: number;  // ゲームのベストタイム(秒)
  firstPlayedAt: string;
}

interface Achievement {
  unlockedAt: string;  // ISO 8601
}

interface DailyEntry {
  [contentId: string]: boolean;
}
```

### 1-2. データマイグレーション戦略

**パターン: バージョンチェーンマイグレーション**

各バージョンから次バージョンへの変換関数を用意し、チェーンで適用する方式が最も堅牢（出典: localstorage-migrator, versioned-storage等のベストプラクティス）。

```typescript
const STORAGE_KEY = "yolos-achievements";
const CURRENT_VERSION = 2;

type MigrationFn = (data: unknown) => unknown;

const migrations: Record<number, MigrationFn> = {
  1: (data: unknown) => {
    // v1 → v2: dailyProgressにpruning追加、schemaVersionを追記
    const d = data as AchievementStoreV1;
    return {
      ...d,
      schemaVersion: 2,
      dailyProgress: pruneOldDailyProgress(d.dailyProgress ?? {}),
    };
  },
};

function loadAndMigrate(): AchievementStore {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialStore();
  
  let data = JSON.parse(raw);
  let version = data.schemaVersion ?? 1;
  
  while (version < CURRENT_VERSION) {
    data = migrations[version](data);
    version++;
  }
  
  return data as AchievementStore;
}
```

**重要**: マイグレーション関数はv1→v2のみ書けば良い。v1からv3への更新も自動でv1→v2→v3と辿る。

### 1-3. 容量管理

LocalStorageの上限は通常5MB（ブラウザによって異なる）。上限到達時は `QuotaExceededError` が発生する。

```typescript
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // dailyProgressを60日分に削減してリトライ
      console.warn('localStorage quota exceeded, pruning data');
      // 緊急プルーニング処理
    }
    return false;
  }
}
```

実質的には dailyProgressを90日上限に絞れば容量問題は発生しない（上記計算より5MB以内に収まる）。

---

## 2. ストリーク機能の実装パターン

### 2-1. タイムゾーンの注意点（最重要）

**Wordleが踏んだ失敗**: Wordleはタイムゾーン変更でストリークが壊れる問題を持つ（デバイス時刻ベースのため、海外旅行中に壊れると報告あり）。

yolos.netのターゲットは日本ユーザーのみで、タイムゾーン変更リスクは低い。ただし以下を遵守する：

**推奨: ローカル日付（YYYY-MM-DD）で管理する**

```typescript
// ユーザーのローカルタイムゾーンで「今日の日付」を取得
function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**注意事項**: `new Date().toISOString()` は UTC 日付を返すため、日本時間では23時以降に日付がずれる。`toLocaleDateString()` はブラウザのロケール設定に依存するため使用しない。年月日を個別に取得してゼロ埋めする上記パターンが最も確実。

**既存コード確認**: site-concept.mdでは `lastPlayDate: "2026-03-05"` の形式を使っており、この形式が正しい。コードでこの形式を一貫して使う。

MEMORY.mdによると「UTCの日付取得をtoolsライブラリにスコープ化済み（df8c72dコミット）」という記録がある。このヘルパーが実在する場合は活用すること。

### 2-2. ストリーク計算ロジック

```typescript
function calculateStreak(store: AchievementStore): { current: number; longest: number } {
  const today = getTodayLocalDate();
  const yesterday = getDateOffset(-1); // 今日の前日
  
  const playedToday = Object.values(store.dailyProgress[today] ?? {}).some(Boolean);
  const playedYesterday = Object.values(store.dailyProgress[yesterday] ?? {}).some(Boolean);
  
  const lastPlay = store.streak.lastPlayDate;
  
  if (lastPlay === today) {
    // 今日すでに記録済み、現在のstreakをそのまま使用
    return { current: store.streak.current, longest: store.streak.longest };
  }
  
  if (lastPlay === yesterday || playedToday) {
    // 連続している
    const newCurrent = store.streak.current + (playedToday && lastPlay !== today ? 1 : 0);
    return { current: newCurrent, longest: Math.max(newCurrent, store.streak.longest) };
  }
  
  // ギャップあり → ストリークリセット
  return { current: playedToday ? 1 : 0, longest: store.streak.longest };
}
```

### 2-3. Duolingoの教訓と適用

| Duolingoの施策 | yolos.netへの適用可否 | 備考 |
|---|---|---|
| ストリークカウンターの目立つ表示 | 適用する | トップページ + 実績ダッシュボード |
| プッシュ通知 | 不可（技術制約外） | LocalStorage内のデータのみ |
| ストリークフリーズ | Phase 3以降で検討 | 「1日の猶予」をGraceとして設計可能 |
| iOS ウィジェット | 不可 | ブラウザのみ |
| Loss aversion（失いたくない心理）| 設計に組み込む | 「ストリーク危機」UI（翌日切れ警告）|

---

## 3. バッジ・アチーブメント通知のUIパターン

### 3-1. トースト vs モーダル vs インライン表示の比較

| 方式 | ゲーム・達成感 | 邪魔度 | 実装コスト | 推奨度 |
|---|---|---|---|---|
| トースト通知（自動消去） | 中（軽い） | 低 | 低 | 推奨（基本） |
| モーダル | 高（インパクト大） | 高 | 中 | 特別な達成のみ |
| インライン（バッジ一覧ページ） | 低（後から気づく） | 無 | 低 | 補完的 |

**推奨: ハイブリッドアプローチ**
- 通常バッジ解除: トースト通知（3-5秒、右上または下部）
- 重要な達成（初回バッジ、30日ストリーク等）: モーダル（1度のみ、閉じるまで表示）
- バッジ一覧ページ: 全バッジの閲覧・新着確認（通知を見逃した場合のフォールバック）

NYT Gamesも同様のアプローチを採用: バッジは「notification popups appear during real-time accomplishments」でトースト的に通知し、trophy caseで一覧確認できる。

### 3-2. アニメーション・演出のベストプラクティス

**トースト通知の推奨仕様:**
- 位置: 右上または下部（モバイル優先サイトなので下部右がベター）
- 表示時間: 4-6秒（バッジ名+達成条件を読む時間が必要）
- アニメーション: スライドイン（下から上、またはサイドから）→ 静止 → フェードアウト
- `prefers-reduced-motion` に対応（モーションを無効化するメディアクエリ）

```css
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .achievement-toast {
    animation: none;
    opacity: 1;
  }
}
```

**特別達成時のモーダル演出:**
- バッジアイコンのpulseアニメーション（拍動）
- ゴールドバッジにはconfetti風の粒子エフェクト（CSSキーフレームで実装可能）
- 効果音は使わない（モバイルでの予期せぬ音再生はUX低下）

**実装上の注意:**
- Framer Motionは高機能だが、バンドルサイズが増加する（coding-rules.md「バンドルサイズが大きくなる機能はサーバーで」の精神に抵触）。純粋CSS + React状態管理で十分。
- 複数バッジを同時に解除した場合はキューイング（次のバッジは前のトーストが消えてから表示）

---

## 4. React/Next.jsでのLocalStorage管理パターン

### 4-1. SSR/SSGとの共存（Hydration Mismatch回避）

Next.js App Routerでは、コンポーネントはデフォルトでサーバー側でレンダリングされる。LocalStorageはブラウザAPIなのでサーバー側では使えない。

**推奨パターン: `use client` + `useEffect` 初期化**

```typescript
"use client";

function useAchievementStore() {
  // サーバー側ではnullで初期化（hydration mismatch回避）
  const [store, setStore] = useState<AchievementStore | null>(null);
  
  useEffect(() => {
    // クライアント側でのみ実行される
    const loaded = loadAndMigrate();
    setStore(loaded);
  }, []);
  
  // storeがnullの間はローディング状態
  return store;
}
```

**代替パターン: `initializeWithValue: false`**

usehooks-tsの `useLocalStorage` フックはSSR対応済みで `initializeWithValue` オプションでhydrationを制御できる。このライブラリの利用も検討価値あり。

**避けるべきパターン:**
```typescript
// NG: SSRでReferenceError: localStorage is not defined
const [store] = useState(() => JSON.parse(localStorage.getItem('key') ?? '{}'));
```

### 4-2. カスタムフックの設計

```typescript
// src/lib/achievements/useAchievements.ts

"use client";

export function useAchievements() {
  const [store, setStore] = useState<AchievementStore | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  
  // 初期化（クライアントのみ）
  useEffect(() => {
    setStore(loadAndMigrate());
  }, []);
  
  // ストア変更時にLocalStorageへ保存
  useEffect(() => {
    if (store !== null) {
      safeSetItem(STORAGE_KEY, JSON.stringify(store));
    }
  }, [store]);
  
  // コンテンツ利用を記録
  const recordPlay = useCallback((contentId: string) => {
    setStore(prev => {
      if (!prev) return prev;
      const today = getTodayLocalDate();
      const updatedStore = updateDailyProgress(prev, contentId, today);
      const unlocked = checkNewAchievements(prev, updatedStore);
      if (unlocked.length > 0) setNewlyUnlocked(unlocked);
      return updatedStore;
    });
  }, []);
  
  return { store, recordPlay, newlyUnlocked };
}
```

### 4-3. Context APIの活用方法

実績データはサイト横断で参照されるため、Context APIで提供するのが適切。

```typescript
// src/lib/achievements/AchievementContext.tsx

"use client";

const AchievementContext = createContext<AchievementContextValue | null>(null);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const achievements = useAchievements(); // 上記カスタムフック
  return (
    <AchievementContext.Provider value={achievements}>
      {children}
      <AchievementToast notifications={achievements.newlyUnlocked} />
    </AchievementContext.Provider>
  );
}

export function useAchievementContext() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievementContext must be inside AchievementProvider');
  return ctx;
}
```

**重要**: `AchievementProvider` は `layout.tsx` に配置する（サイト全体で共有）。ただし `"use client"` を要求するため、サーバーコンポーネントのロジックは別途維持する。

**useReducerとの組み合わせ**: 実績ストアの更新ロジックが複雑になったらuseReducerを採用する。`useReducer + useEffect(保存)` パターンは多くのプロジェクトで実績あり（`use-persisted-reducer` ライブラリ等）。

---

## 5. 既存サイトの実績システム調査

### 5-1. Wordle（NYT）

**LocalStorageキー構造:**
- `nyt-wordle-statistics`: { currentStreak, maxStreak, gamesPlayed, gamesWon, guesses分布 }
- `nyt-wordle-state`: { lastPlayedTs, boardState }

**設計の特徴:**
- ストリークと統計を分離したキーで管理（今回の設計では単一キー + 分離フィールドで十分）
- `lastPlayedTs` でストリーク継続判定（日付比較）
- アカウント不要、LocalStorageのみで数千万ユーザーが利用→ yolos.netの規模では十分

**UIの特徴:**
- 結果共有はクリップボードコピー（今回の設計と一致）
- ストリーク表示は診断完了後のポップアップとナビゲーションバー

### 5-2. NYT Games（バッジシステム）

**バッジの設計原則（観察）:**
- 段階型（Progressive Badges）: 5回、10回、15回... と段階的に閾値が上がる
- 反復可能なバッジ（Repeatable）: 達成回数カウンターを表示
- 一時性バッジ（時限・季節バッジ）: 特定期間のみ獲得可能
- 遡及付与（Retroactive）: バッジ追加前の実績も遡及して付与

**yolos.netへの適用可能な示唆:**
- site-concept.mdの14バッジ設計は妥当。「全コンテンツ10回ずつ利用（ゴールド）」は遡及判定が必要
- 将来の季節バッジ（正月、花見、ハロウィン等）は日本文化と親和性が高い

### 5-3. Duolingo

**ストリーク設計の核心:**
- 7日ストリークユーザーの長期エンゲージメントが3.6倍（site-concept.mdに記載あり）
- 10億ユーザー以上に検証されたデータ
- 「ストリークフリーズ」（1日休んでもストリーク維持）により離脱を防いだ→ churn 21%削減
- 2024年末時点で1年以上のストリークを持つユーザーが1000万人

**yolos.netへのフリーズ機能の適用:**
- Phase 3での検討事項（site-concept.mdと一致）
- 実装方法: `streak.freezeUsedDate` フィールドを追加し、前日のギャップをフリーズで埋める判定
- ただし「フリーズを購入する」仕組みは技術制約上不可→ 「月1回まで自動適用」のような非課金モデルで設計する

---

## 6. 実装推奨事項（まとめ）

### 優先度A（ストリーク記録・表示）

1. スキーマバージョン管理付きのLocalStorageデータ構造を設計する
2. ローカル日付（YYYY-MM-DD）でのストリーク計算を実装する
3. `"use client"` + `useEffect` でSSR hydration mismatchを回避する
4. `AchievementProvider` をlayout.tsxに配置してサイト全体で共有する

### 優先度B（バッジ通知UI）

5. トースト通知コンポーネントを実装する（右下固定、4-6秒自動消去）
6. `prefers-reduced-motion` 対応のスライドインアニメーションを実装する
7. バッジ解除キューを管理し、複数解除時に順番に表示する

### 優先度C（将来対応）

8. dailyProgressの90日プルーニングを実装する（100KB以内に制御）
9. マイグレーション機能（schemaVersion管理）を初期から組み込む
10. ストリークフリーズ機能（Phase 3: 月1回の自動猶予）

### 重要な技術上の注意事項

- **`new Date().toISOString()` は使わない**: UTC日付になり日本時間では23時以降にずれる
- **`typeof window === 'undefined'` チェック**: SSR環境ではwindowが存在しないため必須
- **LocalStorage操作は全てtry-catchで囲む**: QuotaExceededError, SecurityError等に対処
- **Framer Motionは不採用**: バンドルサイズ増加のため純粋CSSアニメーションを使う
- **既存のUTCヘルパー（df8c72dコミット）の活用**: toolsライブラリにスコープ化済みの日付ヘルパーを確認して再利用する

---

## 参考文献

- Duolingo Gamification: https://www.orizon.co/blog/duolingos-gamification-secrets
- Duolingo Streak System: https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f
- NYT Games Badges: https://thenewyorktimeshelpcenter.helpjuice.com/games-badges
- useLocalStorage Hook: https://usehooks-ts.com/react-hook/use-local-storage
- Toast Notification UX: https://blog.logrocket.com/ux-design/toast-notifications/
- Next.js Hydration Mismatch: https://nextjs.org/docs/messages/react-hydration-error
- LocalStorage Migration: https://github.com/ragnarstolsmark/localstorage-migrator
- JavaScript Dates/Timezone: https://www.ursahealth.com/new-insights/dates-and-timezones-in-javascript
- LocalStorage Quota Management: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- React useReducer Persistence: https://www.benmvp.com/blog/sync-localstorage-react-usereducer-hook/

