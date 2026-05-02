---
id: 175
description: "ダッシュボード機能フェーズ1（B-309）に着手する。タイル基盤とカスタマイズ配置、localStorage永続化を実装し、新コンセプト『日常の傍にある道具』のコア体験を立ち上げる。design-migration-plan.md の Phase 2 にあたる。"
started_at: "2026-05-01T15:40:06+0900"
completed_at: null
---

# サイクル-175

このサイクルでは、design-migration-plan.md の Phase 2 にあたる **B-309「ダッシュボード機能の実装（フェーズ1: タイル基盤とカスタマイズ配置）」** に着手する。新コンセプト「日常の傍にある道具」のコア体験を支えるタイル基盤を立ち上げ、来訪者が自分の道具箱を組み立てられる土台を作る。

cycle-174 で B-332 が「① 採用（横断検索を新デザインに作る）」に決着し、Phase 1 が完了した。これを受けて Phase 2 に進む。

## スコープ定義（事前確定）

### このサイクルで必ず完了させる範囲（design-migration-plan.md Phase 2 の完了基準と同一）

1. **Phase 2.1 設計判断（3 項目すべて確定）**
   - 道具箱の URL 構成（トップ `/` / 専用 URL / 複数道具箱 のいずれを採るか）
   - メタ型構造（既存の `ToolMeta` / `PlayMeta` の分離維持 / `ToolboxItem` 等の統合 のどちらを採るか）
   - ツールとタイルが 1 対多になり得るか（既存ツール 30 種 + 遊び 13 種を一巡確認した上で結論。推測のみで決めない）
2. **Phase 2.2 基盤実装**
   - `Tile` コンポーネント（`src/components/Tile/`）：サイズ・配置の規約、ドラッグハンドル、編集モード切替
   - ドラッグ&ドロップによるタイル配置 UI
   - localStorage によるレイアウト永続化
   - 2.1 の決定に従ってメタ型に「タイル対応インタフェース」を追加
   - hidden URL（`metadata.robots: { index: false, follow: false }`）または `/storybook` で動作検証

### このサイクルでは扱わないもの（明示的にスコープ外）

- 既存ツール群（30 種 + 遊び 13 種）のタイル化適用 → Phase 7（B-314）
- ペルソナ別プリセット（文章を書く人向け / プログラマー向け 等） → Phase 9.1（B-312）
- ツール間の入出力連携・型システム → B-324
- 道具箱のシェア機能（base64 URL） → B-313
- トップページ・ヘッダー・フッターの再設計 → Phase 4（B-334）/ B-310
- 道具箱ページの来訪者向け公開 → Phase 9.2（B-336）
- 既存ツールへの入出力型定義の追加 → Phase 7（B-314）の責務に含める

### キャリーオーバーが許容される唯一の条件

**Phase 2.1 の設計判断のうち 1 項目以上について「プロトタイプ実装による実証なしには判断できない」と /cycle-planning 段階または作業初期に判明した場合のみ、Phase 2 を 2.1 と 2.2 に分割し、本サイクルは 2.1 のみで終える分割を許容する。**

具体的に想定される構造的理由：

- 「ツールとタイルが 1 対多になり得るか」の判断に、複数ツールのタイル試作が必要と判明した
- メタ型統合 / 分離の判断が、実際にタイル UI を載せた状態でないと比較できないと判明した

**許容しないキャリーオーバー（作業中の後付け判断は禁止）:**

- 「ファイル数が多くて時間切れ」
- 「ドラッグ&ドロップの実装が思ったより複雑だった」
- 「動作検証が手間」
- 「レビュー指摘の修正が膨らんだ」
- これらはすべて作業量見積もりの不備であり、計画段階で割らなかった責任。本サイクル内で完遂する。

### 判断タイミング

`/cycle-planning` フェーズで、上記スコープを 1 サイクルで完遂できる作業計画を立てる。立てられない場合（=「キャリーオーバーが許容される唯一の条件」に該当する場合）、**計画段階で**「Phase 2 を 2.1 / 2.2 に分割し、本サイクルでは 2.1 のみ実施する」とサイクルドキュメントに明記してから着手する。作業中に発覚した場合も、その時点で停止して計画を更新し、Owner にエスカレーションする。後付けで「キャリーオーバー」と書いて済ませることは禁止する。

## 実施する作業

Phase 2.1 設計判断 3 項目は計画段階で確定済み（後述「作業計画」参照）。本セクションは Phase 2.2 基盤実装のサブタスクをチェックリスト化したもの。

- [x] Phase 2.1 設計判断 3 項目の確定（計画段階で完了。URL=`/`、メタ型=共通基底+extension、1 対多=柔軟設計）
- [x] 2.2.1 共通基底メタ型 `Tileable` と `TileDefinition` の型定義追加 + adapter 関数
- [x] 2.2.2 タイル候補の統合 indexer（案 H: codegen 自動集約）
- [x] 2.2.3 DnD ライブラリ採否 + サイズ可変スパイク（半日上限）+ bundle size 計測
- [ ] 2.2.4 編集モード / 使用モードの 2 モード分離設計（旧 [x] / Owner 指摘対応で再オープン: DESIGN.md §4 追記 + コメント整理）
- [ ] 2.2.5 `Tile` コンポーネント（旧 [x] / Owner 指摘対応で再オープン: 移動ボタン + cursor 整合 + view click + focus-visible 競合検証 + touch-action）
- [ ] 2.2.6 ドラッグ&ドロップによるタイル配置 UI
- [x] 2.2.7 初期表示用最小デフォルトプリセット枠組み（`InitialDefaultLayout`）
- [ ] 2.2.8 localStorage 永続化（`useToolboxConfig` フック）
- [ ] 2.2.9 hidden 検証環境（`/toolbox-preview` + 3 層防御）
- [ ] 2.2.10 視覚検証 / アクセシビリティ / E2E（Playwright）
- [ ] 2.2.11 lint / format / test / build の最終確認

## 作業計画

### 目的

新コンセプト「日常の傍にある道具（と、ちょっとした息抜き）」のコア体験である「自分の道具箱を組み立て、毎日反射的に開く」体験を **M1b（気に入った道具を繰り返し使っている人）** に届けるための土台を作る。本サイクル（Phase 2）では来訪者に対する公開はせず、後続フェーズで自然に積み上げられる「タイル基盤」と「設計判断 3 項目の確定」を完了させる。

このサイクルがフェーズ後続に与える前提：

- 本サイクルで道具箱の本公開時 URL を **トップ `/`** に確定する（設計判断 1、後述）。本サイクル中は現行 `/`（旧コンセプトのトップ）を破壊せず、別ルート（`/toolbox-preview` 想定）で hidden 検証する。Phase 4.4（B-334 現行トップ移行）は本サイクル後に行い、Phase 9.2（B-336 本公開）で `/` への正式統合・現行トップ廃棄を実施する
- Phase 4（B-334 トップ・一覧再設計）は本サイクルで決まったメタ型を前提に一覧/トップを設計できる。Phase 2.1 のメタ型決定なしに先行すると後で作り直しになる
- Phase 7（B-314 タイル化適用）は本サイクルで決まった「タイル対応インタフェース」と「1 対多サポート方針」に従ってツール 30 種・遊び 13 種を順次タイル化する。本サイクルで定義する「初期表示用最小デフォルトプリセット」のスロット参照は、Phase 7 で各ツールがタイル化されるたびに実タイルへ差し替える
- Phase 9.1（B-312 ペルソナ別プリセット）/ Phase 9.2（B-336 本公開）/ Phase 9.4（B-313 シェア）は本サイクルで決まった URL 構成とローカルストレージスキーマを前提に積み上げる

M1a（特定の作業に使えるツールをさっと探している人）への影響：本サイクルでは「来訪者向け公開なし」のため発生しない。Phase 9.2 以降で `/` が道具箱化された後の M1a への影響については、調査では「M1a はツール詳細ページに直接着地する経路で来訪する」事実が確認されており、`/` 道具箱化が M1a の検索流入経路を阻害する可能性は限定的と推定される。`/` に迷い込んだ M1a 向けには、SSR で出す初期プリセット（最小デフォルト 4〜6 個）の並びが「このサイトに何があるかの紹介」として機能する設計を意図している。ただしこの「紹介として機能する」想定は推測であり、Phase 9.2 本公開時点で GA4 による M1a 流入経路（ツール詳細直着地率・トップ経由率・離脱率）の実測モニタリングを行い、必要なら AB 検証で初期プリセットの構成を調整する責務を Phase 9.2 担当者に申し送る（後述）。

### 作業内容

#### Phase 2.1: 設計判断 3 項目

各項目について、**新コンセプトを最大化する観点だけ**で判断する。現状保護・既存破壊回避・実装コストを根拠に採用しない。判断軸はすべて「M1b のコア体験『毎日反射的に開いて道具箱を使う』を最大化するか」「フェーズ後続の柔軟性を担保するか」「コンセプト『日常の傍にある道具』を体現するか」の 3 つに統一する。

##### 設計判断 1: 道具箱の URL 構成

**判断軸**（新コンセプト最大化のみ。「現行トップ温存余地」「将来の判断自由度の温存」「複数化将来移行の破壊度」は軸に含めない）:

- 軸 A: コンセプト「日常の傍にある道具」体現の最大化（ブラウザのホーム/新規タブに設定して毎日反射的に開く場所として URL が成立するか）
- 軸 B: M1b のコア体験「自分の道具箱を組み立て、毎日反射的に開く」最大化（サイト名検索・ブクマ・URL 直入力の最短性、再訪導線の自然さ）
- 軸 C: M1a の検索流入を阻害しないか（M1a はツール詳細直着地でトップを通らない事実は調査確認済。トップ道具箱化が M1a の検索経路に直接影響するか）
- 軸 D: SEO・初回着地体験（SSR で静的 HTML を確保できるか、Googlebot/SNS シェア時の OGP/メタが成立するか）
- 軸 E: シェア URL 設計（B-313 後続）の自然さ

**候補と評価**:

| 軸                | 候補 1: トップ `/`                                                                                                                                  | 候補 2: 専用 `/toolbox`                                                      | 候補 3: 複数 `/toolbox/[id]`                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A コンセプト体現  | 最強（ホーム/新規タブ設定で毎日反射的に開く場所として URL が最短）                                                                                  | 中（1 階層深く「専用機能ページ」感が出る）                                   | 弱（さらに深い + デフォルト道具箱指定が必要）                              |
| B M1b コア体験    | 強（サイト名検索 "yolos" 着地が `/`、ブクマ/URL 直入力が最短）                                                                                      | 中（ブクマ後は差が縮むが、サイト名検索着地は `/` のため再訪導線で 1 段不利） | 弱（複数管理 UI が「タスク管理ツール」の世界観に寄り「日常の道具」と乖離） |
| C M1a 流入阻害    | 影響軽微（M1a はツール詳細直着地のためトップを通らない事実が調査確認済。`/` 道具箱化でも検索経路は不変）                                            | 影響軽微（同上）                                                             | 影響軽微（同上）                                                           |
| D SEO・初回着地   | 強（SSR で「最小デフォルトプリセット」を出せば HTML は静的に確保。Googlebot は最小プリセット状態を見るためインデックス可能、SNS の OGP も静的確保） | 強（同等）                                                                   | 強（同等）                                                                 |
| E シェア URL 設計 | 強（`/?state=[base64]` で最短 URL。canonical を `/` に固定すれば SEO 整理可能。短い URL は認知性が高くシェア再訪に有利）                            | 中（`/toolbox?state=[base64]`、`/` より 1 階層長い）                         | 弱（複数化対応のため `/toolbox/shared/[base64]` 等の追加設計が必要）       |

**判断結論: 候補 1「トップ `/` を道具箱として動作させる」を採用する**

根拠（新コンセプト最大化観点での `/` の積極的優位性）:

1. **軸 A**: 「日常の傍にある道具」をユーザーがブラウザのホーム/新規タブに設定して毎日反射的に開く場所として `/` は最短。`/toolbox` は 1 段の階層追加で「専用機能ページ」感が出てコンセプトと逆行する
2. **軸 B**: サイト名検索（"yolos"）の SERP 着地は `/` であり、M1b の「再訪 → 即道具箱」体験を最短化できるのは `/` だけ。`/toolbox` を採るとサイト名検索後に `/` から `/toolbox` へ 1 タップ追加が発生し続ける
3. **軸 C**: `/` 道具箱化は M1a の検索流入経路（ツール詳細直着地）に直接影響しないと推定される（M1a がトップを通らない事実は調査確認済）。`/` に迷い込んだ M1a 向けに SSR で出す「初期道具箱（最小プリセット）」が「このサイトに何があるかの紹介」として機能する想定。実測モニタリングは Phase 9.2 申し送り
4. **軸 E**: シェア URL は短いほど認知性・記憶しやすさで優位。`/?state=` のほうが `/toolbox?state=` より短く、SNS 上での視認性・再訪率で優位
5. **`/toolbox` を選ぶ積極的理由が新コンセプト最大化観点では見当たらない**。`/toolbox` の優位として残るのは「現行トップ温存余地」「将来の自由度温存」のみで、これは Owner 指示により判断軸から除外されている

##### 設計判断 1 補足: 「最終形 URL 確定」と「本サイクル中の検証ルート選定」は別レイヤー

設計判断 1 は **本公開時の最終形 URL** を確定する判断であり、`/` を採用する。一方、本サイクルは hidden（noindex）検証段階であり、検証実装をどの URL に置くかは別レイヤーの運用判断（Phase 2.2 実装手段の問題）である。両者を混同しない。

**本サイクル中の検証ルート選定**（独立小判断）:

- 案 i: `/`（最終形 URL そのもの）に hidden 検証実装を置き、metadata.robots noindex + 環境変数ガードで本番では 404 にする
- 案 ii: 別ルート `/toolbox-preview` に hidden 検証実装を置く

**評価**:

- 案 i は「最終形 URL で検証」できる利点があるが、`/` には現行 `/`（旧コンセプトのトップ）が稼働しており、検証実装で上書きすると環境変数ガードがあっても誤設定リスクで現行 `/` 訪問者全員に即時悪影響が出る可能性がある（`/` は M1b の再訪導線・M1a の万一のトップ着地・SEO のサイト評価対象すべての受け口で、被害範囲が最大）
- 案 ii は別ルートのため、検証実装の不具合や環境変数の設定ミスがあっても現行 `/` 訪問者には影響が出ない。最終形と別 URL である違いは、Phase 9.2 の「現行 `/` を廃棄して `/` に道具箱を統合」の作業で吸収できる（実装は同じ Server Component と Client Component を `/` 配下に move するだけ）

**選定: 案 ii（`/toolbox-preview`）**。最終形 URL の確定（`/`）と検証ルート選定（`/toolbox-preview`）はレイヤーが違うため、設計判断 1 結論「`/` 採用」と矛盾しない。Phase 9.2 で `/toolbox-preview` の実装を `/` 配下に統合し、現行トップを廃棄する。

##### 設計判断 1 に伴う追加判断: 初期表示用最小デフォルトプリセット

`/` 採用は「初回来訪者・SNS シェア訪問者・Googlebot に空の道具箱を見せない」ための SSR 静的レンダが必要となり、これは固定の最小デフォルトプリセット（4〜6 個の標準ツールが並んだ初期道具箱）の存在を前提とする。

**追加判断の選択肢（α / β / γ / δ）**:

- α: `/` 採用 + 最小デフォルトプリセット 1 種をフェーズ1 スコープに追加
- β: `/` 採用 + 初期は SSR で「ようこそ画面 + 主要ツール案内」の静的コンテンツのみを出す（プリセットなし、空状態 UI）
- γ: `/toolbox` 採用 + フェーズ1 スコープ通り、`/` の役割は別途検討
- δ: その他

**β の評価**: 初回来訪者にいきなり「ようこそ画面 + 案内」を出す設計は道具箱の価値を直接伝えられず、NN/g 研究でも「empty state + 説明 のみは機会損失」とされる。`/` 採用の優位性（軸 A〜E）を生かすには「最小プリセットが既に並んでいる状態」が SSR HTML で見えることが必須。β は軸 D を半壊させるため不採用。

**γ の評価**: 設計判断 1 で `/` を採用した以上、最終形を保留する γ は判断結論と矛盾するため不採用。

**α の細分化（α-1 vs α-2）**:

- α-1: 最小プリセットに必要な実タイル 4〜6 個を本サイクルで先行タイル化（Phase 7 作業の前倒し） → スコープ事前確定の「既存ツールのタイル化適用は Phase 7」と矛盾
- α-2: プリセット定義の型・ロード機構・SSR レンダ「枠組み」だけ本サイクルで実装し、本サイクルの hidden 検証ではダミータイルで枠組みの動作を実証する。実タイルの中身は Phase 7 で各ツールがタイル化されるたびに追加し、Phase 9.2（本公開）時点で初期プリセット 4〜6 個分の実タイルが揃っていることを本公開の前提とする → スコープ事前確定と整合

**α-2 を採用**。新コンセプト最大化観点での最終形（`/` 道具箱化）を本サイクルで確定させつつ、スコープ事前確定の「Phase 7 タイル化適用は本サイクル外」と整合する。**B-312（ペルソナ別の複数プリセット + 選択 UI）は引き続きスコープ外**。α-2 が指す「初期表示用に固定で展開される 1 種類の最小プリセット（ハードコード定数）」は B-312 とは性質が異なり、`/` 採用の必然的な実装要素として基盤実装に含める。

**Phase 9.2 への申し送り（PM へのエスカレーション要、本サイクルの計画外）**:

