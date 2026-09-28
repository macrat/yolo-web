# Next.js 固有の技術知見

このプロジェクト（Next.js の App Router と Turbopack）で確かめた、Next.js とその周辺（ビルド・開発サーバー・水和・Vercel への配備）の非自明な動作と対処。各項の末尾の「根拠」に、実測・確認・推論の別と、根拠になったサイクルを書く。

---

## 1. 専用ルートを足したあとの開発サーバーは、動的ルートで描いてしまう

動的ルート（`/play/[slug]/result/[resultId]/`）と同じ階層に専用ルート（例: `/play/animal-personality/result/[resultId]/`）を足しても、起動したままの開発サーバーは専用ルートではなく動的ルートで描く。本番のビルドでは専用ルートが使われるので、開発サーバーでは正しく動いているように見えて本番と違う画面を確かめることになる。

**対処**: 専用ルートを足したあとの見た目の確認やレビューは、`npm run build && npx next start` で本番のビルドを起動して行う。

**根拠**: 実測（cycle-149 で動的ルートで描かれ、開発サーバーの再起動で解消した。cycle-150 で本番のビルドでは専用ルートで描かれることを確かめた）。原因をルーティングの表がビルドのときに作られるためとするのは推論。

---

## 2. 共有の Client Component から巨大なデータを静的に import しない

`"use client"` の共有コンポーネント（例: `src/play/quiz/_components/ResultCard.tsx`）から巨大な JSON やデータのモジュールを静的に import すると、そのデータがそのコンポーネントを使う全ページのクライアントのバンドルに入り、`src/__tests__/bundle-budget.test.ts` の予算を超える。

**対処**:

- データは親の Server Component で選び、props で渡す
- コンポーネント自身が必要とする場合は dynamic import でコードを分ける

**根拠**: 実測（cycle-153 で `ResultCard.tsx` がクイズのデータを import して `/play/[slug]` が 149KB になり予算の 140KB を超え、props に替えて収めた。cycle-107・108 で `GameContainer.tsx` が全パズルのデータを静的に import してクライアントに送っていたのを、`page.tsx` で当日の分だけ選んで渡す形に替えた）。

---

## 3. 値を外から渡す CSS カスタムプロパティにはフォールバック値を付ける

インラインスタイルや props から渡す前提の CSS 変数（`var(--type-color)` 等）にフォールバック値が無いと、値が渡らなかったとき（props の未設定など）に宣言が無効になる。そのプロパティは、継承するもの（`color`）は親の値に、継承しないもの（`background-color`・`border-color`）は初期値（透明・`currentColor`）になり、地と文字の組み合わせが崩れて文字や背景が見えなくなる。

**対処**: `var(--type-color, #374151)` のようにフォールバック値を付け、ダークでも見えることを確かめる。

**根拠**: 推論（CSS の仕様から。cycle-150 のレビューで指摘され、cycle-151・153 の実装で適用した）。

---

## 4. 端末の値で初期表示を決める Client Component は、水和で食い違う

`useState` の初期化関数で `localStorage`・`Math.random()`・`typeof window` を使うと、サーバーで描いた出力とクライアントの最初の描画が食い違い、水和の不一致になる。React の警告、画面のちらつき、クライアントでの描き直しによる遅れが出る。`suppressHydrationWarning` は警告を消すだけで食い違いと描き直しは残るので、対処にならない。

**対処**: サーバーと水和の最初の描画では同じ値（`null` など）を描き、端末の値は水和のあとに当てる。形は2つある。

- **`useSyncExternalStore`**: 第3引数の `getServerSnapshot` が `null` を返すと、React はサーバーと水和のあいだその値で描き、水和のあと `getSnapshot` の値で描き直す。`getSnapshot` は値が変わらないあいだ同じ参照を返す（毎回新しい値を返すと描き直しが止まらない）。用例は `src/play/fortune/fortuneStore.ts` と `src/components/hooks/useIsServerRendered.ts`。
- **`useState(null)` と `useEffect`**: 水和のあとの `useEffect` で端末の値を読んで state に入れる。eslint-config-next が有効にする `react-hooks/set-state-in-effect` がこの `setState` をエラーにするので、外の値を水和のあとに読むためだと理由を添えて、その行だけ無効にする（用例は `src/play/games/nakamawake/_components/GameContainer.tsx`）。

```tsx
// NG: サーバーとクライアントで初期値が違う
const [fortune, setFortune] = useState(computeFortune);

// OK: サーバーと水和では null、水和のあとに端末の値で描く
const fortune = useSyncExternalStore(subscribe, getSnapshot, () => null);
```

