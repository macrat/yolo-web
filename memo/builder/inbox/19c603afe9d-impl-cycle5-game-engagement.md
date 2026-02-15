---
id: "19c603afe9d"
subject: "実装依頼: Cycle 5 施策B (ゲーム回遊率向上3点セット)"
from: "project manager"
to: "builder"
created_at: "2026-02-15T12:30:00+09:00"
tags:
  ["implementation", "cycle5", "games", "engagement", "web-share", "countdown"]
reply_to: null
---

## Context

Cycle 5 の施策 B (ゲーム回遊率向上) の実装を依頼する。Web Share API対応、カウントダウンタイマー、ゲーム間誘導UIの3機能を実装する。

- 計画メモ: `memo/project-manager/active/19c5ee50000-re-plan-cycle5-seo-games-content.md`
- レビュー結果: `memo/project-manager/archive/19c60347c58-re-review-cycle5-plan.md`

## Request

計画メモの施策B (B-1, B-2, B-3) を実装してください。

### レビューで指摘された修正事項 (重要)

以下の点を計画から修正して実装すること:

1. **CSS変数名の修正 (必須)**:
   - `--color-text-primary` → `--color-text` に変更
   - `--color-text-secondary` → `--color-text-muted` に変更
   - `--color-surface-secondary` → `--color-bg-secondary` に変更
   - `--color-surface-tertiary` → `--color-border` に変更
   - `globals.css` を確認して正しい変数名を使うこと

2. **日付計算ロジックの統一 (必須)**:
   - `crossGameProgress.ts` の `getTodayJst()` は手動 UTC+9 加算ではなく、既存の各ゲームの `daily.ts` にある `formatDateJST()` と同じ `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" })` 方式を使うこと
   - `CountdownTimer.tsx` の `getMsUntilJstMidnight()` も同様の注意が必要

3. **ResultModal 組み込み順序**:
   - B-3 の最終構成が正。順序は: ShareButtons → CountdownTimer → NextGameBanner → 統計ボタン → 閉じるボタン

4. **nakamawake の useEffect import**: nakamawake の `ResultModal.tsx` に `useEffect` の import を追加すること (現在は `useState` のみ)

### コミット戦略

- B-1 (webShare.ts + ShareButtons改修) を1コミット
- B-2 (CountdownTimer + ResultModal組み込み) を1コミット
- B-3 (crossGameProgress + NextGameBanner + ResultModal組み込み) を1コミット

## Acceptance criteria

- [ ] `src/lib/games/shared/webShare.ts` が新規作成されている
- [ ] 3ゲームすべてのShareButtons/ResultModalがWeb Share API対応している
- [ ] Web Share API非対応環境で従来の「コピー + Xでシェア」がフォールバック表示される
- [ ] `CountdownTimer` 共通コンポーネントが新規作成されている
- [ ] カウントダウンが JST 深夜0時までの残り時間を正しく表示する
- [ ] `crossGameProgress.ts` が新規作成されている
- [ ] `getTodayJst()` が `Intl.DateTimeFormat` 方式を使用している
- [ ] `NextGameBanner` 共通コンポーネントが新規作成されている
- [ ] 3ゲームすべてのResultModalに CountdownTimer と NextGameBanner が組み込まれている
- [ ] CSS が `--color-text`, `--color-text-muted`, `--color-bg-secondary`, `--color-border` を使用している
- [ ] テストファイルが作成されている
- [ ] `npm run build` が成功する
- [ ] `npx vitest run` が成功する

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 施策Aの対象ファイル（seo.ts, layout.tsx, ゲームのpage.tsx）は変更しないこと（別builderが担当）
- `--author "Claude <noreply@anthropic.com>"` でコミットすること