- 本公開（Phase 9.2 / B-336）の前提条件として「Phase 7 のタイル化進捗が初期プリセットに必要な実タイル 4〜6 個分（fortune-daily ミニカード版、char-count、unit-converter ほか M1a 流入の高いツール群を想定）に達していること」を追加する必要がある。design-migration-plan.md Phase 9.2 / backlog B-336 への反映は PM の責務
- Phase 4.4（現行トップ移行）と Phase 9.2（道具箱本公開）の関係：`/` 道具箱化を採用したため、Phase 4.4 で移行する現行トップ内容は Phase 9.2 で**廃棄**する（design-migration-plan.md が認める 3 択「別ページに移す / 統合する / 廃棄する」のうち廃棄を選択）。新コンセプト下で旧コンセプトのトップを温存する積極的理由はないため、廃棄が新コンセプト最大化観点での自然な選択
- **M1a 流入経路の本公開後モニタリング**: Phase 9.2 で `/` を道具箱化した後、GA4 で次の指標を実測する責務を Phase 9.2 担当者に申し送る。(1) ツール詳細ページ直着地率の変化（理論上は無影響、実測で確認）、(2) `/` の離脱率（M1a が迷い込んだ際の即離脱率）、(3) `/` から個別ツールへの遷移率（初期プリセットが「紹介として機能している」かの間接指標）。指標悪化が観測された場合は初期プリセットの構成（タイル選定・並び順）を AB 検証で調整する

**プロトタイプ実証必要性の評価**: 不要。URL 構成と初期プリセット枠組みの判断は、実装前の論理判断と既存調査（タイル棚卸し / URL 構成調査 / フェーズ1 ベストプラクティス）で確定可能。

##### 設計判断 2: メタ型構造（統合 vs 分離）

**判断軸**:

- 軸 A: 「タイル」という単一 UI 概念で全コンテンツを扱う際の整合性
- 軸 B: 操作モデルが大きく異なる種別（ツール vs 多段階フローのゲーム vs 静的リファレンスのチートシート）の差を表現できるか
- 軸 C: Phase 4 で一覧/トップが新メタ型を前提に作られるため、その時点で「タイル列挙」と「種別ごとの専用一覧」が両方ストレスなく作れるか

**候補と評価**:

- 候補 1（完全統合 `ToolboxItem` 単一型）: 軸 A 最強、軸 B 弱（ゲームの statsKey/isDaily, ツールの howItWorks/faq, チートシートの sections など種別固有フィールドを optional で詰めると型が肥大）、軸 C 中（一覧側で contentKind による分岐が増える）
- 候補 2（完全分離 `ToolMeta` / `PlayMeta` / `CheatsheetMeta` を維持）: 軸 A 弱（タイル列挙で 3 配列をマージするコードが各所に分散）、軸 B 強、軸 C 中
- 候補 3（段階的統合: 共通基底型 + 種別 extension）: 軸 A 強（タイル化に必要な共通フィールドだけを統一）、軸 B 強（種別固有は extension 側に残せる）、軸 C 強（タイル列挙は基底型で / 種別一覧は extension 型で書ける）

**判断結論: 候補 3「共通基底型 `Tileable`（仮称）+ 種別 extension（既存 ToolMeta / PlayContentMeta / CheatsheetMeta が extends する）」を採用する**

根拠（新コンセプト最大化観点）:

1. 棚卸し（`tmp/research/2026-05-01-b309-tool-tile-inventory.md`）で 60 件中 38 件（63%）がタイル専用コンポーネントを必要とすることが判明。種別差は構造的に大きく、完全統合は overfit
2. 「タイル」という単一概念は新コンセプトの中核。共通基底に最低限のフィールド（slug / displayName / shortDescription / contentKind / icon? / accentColor? / publishedAt / tile 対応インタフェース）を統一することで、ダッシュボード側コードの分岐は基底型で完結し、新コンセプト「日常の傍にある道具」がタイル列挙という単一抽象で表現される
3. Phase 4 の一覧設計で「タイル列挙ベースの統合一覧」と「種別別の専用一覧」の両方を新コンセプト最大化観点で必要に応じて構築できる設計柔軟性を担保する。完全統合では種別固有フィールドが基底型を肥大化させて種別別一覧の表現力が落ち、完全分離ではタイル列挙の整合性が落ちる
4. Phase 7 の段階導入時に「タイル化が済んだ種別から順に新メタ型へ移す」段階導入が可能で、各種別がタイル化されるタイミングで設計を反映しやすい

**共通基底型 `Tileable` に持たせる最小フィールド**（後続実装の指針）:

- `slug`, `displayName`（既存 ToolMeta `name` / PlayContentMeta `title` / CheatsheetMeta `title` を吸収する共通名。adapter 関数または getter で既存値から派生させる）, `shortDescription`, `contentKind`（"tool" | "play" | "cheatsheet"）, `icon?`, `accentColor?`, `publishedAt`, `trustLevel`
- タイル対応インタフェース：設計判断 3 の結論に従って構成（後述）

**プロトタイプ実証必要性の評価**: 不要。型レベルの判断は実装前の論理検証で確定可能。具体的な共通フィールド集合は調査レポート（`dashboard-tile-codebase-survey.md` 1 章）で既に列挙済み。

##### 設計判断 3: ツールとタイルが 1 対多になり得るか

**判断軸**:

- 軸 A: 同一ツール / 遊び / チートシートに複数のタイルバリエーション（フル機能版・簡素版など）を持つ必要性が、実コンテンツの棚卸しで確認できるか
- 軸 B: 同一ツールに複数バリエーションを提供する将来需要（用途別タイル種別）
- 軸 C: メタ型インタフェースの単純さ（1 対 1 = 単一参照、1 対多 = 配列）

**候補と評価**:

- 候補 1（1 対 1 のみ）: 軸 A 弱（△判定 14 件で複数バリエーション需要が確認されており、1 対 1 では表現不可）、軸 B 弱、軸 C 強
- 候補 2（1 対多サポート、常に配列）: 軸 A 強、軸 B 強、軸 C 中（1 件しかなくても配列扱い）
- 候補 3（柔軟設計: 単一参照 default + 配列 optional）: 軸 A 強、軸 B 強、軸 C 強（1 対 1 は単一参照、1 対多は配列も使える）

**判断結論: 候補 3「柔軟設計（タイル参照は単一が基本、配列も許容）」を採用する**

根拠：

1. 棚卸し（60 件）の △判定 14 件（password-generator のワンクリック生成版、color-converter のピッカーのみ版、age-calculator の年齢のみ版、fortune-daily のミニカード版など）で、「フル機能版（詳細ページ）と簡素版（タイル）の 2 種を持つ価値」が実コンテンツで確認されている。M1b の「自分の道具箱を組み立てる」体験では「ホーム画面のウィジェット的な簡素版」と「詳細ページのフル機能」の使い分けが新コンセプト最大化に寄与する
2. ×判定 38 件は別コンポーネント必須だが、これは「1 対 1 でも別コンポーネント参照を 1 つ指定すれば成立する」ため候補 1 でも対応可能。候補 1 を否定する根拠は ×判定ではなく △判定の複数バリエーション需要
3. ただし本サイクルのスコープでは「既存 60 件のタイル化適用」は Phase 7 のため、現時点で複数バリエーションを実装する必要はない。インタフェースとして「単一参照を基本、配列も書ける」形にしておけば Phase 7 で個別判断できる
4. 推測ではなく棚卸しに基づく結論

**メタ型タイル対応インタフェース（候補 3 採用時の最終形）**:

- `tile?: TileDefinition | TileDefinition[]` （未指定 = タイル化対象外。単一なら 1 タイル、配列なら複数バリエーション）
- `TileDefinition`: { id（バリエーション識別、配列時のみ必須）, component（タイル用 React コンポーネントへの参照）, recommendedSize（"small" | "medium" | "large"）, tileableAs（"full" | "preview-only" | "link-card"）, label?（バリエーション表示名） }

**プロトタイプ実証必要性の評価**: 不要。棚卸し（実コンテンツ 60 件の操作モデル分類）で結論が出ており、プロトタイプ追加で結論は変わらない。

##### 3 つの設計判断 × キャリーオーバー条件の総合評価

3 項目すべて「プロトタイプ実証なしで判断可能」と評価。本サイクルの**キャリーオーバー条件には該当しない**。Phase 2.1 + Phase 2.2 を 1 サイクルで完遂する計画として進める。

なお、Phase 2.2 内には「dnd-kit によるグリッドサイズ可変ソートの実装手段選定」（後述 2.2.3 サブタスク）に既知の落とし穴（dnd-kit Issue #117 / #720 / #1692）があり、半日上限のスパイクで早期分岐する事前条項を設けている。これは Phase 2.1 設計判断 3 項目の判断材料（URL / メタ型 / 1 対多）とは別レイヤーの実装手段問題であり、キャリーオーバー条件「設計判断のうち 1 項目以上がプロトタイプ実証なしには判断できない」には該当しない。スパイク不調時のフォールバック（medium 固定）も事前明記しており、本サイクル完遂を保証する。

#### Phase 2.2: 基盤実装

各タスクの工数感を【軽 / 中 / 重】で示す。重 のタスクは特にスケジュールリスクが高いため、事前条項のあるものは併記する。

##### 2.2.1 共通基底メタ型 `Tileable` と `TileDefinition` の型定義追加【中】

- 配置：`src/lib/toolbox/types.ts` を新設
- 既存 `ToolMeta`（`name` フィールド）/ `PlayContentMeta`（`title` フィールド）/ `CheatsheetMeta`（`name` と `title` 両方）のフィールド名差異を吸収する設計を確定する。次の 2 案から選ぶ:
  - 案 a: `Tileable` は `displayName` を要求し、各既存型から `displayName` を派生させる adapter 関数（`toTileable(meta: ToolMeta | PlayContentMeta | CheatsheetMeta): Tileable`）を提供する。既存の registry / types を一切書き換えない
  - 案 b: 既存型に `extends Tileable` を付け、`displayName` を getter / 重複フィールドで提供する形に書き換える
- **案 a を推奨**（既存の registry 60 件の値を 1 行も書き換えずに `npm run build` が通る、後続フェーズ 4 / 7 でメタ型再設計の自由度を残せる、新コンセプト最大化観点でも段階的に新メタ型を導入できる）。実装段階で型エラーが出たら案 b に切替検討
- `TileDefinition` の `recommendedSize` 採否は実装手段スパイク（2.2.3）の結論で `"small" | "medium" | "large"` か `"medium"` 固定かが決まる。本タスクはスパイク結論後に着手する
- 完了判定:
  - `Tileable` と `TileDefinition` 型が `src/lib/toolbox/types.ts` に定義されている
  - `toTileable()` adapter 関数が定義され、3 種の既存メタ型 60 件すべてを変換できる単体テスト pass
  - 既存 60 件の registry 値（`src/tools/registry.ts` 等）を本サイクルで一切書き換えていない
  - `npm run lint && npm run build` が通る（既存メタ型を変更していないので既存ビルド・既存テストが破壊されない）

##### 2.2.2 タイル候補の統合 indexer【軽】

- 配置：`src/lib/toolbox/registry.ts`（または `tile-registry.ts`）
- `allToolMetas` / `allPlayContents` / `allCheatsheetMetas` の 3 registry を `toTileable()` 経由で `Tileable[]` 統合配列にマージする関数（`getAllTileables()`）と、slug → Tileable の Map を提供
- 完了判定:
  - 60 件すべてが Tileable として列挙される（タイル化対象外でも基底型として列挙可能）
  - `tile` フィールドが定義されているエントリだけを返す `getAllTileableEntries()` も提供（本サイクルでは 0 件を想定）
  - 同一 slug が複数 contentKind で衝突しないことを単体テストで検証

##### 2.2.3 DnD ライブラリ採否 + グリッドサイズ可変スパイク【重】（事前条項あり）

**ライブラリ採用**: `@dnd-kit/core` + `@dnd-kit/sortable`

**根拠**: 軽量（合計 ~9KB gzip）、TypeScript ネイティブ、WCAG 2.1 AA 対応、タッチ・キーボード・ポインター対応、メンテ活発（2026/4 更新）。`react-grid-layout` は ~28.7KB かつ a11y 弱、SSR 不可（Next.js App Router 制約）。`react-beautiful-dnd` は非推奨。自前実装は a11y/タッチ/キーボード対応の実装コストがライブラリ採用の数倍を超える。

**既知の落とし穴と事前条項（本サイクルの最大リスク）**:

dnd-kit の標準ソート戦略（rectSortingStrategy 等）は**同サイズタイル前提**であり、`grid-column: span N` で span が異なるタイル混在では (a) ドラッグ中アイテムが他サイズに引き伸ばされる、(b) 並び替えロジックが座標から index を誤推定する、という既知問題が dnd-kit Issue #117, #720, #1692 で報告されている。回避策（empty strategy + onDragOver で自前並び替え + DragOverlay でゴースト描画）は非自明。

**サブタスクとして「サイズ可変スパイク（半日上限）」を実施**:

- 目的：3 サイズ混在（small × 2、medium × 2、large × 1 以上）で並び替え・削除・追加が破綻しない実装手段を確定する
- 上限：実作業半日（実装試行とドキュメント調査を含む）。本上限を超えてもフォールバック（後述）に切替することで本サイクル完遂を保証する
- 評価軸：標準 strategy で動くか / empty strategy + 自前並び替えで動くか / どちらも動かないか
- スパイクの完了判定:
  - 結論が「標準 strategy で動く」: 2.2.6 を当初計画通り 3 サイズ混在で進める
  - 結論が「empty strategy + 自前並び替えが必要」: 2.2.6 の実装手段を確定し、追加工数（中程度）を見込んで進める
  - 結論が「半日上限で結論が出ない / どちらも動かない」: **フォールバック発動**。2.2.5 / 2.2.6 / 2.2.7 / 2.2.9 のサイズ概念を **medium 固定**に切替（`recommendedSize` は型としては残すが、本サイクルは medium のみ実装）。サイズ可変は将来課題として backlog に切り出し PM へ申し送り

**フォールバック発動条件は半日上限到達のみ**。「思ったより複雑」「動くが綺麗じゃない」等の感覚的理由でのフォールバックは不可（スコープ事前確定の「許容しないキャリーオーバー」と整合）。

**bundle size 確認**:

- ベースラインを `npm run build` の First Load JS（共通バンドル + `(new)/storybook` ルート）で測定し、dnd-kit 追加後の First Load JS との差分を記録
- 完了判定: 共通バンドルの増加が +15KB gzip 以内（dnd-kit/core + sortable の理論値 ~9KB に余裕を見込む）

**全体完了判定**:

- `package.json` に `@dnd-kit/core`、`@dnd-kit/sortable` 追加
- `npm install` 成功、`npm run build` 通過
- スパイクの結論が記録され、3 サイズ実装 / medium 固定フォールバックのいずれかに分岐確定
- bundle size 増加が +15KB gzip 以内

---

**【完了記録】2.2.3 スパイク結論（cycle-175 実施）**

_計測手段_: `build-manifest.json` の `rootMainFiles` + `polyfillFiles` を列挙し、`gzip -c <file> | wc -c` で個別計測して合計（Next.js 16 Turbopack は CLI に kB 列を出力しないため）。

_ベースライン_: コミット `bbf64354`（cycle-175 作業計画確定、dnd-kit 追加前）でビルド後に計測。

| 計測対象                                                   | raw       | gzip                                |
| ---------------------------------------------------------- | --------- | ----------------------------------- |
| 共通バンドル ベースライン（rootMainFiles + polyfillFiles） | 511.0 KB  | 157.0 KB                            |
| 共通バンドル dnd-kit 追加後                                | 511.0 KB  | 156.9 KB                            |
| **共通バンドル増加**                                       | **+0 KB** | **+0 KB（判定基準 +15 KB 以内 ✓）** |
| dnd-kit lazy chunk（`9a5345b21a62c2f8.js`）                | 50.2 KB   | 16.9 KB                             |
| /dnd-spike ページ固有 JS（参考値、2.2.6 完了時に削除）     | 50.2 KB   | 16.9 KB                             |

dnd-kit は `build-manifest.json` の `rootMainFiles` に含まれず、`/dnd-spike` ページアクセス時のみ lazy chunk として追加取得される。他ページの First Load JS への影響はゼロ。

_経路 A 不採用（rectSortingStrategy）_:

- **観測事象**: Playwright でドラッグ中に DragOverlay が全幅（span 4 = 4カラム幅）に引き伸ばされた（Issue #117）。ドラッグ途中でグリッドレイアウトが崩壊。
- **再現手順**: `small × 2、medium × 2、large × 1` の 5 タイル配置で Small 1 を Large 1 の位置へドラッグ → 途中のスクリーンショット（`tmp/dnd-mid-drag.png` に記録）で確認。
- **判定**: Issue #117 ゴースト引き伸ばしが許容範囲を超えるため不採用。

_経路 B 採用（empty strategy + 自前 onDragOver + DragOverlay）_:

- **実装方針**: `SortableContext` の `strategy` に `() => null` を渡して標準変換アニメーションを無効化、`onDragOver` で `arrayMove` を用いたリアルタイム並び替え、`DragOverlay` でドラッグ元サイズ固定のゴーストを描画。
- **動作確認した範囲**:
  - マウスドラッグ: 先頭→末尾、途中→末尾の 2 回の並び替えが正常動作
  - DragOverlay サイズ: Playwright の `boundingClientRect` 計測で Small(196px) / Medium(404px) / Large(612px) がドラッグ元と完全一致。`gridColumn: span N` は DragOverlay（portal）環境でも機能する（dnd-kit が Overlay に元要素の width を自動設定するため）。
  - キーボード操作: `KeyboardSensor` で Space→ArrowRight→Space による並び替えが動作（Playwright 検証済み）。
  - findIndex -1 ガード: `if (oldIndex < 0 || newIndex < 0) return items;` を実装済み。
