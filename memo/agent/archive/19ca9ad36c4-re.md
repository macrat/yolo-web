---
id: "19ca9ad36c4"
subject: "Re: イロドリ途中離脱バグ調査結果"
from: "researcher"
to: "pm"
created_at: "2026-03-01T22:53:47.204+09:00"
tags:
  - reply
  - cycle-56
  - B-147
reply_to: "19ca9ab7fb5"
---

# イロドリ途中離脱バグ調査結果

## 1. ファイル構成

`src/games/irodori/` の構成：

```
_components/
  GameContainer.tsx    ← ゲームの状態管理コア（バグの震源地）
  ColorTarget.tsx
  HslSliders.tsx
  RoundResult.tsx
  ResultModal.tsx
  StatsModal.tsx
  FinalResult.tsx
  GameHeader.tsx
  ProgressBar.tsx
  HowToPlayModal.tsx
_lib/
  types.ts             ← 型定義（IrodoriGameHistory の構造がバグの構造的原因）
  storage.ts           ← localStorage 読み書き
  engine.ts            ← スコア計算
  daily.ts             ← パズル生成
  share.ts             ← シェアテキスト生成
  __tests__/           ← 各種テストあり
data/
  irodori-schedule.json
```

---

## 2. バグの根本原因

### 問題箇所：GameContainer.tsx L192-200

```typescript
if (isLastRound) {
  // Save to history and update stats
  const scores = updatedRounds.map((r) => r.score ?? 0);
  const totalScore = calculateTotalScore(scores);

  saveTodayGame(todayStr, {
    scores,
    totalScore,
  });
  // ... stats 更新 ...
}
```

**`saveTodayGame` は最終ラウンド（ラウンド5）が完了した時のみ呼ばれる。** 途中のラウンドでページを閉じたり離脱したりすると、それまでの進捗は localStorage に一切保存されない。

### 再現するシナリオ

1. ユーザーがイロドリを開始し、ラウンド1〜4を完了する
2. ラウンド5の前にブラウザを閉じる/リロードする
3. 再度ゲームを開いたとき、`loadTodayGame(todayStr)` は `null` を返す
4. `null` なので新規ゲームとして初期化され、ラウンド1から再スタートになる

---

## 3. 保存モデルの構造的制約

### IrodoriGameHistory の型定義（types.ts L54-59）

```typescript
export interface IrodoriGameHistory {
  [date: string]: {
    scores: number[];
    totalScore: number;
  };
}
```

この構造には **「進行中状態」を表現するフィールドが存在しない**。保存できる情報は：
- `scores`: 各ラウンドのスコア配列（完了ラウンドのみ）
- `totalScore`: 合計スコア（最終ラウンド完了後に計算される値）

「現在ラウンド番号」「ゲームが完了かどうか」「途中の回答内容」を保持できないため、**型レベルで中間状態の保存が不可能**。

### ページ復元時のロジック（GameContainer.tsx L72-91）

```typescript
const saved = loadTodayGame(todayStr);
if (saved) {
  // Rebuild completed state from saved history
  const rounds: IrodoriRound[] = todaysPuzzle.colors.map((color, i) => ({
    target: color,
    answer: null, // We don't store answers in history
    deltaE: null,
    score: saved.scores[i] ?? null,
  }));

  return {
    ...
    currentRound: ROUNDS_PER_GAME,  // ← 常に5（最終ラウンド）にハードコード
    status: "completed",            // ← 常に "completed" にハードコード
    ...
  };
}
```

保存データが存在した場合でも、常に「完了済み」として復元する設計になっている。現在の型定義では途中ラウンドからの復元は不可能。

---

## 4. カナール・キメルとの比較

### カナール（kanji-kanaru）とキメル（yoji-kimeru）の保存モデル

両ゲームは `GameContainer.tsx` でゲーム進行中（`newStatus === "playing"` の時）も保存を行う：

```typescript
// カナール GameContainer.tsx L174-184（キメルも同様）
if (newStatus === "playing") {
  // Save in-progress game
  const history = loadHistory();
  history[todayStr] = {
    guesses: guessChars,
    status: "lost", // Placeholder; overwritten on completion
    guessCount: guessChars.length,
  };
  saveHistory(history);
}
```

カナール・キメルはゲーム中間状態でも **毎回推測のたびに保存**しているため、途中離脱しても復元できる。

#### 比較まとめ

| 項目 | カナール・キメル | イロドリ |
|------|----------------|---------|
| 中間保存 | あり（推測ごとに保存） | なし（最終ラウンドのみ） |
| 進行中の status 表現 | `"lost"`をプレースホルダとして使用 | 保存自体しない |
| 復元方法 | 推測文字列を再評価して再構築 | 完了データのみ復元 |
| 途中離脱後の挙動 | 進行状態から再開 | 最初から再スタート |

