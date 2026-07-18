# cycle-286 依存脆弱性 到達性検証（reachability）

作成日: 2026-07-18 / 調査担当: security-reachability agent（read-only 調査）
判定軸: 深刻度ラベル(high/medium)ではなく「攻撃者が制御する入力が、本番で来訪者に配信される脆弱コードに届き **他の来訪者** を害せるか（到達性）」。

> **版に関する注記（PM追記 2026-07-18）**: 本評価は remediation **前**のツリー（＝Dependabot アラート発報時点）で実施した。本文中のバージョン（例: mermaid@11.15.0・dompurify@3.4.2・vite@8.0.10・postcss@8.5.14 等）は**その評価時点の版**であり、後続の全依存一括更新で最終版は変化した（mermaid@11.16.0・dompurify@3.4.12・vite@8.1.5・postcss@8.5.19 等。最終確定版は [remediation.md](remediation.md)）。到達性の結論（REACHABLE-VISITOR 0件）はバージョンに依存せず不変。

## 結論（先に）

**REACHABLE-VISITOR は 0 件。** 攻撃者制御の入力が本番の脆弱コードに届き、当人以外の来訪者を害しうる経路は 20 件のいずれにも存在しない。

- runtime scope の 10 件（dompurify×8 / js-yaml×1 / postcss×1）はすべて、脆弱コードが処理する入力が **(a) サイト著作コンテンツ（ブログ Markdown、攻撃者制御外）** または **(b) 来訪者自身がツールに打ち込む入力（self）** に限られる → **SELF-OR-AUTHORED**。
- development scope の 10 件（undici×6 / vite×2 / esbuild×1 / @babel/core×1）はすべて devDependencies（テスト用 jsdom / vitest・lint・ビルド専用ツール）由来で、本番配信物に含まれない → **NON-VISITOR**。

来訪者に届く「他者を害せる」脆弱性は無い。最優先（P1相当）で即応すべき対象は本検証時点では存在しない。ただし SELF/NON は「今の到達不能」であり、下記「昇格条件」が満たされれば再評価が必要。

## 判定表