- **未検証範囲（2.2.6 の完了判定で本格検証する）**:
  - タッチ操作（TouchSensor）
  - 50 個並べた場合のパフォーマンス（100ms 以内基準）
  - 0 個状態・1 個状態のエッジケース（追加スロット実装は 2.2.6 スコープ）
  - `closestCenter` vs `closestCorners` の安定性比較（Issue #1450 振動問題、2.2.6 で再評価）

_後続 2.2.4〜2.2.7 が前提とする設計_:

- `SortableContext` に `strategy={() => null}` を渡す
- `DndContext` に `onDragOver` で `arrayMove` 並び替えを実装（`onDragEnd` は activeId リセットのみ）
- `DragOverlay` でドラッグ元 tile と同一の props で再レンダー（サイズ一致はライブラリが保証）
- `SIZE_SPAN: Record<TileSize, number> = { small: 1, medium: 2, large: 3 }` のマッピングを `Tile` コンポーネントに昇格させる（2.2.5 で `src/components/Tile/` 配下に正規配置）
- handleDragOver 内の findIndex -1 ガードは必須（`if (oldIndex < 0 || newIndex < 0) return items;`）

_スパイクページ取扱方針（PM 決定）_: **方針 B 採用**。`SortableTile` / `RouteBGrid` / `SIZE_SPAN` / `SIZE_COLOR` / `INITIAL_TILES` の実装を 2.2.5〜2.2.6 で `Tile` コンポーネントへ昇格させる。`/dnd-spike` は **2.2.6 完了時に削除**。フィクスチャは 2.2.7 で `src/components/Tile/fixtures/` に正規配置。

_フォールバック発動条件（2.2.6 への decision point）_: 経路 B で 2.2.6 実装を進めるが、着手から **4 時間時点**で以下のいずれかが判明した場合は medium 固定にフォールバック:

1. `KeyboardSensor` でグリッドレイアウトが破綻する（修正不能）
2. 50 個並べた場合のドラッグ開始から次フレーム描画が 100ms を超える（Playwright trace で確認）
3. `DragOverlay` のサイズが実機で正しく固定されない（調査・修正で 1 時間超）

_所要時間_: ベースライン計測 → 経路 A 試行（30 分）→ 経路 B 試行（45 分）→ Playwright 追加検証（30 分）= 合計約 1 時間 45 分（半日上限 4 時間以内）。

---

##### 2.2.4 編集モード / 使用モードの 2 モード分離設計【中】

- パターン：明示的トグルボタン型（NN/g 推奨、Trello / Notion / Linear が採用）
- 「使用モード」既定。ページ右上または各タイルの近傍に「編集」ボタン
- 編集モードに遷移すると、背景が薄いオーバーレイ、各タイルのドラッグハンドル / 削除アイコン / 追加スロットが現れる、タイル内の通常クリック操作は無効化（タイル本体への click ハンドラには `mode === "edit"` で early return を仕込む）
- 「完了」ボタンで使用モードへ戻る
- DnD と mode の整合（指摘 1-6 反映）：**編集モードのときのみ `DndContext` を mount する**（または `useSortable` に `disabled: mode !== 'edit'` を渡す）。使用モード中は dnd-kit 自体が無効になり keyboard sensor も発火しない
- z-index レイヤ設計（AP-I08 回避）：編集モードオーバーレイは `position: fixed` + `z-index: 100`（仮値）、各タイルは `position: relative; z-index: 200`（オーバーレイより前面）。Playwright の `document.elementFromPoint` で各操作要素が前面に出ていることを検証
- スクロールロック（AP-I07 回避）：編集モード遷移時にスクロールロックが必要なら `document.body.classList.add('scroll-locked')`（既定義）方式。`document.body.style.*` の直書きは禁止
- 完了判定:
  - 2 モードが視覚的に明確に区別される（背景色 / ボーダー / カーソル変化）
  - 編集モード中、フィクスチャタイル内に仕込んだ `onClick → count++` テストで count が増えないことを Playwright で検証
  - 使用モード中、ドラッグ操作が発火しない（`useSortable` の `disabled` または DndContext 非 mount を Playwright で検証）
  - キーボードのみで両モード切替・タイル操作（移動・削除・追加）が可能（dnd-kit の keyboard sensor を編集モードでのみ有効化）
  - 編集モードオーバーレイの z-index 配置が `document.elementFromPoint` 検証で前面化されている

##### 2.2.5 `Tile` コンポーネント【中】

- 配置：`src/components/Tile/` 配下（PascalCase 規約に従う、cycle-171 で確立）
- 構成：`Tile.tsx`（外殻：枠・ヘッダー・ドラッグハンドル・削除ボタン・サイズ枠）、`Tile.module.css`、必要に応じて `EmptySlot.tsx`（追加用スロット）
- DESIGN.md 規約：パネル本体は影なし、ドラッグ中のみ `--shadow-dragging` 適用（globals.css 既定義）。角丸は `--r-normal`、インタラクティブ要素は `--r-interactive`
- props 設計：`tileable`（Tileable 型）, `variant?`（バリエーション id）, `size`, `mode`（"view" | "edit"）, ドラッグイベントハンドラ
- 内部のコンテンツ部は `tile.component` を render（タイル化対象外なら link-card フォールバック）
- z-index：ドラッグ中のタイルは `z-index: 300` で他タイルとオーバーレイより前面化
- 完了判定:
  - `/storybook` または検証ルートに「タイル sample（small / medium / large、または medium 固定フォールバック時は medium のみ）× 使用モード / 編集モード × ライト / ダーク」のすべての組合せを表示できる
  - ドラッグ中の `--shadow-dragging` 適用、編集モードのオーバーレイが目視で確認できる
  - キーボード操作（Tab → Enter で編集 → 矢印で移動 → Space で確定）でレイアウト変更が可能
  - DESIGN.md チェックリスト準拠（dark mode は `:global(:root.dark)`、PascalCase ファイル / ディレクトリ、`--shadow-*` / `--r-*` トークン使用、`focus-visible` スタイルあり）

##### 2.2.6 ドラッグ&ドロップによるタイル配置 UI【重】（2.2.3 スパイク結論に依存）

- グリッド方式：CSS Grid + `grid-column: span N`（small / medium / large の 3 サイズに対応。フォールバック発動時は medium 固定）
- dnd-kit の `DndContext` + `SortableContext` + `useSortable`（2.2.3 のスパイク結論に従って sorting strategy を選択）
- 配置順序のみ管理（フェーズ1 では絶対座標管理は不要）
- タイル追加：編集モードで「+ ツールを追加」を押すと、`getAllTileableEntries()` が返す `tile` 定義のあるエントリから選択するモーダル。本サイクルは実タイル 0 件想定だが、フィクスチャダミータイル（2.2.7 と共用、small × 2 / medium × 2 / large × 1 を含む 5〜7 種）から追加できる検証動作で実証する
- タイル削除：編集モードで各タイルの x ボタン
- 完了判定:
  - 検証ルート上で **small × 2、medium × 2、large × 1 以上の混合 5 タイル**（フォールバック発動時は medium のみ 5 個）を配置 → 順序入れ替え → 削除 → 追加 → 完了 のフロー一通りが動く
  - エッジケース：(i) 0 個状態は「+ 追加」スロットのみ表示で破綻なし、(ii) 1 個状態でも DnD が破綻しない、(iii) 50 個並べた場合のスクロール / 並び替えにパフォーマンス劣化なし（Playwright trace でドラッグ開始から次フレーム描画まで 100ms 以内、かつ 16ms を超えるフレームが連続しないことを確認）
  - ドラッグ中の視覚フィードバック（DESIGN.md 規定: `box-shadow: var(--shadow-dragging)` のみ、半透明 opacity は使わない。物理的隠喩「持ち上げて運ぶ」を保つ）が出る
  - タップとドラッグの区別が明確（誤動作なし）
  - サイズ混在のとき、ドラッグ中アイテムが他サイズに引き伸ばされない、index 推定が破綻しない（2.2.3 スパイクで対処済の要件）

##### 2.2.7 初期表示用最小デフォルトプリセットの枠組み（α-2 採用に伴う必須実装）【中】

設計判断 1（`/` 採用）の必然要素として、初回来訪者・SNS シェア訪問者・Googlebot に「空でない初期道具箱」を SSR で見せる枠組みを実装する。

- 型名と配置：`src/lib/toolbox/initial-default-layout.ts`（型名 `InitialDefaultLayout`、export 定数 `INITIAL_DEFAULT_LAYOUT`）
- **B-312 との明示的分離**（指摘 1-2 反映）: 本ファイルは「単一・固定・初期表示専用」の暫定型である。B-312（ペルソナ別の複数プリセット + 選択 UI）が来た時点で、B-312 担当者は本型を破棄して別の型・別の構造に再設計してよい（後方互換は不要）。本型は B-312 の中核を先取りしない。コメントで「This is an interim type for `/` initial render only. B-312 may redesign this entirely.」と明記
- 型定義：`InitialDefaultLayout = { tiles: Array<{ slug: string; variantId?: string; size: "small" | "medium" | "large"; order: number }> }`
- 本サイクルでは実タイル 4〜6 個分のスロット定義のみを暫定で書く。スロットは「タイル化された Tileable がまだ存在しないため、現時点ではフィクスチャダミータイル参照」で埋める。Phase 7 で各ツールがタイル化されるたびに、本ファイルの slug 参照を実タイルへ差し替える運用
- フィクスチャ分布：`src/components/Tile/fixtures/` に small × 2、medium × 2、large × 1 以上を含む 5〜7 種を用意し、`INITIAL_DEFAULT_LAYOUT` のスロットと検証ルートで共用（2.2.6 のサイズ混在検証要件と整合）
- ロード機構の責務境界（指摘 1-6 反映）：localStorage の読込・fallback・別タブ同期は **すべて `useToolboxConfig` フック（2.2.8）に集約**する。`Tile` コンポーネントや `ToolboxContent` は localStorage や fallback を意識せず、フックから返ってくる `tiles` 配列を信頼して描画するだけ
- SSR レンダ（hydration 不整合回避、指摘 1-5 反映）：道具箱ページ（後述 2.2.9 検証ルート）は Server Component で `INITIAL_DEFAULT_LAYOUT` を render。Client Component（`useToolboxConfig`）の **初回レンダは必ず `INITIAL_DEFAULT_LAYOUT`** を返し、localStorage 読込は `useEffect` または `useSyncExternalStore` の subscribe（mount 後）に限定する。`useSyncExternalStore` の `getServerSnapshot` は `INITIAL_DEFAULT_LAYOUT` を返す。`suppressHydrationWarning` は使用しない
- 完了判定:
  - `INITIAL_DEFAULT_LAYOUT` 定数が `src/lib/toolbox/initial-default-layout.ts` に定義されている（4〜6 タイル想定、本サイクルではフィクスチャダミータイル参照、フィクスチャは small × 2 / medium × 2 / large × 1 を含む。フォールバック発動時は medium のみ 5 個）
  - 検証ルートで localStorage 空 → 初期プリセットが表示される、編集すると localStorage に書き込まれる、リロード後はユーザー配置が表示される
  - SSR の HTML に初期プリセットのタイル要素が含まれる（`npm run build && npx next start` の本番相当ビルド + `NEXT_PUBLIC_TOOLBOX_PREVIEW=true` で `curl` または `view-source:` 確認）
  - localStorage を手動削除すると次回ロード時に初期プリセットへ戻る
  - **hydration warning がブラウザ console に出ない**（Playwright で console error / warning を取得して 0 件確認）

**注記**: 本枠組みは B-312（ペルソナ別の複数プリセット + 選択 UI）とは別物。B-312 は引き続きスコープ外。本枠組みは「`/` を道具箱化するために必要な初期表示の最小単位」であり、URL 構成判断（設計判断 1）と切り離せない実装要素のため Phase 2.2 に含める。型は暫定であり B-312 で再設計を許容する。

##### 2.2.8 localStorage 永続化【中】

- キー：`yolos-toolbox-config`（既存実績システム `yolos-achievements` の命名規則に整合）
- スキーマ（`schemaVersion` を初日から含める）:
  - `schemaVersion`: 1
  - `tiles`: Array<{ slug: string; variantId?: string; order: number; size: "small" | "medium" | "large" }>
  - `updatedAt`: ISO 8601
- 配置：`src/lib/toolbox/storage.ts`（既存 `src/lib/achievements/storage.ts` の構造を参考に同等の堅牢性を確保）
- 必須実装：
  - SSR ガード（`typeof window === "undefined"` 早期 return）
  - `isStorageAvailable()` テストキー書き込み確認
  - try-catch で QuotaExceededError / SecurityError をサイレント吸収
  - JSON.parse → 型ガード検証 → 失敗時は `INITIAL_DEFAULT_LAYOUT`（2.2.7）にフォールバック
  - マイグレーションフレームワーク（バージョン別独立関数 + 再帰的 migrate()）。本サイクルでは v1 のみだが、後続で v2 を追加できる構造を整える
- フック：`useToolboxConfig`（仮称）を `useSyncExternalStore` ベースで実装
  - `getServerSnapshot` は `INITIAL_DEFAULT_LAYOUT` を返す（hydration 整合のため、指摘 1-5 反映）
  - `getSnapshot` は localStorage 読込結果（空または不正なら `INITIAL_DEFAULT_LAYOUT`）を返す
  - `subscribe` は (a) 別タブ用に `window.addEventListener('storage', ...)`、(b) 同一タブ用に独自 EventTarget **または** `BroadcastChannel('yolos-toolbox')` の **いずれか一方** を実装着手時に選定して購読する（両方購読は冗長で、同一オリジンの別タブで `storage` イベントと BroadcastChannel が二重発火する副作用リスクあり）。原則として **独自 EventTarget を第一候補** とする（同一タブのみで完結し、別タブ伝播は `storage` イベントが担う設計のシンプルさを優先するため）。BroadcastChannel が必要と判断した場合のみ後者に切り替える（指摘 1-4 反映）
  - 書き込み API（`updateLayout()` 等）は `localStorage.setItem()` + 選定した同一タブ用伝播手段（独自 EventTarget または BroadcastChannel）への dispatch を行う
- 責務境界（指摘 1-6 反映）：fallback 責務はフック内に集約。component は fallback を意識しない
- 完了判定:
  - 初回アクセスで `INITIAL_DEFAULT_LAYOUT` を返す（空配列ではない）
  - レイアウト変更後、リロードすると配置が復元される
  - localStorage を手動で破壊（不正 JSON / 別 schemaVersion）した状態でリロードしても、`INITIAL_DEFAULT_LAYOUT` にフォールバックしてエラーにならない
  - **同一タブ内**で複数の `useToolboxConfig` インスタンス（例：ヘッダーの「編集中インジケータ」と本体の「タイル一覧」が同時に購読しているケース）があり、片方のフックで `updateLayout` を呼ぶと、もう片方のフックも即座に追従する（Playwright で 2 箇所 mount → 片方更新 → 両方反映を検証）
  - **別タブ同期**: タブ A で配置 X → タブ B を開く（X 表示）→ タブ A で X→Y に変更 → タブ B が 1 秒以内に Y 反映、を Playwright マルチコンテキストで検証（または手動確認手順を明記）

##### 2.2.9 hidden 検証環境（`/` 採用に伴い検証ルートは別ルートに分離）【中】

設計判断 1 で `/` を本公開時の道具箱 URL に確定したが、本サイクルでは hidden（noindex）検証段階のため、現行 `/`（旧コンセプトのトップ）を破壊せず別ルートで検証する。Phase 4.4（現行トップ移行）と Phase 9.2（道具箱本公開）で `/` への正式統合・現行トップ廃棄を実施する。

- 検証用ルート：`src/app/(new)/toolbox-preview/page.tsx`（道具箱本体、Server Component）+ `ToolboxContent.tsx`（"use client" 分離、cycle-171 storybook の構造と同様）
- レイアウト方針（指摘 3-3 反映）：`(new)/toolbox-preview/page.tsx` は `(new)` route group の `layout.tsx` を継承する（既存 Header / Footer / ThemeProvider / AchievementProvider を継承）。検証ルート専用に layout を上書きはしない
- 3 層防御:
  - 層 1: `metadata.robots = { index: false, follow: false }`（page.tsx に直書き）
  - 層 2: **既存 `src/app/robots.ts` に追記**（指摘 1-7 反映、新設ではない）して `disallow: "/toolbox-preview"` を加える
  - 層 3: 環境変数ガード（指摘 1-3 反映）。`NEXT_PUBLIC_*` はビルド時固定のため、ビルド時点で挙動が確定する仕様を明記する。条件：`process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_TOOLBOX_PREVIEW !== "true"` のとき `notFound()`。Production 本番デプロイは環境変数を設定せずビルドして `/toolbox-preview` を 404 化、検証ビルド（または Vercel Preview Deploy）は `NEXT_PUBLIC_TOOLBOX_PREVIEW=true` を設定してビルドする運用
