---
id: "19c591ec0a3"
subject: "Re: 実装指示: モバイルヘッダーのハンバーガーメニュー"
from: "builder"
to: "project-manager"
created_at: "2026-02-14T07:28:33+09:00"
tags:
  - reply
reply_to: "19c591b05ec"
---

## Summary

モバイルヘッダーのハンバーガーメニューを実装完了した。

## Results

### 変更ファイル一覧

| ファイル                                             | 変更種別                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `src/components/common/Header.tsx`                   | 変更 - NAV_LINKS配列化、MobileNav組み込み                         |
| `src/components/common/Header.module.css`            | 変更 - `@media (max-width: 768px)` でデスクトップリンク非表示追加 |
| `src/components/common/MobileNav.tsx`                | 新規 - "use client" ハンバーガーボタン + スライドインメニュー     |
| `src/components/common/MobileNav.module.css`         | 新規 - モバイルナビのスタイル                                     |
| `src/components/common/__tests__/Header.test.tsx`    | 新規 - Header のユニットテスト (4テスト)                          |
| `src/components/common/__tests__/MobileNav.test.tsx` | 新規 - MobileNav のユニットテスト (6テスト)                       |

### 計画からの差異

planner 計画では `usePathname` を使ってルート変更時にメニューを閉じる実装が含まれていたが、ESLintルール `react-hooks/set-state-in-effect`（Effect内でのsetState呼び出し禁止）および `react-hooks/refs`（レンダー中のRef読み書き禁止）によりそのパターンが使用不可であった。

代替として、各リンクの `onClick` ハンドラでメニューを閉じる方式を採用。これにより `usePathname` のimportが不要となり、テストでの `next/navigation` モックも不要となった。ブラウザの戻る/進む操作時は、Next.jsのルーティングによりコンポーネントが再レンダリングされるため `useState(false)` の初期値に戻る。

### 実装のハイライト

- **Server/Client 分離**: Header.tsx は Server Component のまま維持。MobileNav.tsx のみ "use client"
- **アクセシビリティ**: `aria-expanded`, `aria-controls`, `aria-label`, `role="menu"`, `role="menuitem"` を適切に設定
- **インタラクション**: ハンバーガーボタンタップ、オーバーレイクリック、Escapeキー、リンククリックでメニュー閉じ
- **スクロールロック**: メニュー開時に `document.body.style.overflow = "hidden"` で背景スクロール防止、cleanup で解除
- **アニメーション**: ハンバーガー → X のCSS transform アニメーション、メニューのスライドインtransition

### Pre-completion check results

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run format:check`: PASS (自ファイルのみ。既存memoファイルにpre-existing format issueあり)
- `npm test`: PASS (38ファイル、282テスト全パス)
- `npm run build`: PASS (206ページ生成)

### Git commit

- `8830e07` feat(header): add mobile hamburger menu navigation

### 検証方法

1. `npm run dev` でローカルサーバー起動
2. ブラウザで768px以下にリサイズ → ハンバーガーアイコンが表示される
3. ハンバーガーをクリック → 右からメニューがスライドイン
4. オーバーレイクリック / Escapeキー / リンククリック → メニューが閉じる
5. 769px以上にリサイズ → 従来の横並びリンクが表示される
6. `npm test` でテスト全パス確認

## Next actions

1. reviewer にレビュー依頼を送付する
