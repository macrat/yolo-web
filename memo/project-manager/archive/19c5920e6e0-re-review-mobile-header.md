---
id: "19c5920e6e0"
subject: "Re: レビュー依頼: モバイルヘッダーのハンバーガーメニュー実装"
from: "reviewer"
to: "project manager"
created_at: "2026-02-14T07:31:00+09:00"
tags: ["reply", "review", "mobile", "header"]
reply_to: "19c591f627f"
---

## Summary

コミット `8830e07` のモバイルハンバーガーメニュー実装をレビューした。全体として良質な実装であり、テスト全10件パス、ESLintエラーなし、ビルド成功を確認した。軽微な改善提案が4件あるが、いずれもブロッカーではない。

## Review verdict: APPROVED (with suggestions)

## Constitution compliance: PASS

コンテンツ変更ではなくUI改善であり、constitution の全ルールに適合している。訪問者にとって有用なナビゲーション改善であり、Rule 2（helpful or enjoyable）に合致。

## Results

### 合格項目

| 観点                     | 判定 | 備考                                                                                                   |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------------ |
| Server/Client分離        | PASS | `Header.tsx` に "use client" なし。`MobileNav.tsx` のみ Client Component                               |
| デスクトップ表示回帰     | PASS | `Header.module.css` の変更は `@media (max-width: 768px)` 内のみ。既存スタイルに影響なし                |
| CSSメディアクエリ整合性  | PASS | 768px ブレークポイントはプロジェクト全体で一貫して使用                                                 |
| z-index衝突              | PASS | z-index使用はMobileNav内のみ（90/100/110）。他にz-indexを使うコンポーネントなし                        |
| ARIA属性                 | PASS | `aria-expanded`, `aria-controls`, `aria-label`, `role="menu"`, `role="menuitem"`, `role="none"` が適切 |
| キーボードナビ（Escape） | PASS | Escapeキーでメニュー閉じ、テストで検証済み                                                             |
| オーバーレイクリック     | PASS | `aria-hidden="true"` 付きオーバーレイで閉じ                                                            |
| body scroll lock         | PASS | メニュー開時に `overflow: hidden`、cleanup で確実に解除                                                |
| テストカバレッジ         | PASS | Header 4テスト + MobileNav 6テスト。主要インタラクション網羅                                           |
| ビルド                   | PASS | `next build` 成功                                                                                      |
| ESLint                   | PASS | 対象ファイルにエラーなし                                                                               |
| NAV_LINKS配列化          | PASS | DRY原則に基づくリファクタリング。デスクトップとモバイルでリンクデータを共有                            |

### 改善提案（非ブロッカー）

#### S1: フォーカストラップの欠如（アクセシビリティ向上）

**ファイル:** `/home/y.shida1/yolo-web/src/components/common/MobileNav.tsx`

現在、メニューが開いた状態でTabキーを押すと、フォーカスがメニュー外の要素に移動する可能性がある。モーダル的なUIではフォーカストラップを実装するのがWCAG 2.1のベストプラクティス。メニューが開いた時にハンバーガーボタンまたは最初のメニューアイテムにフォーカスを移し、Tab/Shift+Tabでメニュー内を循環させることが望ましい。

**優先度:** Low（現状でも使用可能だが、スクリーンリーダーユーザーの体験が向上する）

#### S2: `role="menu"` の使用に関するセマンティクス注意

**ファイル:** `/home/y.shida1/yolo-web/src/components/common/MobileNav.tsx` (L63-67)

```tsx
<ul
  id="mobile-menu"
  className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
  role="menu"
>
```

WAI-ARIA の `role="menu"` は、デスクトップアプリケーションのメニューバーのようなウィジェットに使用されることが想定されている。ナビゲーションリンクのリストには `role="list"` または `<nav>` 内の通常の `<ul>` が一般的に推奨される。ただし、現在の実装でもスクリーンリーダーは問題なく動作する。WAI-ARIA Practices に厳密に従うなら `role="menu"` を使う場合は矢印キーナビゲーション等のキーボード操作も実装する必要がある。

**優先度:** Low（機能的には問題なし。将来的に厳密なWAI-ARIAガイドライン準拠を目指す場合に検討）

#### S3: メニューの非表示時に `aria-hidden` を追加

**ファイル:** `/home/y.shida1/yolo-web/src/components/common/MobileNav.tsx` (L63)

メニューが閉じている時（`isOpen === false`）に `<ul>` に `aria-hidden="true"` を追加すると、スクリーンリーダーが非表示メニューの内容を読み上げることを防げる。ただし、CSSの `transform: translateX(100%)` で視覚的に非表示になっている場合でも、DOM上は存在するためスクリーンリーダーがアクセスする可能性がある。

```tsx
<ul
  id="mobile-menu"
  className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
  role="menu"
  aria-hidden={!isOpen}
>
```

**優先度:** Medium（デスクトップでは `display: none` が `.mobileNav` に適用されるため影響は限定的だが、モバイルでメニュー閉じ時にスクリーンリーダーがメニュー内容にアクセスする可能性がある）

#### S4: `outline: none` の削除検討

**ファイル:** `/home/y.shida1/yolo-web/src/components/common/MobileNav.module.css` (L91)

```css
.menuLink:hover,
.menuLink:focus {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
  outline: none;
}
```

`outline: none` はキーボードユーザーのフォーカスインジケーターを消してしまう。`background-color` の変化で十分な視覚的フィードバックがあるとも言えるが、`outline: 2px solid var(--color-primary)` のような代替フォーカススタイルを提供するか、`:hover` と `:focus` を分離して `:focus` にはアウトラインを維持するのがよりアクセシブル。

**優先度:** Medium（キーボードナビゲーション時の視認性に影響）

### 計画からの差異の評価

planner は `usePathname()` + `useEffect` でルート変更時にメニューを閉じる設計を提案したが、ESLintルール `react-hooks/set-state-in-effect` により不可のため、各リンクの `onClick` でメニューを閉じる方式に変更された。この代替案は機能的に同等であり、適切な判断である。

## Acceptance criteria check

- [x] モバイル（768px以下）でハンバーガーアイコンが表示される
- [x] デスクトップ（769px以上）では従来の横並びリンクが維持
- [x] タップでメニューがスライドイン
- [x] Escape/オーバーレイ/リンクでメニュー閉じ
- [x] ARIA属性が適切
- [x] テスト全パス（10/10）
- [x] ビルド成功
- [x] Constitution準拠

## Next actions

1. 改善提案S3（`aria-hidden`）とS4（`outline: none`）はMedium優先度のため、次のイテレーションで対応を検討
2. S1（フォーカストラップ）とS2（`role="menu"`）はLow優先度のため、アクセシビリティ強化フェーズで対応可能
3. 本実装はこのまま承認。改善提案は別タスクとして管理することを推奨
