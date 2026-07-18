---
id: 286
description: "B-505: Dependabot 脆弱性アラート(open 20件・high 3)の来訪者到達性評価と対応。前サイクル(285)キャリーオーバーの方針=security(Rule1/2)の到達性評価は品質(Rule4)より優先/届く高脆弱性があれば最優先で対応・無ければ記録に沿う。"
started_at: "2026-07-18T09:55:14+0900"
completed_at: null
---

# サイクル-286

このサイクルでは **B-505: Dependabot 脆弱性アラートの調査と対応** を行う。核心は「深刻度ラベル(high/medium)で並べる」ことではなく、**各脆弱性が『攻撃者が来訪者を害せる経路』を実際に持つか(到達性)を一次確認し、来訪者に届くものを最優先で塞ぐ**こと。届かないものは、非破壊で当てられる修正を当てて既知脆弱バージョンの面積を減らしつつ、届かない根拠を記録する（放置され続けていること自体が cycle-285 で認定された失敗であるため、「無害だから放置」で終わらせない）。

## 実施する作業

- [ ] **到達性評価**: open 20件のアラートを、パッケージ×供給元×使用箇所で「来訪者への到達性」の観点から分類し、`reachability.md` に判定表を作る（敵対的検証: 各 runtime-scope 脆弱性について「攻撃者制御の入力が脆弱コード経路に届き、かつ他の来訪者を害するか」を反証を試みて判定）。
- [ ] **対応(remediation)**: 非破壊で当てられる修正（`npm install` による lockfile 整合・patch/minor bump）を当て、到達性ありと判定されたものは最優先で塞ぐ。到達性なしでも fix があれば当ててアラート面積を減らす。
- [ ] **検証**: `npm run lint && npm run format:check && npm run test && npm run build` が全て成功することを確認。対応前後で Dependabot/npm audit の件数を記録。
- [ ] **残件の処理**: 非破壊では塞げない（major bump 要・upstream 未修正）ものを、到達性判定つきで backlog へ follow-up 起票し、B-505 の扱い（クローズ or 縮小継続）を決める。
- [ ] **レビュー**: reviewer による到達性判定・修正差分・検証結果のレビューを受け、指摘に対応。

## 作業計画

### 目的

来訪者を害しうる依存脆弱性（constitution Rule 1/2）を、来訪者への到達性で優先付けして塞ぐ。品質(Rule4)より上位のセキュリティ課題として、cycle-246 起票以降の放置を解消する。

### 作業内容

kickoff 時点で PM が一次取得した現況（下記「参考にした情報」）:

- **GitHub Dependabot open = 20件**: high 3 / medium 10 / low 7。
  - **high 3 は全て `scope=development`**（undici×2・vite×1）= ビルド/開発ツール。来訪者のブラウザにも本番配信路にも乗らない。
  - **runtime scope**（本番に乗りうる）: `dompurify`(medium/low 多数・XSS系)・`js-yaml`(medium・DoS)・`postcss`(medium・XSS)。
- 供給元・使用箇所の一次確認:
  - `dompurify@3.4.2` ← `mermaid@11.15.0` のみ。サイト自身のHTMLサニタイズは `sanitize-html`（直接依存）で、dompurify は使っていない。markdown-preview ツールも mermaid/dompurify 不使用。→ dompurify はブログの mermaid 図描画経由のみで、図ソースはサイト著作コンテンツ（攻撃者制御外）。
  - `@huggingface/transformers`/`onnxruntime`/`protobufjs`（npm audit では high 表示）は `scripts/generate-kanji-embeddings.ts` のビルド専用スクリプトのみ。来訪者に届かない（Dependabot も別途フラグせず）。
  - `js-yaml` は build 時 frontmatter 解析 + yaml-formatter ツール（来訪者が自分の YAML を入力＝self-DoS で他者を害さない）。
  - `postcss` は next 同梱 8.4.31（XSS該当）と vite 同梱 8.5.14（修正済）。`sanitize-html@2.17.3 invalid: "^2.17.4"` = lockfile 未整合で `npm install` により是正可能。
- **PM の見立て（要・敵対的検証）**: このサイトは静的中心・認証/DB/サーバー側ユーザーデータなし＝stored-XSS で他の来訪者を害す経路がない。high 3 は dev/build 専用、runtime 系は自サイト著作コンテンツ or 来訪者自身の入力（self-harm）に限られる。よって **20件のいずれも「攻撃者が他の来訪者を害せる経路」を持たない可能性が高い**。ただしこれは反証を試みて検証する仮説であり、確定ではない。到達性ありが1件でも見つかれば最優先で塞ぐ。

進め方（小さく分割・サブエージェント委譲・レビュー必須）:

1. 到達性評価（サブエージェント／敵対的検証）→ `reachability.md`。
2. remediation（サブエージェント／npm 操作・非破壊 fix・検証）。
3. reviewer レビュー → 指摘対応。

### 検討した他の選択肢と判断理由

- **他の P1 候補（B-573 UI/UX全面適用・B-562 新クラスタ立ち上げ）ではなく B-505 を選んだ理由**: (1) 前サイクル(285)キャリーオーバーが「security の到達性評価は品質より優先」と明示的に次サイクルへ方向づけ。(2) 来訪者への実害の深刻度上限が最も高い（悪用時 Rule1/2 の harm 直結）。(3) 「到達性評価→届くものを対応→無ければ記録」でスコープが 1 サイクルに完結する。B-573 は「調査＋全面適用」で巨大・分割設計自体が別タスク。
- **「high から順に潰す」案を採らない理由**: high 3 は全て dev-scope で来訪者に届かない。深刻度ラベルは到達性を反映しない。constitution は来訪者価値で測るため、到達性を第一軸にする。

### 計画にあたって参考にした情報

外部仕様（依存パッケージの脆弱性 advisory・修正版の存在）への依存があるため、kickoff 冒頭で現況を一次取得した（2026-07-18 実測）:

- `npm audit`（ローカル実測 2026-07-18）: high 6 / moderate 5 / low 2（npm の推移的深刻度計算。dev 専用の transformers 等を含む）。
- `gh api repos/macrat/yolo-web/dependabot/alerts state=open`（2026-07-18 実測）: open 20件・high 3（undici×2・vite×1、全て development scope）・medium 10・low 7。
- `npm ls dompurify|js-yaml|postcss`（2026-07-18 実測）: 供給元ツリーを上記のとおり確認。
- 使用箇所 grep（src/・scripts/）: dompurify=mermaid経由のみ・transformers=ビルドスクリプトのみ 等を確認。
- 個別 advisory の一次資料（GitHub Advisory / 各パッケージ）は到達性評価・remediation の段で参照し、URL と日付を `reachability.md` に明記する。

## キャリーオーバー

（作業完了時に記載）

## 補足事項

- 前サイクル(285)は kickoff 手順4（着手タスクの選択・実行）を履行しなかった事故サイクル。本サイクルは手順4を確実に履行し、選択した番号付きタスク(B-505)を実行する。
- backlog note には経緯を書かず要約＋参照先のみとする規約（cycle-285 事故3の反省）。経緯・判断理由は本ドキュメントに置く。

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。
