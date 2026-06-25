# Next.js 固有の技術知見

このプロジェクト（Next.js App Router使用）で蓄積されたNext.js固有の非自明な動作と注意点をまとめたドキュメント。

---

## 1. 専用ルート追加後のdevサーバー再起動

Next.js App Routerはルーティングマニフェストをビルド時に生成する。新しい専用ルート（例: `/play/xxx/result/[resultId]/`）を追加した場合、devサーバーを再起動しないと動的ルート（`[slug]`）がそのままレンダリングされる偽陽性が発生する。

**影響**: devサーバー上での確認結果が本番と異なる。専用ルートが動的ルートにフォールバックしているのに正常動作しているように見える。

**対処**: 専用ルート追加後のビジュアル確認やレビューは `npm run build && npx next start` で本番ビルドのサーバーを起動して行うこと。devサーバーでは確認不可。

出典: cycle-149, 150, 151, 152, 153

---

## 2. 共有コンポーネントからの巨大データの静的インポート禁止

`"use client"` の共有コンポーネント（例: `ResultCard.tsx`）から巨大なJSONデータを静的importすると、そのデータが全ページのクライアントバンドルに含まれてバンドルバジェットを超過する。

**影響**: `/play/[slug]` のようなページが149KB → バジェット超過（cycle-153で実際に発生）。

**対処**:

- データはpropsで親（Server Component）から渡す
- コンポーネントが必要とする場合はdynamic importでコード分割する

出典: cycle-107, 108, 148, 152, 153

---

## 3. CSSカスタムプロパティのフォールバック値

CSS変数（`var(--type-color)` 等）にフォールバック値を設定しないと、SSR時やpropsが未設定のときに値が透明・未定義になりテキストが消えたり背景が見えなくなる問題が発生する。

**対処**: 常に `var(--type-color, #374151)` のようにフォールバック値を設定すること。ダークモードでも視認性を確認すること。

出典: cycle-147, 148, 150, 151, 153

---

## 4. localStorageを参照するClient Componentのハイドレーション不整合

`useState` の初期化関数内で `localStorage` や `typeof window` を参照すると、SSRとクライアント初回レンダリングの出力が異なりハイドレーションエラーが発生する。

**影響**: Reactのハイドレーション警告、画面のちらつき（フラッシュ）、クライアントサイド再レンダリングへのフォールバックによるパフォーマンス低下。

**対処**: `useState<T>(null)` で初期値をnullとし、`useEffect` 内でlocalStorageから読み込んでstateを更新する。SSR時とHydration時に同じ（null）出力となり不整合が解消される。

```tsx
// NG: SSRとクライアントで初期値が異なる
const [fortune, setFortune] = useState(computeFortune);

// OK: SSR/Hydration時はnull、マウント後に計算
const [fortune, setFortune] = useState<Fortune | null>(null);
useEffect(() => {
  setFortune(computeFortune());
}, []);
```

`suppressHydrationWarning` は根本解決ではなく、不整合自体が残りパフォーマンス低下が解消されないため採用しないこと。

出典: cycle-83, 106, 127, 158

---

## 5. Server Componentで `new Date()` を使うと静的レンダリング時にビルド時の日付で固定される

Server Component（`page.tsx`）で `new Date()` を呼び出すと、Next.jsの静的最適化によりビルド時の日付が固定される。日替わりコンテンツを提供するページで問題になる。

**対処**: 日替わりコンテンツを扱うServer Componentには `export const dynamic = "force-dynamic"` を設定してリクエストごとに実行されるようにする。

また、Server Componentはビルドマシンのシステムタイムゾーンで実行されるため、JSTの日付計算が必要なときは `Intl.DateTimeFormat` を使って明示的にタイムゾーンを指定すること（`timeZone: "Asia/Tokyo"`）。

出典: cycle-106, 108

---

## 6. ISRペイロードの上限（Vercel）

Vercelにデプロイする場合、ISRペイロードの上限は19.07MB。一覧ページで全件の本文HTML（`contentHtml`）を含むデータを返すと超過する（cycle-67でmemosページが24.86MBに達してデプロイ失敗）。

**対処**: 一覧ページには一覧表示に必要な最小限のフィールドのみを含む型（Summary型）を定義し、本文や不要なフィールドをサーバー側で除外してからクライアントに送る。

