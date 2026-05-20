---
id: 196
description: B-425（P2、`(new)/about`・`(new)/privacy`・global-not-found（404 ページ）の max-width 既存破綻修正）に着手する。w1280 / w1900 で本文が画面全幅に伸び切って読みづらい既存破綻（`var(--max-width)` が `(new)` 用 globals.css に未定義のため `none` 解決）を、`max-width: 1200px` ハードコードに置換して修正する。これは `docs/design-migration-plan.md` L280 が正準パターンとして明文化し、(new) 配下の既存正常 8 ページが既に採用している方式と一致する。スコープは about / privacy / global-not-found（404 ページ）の 3 経路に限定（r2 reviewer 指摘 R-CRIT-1 で 3 件目の同型破綻 `src/app/global-not-found.module.css` を本サイクルに追加）。
started_at: 2026-05-20T16:03:46+0900
completed_at: null
---

<!-- このファイルはサイクルドキュメントのテンプレートです。`<>`で囲まれた部分を適切な内容に置き換えて使用してください。内容は作業が進むごとに都度更新してください。 -->

# サイクル-196

このサイクルでは、cycle-194 視覚回帰で発見された `(new)/about` / `(new)/privacy` の max-width 既存破綻、および r2 reviewer 指摘 R-CRIT-1 で追加発見された同型破綻（`src/app/global-not-found.module.css` = 404 ページ）を修正します。来訪者がワイドモニタ（w1280 / w1900）で本文を快適に読める状態に戻すことを目標とします。スコープは about / privacy / 404 ページの 3 経路です。

## 実施する作業

- [ ] **T-0 着手前確認**: GA4 で直近 30 日の `/about` と `/privacy` の PV を実測し、主要コンテンツ（直近 30 日 PV 上位）の 5% を超えるなら backlog 上の B-425 を P2 → P1 に格上げして記録する。結果に関わらず修正自体は実施するため、本判断は記録目的であり後続タスクをブロックしない。
- [ ] **T-1 `var(--max-width)` 参照の網羅確認（`src/` 全体スコープ）**: `src/` 配下全体に対して `grep -rn "var(--max-width)" src/` を実行し、ヒットしたすべてのファイルを列挙する。各ヒットについて、**(new) ビルドに露出するか / (legacy) 専用か** を、`src/app/(new)/layout.tsx` および `src/app/(new)/*/page.tsx`、加えて `src/app/global-not-found.js`（multiple root layouts 構成のため (new) Route Group 配下ではないが `@/app/globals.css` を直接 import する）からの import 関係（直接・間接）を辿って分類し、計画書（または本サイクルドキュメント T-1 実施結果欄）に表として列挙する。
  - **既知の (new) ビルド露出 3 件**（修正対象、本サイクル既定スコープ）:
    - `src/app/(new)/about/page.module.css` L2
    - `src/app/(new)/privacy/page.module.css` L2
    - `src/app/global-not-found.module.css` L2（r2 reviewer 指摘 R-CRIT-1 で追加。`src/app/global-not-found-content.tsx` L12 → `src/app/global-not-found.js` L23 の `@/app/globals.css` import 経由で同型破綻を起こしている）
  - **期待値**: grep 結果は上記 3 件 × L2 = 3 行が (new) ビルド露出としてヒットすることを想定。実行結果がこの 3 件と一致すれば本サイクル既定スコープで完了する。
  - **(legacy) 専用ファイル**（例: `src/components/common/Header.module.css` / `src/components/common/Footer.module.css` / `src/tools/_components/ToolLayout.module.css` 等で (new) ビルドからは import されない箇所）は、`src/app/old-globals.css` L28 の `--max-width: 960px` で正常動作している。本サイクルでは触らない方針を採る（変更すると (legacy) の既存正常表示にネガ影響）。
  - **想定外の (new) ビルド露出が追加検出された場合**: 上記既定 3 件以外に (new) 露出箇所が見つかった場合は、本サイクルに含めるか別タスクとして起票するかを PM 判断で決め、計画に追記する（決め打ちしない）。判断軸は「コストが極小か」「来訪者影響が現に発生しているか」（D 案却下の論理と一貫）。
  - 本タスクは、cycle-191/192/193/195 の 4 連敗構造（一次資料の確認範囲を所与のまま狭く取る）と AP-P14 / AP-P16 / AP-WF12 への同型対処として実施する。`(new)/` 配下のみで grep を打って「再確認済」と書く形は採らない（r1 計画でこの誤りを起こし r2 reviewer に発見された経緯あり）。