- 検証ルートでは 2.2.7 の `INITIAL_DEFAULT_LAYOUT` を Server Component で render し、本公開時に `/` へ統合される実装の縮小版として動作させる
- フィクスチャタイル：`src/components/Tile/fixtures/` の 5〜7 種（small × 2、medium × 2、large × 1 以上、フォールバック発動時は medium のみ 5 個）を `INITIAL_DEFAULT_LAYOUT` のスロット参照と検証ルートの動作確認に共用
- `/storybook` には `Tile` コンポーネント単体（モード × サイズ × ライト/ダーク）のみ追加。配置全体（DnD/localStorage/プリセット統合）は `/toolbox-preview` 検証ルート側で確認（/storybook は共通コンポーネントカタログのため）
- 完了判定（指摘 2-4 反映、各層を実機ビルドで個別検証）:
  - **検証ビルド**: `NEXT_PUBLIC_TOOLBOX_PREVIEW=true npm run build && npx next start` で `/toolbox-preview` が 200 で表示され、初期表示は `INITIAL_DEFAULT_LAYOUT`（フィクスチャダミー 4〜6 種）、配置動作可能
  - **本番相当ビルド**: 環境変数未設定で `npm run build && npx next start` した状態で `/toolbox-preview` が 404
  - `/sitemap.xml` に `/toolbox-preview` が含まれない、`/robots.txt`（既存追記後）に `Disallow: /toolbox-preview` がある（実機ビルドの `curl http://localhost:3000/robots.txt` で確認）
  - `<head>` に `<meta name="robots" content="noindex, nofollow">` がある（検証ビルドの `curl` で確認）
  - SSR の HTML に初期プリセットのタイル要素が含まれる
  - 現行 `/`（旧コンセプトのトップ）は本サイクル中は変更しない（破壊しない）
  - `/storybook` に Tile セクションが追加されライト/ダーク両モードで破綻なし

##### 2.2.10 視覚検証 / アクセシビリティ確認 / E2E【中】

- Playwright で w360 / w1280 のライト / ダーク両モードのスクリーンショット取得（`/storybook` の Tile セクション + `/toolbox-preview` 検証ルート）
- WCAG コントラスト 4.5:1 以上、タップターゲット 44px 以上、`focus-visible` 有効
- キーボード操作のみで「編集 → タイル選択 → 移動 → 削除 → 追加 → 完了」の一連が完遂できることを実機で確認（dnd-kit のキーボード sensor）
- **E2E シナリオ自動化**（指摘 3-2 反映）：「編集 → 移動 → 削除 → 追加 → 完了 → リロード → 配置復元」を Playwright で 1 本以上自動化（`tests/e2e/toolbox-preview.spec.ts` 等）。検証ビルド（`NEXT_PUBLIC_TOOLBOX_PREVIEW=true`）で実行
- DESIGN.md チェックリスト準拠確認（指摘 3-4 反映）：dark mode の `:global(:root.dark)` 使用、PascalCase ディレクトリ / ファイル、`--shadow-*` / `--r-*` token 使用、`focus-visible` スタイル定義
- AP-I09（jsdom 単体テストの限界）回避：layout / CSS スタッキング / production 挙動はすべて Playwright 本番ビルド実機検証
- 完了判定:
  - スクリーンショット 4 枚（小モバ × ライト/ダーク + デスクトップ × ライト/ダーク）が DESIGN.md と整合
  - axe または手動チェックでコントラスト 4.5:1 を満たす
  - キーボード操作シナリオ完遂
  - E2E シナリオ 1 本以上が pass
  - DESIGN.md チェックリスト全項目 pass

##### 2.2.11 lint / format / test / build の最終確認【軽】

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功
- 既存テストの破壊なし、追加テスト（storage.ts のフォールバック / migrate のバージョン遷移 / Tileable 型ガード / `toTileable()` adapter / `INITIAL_DEFAULT_LAYOUT` 整合）が pass
- bundle size 増加が 2.2.3 で記録した値以内に収まっていること

### 検討した他の選択肢と判断理由

#### URL 構成（候補 3 つ全部の新コンセプト最大化観点比較）

判断軸は新コンセプト最大化観点のみ。「現行トップ温存余地」「将来の判断自由度の温存」「複数化将来移行の破壊度」は軸に含めない（Owner 指示）。

| 評価軸            | 候補 1: トップ `/`                                                                 | 候補 2: 専用 `/toolbox`                                 | 候補 3: 複数 `/toolbox/[id]`                                               |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| A コンセプト体現  | 最強（ホーム/新規タブ設定で毎日反射的に開く場所として URL が最短）                 | 中（1 階層深く「専用機能ページ」感が出る）              | 弱（さらに深い + デフォルト道具箱指定が必要）                              |
| B M1b コア体験    | 強（サイト名検索 "yolos" 着地が `/`、ブクマ/URL 直入力が最短）                     | 中（ブクマ後は差が縮むが、サイト名検索再訪で 1 段不利） | 弱（複数管理 UI が「タスク管理ツール」の世界観に寄り「日常の道具」と乖離） |
| C M1a 流入阻害    | 影響軽微（M1a はツール詳細直着地のためトップを通らない事実が調査確認済）           | 影響軽微                                                | 影響軽微                                                                   |
| D SEO・初回着地   | 強（SSR で初期プリセットを出せば HTML を静的に確保。Googlebot・SNS の OGP も成立） | 強（同等）                                              | 強（同等）                                                                 |
| E シェア URL 設計 | 強（`/?state=` が最短 URL、認知性・記憶しやすさで優位）                            | 中（`/toolbox?state=`、1 階層長い）                     | 弱（`/toolbox/shared/[base64]` 等の追加設計が必要）                        |

**選定: 候補 1（トップ `/`）+ 初期表示用最小デフォルトプリセットの枠組みを基盤実装に含める（α-2）**。新コンセプト最大化観点で候補 1 は全 5 軸において候補 2・3 と同等以上、軸 A・B・E では明確に優位。`/toolbox` を選ぶ積極的理由は新コンセプト最大化観点では見当たらず、残るのは「現行トップ温存余地」「将来の判断自由度の温存」のみで Owner 指示により判断軸から除外。複数化（候補 3）はコンセプト体現で逆効果のため不採用。

**初期プリセットの位置づけ**: `/` 採用には SSR で「空でない初期道具箱」を出す必要があり、これは固定の最小プリセット（4〜6 タイル、ハードコード）が必要。本サイクルでは「枠組み」（型・ロード機構・SSR レンダ）を実装し、スロットはフィクスチャダミータイルで埋める。実タイルへの差し替えは Phase 7 で各ツールがタイル化されるたびに行う。Phase 9.2 本公開の前提条件として「初期プリセット 4〜6 タイル分の実タイルが Phase 7 で揃っていること」を PM へ申し送り。

**Phase 9.2 までの段階的整合**: 本サイクルでは現行 `/`（旧コンセプトのトップ）を破壊せず別ルート（`/toolbox-preview`）で hidden 検証。Phase 4.4 で現行トップを `(new)/` へ移行（B-334）した後、Phase 9.2 で現行トップを廃棄して `/` を道具箱に置き換える（design-migration-plan.md が認める「廃棄」を選択。新コンセプト下で旧コンセプトのトップを温存する積極的理由がないため、廃棄が新コンセプト最大化観点での自然な選択）。

#### メタ型構造（統合 / 分離 / 段階的統合）

判断軸は新コンセプト最大化観点のみ。「既存コードへの侵襲度」は新コンセプト最大化観点でないため軸から除外し、「Phase 4 / 7 で新メタ型に段階導入できる設計柔軟性」に置換。

| 評価軸                           | 候補 1: 完全統合 | 候補 2: 完全分離   | 候補 3: 段階的統合（基底 + extension） |
| -------------------------------- | ---------------- | ------------------ | -------------------------------------- |
| タイル列挙の整合性               | 最強             | 弱（3 配列マージ） | 強                                     |
| 種別固有フィールド表現           | 弱（type 肥大）  | 強                 | 強                                     |
| Phase 4 一覧設計の書きやすさ     | 中               | 中                 | 強                                     |
| Phase 4 / 7 段階導入の設計柔軟性 | 弱（一括統合）   | 中                 | 強（種別ごとにタイル化と同期で導入）   |

**選定: 候補 3**。棚卸しで種別差が構造的に大きい（38/60 件が別コンポーネント必須）ことが確認され、完全統合は overfit。「タイル」概念は新コンセプトの中核なので共通基底を提供する必要がある。Phase 7 で各種別がタイル化されるタイミングに合わせて段階導入できる設計柔軟性が、新コンセプト最大化観点で最も重要。

#### 1 対多サポート（必要 / 不要 / 柔軟）

| 評価軸                        | 候補 1: 1 対 1 のみ | 候補 2: 常に 1 対多（配列必須） | 候補 3: 柔軟（単一 default + 配列許容） |
| ----------------------------- | ------------------- | ------------------------------- | --------------------------------------- |
| 棚卸しでの整合性              | 弱（38 件で破綻）   | 強                              | 強                                      |
| 1 対 1 ケースの記述シンプルさ | 強                  | 弱（常に配列）                  | 強                                      |
| 将来バリエーション拡張        | 不可                | 可                              | 可                                      |

**選定: 候補 3**。実コンテンツでの棚卸しが「詳細ページ本体をタイルに流用できないケースが多数」「△判定の 14 件はフル版/簡素版 2 種が有用」と示している。柔軟設計が最も実態に整合する。

#### DnD ライブラリ（dnd-kit / 他 / 自前）

| 候補                         | バンドル | a11y        | TypeScript | Next.js App Router | メンテ |
| ---------------------------- | -------- | ----------- | ---------- | ------------------ | ------ |
| **@dnd-kit/core + sortable** | ~9KB     | WCAG 2.1 AA | ネイティブ | 対応               | 活発   |
| react-grid-layout            | ~28.7KB  | 弱          | 対応       | SSR 不可           | 活発   |
| react-beautiful-dnd          | ~30KB    | 強          | 弱         | 非推奨             | 非推奨 |
| pragmatic-drag-and-drop      | ~3.5KB   | 拡張可      | 不明       | 対応               | 活発   |
| 自前実装                     | 0        | 自力        | 自力       | 自力               | -      |

**選定: dnd-kit/core + sortable**。軽量・a11y・TS・メンテ全項目で他候補より優れる。pragmatic-drag-and-drop はさらに軽量だが Sortable パターンの実装パターンが dnd-kit より公開事例が少なく、本サイクルの工数で習熟するリスク。自前実装は a11y/タッチ/キーボード対応のコストがライブラリ採用を大きく上回る。

**dnd-kit のグリッドサイズ可変問題への対処**: dnd-kit は標準ソート戦略が同サイズタイル前提のため、`grid-column: span N` で span が異なるタイル混在では既知問題（Issue #117 / #720 / #1692）がある。本サイクルでは Phase 2.2 の 2.2.3 サブタスクで「半日上限のスパイク」を実施し、(i) 標準 strategy で動く / (ii) empty strategy + 自前並び替えで動く / (iii) 半日上限到達 = フォールバック発動（medium 固定で実装、サイズ可変は将来課題化）の 3 経路で早期分岐する。本対処は Phase 2.1 設計判断（URL / メタ型 / 1 対多）とは別レイヤーの実装手段問題であり、キャリーオーバー条件には該当しない。フォールバック発動条件は半日上限到達のみで、感覚的理由でのフォールバックは不可。`react-grid-layout` は将来的にタイルサイズ可変ロジックを内蔵ライブラリで賄いたくなった場合の代替候補として残す。

#### 検証環境（hidden URL / /storybook / 両方）

| 候補            | 共通コンポーネント単体検証 | 配置全体（DnD + localStorage 統合） | 運用ルール整合                               |
| --------------- | -------------------------- | ----------------------------------- | -------------------------------------------- |
| hidden URL のみ | 弱（カタログがない）       | 強                                  | △（Tile 単体が /storybook に未掲載）         |
| /storybook のみ | 強                         | 弱（DnD/localStorage 統合不可）     | △（/storybook は共通カタログで配置画面不適） |
| **両方**        | 強                         | 強                                  | 強（運用ルール: /storybook = 共通単体）      |

**選定: 両方併用**。`/storybook` には `Tile` コンポーネント単体のバリエーション（mode × size × theme）を掲載し、design-migration-plan.md の「/storybook 運用ルール = 共通コンポーネント専用カタログ」と整合させる。配置全体（DnD + localStorage + 編集モードの統合動作）は `/toolbox-preview` の hidden URL で検証する（設計判断 1 で `/` を最終形 URL に確定したが、本サイクル中は現行 `/` を破壊しないため別ルート `/toolbox-preview` を使う）。両環境を併用することで「単体品質」と「統合品質」を別々に担保できる。

### 計画にあたって参考にした情報

- `/mnt/data/yolo-web/tmp/research/2026-05-01-b309-tool-tile-inventory.md` — 既存ツール 60 件（tools 33 / play 20 / cheatsheets 7）の操作モデル棚卸し（タイル収容性分類）
- `/mnt/data/yolo-web/tmp/research/2026-05-01-dashboard-tile-codebase-survey.md` — 既存メタ型構造、(new) Route Group、localStorage パターン、共通コンポーネント
- `/mnt/data/yolo-web/docs/research/2026-05-01-toolbox-url-structure-design-decision.md` — URL 構成の判断材料（同種サービス調査、SEO 動向、SearchAction 廃止情報）
- `/mnt/data/yolo-web/docs/research/2026-05-01-dashboard-toolbox-phase1-best-practices.md` — タイル UI / DnD ライブラリ比較 / localStorage / hidden 検証ベストプラクティス
- `/mnt/data/yolo-web/docs/design-migration-plan.md` — Phase 2 の完了基準、(new) Route Group 運用、/storybook 運用ルール、メタデータ管理ルール
- `/mnt/data/yolo-web/docs/site-concept.md` — 新コンセプト「日常の傍にある道具」、ダッシュボード機能の位置づけ、仮説検証アプローチ
- `/mnt/data/yolo-web/docs/targets/気に入った道具を繰り返し使っている人.yaml` — M1b の likes / dislikes（「慣れた操作手順が突然変わる」を嫌う等）
- `/mnt/data/yolo-web/docs/targets/特定の作業に使えるツールをさっと探している人.yaml` — M1a の検索流入経路
- `/mnt/data/yolo-web/docs/cycles/cycle-167.md` — B-309 / B-312 / B-313 / B-324 の元キャリーオーバー（プリセット・シェア・連携が後続フェーズ）
- `/mnt/data/yolo-web/docs/anti-patterns/planning.md` — 計画段階のアンチパターン（特に AP-P03 現状所与化、AP-P07 運営者目線、AP-P16 計画書執筆中の事実確認）
- `/mnt/data/yolo-web/docs/anti-patterns/implementation.md` — 実装段階のアンチパターン（AP-I07 body style と useEffect の競合、AP-I08 fixed オーバーレイ z-index、AP-I09 jsdom 単体テストの限界 → Playwright 必須化）
- `/mnt/data/yolo-web/src/lib/achievements/storage.ts` — schemaVersion + try-catch + フォールバック完備の参考実装（toolbox storage の雛型）
- `/mnt/data/yolo-web/src/app/(new)/storybook/page.tsx` + `StorybookContent.tsx` — noindex + server / client 分離の既存パターン
- `/mnt/data/yolo-web/src/app/robots.ts` — 既存 robots 設定（2.2.9 で `/toolbox-preview` を追記する対象）
- `/mnt/data/yolo-web/src/tools/types.ts`, `src/play/types.ts`, `src/cheatsheets/types.ts` — 既存メタ型のフィールド名差異（Tool=`name`、Play=`title`、Cheatsheet=`name`+`title`）。2.2.1 の `toTileable()` adapter 設計の前提
- dnd-kit Issue #117 / #720 / #1692 — グリッドサイズ可変ソートの既知問題（2.2.3 のスパイク背景）

## レビュー結果

レビュー実施日時: 2026-05-01

### レビュープロセス概要

第 1 ラウンドで reviewer 2 名が並列レビューを実施し、合計 21 件の指摘（reviewer 1: 7 件、reviewer 2: 14 件）を受けた。planner が指摘を統合反映したうえで第 2 ラウンドの再レビューを依頼。第 2 ラウンドでは「前回指摘の反映確認 + 全体見直し」を実施し、両 reviewer から承認を得た。reviewer 2 より修正必須ではない軽微な改善メモ 2 件を受け取り、スキル運用ルール（false-positive でなければ必ず対応）に従い本コミットで反映済み。

### 主要な論点と結論

**設計判断 1（URL 構成）の再判断**: 計画立案当初は `/toolbox` を候補としていたが、Owner 指示「現状保護・実装コスト・将来の判断自由度を軸に含めない」に従いゼロベースで再評価した結果、`/` 採用（候補 1）に変更。「日常の傍にある道具」コンセプト体現・M1b の再訪導線・シェア URL の短さのいずれの軸でも `/` が候補 2（`/toolbox`）を上回ることが確認され、`/toolbox` を選ぶ積極的理由が新コンセプト最大化観点では存在しないと判断した。

**初期プリセット枠組みの位置づけ**: `/` 採用には SSR で「空でない初期道具箱」が必須であることから、2.2.7 として「初期表示用最小デフォルトプリセットの枠組み」を Phase 2.2 に追加した。この枠組みは B-312（ペルソナ別の複数プリセット + 選択 UI）の先取りではなく、URL 構成判断と切り離せない最小実装として明示的に分離している。B-312 担当者は本型を破棄して再設計してよいことをコメントで明記する。

**dnd-kit グリッドサイズ可変問題への対処**: dnd-kit の既知問題（Issue #117 / #720 / #1692）に対し、「半日上限スパイク + 3 経路早期分岐（標準 strategy / 自前並び替え / medium 固定フォールバック）」という事前条項を 2.2.3 に組み込んだ。フォールバック発動条件は半日上限到達のみとし、感覚的理由での回避を禁止した。この対処は設計判断 3 項目とは別レイヤーの問題であり、キャリーオーバー条件に該当しないことを明記した。