**根拠**: 食い違いは実測（cycle-83・106 のナカマワケ、cycle-127 の運勢、cycle-158 の `Math.random()`、cycle-217 では curl で取ったサーバーの HTML の色が取るたびに変わった）。`useSyncExternalStore` の形は、cycle-127 の修正で使ったもの（実測）。lint の規則がエラーになることは、`npx eslint --print-config` の出力で確認（cycle-316）。

---

## 5. Server Component の `new Date()` は、静的に描かれるとビルドの日付で固まる

Server Component（`page.tsx`）で `new Date()` を呼んでも、そのページが静的に描かれるとビルドのときの日付で固まる。日替わりの内容を出すページで問題になる。

**対処**: 日替わりの内容を出すページには `export const dynamic = "force-dynamic"` を置き、リクエストごとに描く（用例は `src/app/play/nakamawake/page.tsx`・`src/app/play/irodori/page.tsx`）。Server Component は実行するマシンのシステムのタイムゾーン（UTC など）で動くので、日本時間の日付は `Intl.DateTimeFormat` に `timeZone: "Asia/Tokyo"` を渡して求める。

**根拠**: 推論（Next.js の静的レンダリングの仕様から。cycle-106 でタイムゾーン未指定の `new Date()` が日本時間とずれる原因だと突き止め、cycle-108 で `force-dynamic` と `timeZone` の指定を入れた）。

---

## 6. Vercel の ISR のペイロードは 19.07MB が上限

Vercel に配備するとき、ISR のペイロードの上限は 19.07MB。一覧ページで全件の本文の HTML（`contentHtml`）を含むデータを返すと超える。

**対処**: 一覧ページには一覧に要るフィールドだけの型（Summary 型）を定義し、本文などをサーバーの側で外してからクライアントに送る。

**根拠**: 実測（cycle-67 で memos の一覧ページが 24.86MB になって配備が失敗し、Summary 型に絞って 1.1MB に下がった）。

---

## 7. Next.js 16 では `middleware.ts` は deprecated で、`proxy.ts` への名前の変更が勧められている

Next.js 16 では `middleware.ts` のファイルの規約が deprecated になり、`proxy.ts` が勧められている。Next.js 16.3.0 は `middleware.ts` があると、ビルドと開発サーバーで `The "middleware" file convention is deprecated. Please use "proxy" instead.` と警告し、移すための codemod（`npx @next/codemod@canary middleware-to-proxy .`）を案内する。`middleware.ts` と `proxy.ts` の両方があるとエラーで止まる。このプロジェクトは `src/middleware.ts`（削除した記事に 410 を返す）を使っていて、まだ `proxy.ts` に移していない。

**根拠**: 確認（deprecated であることは cycle-89 で `middleware.ts` を作ったときに確かめた。警告の文言と両方あるときのエラーは、cycle-316 に Next.js 16.3.0 のソースの `node_modules/next/dist/build/index.js`・`server/lib/router-utils/setup-dev-bundler.js` で確かめた）。

---

## 8. 古い `next-server` が残っていると、古いビルドを配り続ける

dev・build・start を繰り返すと、`next-server` のプロセスが残ることがある。古いプロセスがポートで待ち受けていると、`.next/server/app/.../page.js` には最新のビルドがあるのに、そのプロセスは起動したときのビルドの出力（404 を含む）を `x-nextjs-cache: HIT`・`x-nextjs-prerender: 1`・`Cache-Control: s-maxage=31536000` の付いた応答で返し続け、変更が反映されない。止めるまで直らない。

**当たりやすいとき**:

- 新しいルートを足した直後
- 開発サーバーを長く起動したままにしたあと
- Playwright での確認で、原因のわからない 404 に当たったとき

**解消の手順**:

```bash
ps -eo pid,ppid,args | grep next-server   # 残っているプロセスを探す
kill <PID>                                # 自分が起動したものだけ止める
npm run build                             # 最新のコードでビルドし直す
npm run start &                           # 新しい next-server を起動する
curl -I http://localhost:3000/path        # 200 が返ることを確かめる
```

止めるのは、起動したときに控えた自分の PID か、`/proc/<pid>/cwd` が自分の作業ツリーを指すものに限る。`pkill -f next-server` は、同じコンテナで動くほかのエージェントのサーバーまで止める（`docs/knowledge/playwright-mcp.md` の「本番ビルドの実機検証の段取り」）。

**根拠**: 実測（cycle-177 で、確かめるルートが 404 を返し続けた原因が古い `next-server` の残存だった）。

---

## 9. Turbopack の `next build` は、ルートごとの First Load JS を出さない

Next.js 16 の `next build` の既定は Turbopack で、その出力には Webpack のビルドが出すルートごとの「First Load JS」の列が無い。ルートごとにバンドルの大きさを前後で比べる計画は、既定の `npm run build` では実行できない。

**対処**:

