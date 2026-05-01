---
title: 道具箱（ダッシュボード）フェーズ1 ベストプラクティス調査
date: 2026-05-01
purpose: yolos.net 道具箱機能フェーズ1（タイル配置・localStorage永続化・編集モード切替）の設計・実装方針を確立するための技術・UX調査
method: Web検索（dnd-kit/react-grid-layout/muuri比較、ウィジェットUI設計原則、localStorage永続化パターン、Next.js App Routerノーインデックス設計）＋公式ドキュメント・GitHub確認
sources:
  - https://dndkit.com/
  - https://github.com/clauderic/dnd-kit
  - https://github.com/react-grid-layout/react-grid-layout
  - https://bundlephobia.com/package/@dnd-kit/core
  - https://www.pkgpulse.com/blog/dnd-kit-vs-react-beautiful-dnd-vs-pragmatic-drag-drop-2026
  - https://zoer.ai/posts/zoer/best-react-drag-drop-libraries-comparison
  - https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react
  - https://learn.microsoft.com/en-us/windows/apps/design/widgets/widgets-design-fundamentals
  - https://developer.apple.com/design/human-interface-guidelines/
  - https://www.nngroup.com/articles/modes/
  - https://janmonschke.com/simple-frontend-data-migration/
  - https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
  - https://nextjs.org/docs/app/building-your-application/routing/route-groups
  - https://react.dev/reference/react/useSyncExternalStore
  - https://www.eleken.co/blog-posts/empty-state-ux
  - https://npmtrends.com/@dnd-kit/core-vs-react-grid-layout-vs-sortablejs
---

# 道具箱（ダッシュボード）フェーズ1 ベストプラクティス調査

## A. タイル / ホーム画面型 UI のベストプラクティス

### プラットフォーム別設計原則

#### iOS / iPadOS（Apple ジグルモード）

- ホーム画面のアプリ・ウィジェットは「長押し」でジグルモード（編集モード）に入る。アイコンが振動し削除ボタン・移動ハンドルが出現する明示的な2モード分離。
- ウィジェットサイズは Small / Medium / Large の3段階。「glanceable（一瞥できる）」「focused（焦点を絞る）」が Small の設計原則。
- Apple Human Interface Guidelines は「ウィジェットは情報提供を主目的とし、単なる大きなアイコンを回避せよ」と規定。
- 参照: https://developer.apple.com/design/human-interface-guidelines/

#### Windows 11 ウィジェットボード（Microsoft）

- ウィジェットは Small / Medium / Large の3サイズ。16px マージン、4px ガター（4の倍数ルール）を採用。
- タッチターゲットは Small で1個、Medium で2〜3個、Large で3〜4個以内に制限。情報の詰め込みを明示的に禁止。
- ライト/ダークテーマ対応、WCAG 2.0 AA（4.5:1）のコントラスト比を必須とする。
- 参照: https://learn.microsoft.com/en-us/windows/apps/design/widgets/widgets-design-fundamentals

#### Android ウィジェット

- ホーム画面の長押しで編集モードへ。サイズ変更ハンドルが表示される。
- グリッドスナップ方式（4×4〜6×6）が主流。

### ダッシュボード型 Web サービスの編集 UI パターン

主要サービスの編集モード設計を調査した結果、以下の2つの典型パターンが確認された。

**パターン1: 明示的トグルボタン型**（Trello / Notion / Linear）

- 「編集」ボタンを押すと編集モードに遷移。操作後「保存」または「完了」で閲覧モードに戻る。
- 「編集モード中は誤操作防止のためタイルのクリックアクションを無効化」が一般的。
- NN/g の研究によれば、モード切替には強いビジュアル差異が必要（背景色変化・ボーダー・カーソル変更）。モードスリップ（意図せずモードを混乱させる）が最大のリスク。
- 参照: https://www.nngroup.com/articles/modes/

**パターン2: 常時編集可能型**（Netvibes / iGoogle 系）

- ドラッグで即座に並び替えられる。専用の「編集モード」を持たない。
- 誤操作（スクロールとドラッグの混同）が多発しやすい欠点があり、近年は衰退傾向。
- Netvibes 自体は 2025年6月にサービス終了予定であることが確認された。

