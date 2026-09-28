# T5-25a レビュー（コミット 2a1cc94）

## 判定: 改善指示

本体（登録簿の手書き化・生成の撤去・試験）は正しく、受け入れ条件も満たしている。直すべき点は、builder が行の外で触ったファイル2つに残っている古い記述だけで、どれも小さい。

## 確かめたこと（問題なし）

- `src/tools/registry.ts`: 直前の `src/tools/generated/tools-registry.ts` と diff を取った。違いはヘッダーのコメントと末尾の件数コメントだけで、import 36本・`toolEntries` の並び・`toolsBySlug` / `allToolMetas` / `getAllToolSlugs` の定義は同じ。export の名前も振る舞いも変わっていない。ヘッダーのコメントは「足すときの手順と、それを確かめる試験」だけを書いていて、過去の経緯は残っていない。
- 36本がそろっている。`src/tools/*/meta.ts` と同じ。
- `src/tools/__tests__/registry.test.ts`: `src/tools/` の直下で `meta.ts` を持つディレクトリの名前と `getAllToolSlugs()` を並べ替えて突き合わせている。これで「meta.ts を作ったのに登録し忘れた」「ディレクトリ名と slug が違う」「消したツールが登録に残っている」のどれも落ちる。重複の試験で、同じ meta の二重登録も落ちる。件数の 36 を書いてあるのは受け入れ条件（36本の一致）どおり。
- `package.json`: prebuild・predev・pretest・pretypecheck の4つとも `generate:release-id` だけを呼ぶ形になり、`generate:toolbox-registry` は消えている。`fast-glob` はほかの試験（`src/test/design-gate.test.ts` など）が使っているので、依存に残してよい。
- 生成への参照の残り: `rg` で `.github/`・`vercel.json`・`.gitignore`・設定ファイル・`docs/`（cycles・ADR・archive・research・ブログを除く）を探し、`generate-toolbox-registry`・`generate:toolbox-registry`・`tools/generated`・`buildToolsRegistryContent` は0件。archive と research に残っているのは、その時点の記録なので直さなくてよい。
- 「道具箱」: `src/`・`scripts/` で、公開済みのブログ記事2本（`2026-06-12-top-page-toolbox-launch.md`・`2026-07-13-design-token-migration-build-blind-spots.md`）のほかは0件。
- `src/lib/__tests__/site-metadata.test.ts`: 「道具箱」を含まない、という確認が「"ツール" を含むキーワードは2つまで」に変わった。「実用層のオンライン道具にも少数だけ触れていること」というコメントの意図（道具を中心とするサイトと読まれない）を、いまのキーワード（オンラインツール・便利ツール）に即して保っていて、前の確認より強い。
- 行の外の変更のうち2つは正しい: `scripts/__tests__/generate-toolbox-registry.test.ts` の削除（生成スクリプトが消えれば import 先がなくなる）と、`scripts/generate-release-id.ts` のコメントから、消したスクリプトと比べていた一文を除いたこと。
- `npx vitest run src/tools scripts src/lib/__tests__/site-metadata.test.ts`: 86ファイル・2031件がすべて通る。`npx tsc --noEmit`: エラーなし（終了コード0）。

## 指摘

### 1. `scripts/generate-release-id.ts` のヘッダーコメントに、古いパスと過去の申し送りが残っている（builder が今回触った同じコメントの中）

- 8行目 `(see src/components/common/GoogleAnalytics.tsx)`: このファイルはない。いまは `src/components/GoogleAnalytics/index.tsx`。
- 27行目 `docs/visitor-value-measurement.md 論点4`: いまは `docs/archive/visitor-value-measurement.md`。
- 34〜37行目「申し送り（波2 builder 向け）: …」: 過去のサイクルの作業者に宛てた申し送りで、ツギハギにあたる。中身（`release` を event params に二重に積まない）がいまも守るべき決まりなら、宛名を外して決まりとして書き直す（置き場所は、この決まりに従う側の `src/lib/analytics.ts` が自然）。もう要らないなら消す。

builder はこのコメントを直すために開いたので、CLAUDE.md の「見つけたツギハギはその場で直す」に従ってここで一緒に直す。

### 2. `docs/knowledge/codegen-patterns.md` の落とし穴の節が、消したスクリプトの仕組みをいまの codegen 一般の性質のように書いている

- 9行目「prebuild/predev/pretest フックの codegen は、…glob で発見した `meta.ts` を元に生成物を書き出すため」: いまの codegen（`generate-release-id.ts`）は glob も `meta.ts` も使わない。冒頭で「現行は `scripts/generate-release-id.ts`」と書いた直後なので、読み手は release-id にもこの落とし穴があると読み違える。「ソースを glob で発見して生成物を書き出す codegen は、…」のように、当てはまる codegen の条件として書き直す。
- 同じ行のフックの並びに `pretypecheck` が抜けている（package.json は4つ）。並べるなら4つにする。
- 節が1つだけになったので、見出しの「1.」は外してよい（任意）。

### 3.（PM への申し送り。この行で直さなくてよい）`docs/knowledge/animation-conventions.md`

冒頭が「タイルコンポーネントは CSS Modules 使用不可（codegen 制約）」になっている。タイルとその codegen は cycle-225 で撤去済みで、ファイルごと古い。T5-25a より前からあるもので、10-4 の受け持ちもない。直すか消すかをバックログに載せる。

## 次の手順

builder に 1・2 を直させ、直したあとで、今回の指摘だけでなくコミット全体をもう一度レビューに出す。