- [ ] **T-2 修正前ビジュアル記録（T-3 着手の前提条件）**: Playwright で w360 / w1280 / w1900（ライト / ダーク両モード）の修正前スクリーンショットを `/about` / `/privacy` / 404 ページ の 3 経路で取得し、`tmp/` 配下に保存する。404 ページは `/__nonexistent__` のように意図的に存在しない URL を踏ませて `global-not-found.js` を経由させる形で撮る（実際の Next.js ルーティングで 404 を発火させる）。w1280 / w1900 における本文コンテナの `getBoundingClientRect().width` も 3 経路すべてで記録する（破綻の数値証跡、合計 3 ページ × 2 ビューポート = 6 ペア相当の修正前値）。**T-3 修正実施の前に必ず本 T-2（修正前撮影 + 数値記録）を完了させる**（AP-WF05「着手前撮影ルール」に準拠。修正後との対照を「修正前と同等以上」評価するための必須資料であり、撮り忘れた場合は `git worktree` で kickoff コミットから復元してでも先に撮る）。
- [ ] **T-3 修正実施**: 以下 3 ファイル × 1 行ずつ（合計 3 行）を、(new) の正準パターン（`max-width: 1200px;`）に置換する。padding 等の他のプロパティは変更しない。
  - `src/app/(new)/about/page.module.css` L2
  - `src/app/(new)/privacy/page.module.css` L2
  - `src/app/global-not-found.module.css` L2（`.main` セレクタ）
- [ ] **T-4 修正後ビジュアル記録 / 視覚回帰確認**: 同じビューポート（w360 / w1280 / w1900）・両モードで about / privacy / 404 ページ の 3 経路を再撮影し、修正前と比較して破綻なし・本文行長が CJK 70〜80 文字程度に収まっていることを確認する。
- [ ] **T-5 数値検証**: `docs/design-migration-plan.md` L284 の検証基準に従い、w1900 で本文コンテナ（main 直下要素）の `getBoundingClientRect().width < 1300px` を Playwright 実機で確認する（about / privacy / 404 ページの 3 経路すべて）。
- [ ] **T-6 自動チェック実行**: `npm run lint && npm run format:check && npm run test && npm run build` をすべて成功させる。
- [ ] **T-7 backlog / cycle ドキュメント更新**: B-425 を Active から Done に移動。T-0 の GA4 結果（P2 維持 / P1 格上げ）を Notes として記録。本サイクルドキュメントのチェックリストを完了状態に更新する。

## 作業計画

### 目的

**誰のために**: 検索流入で初めて yolos.net に来た新規来訪者（特に「特定の作業に使えるツールをさっと探している人」）と、運営背景や個人情報の扱いを確認したいリピーター（「気に入った道具を繰り返し使っている人」）。加えて、外部リンク切れや古いブックマーク経由で 404 ページに着地してしまう来訪者も対象（404 着地は外部経路依存で頻度が読みにくいが、着地した瞬間に「サイト全体が壊れている」印象を与えうる位置にある）。