**M1b（リピーターユーザー）の観点で推奨する設計:**

- **明示的トグルボタン型を採用**。「使用モード」では誤ってレイアウトが崩れるリスクを排除。
- 編集モードへの導線は 1 クリック以内（ページ右上の固定ボタン等）。
- 編集モード中はビジュアルを明確に変化させる（背景の薄いオーバーレイ、タイルのドラッグハンドル表示）。

### 初回オンボーディング（空の道具箱）設計

**「空の状態（Empty State）」のベストプラクティス:**

- 「No data yet」「まだツールがありません」という無機質な表示は最悪。文脈を持った説明文とアクションへの誘導を組み合わせる。
- Trello は新規ユーザーに完成済みサンプルボードを表示する（データシーディング）。
- 推奨構造: **見出し（状況の説明）+ 1〜2文のサポートテキスト + 単一の主要 CTA ボタン**。
- アイコン等のビジュアルで「ここはあなたの道具箱になる場所」とスペースの意図を伝える。
- 参照: https://www.eleken.co/blog-posts/empty-state-ux

**フェーズ1向けの具体的推奨:**

- 道具箱が空のとき「+ ツールを追加」ボタンを中央に大きく表示。
- よく使われるツールのプリセットサンプル（例: 「時計・電卓・メモ帳」セット）を提示し、ワンクリックで追加できるようにする（プリセット機能は別フェーズでも、空状態のオンボーディング用として先に設ける価値がある）。

---

## B. ドラッグ&ドロップ + グリッド配置ライブラリ比較

### ライブラリ実比較表

| ライブラリ                  | バンドル (gzip) | メンテ状態               | TypeScript          | a11y               | タッチ/モバイル             | Next.js App Router              | グリッドサイズ可変 | 週間DL |
| --------------------------- | --------------- | ------------------------ | ------------------- | ------------------ | --------------------------- | ------------------------------- | ------------------ | ------ |
| **@dnd-kit/core**           | ~6KB            | 活発 ✅ (2026/4更新)     | ネイティブ ✅       | WCAG 2.1 AA ✅     | ✅ (Pointer/Touch/Keyboard) | `"use client"` で対応 ✅        | 要自前実装         | ~280万 |
| **@dnd-kit/sortable**       | +~3KB           | 活発 ✅                  | ネイティブ ✅       | ✅                 | ✅                          | ✅                              | -                  | 高     |
| **react-grid-layout**       | ~28.7KB         | 活発 ✅ (v2.2.3, 2026/3) | v2でネイティブ化 ✅ | 低 ⚠️ (WCAG非準拠) | Good ✅                     | `"use client"` 必須, SSR不可 ⚠️ | ✅ (built-in)      | 中     |
| **react-beautiful-dnd**     | ~30KB           | 非推奨 ❌                | 型定義のみ ⚠️       | ✅                 | 旧端末で問題あり            | 非推奨                          | 要自前             | ~120万 |
| **pragmatic-drag-and-drop** | ~3.5KB          | 活発 ✅ (Atlassian)      | 不明                | 拡張可能 ✅        | ✅                          | Server Components 対応 ✅       | 要自前             | ~18万  |
| **Gridstack.js**            | ~10KB           | 活発 ✅                  | 不明                | 不明               | ✅                          | 要 wrapper                      | ✅ (built-in)      | ~26万  |
| **Muuri**                   | ~11KB           | 停滞気味 ⚠️              | なし ⚠️             | 不明               | ✅                          | 要 wrapper                      | 限定的             | ~3万   |
| **react-rnd**               | 不明            | 更新停滞 ⚠️              | ✅                  | 弱い               | 限定                        | `"use client"`                  | ✅                 | ~48万  |
| **Sortable.js**             | 小              | 活発 ✅                  | 不明                | 不明               | ✅                          | 要 wrapper                      | 要自前             | 多     |

※ react-beautiful-dnd は Atlassian 公式に「新規プロジェクト非推奨。pragmatic-drag-and-drop に移行せよ」と発表済み。

