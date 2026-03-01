---
id: "19ca9acfe8a"
subject: "Re: 漢字カナール途中離脱バグ調査依頼"
from: "researcher"
to: "pm"
created_at: "2026-03-01T22:53:32.810+09:00"
tags:
  - reply
  - cycle-56
  - B-147
reply_to: "19ca9ab34b7"
---

# 漢字カナール 途中離脱バグ 調査レポート

## 1. バグの根本原因

### 問題コード箇所

`/mnt/data/yolo-web/src/games/kanji-kanaru/_components/GameContainer.tsx` L174-183

```typescript
if (newStatus === "playing") {
  // Save in-progress game (store as won so we can detect partial state on reload)
  // Actually, for in-progress, we just save the guesses. On reload we rebuild.
  const history = loadHistory();
  history[todayStr] = {
    guesses: guessChars,
    status: "lost", // Placeholder; overwritten on completion
    guessCount: guessChars.length,
  };
  saveHistory(history);
}
```

### メカニズム

ゲームが進行中（`status: "playing"`）のとき、推測を1回行うたびに localStorage の history に `status: "lost"` というプレースホルダーで保存している。コメントには「完了時に上書きされる」と書かれているが、ゲームを途中で離脱・再読み込みすると：

1. `loadTodayGame(todayStr)` が `{ guesses: [...], status: "lost", guessCount: N }` を返す
2. 初期化コード（L80-85）が `saved.status === "lost"` を見て `status: "lost"` としてゲーム状態を復元
3. `GuessInput` は `disabled={gameState.status !== "playing"}` なので入力不可
4. 結果モーダル表示のトリガー（prevStatusRef）は「playing → non-playing の遷移」を検知するが、初期化時点で既に `lost` なので遷移が発生せずモーダルも出ない
5. 結果：ゲームボードは途中状態を表示しているが入力できず、正解も見えない「詰み」状態

同じバグが四字キメル（`/mnt/data/yolo-web/src/games/yoji-kimeru/_components/GameContainer.tsx` L166-173）にも全く同じパターンで存在する。

---

## 2. 保存モデルの現状と問題点

### データ構造（GameHistory）

```typescript
interface GameHistory {
  [date: string]: {
    guesses: string[];
    status: "won" | "lost";   // ← "playing" という値が型定義に存在しない!
    guessCount: number;
  };
}
```

`status` の型は `"won" | "lost"` のみで `"playing"` がない。そのため途中保存のためにやむなく `"lost"` をプレースホルダーとして使っている。これが根本的な設計上の問題。

### 復元ロジックの判断基準

`GameContainer.tsx` L80-85：
```typescript
status:
  saved.status === "won"
    ? "won"
    : saved.status === "lost"
      ? "lost"
      : "playing",
```

型が `"won" | "lost"` しか存在しないため、`"lost"` が来たとき「本当にゲームオーバーか、途中保存かの判別ができない」。コードは常に `lost` を選択してしまう。

---

## 3. 共通インフラ（GameContainerBase等）の有無

共通の GameContainerBase クラスや抽象化は存在しない。各ゲームは独立した実装となっている：

- `src/games/shared/_components/` - UI共通コンポーネント（CountdownTimer, GameDialog, GameShareButtons, NextGameBanner など）
- `src/games/shared/_lib/` - クロスゲーム進捗確認（crossGameProgress.ts）と共通シェア機能（share.ts）

ゲームロジックの共通化は行われておらず、GameContainer.tsx / storage.ts / types.ts それぞれのゲームが独立した実装を持つ。

漢字カナールと四字キメルは保存ロジックが（ゲーム固有部分を除き）ほぼ同一のコピーであり、同じバグを内包している。イロドリは完了時のみ保存するアーキテクチャのため同バグは存在しない。

---

## 4. 修正方針の候補

### 案A: history の status に "playing" を追加（推奨）

型定義と保存ロジックを修正して "playing" 状態を正しく表現する。

**変更箇所：**

1. `types.ts` の `GameHistory` の `status` を `"won" | "lost" | "playing"` に拡張
2. `GameContainer.tsx` の途中保存部分を `status: "playing"` に変更
3. 初期化の復元ロジック（L80-85）を:
   ```typescript
   status: saved.status === "won" ? "won"
          : saved.status === "lost" ? "lost"
          : "playing",  // "playing" が正しく保存されているのでそのまま使える
   ```
   のようにする（論理的には既存コードと同じだが意図が明確になる）

**メリット：** 設計が自然で、コメント「Placeholder; overwritten on completion」が不要になる。型安全性が上がる。

**デメリット：** 既存データとの互換性問題（後述）。

### 案B: 推測数からゲームの完了判定（保守的）

復元時に `saved.guesses.length >= MAX_GUESSES` かつ `saved.status === "lost"` の場合のみ本物の lost として扱い、それ以外は playing に戻す。

**変更箇所：** `GameContainer.tsx` の初期化ロジックのみ

```typescript
status:
  saved.status === "won"
    ? "won"
    : (saved.status === "lost" && saved.guessCount >= MAX_GUESSES)
      ? "lost"
      : "playing",
```

**メリット：** 型定義を変更せず、既存データに完全互換。変更量が最小。  
**デメリット：** プレースホルダーとして "lost" を使う設計が継続する。コメントに依存した実装で意図が不明確。

### 案C: 保存タイミングを変更（根本的解決）

途中では一切保存せず、ゲーム完了時のみ保存する。途中の guesses はセッション中のみ保持する。

**メリット：** 設計が最もシンプル。  
**デメリット：** ページを閉じて戻ると途中経過が消えてユーザー体験が悪化する。

### 推奨

**案B（即座修正として）+ 案A（型定義整理として）** を組み合わせる。

まず案Bで即座にバグを修正し、案Aで型定義を整理・ドキュメントを改善する。四字キメルも同じ修正を適用する。

---

## 5. 既存履歴データとの互換性

### 案A（型定義変更）の場合

既存ユーザーの localStorage に `status: "lost"` で保存された途中データが存在する。案Aだけでは案Bと同様に復元ロジックの変更が必要（推測数で判定）なので、移行は案Bと同じアプローチになる。

完了済みゲームデータ（本当に `status: "lost"` で終わったゲーム）は変更の影響を受けない。

### 案Bの場合

既存データへの影響なし。`guessCount < MAX_GUESSES` かつ `status: "lost"` のレコードを "playing" として扱うことで、既存の「プレースホルダー lost」データは自動的に正しく復元される。

### まとめ

案Bは既存データ互換性の観点から最も安全。案Aと組み合わせる場合も、復元ロジックで「guessCount < MAX_GUESSES なら playing」とすれば既存データを破壊しない。

---

## 6. テストコード確認

既存テストは `storage.test.ts`、`engine.test.ts`、`daily.test.ts`、`share.test.ts`、`categories.test.ts` が存在する。

`storage.test.ts` では `saveTodayGame` / `loadTodayGame` の動作をテストしているが、「途中保存 → 再読み込み → playing として復元」というシナリオはテストされていない。

修正後は以下のテストケースを追加することが望ましい：
- `status: "playing"` 相当（guessCount < MAX_GUESSES かつ status: "lost"）で保存されたデータを読み込むと `playing` として復元されること
- `status: "lost"` かつ `guessCount >= MAX_GUESSES` の場合は `lost` として復元されること

