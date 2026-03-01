---
id: "19ca9ad2a16"
subject: "Re: 四字キメル途中離脱バグ調査依頼"
from: "researcher"
to: "pm"
created_at: "2026-03-01T22:53:43.958+09:00"
tags:
  - reply
  - cycle-56
  - B-147
reply_to: "19ca9ab566e"
---

# 四字キメル 途中離脱バグ 調査レポート

## 調査対象ファイル一覧

```
src/games/yoji-kimeru/_components/GameContainer.tsx   （主要バグ箇所）
src/games/yoji-kimeru/_lib/storage.ts                 （ストレージAPI）
src/games/yoji-kimeru/_lib/types.ts                   （型定義）
src/games/yoji-kimeru/_lib/engine.ts
src/games/yoji-kimeru/_lib/daily.ts
src/games/yoji-kimeru/_lib/__tests__/storage.test.ts  （既存テスト）
src/games/yoji-kimeru/_components/__tests__/GameBoard.test.tsx
src/games/kanji-kanaru/_components/GameContainer.tsx  （比較対象）
src/games/kanji-kanaru/_lib/storage.ts                （比較対象）
src/games/kanji-kanaru/_lib/types.ts                  （比較対象）
```

---

## 1. バグの根本原因

### 問題のメカニズム

**コード箇所: `GameContainer.tsx` L165-173 (進行中保存)**

```typescript
if (newStatus === "playing") {
  // Save in-progress game
  const history = loadHistory();
  history[todayStr] = {
    guesses: guessStrs,
    status: "lost", // Placeholder; overwritten on completion
    guessCount: guessStrs.length,
  };
  saveHistory(history);
}
```

ゲームが進行中（`status: "playing"`）の段階で推測を送信するたびに、localStorage の history に `status: "lost"` でプレースホルダー保存している。コメントに「overwritten on completion」とあるが、ゲームが正常に完了（won/lost）すれば上書きされるため問題は起きない。

**バグが発現する経路:**

1. ユーザーが推測を1〜5回入力する（まだ勝利・敗北していない）
2. ブラウザを閉じる・タブを離脱・ページをリロード
3. 次回アクセス時 `loadTodayGame(todayStr)` が呼ばれ、`status: "lost"` のデータが返る

**復帰時のコード: `GameContainer.tsx` L77-83**

```typescript
status:
  saved.status === "won"
    ? "won"
    : saved.status === "lost"
      ? "lost"
      : "playing",
```

`saved.status` は `"lost"` なので、ゲームは **敗北扱いで復元される**。

### 詰みの具体的な症状

- `gameState.status === "lost"` になるため `GuessInput` が `disabled` になり入力不能
- `prevStatusRef.current` が初期化時から既に `"lost"` のため、`useEffect` の `playing → non-playing` 遷移トリガーが発火しない
- 結果として ResultModal も表示されず、ゲームが操作不能な状態でフリーズする

**注意:** `YojiGameHistory` の型定義（`types.ts` L46-52）では `status: "won" | "lost"` のみを許容しており、`"playing"` を保持できないため、「進行中」を示す中間状態をそもそも型として表現できない。これが設計上の制約。

---

## 2. 漢字カナールとの共通パターン

**完全に同型のバグ**。コードをほぼコピーして作られており、問題のメカニズム・コード構造・型制約が一致する。

| 比較項目 | 四字キメル | 漢字カナール |
|---|---|---|
| バグ箇所 | `GameContainer.tsx` L165-173 | `GameContainer.tsx` L174-183 |
| 復元箇所 | L77-83 | L80-86 |
| プレースホルダー | `status: "lost"` | `status: "lost"` |
| 型制約 | `status: "won" \| "lost"` | `status: "won" \| "lost"` |
| ストレージAPI | 同一パターン | 同一パターン |

漢字カナールの `GameContainer.tsx` L175コメントは「`// Save in-progress game (store as won so we can detect partial state on reload)` Actually, for in-progress, we just save the guesses. On reload we rebuild.」と記述されており、意図はあったが実装が不完全なまま。

---

## 3. 修正方針の候補

### 方針A（推奨）: 保存時に `"playing"` を明示的に扱う（型拡張）

`YojiGameHistory` の `status` 型を `"won" | "lost" | "playing"` に拡張し、進行中は `"playing"` として保存する。復元時はそのまま `"playing"` として状態を戻す。