### M1b 観点での評価とトレードオフ

**重さ・突然の変更を嫌うユーザーへの影響:**

- `react-grid-layout` はバンドルが重く（~28.7KB）、かつ React Class Component ベースの `react-draggable` に依存しているため Next.js App Router で SSR 不可（`next/dynamic + ssr:false` が必要）。a11y も弱い。
- `react-beautiful-dnd` は非推奨で React 19 対応保証なし。長期メンテ観点で選択すべきでない。
- `@dnd-kit/core + @dnd-kit/sortable` はコアが ~6KB + ~3KB の計 ~9KB gzip で軽量。TypeScript ネイティブ、WCAG 2.1 AA 対応、タッチ・キーボード・ポインターすべてサポート。GitHub Stars 17,000+、2026年4月にも更新が確認されており最もメンテが活発。

### 最終推奨: `@dnd-kit/core + @dnd-kit/sortable`

理由:

1. バンドルが軽量（合計 ~9KB gzip）でリピーター体感速度への悪影響を最小化
2. a11y（キーボード操作・スクリーンリーダー）が充実しており将来対応コストが低い
3. TypeScript ネイティブで型安全性が高い
4. Next.js App Router では `"use client"` 指定が必要だが、ドラッグ対象コンポーネントを Client Component の末端に限定することで SSR の恩恵を最大化できる
5. Linear、Vercel 等が本番採用しており信頼性が高い
6. React 19 / Next.js 15 向けの互換修正が 2025〜2026 年に実施済み（`@dnd-kit/react` という新パッケージが `DragDropProvider` ベースで整備中）

**タイルサイズ可変への対応:**
`@dnd-kit` 単体では可変サイズグリッドのロジックは内蔵していない。CSS Grid の `grid-column: span N` を組み合わせて座標ベースのレイアウトを自前で管理するか、`react-grid-layout` を採用する選択になる。フェーズ1が「固定サイズのタイルを並べる」だけで完結するなら `@dnd-kit` で十分。可変サイズが必須要件になる場合は `react-grid-layout` の追加検討が必要（ただしバンドルと SSR 制約を受け入れる必要がある）。

---

## C. localStorage によるレイアウト永続化のベストプラクティス

### データスキーマ設計

```typescript
interface ToolboxLayout {
  schemaVersion: number; // 必須: マイグレーション用バージョン番号
  tiles: TileConfig[]; // タイル配置情報
  updatedAt: string; // ISO 8601 タイムスタンプ
}

interface TileConfig {
  id: string; // ツール識別子
  order: number; // 表示順序
  size?: "small" | "medium" | "large"; // タイルサイズ（フェーズ2以降用に予約）
}
```

**スキーマバージョン番号は必ず初日から含める。** 後から追加することも技術的には可能だが、バージョン番号がない状態のデータを「バージョン0」と解釈するマイグレーション処理が必要になり複雑化する。

### マイグレーション戦略

マイグレーション関数を版ごとに独立して管理するパターンが推奨される（参照: Jan Monschke）。

```typescript
type Migration = (data: unknown) => unknown;

const migrations: Record<number, Migration> = {
  1: (data) => ({ ...(data as object), tiles: [] }), // v0 -> v1
  2: (data) => ({
    // v1 -> v2
    ...(data as ToolboxLayoutV1),
    updatedAt: new Date().toISOString(),
  }),
};

function migrate(
  data: unknown,
  fromVersion: number,
  toVersion: number,
): unknown {
  let current = data;
  for (let v = fromVersion + 1; v <= toVersion; v++) {
    current = migrations[v](current);
  }
  return current;
}
```

各マイグレーション関数は「1バージョン分の変換のみ」を担当することで、テスト容易性と可読性が大幅に向上する。

### 容量制限（5MB）と圧縮の必要性