出典: cycle-67

---

## 7. Next.js 16でmiddleware.tsはdeprecated

Next.js 16では `middleware.ts` はdeprecatedとなり `proxy.ts` へのリネームが推奨されている。

2026-05時点で当プロジェクトはすでに **Next.js 16.2.3 を使用中**であり、`src/middleware.ts` も依然として存在している。これは「将来の課題」ではなく**現在対応が必要な状態**。`proxy.ts` への移行作業が必要。

出典: cycle-89

---

## 8. 古い next-server プロセスの残存によるキャッシュ提供問題

dev/build/start を繰り返すと、複数の `next-server` プロセスが残存することがある。古いプロセスが port 3000 を listen していると、最新ビルドの変更が反映されず、`x-nextjs-cache: HIT` + `x-nextjs-prerender: 1` ヘッダ付きで古いキャッシュ（404を含む）を返し続ける。`Cache-Control: s-maxage=31536000` の TTL があるため、最大1年間キャッシュされ続ける。

**ファイル系統と挙動の乖離**: `.next/server/app/(new)/.../page.js` には最新ビルド成果物が存在するのに、port 3000 で listen している next-server は古いビルド時点のキャッシュを保持している、という乖離が起きる。

**該当タイミング**:

- 新しいルートを追加した直後
- 開発中に長時間 dev server を立ち上げっぱなしにした後
- Playwright実機検証で原因不明の404に遭遇した時

**解消手順**:

```bash
pkill -f "next-server"     # 古いプロセスを全 kill
npm run build              # 最新コードで再ビルド
npm run start &            # 新しい next-server を起動
curl -I http://localhost:3000/path  # HTTP 200 を確認
```

出典: cycle-177 (2026-05発見)

---

## 9. Next.js 16 Turbopack デフォルト化と per-route First Load JS 出力欠落

Next.js 16 系（本プロジェクトでは 16.2.4）から `next build` のデフォルトが Turbopack になった。Turbopack ビルドの出力には Webpack のような per-route の "First Load JS Size" カラムが出ない。

**影響**: バンドルサイズ比較を per-route 単位で行う計画（移行前後の First Load JS 差分など）が、デフォルトの `npm run build` では実行不能になる。cycle-185 B-334-4-7 で発覚。

**対処**:

- per-route 単位で比較したい場合は `next build --webpack` で Webpack mode に切り替える（per-route First Load JS Size カラムが復活する）
- または `next build --experimental-analyze` で Turbopack 互換の bundle analyzer を起動する
- 比較が必須でない場合は `.next/static/chunks/` 合計サイズなどの粗いメトリクスで代替する

出典: cycle-185

---

## 10. next-themes（attribute=class）環境での Playwright ダークモード撮影

next-themes を `attribute="class"` + `enableSystem` で使うサイト（`<html class="dark">` でダーク適用）では、Playwright の `page.emulateMedia({ colorScheme: 'dark' })` **単独**ではダークテーマが確実に適用されない。

**原因**: next-themes はハイドレーション後に `localStorage['theme']` を読んでクラスを付与する。`emulateMedia` は OS の `prefers-color-scheme` を変えるだけなので、`defaultTheme="system"` 時はページロード順や Next.js のキャッシュ最適化によって silent-light（見た目は light なのにファイル名だけ dark）になる場合がある。

**確実な dark 撮影手順**:

1. `context.addInitScript(() => { localStorage.setItem('theme', 'dark'); })` を `browser.newContext()` 直後（`page.goto` より前）に呼んで、localStorage を事前注入する
2. `page.emulateMedia({ colorScheme: 'dark' })` を `page.goto` より前に呼ぶ（保険）
3. `page.goto` 後に `page.waitForFunction(() => document.documentElement.classList.contains('dark'))` で `<html class="dark">` の付与を確認してから撮影する

**失敗検知の二重化**: `waitForFunction` がタイムアウトした場合は、ファイル名を `_dark-FAILED` にして保存し、かつ `process.exit(1)` で非ゼロ終了する。これにより「ログを見落とした silent-light」を構造的に防げる。

出典: cycle-216 B-463（T-2 レビュー派生 / NIT-1・NIT-2）

---

## 11. `"use client"` から server 専用部品（推移的に node:fs を掴むもの）を import するとビルドが壊れる