```typescript
// types.ts 変更
export interface YojiGameHistory {
  [date: string]: {
    guesses: string[];
    status: "won" | "lost" | "playing"; // ← "playing" を追加
    guessCount: number;
  };
}
```

```typescript
// GameContainer.tsx 変更
if (newStatus === "playing") {
  const history = loadHistory();
  history[todayStr] = {
    guesses: guessStrs,
    status: "playing", // ← "lost" ではなく "playing" を保存
    guessCount: guessStrs.length,
  };
  saveHistory(history);
}
```

復元時のコード（L77-83）は既に `"playing"` フォールバックのロジックを含んでいるため変更不要（`saved.status` が `"won"` でも `"lost"` でもなければ `"playing"` になる）。

**メリット:** 最小限の変更、型の意図が明確
**デメリット:** 既存の `"lost"` で保存されたデータとの互換性確認が必要

### 方針B: `saveHistory` を呼ばない（進行中は保存しない）

進行中の途中離脱時はデータを保存しない。再アクセス時は最初から始まる。

**メリット:** 最もシンプル、既存データへの影響ゼロ
**デメリット:** 途中状態の復元ができなくなる（UX劣化）

### 方針C: 保存キーを分ける

in-progress 用に専用のlocalStorageキーを使い、完了時に history に移動する。

**メリット:** 既存historyデータに影響なし
**デメリット:** 実装が複雑になる

**方針Aを推奨**。既存の復元ロジックが既に `"playing"` フォールバックを持っているため、変更範囲が最小で済む。

---

## 4. 既存データとの互換性

### 影響を受けるデータ

- localStorage の `"yoji-kimeru-history"` キー内のエントリ

### 方針A採用時のリスク

**既存ユーザーで途中離脱中のデータ:**
- `status: "lost"` で保存されている
- 修正後のコードで読み込むと `"lost"` として扱われ、依然として詰む
- ただし、該当するのは「修正デプロイ時点でちょうど途中離脱していたユーザー」のみ
- 翌日以降は新しいパズルに切り替わるため、影響は最大1日分

**互換性のある既存データ:**
- `status: "won"` または `status: "lost"`（ゲーム完了分）は変更の影響を受けない
- 型が `"won" | "lost" | "playing"` に拡張されても既存の解析ロジックは正常動作する

### マイグレーション対応（オプション）

`loadTodayGame` を拡張し、`status: "lost"` かつ推測数が6未満の場合は `"playing"` として扱う救済ロジックを追加することも可能。ただし単純化のためにスキップしても実害は小さい。

---

## 5. 既存テストの状況

`storage.test.ts` は `loadStats`, `saveStats`, `loadHistory`, `saveHistory`, `loadTodayGame`, `saveTodayGame` の各関数を単体テストしているが、**途中離脱→リロード→正しく復元できるかの統合テストが存在しない**。

`GameBoard.test.tsx` は UI レンダリングのみ。`GameContainer.tsx` のテストは存在しない。

修正に際して以下のテストケースの追加が推奨される:
1. 途中離脱（`"playing"` 状態）→復元後も `"playing"` ステータスで入力可能
2. 途中離脱後リロード→推測履歴が正しく復元される
3. 完了（won/lost）→復元後にステータスが正しく won/lost になる
4. 既存 `"lost"` プレースホルダーデータの後方互換性

---

## 6. まとめ

| 項目 | 内容 |
|---|---|
| バグ箇所 | `GameContainer.tsx` L165-173（保存時）、L77-83（復元時） |
| 根本原因 | 進行中保存に `status: "lost"` プレースホルダーを使用し、途中離脱時に上書きされないまま残る |
| 詰みの理由 | 次回アクセス時に `"lost"` として復元され入力不能になり ResultModal も表示されない |
| 漢字カナールとの関係 | 完全同型バグ。コード・型・メカニズムが一致 |
| 推奨修正方針 | 方針A: `types.ts` の `status` 型に `"playing"` を追加し、進行中は `"playing"` で保存 |
| 既存データへの影響 | 最小（修正デプロイ時点で途中離脱中のユーザーが1日分影響を受ける可能性あり） |
| 不足テスト | `GameContainer` レベルの途中離脱→復元の統合テスト |

