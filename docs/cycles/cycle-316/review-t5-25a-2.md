# T5-25a レビュー 2回目（コミット 2a1cc94 と f53c252）

## 判定: 承認

前回（`review-t5-25a.md`）の指摘 1・2 は直っており、PM に申し送った 3 も片づいている。T5-25a 全体を読み直しても、新しい問題は見つからなかった。

## 前回の指摘の確認

### 1. `scripts/generate-release-id.ts` のヘッダー

- 参照先 `src/components/GoogleAnalytics/index.tsx` はある。24行目で `gtag('config', …, { release: RELEASE_ID })` を呼んでいて、コメントのとおり。
- 参照先 `docs/archive/visitor-value-measurement.md` もあり、181行目に「論点4. GA4 記録スキーマ」がある。
- フックの並びは prebuild/predev/pretest/pretypecheck の4つで、`package.json` の6〜9行目と同じ。
- 過去の作業者に宛てた申し送りは消え、代わりに「config の呼び出しで全イベントに付くので、`src/lib/analytics.ts` の per-event params は `release` を持たない」といまの事実として書いてある。`src/lib/analytics.ts` に `release` は0件で、書いてあることと合っている。宛名も経緯も残っていない。

### 2. `docs/knowledge/codegen-patterns.md`

- 落とし穴が「ソースを glob で発見して生成物を書き出す codegen」という条件つきで書かれている。冒頭の「現行は `generate-release-id.ts`」（glob を使わない）と並べても、release-id にこの落とし穴があるとは読めない。
- フックに pretypecheck が入って4つになった。見出しの「1.」も外れている。
- 「単独の `npx tsc --noEmit` は prebuild を回さない」はいまも正しい（`npm run typecheck` なら pretypecheck が回るが、本文は `npx tsc` の話に限っている）。

### 3. `docs/knowledge/animation-conventions.md` の削除

中身がいまのコードに当てはまらないことを、節ごとに確かめた。

- §1「タイルは CSS Modules 使用不可（codegen 制約）」: 間違い。`LineBreakRemoverTile.tsx` は `LineBreakRemoverTile.module.css` を import している。その制約のもとだった codegen はもうない。
- §2 `joinStyleFadeIn` / `key={mode}`: `src/` に `joinStyleFadeIn`・`_KEYFRAMES` は0件。line-break-remover に animation の指定はもうない。
- §3 reduced-motion を `useState` の遅延初期化で `window.matchMedia` から読む形: いまのコード（`UnixTimestampTile.tsx` 91〜110行目）は水和のあとに `useEffect` の中で読んでいる。遅延初期化の形は、サーバー側では false、クライアントの最初の描画では true になりうるので、水和の不一致を招く。残しておくと誤った手本になるので、消すのが正しい。reduced-motion を尊重するという決まり自体は、この知見ファイルがなくても WCAG とデザインの決まりで成り立つ。
- §4「`grid-template-rows` の高さトランジションを禁止」: 出典は cycle-209 のレビューでの判断で、フレームワークの落とし穴として確かめられたものではない。いまこれを頼りにしているコードもない（`grid-template-rows` を使っているのは irodori の静的な指定1か所だけ）。

参照の残り: `tmp/` を除くと、`docs/cycles/`（cycle-209・210・218・219・311・312）にしかない。どれもその時点の記録なので直さなくてよい。`docs/README.md` の knowledge 一覧、`.claude/`、`src/`、`scripts/` からの参照は0件。

## 全体の読み直し（2a1cc94 + f53c252）

- `src/tools/registry.ts`: import 36本と `toolEntries` 36行が `src/tools/*/meta.ts` と一致する。ヘッダーは足すときの手順と、それを確かめる試験だけを書いている。
- `src/tools/__tests__/registry.test.ts`: ディレクトリの集合との一致、件数36、slug の重複なし。登録し忘れ・名前違い・消したツールの残りのどれも落ちる。
- 生成への参照の残り（`generate-toolbox-registry`・`generate:toolbox-registry`・`tools/generated`・`buildToolsRegistryContent`）: `docs/cycles`・`docs/archive`・`docs/research`・ブログ・`tmp/` を除いて0件（AP-I13）。
- `npx vitest run scripts src/tools src/lib/__tests__/site-metadata.test.ts`: 86ファイル・2031件がすべて通る。
- `npx prettier --check`（変更したファイル）: 通る。`npx eslint`（registry.ts・registry.test.ts・generate-release-id.ts）: 指摘なし。
- ビルドは指示どおり回していない（ほかの作業がツリーを使っているため）。

## PM への申し送り（この判定には影響しない）

- animation-conventions.md を消した判断と理由（上の §1〜§4）は、いまはコミットメッセージにしかない。cycle-316 の index に一行残しておくと、あとで経緯をたどれる。
- `docs/README.md` の knowledge の節は、「日付つきのファイル名・既存ファイルを更新しない」という運用ルールと、並べているファイル（4本だけ）が、実際のディレクトリ（日付のない10本・更新あり）と合っていない。T5-25a より前からある食い違いなので、バックログに載せる。