**何の価値を提供するのか**: ワイドモニタ（w1280 / w1900）で `(new)/about` / `(new)/privacy` / 404 ページの本文行長が CJK 100 文字超に広がってしまい、視線移動が辛く読まずに離脱しやすい既存破綻を解消する。修正後は本文行長が CJK 70〜80 文字程度に収まり、「このサイトは何？信頼できる？」を確認しに来た来訪者がストレスなく読み通せる。404 着地来訪者にとっても、リカバリリンク（ホーム / ツール / 遊ぶ / ブログ）が読みやすい幅で並ぶことで「サイト本体が機能している」安心感が伝わり、再回遊につながる。これは初回来訪者の継続利用機会と、リピーターが「不安なく使える」と感じる体験の双方を回復する。

**サイクルゴール**: about / privacy / 404 ページの本文コンテナ最大幅を 1200px に制限し、来訪者がワイドモニタで快適に読める状態に戻す。スコープは 3 ファイル × 1 行ずつの値変更のみ。

### 作業内容

**タスク順序**: T-0 → T-1 → T-2 → T-3 → T-4 → T-5 → T-6 → T-7 の順に直列で実施する。特に **T-2（修正前撮影 + 数値記録）は T-3（修正実施）の前に必ず完了させる**（AP-WF05「着手前撮影ルール」に基づく必須順序）。T-4（修正後撮影）と T-5（数値検証）は T-3 完了後に実施する。

1. **着手前判断（T-0）**: GA4 で about / privacy の PV を実測し、P2 維持 or P1 格上げを判定。修正実施には影響しない並行作業。
2. **影響範囲の網羅確認（T-1）**: `src/` 配下全体に対して `var(--max-width)` 参照を grep し、ヒットしたファイルを「(new) ビルド露出 / (legacy) 専用」で分類。期待値は (new) 露出 3 件（about / privacy / global-not-found）× L2 = 3 行。(legacy) 専用箇所は old-globals.css の 960px で正常動作中なので触らない。想定外の (new) 露出箇所が追加検出された場合は、本サイクル含めるか別タスク起票かを PM 判断（決め打ちしない）。
3. **修正前ビジュアル / 数値の取得（T-2）**: Playwright で w360 / w1280 / w1900 ライト / ダーク両モードのスクリーンショット、および本文コンテナの幅実測値を about / privacy / 404 ページ の 3 経路で `tmp/` に保存。404 ページは意図的に存在しない URL を踏んで `global-not-found.js` を経由させる。これにより修正効果と回帰検出基準が客観的に評価できる。
4. **修正の実施（T-3）**: 3 ファイルそれぞれ L2 の `max-width: var(--max-width);` → `max-width: 1200px;` への置換のみ。padding 等の他プロパティは触らない。
5. **修正後の検証（T-4 / T-5）**: 修正前後のスクリーンショット比較で破綻なしを確認し（3 経路すべて）、design-migration-plan.md L284 が定める「w1900 で本文幅 < 1300px」を実機で検証（3 経路すべて）。
6. **自動チェック（T-6）**: `npm run lint && npm run format:check && npm run test && npm run build` 全成功。
7. **記録更新（T-7）**: backlog の B-425 を Done 化し、GA4 判定結果を Notes 記録。

**完了条件**:

- about / privacy / 404 ページの本文コンテナが w1280 / w1900 で 1200px 以内に収まる（Playwright 実測値で修正後 `getBoundingClientRect().width < 1300px`、3 経路すべて）。
- **修正前後の `getBoundingClientRect().width` の数値ペア**（about / privacy / 404 × w1280 / w1900 = 6 ペア）が `tmp/` 配下に保存されている（AP-WF05「修正前後ペア」の精神に従い、破綻の証跡と解消の証跡を並べて記録）。
- w360 / w1280 / w1900 ライト / ダーク両モードのスクリーンショット（修正前 / 修正後の両セット）で視覚破綻なし（3 経路すべて）。
- `npm run lint && npm run format:check && npm run test && npm run build` が全て成功。
- backlog の B-425 が Active から外れ、GA4 PV 判定結果が記録されている。

