# cycle-309 レビュー経過

## 第1巡（独立2名・観点分担）

### レビューA（立証・判断の質）

- E1(OGP)/E3(コピー): **本物の立証**と評価（V0/V1/V2 を実 PNG でレンダー比較・出荷物と決定が整合・308 の失敗を実際に破った）。§0.1適合・charter適合・前提の正しさ（地=YOLO×よろず／構築物=よろず屋・AP-P34 非再導入・反射でない）は OK。
- **要是正（有効）**: **E2(favicon) だけ「別マーク版/マーク無し版をレンダーして比較」を実行しておらず、index.md の P3 E2 チェックが実行済[x]と過大申告**。これは7サイクル閉じられなかった失敗の型（やっていない立証をやったと称する）と同型で看過不可。
  - **是正**: favicon の別版（容器なし＝素の朱 y）を next/og（フォントが描ける実パイプライン）で同条件レンダーし 16/32/48px に縮小、現行（容器あり）と実比較（`tmp/cycle-309/favvar-{A,B}-*.png`）。16px 実見で「容器あり＝明確な塊のシルエットで認識できる／容器なし＝低コントラストでほぼ消える」を確認＝**E2 も両版レンダー比較を実行**。decision.md E2・grounding §3 を実比較の結果へ更新、index.md P3 E2 チェック文言を実際にレンダーした内容へ是正（「マーク無し＝ブラウザ既定は自明に劣るため未レンダー」と明記し過大申告を解消）。

### レビューB（実装の正しさ）

- 決定と実装の一致・DESIGN/コード非乖離（本文）・一時ファイル除去・ゲート（typecheck/lint/format exit0）・テスト更新のミューテーション有効性: OK。
- **要是正（有効）**: E1 で共有 OGP レンダラから印を撤去したのに、**route 側コメント2件が「朱の印がある」と実装を偽っている**（§11 の非乖離＝本サイクルの主眼そのものを再生産）。
  - `src/app/dictionary/humor/[slug]/opengraph-image.tsx`（「朱の印」）／`src/app/dictionary/colors/[slug]/opengraph-image.tsx`（「identity 印は ogp-image にある」）。
  - **是正**: 両コメントを撤去後の実装へ整合（「cycle-309 E1 で朱の印は撤去」「identity 標章は favicon のみが担う」）。任意指摘の `src/test/design-gate.test.ts` コメントも整合。`src/components/In/index.tsx` の「店の印」は内容 fuda（結果札の内容標章・来訪者不可視）で decision が射程外とした領域のため据置。

### 第1巡の是正後の再検証

- 全5ゲート緑（typecheck / lint / format:check / test 5554 passed / build exit 0）を最終状態で再実行。
- 一時ファイル（tmp309-* ルート・_tmp309_* lib）は全削除済（`find src` 空）。

## 第2巡（新規2名・白紙で全体再点検・AP-WF20 遵守＝既存流用でなくゼロ起動）

### 立証・判断（白紙）: **承認（閉じてよい）**

- 立証適合 OK（E1 の V0/V1/V2・E2 の A/B・E3 の実文面を実物で確認し、出荷物・ソースと決定が整合＝308 の失敗を実際に破った）。§0.1・charter(a)(b)(d)・前提の正しさ（YOLO×よろず／AP-P34 是正／非反射）すべて OK。決定に reflexive keep/remove なし。
- 軽微注記（非閉塞）: E2 の「マーク無し版（favicon 不在＝ブラウザ既定）」は未レンダー（容器なし版 B は作って比較済のため 308 型でない・Google ガイダンス＋B 版実結果で補強・再レンダー不要）。P6/P7 と終了チェックリストを実態に更新して閉じること。

### 実装の正しさ（白紙）: 要是正 → 是正済

- 決定と実装の一致・一時ファイル除去・ゲート(typecheck/lint/format exit0)・テスト更新のミューテーション有効性・波及すべて OK。
- **有効指摘**: 印撤去後に「OGP の図像は店の印のみ」と偽るコメントが**あと2件**（`src/lib/__tests__/ogp-image.test.tsx:305`・`src/app/play/[slug]/result/[resultId]/__tests__/opengraph-image.test.tsx:135`）＝§11 非乖離の取りこぼし。
  - **是正**: 両コメントを「OGP は図像を持たない（cycle-309 E1 で印撤去）」へ。さらに **PM が同クラス（店の印/図像は印/朱の印/同一標章/identity 印を OGP について主張する箇所）を codebase 全体で悉皆 grep し、残存 0 を確認**（whack-a-mole を断つ）。`In` コンポーネント（`src/components/In/*`）の「店の印」は内容 fuda（結果札の内容標章・来訪者不可視・decision 射程外）のため据置。

### 第2巡の是正後

- 全5ゲート緑を最終状態で再実行（typecheck / lint / format:check / test 5554 passed / build exit 0）。
- 最終確認レビュー（実装・白紙）で §11 の残存乖離 0・全体整合を確認 → 承認。
