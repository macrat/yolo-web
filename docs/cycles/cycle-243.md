---
id: 243
description: "移行計画 Phase 9.2.h（B-349）。チートシート機能を完全撤去し、7チートシート全URL + index を統合先ブログ記事へ 301 リダイレクト。主題が矛盾する cheatsheets-introduction 記事を「チートシートから深掘り記事への転換」という完結した事例記事に書き換え。"
started_at: "2026-06-14T16:37:56+0900"
completed_at: null
---

# サイクル-243

このサイクルでは、移行計画 Phase 9.2.h（backlog B-349）を実施する。cycle-237〜242 で 7 つのチートシート（cron/git/html-tags/http-status-codes/markdown/regex/sql）の内容はすべてブログ記事へ転換・統合済みになった。今、古いチートシートページとその転換先記事が並存しており、来訪者にとっては「同じ主題が2箇所にあり、どちらが正典か分からない」状態であり、検索エンジンに対してもカニバリ（自己競合）を生む。このサイクルでチートシート機能そのものを撤去し、旧 URL を統合先記事へ恒久リダイレクトして、コンテンツを単一の正典に畳む。

あわせて、撤去によって主題が矛盾する `cheatsheets-introduction` 記事（チートシート機能の紹介＋反省記）を、「チートシートに賭けたが正典サイトには勝てず、差別化できる深掘り記事へ転換した」という完結した事例記事に書き換え、誤誘導を解消しつつ読者への学び（集約系コンテンツの限界・独自性の重視）を残す。

## 実施する作業

### 撤去・リダイレクト（インフラ — 単一 builder が一括で実施。AP-I02 一括撤去・B-494 .next stale 対策遵守）