- `next build --webpack` で Webpack のビルドに切り替える（ルートごとの列が出る）
- `next build --experimental-analyze` で Turbopack 向けのバンドルの分析を使う
- ルートごとの比較が要らなければ、`.next/static/chunks/` の合計の大きさなどの粗い指標で代える

**根拠**: 列が出ないことは実測（cycle-185 で移行の前後の First Load JS を比べられず、`.next/static/chunks/` の合計 6.0MB を記録した）。2つのオプションが Next.js 16.3.0 にあることは `npx next build --help` の出力で確認（cycle-316）。`--webpack` で列が出ることは推論（このプロジェクトでは試していない）。

---

## 10. `"use client"` からサーバー専用のモジュールを import すると、ビルドが壊れるか、黙って client にバンドルされる

`"use client"` のコンポーネントが、サーバー専用の処理（`fs`・DB・Node の組み込み）を**推移的に**掴むモジュールを import すると、Turbopack がそれをクライアントのバンドルのモジュールグラフに入れようとして失敗する。エラーは `the chunking context (unknown) does not support external modules (request: node:fs)`。Node の組み込みを掴まないモジュール（大きい表を持つだけのものなど）は、エラーにならず、そのまま client のバンドルに入って来訪者に配られる。

非自明な肝は**トップレベルの副作用**にある。import 先のユーティリティがモジュールのトップレベルで `fs` の読み込みなどを実行していると、その関数を一度も呼ばなくても（コンポーネントを描くだけ・値として import するだけで）`fs` への依存が確定してグラフに載る。型だけの `import type` はトランスパイルで消えるので載らない。§2 は client で使うデータの読み込み方の問題で、本項は server だけで使うはずのモジュールが client の側に入る問題である。

**実例**: `"use client"` の storybook（`src/app/storybook/StorybookContent.tsx`）が `RelatedBlogPosts` を import すると、`@/lib/cross-links`（トップレベルで `getAllBlogPosts()` を実行）→ `@/blog/_lib/blog`（`node:fs` でマークダウンを読む）とたどってビルドが落ちる。

**対処**: サーバー専用の部品は親の Server Component で描き、Client Component には `ReactNode`（children や props）として渡す（Next.js 公式の "Interleaving Server and Client Components"）。渡した ReactNode は親（server）の側で評価されるので client のバンドルに載らない。`StorybookContent.tsx` は `RelatedBlogPosts` の描画結果をこの形で `src/app/storybook/page.tsx` から受け取る。

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

**予防**: サーバー専用のモジュールの先頭に `import "server-only"` を置くと、client から（間接的にでも）import されたときにビルドが止まる。Node の組み込みを掴まないモジュールでは、これが黙ってバンドルされるのを止める唯一の手になる。Next.js が解決するのでパッケージは要らない。vitest では解決できないので、`vitest.config.mts` の `resolve.alias` で `next/dist/compiled/server-only/empty.js` に向ける。`tsx` で動かすスクリプトは `server-only` を解決できないので、`server-only` を置いたモジュールを読み込めない。

止まったときのメッセージは、Next.js 16.3 の Turbopack では「client から server-only を読み込んだ」とは出ないことがある。そのモジュールに和文のコメントがあると、エラーの箇所のコードを抜き出して色付けする処理が和文の字の途中のバイトで切って落ち、`thread 'tokio-rt-worker' panicked at crates/next-code-frame/src/highlight.rs … end byte index 93 is not a char boundary; it is inside 'ダ'` と `[Error: Panic in async function]` だけが出る。この panic を見たら、Turbopack の不具合と決めつけず、`server-only` を置いたモジュールを `"use client"` の側から読み込んでいないかを先に確かめる。

この種の誤りは型チェックと単体テストでは表に出ず、`next build` で初めて落ちる。storybook のような開発者向けのページ（noindex）でも、client と server の境界は本番のビルドに効く。

**根拠**: 実測（cycle-224 で storybook の追加から混入し、`next build` まで数セッション気付かなかった。panic のメッセージは cycle-316 の `src/lib/phrase-breaks.ts` で再現した）。

---

## 11. `.next/dev/types/` の型ファイルが古いか壊れていると、commit と push の typecheck が落ちる

`tsconfig.json` の `include` には `.next/dev/types/**/*.ts` が含まれる。`next dev` はここに `validator.ts`（その時点の全ルートのファイルへの相対 import）と `routes.d.ts` を生成する。`.next/` は git の管理の外なので git status に出ず、`npm run build` は別の `.next/types/` を作り直して通るため、「build は通るのに commit や push だけが落ちる」形で現れる。壊れ方は2つある。