`"use client"` なコンポーネントが、サーバー専用処理（`fs`・DB・Node 組み込み）を **推移的に** 掴むモジュールを import すると、Turbopack がそれをクライアントバンドルのモジュールグラフに含めようとして失敗する。エラーは `the chunking context (unknown) does not support external modules (request: node:fs)`。

非自明な肝は **トップレベル副作用** にある。import 先のユーティリティがモジュールのトップレベルで `fs` 読み込み等を実行していると、その関数を一度も呼ばなくても（コンポーネントを描画するだけ・値として import するだけで）`fs` 依存が確定してグラフに載る。型のみの `import type` はトランスパイル時に消去されるので載らない（「関数を呼ぶつもりがない値 import」と「型としてしか使わない import」は別物で、前者は載り後者は載らない）。セクション2（巨大データの静的インポート）はバンドル「サイズ」の問題だが、本項は client バンドルが Node 組み込みを解決できずビルド「可否」として落ちる点が異なる。

**実例（cycle-224）**: `"use client"` の storybook（`StorybookContent.tsx`）が `RelatedBlogPosts` を import → `@/lib/cross-links`（トップレベルで `getAllBlogPosts()` を実行）→ `@/blog/_lib/blog`（`node:fs` でマークダウンを読む）。

**対処**: サーバー専用部品は Server Component（親）で描画し、Client Component には `ReactNode`（children/props）として注入する（Next.js 公式 "Interleaving Server and Client Components"）。注入された ReactNode は親（server）側で評価されるので client バンドルに載らない。

```tsx
// page.tsx (Server Component)
export default function Page() {
  return <ClientShell serverSlot={<ServerOnlyComponent />} />;
}
// ClientShell.tsx ("use client") — ServerOnlyComponent を import せず prop で受ける
function ClientShell({ serverSlot }: { serverSlot: React.ReactNode }) {
  return <div>{serverSlot}</div>;
}
```

**予防**: サーバー専用モジュールの先頭に `import "server-only"` を置くと、client から（間接的にでも）import された瞬間に明確なビルドエラーで弾ける。難解な `node:fs` エラーより早く・正確に検出できる。

**検証タイミングの教訓**: この種のバグは型チェック・単体テストでは表面化せず `next build` で初めて落ちる。storybook 等の開発者向けページ（noindex）でも client/server 境界は本番ビルドに効く。ページやコンポーネントを追加したら、早い段階で `npm run build` を一度通して潜在バグを最短で顕在化させること（cycle-224 では build 確認が後回しになり、storybook 追加時に混入した本バグが数セッション潜在した）。

出典: cycle-224

---

## 12. ルートファイルを `git mv` した後、stale な `.next/dev/types/validator.ts` が pre-commit の typecheck を壊す

`tsconfig.json` の `include` には `.next/dev/types/**/*.ts` が含まれる。`next dev` を実行すると Next.js が `.next/dev/types/validator.ts` を生成し、これが**その時点の全ルートファイルへの相対 import を持つ**。デザイン移行などでルートの `page.tsx` を `git mv`（例: `(legacy)/dictionary/kanji/` → `(new)/dictionary/kanji/`）すると、この validator.ts が**移動前の旧パスを参照したまま残り**、`tsc --noEmit` が `TS2307: Cannot find module '.../(legacy)/.../page.js'` で落ちる。

**影響**: `npm run build` は `.next/types/`（dev とは別系統）を再生成して通るのに、pre-commit フック（`tsc --noEmit`）だけが stale な `.next/dev/types/validator.ts` を拾って失敗する。「build は通るのに commit できない」という一見矛盾した状態になる。`.next/` は git 管理外なので git status にも出ず原因が見えにくい。

**対処**: `rm -rf .next/dev` で stale な dev 型キャッシュを削除してから typecheck/commit する（次回 `next dev` 起動時に正しいパスで再生成される）。`.next/dev/types/**` は include の glob なので、ファイルが無ければマッチゼロでエラーにならない。

**予防**: ルート（`app/` 配下の `page.tsx`/`layout.tsx` 等）を移動・リネームしたら、視覚検証で `next dev` を使った後は `rm -rf .next/dev` を挟んでから commit する。辞典移行（cycle-262〜265）のように route group をまたぐ `git mv` を伴う作業では定常的に発生する。

出典: cycle-265