- タイル配置データ（ツールID・順序）のみなら 100 タイル程度で数KB以下。圧縮は**フェーズ1では不要**。
- ユーザーが自由にメモ等を入力したり大量のカスタム設定を保存する場合は lz-string 等での圧縮検討が必要（実績: 6.5MB → 1MB に約85%削減）。
- 保険として `navigator.storage.estimate()` で残量確認、`QuotaExceededError` のハンドリングは必須実装。

### 読み取り失敗・破損データのフォールバック

```typescript
function loadLayout(): ToolboxLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw);
    return validateAndMigrate(parsed);
  } catch {
    // JSON破損・スキーマ不正時はデフォルトに戻す
    console.warn("Layout data corrupted, falling back to default");
    return DEFAULT_LAYOUT;
  }
}
```

### 別タブとの同期（storage イベント）

- `useSyncExternalStore` フック（React 18+）が localStorage とタブ間同期の現代的標準。
- `storage` イベントは**他タブの変更のみ**発火するため、現在タブでの変更後に `window.dispatchEvent(new StorageEvent('storage', ...))` を手動発火する必要がある。
- フェーズ1の「道具箱」用途では複数タブ同時編集のシナリオは稀。**実装優先度は低い**が、将来のシェア機能との連携を考えて `useSyncExternalStore` パターンでの実装を推奨。

---

## D. hidden（noindex）検証環境

### Next.js App Router での開発者専用ページ設計

3層の防御を組み合わせるのがベストプラクティス。

#### 層1: metadata で robots noindex 指定（SEO 対策）

```typescript
// app/(sandbox)/sandbox/page.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

**効果範囲:** `<meta name="robots" content="noindex, nofollow">` タグが出力され、Googlebot 等が当該ページをインデックスしない。ただし「クローラーへのお願い」であり、悪意あるアクセスは防げない。

#### 層2: robots.txt でクロールを明示的に拒否

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/sandbox/" }],
  };
}
```

#### 層3: Next.js App Router のルートグループ・プライベートフォルダ（URL 制御）

- `(sandbox)` ルートグループ: URL に影響を与えずに layout を分離する。`/sandbox/toolbox` のような URL 構造にできる。
- `_sandbox` プライベートフォルダ: ルーティングから完全除外（URL として存在しない）。コンポーネントの配置場所として使用。

**推奨ディレクトリ構造:**

```
app/
  (sandbox)/
    sandbox/
      page.tsx  ← metadata.robots: noindex
      toolbox-preview/
        page.tsx
```

#### 追加オプション: 環境変数によるアクセス制御

本番環境でも一応 URL へのアクセスは可能なため、`NEXT_PUBLIC_SANDBOX_ENABLED !== 'true'` のときは 404 を返す処理を追加すると安全。

```typescript
// app/(sandbox)/sandbox/page.tsx
export default function SandboxPage() {
  if (process.env.NEXT_PUBLIC_SANDBOX_ENABLED !== "true") {
    notFound();
  }
  // ...
}
```

---

## 総合推奨サマリー

| 領域                 | 推奨                                               | 根拠                                           |
| -------------------- | -------------------------------------------------- | ---------------------------------------------- |
| ライブラリ           | `@dnd-kit/core + @dnd-kit/sortable`                | 軽量(~9KB)、a11y完備、TS native、活発なメンテ  |
| 編集モード設計       | 明示的トグルボタン型（2モード分離）                | M1bの誤操作・突然変更を防ぐ、NN/g推奨パターン  |
| 初回オンボーディング | 空状態に CTA + 説明文（データシーディング検討）    | 空画面放置はユーザー離脱の最大要因             |
| schema               | `schemaVersion` フィールドを初日から必須           | 後からの追加は複雑化する                       |
| マイグレーション     | バージョン別独立関数 + 再帰的 migrate()            | テスト・保守性が大幅に向上                     |
| 容量                 | フェーズ1は圧縮不要、QuotaExceededErrorは必須対応  | タイル配置データのみなら5MB超えは現実的でない  |
| タブ同期             | useSyncExternalStore パターン推奨、優先度は低      | 将来のシェア機能を見据えた設計                 |
| hidden 検証環境      | robots noindex + robots.txt + 環境変数ガード の3層 | noindex のみでは不十分。URL アクセスは防げない |