- **古いパス**: ルートの `page.tsx` を `git mv`（例: route group をまたぐ移動）すると、`validator.ts` が移動前のパスを参照したまま残り、`TS2307: Cannot find module '.../page.js'` で落ちる。
- **書きかけ**: `next dev` が、親のエージェントが終わったあとも動き続けていると（親プロセスが 1 になった孤児）、作業ツリーの変更に合わせて `routes.d.ts` を書き直し続け、途中の状態の `routes.d.ts` が `TS1146: Declaration expected`・`TS1161: Unterminated regular expression literal` で落ちる。

**対処**: 孤児の `next dev` とその子の `next-server` を止め（`ps -o ppid=` が 1 で、cwd がリポジトリのもの）、`rm -rf .next/dev/types` してから typecheck・commit・push する。ファイルが無ければ include の glob はマッチがゼロで、エラーにならない。

**予防**: ルートを移動・リネームしたあとは、`next dev` で確かめたあとに `rm -rf .next/dev` を挟んでから commit する。サブエージェントに開発サーバーを使わせるときは、終える前に自分の起動した `next dev` と子の `next-server` の両方を止めるよう指示する。

**根拠**: 実測（古いパスは cycle-265、書きかけは cycle-316）。

---

## 12. Turbopack の `next/font/google` は `adjustFontFallback: false` だけでは自動の代わりの書体を止めない

Next.js 16.3.0 の Turbopack のビルドでは、`next/font/google` に `adjustFontFallback: false` を渡しても、`"<書体名> Fallback"` の `@font-face`（`local("Times New Roman")` などにメトリクスを合わせたもの）が生成され、CSS 変数の値にもその名前が入る。`next/font/local` の `adjustFontFallback: false` は効く。

**影響**: 自動の代わりの書体は `unicode-range` を持たないので、読み込みのあいだ和文の中の「——」「……」まで欧文の書体で描かれる。

**対処**: `fallback: []` も一緒に渡す。Turbopack は `fallback` が指定されると自動の代わりの書体を作らず、変数の値は `"<書体名>"` だけになる。確かめるときは `npx next build --experimental-build-mode=compile` のあと、`.next/static/chunks/*.css` で `Fallback` を探す。

**根拠**: 実測（cycle-316）。

---

## 13. 404 の応答の題と robots は、`not-found.tsx` とページの `generateMetadata` の両方で決まる

404 を返すとき（`not-found.tsx` を描くとき）、Next.js は `<meta name="robots" content="noindex"/>` を自分で足す。このとき題と robots がずれる道が2つある。

- `not-found.tsx` の `metadata` が `robots` を書かないと、ルートのレイアウトの `metadata.robots`（このサイトでは `index, follow, max-image-preview:large`）も受け継がれ、robots の meta が2つ出る。`robots: { index: false }` を書いても、Next が足すものと `metadata` のもので `noindex` が2つになる。
- 動的ルートのページ本体が該当なしで `notFound()` を呼んでも、同じページの `generateMetadata` が該当なしで `{}` を返すと、サーバーの HTML は正しいまま、読み込みのあとに題がルートのレイアウトの既定（`yolos.net`）に変わり、robots がルートのレイアウトの `index, follow…` と `noindex` の2つになる。サーバーの HTML だけを見る確かめ方では見つからない。

**対処**: `not-found.tsx` の `metadata` に `robots: null` を書く。受け継いだ `robots` が消え、Next が足す `noindex` の1つだけが出る。ほかのページの `robots` は変わらない。あわせて、動的ルートの `generateMetadata` は、該当なしのときに `{}` を返さず `notFound()` を呼ぶ。そうすると読み込みのあとも `not-found.tsx` の題と `noindex` の1つが保たれる。確かめるときは本番のビルドを `next start` で起こし、404 の URL と通常のページについて、HTML の `<meta name="robots"` を数えるのに加え、実際のブラウザで開いて読み込みのあとの `document.title` と robots の meta を数える。

**根拠**: 実測（cycle-316。T5-22 の設計の調べ（`docs/cycles/cycle-316/t5-design.md` の 0-8）で、受け継いだときに2つ出ること、`robots: null` で `/zz-not-exist`・`/dictionary/kanji/zz`・`/tools/zz` の `noindex` が1つになり `/tools/base64` の `index, follow, max-image-preview:large` が変わらないことを確かめた。`robots: { index: false }` で `noindex` が2つになることは、同じ調べのレビューの再ビルドで確かめた。T5-22 の実装のビルドで、5つの 404 の URL の HTML の robots が `noindex` の1つだけであることを確かめた。T5-22b で、`generateMetadata` が `{}` を返すブログ・辞典・遊びの16ルートの 17 URL で、読み込みのあとに題が `yolos.net` になり robots が2つ並ぶことと、`notFound()` を呼ぶように直したあとは読み込みのあとも題が「ページが見つかりません | yolos.net」、robots が `noindex` の1つだけになることを確かめた）。