**注意点 / やらないこと**:

- (new) 配下で `var(--max-width)` を使うことは禁止（`docs/design-migration-plan.md` L280 が「(new) では `var(--max-width)` 使用禁止」と明文化）。
- `(new)` 用の `src/app/globals.css` に `--max-width` を新規定義しない。定義してしまうと「(new) では `var(--max-width)` 使用禁止」という正準パターンと矛盾し、後続ページが誤って参照してしまう罠を再生産する。
- padding（about / privacy は `2rem 1.25rem`、404 ページは `0 1rem`）は変更しない。スコープを「L2 の値変更 1 行のみ × 3 ファイル」に厳密に絞り、無関係なリグレッションを避ける。
- 本サイクルで (legacy) 専用箇所には触らない（old-globals.css の 960px で正常動作中。修正対象は (new) ビルド露出 3 ファイルのみ）。
- T-1 の grep 結果が「3 ファイル × 1 行ずつ」で出れば本サイクル既定スコープで完了する。`src/app/global-not-found.module.css` 以外で追加の (new) 露出箇所が想定外に検出された場合に限り、PM 判断でスコープ拡張または別タスク起票を決める（決め打ちしない）。
- (new) 配下の既存正常 8 ファイルは既に `max-width: 1200px` ハードコードで揃っており、本サイクルでスイープ対象に含めない（`tmp/research/2026-05-20-b425-max-width-investigation.md` (c) パターン A の 8 件、フルパス）:
  - `src/components/Header/Header.module.css`（`.inner` L20）
  - `src/components/Footer/Footer.module.css`（`.inner` L15）
  - `src/app/(new)/page.module.css`（`.main` L2）
  - `src/app/(new)/storybook/page.module.css`（`.container` L4）
  - `src/app/(new)/blog/[slug]/page.module.css`（`.contentColumn` L6）
  - `src/blog/_components/BlogListView.module.css`（`.container` L2）
  - `src/tools/_components/ToolsListView.module.css`（`.container` L2）
  - `src/play/_components/PlayListView.module.css`（`.container` L2）
  - 上記は (new) ビルドに露出するファイルであり、いずれも `max-width: 1200px` ハードコードで正常動作中。一方、`src/components/common/Header.module.css` / `src/components/common/Footer.module.css` / `src/tools/_components/ToolLayout.module.css` は **(legacy) 専用** であり、本リストとは別物。これらも触らない（理由は T-1 の (legacy) 専用ファイルの方針を参照）。
- `docs/design-migration-plan.md` の修正は不要（L280 / L284 は既に整っている）。

### 検討した他の選択肢と判断理由

backlog では「1200px ハードコード化」と「Phase 7 標準手順の同案踏襲」の 2 案が併記されていたが、PM の事前調査により、これらは `docs/design-migration-plan.md` L280 で **同じ正準パターン**（`max-width: 1200px` ハードコード）として明文化されていることが確認済。AP-P17（3 案以上ゼロベース比較）に従い、「修正実施案 3 案」に加え「修正を実施しない（後続サイクル送り）」を第 4 案として並べる。