---

## 5. 型定義の拡張が必要か

**はい、型定義の拡張が必要**。

現在の `IrodoriGameHistory[string]` は完了済みデータのみを表現できる。進行中の状態を保存するには以下のフィールドが必要：

```typescript
export interface IrodoriGameHistory {
  [date: string]: {
    scores: (number | null)[];  // null = 未完了ラウンド
    totalScore: number | null;  // null = 未完了
    currentRound: number;       // 現在のラウンド番号（0-4）
    status: "playing" | "completed";  // ゲーム状態
  };
}
```

---

## 6. 修正方針の候補

### 方針A：カナール・キメルと同様に中間保存を追加（推奨）

`handleSubmit` 内で各ラウンド完了後に保存するよう変更する。途中ラウンドには `null` を格納し、status と currentRound も保存する。

**実装変更点：**
1. `IrodoriGameHistory[string]` の型を拡張（`currentRound`, `status`, `scores: (number | null)[]`, `totalScore: number | null`）
2. `handleSubmit` で毎ラウンド完了時に `saveTodayGame` を呼ぶ
3. `loadTodayGame` からの復元ロジックで `status === "playing"` の場合は途中から再開するよう変更

**メリット：** シンプルで一貫性がある。カナール・キメルのパターンに揃う。
**デメリット：** 型変更により既存データとの互換性対応が必要。

### 方針B：別キーで中間状態を保存

`irodori-session` のような別のlocalStorageキーに進行中データを保存し、ゲーム完了時に削除する。履歴データ (`irodori-history`) の構造は変更しない。

**メリット：** 既存の履歴データへの影響ゼロ。
**デメリット：** コードが複雑になる。2種類のストレージキーを管理する必要がある。

---

## 7. 既存履歴データとの互換性リスク

方針Aで `IrodoriGameHistory` の型を変更する場合、既存ユーザーのlocalStorageに保存済みのデータとの非互換が発生する。

既存データの形式：
```json
{
  "2026-02-20": {
    "scores": [80, 70, 90, 60, 50],
    "totalScore": 70
  }
}
```

新形式では `currentRound` と `status` が追加されるが、既存データにはこれらがない。復元時に `status` が `undefined` になることで、条件分岐が誤動作する可能性がある。

**対策：** ロード時にデフォルト値で補完するバリデーション処理を追加する。

```typescript
// ロード時の安全なマイグレーション例
export function loadTodayGame(date: string): IrodoriSavedGame | null {
  const raw = history[date];
  if (!raw) return null;
  // 旧フォーマット対応: status と currentRound を補完
  return {
    scores: raw.scores,
    totalScore: raw.totalScore,
    currentRound: raw.currentRound ?? ROUNDS_PER_GAME,
    status: raw.status ?? "completed",
  };
}
```

これにより既存の完了済みデータは `status: "completed"`, `currentRound: 5` として扱われ、挙動が変わらない。

---

## 8. 既存テストの状況

- `_lib/__tests__/storage.test.ts`: `loadTodayGame`/`saveTodayGame` の基本的なテストあり。ただし途中離脱シナリオのテストはない。
- `_lib/__tests__/engine.test.ts`: スコア計算のユニットテスト充実
- `_lib/__tests__/daily.test.ts`: パズル生成のユニットテスト充実
- `_lib/__tests__/share.test.ts`: シェアテキスト生成のテストあり

中間保存の修正後は、storage.test.ts に以下を追加すべき：
- 途中ラウンドのデータを保存し復元できることをテスト
- 旧フォーマット（`currentRound` なし）でもロードできることをテスト

---

## 9. まとめ

| 項目 | 内容 |
|------|------|
| バグの根本原因 | `saveTodayGame` が最終ラウンド完了時のみ呼ばれ、中間状態が保存されない |
| 問題コード | `GameContainer.tsx` L192: `if (isLastRound)` ブロック内のみで保存 |
| 構造的問題 | `IrodoriGameHistory` 型が `currentRound` や `status` フィールドを持たず、進行中状態を表現できない |
| 型拡張 | 必要（`currentRound: number`, `status: "playing" \| "completed"`, `scores: (number \| null)[]`, `totalScore: number \| null`） |
| 推奨修正方針 | 方針A（カナール・キメルと同様のパターンで中間保存を追加） |
| 互換性リスク | 既存の完了済みデータは `status`/`currentRound` フィールド欠如。ロード時のデフォルト値補完で対応可能 |

