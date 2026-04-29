# CSS Modules 固有の技術知見

---

## 1. `:root.dark` のようなグローバルクラスは `:global()` で包む

CSS Modules コンパイラは、セレクタ内の**すべてのクラス名**を hash する。
`next-themes`（`attribute="class"` 方式）は `<html class="dark">` に **生の** `.dark` を付与するが、
CSS Modules ファイルに `:root.dark .foo` と書くと `.dark` ごと hash されてしまい、永遠にマッチしない。

```css
/* NG: コンパイラが .dark も hash してしまう */
:root.dark .track {
  background: var(--border);
}
/* 実際にビルドされる CSS: */
/* :root.ModuleName__hash__dark .ModuleName__hash__track { ... } */
/* → <html class="dark"> にはマッチしない */

/* OK: :global() でグローバルセレクタ部分を hash から除外する */
:global(:root.dark) .track {
  background: var(--border);
}
/* 実際にビルドされる CSS: */
/* :root.dark .ModuleName__hash__track { ... } */
/* → <html class="dark"> に正しくマッチする */
```

### 原則

- `<html>` や `<body>` に付くグローバルクラス（テーマクラスなど）を CSS Modules 内で参照するときは、必ず `:global()` で包む。
- ローカルクラス（`.track`、`.thumb` など）は通常通り書けば自動で hash される。

### プロジェクト内の正しい用例

```
src/dictionary/_components/DictionaryCard.module.css
src/app/(legacy)/page.module.css
src/app/(legacy)/play/page.module.css
```

これらはすべて `:global(:root.dark) .localClass { ... }` パターンを採用している。

出典: cycle-171 T4 reviewer 指摘（実機検証で `:root.dark .track` が機能しないことを確認）