| 案                                                 | 内容                                                                                   | 採否   | 理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A: 1200px ハードコード（採用）**                 | 各 page.module.css の L2 を `max-width: 1200px;` に直接置換                            | 採用   | design-migration-plan.md L280 の正準パターンと完全一致。(new) 配下の既存正常 8 ファイルと整合。修正は 3 ファイル（about / privacy / global-not-found）× 1 行ずつで影響範囲が最小。                                                                                                                                                                                                                                                                                                    |
| B: globals.css に `--max-width: 1200px` を定義する | (new) 用 `src/app/globals.css` にトークンを追加し、参照側はそのまま                    | 不採用 | design-migration-plan.md L280 が「(new) では `var(--max-width)` 使用禁止」と明文化している。トークン定義は明文化されたルールと矛盾し、後続ページに同じ誤参照を誘発する罠を再生産する。また既存正常 8 ファイルはハードコードで揃っており、トークン化は単一ページのために整合性を崩す。                                                                                                                                                                                                 |
| C: 共通レイアウトコンポーネントへ吸い上げる        | `<PageContainer maxWidth={1200}>` のような共通コンポーネントを新設し、各ページから利用 | 不採用 | スコープが 3 ファイルに限定された既存破綻修正のために共通コンポーネントを新設すると、本サイクルの「1 サイクルで確実に完結する独立・低リスク修正」という選定理由を毀損する。共通化が必要なら別 backlog として将来検討すべき。                                                                                                                                                                                                                                                          |
| D: 直さない / 後続サイクル送り                     | 本サイクルでは修正せず、B-425 を Queued のまま据え置く                                 | 不採用 | 来訪者が現にワイドモニタ（w1280 / w1900）で破綻した本文行長（CJK 100 文字超）を体験しており、放置は constitution「higher page views by providing the best value for visitors」に直接反する。修正コストが極めて小さい（3 ファイル × L2 = 3 行）ため、後送する正当性がない。cycle-195 L347 で「Phase 7 完了優先」として後送した判断は、cycle-191/192/193/195 の 4 連敗を経て無効化された（タイル基盤再挑戦より独立・低リスク修正で成功体験を取り戻す方が筋がいい、補足事項 L95 参照）。 |

#### r2 reviewer 指摘 R-CRIT-1 対応の比較

r2 reviewer の独立一次集計（`grep -rn "var(--max-width)" src/`）で 3 件目の (new) ビルド露出 `src/app/global-not-found.module.css` L2 が発見された。本サイクルに含めるか別タスクに切り出すかを以下で比較した。

| 案                                               | 内容                                                                                                              | 採否   | 理由                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R-1: 本サイクルに含めて 3 ファイル化（採用）** | スコープを 2 ファイル → 3 ファイルに拡張し、404 ページを撮影・修正・検証対象に追加                                | 採用   | (1) 修正コストが極小（1 行追加で T-3 完了、撮影と検証も既存フローへの 1 ページ追加で済む）、(2) 404 着地は外部リンク切れで来訪者がストレス体験する場面であり来訪者価値の即時回復に直結、(3) design-migration-plan.md L280 の正準パターンに揃える作業として 3 件を一塊で扱うのが論理的に自然、(4) **D 案却下の論理「コスト極小なのに後送する正当性がない」をそのまま適用するなら R-2（後送）は採れない、R-1 採用が論理的に一貫**。 |
| R-2: 別 backlog 起票して後続サイクル送り         | B-425 のスコープを about / privacy に厳密に保ち、404 同型修正は別 backlog（例: B-427）として cycle-197 以降で対応 | 不採用 | D 案不採用と同型の判断（コスト極小なのに後送する正当性なし）になり論理矛盾。本サイクル中の 404 着地来訪者は読書体験毀損を継続的に受け続ける。スコープ厳密化はコスト管理上のメリットしかなく、来訪者価値の観点では負け筋。                                                                                                                                                                                                         |

cycle-196 kickoff 時の調査スコープが `src/app/(new)/` 限定だったために 3 件目を見落としたが、計画 r2 レビューで発見された今のタイミングで一緒に直すのが筋。

### 計画にあたって参考にした情報