| #   | pkg         | GHSA                | scope       | 判定             | 根拠                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ----------- | ------------------- | ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #74 | dompurify   | GHSA-cmwh-pvxp-8882 | runtime     | SELF-OR-AUTHORED | dompurify の唯一の供給元は mermaid@11.15.0（`npm ls dompurify`）。mermaid は `src/blog/_components/MermaidRenderer.tsx` がブログ本文の `.mermaid` 要素のみ描画。入力＝著作ブログ Markdown。advisory は攻撃者が sanitize 対象入力を制御する前提。                                                                                                                              |
| #69 | dompurify   | GHSA-vxr8-fq34-vvx9 | runtime     | SELF-OR-AUTHORED | 同上。dompurify 経路は mermaid（ブログ著作図）のみ。来訪者入力を mermaid で描画する経路なし（markdown-preview は mermaid 不使用）。                                                                                                                                                                                                                                           |
| #68 | dompurify   | GHSA-rp9w-3fw7-7cwq | runtime     | SELF-OR-AUTHORED | 同上。IN_PLACE/template バイパスも入力が著作ブログに限られる。                                                                                                                                                                                                                                                                                                                |
| #67 | dompurify   | GHSA-76mc-f452-cxcm | runtime     | SELF-OR-AUTHORED | 同上。hook 汚染も攻撃者が sanitize 入力を制御できないため他者到達なし。                                                                                                                                                                                                                                                                                                       |
| #66 | dompurify   | GHSA-x4vx-rjvf-j5p4 | runtime     | SELF-OR-AUTHORED | 同上（patched 版なし）。入力＝著作ブログ図のみ。                                                                                                                                                                                                                                                                                                                              |
| #65 | dompurify   | GHSA-hpcv-96wg-7vj8 | runtime     | SELF-OR-AUTHORED | 同上。cross-realm IN_PLACE も入力が著作物。                                                                                                                                                                                                                                                                                                                                   |
| #64 | dompurify   | GHSA-r47g-fvhr-h676 | runtime     | SELF-OR-AUTHORED | advisory 一次資料で「攻撃者が sanitize 対象の untrusted HTML を供給する」ことが前提と確認。mermaid 入力＝著作ブログのため攻撃者制御外。                                                                                                                                                                                                                                       |
| #63 | dompurify   | GHSA-gvmj-g25r-r7wr | runtime     | SELF-OR-AUTHORED | 同上。SAFE_FOR_TEMPLATES バイパスも入力が著作ブログ図。                                                                                                                                                                                                                                                                                                                       |
| #82 | js-yaml     | GHSA-h67p-54hq-rp68 | runtime     | SELF-OR-AUTHORED | runtime の js-yaml は `src/tools/yaml-formatter/logic.ts`（`"use client"`）のみ＝来訪者が自分のブラウザで自分の YAML を parse → self-DoS。build 側は `scripts/validate-blog-frontmatter.ts`（著作）。ブログ frontmatter 本体は js-yaml でなく `markdown.ts` の自作 `parseYamlBlock` で解析。advisory は merge key の二次計算量 DoS で入力制御が前提だが他者に配信されない。   |
| #48 | postcss     | GHSA-qx2v-qp2m-jg93 | runtime     | SELF-OR-AUTHORED | postcss は next/vite/sanitize-html 経由のビルド時依存のみ。runtime で外部 CSS を postcss 処理する箇所なし。sanitize-html（→postcss）を呼ぶ `src/lib/sanitize.ts` は `src/lib/markdown.ts` からのみ import され、ブログのビルド時レンダリング（著作）で実行。advisory は「攻撃者 CSS を parse→stringify し `<style>` へ埋める」前提だが、本番にそのような runtime 経路が無い。 |
| #78 | undici      | GHSA-hm92-r4w5-c3mj | development | NON-VISITOR      | undici の唯一の供給元は jsdom@29.1.1（`npm ls undici` → jsdom→undici@7.25.0）。jsdom は devDependency（vitest のテスト DOM 環境）。本番配信・SSR・ビルド出力に含まれない。                                                                                                                                                                                                    |
| #72 | undici      | GHSA-vmh5-mc38-953g | development | NON-VISITOR      | 同上。jsdom(devDep) 経由のみ。SOCKS5 proxy を本番で使う経路なし。                                                                                                                                                                                                                                                                                                             |
| #80 | undici      | GHSA-p88m-4jfj-68fv | development | NON-VISITOR      | 同上。                                                                                                                                                                                                                                                                                                                                                                        |
| #73 | undici      | GHSA-pr7r-676h-xcf6 | development | NON-VISITOR      | 同上。共有キャッシュ跨ぎ情報漏洩もテスト専用 undici で到達不能。                                                                                                                                                                                                                                                                                                              |
| #77 | undici      | GHSA-35p6-xmwp-9g52 | development | NON-VISITOR      | 同上。                                                                                                                                                                                                                                                                                                                                                                        |
| #81 | undici      | GHSA-g8m3-5g58-fq7m | development | NON-VISITOR      | 同上。                                                                                                                                                                                                                                                                                                                                                                        |
| #62 | vite        | GHSA-fx2h-pf6j-xcff | development | NON-VISITOR      | vite@8.0.10 は @vitejs/plugin-react・vite-tsconfig-paths・vitest 由来（`npm ls vite`）＝テスト/開発専用。Next 本番ビルドは vite 不使用。加えて advisory は Windows 限定・dev server 前提、本番配信物に無関係。                                                                                                                                                                |
| #61 | vite        | GHSA-v6wh-96g9-6wx3 | development | NON-VISITOR      | 同上。launch-editor/NTLM は Windows dev 環境限定。本番配信物に含まれない。                                                                                                                                                                                                                                                                                                    |
| #59 | esbuild     | GHSA-g7r4-m6w7-qqqr | development | NON-VISITOR      | esbuild@0.27.3 は vite と tsx 由来（`npm ls esbuild`）＝dev/テスト。dev server 経由の任意ファイル読取で本番来訪者に無関係。                                                                                                                                                                                                                                                   |
| #75 | @babel/core | GHSA-4x5r-pxfx-6jf8 | development | NON-VISITOR      | @babel/core@7.29.0 は eslint-config-next→eslint-plugin-react-hooks 由来（`npm ls @babel/core`）＝lint 専用。本番配信物・ビルド出力に含まれない。                                                                                                                                                                                                                              |

## 反証（SELF/NON へ倒す前に能動的に探した点）

