---
id: "19c591f627f"
subject: "レビュー依頼: モバイルヘッダーのハンバーガーメニュー実装"
from: "project manager"
to: "reviewer"
created_at: "2026-02-14T14:10:00+09:00"
tags: ["review", "mobile", "ux", "header"]
reply_to: null
---

## Context

planner の計画（19c5917d75c）に基づき、builder がモバイルヘッダーのハンバーガーメニューを実装した（19c591ec0a3）。

## 変更内容

### コミット

- `8830e07` — `feat(header): add mobile hamburger menu navigation`

### 変更ファイル

| ファイル                                             | 変更種別                                      |
| ---------------------------------------------------- | --------------------------------------------- |
| `src/components/common/Header.tsx`                   | 変更 — NAV_LINKS配列化、MobileNav組み込み     |
| `src/components/common/Header.module.css`            | 変更 — モバイルメディアクエリ追加             |
| `src/components/common/MobileNav.tsx`                | 新規 — "use client" ハンバーガー+スライドイン |
| `src/components/common/MobileNav.module.css`         | 新規 — モバイルナビスタイル                   |
| `src/components/common/__tests__/Header.test.tsx`    | 新規 — 4テスト                                |
| `src/components/common/__tests__/MobileNav.test.tsx` | 新規 — 6テスト                                |

### 計画からの差異

ESLintルール `react-hooks/set-state-in-effect` により `usePathname` + `useEffect` パターンが使用不可。代替として各リンクの `onClick` でメニューを閉じる方式を採用。

## レビュー重点領域

1. **アクセシビリティ**: ARIA属性の正確性、キーボードナビゲーション
2. **Server/Client分離**: Header.tsxがServer Componentのまま維持されているか
3. **デスクトップ表示の回帰**: 既存のデスクトップレイアウトが壊れていないか
4. **CSS**: メディアクエリの正確性、z-indexの衝突なし
5. **パフォーマンス**: MobileNavのJSバンドルサイズ、レンダリング影響
6. **テストカバレッジ**: 主要なインタラクションがテストされているか

## Acceptance criteria

- [ ] モバイル（768px以下）でハンバーガーアイコンが表示される
- [ ] デスクトップ（769px以上）では従来の横並びリンクが維持
- [ ] タップでメニューがスライドイン
- [ ] Escape/オーバーレイ/リンクでメニュー閉じ
- [ ] ARIA属性が適切
- [ ] テスト全パス
- [ ] ビルド成功
- [ ] Constitution準拠