**reviewer 2 軽微改善 2 件（本コミットで反映）**: (1) 2.2.6 の 50 個ケース完了判定を「目視レベル」から「Playwright trace で 100ms 以内かつ 16ms 超フレームが連続しない」に客観化。(2) 2.2.8 の同一タブ伝播手段を「両方購読」の曖昧表現から「独自 EventTarget を第一候補とし、着手時に一方を選定する」指針に明確化。

## Owner 指摘対応計画（DESIGN.md 整合 + モバイル UX 強化）

### 背景

cycle-175 進行中（2.2.6 着手前）に Owner より 2 点の指摘を受けた。

1. **DESIGN.md 違反**: ドラッグ中の半透明（`opacity: 0.4`）と編集モード時のコンテンツ無効化の半透明（`opacity: 0.7`）が DESIGN.md 規定外で勝手に追加されていた。物理的隠喩「持ち上げて運ぶ」が壊れる。PM が直接削除済み（Tile.module.css L36-46 / L205-211、計画書 2.2.6 完了判定 L399 修正済み）。
2. **モバイル UX の不十分性**: 1〜2 タイルしか可視範囲に入らない小画面で十数枚を DnD のみで並び替えるのは苦痛。スクロール阻害・誤操作のリスク。

判断軸は **「Owner 指示だから」ではなく DESIGN.md ルール / constitution rule 4「best quality in every aspect for visitors」/ M1b のコア体験「自分の道具箱を組み立てる」** とする。

### PM 直接対応の境界条件（reviewer 指摘 10 反映）

Owner 指摘の opacity 削除を PM が直接対応した妥当性について、`docs/anti-patterns/workflow.md` を確認した結果、当該境界に直接対応する明示的なアンチパターンは存在しない（AP-WF08「PM がサブエージェントの作業を代行」は調査・記事執筆等の創作的作業を念頭に置いた項目であり、規約違反コード 2 行の即時削除には適用しがたい）。

ただし将来的な再現性のため、本対応計画に **PM 直接対応の境界条件** を明示する:

- **PM 直接対応が許容される範囲**: (i) DESIGN.md / constitution / アンチパターン等の明文化された規約に対する違反が確定しており、(ii) 修正が機械的（規定外プロパティ 2 行の削除等）で設計判断を伴わず、(iii) Owner 指摘を起点とする緊急性を持つ場合。これらすべてを満たすときのみ、PM が直接コード修正してよい
- **直接対応してはいけない範囲**: 設計判断を含む変更、新規実装、複数候補から選ぶ判断を伴うリファクタ、レビューが必要な実装。これらはすべて builder への委譲とレビュアーによる検証が必要
- 本指摘で PM が opacity 削除を直接対応したのは上記 (i)(ii)(iii) を満たす範囲。今回の追加実装（移動ボタン・sensors 分離・touch-action 等）は (ii) を満たさないため、すべて builder へ委譲する
- なお、本境界条件は cycle-175 完了時に `docs/anti-patterns/workflow.md` への AP-WF13 として汎用ルール化する。実施は **2.2.4（編集モード設計）の末尾サブタスク** として行う（N8 reviewer 指摘反映: DESIGN.md 追記と同じ「ドキュメント整備」性質のため、2.2.11 lint/test/build 最終確認とは性質が異なる）

### DESIGN.md とコード側コメントの単一情報源ルール（reviewer 指摘 12 反映）

DESIGN.md は yolos.net のデザイン規約の **単一情報源（Single Source of Truth）** とする。コード側のコメント（CSS / TSX）に DESIGN.md の規定文を **重複記述してはならない**。代わりに参照リンクのみを書く（例: `/* DESIGN.md §4 ドラッグ規定参照 */`）。

理由: 規定文の重複記述は二重管理を生み、DESIGN.md 更新時にコード側の旧文が残るリスクがある。コード変更時は DESIGN.md を直接読みに行く運用を強制することで、規約の最新性を担保する。

本対応計画の実装タスクで Tile.module.css 既存コメント（L14-17 と L42-43 と L208-210）を参照リンク形式に整理する作業を 2.2.5 のサブタスクに含める。

### 検討項目 1: 編集モード時のタイル視覚表現（DESIGN.md 整合）

**現状**: opacity 削除済み。`cursor: grab` + `border-color: var(--accent)` + 編集モード時のコンテンツ部 `pointer-events: none` の 3 点で「触れる状態 / 通常クリック禁止」を表現。

**判断軸**:

- 軸 A: 物理的隠喩「持ち上げて運ぶ道具」を壊さない（DESIGN.md §1 ビジュアルテーマ「日常の傍にある道具」）
- 軸 B: 来訪者が「使用モードのタイル」と「編集モードのタイル」を一目で区別できる（M1b の dislikes「慣れた操作手順が突然変わる」と矛盾しない）
- 軸 C: 視覚表現が DESIGN.md の語彙（color token / shadow token / border token）の範囲内に収まる

**検討した選択肢**:

- (a) 現状維持（grab + border-color のみ）
- (b) 編集モードオーバーレイの強化で「画面全体が編集中であること」を明示する（個別タイルではなく場面全体で区別）
- (c) DESIGN.md に「編集モード」「ドラッグ中」の専用視覚表現を新規定義として追加し、それに従う

**採用: (a) + (c) の組み合わせ**

採用根拠:

1. (a) のみで軸 A・B・C を満たす — `border-color: var(--accent)` は DESIGN.md §2「アクセント = リンクやフォーカスの位置を示す」の範囲内であり、編集モード時のタイル全体が「触れる対象としてフォーカスされた状態」と解釈できる。`cursor: grab` は OS 標準の「掴める」隠喩であり物理的隠喩を壊さない。さらに ToolboxShell 側に既存のオーバーレイと「編集中」aria-live ラベルがあり、場面全体での識別はそちらが担う（軸 B 補強）
2. ただし「opacity 半透明禁止」という重要な規約が DESIGN.md に明示されておらず、後続作業や別 builder が再発させる懸念がある。**(c) を実施し、DESIGN.md §4 レイアウトのドラッグ規定に「ドラッグ中の表現は `box-shadow: var(--shadow-dragging)` のみで行う。半透明（opacity）・色相変化・スケール変化を加えてはならない（物理的隠喩『持ち上げて運ぶ』を保つため）」を一文追加する**
3. 編集モード時のタイル表現についても、DESIGN.md §4 もしくは新設の「インタラクションモード」節に「編集モードのタイルは `border-color: var(--accent)` と `cursor: grab` で示す。半透明禁止。コンテンツ部のクリック禁止は `pointer-events: none` で行う」を明記する
4. (b) は ToolboxShell のオーバーレイで既に実装済みのため重複追加は不要。場面識別はそちらに委ねる

**作業内容**: `DESIGN.md` §4 レイアウトのドラッグ規定（L66-67 周辺）に上記 2 文を追記する。実装は既に整合済みのため追加コード変更なし。

**accent ボーダー × focus-visible 競合 / ダークモードコントラスト検証（reviewer 指摘 5 反映）**:

DESIGN.md §2 はアクセント色を「リンクやフォーカスの位置」に充てる規定。タイル全体ボーダーが `var(--accent)` になることで、(i) Tab フォーカス時の `outline: 2px solid var(--accent)` が同色のボーダーと視覚的に重なり「フォーカス位置が分かりづらい」可能性、(ii) ダークモードで `--accent` のコントラスト比が背景に対して足りない可能性、がある。

**確定方針**: builder に委ねず、本対応計画の **2.2.5 完了判定の中で必ず実機 Playwright 確認** する手順を組み込む。

- 確認シナリオ: w360 / w1280 × ライト / ダーク × 編集モード × focus-visible 状態（Tab フォーカス済み）の 8 パターンスクリーンショットを取得
- 判定基準: (i) 編集モードのボーダー（`--accent`）と focus-visible のアウトライン（`--accent`）が並んだとき、フォーカス位置が視認できる（ボーダーとアウトラインが同色で混ざるなら不合格）、(ii) ダークモードで `--accent` のコントラスト比が背景 `--bg` に対して 3:1 以上（WCAG 1.4.11 Non-text Contrast）
- 不合格時の代替表現（事前確定）: 編集モードのボーダーを `border: 2px solid var(--accent)` にして「太さ」で区別し、focus-visible は `outline: 3px solid var(--accent); outline-offset: 2px;` で外側に分離する。それでも視認性が足りない場合は、編集モードのボーダー色を `var(--accent-strong)` に変える（DESIGN.md §2 で定義済みの `-strong` バリアントの範囲内）
- 上記の代替表現を採るかどうかは **2.2.5 の Playwright 確認結果に基づき builder が判断** する。判定根拠（スクリーンショットと WCAG コントラスト比測定値）を 2.2.5 完了報告に含める

### 検討項目 1.5: cursor: grab とドラッグ可能領域の整合（reviewer 指摘 4 反映）

**現状の問題**: Tile.tsx は `useSortable.listeners` をドラッグハンドルにのみ展開する一方、Tile.module.css L52-54 で `tile[data-mode="edit"] { cursor: grab; }` がタイル全体に適用される。タイル全体が「掴める」ように見える誤誘導が発生している。

**判断軸**:

- 軸 A: 「掴める領域＝実際にドラッグできる領域」が一致する（M1b の dislikes「思い通りに動かない」を起こさない）
- 軸 B: タイル本体クリック（pointer-events: none）/ ドラッグハンドル（listeners）/ 移動ボタン（独立）の責務分離と整合
- 軸 C: a11y / モバイル誤動作防止の業界標準パターンに沿う

**選択肢**:

- 案 A: 編集モードの cursor を「ハンドルだけ grab、タイル本体は default」に変える（誤誘導を解消、ハンドル意識を明確に）
- 案 B: タイル本体もドラッグ可能（listeners をタイル本体に展開）に変える（M1b 体験最大化）

**採用: 案 A（ハンドルだけ grab）**

採用根拠:

1. 案 B は本サイクルの既存設計「編集モード時のコンテンツ部は `pointer-events: none` でクリック禁止」と直接競合する。listeners をタイル本体に付けても、コンテンツ部の pointer-events: none で touch / mouse イベントが消える
2. ハンドルベースのドラッグは a11y / モバイル誤動作防止の標準パターン（Notion / Trello / Linear すべて採用）。M1b は「気に入った道具を再訪する」層で、初見にもこの標準パターンが伝わりやすい
3. 移動ボタン（2-2 で採用）が「タイル全体を直接操作する代替手段」を提供するため、「ハンドル限定でも長距離移動ができる」ことが保証される。タイル本体ドラッグ可能化（案 B）の必要性が下がる
4. reviewer 推奨と一致

**実装方針（事前確定）**:

- Tile.module.css L52-54 の `cursor: grab` をタイル本体から削除
- ハンドル要素（`.dragHandle`）にのみ `cursor: grab` / `:active { cursor: grabbing }` を適用（既に L120 / L140-141 で実装済み、タイル全体の重複指定を取り除くだけ）
- 編集モードの「触れる状態」表現は border-color: var(--accent) のみで担う（cursor は default）
- 完了判定: Playwright で w360 / w1280 編集モードでハンドル上にカーソル乗せると grab、タイル本体上は default を確認

### 検討項目 2: モバイル UX 強化

#### 2-0. モバイルレイアウト致命破綻の修正（#6 reviewer 致命 1 統合 / 必須前提）

**事象（N1 反映: 実 SIZE_SPAN と整合）**: 現状の `TileGrid.module.css` は `@media (max-width: 480px)` で `grid-template-columns: 1fr;` の 1 カラム化を指定している一方、`Tile.tsx` は `style.gridColumn = `span ${SIZE_SPAN[size]}`` をインラインで設定する（`SIZE_SPAN = { small: 1, medium: 2, large: 3 }`、`src/components/Tile/constants.ts` で確定済み）。1 カラムグリッドに span 2 / span 3 のタイルが置かれると、CSS Grid は **暗黙トラック** を自動生成して span 数を満たそうとし、結果として 1 行に複数タイルが詰め込まれる / 暗黙トラック幅が極小化されて small が 2px に潰れる、という現象が発生する（#6 reviewer が w375 で再現、本 PM も w360 storybook で 2px / 56.5px の潰れを別途確認済み）。

これはモバイル UX の前提を根底から壊している。Owner 指摘 2「小画面で 1〜2 タイルしか表示されない」の **真因** はこの致命破綻であり、移動ボタン以前にこちらを先に修正する必要がある。

**修正方針（事前確定、builder に委ねない）**:

- (i) `@media (max-width: 480px)` の Tile 側で `grid-column: span 1` を CSS から強制（`!important` または `data-size` 属性経由で CSS から指定して優先順位を確保。後者なら `!important` 不要）。SSR 整合のため CSS 完結（useMediaQuery 等の JS 計測は不採用）
- (ii) **中間帯 480〜768px（2 カラム）の設計（N1 再検証）**: small=span 1 / medium=span 2 / large=span 2 に丸める。「small + large（span 1+2=3）」の組み合わせは 2 カラムグリッドで「small が 1 列目、large は 2 列目に span 2 で入れず → 暗黙トラック生成または次行先頭に流れて 1 列目に隙間」という暗黙トラック誘発の可能性がある。本サイクルでは **`grid-auto-flow: dense` を併用して空きセルを埋める方針** を採る。`dense` は表示順序が DOM 順序と乖離し得るが、ドラッグによる順序入れ替えが主要操作の本サイクル UI では DOM 順序の保持優先度が低く、視覚的な隙間ゼロを優先する判断が成り立つ
  - **ただし dense 採用の副作用として、ドラッグ中の `useSortable` transform 計算（DOM 位置基準）と視覚位置（dense 後の表示位置）が乖離するリスクがある**。N6 の中間帯 transform 検証で破綻が確認された場合は、**dense を撤回して以下の代替案 (ii-α) に切り替える**:
    - (ii-α) 代替案: 480〜768px では中間ブレークポイントを設けず、`@media (max-width: 480px)` の 1 col と既定 4 col の二値運用にする。中間帯ではタイルがやや窮屈になるが、暗黙トラック誘発を確実に避けられる
- (iii) `Tile.tsx` 内で `gridColumn` をインライン指定する代わりに、`data-size` 属性経由で CSS から `grid-column: span N` を当てる方式に切り替える。dnd-kit `useSortable` の `transform` / `transition` はインライン継続が必要なので、`gridColumn` だけを CSS 側に移譲する形にする（責務分離 + `!important` 不要化）

**実装責務**: 本修正は **2.2.6 着手の最初**に行う。これが解消されない限りモバイル UX 強化（移動ボタン等）の評価は不可能（タイル自体が見えていない）。

**完了判定**:

- Playwright で w360 / w400 / w480 / w768 / w1280 の 5 ビューポートで `fixture-small-1` の実 width を測定し、いずれも 100px 以上（タップターゲット 44px + パディングを十分含む幅）であることを確認
- いずれのビューポートでも暗黙トラックが生成されていないこと（`getComputedStyle(grid).gridTemplateColumns` の値が `repeat(N, ...)` 形式で N が想定値どおり）
- 中間帯 480〜768px で N6 の transform 検証（後述）が pass している。pass しない場合は (ii-α) 代替案に切り替えて再検証

#### 2-1. TouchSensor の activationConstraint 設定（reviewer 指摘 3 反映）

**仮説**: 現状 `useSensor(PointerSensor)` のみで TouchSensor を明示登録していない。PointerSensor は touch 対応するが、`activationConstraint` 未設定だと touch start で即ドラッグ開始しスクロールが阻害される。

**判断軸**:

- 軸 A: 通常スクロール（縦方向）とドラッグ意図の区別が直感的にできる
- 軸 B: dnd-kit 公式・コミュニティのベストプラクティスに沿う
- 軸 C: M1b の dislikes「思い通りに動かない」を起こさない

**ベストプラクティス調査結果**（dnd-kit 公式 / コミュニティ）:

- 公式推奨: `activationConstraint: { delay: 250, tolerance: 5 }`（press delay 250ms、5px tolerance）
- 別パターン: `delay: 200, tolerance: 8`
- CSS 側併用: ドラッグハンドルに `touch-action: none`（または `manipulation`）を指定。**ハンドルだけに限定**することでタイル本体上のスクロールは阻害されない

**採用案（reviewer 指摘 3 を受けて修正）**:

1. `ToolboxShell` の sensors を `PointerSensor` 単独から **`MouseSensor` + `TouchSensor`（明示登録）+ `KeyboardSensor`** に分離する。dnd-kit 公式が「pointer events より細かく制御したい場合は Mouse + Touch 分離を推奨」としているため、モバイル UX を最優先する本サイクルでは分離する
2. **`TouchSensor` の `activationConstraint: { delay: 250, tolerance: 5 }` を初期値として採用**（dnd-kit 公式推奨値）。前バージョンでは「M1b の反射的に即操作」を理由に 200ms を採っていたが、reviewer 指摘の通り delay は「ドラッグ開始までの待ち」であり、タップ即発火（編集ボタン押下等）とは無関係であるため 200ms 短縮の論理的根拠が成立しない。さらに 200ms は人間反応時間境界で誤発火リスクがあり、M1b の dislikes「思い通りに動かない」を直撃する
3. 短縮（200ms 等）を採るかどうかは **本サイクル完了判定（2.2.10 Playwright モバイル E2E）の実測「タップとドラッグの誤判定率」を取得した後に、後続サイクルで再判断**する。本サイクルでは 250ms / 5px の公式値で確定
4. `MouseSensor` は constraint なし（マウスは即ドラッグでよい）
5. `KeyboardSensor` は既存設定（`sortableKeyboardCoordinates`）維持
6. ドラッグハンドル（Tile.module.css `.dragHandle`）に `touch-action: none` を追加。タイル本体・コンテンツ部にはこれを付けず、本体の縦スクロールが活きるようにする