- [ ] T-1: `next.config.ts` の `redirects()` に cheatsheet リダイレクト群（7本 + index 1本 = 計8本・すべて `permanent: true`）を追加する。マッピングは下記「リダイレクトマップ」のとおり。
- [ ] T-2: `src/cheatsheets/` ディレクトリを完全削除する（registry/types/\_components/generated/各チートシート/**tests** を含む全ファイル）。
- [ ] T-3: `src/app/(legacy)/cheatsheets/` ディレクトリを完全削除する（layout/page/各 slug の page・opengraph-image・twitter-image・**tests** を含む全ファイル）。
- [ ] T-4: 検索インデックスから cheatsheet を除去する。`src/lib/search/build-index.ts`（registry import と cheatsheet ループ）、`src/lib/search/types.ts`（`ContentType` から `"cheatsheet"`・`CONTENT_TYPE_LABELS`・`CONTENT_TYPE_ORDER` の該当エントリ）、`src/lib/search/__tests__/build-index.test.ts`（content types 件数・expectedTypes・cheatsheet URL パターン）。
- [ ] T-5: SEO から cheatsheet を除去する。`src/lib/seo.ts`（`CheatsheetMeta` import・`generateCheatsheetMetadata`・関連 JsonLd 関数）、`src/lib/__tests__/seo-cheatsheet.test.ts`（ファイル全削除）、`src/lib/__tests__/seo.test.ts`（cheatsheet テストケース）。
- [ ] T-6: サイトマップから cheatsheet を除去する。`src/app/sitemap.ts`（registry import・`latestCheatsheetDate`・cheatsheet エントリ）、`src/app/(legacy)/__tests__/sitemap.test.ts`、`src/app/(legacy)/__tests__/seo-coverage.test.ts`。
- [ ] T-7: Footer 2 系統から cheatsheet リンクを除去する。`src/components/common/Footer.tsx`、`src/components/Footer/index.tsx`、`src/components/common/__tests__/Footer.test.tsx`。
- [ ] T-8: `src/tools/_components/ToolsListView.tsx` の cheatsheetBanner を除去する。
- [ ] T-9: `src/__tests__/bundle-budget.test.ts` の `/cheatsheets` バジェット行を除去する。
- [ ] T-10: 残存参照ゼロの確認。`grep -rn "cheatsheet" src` を実行し、(a) `src/blog/content/` の本文リンク是正は T-11 の責務として除外、(b) 外部リンク（OWASP 等）は対象外、(c) それ以外のコード参照が残っていないことを確認。`FaqSection.tsx`・`DictionaryDetailLayout.tsx`・`GameLayout.tsx`・`src/__tests__/middleware-gone-slugs.test.ts`・`src/blog/content/2026-02-28-url-structure-reorganization.md`(L228 の記述的言及) が cheatsheet 機能に依存していないか個別確認し、依存していれば是正する。

### 記事の書き換え（blog-writer。インフラとはファイルが互いに素なので並行可）

- [ ] T-11: `src/blog/content/2026-02-19-cheatsheets-introduction.md` を書き換える。(a) 主題を「チートシートに賭け→計測→正典に勝てないと判断→差別化できる深掘り記事へ転換」という完結した事例に再構成、(b) 本文中の `/cheatsheets/*` リンク6箇所を統合先 `/blog/*` URL へ直接張り替え（リダイレクト頼みにしない）、(c) 「今後の展望」のチートシート拡充の約束を現実（記事への転換完了）に整合、(d) frontmatter の裸配列残骸（trust_level 直後の key なし `[...]` ＝ B-508 該当分）を除去、(e) 実質的な本文変更のため `updated_at` を `date` 実測値に更新（AP-W13 厳守・published_at は保持）。

### 検証・レビュー

- [ ] T-12: 4 ゲート（`npm run lint && npm run format:check && npm run test && npm run build`）を PM がバッチ commit 前に実行（B-494: 並列でない単一 builder でも commit 前に PM が tsc/build を独立に回す）。`.next` を削除してから build（B-494 stale 対策）。リダイレクト8本・統合先記事のプリレンダリングを build 出力で確認。
- [ ] T-13: reviewer によるインフラ撤去レビュー（残存参照・リダイレクトマップの正確性・テスト整合）。
- [ ] T-14: contents-review + reviewer による記事レビュー（読者価値・事実整合・リンク先正確性・frontmatter）。
- [ ] T-15: レビュー指摘の対応と再レビュー。

## 作業計画

### 目的

チートシート機能と転換先記事の並存（重複・カニバリ・どちらが正典か不明な状態）を解消し、コンテンツを単一の正典記事に畳む。旧 URL からの少数の検索流入（GA 実測で 90 日 PV 6・全て Organic Search）を 404 で突き放さず統合先記事へ恒久誘導する。Phase 9.3（辞典移行・B-350〜）の前提を満たす。

### 作業内容

#### リダイレクトマップ（確定）

統合先はすべて一次資料（記事 frontmatter の slug・統合元 backlog の Done 記録・git log）で実在を確認済み。

| 旧 URL                           | リダイレクト先                              | 統合元タスク（確認元）                                                  |
| -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| `/cheatsheets/cron`              | `/blog/cron-parser-guide`                   | B-342 cycle-242（補筆統合）                                             |
| `/cheatsheets/git`               | `/blog/git-command-reference`               | B-343 cycle-237（記事化・git log f28693c1 で確認）                      |
| `/cheatsheets/html-tags`         | `/blog/choosing-html-tags-by-meaning`       | B-344 cycle-241                                                         |
| `/cheatsheets/http-status-codes` | `/blog/http-status-code-guide-for-rest-api` | B-345 cycle-242（補筆統合）                                             |
| `/cheatsheets/markdown`          | `/blog/markdown-not-rendering-as-expected`  | B-346 cycle-240                                                         |
| `/cheatsheets/regex`             | `/blog/regex-tester-guide`                  | B-347 cycle-242（補筆統合）                                             |
| `/cheatsheets/sql`               | `/blog/sql-execution-order-guide`           | B-348 cycle-238                                                         |
| `/cheatsheets`（index）          | `/blog/category/tool-guides`                | 全7記事が category=tool-guides。category 一覧が intent を保つ最適着地。 |

> 注意（調査で判明した取り違えの是正）: markdown の統合先は `markdown-not-rendering-as-expected`（B-346）であって `markdown-sanitize-html-whitelist-design`（cycle別の dev-notes 記事・無関係）ではない。リダイレクト先・記事内リンクともこの正しい slug を使う。

リダイレクトは middleware の 410 Gone ではなく `next.config.ts redirects()` の `permanent: true`（既存の colors/games/quiz 等と同一パターン）。内容は「削除」ではなく記事へ「移動」したため。

#### 記事書き換えの方針（T-11）

`cheatsheets-introduction` は元々「機能紹介＋1ヶ月後の反省」の二層構造。すでに本文後半に「検索需要があっても競合が強い分野では後発は勝てない」「独自性を最重要基準にすべきだった」という反省が書かれており、今回の転換はその反省の自然な帰結。書き換えでは内部作業フロー（サイクル工程）を骨格にせず、読者が持ち帰れる「集約系コンテンツ（チートシート/まとめ）は MDN・Pro Git・CommonMark 等の正典に検索で勝ちにくい。だから集約をやめ、つまずきの仕組みを解く差別化記事へ転換した」という content/SEO 戦略の学びを軸に構成する。リンクは統合先の各 `/blog/*` 記事へ文脈付きで張る。

### 検討した他の選択肢と判断理由

- **記事の扱い: 削除 / 放置 / 書き換え（採用）**: 放置は「存在しない機能を勧める誤誘導」になり憲法ルール2・品質ルール4に反するため不可。削除は反省の学び（独自性を最重要基準に）を失い、Organic 着地 URL も失う。書き換えは effort が最大だが、CLAUDE.md の意思決定原則（来訪者価値が最大なら effort を理由に劣る選択をしない）に従い、完結した事例記事として最大価値を残せるため採用。
- **index リダイレクト先: `/blog` vs `/blog/category/tool-guides`（採用）**: 旧 index は全チートシート一覧。転換先は全て tool-guides カテゴリのため、category 一覧が元の intent（開発者向けリファレンス一覧）を最も保つ。
- **撤去方式: 漸進削除 vs 一括撤去（採用）**: AP-I02 に従い一括。漸進は中間状態でビルド不整合・型残骸を生む。インフラ撤去（T-1〜T-10）は密結合のため単一 builder が一括実施し、PM が commit 前に 4 ゲートを独立検証（B-494: 並列 builder では project 全体 tsc を信頼できない知見の裏返しで、ここでは単一化＋PM 検証で担保）。
- **リダイレクト機構: middleware 410 Gone vs next.config redirects（採用）**: 内容は移動したので Gone は不適切。既存パターンに揃え redirects() を使う。

### 計画にあたって参考にした情報

- GA4 実測（property 524708437・2026-03-16〜06-14）: 旧 `/cheatsheets` 群は 90 日で合計 PV 6・session 7・全て Organic Search。撤去のトラフィック実害は無視できる規模。ただし少数でも検索流入があるため 301 で誘導する。
- 撤去スコープ調査（Explore・very thorough）: 削除 79 ファイル・修正約 20 ファイル・リダイレクト 8 本。詳細は本ファイル「実施する作業」に反映。
- 一次資料確認: 各統合先記事 frontmatter の slug・`git log`（git-command-reference は cycle-237 B-343）・backlog Done 記録。
- `next.config.ts` 既存 redirects() パターン（colors/games/quiz/blogCategory）。
- AP-I02（一括撤去）・B-494（`.next` stale 対策・PM の commit 前 tsc/build 検証）・AP-W13（updated_at の date 実測・未来時刻禁止）。

## キャリーオーバー

- （作業中に発生したら追記）

## 補足事項

- B-508（frontmatter 裸配列残骸の一括除去・5記事）のうち `cheatsheets-introduction.md` 分は本サイクルの T-11 書き換えで解消するが、残り 4 記事は対象外。B-508 は引き続き backlog に残す。
- url-structure-reorganization.md(L228) の `/cheatsheets/[slug]` 言及は URL 設計の歴史的記述。リンクでなく記述テキストなら是正不要（T-10 で確認）。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
