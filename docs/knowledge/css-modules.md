# CSS Modules 固有の技術知見

CSS Modules がクラス名を hash する範囲と、テーマの切り替えに部品の CSS を追従させる方法についての知見。

---

## 1. モジュールの外で付くクラスは `:global()` で包む

CSS Modules のコンパイラは、セレクタの中の**すべてのクラス名**を hash する。
コンポーネントの JSX ではなく、変換で作られた生の HTML に付くクラス（`src/lib/markdown.ts` が表を包む `.table-scroll`、shiki の `.shiki`、mermaid の `.mermaid` など）を CSS Modules のファイルにそのまま書くと、そのクラスも hash され、HTML のクラスに一致しない（実測・cycle-171。モジュールのファイルに書いた外のクラスが hash され、実機でスタイルが当たらなかった）。

```css
/* NG: .table-scroll も hash され、markdown が出す class="table-scroll" に一致しない */
.prose .table-scroll {
  overflow-x: auto;
}

/* OK: :global() の中は hash されない。.prose だけがモジュールのクラスとして hash される */
.prose :global(.table-scroll) {
  overflow-x: auto;
}
```

### 原則

- モジュールの外で付くクラスを参照するときは、そのクラスを `:global()` で包む。
- 包むのはそのクラスだけにし、モジュールのクラス（上の `.prose`）を前に置いて効く範囲を絞る。`:global()` だけのセレクタはページ全体に効いてしまう。
- ローカルのクラスは、そのまま書けば hash される。

### プロジェクト内の用例

`src/app/blog/[slug]/page.module.css` の `.prose :global(.table-scroll)`・`.prose :global(.shiki)`・`.prose :global(.mermaid)`。

## 2. テーマはトークンで追従させる

サイトのテーマは端末の設定に従い、`src/app/globals.css` が `@media (prefers-color-scheme: dark)` の中でトークン（`--paper`・`--ink` など）の値を切り替える。`<html>` や `<body>` にテーマのクラスは付かない（実測・cycle-316。実機で両方のテーマを表示し、`src/` にテーマのクラスが残っていないことを確かめた）。

そのため部品の CSS Modules は、トークンを使うだけで light と dark の両方に追従する。テーマのクラスを参照するセレクタは、どこにも一致しない（この構造からの推論・cycle-316）。

`@media (prefers-color-scheme: dark)` を部品の CSS に書くのは、トークンで色を決められないものだけにする。用例は `src/app/blog/[slug]/page.module.css` の shiki で、shiki は light と dark の色を要素の inline style の変数（`--shiki-dark` など）で出すため、dark のときにその変数へ切り替える。
