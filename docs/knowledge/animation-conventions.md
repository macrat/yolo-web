# アニメーション規約（タイルコンポーネント）

---

## 1. CSS @keyframes のインジェクション方法

タイルコンポーネントは **CSS Modules 使用不可**（codegen 制約）のため、
`@keyframes` は JSX 内の `<style>` タグで注入する。

```tsx
const FADE_IN_KEYFRAMES = `
  @keyframes joinStyleFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// JSX 内でインジェクション
<>
  <style>{FADE_IN_KEYFRAMES}</style>
  <div style={{ animation: "joinStyleFadeIn 200ms ease-out forwards" }}>
    ...
  </div>
</>;
```

- 定数名は `<アニメーション名>_KEYFRAMES`（ALL_CAPS）で統一する。
- ファイルのトップレベル（コンポーネント外）に定義して再レンダリングで再生成されないようにする。

---

## 2. joinStyleFadeIn — 条件付きサブオプションの登場アニメーション（SSoT）

**適用箇所**: `LineBreakRemoverTile.tsx`（cycle-209 で確立 / Phase 8.1 初導入パターン）

| プロパティ              | 値                                        |
| ----------------------- | ----------------------------------------- |
| アニメーション名        | `joinStyleFadeIn`                         |
| `from`                  | `opacity: 0; transform: translateY(-4px)` |
| `to`                    | `opacity: 1; transform: translateY(0)`    |
| duration                | `200ms`                                   |
| timing function         | `ease-out`                                |
| fill mode               | `forwards`                                |
| reduced-motion fallback | `animation: none`（即時表示）             |

```css
@keyframes joinStyleFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 再マウントによる「常に 0→1」保証

条件付き表示の DOM 要素には `key={mode}` を付与し、
smart-pdf モードに入るたびに要素を**再マウント**させる。
これにより、モード→別→再度 smart-pdf と遷移しても必ず 0→1 方向でアニメーションが走る。

```tsx
{
  mode === "smart-pdf" && (
    <div
      key={mode}
      style={{
        animation: reducedMotion
          ? "none"
          : "joinStyleFadeIn 200ms ease-out forwards",
      }}
    >
      ...
    </div>
  );
}
```

**補足**: 現在の line-break-remover の実装では、`{mode === "smart-pdf" && ...}` の条件付きレンダリング自体が DOM の unmount / remount を発火するため、`key={mode}` の値変化による強制再マウントは技術的には冗長。ただし、将来「複数のモードで条件付き要素を共有しつつアニメーションだけ毎回 0→1 から走らせたい」ケース（例: 案 a / 案 b のような同型要素で `key` だけ差し替えて再マウントする設計）への保険として `key` 付与を推奨する。

---

## 3. prefers-reduced-motion 対応（WCAG 2.1 SC 2.3.3）

アニメーション適用箇所すべてで `prefers-reduced-motion: reduce` を検出し、
`true` の場合は `animation: "none"` で即時表示に切り替える。

### 検出方法（SSR セーフ）

```tsx
const [reducedMotion, setReducedMotion] = useState(
  // 遅延初期化でサーバーサイドでは false にフォールバック
  () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
);

useEffect(() => {
  // 実行時の変更イベントを購読（`useEffect` 内で setState を直接呼ばない lint ルール回避のため
  // 初期値は useState 遅延初期化で取得し、useEffect はリスナー登録のみ担当）
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
  mql.addEventListener("change", handleChange);
  return () => mql.removeEventListener("change", handleChange);
}, []);
```

**重要**: `react-hooks/set-state-in-effect` lint ルールにより、
`useEffect` 本体で同期的な `setState` 呼び出しは禁止されている。
初期値は `useState` の遅延初期化（lazy initializer）で取得すること。

---

## 4. 条件付き表示の実装パターン（高さトランジション禁止）

条件付き DOM の高さ変化には **CSS `grid-template-rows` トランジションを使わない**。

**理由**:

- Chrome で jumpy な挙動が発生する場合がある。
- SSR 時に `grid-template-rows` の初期値が確定できず Hydration ミスマッチを起こす可能性がある。

代替: **JSX の条件付きレンダリング**（`{condition && <div>...</div>}`）で表示/非表示を切り替える。
登場時のアニメーションは §2 の `joinStyleFadeIn` で代替する。

出典: cycle-209 T-3 論点 2.5 案(a) 採択 / reviewer r1 MINOR-2
