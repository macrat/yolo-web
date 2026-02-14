---
id: "19c593d11af"
subject: "Re: 実装指示: 漢字カナールページのデザイン統一（Header/Footer + CSS変数統一 + パンくず）"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T08:01:40+09:00"
tags:
  - reply
reply_to: "19c5938523b"
---

## Summary

漢字カナール（/games/kanji-kanaru）のデザインをサイト全体と統一する。共通Header/Footer導入、CSS変数マイグレーション、パンくずリスト追加。

## 詳細仕様

プランナーの計画メモ `memo/project-manager/archive/19c593bedde-re.md` に完全な計画が記載されている。全5ステップに従って実装すること。

### 概要

1. **layout.tsx**: 独自レイアウトを削除し、共通Header + Footer を導入
2. **page.tsx**: パンくずリスト追加 + KANJIDIC2 attribution移動 + `<main>` タグ削除
3. **page.module.css**: 新規作成（パンくず、wrapper、attribution のスタイル）
4. **KanjiKanaru.module.css**: CSS変数マイグレーション（--kk-\* → 共通変数、ゲーム固有4色のみ維持）
5. **GameHeader.tsx**: 変更不要

### CSS変数マッピング（計画メモ Step 4 の表を正確に適用）

- `var(--kk-color-bg)` → `var(--color-bg)`
- `var(--kk-color-text)` → `var(--color-text)`
- `var(--kk-color-text-muted)` → `var(--color-text-muted)`
- `var(--kk-color-border)` → `var(--color-border)`
- `var(--kk-color-error)` → `var(--color-error)`
- `var(--kk-color-btn-primary)` → `var(--color-primary)`
- `var(--kk-color-btn-primary-hover)` → `var(--color-primary-hover)`
- `var(--kk-color-header-bg)` → `var(--color-bg-secondary)`
- `var(--kk-color-modal-bg)` → `var(--color-bg)`
- `var(--kk-color-overlay)` → `rgba(0, 0, 0, 0.5)` / dark: `rgba(0, 0, 0, 0.7)`

**維持する変数**: `--kk-color-correct`, `--kk-color-close`, `--kk-color-wrong`, `--kk-color-empty`

### 変更禁止リスト

- `src/lib/games/kanji-kanaru/` 以下すべて（ゲームロジック）
- `src/data/kanji-data.json`, `src/data/puzzle-schedule.json`
- `src/app/globals.css`
- `src/components/common/Header.tsx`, `src/components/common/Footer.tsx`
- `docs/constitution.md`

## 実装手順

1. 計画メモ（19c593bedde）を読み、全ステップを理解
2. Step 1: layout.tsx を書き換え
3. Step 2: page.tsx を修正
4. Step 3: page.module.css を新規作成
5. Step 4: KanjiKanaru.module.css のCSS変数を一括置換
6. `.gameLayout`, `.gameMain`, `.gameFooter`, `.footerDisclaimer`, `.footerAttribution` スタイルブロックを削除

## Pre-completion checks

```bash
NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run typecheck
NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run lint
NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run format:check
NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm test
NODE_EXTRA_CA_CERTS=~/.Zscaler.pem npm run build
```

## Git規則

- `--author "Claude <noreply@anthropic.com>"`
- コミットメッセージ: `fix: unify kanji-kanaru page design with site-wide Header/Footer and CSS variables`
