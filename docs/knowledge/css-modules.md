# CSS Modules 固有の技術知見

CSS Modules がクラス名を hash する範囲と、テーマの切り替えに部品の CSS を追従させる方法についての知見。

---

## 1. モジュールの外で付くクラスは `:global()` で包む

CSS Modules のコンパイラは、セレクタの中の**すべてのクラス名**を hash する。
コンポーネントの JSX ではなく、モジュールの外で付くクラス（Markdown の変換で作られた HTML のクラスや、`<html>` に付くクラスなど）を CSS Modules のファイルにそのまま書くと、そのクラスも hash され、HTML のクラスに一致しない（実測・cycle-171。`<html>` に付く `.dark` を `:root.dark` と書いたセレクタが hash され、実機でスタイルが当たらなかった）。

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

- `src/components/Prose/Prose.module.css` の `.prose :global(.table-scroll)`（Markdown の変換が表を包むクラス）と `.prose :global(.code-comment)`（`src/lib/highlight.ts` がコードの注釈を包むクラス）
- `src/app/blog/[slug]/page.module.css` の `.body :global(.mermaid)`（Markdown の変換が図の元の文を包むクラス）

## 2. テーマはトークンで追従させる

サイトのテーマは端末の設定に従い、`src/app/globals.css` が `@media (prefers-color-scheme: dark)` の中でトークン（`--paper`・`--ink` など）の値を切り替える。`<html>` や `<body>` にテーマのクラスは付かない（cycle-316。実機で両方のテーマを表示したのは実測、`src/` にテーマのクラスが無いことはソースで確認）。

そのため部品の CSS Modules は、トークンを使うだけで light と dark の両方に追従する。テーマのクラスを参照するセレクタは、どこにも一致しない（推論・cycle-316）。

色を HTML に書かず、クラスを付けて部品の CSS がトークンで塗る形にすれば、生成される HTML もテーマに追従する。`src/lib/highlight.ts` はコードの注釈を `code-comment` のクラスで包むだけにし、色は `Prose.module.css` がトークンで塗る（推論・cycle-316）。

トークンの値を読んで色を値として書き込むもの（SVG に色を焼き込む mermaid の図など）は、トークンが切り替わっても追従しない。こうしたものはテーマの変化を `window.matchMedia("(prefers-color-scheme: dark)")` で受け、描き直す。用例は `src/blog/_components/MermaidRenderer.tsx`（推論・cycle-316）。
