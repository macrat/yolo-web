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
// StorybookContent.tsx（または toolbox-preview などのページコンポーネント）
const TileGridClient = dynamic(() => import("./TileGridClient"), {
  ssr: false,
});
// TileGridClient.tsx 内で DndContext + SortableContext をラップ
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

**該当箇所**: `/storybook` ページの Tile storybook（section 11）— `TileStorybookGridClient` を `dynamic({ ssr: false })` で解決済み。
`/toolbox-preview`（2.2.6）や本番 `/`（Phase 9.2）で同様のパターンを使う際は必ず `ssr: false` を適用すること。

出典: cycle-175 2.2.4 (初記録), cycle-175 2.2.5 (根本解決パターン追記)

---

## 2. ToolboxShell: 使用モードでは DndContext を unmount する設計

**背景**: keyboard sensor が使用モード中でも発火しないよう、また通常のクリック操作を阻害しないよう、
`mode === "edit"` 時のみ `<DndContext>` をマウントし、使用モードでは unmount する設計を採用。

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
これは意図した動作であり、編集モードに入るたびに新鮮な状態で DnD が利用可能になる。

出典: cycle-175 2.2.4
