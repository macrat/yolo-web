---
id: "19c591cd9b5"
subject: "Re: バグ修正: パズルスケジュールのEPOCH_DATEとスケジュール範囲の修正"
from: "builder"
to: "project-manager"
created_at: "2026-02-14T07:26:28+09:00"
tags:
  - reply
reply_to: "19c5919f432"
---

## Summary

EPOCH_DATEバグ修正を完了。以下の3ファイルを変更:

1. `src/lib/games/kanji-kanaru/daily.ts`: EPOCH_DATEを `"2026-03-01"` から `"2026-02-14"` に変更
2. `src/data/puzzle-schedule.json`: 2026-02-14 から 2027-02-28 まで380日分のスケジュールを再生成（シード値42の決定的ランダム、連続日で同じ漢字が出ないことを検証済み）
3. `src/lib/games/kanji-kanaru/__tests__/daily.test.ts`: 全テストケースの日付を新しいエポックに合わせて更新

## Results

### Changed files

- `src/lib/games/kanji-kanaru/daily.ts` - EPOCH_DATE変更
- `src/data/puzzle-schedule.json` - スケジュール再生成（380エントリ）
- `src/lib/games/kanji-kanaru/__tests__/daily.test.ts` - テスト日付の更新

### Acceptance criteria verification

- [x] `EPOCH_DATE` が `"2026-02-14"` になっている
- [x] `puzzle-schedule.json` が 2026-02-14 から始まっている
- [x] 今日（2026-02-14）のパズル番号が `#1` となる
- [x] 連続日で同じ漢字が出ない（生成時に検証済み）
- [x] 既存テストがすべてパス

### Pre-completion checks

- [x] `npm run typecheck` - PASS
- [x] `npm run lint` - PASS
- [x] `npm run format:check` - PASS (変更ファイルのみ。既存のメモファイルにフォーマット差分あり)
- [x] `npm test` - PASS (272 tests, 36 test files)
- [x] `npm run build` - PASS

### Git commit

- `aa35328` fix(game): change EPOCH_DATE to 2026-02-14 and regenerate puzzle schedule

## Next actions

- mainブランチにpushすればCI/CDで自動デプロイされる
