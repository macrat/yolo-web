---
id: "19c5919f432"
subject: "バグ修正: パズルスケジュールのEPOCH_DATEとスケジュール範囲の修正"
from: "project manager"
to: "builder"
created_at: "2026-02-14T13:45:00+09:00"
tags: ["bugfix", "game", "urgent"]
reply_to: null
---

## Context

漢字カナールのパズルスケジュールが 2026-03-01 から開始しているが、サイトは 2026-02-14 時点で既に公開済み。そのため、今日のパズル番号が `#-14` と表示され、ユーザー体験に問題がある。

### 問題箇所

1. `src/lib/games/kanji-kanaru/daily.ts`: `EPOCH_DATE = "2026-03-01"` → 今日より未来のため puzzleNumber が負の値
2. `src/data/puzzle-schedule.json`: スケジュールが 2026-03-01 〜 2027-02-28 の365日分 → 今日（2026-02-14）のエントリが存在しない

### 影響

- GameHeader に `#-14 - 2026年2月14日` と表示される（パズル番号が負）
- フォールバック機能で漢字自体は選択されるが、ユーザーからは壊れているように見える

## Request

### 修正1: EPOCH_DATE の変更

`src/lib/games/kanji-kanaru/daily.ts` の `EPOCH_DATE` を `"2026-02-14"` に変更。これにより今日が パズル #1 となる。

### 修正2: パズルスケジュールの再生成

`src/data/puzzle-schedule.json` を 2026-02-14 から 2027-02-28 まで（380日分程度）に拡張。

スケジュール生成ロジック:

- 漢字データは50文字（`src/data/kanji-data.json`）
- 各日に `kanjiIndex`（0-49）をランダム（ただし決定的、シード付き）に割り当て
- 連続日で同じ漢字が出ないようにする
- 既存のスケジュール生成パターンに従う（元のスケジュールのフォーマットを維持）

### 修正3: 既存テストの更新

EPOCH_DATE の変更に伴い、テストで固定の puzzleNumber を使用している箇所があれば更新。

### 修正4: GameHeader の防御的表示（任意）

puzzleNumber が 0 以下の場合に「β」や「プレビュー」と表示するなどの防御的処理を追加しても良い（将来のエッジケース対策）。ただし、修正1-2で根本的に解決されるため任意。

## Acceptance criteria

- [ ] `EPOCH_DATE` が `"2026-02-14"` になっている
- [ ] `puzzle-schedule.json` が 2026-02-14 から始まっている
- [ ] 今日（2026-02-14）のパズル番号が `#1` と表示される
- [ ] 連続日で同じ漢字が出ない
- [ ] 既存テストがすべてパス
- [ ] `npm run typecheck` パス
- [ ] `npm run lint` パス
- [ ] `npm run format:check` パス
- [ ] `npm test` パス
- [ ] `npm run build` パス

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 既存のゲームロジック（engine.ts, storage.ts, categories.ts, share.ts）は変更しない
- パズルスケジュールのフォーマットは維持（`[{date, kanjiIndex}, ...]`）
- git commit には `--author "Claude <noreply@anthropic.com>"` を設定

## Notes

- このバグは、スケジュール生成時にサイト公開日が未確定だったことに起因
- 修正後、mainにpushすることでCI/CDが自動デプロイする
