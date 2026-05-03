# @dnd-kit 固有の技術知見

このプロジェクトで蓄積された @dnd-kit（@dnd-kit/core, @dnd-kit/sortable）固有の非自明な動作と注意点。

---

## 1. SSR/CSR で aria-describedby の生成 ID が一致せず hydration warning が出る

**症状**: Next.js App Router（SSR）で DndContext を使用すると、Playwright や Chrome DevTools でコンソールエラーが出る。

```
A tree hydrated but some attributes of the server rendered HTML didn't match
...
aria-describedby="DndDescribedBy-0"  ← SSR 側
aria-describedby="DndDescribedBy-8"  ← CSR 側
```

**原因**: dnd-kit は DndContext ごとに連番 ID を生成する（`DndDescribedBy-0`, `DndDescribedBy-1`, ...）。
SSR 時と CSR hydration 時でページ上の DndContext 数や初期化順序が異なると、
同一コンポーネントの ID が一致しない。

**影響**: React の hydration mismatch（エラーレベル）として記録されるが、
UI の実挙動には影響しない（aria-describedby は DnD 操作の案内文のみに使われる）。

**根本解決（推奨）**: DndContext を含むコンポーネントを `dynamic({ ssr: false })` でクライアント専用 import する。
これにより SSR でのレンダリングを完全にスキップし、カウンタ不一致を根本排除できる。

```tsx
// 親ページコンポーネント
const DnDClient = dynamic(() => import("./DnDClient"), {
  ssr: false,
});
// DnDClient.tsx 内で DndContext + SortableContext をラップ
```

**代替解決**: DndContext の `id` prop に固定文字列を渡す方法もあるが、
同一ページに複数 DndContext が存在する場合は全てに一意な固定 ID が必要で管理が煩雑。

**暫定回避（E2E テストのみ）**: 根本解決が難しい場合、E2E テストでこの警告をフィルタリングする。

```js
page.on("console", (msg) => {
  if (msg.type() === "error") {
    if (
      msg.text().includes("DndDescribedBy") ||
      msg.text().includes("hydrated but some attributes")
    ) {
      return; // 既知の dnd-kit hydration 警告はスキップ
    }
    consoleErrors.push(msg.text());
  }
});
```

**運用方針**: DndContext を含むコンポーネントは原則 `dynamic({ ssr: false })` で読み込む。

出典: cycle-175

---

## 2. 編集モード分離型 UI では DndContext を mount/unmount で切り替えてよい

**背景**: keyboard sensor が使用モード中に発火しないよう、また通常のクリック操作を阻害しないよう、
編集モード時のみ `<DndContext>` をマウントし、使用モードでは unmount するパターンが選択肢として有効。

```tsx
{
  mode === "edit" ? (
    <DndContext sensors={sensors}>
      <div>{children({ mode })}</div>
    </DndContext>
  ) : (
    <div>{children({ mode })}</div>
  );
}
```

**注意点**: DndContext の unmount/remount のたびに dnd-kit 内部の sensor 登録が初期化される。
これは意図した動作で、編集モードに入るたびに新鮮な状態で DnD が利用可能になる。

出典: cycle-175