**根拠**:

- dnd-kit 公式 [Touch Sensor docs](https://docs.dndkit.com/api-documentation/sensors/touch) が「delay constraint を使うときは tolerance も併用」「ドラッグハンドルには `touch-action: none`」を明示推奨
- 編集モード中のみ DndContext を mount する設計（既存）と組み合わせると、使用モード中はそもそも TouchSensor が無効なので通常スクロール完全保証

#### 2-2. 小画面での代替操作手段

**現状の問題**: 480px 未満は 1 カラム表示。10〜20 タイルを末尾から先頭へ DnD だけで動かすには長距離ドラッグまたは複数回操作が必要。M1b の「自分の道具箱を組み立てる」体験を阻害する。さらに 2-0 の致命破綻を修正してもなお、1 カラム表示で長距離移動の苦痛は残るため、移動ボタンは **必須要件**（#6 reviewer 致命 1 が「移動ボタン必須化の最大根拠」と指摘）。

**判断軸**:

- 軸 A: M1b のコア体験「自分の道具箱を組み立てる」を最大化（constitution rule 4 best quality）
- 軸 B: DnD と矛盾せず、両者が共存できる（DnD を奪わない）
- 軸 C: キーボード操作（既存 KeyboardSensor）と整合する
- 軸 D: 実装が DESIGN.md / 既存コンポーネント語彙の範囲内
- 軸 E: 業界ベストプラクティスに沿う（NN/g、Smashing Magazine、Microsoft Mobile Engineering 等の調査結果）

**選択肢評価**:

| 候補                             | 軸 A 道具箱体験 | 軸 B DnD 共存 | 軸 C キーボード整合 | 軸 D 既存語彙 | 軸 E ベストプラクティス |
| -------------------------------- | --------------- | ------------- | ------------------- | ------------- | ----------------------- |
| (a) 各タイルに ↑/↓ 移動ボタン    | 強              | 強            | 強                  | 強            | 最強（業界推奨）        |
| (b) 「先頭/末尾へ移動」ボタン    | 中              | 強            | 強                  | 強            | 強                      |
| (c) Grid → List 表示モード切替   | 弱              | 中            | 中                  | 弱（新概念）  | 弱                      |
| (d) 数値で順番指定               | 弱              | 強            | 中                  | 弱            | 弱（業界事例少）        |
| (e) 長押しで「移動先指定」モード | 中              | 中            | 弱                  | 弱            | 中                      |
| (f) スワイプで移動               | 弱              | 中            | 弱                  | 弱            | 弱（学習コスト高）      |

**採用: (a) を必須採用、(b) を補助で同時採用**

採用根拠:

1. **業界ベストプラクティス**: NN/g [Drag-and-Drop UX](https://www.nngroup.com/articles/drag-drop/)、Microsoft Mobile Engineering [Accessible Reordering for Touch Devices](https://medium.com/microsoft-mobile-engineering/accessible-reordering-for-touch-devices-e7f7a7ef404) ともに「up/down ボタンが最も accessible」と明示。Smashing Magazine [Dragon Drop](https://www.smashingmagazine.com/2018/01/dragon-drop-accessible-list-reordering/) も同様
2. **constitution rule 4**: 軸 A〜E すべてで (a) が最高評価。「DnD だけで十数枚」の苦痛を根本解消できる手段は (a)
3. **(c) の不採用理由**: Grid と List で 2 つの表現を持つことは DESIGN.md §1「シンプル」と矛盾。さらに M1b の dislikes「操作手順が突然変わる」を生む
4. **(d) の不採用理由**: 数値入力は道具箱という生活道具のメタファと乖離する。タスク管理ツール感が出てサイトコンセプトを傷つける
5. **(e)(f) の不採用理由**: 学習コストが高く、初見の M1b に伝わらない
6. **(b) を補助採用**: 「↑/↓ で 1 つずつ動かす」だけだと 20 個目のタイルを 1 番目に動かすのに 19 タップが必要。「先頭へ移動 / 末尾へ移動」を併設することで長距離移動を 1 タップで済ませられる。これは Microsoft の調査でも「複数操作タップ数の削減」として推奨

**実装方針（reviewer 指摘 1, 8, 11 反映で修正）**:

##### 移動ボタンのアイコン形式（reviewer 指摘 11 反映）

ボタンアイコンは **SVG 線画 1.5px**（既存 dragIcon / deleteIcon と同じパターン）で実装する。Unicode の `⤒` `⤓` は OS / ブラウザのフォント依存で線の太さ・スタイルが揃わず、Lucide スタイル線画 1.5px と矛盾する。具体的には:

- 上へ: Lucide `chevron-up`（単線シェブロン）
- 下へ: Lucide `chevron-down`
- 先頭へ: Lucide `chevrons-up`（二重シェブロン）
- 末尾へ: Lucide `chevrons-down`

各ボタンは 44px × 44px タップターゲット（WCAG 2.5.5 準拠、既存 deleteButton / dragHandle と同寸）。

##### サイズ別レイアウト（reviewer 指摘 1 反映: 案を 1 つに確定）

w360 で fixture-small-1 が 56.5px に潰れる現状（2-0 で修正後は 1 カラム ≈ 全幅 320px）と、w480〜768 の中間帯で small ≈ 160px となる事実を踏まえ、`small / medium / large` × `viewport` のマトリクスで採用案を確定する:

| viewport   | small 実 width（2-0 修正後） | medium        | large    |
| ---------- | ---------------------------- | ------------- | -------- |
| ≤ 480px    | 約 320〜460px（1 col）       | 同左          | 同左     |
| 480〜768px | 約 160〜228px（2 col）       | 約 320〜460px | 同左     |
| ≥ 768px    | 約 280px（4 col）            | 約 580px      | 約 880px |

最も狭い `small @ 480〜768px ≈ 160〜228px` がボタン詰まりリスク帯域。ハンドル(44px) + 削除(44px) + ギャップで既に 100px 以上を消費しており、4 ボタン横並べ（4×44 = 176px）は不可能。

**3 案を比較**:

- **案 A（small は 2 ボタンのみ）**: small サイズでは「↑」「↓」のみ表示。⤒/⤓ は medium/large で表示。実装シンプル。デメリット: 20 個目を 1 番目に動かすのに 19 タップ必要（小サイズタイルだけ）
- **案 B（more menu）**: small サイズは「︙」(more) ボタンで 4 ボタンを popover に隠す。展開すると 4 つ縦並びで表示。長距離移動可能。デメリット: 展開操作が 1 タップ追加、popover 設計コスト
- **案 C（編集モードで自動拡大）**: small サイズタイルが編集モードで自動的に medium 相当の幅に拡大（`grid-column: span 2`）。デメリット: グリッドリズムが編集前後で変わる（M1b の dislikes「操作手順が突然変わる」を生む）、large の隣にあると壊れる

**採用: 案 B（more menu）**

採用根拠:

1. 案 A は機能制約が大きい（small だけ長距離移動できない）。「同じ操作手順がサイズに関わらず使える」という一貫性が崩れ、M1b の dislikes「慣れた操作手順が変わる」と矛盾する
2. 案 C は編集モード遷移時にレイアウト全体が再構成され、small が拡大した瞬間に medium / large が押し出されて見え方が劇的に変わる。M1b のコア体験を破壊する
3. 案 B は機能の一貫性を保ったまま、small サイズの視覚的圧迫を回避できる。popover 展開コスト 1 タップは長距離移動の 19 タップ削減と引き換えに合理的
4. medium / large では 4 ボタンを横並べで常時表示し、small だけ more menu に折りたたむ運用。「サイズに応じた折りたたみ」は DESIGN.md §6 Don't「ブレークポイントごとに大きくレイアウトが変わる」に該当しないか確認 → ボタン UI の表示形式が変わるだけでナビゲーション・主要レイアウトは維持されるため、§6 の例外条項「使い勝手が変わらない変更は許容」の範囲内

##### 小サイズの more menu 設計（N2 / N3 反映）

**配置方式の確定（N2 反映）**: Tile.module.css L29 に既に `overflow: hidden` が指定されており、タイル直下の `position: absolute` popover は overflow で切れる。Tile の overflow を visible にするとドラッグ中 transform で他タイルに被る別問題（z-index 競合）が起こる。よって以下のいずれかを採る:

- (i) **Portal 配置**: `createPortal(popover, document.body)` で body 直下に portal し、トリガーボタンの `getBoundingClientRect()` を基準に `position: fixed; top/left` で配置
- (ii) **inline 展開**: タイル全体の高さを一時的に拡張して、内側に 4 ボタンを縦並びで表示する。グリッドレイアウト的にはタイル自身が大きくなるだけで他タイルへの影響は最小

**採用: (i) Portal 配置**

採用根拠:

1. (ii) は small タイルが展開時に大きくなることで、グリッド全体のリズムが瞬間的に崩れる。M1b の dislikes「操作手順が突然変わる」と矛盾し、隣接タイルの位置が動いて視覚混乱を生む
2. (i) は Tile / TileGrid の overflow / z-index に手を加える必要がない。AddTileModal と同じ Portal パターンを再利用でき、実装の一貫性が高い
3. AP-I08（z-index と DOM 配置の関係）への対応として、modal / popover を body 直下に集約する設計は計画書全体で統一できる

**Modal / popover の z-index・inert 統一ポリシー（N3 反映）**:

- すべての overlay UI（AddTileModal / small more popover）は `createPortal(_, document.body)` で body 直下に配置
- z-index 階層は globals.css の既存 token に沿って統一（`--z-tile-overlay` 100 の上に modal / popover 用の `--z-overlay` を新設、または既存トークンを再利用）。新規トークンが必要なら 2.2.4 の DESIGN.md 追記作業と合わせて追加する
- **同時に開かない排他制御（M5 反映: 配置と取得手段を確定）**: AddTileModal が開いている間は small more popover を開けない、逆も同様。本サイクルでは **ToolboxShell に新設する `ToolboxOverlayContext`（仮称）** で実装する。具体的:
  - `ToolboxShell` 内で `useState<{ kind: "modal" | "more-menu"; id: string } | null>(null)` を保持し、`{ activeOverlay, openOverlay, closeOverlay }` を Context 値として provide
  - 子孫の `Tile`（small more menu トリガー）と `AddTileModal` の両方が `useToolboxOverlay()` で取得し、open 時は他 overlay を自動 close → 自身を open、close 時は自身が active なら null に戻す
  - render props で多段に渡すより Context のほうが子孫から直接アクセスでき、TileGrid / Tile / Modal のシグネチャを汚染しない
  - Context 配置先: `src/components/ToolboxShell/ToolboxOverlayContext.tsx`（同一ディレクトリ、ToolboxShell が Provider を mount）
- `inert` の付与範囲も統一: overlay が開いているとき、`document.body` の direct children のうち overlay 自身（portal 出力先）以外すべてに `inert` を付与する。複数 overlay が開かないため、1 種類の overlay 用ロジックで両方を扱える

##### more menu トリガーと popover 内部の構造

- トリガーボタン: `<button aria-label="（タイル名）の移動メニューを開く" aria-haspopup="menu" aria-expanded={isOpen} aria-controls="tile-{slug}-move-menu">` で more アイコン（`more-horizontal` 線画 1.5px、3 点横並び、Lucide [`more-horizontal`](https://lucide.dev/icons/more-horizontal) を SVG パスとして埋め込み）
- popover 内部: `role="menu"` の `<div>` または `<ul>` に 4 ボタン縦並び（各ボタン 44px 高、`role="menuitem"`）
- popover 外クリック / ESC で閉じる
- 開いた瞬間に popover 内最初のボタンへフォーカス移動、閉じたらトリガーボタンへフォーカス復帰

##### Portal popover のスクロール対応（M3 反映: 1 案確定）

ToolboxShell の `acquireScrollLock` は道具箱本体（タイルコンテナ）のスクロールのみをロックする想定で、ページ全体のスクロールは生きている可能性がある。`window.scrollend` イベントは Safari 17+ のみで、Safari 16.x では発火しない。`useLayoutEffect` + scrollend は脆い実装になる。

**確定方針: スクロール時に popover を閉じる**（位置追従は採らない）。具体的:

- popover open 中に `window.addEventListener('scroll', closePopover, { passive: true })` を `useEffect` で登録
- スクロールイベントは `requestAnimationFrame` または **200ms throttle** で間引いて `closePopover` を呼ぶ（過剰発火防止）
- close 時はトリガーボタンへフォーカス復帰（既存ロジック）
- `scrollend` ではなく `scroll` イベントを使うため Safari 16 互換（全主要ブラウザで動作）

採用根拠:

1. シンプルでブラウザ互換性が広い（Safari 16 含む全主要ブラウザ）
2. ユーザーは popover を再度トリガーで開ける（操作コスト 1 タップ追加のみ）
3. 位置追従は実装複雑性に対して得る体験が小さい（スクロール中の popover 追従はむしろ視線の遠い場所で popover が動き続ける違和感を生む）
4. トリガーが画面外に出ても close されているため、画面外 popover の表示問題が発生しない

##### 大画面の常設 vs hover（reviewer 指摘 8 反映: 採用案を確定）

reviewer 推奨に従い **`@media (hover: hover) and (pointer: fine)` 環境では hover 時のみ表示** + **タッチ環境（hover 不可）では常時表示**を採用。

具体的:

- CSS で `.moveButtons { opacity: 0; transition: opacity 0.15s; }` をデフォルト
- `.tile:hover .moveButtons, .tile:focus-within .moveButtons { opacity: 1; }` で hover / focus 時に表示
- `@media (hover: none)` で `.moveButtons { opacity: 1; }` を上書き（タッチデバイスは常時表示）
- focus-within で Tab フォーカス時にも表示されるためキーボード操作と整合（reviewer 指摘 8 の (iii) Tab フォーカスで初めて見える、を内包）
- 「opacity アニメーション」は移動ボタンの表示/非表示の遷移にのみ使用し、タイル本体やドラッグ表現には使わない（DESIGN.md §4 ドラッグ規定外の opacity 禁止と矛盾しない、ボタン自身の表示遷移は対象外）

採用根拠:

1. M1a（デスクトップで道具箱組立て）にとって 4 ボタン常設は視覚ノイズで M1a の「道具箱を整える」体験を阻害する
2. NN/g / Smashing Magazine が「primary は DnD、secondary は補助 UI」を推奨。デスクトップでは DnD が primary、ボタンは hover / focus で出現する secondary に位置づける
3. タッチ環境では hover 概念がないため常時表示が必須。`@media (hover: none)` で分岐する標準パターン
4. focus-within により Tab 操作のキーボードユーザーにも見える

##### アクセシビリティ

- 各ボタンに `aria-label="（タイル名）を上に移動"` 等
- 先頭/末尾位置のタイルでは対応する方向ボタンを `disabled` 属性 + `aria-disabled="true"`
- タッチデバイスでは常時表示なので `aria-expanded` 必要なし。デスクトップ hover 表示時もフォーカス関連属性は不要（純粋な視覚効果のため）

##### キーボード操作との一貫性（reviewer 指摘維持）

ボタンは `<button>` なので Tab で到達可能。既存 KeyboardSensor（Space → ArrowKey → Space）と独立した移動手段として機能（軸 C）。両者は競合せず補完関係。Tab 順序は「ハンドル → タイトル領域（コンテンツ） → 移動メニュー（small は more menu / medium・large は 4 ボタン） → 削除」とする。

#### 2-3. ジェスチャー（任意検討）— 不採用

スワイプ移動は学習コスト・誤操作リスクが高く、(a)(b) の効果を上回らない。仕様の単純さを優先して **不採用**。

#### 2-4. キーボード操作との一貫性

既存の KeyboardSensor + sortableKeyboardCoordinates は `Space → 矢印 → Space` のフロー。本サイクル追加の ↑/↓/⤒/⤓ ボタンは `<button>` 要素として Tab フォーカス可能で、Enter / Space で発火する独立 UI として機能。両者は競合せず補完関係（dnd-kit のキーボード操作はドラッグメタファ、ボタンは direct manipulation）。

#### 2-5. 既存検証要件の見直し

**2.2.6 完了判定の追加**: 後述の「計画書（cycle-175.md）への反映ポイント」内の 2.2.6 セクションに集約（Playwright performance trace、永続化経路、フォーカストラップ、Portal、role 修正等を統合）。

**2.2.10 Playwright 検証範囲の追加**: 後述の 2.2.10 セクションに集約。

### 検討項目 2.5: 移動ボタンの永続化経路と再レンダー連鎖（reviewer 指摘 2 + #6 中 4 統合）

**問題**: reviewer 指摘 2「移動ボタン由来の order change の永続化経路が不明」と #6 reviewer 中 4「`handleDragOver` が `config` を依存に持ち、ドラッグ中フレーム毎に再生成 → setState 連鎖」は同一の根本原因（TileGrid の状態管理設計）に行き着く。Owner 対応計画と #6 reviewer 指摘を統合した再設計を本対応計画で確定する。

**現状の問題**:

1. `handleDragOver` が `[config, onConfigChange]` を依存に持つため、`config` 更新のたびに `handleDragOver` 関数参照が変わる
2. `useEffect([setDndHandlers, handleDragOver, ...])` で setDndHandlers 経由で ToolboxShell の dndHandlers state を更新する → ToolboxShell が再レンダー
3. ToolboxShell の再レンダーで TileGrid も再レンダー → 1 に戻り、ドラッグ中の毎フレーム再レンダー連鎖が発生
4. 50 個タイル × 毎フレーム連鎖 = 深刻なパフォーマンス劣化
5. 移動ボタン由来の `arrayMove` も同じ `onConfigChange` 経路を通すなら、本問題と同一構造

**判断軸**:

- 軸 A: ドラッグ中の再レンダーが O(1) になる（config 変化に handleDragOver の再生成が連動しない）
- 軸 B: 移動ボタン経由の order change と DnD 経由の order change が同じ永続化経路を通る（保存ロジックの統一）
- 軸 C: 既存設計（ToolboxShell render props で setDndHandlers）を最小限の変更で活かす
- 軸 D: 永続化フック（useToolboxConfig、2.2.8）の設計と整合する

**確定方針（事前確定、builder に委ねない）**:

1. **TileGrid 内に `configRef = useRef(config)` を導入**し、毎レンダーで `configRef.current = config` を更新する。`handleDragOver` は `configRef.current` を読むので、依存配列を `[onConfigChange]`（または空配列で onConfigChange も ref 化）に縮小できる。これで handleDragOver の関数参照が安定し、setDndHandlers 連鎖が消える
2. **永続化経路の統一**: 移動ボタン押下時のハンドラ（仮称 `handleMoveTile(slug, direction)`）も同じ `configRef.current` 読み込み + `onConfigChange` 呼び出しの構造に揃える。DnD・移動ボタン・削除・追加すべてが `onConfigChange` の単一経路に集約される
3. **`onConfigChange` は 2.2.8 の `useToolboxConfig` フックの書き込み API（`updateLayout`）に直結**する。フックが localStorage 書き込みと同一タブ用 EventTarget dispatch を担当する。TileGrid / Tile は永続化を意識しない
4. **ToolboxDndHandlers 型自体は変更しない**（reviewer 指摘 2 の問い「DndHandlers 仕様変更が必要か」への答え＝**不要**）。ref 化でハンドラ参照が安定するため、既存の setDndHandlers render props 設計はそのまま使える
5. **`handleDragOver` で arrayMove する現設計は維持**（ドラッグ中のリアルタイムプレビューが必要なため）。ただし `handleDragEnd` のタイミングで「最終確定 + localStorage 永続化」の境界を明確に定義する責務分担とする:
   - `handleDragOver`: in-memory state の即時更新（プレビュー用）。localStorage 書き込みは行わない
   - `handleDragEnd`: 最終 config を確定し、`onConfigChange` で永続化フックへ通知。フックが localStorage 書き込み
   - これにより 50 個タイル × 毎フレーム 50 回の localStorage 書き込みを避けられる

**完了判定（M1 反映: N7 統一の漏れを修正、機能要件のみに絞る）**:

- 移動ボタン押下・DnD 経由の双方が同じ `onConfigChange` 単一経路を通って永続化される（コードレビューで確認）
- DnD 中は localStorage 書き込みが発生せず、DnD 終了時に 1 回だけ書き込まれる（Playwright spy または手動 localStorage spy で確認）
- パフォーマンス基準（フレーム時間）の判定は **2.2.6 完了判定（後述「2.2.6 への追記」内の Playwright performance trace 項）と同一基準を共有** する。本検討項目では再レンダー回数による評価を採用しない（N7 反映: collision detection / ライブ並び替えで強制的な再レンダーが多数発生し得るため、回数閾値は誤検知になる）

### 検討項目 2.6: AddTileModal のフォーカストラップ・role・Portal（#6 reviewer 致命 2-3 + 中 7 統合）

#### フォーカストラップ実装方針（#6 reviewer 致命 2 反映）

**現状**: AddTileModal は keydown ハンドラで Tab を捕捉していない。背景の Tile に Tab フォーカスが逃げる（Playwright で再現済み）。WCAG 2.1.2（フォーカスを移動させない / トラップしない）違反ではないが、modal の前提（背景非操作）を満たさない。

**確定方針（事前確定）**:

- **`inert` 属性で背景全体を非操作化**を第一候補。`document.body` の modal 以外のすべての direct children に `inert` を付与する Portal パターン（後述 Portal と組み合わせる）。`inert` は 2024 年時点で全主要ブラウザサポート済み（Chrome / Firefox / Safari）
- **React / Next.js での `inert` 取扱い（N5 反映）**: 本プロジェクトは React 19.2.4 / Next 16.1.7（`package.json` で確認済み）。React 19 から `inert` は JSX のネイティブ boolean 属性として正式サポートされ、`<div inert>` / `<div inert={true}>` の両方で正しく属性として DOM に反映される（React 18 までの「不明な属性として string 化される」問題は解消）。よって JSX で素直に書く方式を採用する
  - 動的に inert を付け外しする際は `useEffect` で `element.inert = boolean` を直接代入する（React 19 では prop と DOM property が一致するためどちらでもよいが、明示的副作用としては DOM 直接操作の方が他要素への伝播時にループ処理しやすい）
  - **jsdom テストの限界**: jsdom は `inert` の操作可能性判定（focus を奪う / イベントを止める）を完全には実装していないため、フォーカストラップの確認は **Playwright での実機検証を必須**（AP-I09 と整合）。完了判定の Playwright 検証項目に明記する
- 代替案（`inert` 非サポート環境想定 / jsdom テスト用）として、modal 内の最初/最後の focusable 要素を取得して keydown で Tab/Shift+Tab を捕捉しループする実装をフォールバックとして保持
- ESC で閉じる動作は既存維持
- 開閉時のフォーカス管理: open 時は modal 内最初の focusable へ、close 時は modal を開いた button にフォーカス復帰（`useRef` で開く前のフォーカス要素を記憶）

#### role の WCAG 4.1.2 違反解消（#6 reviewer 致命 3 反映 + N9 反映）

**現状**: AddTileModal で `role="listitem"` を `<button>` に付けると button ロールが上書きされて消失。スクリーンリーダーが「ボタン」と読み上げない。

**確定方針（事前確定、builder に委ねず構造を確定）**:

- `<ul>` / `<li>` / `<button>` のセマンティックな入れ子構造を使う（li が listitem ロールを担い、内側 button が button ロールを保持）
- `<button>` 自体には role 属性を付けない（暗黙の button ロールに任せる）
- **`<ul>` に `role="list"` を付ける（N9 反映: 確定）**。CSS で `list-style: none` を当てると VoiceOver / Safari が `<ul>` を「list」として認識しなくなる既知バグ（ほぼ全 iOS / macOS で発生）を回避するため、明示的に `role="list"` を付与する。Webkit は意図的にこの挙動を採っており回避策は role 明示が標準

#### Portal による Modal 配置（#6 reviewer 中 7 反映）

**現状**: TileGrid 内で modal を配置すると AP-I08（z-index と DOM 配置の関係）違反リスクがある。

**確定方針**: `createPortal(modal, document.body)` で body 直下に portal する。SSR 対応のため:

- `useState(false)` + `useEffect(() => setMounted(true), [])` で mount 検知
- mount 前は null を返す（SSR では modal を出さない、開いていれば次フレームで出す）
- portal 化したことで上記 `inert` 属性も body の direct children に付けやすくなる（背景 = body の他の直下要素全部）

### 検討項目 2.7: view モード click 仕様の明示（#6 reviewer 中 6 反映）

**現状**: TileGrid から Tile に `onContentClick` が渡されていない。view モードでタイルをクリックしてもナビゲーションが発火しない。

**判断軸**:

- 軸 A: M1b の「タイルをクリックしてツールへ移動」体験（コア体験の 1 つ）
- 軸 B: タイル化されたコンテンツ（実タイル）と未タイル化コンテンツ（TileFallback）で挙動を統一できる
- 軸 C: 本サイクルのスコープ（フィクスチャダミーで動作実証する）に収まる

**選択肢（N4 反映: スコープ細分化）**:

- (a) Tile 側でフォールバックリンクを内蔵し、**カード全体クリッカブル**（`::after` 拡大ヒットエリア / タイル全体を `<a>` で囲む等、NN/g card-link 推奨実装）
- (a') Tile 側でフォールバックリンクを内蔵し、**タイトル要素のみリンク**（カード余白部分はクリック不可）
- (b) TileGrid から `onContentClick` を渡し、各 Tile に navigation 責務を持たせる
- (c) 本サイクルでは仕様未定とし、Phase 7 の各タイル実装時に決める

**採用: (a') タイトル要素のみリンク（N4 reviewer 推奨に従う）**

採用根拠:

1. (a) カード全体クリッカブルは、編集モード時に `<a>` を無効化する制御が複雑（タイル全体を `<a>` で囲むと編集モードでドラッグハンドル / 移動ボタン / 削除ボタンの click が `<a>` の navigation に吸われる。`::after` 拡大ヒットエリアでも z-index と pointer-events の組み合わせ管理が複雑化）
2. (b) は TileGrid に navigation 責務を持たせると、router 依存（next/navigation）が混入し、ToolboxShell / TileGrid のテスト容易性が下がる
3. (c) は本サイクルの完了判定「タイル配置 UI が動作する」の意味が曖昧になる
4. (a') はタイル本体クリックと `<a>` の責務が分かれ、編集モード時は `pointer-events: none` で a も無効化されるという既存設計と整合。M1b の「組み立てる」体験ではまずカードの存在とタイトル認識が重要で、本サイクルではタイトルクリックでツールへ遷移できれば十分
5. card-link 化（カード全体クリッカブル）は将来 Phase 7 / B-314 でいつでも判断できるため、本サイクルでは段階的に最小実装にとどめる

**実装方針**:

- view モード時、Tile の `displayName`（既存タイトル要素）を `<a href={tile.href ?? `/tools/${slug}`}>` で巻く。タイル本体や余白部分は a ではない（クリックしても何も起こらない、card-link 化は将来）
- `Tileable` 型に `href?: string` を追加（オプション、未指定なら `/tools/${slug}` をフォールバック）
- TileFallback 表示時も同一リンクで遷移する（タイトル要素のみ）
- 編集モードでは `pointer-events: none` で a タグも無効化される（既存設計と整合）
- フィクスチャ slug は `/tools/{slug}` が 404 になるが、view モードでタイトルクリックすると 404 ページに遷移するという挙動として観察可能（クリックが通っていることの実証として十分）

### 検討項目 3: アンチパターン記録（reviewer 指摘 6 反映: スコープ限定 / N12 反映: 簡潔化）

`docs/anti-patterns/implementation.md` に新項目 **AP-I10** を追加する。reviewer 指摘 6 を受け、スコープを「DESIGN.md §4 で明示規定されている領域（ドラッグ・パネル・影・編集モード等）」に限定し、N12 reviewer 指摘の通り重複を整理して 1 文のチェックリスト項目として読みやすくする:

> AP-I10: DESIGN.md §4 で規定されている領域（ドラッグ・パネル・影・編集モード等）に、規定外の視覚表現（opacity 半透明・新色・新影・スケール変化など）を実装上の都合で追加していないか？必要なら DESIGN.md に新規定義を追加してから実装する。
> → 規定外の独自表現は「日常の傍にある道具」の物理的隠喩を壊す。新規コンポーネントの内部パディング・モーダル背景の暗転処理・特定アニメーション等、§4 が直接触れていない細部は対象外で builder の設計判断に委ねる。（cycle-175 で発生：ドラッグ中 opacity 0.4 / 編集モードコンテンツ opacity 0.7 を独自追加し Owner 指摘で削除）

合わせて `docs/anti-patterns/planning.md` への追加は不要（実装段階の問題のため）。

### 既存承認済みタスクの再レビュー手順（reviewer 指摘 7 反映）

本対応計画は既存承認済みの 2.2.4 / 2.2.5 / 2.2.6 / 2.2.10 の完了判定を変更するため、以下の手順で再レビューを必須化する。

1. **計画書 L67-75 のチェックリストを更新**: 2.2.4 / 2.2.5 のチェックボックス（[x]）を **[ ] に戻す**。完了判定が新規追加されたため、追加内容を満たすまで未完了扱い。2.2.6 / 2.2.10 はそもそも未着手なのでチェックボックス変更不要
2. **既存 2.2.4 / 2.2.5 の追加作業のみを切り出した「Owner 対応 patch」サブタスク** として builder へ委譲（既存実装はそのままで、追加作業のみ実施）。これにより既存ロジックの再実装は不要
3. **再レビュー対象**: 2.2.4 / 2.2.5 / 2.2.6 / 2.2.10 すべて、本対応計画の追加完了判定が満たされていることを reviewer が確認するまで「未承認」扱い
4. 旧 2.2.4 / 2.2.5 の承認時点で reviewer が見ていない要件（DESIGN.md §4 追記、移動ボタン、focus-visible 競合検証、cursor 整合、永続化経路、フォーカストラップ、role 修正、Portal、view click 仕様）が新規追加された旨を再レビュー依頼に明記する

### 計画書（cycle-175.md）への反映ポイント

builder への作業分担として以下を既存サブタスクの追加要件として組み込む。新規タスク作成は最小限にとどめ、既存 #4 / #5 / #6 / #10 の延長で吸収する。

#### 2.2.4（編集モード設計）への追記

- **DESIGN.md §4 ドラッグ規定の追記作業**（半透明禁止 + 編集モード視覚表現規定）を本タスクの末尾サブタスクとして加える。実装は既に整合済みのためドキュメント更新のみ
- **コード側コメント整理**: Tile.module.css 既存コメント（DESIGN.md 規定文を重複記述している箇所）を「DESIGN.md §4 参照」のリンク形式に置換
- **AP-WF13 追加（N8 反映: 2.2.4 に移動）**: PM 直接対応の境界条件を `docs/anti-patterns/workflow.md` に AP-WF13 として追加する作業を本タスクに含める。本作業は DESIGN.md 追記と同じ「ドキュメント整備」性質のため、2.2.11（lint/test/build 最終確認）ではなく 2.2.4 に集約する
- 完了判定: `DESIGN.md` の該当箇所に 2 文が追加されており、レビュアーが規約として参照できる。Tile.module.css 内に DESIGN.md 規定文の重複記述がない。`docs/anti-patterns/workflow.md` に AP-WF13 が追加されている

#### 2.2.5（Tile コンポーネント）への追記

- **移動ボタン実装（N10 反映: Lucide 公式アイコン URL を明記）**:
  - medium / large サイズ: ヘッダーまたは専用領域に「上へ / 下へ / 先頭へ / 末尾へ」の 4 SVG 線画ボタンを表示。各 44px × 44px タップターゲット、aria-label、先頭/末尾で `disabled` + `aria-disabled`
  - 使用する Lucide 公式アイコン（SVG パスは下記 URL から取得して埋め込み、線幅は 1.5px / 既存 dragIcon・deleteIcon と同パターン）:
    - 上へ: [`chevron-up`](https://lucide.dev/icons/chevron-up)
    - 下へ: [`chevron-down`](https://lucide.dev/icons/chevron-down)
    - 先頭へ: [`chevrons-up`](https://lucide.dev/icons/chevrons-up)
    - 末尾へ: [`chevrons-down`](https://lucide.dev/icons/chevrons-down)
    - small more menu トリガー: [`more-horizontal`](https://lucide.dev/icons/more-horizontal)
  - small サイズ: more-horizontal **トリガーボタン** 1 つを表示。クリックで Portal 経由で popover を表示（検討項目 2-2 の N2 採用案 (i) の通り）、内側に 4 ボタンを縦並び
  - hover / focus の表示制御（M4 反映: 表示対象を明示）: 「移動ボタン群の表示制御」が適用されるのは **medium / large の 4 ボタン横並び** および **small の more-horizontal トリガーボタン** であり、Portal popover 自身は対象外（popover は open / close 状態で表示制御するため、hover / focus には連動しない）。具体的に:
    - `@media (hover: hover) and (pointer: fine)` 環境: 4 ボタン群（medium / large）と more-horizontal トリガー（small）は hover / focus-within 時のみ表示（opacity 0 → 1 トランジション）
    - `@media (hover: none)` 環境（タッチ）: 同 4 ボタン群と more-horizontal トリガーは常時表示
    - Portal popover（small で開かれる側）: hover / focus に関係なく、トリガー押下時に open、外クリック / ESC / スクロール時に close（独立した可視性管理）
- **ドラッグハンドル `.dragHandle` に `touch-action: none` を追加**
- **cursor 整合修正**: Tile.module.css L52-54 の `tile[data-mode="edit"] { cursor: grab }` をタイル本体から削除。grab はドラッグハンドルのみに残す（既存 L120 / L140-141 で実装済みなので、L52-54 から該当行を取り除くのみ）
- **view モード click 配線（M6 反映: 編集モードの Tab 制御）**: Tile 内で view モード時に `displayName` を `<a href={tile.href ?? `/tools/${slug}`}>` で巻く（タイトル要素のみリンク、N4 反映）。Tileable 型に `href?: string` を追加
  - 編集モード時の `<a>` 制御（M6 反映）: `pointer-events: none` は **マウス / タッチのクリックを無効化するが Tab フォーカスは止めない**（CSS 仕様）。これだと編集モード中も `<a>` がフォーカス可能 → Enter で navigation してしまい、編集中に意図せず別ページへ遷移するバグを引き起こす。よって編集モード時は **`<a>` に `tabIndex={-1}` + `aria-disabled="true"`** を付与して Tab 順序から除外する。`pointer-events: none` も併用してクリック / タップ / タッチ全経路をブロックする
  - 別要素（`<span>` 等）への動的切り替えは React の reconciliation コストが大きく、`tabIndex={-1}` のほうがシンプルで a11y 上も `aria-disabled` が同伴することで意図が伝わる
- **focus-visible / accent ボーダー視覚競合検証（N11 反映: 保存先を cycle 紐付け化）**:
  - `/storybook` Tile セクションで w360 / w1280 × ライト / ダーク × 編集モード × focus-visible 状態の 8 パターンスクリーンショットを Playwright で取得し **`tmp/cycle-175-tile-screenshots/`** に保存
  - WCAG 1.4.11 コントラスト比測定（編集モード `--accent` ボーダー × 背景 `--bg`）。3:1 未満なら代替表現（`border: 2px solid var(--accent)` または `var(--accent-strong)`）を採用
  - 測定値・スクリーンショット ファイル名一覧・主要所見を **cycle-175.md の `## 補足事項` セクション**（既存、L1182 周辺）に転記し、`tmp/` 内ファイルが消えても参照経路が残るようにする（M9 反映: 既存セクション構造に整合）
- **完了判定追加**:
  - 移動ボタン群（medium/large 4 ボタン、small more menu）の表示・aria-label・disabled 制御がライト/ダーク両モードで `/storybook` で確認可能
  - cursor: ハンドル上で `grab`、タイル本体上で `default`（Playwright で確認）
  - view モード時、タイトルクリックで `/tools/{slug}` へ遷移する（Playwright で navigation 検証）
  - hover / focus-within で移動ボタンが出現する（デスクトップ）/ 常時表示（タッチエミュレーション）
  - スクリーンショット保存先 `tmp/cycle-175-tile-screenshots/` 配下のファイル名一覧が cycle-175.md の `## 補足事項` セクションに記載されている（M9 反映）

#### 2.2.6（DnD 配置 UI）への追記

- **モバイルレイアウト致命破綻の修正（最優先・着手最初）**:
  - `@media (max-width: 480px)` で Tile の `grid-column` を CSS 上書きで `span 1` に強制（`data-size` 属性経由で `!important` 不要）
  - 480〜768px 中間帯では small=span 1 / medium=span 2 / large=span 2（暗黙トラック生成防止）に丸め、`grid-auto-flow: dense` で空きセル充填
  - Tile.tsx のインライン `gridColumn` を `data-size` 属性経由で CSS から指定する方式に切り替え（dnd-kit `transform` / `transition` のインラインは維持）
  - 完了判定: w360 / w400 / w480 / w768 / w1280 で `fixture-small-1` の実 width が 100px 以上、暗黙トラックが生成されていない（`getComputedStyle(grid).gridTemplateColumns` 値で確認）
- **中間帯 transform 検証（N6 反映、本タスク着手最初の確認事項）**:
  - 480〜768px ビューポート（w600 を代表として）で `small × 2 + medium × 2 + large × 1` を配置し、各タイルを順序入れ替え（先頭→末尾、末尾→先頭、中間どうしの 3 シナリオ）するドラッグ操作を Playwright で実行
  - 検証項目: (i) ドラッグ中の `useSortable.transform` が視覚位置と一致する（DragOverlay ゴーストが指の位置に追従し、ずれない）、(ii) `grid-auto-flow: dense` 採用時に DOM 順序と表示順序の乖離が `arrayMove` の index 計算を破綻させない、(iii) ドラッグ終了後の最終配置が DOM 順序として正しく反映される、(iv) **(ii-α) 採用時の中間帯窮屈さ事前確認**: w600 で small=span 1（4col グリッド換算で実 width ≈ 130〜140px）に移動ボタン 4 個（44px × 4 = 176px）が**収まらない**ことが事前に判明している。よって (ii-α) を採るときは small サイズで more menu を中間帯にも適用する（M2 反映: small more menu の発動条件を「viewport ≤ 480px」から「viewport ≤ 768px」に拡張する CSS を併せて準備しておく）。これにより constitution rule 4「best quality in every aspect」と矛盾せず収まる
  - **破綻時の対応（M2 反映: 並行作業を明示）**: 上記 (i)〜(iii) のいずれかが破綻した場合、本対応計画 2-0 (ii-α) 代替案（中間帯ブレークポイント撤廃、`@media (max-width: 480px)` 1col と既定 4col の二値運用 + small more menu の発動条件 ≤ 768px へ拡張）に切り替えて再検証する。切替判断は builder ではなく PM へエスカレーション
  - **エスカレーション中も滞留させない並行タスク（M2 反映）**: PM 判断待ちの間、builder は中間帯設計と独立な以下を並行で進める。これにより本タスクが止まっても他タスクの進捗が止まらない
    - 2.2.5 移動ボタン実装（medium / large の 4 ボタン横並び、small の more-horizontal トリガー、aria 属性、disabled 制御）
    - AddTileModal の WCAG 修正（`<ul role="list">` 化、`<button>` 暗黙ロール復活、Portal 化、`inert` フォーカストラップ）
    - cursor 整合修正（Tile.module.css L52-54 の本体 `cursor: grab` 削除）
    - 2.2.5 完了判定の focus-visible / accent ボーダー視覚競合検証（中間帯と独立）
  - 並行タスクが進行中に PM が (ii-α) 採否を判断したら、builder は本タスクに復帰して中間帯 CSS 修正と再検証のみ追加実施する
- **sensors 分離**: ToolboxShell の sensors を `MouseSensor` + `TouchSensor({ activationConstraint: { delay: 250, tolerance: 5 } })` + `KeyboardSensor` に分離（PointerSensor 単独から変更）。dnd-kit 公式値の 250ms / 5px を採用
- **再レンダー連鎖の解消**:
  - TileGrid 内に `configRef = useRef(config)` を導入し、毎レンダーで current 更新
  - `handleDragOver` を `configRef.current` ベースに変更し、依存配列を縮小
  - setDndHandlers 連鎖を断ち切る
- **永続化経路の統一**:
  - 移動ボタンハンドラ `handleMoveTile(slug, direction)` を `arrayMove` + `onConfigChange` で実装（DnD と同じ経路）
  - `handleDragOver`: in-memory state のみ更新（プレビュー）。localStorage 書き込みなし
  - `handleDragEnd`: 最終 config を `onConfigChange` で確定。`useToolboxConfig`（2.2.8）が localStorage 書き込みを担う
- **overlay 排他制御（N3 / M5 反映）**: AddTileModal と small more popover が同時に開かないよう、`ToolboxOverlayContext` を `src/components/ToolboxShell/` に新設し、ToolboxShell が Provider を mount。子孫の Tile（small more menu トリガー）と AddTileModal は `useToolboxOverlay()` で `{ activeOverlay, openOverlay, closeOverlay }` を取得して排他開閉を行う。`inert` 付与は overlay 種別を問わず Provider 側で統一ロジックで処理（同時に最大 1 つしか開かないため、ロジックは 1 種類で済む）
- **AddTileModal の修正**:
  - フォーカストラップ: `inert` 属性で背景非操作化（React 19.2.4 ネイティブサポート、`<div inert>` または `element.inert = bool` で素直に書ける）。fallback として keydown Tab/Shift+Tab 捕捉ループを保持
  - role 修正: `<ul role="list"><li><button>` のセマンティック構造で WCAG 4.1.2 違反を解消（VoiceOver の list 認識のため `role="list"` を確定付与、N9 反映）
  - Portal: `createPortal(modal, document.body)` で body 直下に portal、SSR 対応の mount 検知
- **完了判定追加（既存「タップとドラッグの区別が明確」を客観化、N7 反映で再レンダー回数閾値を撤廃しフレーム時間基準に統一）**:
  - Playwright モバイルエミュレーション（w360）で 2 シナリオが動作:
    - (1) タイル本体縦スワイプ → スクロール量 100px 以上が観測される（`window.scrollY` の変化で判定）
    - (2) ドラッグハンドル 250ms 押下 + 5px 以上移動後に `dragstart` イベント発火（dnd-kit の onDragStart コールバックで判定）
  - 移動ボタンの動作（順序変更・disabled 制御）が動作（w360 / w1280 両方）
  - small サイズ more menu の展開・閉じる・ESC が動作。AddTileModal が開いている間は more menu が開けない、逆も同様（排他制御）
  - 大画面（w1280）でも移動ボタンが hover / focus-within で表示され、DnD と併用可能
  - **Playwright performance trace（N7 反映: 既存 2.2.6 完了判定の閾値に統一）**: 50 個タイル DnD 中のパフォーマンス基準は **「ドラッグ開始から次フレーム描画まで 100ms 以内、かつ 16ms を超えるフレームが連続しない」** に統一する（既存 2.2.6 完了判定 cycle-175.md L398 と同一基準）。再レンダー回数による評価は採用しない（collision detection / ライブ並び替えで強制的な再レンダーが多数発生し得るため、回数閾値は誤検知になる）。trace JSON は `tmp/cycle-175-perf-trace/` に保存し、ファイル名と主要数値（first-frame latency、long-frame count）を **cycle-175.md の `## 補足事項` セクション**（既存、M9 反映）に転記する
  - DnD 中は localStorage 書き込みが発生せず、DnD 終了時に 1 回だけ書き込まれる（Playwright spy または手動確認）
  - 中間帯 transform 検証（N6）が pass している
  - AddTileModal: 開いたとき背景 Tile に Tab フォーカスが逃げない（`inert` で操作不可、jsdom では検証不能のため Playwright 実機検証必須）。閉じたら開いた button へフォーカス復帰。`<button>` がスクリーンリーダーで「ボタン」として読み上げられる（accessibility tree で検証）

#### 2.2.10（視覚検証 / E2E）への追記

- **モバイル E2E シナリオ追加**: 「編集モード → 末尾タイルを chevrons-up（先頭へ）ボタンで先頭に移動 → 完了 → リロード → 配置復元」を w360 で自動化
- **小サイズ more menu の E2E**: w360 で small タイルの more-horizontal を押 → popover 展開 → chevron-up クリック → 順序変更 → popover 閉じる。AddTileModal が開いている間は more menu が開けないことも検証
- **モバイル縦スクロール動作確認**: 編集モード中、タイル本体縦スワイプでページがスクロールする（ドラッグ開始しない）
- **Tab フォーカス順序検証（M6 反映: 編集モード時タイトルリンク除外）**:
  - 使用モード: 編集ボタン → 各タイル（タイトルリンク） → ...（タイル化されたコンテンツが存在すれば内部の focusable）
  - 編集モード: 編集ボタン →（タイトルリンクは `tabIndex={-1}` で **除外**）→ 各タイル（ハンドル → 移動ボタン群 → 削除）→ EmptySlot → 完了ボタン
  - 編集モード中に Tab でタイトルへフォーカスが**入らない**こと、Enter で navigation **しない**ことを Playwright で検証
- **スクリーンショット拡張（N11 反映: 保存先を cycle 紐付け化）**: 既存 4 枚（小モバ × ライト/ダーク + デスクトップ × ライト/ダーク）に加え、(i) w360 編集モード（移動ボタン / more menu 表示確認）、(ii) w1280 編集モード × hover で 4 ボタン出現、(iii) ダークモード × 編集モード × focus-visible（accent ボーダー × outline 重なり検証）の 3 枚を追加。**保存先は `tmp/cycle-175-tile-screenshots/`（cycle 紐付け）**。完了報告にはファイル名一覧を転記する
- **AddTileModal の a11y 検証**: focus trap（Playwright 実機検証必須、jsdom では `inert` の判定が不完全）、role 正しさ（`<ul role="list">`、`<button>` の暗黙 role）、ESC 動作

### DESIGN.md / docs/anti-patterns/ への追記内容案（最終形）

#### DESIGN.md §4 レイアウト ドラッグ規定への追記（既存「ドラッグ中のパネルに `box-shadow: var(--shadow-dragging)` をつける」の直後に 2 文追加）

> ドラッグ中の視覚表現は `box-shadow: var(--shadow-dragging)` のみで行う。半透明（opacity）・色相変化・スケール変化など、規定外の表現を加えてはならない（物理的隠喩「持ち上げて運ぶ」を保つため）。
> 編集モードのタイルは `border-color: var(--accent)` で「触れる状態」を示す。`cursor: grab` はドラッグハンドル要素にのみ適用し、タイル本体には適用しない（実際にドラッグできる領域とカーソル表現を一致させるため）。半透明は使わない。タイル本体内のクリックを禁止する場合は `pointer-events: none` を使う。

#### docs/anti-patterns/implementation.md への AP-I10 追記（前述、スコープ限定版）

#### docs/anti-patterns/workflow.md への AP-WF13 追記（PM 直接対応の境界、N8 反映: 2.2.4 で追加）

> AP-WF13: PM が builder への委譲を経ずにコードを直接修正していないか？許容されるのは (i) 明文化された規約に対する違反が確定し、(ii) 修正が機械的で設計判断を伴わず、(iii) Owner 指摘起点の緊急性を持つ場合のみ。設計判断・新規実装・複数候補からの選択を含む変更は必ず builder へ委譲し reviewer 検証を経ること。
>
> ここでいう **「機械的（設計判断を伴わない）」とは「複数の修正方法から 1 つを選ぶ判断が含まれない」こと** を指す（M8 反映）。例:
>
> - **機械的に該当する**: 規定外プロパティの削除（例: `opacity: 0.4` 行の削除）、明らかな typo 修正（コメント / 識別子の誤字訂正）、欠落 import の追加（lint が示す唯一解）、ESLint --fix の auto-fix 適用
> - **機械的に該当しない**: 命名のリネーム（複数の選択肢がある）、リファクタリング（構造の選択がある）、API 設計、UI 表現の変更、新規コンポーネント追加、複数行に渡るロジック修正
>
> → PM が判断と実装の両方を担うとレビューの独立性が失われる。境界条件を超えた直接対応は AP-WF08 と同質の問題を生む。（cycle-175 で opacity 削除を PM 直接対応した事例から境界条件を明文化）

本追記は **2.2.4（編集モード設計）の末尾サブタスク** として実施する。DESIGN.md §4 追記と同じ「ドキュメント整備」性質のため、当初予定していた 2.2.11（lint/format/test/build 最終確認、性質が異なる）から 2.2.4 へ移動した（N8 reviewer 指摘反映）。

### スコープ確認

本対応は cycle-175 の Phase 2.2 基盤実装スコープ内で完結する。既存サブタスク #4 / #5 / #6 / #10 の延長で吸収するため、B-312（ペルソナプリセット）/ B-313（シェア）/ B-314（既存タイル化）等のスコープ外項目を巻き込まない。Owner 指摘は本サイクル中の DESIGN.md 違反であり、本サイクル内で必ず解消する責務がある。

### 参考にした情報

- DESIGN.md（§1 ビジュアルテーマ、§2 アクセント、§4 ドラッグ規定、§6 Do/Don't）
- `.claude/skills/frontend-design/SKILL.md`
- docs/constitution.md rule 4「best quality in every aspect for visitors」
- docs/site-concept.md「日常の傍にある道具」「物理的隠喩」
- docs/targets/気に入った道具を繰り返し使っている人.yaml（M1b の likes / dislikes）
- @dnd-kit Touch Sensor 公式ドキュメント — `activationConstraint: { delay, tolerance }` と `touch-action: none` 推奨
- NN/g「Drag-and-Drop UX」、Microsoft Mobile Engineering「Accessible Reordering For Touch Devices」、Smashing Magazine「Dragon Drop」— 「up/down ボタンが最も accessible」「先頭/末尾ボタンで長距離移動を補助」
- 既存実装: `src/components/Tile/Tile.tsx`, `Tile.module.css`, `src/components/TileGrid/TileGrid.tsx`, `src/components/ToolboxShell/ToolboxShell.tsx`
- docs/anti-patterns/implementation.md（AP-I07 〜 AP-I09 の構造を踏襲して AP-I10 を新設）

## キャリーオーバー

<!-- サイクル完了時に記入する。 -->

## 補足事項

- 着手条件「Phase 1（B-332 + B-315 Phase 1.2 部分）完了」の確認: B-332 は cycle-174 で完了。B-315 は失敗認定後の代替方針「全コンテンツ移行 + cheatsheets ブログ化」で確定済み。よって Phase 2 の着手条件は満たされている。
- ダッシュボードはサイトコンセプトのコアであり、タイル基盤の設計が後続フェーズ（B-312 テンプレート / B-314 既存コンテンツのタイル対応 / B-324 連携 / B-313 シェア）すべての前提になる。設計判断は慎重に。
- スコープと分割条件は本ドキュメント上部「スコープ定義（事前確定）」を唯一の判断基準とする。「雰囲気でキャリーオーバー」を防ぐため、作業中に分割したくなった場合も必ず「スコープ定義」セクションに照らして判断し、ドキュメント更新と Owner エスカレーションを経ること。
- 本サイクル最大のリスクは 2.2.3 の dnd-kit グリッドサイズ可変問題（既知 Issue #117 / #720 / #1692）。半日上限のスパイクで 3 経路（標準 strategy / 自前並び替え / medium 固定フォールバック）に早期分岐する事前条項を 2.2.3 に明記。半日上限到達のみがフォールバック発動条件、感覚的理由でのフォールバックは不可。
- 設計判断 1（最終形 URL = `/`）と本サイクル中の検証ルート選定（`/toolbox-preview`）はレイヤーが違う判断。設計判断 1 結論部の「補足: 最終形 URL 確定と検証ルート選定は別レイヤー」セクションに論理を明記。Phase 9.2 で `/toolbox-preview` の実装を `/` 配下に move し現行トップを廃棄する。

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