- `docs/backlog.md` L7（B-425 のエントリ、Notes 込み）
- `docs/cycles/cycle-194.md` §T-5 実施結果 / T-視覚回帰 観察結果（B-425 発見契機）
- `docs/cycles/cycle-196.md` 補足事項「cycle-196 kickoff 時の判断記録」（B-425 選定理由）
- `docs/design-migration-plan.md` L280（ページ最上位コンテナの正準パターン、(new) での `var(--max-width)` 使用禁止の明文化）
- `docs/design-migration-plan.md` L284（w1900 における `getBoundingClientRect().width < 1300px` 検証基準）
- `docs/targets/特定の作業に使えるツールをさっと探している人.yaml`、`docs/targets/気に入った道具を繰り返し使っている人.yaml`（来訪者文脈）
- `docs/constitution.md`（来訪者価値最大化の原則）
- `docs/anti-patterns/planning.md`（AP-P01 一次資料の実測 / AP-P07 来訪者起点 / AP-P17 複数案比較 / AP-P20 過度に具体化しない を確認）
- `tmp/research/2026-05-20-b425-max-width-investigation.md`（PM が code-researcher 経由で取得した一次資料調査の詳細）
- `tmp/cycle-196-plan-review-r2.md`（r2 reviewer が独立一次集計で 3 件目 `src/app/global-not-found.module.css` を発見し R-CRIT-1 として指摘した経緯。本指摘を受けて R-1 採用でスコープを 3 ファイルに拡張）
- 一次資料の直接確認: `src/app/(new)/about/page.module.css` L2 / `src/app/(new)/privacy/page.module.css` L2 / `src/app/global-not-found.module.css` L2 / `src/` 配下全体に対する `grep -rn "var(--max-width)" src/` の結果と、各ヒットの (new) ビルド露出有無の分類。**経緯訂正**: 計画 r1 で `(new)/` 配下のみに grep を打って「確認済」と記した形だったため `src/app/global-not-found.module.css`（multiple root layouts 構成で (new) Route Group 配下ではないが `@/app/globals.css` を直接 import している）を見落とし、r2 reviewer の独立一次集計（10 件ヒット中 (new) 露出 3 件）で発見・修正された。AP-P14 / AP-P16 / AP-WF12 同型リスクの再発を反映済。

## レビュー結果

### 計画フェーズ

3 ラウンドで Pass。

- **r1** (`tmp/cycle-196-plan-review-r1.md`): R-MAJOR 2 件（T-1 の grep 範囲が `(new)/` 限定 / 既存正常 8 ページのフルパス不明示）、R-MINOR 3 件（完了条件に修正前数値不在 / T-2 → T-3 順序の AP-WF05 紐付け不在 / 比較表に 4 案目「直さない」不在）。planner で全件解消。
- **r2** (`tmp/cycle-196-plan-review-r2.md`): R-CRIT 1 件（`src/app/global-not-found.module.css` L2 も同型破綻、404 着地来訪者に同じ読書ストレス発生中、初回 PM の `(new)/` 限定 grep スコープが原因の見落とし）。planner で対応案 1 採用（本サイクルに 3 件目を含めてスコープを 3 ファイル × L2 に拡張）で解消。
- **r3** (`tmp/cycle-196-plan-review-r3.md`): r1 / r2 全 6 件の解消確認 + reviewer 独立 grep（10 件ヒット中 (new) 露出 3 件で計画書記述と一致）+ (legacy) 専用ファイルの import 経路実測 + 全 AP 点検で **Pass**。新規指摘ゼロ。

### 実施フェーズ

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

### cycle-196 kickoff 時の判断記録

- **B-426（Phase 7 タイル基盤実装）再着手の見送り判断**: cycle-191/192/193/195 と 4 サイクル連続失敗中。事故の構造は「過去判定の所与継承＋一次資料未確認」で、ルール継承の形式化が原因。5 度目に同じ枠で挑むのは罠に再突入する確率が高いと PM 判断。一度成功体験を取り戻してから立て直すほうが、4 連敗からの脱却としては筋がいい。B-426 は Done から Queued に戻して保全済み。
- **B-425 選定理由**: 来訪者がワイドモニタで現に体験している全幅破綻を修正する直接的な visitor 価値があり、スコープが about / privacy の 2 ルートに限定されるため独立・低リスク。1 サイクルで確実に完結できる見込み。

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