1. **ブログ本文は誰が書くか**: `src/blog/content/*.md`（85 記事）はすべてリポジトリにコミットされた著作コンテンツ。`git log -- src/blog/content` 上の author は本プロジェクト（AI 運用者）。外部投稿・PR による第三者寄稿の受け口は無い。→ mermaid/sanitize-html への入力は攻撃者制御外。
2. **ツール出力を他者と共有・URL 化する経路**: `src/tools/*` を横断調査。`useSearchParams`/`searchParams` によるクエリ駆動レンダリングは tools に **0 件**。保存 URL・サーバー保存・OGP へのツール入力反映は無し（tools は `"use client"` のローカル処理・localStorage のみ）。→ yaml-formatter / markdown-preview は self に留まり他者へ昇格しない。
3. **markdown-preview は mermaid/js-yaml/sanitize-html を使うか**: 使わない。独自の DOMParser ベース sanitizer（`src/tools/markdown-preview/logic.ts`）+ marked のみ。`.mermaid` div も生成しない。→ 来訪者入力が dompurify/postcss 経路に入らない。
4. **memos が来訪者生成コンテンツか**: 否。`src/app/memos/route.ts` は `force-static` で GitHub アーカイブへ 301 リダイレクトするだけ。来訪者入力を描画しない。
5. **OGP/画像生成に外部入力が混ざるか**: `src/lib/ogp-image.tsx` の fetch は自サイトの CSS/フォント（ビルド時）。opengraph-image 群は著作データ（ブログ/辞書 slug）を next/og で描画。脆弱パッケージ（dompurify/js-yaml/postcss）を攻撃者入力で通す経路なし。
6. **SSR/build で外部データ fetch し脆弱コードへ渡すか**: 否。runtime fetch は上記 ogp-image の自サイト資産のみ。API ルート（`src/app/api/*`・games）に marked/mermaid/dompurify/js-yaml/sanitize の使用 **0 件**（grep 確認）。
7. **undici が SSR/build で本番相当に走らないか**: jsdom 専属＝テスト時のみ import。本番の Node ランタイム/Edge middleware は undici を経由しない。

## PM 提示事実への訂正

1. **js-yaml の build 時 frontmatter 解析場所**: PM は「`src/lib/markdown.ts` で frontmatter 解析に js-yaml 使用」としたが、実際は `markdown.ts` は **自作の最小 YAML パーサ `parseYamlBlock`**（js-yaml 不使用）で frontmatter を解析している。build 時に js-yaml を使うのは `scripts/validate-blog-frontmatter.ts`（検証スクリプト、著作コンテンツ対象）。runtime の js-yaml は yaml-formatter ツール（client/self）のみ。いずれも他者到達なしで判定結論は不変。
2. **undici の供給元**: PM は kickoff で明示していなかったが、実測で **jsdom@29.1.1 → undici@7.25.0**（devDependency、テスト DOM 環境専用）と確定。SSR/本番では走らない。
3. **vite のバージョン**: 導入版は **vite@8.0.10**（advisory #62/#61 の patched:8.0.16 未満だが dev/test 専用のため来訪者影響なし）。postcss は next@16.2.6 同梱 8.4.31 / vite@8.0.10 同梱 8.5.14 / sanitize-html 経由 8.4.31 で PM 記載どおり。
4. dompurify 供給元＝mermaid のみ、markdown-preview が mermaid/dompurify 不使用、という PM の事実は実コードで裏取り済み（相違なし）。

## 参照一次資料（アクセス日 2026-07-18）

- js-yaml #82: https://github.com/advisories/GHSA-h67p-54hq-rp68 — merge key の二次計算量 DoS。攻撃者は parse 対象 YAML を制御する必要（CPU 枯渇、コード実行なし）。
- postcss #48: https://github.com/advisories/GHSA-qx2v-qp2m-jg93 — 攻撃者提供 CSS を postcss で parse→stringify し `<style>` へ埋める前提の XSS。本番に該当 runtime 経路なし。
- dompurify #64: https://github.com/advisories/GHSA-r47g-fvhr-h676 — `DOMPurify.sanitize(node, {IN_PLACE:true})` で node が untrusted HTML 由来のとき成立。攻撃者が sanitize 対象 HTML を供給する必要。mermaid 入力は著作のため該当せず。
- 他 dompurify GHSA（#74/#69/#68/#67/#66/#65/#63）・undici/vite/esbuild/@babel の各 GHSA は Dependabot 要約と依存ツリー実測（`npm ls`）で攻撃前提と scope を突合。

## 昇格条件（将来 REACHABLE-VISITOR へ変わる要注意ケース）

- 来訪者が入力した Markdown/YAML/CSS を **保存 URL・OGP・サーバー保存等で他者に配信**する機能を追加した場合（self→他者）。
- ブログ本文を **第三者が寄稿できる**受け口（コメント/投稿フォーム/外部 PR 自動公開）を追加した場合（authored→攻撃者制御）。
- markdown-preview 等のツールに **mermaid 描画や sanitize-html を導入**し、かつ入力を他者へ配信する場合。
