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
- [ ] 2.2.4 編集モード / 使用モードの 2 モード分離設計（旧 [x] / ルール違反是正で再オープン: DESIGN.md §4 追記 + コメント整理）
- [ ] 2.2.5 `Tile` コンポーネント（旧 [x] / ルール違反是正で再オープン: 移動ボタン + cursor 整合 + view click + focus-visible 競合検証 + touch-action）
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
5. **`/toolbox` を選ぶ積極的理由が新コンセプト最大化観点では見当たらない**。`/toolbox` の優位として残るのは「現行トップ温存余地」「将来の自由度温存」のみで、これはゼロベース原則（現状を所与にしない、現状保護を判断軸にしない）により判断軸から除外されている

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

判断軸は新コンセプト最大化観点のみ。「現行トップ温存余地」「将来の判断自由度の温存」「複数化将来移行の破壊度」は軸に含めない（ゼロベース原則）。

| 評価軸            | 候補 1: トップ `/`                                                                 | 候補 2: 専用 `/toolbox`                                 | 候補 3: 複数 `/toolbox/[id]`                                               |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| A コンセプト体現  | 最強（ホーム/新規タブ設定で毎日反射的に開く場所として URL が最短）                 | 中（1 階層深く「専用機能ページ」感が出る）              | 弱（さらに深い + デフォルト道具箱指定が必要）                              |
| B M1b コア体験    | 強（サイト名検索 "yolos" 着地が `/`、ブクマ/URL 直入力が最短）                     | 中（ブクマ後は差が縮むが、サイト名検索再訪で 1 段不利） | 弱（複数管理 UI が「タスク管理ツール」の世界観に寄り「日常の道具」と乖離） |
| C M1a 流入阻害    | 影響軽微（M1a はツール詳細直着地のためトップを通らない事実が調査確認済）           | 影響軽微                                                | 影響軽微                                                                   |
| D SEO・初回着地   | 強（SSR で初期プリセットを出せば HTML を静的に確保。Googlebot・SNS の OGP も成立） | 強（同等）                                              | 強（同等）                                                                 |
| E シェア URL 設計 | 強（`/?state=` が最短 URL、認知性・記憶しやすさで優位）                            | 中（`/toolbox?state=`、1 階層長い）                     | 弱（`/toolbox/shared/[base64]` 等の追加設計が必要）                        |

**選定: 候補 1（トップ `/`）+ 初期表示用最小デフォルトプリセットの枠組みを基盤実装に含める（α-2）**。新コンセプト最大化観点で候補 1 は全 5 軸において候補 2・3 と同等以上、軸 A・B・E では明確に優位。`/toolbox` を選ぶ積極的理由は新コンセプト最大化観点では見当たらず、残るのは「現行トップ温存余地」「将来の判断自由度の温存」のみでゼロベース原則により判断軸から除外。複数化（候補 3）はコンセプト体現で逆効果のため不採用。

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

**設計判断 1（URL 構成）の再判断**: 計画立案当初は `/toolbox` を候補としていたが、ゼロベース原則「現状保護・実装コスト・将来の判断自由度を軸に含めない」に従い再評価した結果、`/` 採用（候補 1）に変更。「日常の傍にある道具」コンセプト体現・M1b の再訪導線・シェア URL の短さのいずれの軸でも `/` が候補 2（`/toolbox`）を上回ることが確認され、`/toolbox` を選ぶ積極的理由が新コンセプト最大化観点では存在しないと判断した。

**初期プリセット枠組みの位置づけ**: `/` 採用には SSR で「空でない初期道具箱」が必須であることから、2.2.7 として「初期表示用最小デフォルトプリセットの枠組み」を Phase 2.2 に追加した。この枠組みは B-312（ペルソナ別の複数プリセット + 選択 UI）の先取りではなく、URL 構成判断と切り離せない最小実装として明示的に分離している。B-312 担当者は本型を破棄して再設計してよいことをコメントで明記する。

**dnd-kit グリッドサイズ可変問題への対処**: dnd-kit の既知問題（Issue #117 / #720 / #1692）に対し、「半日上限スパイク + 3 経路早期分岐（標準 strategy / 自前並び替え / medium 固定フォールバック）」という事前条項を 2.2.3 に組み込んだ。フォールバック発動条件は半日上限到達のみとし、感覚的理由での回避を禁止した。この対処は設計判断 3 項目とは別レイヤーの問題であり、キャリーオーバー条件に該当しないことを明記した。

**reviewer 2 軽微改善 2 件（本コミットで反映）**: (1) 2.2.6 の 50 個ケース完了判定を「目視レベル」から「Playwright trace で 100ms 以内かつ 16ms 超フレームが連続しない」に客観化。(2) 2.2.8 の同一タブ伝播手段を「両方購読」の曖昧表現から「独自 EventTarget を第一候補とし、着手時に一方を選定する」指針に明確化。

## ルール違反の是正計画（DESIGN.md §4 整合 + モバイル UX 強化）

### 背景

cycle-175 進行中（2.2.6 着手前）に、サイクル内に紛れ込んでいた 2 件のルール違反が Owner レビューで顕在化した。本セクションはその是正と、関連する品質基準の引き上げを扱う。

1. **DESIGN.md §4 違反**: ドラッグ中の半透明（`opacity: 0.4`）と編集モード時のコンテンツ無効化の半透明（`opacity: 0.7`）が DESIGN.md §4 規定外で勝手に追加されていた。DESIGN.md §4 は「ドラッグ中は `box-shadow: var(--shadow-dragging)` のみ」を規定しており、半透明はそもそも認められていない。物理的隠喩「持ち上げて運ぶ」が壊れる。PM が直接削除済み（Tile.module.css L36-46 / L205-211、計画書 2.2.6 完了判定 L399 修正済み）。
2. **constitution rule 4「best quality in every aspect for visitors」違反**: 1〜2 タイルしか可視範囲に入らない小画面で十数枚を DnD のみで並び替えるのは苦痛。これは M1b（気に入った道具を繰り返し使っている人）の体験品質を著しく損なっており、ベストクオリティ要件を満たしていない。

判断軸は **DESIGN.md ルール / constitution rule 4「best quality in every aspect for visitors」/ M1b のコア体験「自分の道具箱を組み立てる」** とする。「他律的に対応する」のではなく「ルール違反だから自律的に是正する」という主体性で進める。

### 計画の粒度方針（基本設計に留める）

本対応計画は **基本設計（What / Why / 品質要件）** のレベルにとどめ、詳細設計（具体的な API 名・値・配置パスなど How）は builder の責務とする。各検討項目では「採用する選択肢」「採用根拠」「来訪者にとっての品質要件」「客観的な完了判定」を示し、実装方法は builder が選ぶ余地を残す。

タグ（`(N1 反映)` 等）はレビュー履歴の追跡用に保持するが、それぞれが指していた具体的な実装値は要件レベルに格上げ（または builder 判断に委譲）した。

### PM 直接対応の境界条件（reviewer 指摘 10 反映）

DESIGN.md §4 違反の opacity 削除を PM が直接対応した妥当性について、`docs/anti-patterns/workflow.md` を確認した結果、当該境界に直接対応する明示的なアンチパターンは存在しなかった（AP-WF08「PM がサブエージェントの作業を代行」は調査・記事執筆等の創作的作業を念頭に置いた項目であり、規約違反コード 2 行の即時削除には適用しがたい）。

ただし将来的な再現性のため、本対応計画に **PM 直接対応の境界条件** を明示する:

- **PM 直接対応が許容される範囲**: (i) DESIGN.md / constitution / アンチパターン等の明文化された規約に対する違反が確定しており、(ii) 修正が機械的で設計判断を伴わず、(iii) ルール違反が顕在化していて即時是正しないと来訪者品質が毀損する場合。これらすべてを満たすときのみ、PM が直接コード修正してよい。違反の顕在化経路（Owner 指摘 / reviewer 指摘 / 自己発見）は本質ではなく、判断は常に「ルール違反の事実」に対して下す（「Owner に言われたから直す」のような他律的判断は禁止）
- **直接対応してはいけない範囲**: 設計判断を含む変更、新規実装、複数候補から選ぶ判断を伴うリファクタ、レビューが必要な実装。これらはすべて builder への委譲とレビュアーによる検証が必要
- 本指摘で PM が opacity 削除を直接対応したのは上記 (i)(ii)(iii) を満たす範囲。今回の追加実装はすべて builder へ委譲する
- 本境界条件を再発防止策として `docs/anti-patterns/workflow.md` に汎用ルール化する作業を本サイクル内で行う（具体的な追記文・追加場所は builder が決定する）

### DESIGN.md とコード側コメントの単一情報源ルール（reviewer 指摘 12 反映）

DESIGN.md は yolos.net のデザイン規約の **単一情報源（Single Source of Truth）** とする。コード側のコメントに DESIGN.md の規定文を **重複記述してはならない**。コード側コメントが規約に言及するときは参照リンクのみを書く運用とする。

理由: 規定文の重複記述は二重管理を生み、DESIGN.md 更新時にコード側の旧文が残るリスクがある。コード変更時は DESIGN.md を直接読みに行く運用を強制することで、規約の最新性を担保する。

既存 Tile.module.css の重複コメントを参照リンク形式に整理する作業を 2.2.5 に含める（具体の置換手段は builder 判断）。

### 検討項目 1: 編集モード時のタイル視覚表現（DESIGN.md 整合）

**現状**: opacity は既に削除済み。「触れる状態 / 通常クリック禁止」は DESIGN.md 既存トークンの範囲で表現されている。

**判断軸**:

- 軸 A: 物理的隠喩「持ち上げて運ぶ道具」を壊さない（DESIGN.md §1）
- 軸 B: 来訪者が「使用モードのタイル」と「編集モードのタイル」を一目で区別できる（M1b の dislikes「慣れた操作手順が突然変わる」と矛盾しない）
- 軸 C: 視覚表現が DESIGN.md 既存トークンの範囲内に収まる

**検討した選択肢**:

- (a) 現状維持（既存トークンのみで区別）
- (b) ToolboxShell オーバーレイの強化で場面全体を区別する
- (c) DESIGN.md に「ドラッグ中」「編集モード」の規定を新規追加し、それに従う

**採用: (a) + (c) の組み合わせ**

採用根拠:

1. (a) は既に既存トークンの範囲で軸 A・B・C を満たす。ToolboxShell 側に既存オーバーレイと aria-live ラベルがあるため、場面全体識別はそちらが担う（軸 B 補強）
2. ただし「opacity 半透明禁止」という重要な規約が DESIGN.md に明文化されておらず、後続作業で再発する懸念がある。再発防止のため (c) として **DESIGN.md §4 ドラッグ規定に「半透明禁止」「ドラッグ中の視覚表現は規定の影トークンのみ」「編集モード時の cursor は実際にドラッグできる領域にのみ適用」を明文化する**
3. (b) は ToolboxShell のオーバーレイで既に実装済みのため重複追加は不要

**要件 / 完了判定**:

- DESIGN.md §4 にドラッグ規定の追記が反映され、後続の builder / reviewer が規約として参照できる
- 既存実装が新規定と整合している（半透明使用なし）
- 追記文面・追加場所の細部は builder が決定（DESIGN.md 既存セクション構造に従う）

**accent ボーダー × focus-visible 競合 / ダークモードコントラスト要件（reviewer 指摘 5 反映）**:

DESIGN.md §2 はアクセント色を「リンクやフォーカスの位置」に充てる規定。タイル全体ボーダーが `var(--accent)` になることで、(i) Tab フォーカス時のアウトラインと色が混ざりフォーカス位置が分かりづらい可能性、(ii) ダークモードで背景に対するコントラスト比が足りない可能性、がある。

**品質要件**:

- 編集モード × focus-visible 状態で「フォーカス位置が視認できる」（同色重なりで識別不能にならない）
- 編集モードのボーダーが背景に対して WCAG 1.4.11 Non-text Contrast の **3:1 以上** を満たす（ライト / ダーク両モード）
- 上記が満たされない場合、DESIGN.md 既存トークン（`-strong` バリアント、太さ・aspect 違いの outline 等）の範囲で代替表現を builder が選ぶ

完了判定（後述「2.2.5 への追記」内で詳述）として、ライト/ダーク × モバイル/デスクトップ × focus-visible の組み合わせで Playwright スクリーンショットと色測定値を取得し、上記要件を満たすことを確認する。

### 検討項目 1.5: cursor とドラッグ可能領域の整合（reviewer 指摘 4 反映）

**現状の問題**: タイル全体に「掴める」カーソルが当たる一方、実際にドラッグ起点となるのはドラッグハンドルのみ。「掴める領域」と「実際にドラッグできる領域」が一致せず、来訪者の誤誘導が発生している。

**判断軸**:

- 軸 A: 「掴める領域＝実際にドラッグできる領域」が一致する（M1b の dislikes「思い通りに動かない」を起こさない）
- 軸 B: タイル本体クリック / ドラッグハンドル / 移動ボタンの責務分離と整合
- 軸 C: a11y / モバイル誤動作防止の業界標準パターンに沿う

**選択肢**:

- 案 A: cursor の grab 表現はドラッグハンドル限定とし、タイル本体は default
- 案 B: タイル本体もドラッグ可能にする（listeners をタイル本体に展開）

**採用: 案 A**

採用根拠:

1. 案 B は本サイクルの既存設計「編集モード時のコンテンツ部はクリック禁止」と直接競合する
2. ハンドルベースのドラッグは a11y / モバイル誤動作防止の業界標準パターン（Notion / Trello / Linear すべて採用）
3. 移動ボタン（検討項目 2-2 で採用）が「タイル全体を直接操作する代替手段」を提供するため、ハンドル限定でも長距離移動が保証される

**要件 / 完了判定**:

- ドラッグハンドル上では「掴める」カーソル、タイル本体上では通常カーソル
- 来訪者が「実際にドラッグできる場所」を視覚的に誤認しない
- Playwright で編集モード時のカーソル状態をハンドル / 本体それぞれで検証

### 検討項目 2: モバイル UX 強化

#### 2-0. モバイルレイアウト致命破綻の修正（#6 reviewer 致命 1 統合 / 必須前提 / N1 反映）

**事象**: 現状、CSS Grid のテンプレート設定とタイル側の span 値が viewport によっては整合せず、small サイズタイルが極端に潰れる現象（モバイル w360〜375 で実 width 2〜56px）が発生している。#6 reviewer と本 PM が別環境で再現確認済み。

これはモバイル UX の前提を根底から壊している。constitution rule 4 違反「小画面で 1〜2 タイルしか表示されない」の **真因** はこの致命破綻であり、移動ボタン以前にこちらを先に修正する必要がある。

**実装責務**: 本修正は **2.2.6 着手の最初** に行う。これが解消されない限りモバイル UX 強化（移動ボタン等）の評価は不可能（タイル自体が見えていない）。

**品質要件 / 完了判定（数値・客観基準のみ）**:

- 主要ビューポート（w360 / w400 / w480 / w768 / w1280）で small / medium / large 各サイズのタイルが視覚破綻なく配置される
- いずれのビューポートでも small サイズの実 width が **100px 以上**（タップターゲット 44px + パディングを十分含む幅）
- CSS Grid の暗黙トラックが意図せず生成されない（テンプレート値が想定どおり）
- 中間帯（480〜768px）でドラッグ中の visual transform が実際のタイル位置と一致し、ドラッグ操作が視覚破綻なく動作する（後述「中間帯 transform 検証」参照）

**設計選択は builder に委ねる**: グリッドテンプレートの調整方法（`grid-auto-flow` の指定、span の丸め、CSS 経由 vs インライン経由など）は複数のアプローチが成立しうるため、上記要件を満たす方法を builder が選択する。中間帯の代替設計（中間ブレークポイントの撤廃など）も builder が試行錯誤する余地として残す。N6（中間帯 transform 検証）で破綻が確認された場合は **PM へエスカレーション** し、PM が代替方針の採否を判断する。

**エスカレーション中の並行タスク（M2 反映）**: PM 判断待ちの間も、中間帯設計と独立な作業（移動ボタン実装、AddTileModal の WCAG 修正、cursor 整合修正、focus-visible / accent 視覚競合検証）は builder が並行で進めてよい。本タスクの停滞が他タスクを止めない設計とする。

#### 2-1. タッチ操作のドラッグ検出（reviewer 指摘 3 反映）

**問題**: 現状の sensor 設定では touch start で即ドラッグ開始する可能性があり、来訪者が縦スクロールしようとしただけでタイルがドラッグされる誤動作リスクがある。

**判断軸**:

- 軸 A: 通常スクロール（縦方向）とドラッグ意図の区別が直感的にできる
- 軸 B: dnd-kit 公式・コミュニティのベストプラクティスに沿う
- 軸 C: M1b の dislikes「思い通りに動かない」を起こさない

**品質要件**:

- タッチデバイスで「タイル本体を縦スワイプ＝ページがスクロールする」「ドラッグハンドルを長押し＋移動＝ドラッグ開始」が明確に区別される
- タップとドラッグの誤判定が来訪者ストレスにならないレベルに調整される

**設計選択は builder に委ねる**: dnd-kit の sensor 種別（PointerSensor 単独 vs Mouse + Touch 分離）、`activationConstraint` の delay / tolerance 値、`touch-action` の適用範囲（ハンドル限定など）は複数の組み合わせが成立する。dnd-kit 公式ドキュメントの推奨値を初期値として採用しつつ、後述の Playwright モバイル E2E（2.2.10）で誤判定の有無を確認し、必要に応じて値を調整する余地を残す。

#### 2-2. 小画面での代替操作手段（移動ボタン）

**現状の問題**: 480px 未満は 1 カラム表示。10〜20 タイルを末尾から先頭へ DnD だけで動かすには長距離ドラッグまたは複数回操作が必要で、M1b の「自分の道具箱を組み立てる」体験を阻害する。2-0 の致命破綻を修正してもなお、1 カラム表示で長距離移動の苦痛は残るため、**移動ボタンは必須要件**。

**判断軸**:

- 軸 A: M1b のコア体験「自分の道具箱を組み立てる」を最大化（constitution rule 4）
- 軸 B: DnD と矛盾せず、両者が共存できる
- 軸 C: キーボード操作（既存 KeyboardSensor）と整合する
- 軸 D: 実装が DESIGN.md / 既存コンポーネント語彙の範囲内
- 軸 E: 業界ベストプラクティス（NN/g、Microsoft Mobile Engineering、Smashing Magazine）に沿う

**選択肢評価**:

| 候補                             | 軸 A | 軸 B | 軸 C | 軸 D         | 軸 E             |
| -------------------------------- | ---- | ---- | ---- | ------------ | ---------------- |
| (a) 各タイルに 4 種の移動ボタン  | 強   | 強   | 強   | 強           | 最強（業界推奨） |
| (b) Grid → List 表示モード切替   | 弱   | 中   | 中   | 弱（新概念） | 弱               |
| (c) 数値で順番指定               | 弱   | 強   | 中   | 弱           | 弱               |
| (d) 長押しで「移動先指定」モード | 中   | 中   | 弱   | 弱           | 中               |
| (e) スワイプで移動               | 弱   | 中   | 弱   | 弱           | 弱（学習コスト） |

**採用: (a) 各タイルに 4 種類の移動操作を提供**

採用根拠:

1. NN/g [Drag-and-Drop UX](https://www.nngroup.com/articles/drag-drop/)、Microsoft Mobile Engineering [Accessible Reordering for Touch Devices](https://medium.com/microsoft-mobile-engineering/accessible-reordering-for-touch-devices-e7f7a7ef404)、Smashing Magazine [Dragon Drop](https://www.smashingmagazine.com/2018/01/dragon-drop-accessible-list-reordering/) ともに「up/down ボタンが最も accessible」と明示
2. (b) は Grid と List で 2 表現を持つことが DESIGN.md §1「シンプル」と矛盾し、M1b の dislikes「操作手順が突然変わる」を生む
3. (c) は道具箱という生活道具のメタファと乖離する
4. (d)(e) は学習コストが高く、初見の M1b に伝わらない
5. 「1 つ前 / 1 つ後 / 先頭 / 末尾」の 4 種類を提供することで、20 個目を 1 番目に動かすような長距離移動も 1 操作で完結できる（Microsoft の調査でも「複数操作タップ数の削減」として推奨）

**機能要件**:

- 編集モード時、各タイルから 4 種類の移動操作（前へ / 後へ / 先頭 / 末尾）が呼び出せる
- 先頭 / 末尾位置のタイルでは対応する方向の操作が無効化される（disabled 状態）
- 移動ボタン経由・DnD 経由のどちらでも同じ最終配置・同じ永続化結果になる
- a11y 要件: 各操作にスクリーンリーダー向けのラベル、キーボード操作（Tab / Enter / Space）で完結、タップターゲット 44px 以上（WCAG 2.5.5）
- 視覚要件: アイコンは Lucide スタイル線画 1.5px / 16-24px（DESIGN.md §3 準拠）、絵文字 / Unicode 記号は使わない

**サイズ別表示の課題と要件（reviewer 指摘 1 反映）**:

w360 1col では small ≈ 320〜460px と十分な幅があるが、中間帯（w480〜768、2col）では small ≈ 160〜228px となり、ハンドル + 削除ボタンで既に 100px 以上が消費される。**4 ボタンを横並びで常設すると small サイズで視覚破綻する**。

**品質要件**:

- small サイズタイルでも 4 種類の移動操作（前へ / 後へ / 先頭 / 末尾）すべてが a11y / 視覚破綻なく利用可能であること
- すべてのサイズで「同じ操作で同じ結果が得られる一貫性」を保つ（M1b の「慣れた操作手順が変わらない」要件、サイズによって機能が欠けてはならない）
- 編集モード遷移時にレイアウト全体が大きく組み変わらない（M1b の dislikes「操作手順が突然変わる」を生まない）

**設計選択は builder に委ねる**: small サイズで 4 ボタンをどう収めるか（ポップアップで折りたたむ / 別レイアウトに切り替える / その他）、popover 表示時の配置方式（Portal 配置 / inline 展開 / その他）、スクロール時の挙動（閉じる / 追従 / 無反応）、デスクトップでの常設 vs hover 表示などは、上記の品質要件を満たす方法を builder が選ぶ。検証の補助情報（スクリーンショット、UX 観察結果）は cycle 紐付けディレクトリ（後述）にアーカイブし、再レビュー時に参照可能にする。

**補足: 過去レビューで挙がった実装の参考案（採用は builder 判断）**:

- small サイズの折りたたみ案として「more menu / Portal popover」「inline 展開」「hover 限定常設」などが議論された
- アイコン候補として Lucide の `chevron-up` / `chevron-down` / `chevrons-up` / `chevrons-down` / `more-horizontal` 等が候補にあがる
- いずれも上記の品質要件を満たすかが採否の基準

#### 2-3. ジェスチャー（任意検討）— 不採用

スワイプ移動は学習コスト・誤操作リスクが高く、(a)(b) の効果を上回らない。仕様の単純さを優先して **不採用**。

#### 2-4. キーボード操作との一貫性

既存の KeyboardSensor + sortableKeyboardCoordinates は `Space → 矢印 → Space` のフロー。本サイクル追加の ↑/↓/⤒/⤓ ボタンは `<button>` 要素として Tab フォーカス可能で、Enter / Space で発火する独立 UI として機能。両者は競合せず補完関係（dnd-kit のキーボード操作はドラッグメタファ、ボタンは direct manipulation）。

#### 2-5. 既存検証要件の見直し

**2.2.6 完了判定の追加**: 後述の「計画書（cycle-175.md）への反映ポイント」内の 2.2.6 セクションに集約（Playwright performance trace、永続化経路、フォーカストラップ、Portal、role 修正等を統合）。

**2.2.10 Playwright 検証範囲の追加**: 後述の 2.2.10 セクションに集約。

### 検討項目 2.5: DnD と移動ボタンの永続化経路（reviewer 指摘 2 + #6 中 4 統合）

**問題**: 移動ボタン由来の順序変更と DnD 由来の順序変更で永続化経路が乖離すると、保存ロジックが二重化して同期破綻リスクが生まれる。また、現状の TileGrid 実装はドラッグ中に setState 連鎖が発生しうる構造で、50 個タイル時のパフォーマンス劣化リスクがある。

**判断軸**:

- 軸 A: ドラッグ中のフレーム時間が来訪者ストレスにならないレベル
- 軸 B: 移動ボタン経由・DnD 経由で同じ永続化経路を通る（保存ロジックの統一）
- 軸 C: 永続化フック（useToolboxConfig、2.2.8）の設計と整合する

**機能要件 / 完了判定**:

- 移動ボタン押下・DnD 経由の双方が **同一の永続化 API を通って localStorage に書き込まれる**（コードレビューおよび Playwright spy で確認）
- DnD 中（ドラッグ操作の最中）には localStorage 書き込みが発生せず、**ドラッグ確定時にのみ 1 回書き込む**（過剰書き込みによるパフォーマンス劣化と書き込み破損リスクを避ける）
- パフォーマンス基準は 2.2.6 完了判定（後述、フレーム時間 100ms / 16ms 超フレーム連続なし基準）と共有する
- 再レンダー回数による評価は採用しない（dnd-kit のライブ並び替えは collision detection 等で多数の再レンダーを誘発し得るため、回数閾値は誤検知になる）

**設計選択は builder に委ねる**: 関数参照の安定化手段（useRef / useCallback / useMemo / それ以外）、永続化境界の引き方（onDragOver / onDragEnd / 別タイミング）、ハンドラ間でのデータ受け渡し方法は、上記要件を満たすアプローチを builder が選ぶ。

### 検討項目 2.6: AddTileModal の WCAG 適合（#6 reviewer 致命 2-3 + 中 7 統合）

**現状の問題（複数）**:

- AddTileModal を開いている間、背景の Tile に Tab フォーカスが逃げる（modal の前提を満たさない）
- `role="listitem"` を `<button>` に付けて button ロールが消失している箇所があり、スクリーンリーダーが「ボタン」と読み上げない（WCAG 4.1.2 違反）
- TileGrid 内に modal を置いていることで、上位の z-index / overflow の影響を受けるリスクがある（AP-I08）

**機能要件 / 完了判定**:

- **背景非操作化**: modal open 中、背景要素（modal 以外のすべて）はキーボード操作・支援技術（スクリーンリーダー）から到達不能になる。Playwright 実機検証必須（jsdom では `inert` の判定が不完全）
- **role の正しさ**: list / listitem / button の意味的セマンティクスが、accessibility tree で期待どおりに読み取られる（特に `<button>` が「ボタン」として読み上げられる）。VoiceOver / Safari の `list-style: none` バグを回避する設定を含む
- **z-index / overflow 安全性**: modal が他要素のスタッキングコンテキストに影響されず最前面に表示される（AP-I08 準拠）
- **フォーカス管理**: open 時に modal 内最初の focusable へ、close 時に開いた button へフォーカスが復帰する
- ESC キーで閉じる動作は既存維持

**設計選択は builder に委ねる**: 背景非操作化の実装手段（`inert` 属性 / keydown でのフォーカストラップループ / 両方併用）、modal 配置手段（Portal / 既存 DOM 内）、role 構造の具体（`<ul>` 直下に `<li>` / `<div role="list">` 等）、SSR 対応の mount タイミングは、上記要件を満たす範囲で builder が選ぶ。

参考情報: 本プロジェクトは React 19.2.4 / Next 16.1.7 で `inert` 属性は JSX ネイティブサポート済み。jsdom テストでは `inert` の操作可能性判定が不完全なため、当該検証は Playwright 実機が必須（AP-I09 と整合）。

### 検討項目 2.7: 使用モードでのタイルクリックによる遷移（#6 reviewer 中 6 反映）

**現状**: 使用モードでタイルをクリックしてもナビゲーションが発火しない。M1b の「タイルから即ツールへ移動」体験が成立していない。

**判断軸**:

- 軸 A: M1b の「タイルをクリックしてツールへ移動」体験の成立
- 軸 B: タイル化されたコンテンツ（実タイル）と未タイル化（フォールバック）で挙動を統一できる
- 軸 C: 本サイクルのスコープ（フィクスチャダミーで動作実証する）に収まる

**選択肢**:

- (a) Tile 自身がリンク責務を持つ（フォールバックリンク内蔵、カード全体クリッカブル）
- (a') Tile 自身がリンク責務を持つ（フォールバックリンク内蔵、タイトル要素のみリンク）
- (b) TileGrid から `onContentClick` を渡し navigation 責務を担わせる
- (c) 本サイクルでは仕様未定とし、Phase 7 の各タイル実装時に決める

**採用: (a') タイトル要素のみリンク（N4 反映）**

採用根拠:

1. (a) は編集モード時の制御複雑化（カード全体が `<a>` だとドラッグハンドル / 移動ボタン / 削除ボタンの click が `<a>` の navigation に吸われる）
2. (b) は TileGrid に router 依存が混入しテスト容易性が下がる
3. (c) は本サイクルの完了判定が曖昧になる
4. (a') はタイル本体クリックと `<a>` の責務が分かれて編集モードの抑制と整合。card-link 化（カード全体クリッカブル）は Phase 7 / B-314 で再判断できる

**機能要件 / 完了判定**:

- 使用モードでタイトルをクリックすると当該ツールのページへ遷移する（フィクスチャ slug は 404 で構わない、navigation が走ることが実証できればよい）
- **編集モード中はタイトルへの Tab フォーカスが入らず、Enter で意図しない navigation が発生しない**（編集中に別ページへ遷移してしまうバグの防止、M6 反映）
- フォールバック表示時も同等の遷移ができる
- Tileable 型に href 相当のプロパティを追加し、未指定時は `/tools/{slug}` をデフォルトとする

**設計選択は builder に委ねる**: 編集モード時に Tab フォーカスから外す手段（`tabindex` / 動的に要素差し替え / その他）、リンクの DOM 構造（タイトル要素を `<a>` で巻く / `<a>` 内にタイトルを置く）は、上記要件を満たす方法を builder が選ぶ。

### 検討項目 3: アンチパターン記録（reviewer 指摘 6 反映: スコープ限定 / N12 反映: 簡潔化）

**何を記録するか（要件）**:

1. DESIGN.md §4 で規定されている領域（ドラッグ・パネル・影・編集モード等）に、規定外の視覚表現を実装上の都合で追加した経緯と再発防止策（cycle-175 で発生した opacity 半透明追加事案）。新規コンポーネントの細部や DESIGN.md §4 が直接触れていない領域は対象外
2. PM 直接対応の境界条件（cycle-175 で PM が opacity 削除を直接対応した経緯から、許容範囲と禁止範囲を再発防止策として明文化）

**設計選択は builder に委ねる**: アンチパターンチェックリスト本文の文面、追加するファイル（`docs/anti-patterns/implementation.md` / `workflow.md` 等）と挿入位置は、既存ファイルの書式・スコープに整合する形を builder が選ぶ。同種の重複項目があれば既存項目の更新で済ませる判断もありうる。

### overlay 排他制御（要件のみ）

AddTileModal と small サイズの移動操作 popover（または同等の overlay UI）は、来訪者を混乱させないため **同時に開かない** ことを要件とする。

**設計選択は builder に委ねる**: 排他制御の実現手段（Context / 親 state / イベントバス / その他）、配置パスは、子孫コンポーネントから無理のないインタフェースで参照できる構造を builder が選ぶ。

### 既存承認済みタスクの再レビュー手順（reviewer 指摘 7 反映）

本対応計画は既存承認済みの 2.2.4 / 2.2.5 / 2.2.6 / 2.2.10 の完了判定を変更するため、以下の手順で再レビューを必須化する。

1. **計画書 L67-75 のチェックリストを更新**: 2.2.4 / 2.2.5 のチェックボックスを `[ ]` に戻す。完了判定が新規追加されたため、追加内容を満たすまで未完了扱い。2.2.6 / 2.2.10 はそもそも未着手なのでチェックボックス変更不要
2. 既存 2.2.4 / 2.2.5 の追加作業のみを切り出した「ルール是正 patch」サブタスクとして builder へ委譲（既存実装の再実装は不要）
3. 再レビュー対象: 2.2.4 / 2.2.5 / 2.2.6 / 2.2.10 すべて、本対応計画の追加完了判定が満たされるまで「未承認」扱い
4. 旧 2.2.4 / 2.2.5 の承認時点で reviewer が見ていない要件（DESIGN.md §4 追記、移動ボタン、focus-visible 競合検証、cursor 整合、永続化経路、AddTileModal の WCAG 適合、view モード click、overlay 排他制御）が新規追加された旨を再レビュー依頼に明記する

### 計画書（cycle-175.md）への反映ポイント

builder への作業分担として以下を既存サブタスクの追加要件として組み込む。新規タスク作成は最小限にとどめ、既存 #4 / #5 / #6 / #10 の延長で吸収する。

#### 2.2.4（編集モード設計）への追記

- DESIGN.md §4 ドラッグ規定の追記作業（「半透明禁止」「ドラッグ中の視覚表現は規定の影トークンのみ」「編集モード時の cursor は実際にドラッグ可能な領域にのみ適用」を明文化）。実装は既に整合済みのためドキュメント更新のみ
- コード側コメント整理: Tile.module.css の DESIGN.md 規定文を重複記述している箇所を、参照リンク形式に置換する（具体の置換手段は builder 判断）
- アンチパターン記録（検討項目 3）の実施: DESIGN.md 規定外表現の追加経緯と PM 直接対応境界条件を `docs/anti-patterns/` 配下に記録（具体のファイル選択・追記文面は builder 判断、ただし既存項目の書式と整合させる）
- 完了判定: DESIGN.md の該当箇所に追記が反映されレビュアーが規約として参照できる。Tile.module.css 内に DESIGN.md 規定文の重複記述がない。アンチパターンが `docs/anti-patterns/` に記録されている

#### 2.2.5（Tile コンポーネント）への追記

- **移動ボタン実装**: 編集モード時に各タイルから 4 種類の移動操作（前へ / 後へ / 先頭 / 末尾）が呼び出せる。先頭/末尾位置で対応方向が無効化される。a11y（aria-label、Tab 到達可能、44px タップターゲット）と DESIGN.md §3 視覚要件（線画 1.5px / 16-24px、絵文字・Unicode 記号不可）を満たす
- **small サイズでも 4 種類の移動操作が a11y / 視覚破綻なく利用可能**（折りたたみ手段は builder 判断、品質要件は検討項目 2-2 参照）
- **タッチ操作のドラッグ検出**: タイル本体縦スワイプはスクロール、ドラッグハンドルは長押し系操作でドラッグ開始という区別が成立する設定（具体値は builder 判断、検討項目 2-1 参照）
- **cursor 整合修正**: 「掴める」カーソル表現はドラッグハンドルにのみ適用、タイル本体は通常カーソル
- **使用モード click 配線**: 使用モード時にタイトル要素のクリックでツールページへ遷移。**編集モード中はタイトルへの Tab フォーカスが入らず Enter で navigation が発生しない**
- **focus-visible / accent ボーダー視覚競合と暗色モードコントラスト要件の検証**: ライト / ダーク × モバイル / デスクトップ × focus-visible 状態の組み合わせで、フォーカス位置の視認性と WCAG 1.4.11（3:1）を満たすことを Playwright で確認。検証用スクリーンショットと色測定値はサイクルに紐付けてアーカイブし、再レビュー時に参照可能にする（保存ディレクトリ名・転記先セクションは builder 判断、ただし `tmp/` 配下の cycle 紐付けディレクトリ + cycle-175.md 内の所見記載のいずれかを採る）
- 完了判定:
  - 移動ボタン群の表示・aria-label・disabled 制御がライト/ダーク両モードで `/storybook` で確認可能
  - cursor: ハンドル上で「掴める」、タイル本体上で通常（Playwright で確認）
  - 使用モード時、タイトルクリックで対応 URL へ遷移（Playwright で navigation 検証）
  - 編集モード時、タイトルが Tab フォーカス対象から外れ、Enter で navigation が発生しない（Playwright で検証）
  - 検証用アーカイブのファイル名一覧と主要数値が cycle-175.md `## 補足事項` セクションに記載されている

#### 2.2.6（DnD 配置 UI）への追記

- **モバイルレイアウト致命破綻の修正**（最優先・着手最初）: 検討項目 2-0 の品質要件をすべて満たす（主要 5 ビューポートで small width 100px 以上、暗黙トラックなし、中間帯 transform 検証 pass）
- **中間帯 transform 検証**: 中間帯ビューポートで `small × 2 + medium × 2 + large × 1` を配置し、3 シナリオ（先頭→末尾、末尾→先頭、中間どうし）のドラッグ操作を Playwright で実施。ドラッグ中の視覚位置一致、index 計算の正しさ、最終配置の正しさを確認。破綻時は PM へエスカレーション
- **タッチ操作のドラッグ検出**: 検討項目 2-1 の品質要件を満たす（タイル本体縦スワイプ＝スクロール、ハンドル＝ドラッグ開始）
- **DnD と移動ボタンの永続化経路統一**: 検討項目 2.5 の機能要件を満たす（同一 API 経由で localStorage 書き込み、ドラッグ中は書き込みなし、確定時のみ書き込み）
- **AddTileModal の WCAG 適合**: 検討項目 2.6 の機能要件を満たす（背景非操作化、role の正しさ、最前面表示、フォーカス管理）
- **overlay 排他制御**: AddTileModal と small サイズの移動操作 overlay が同時に開かない（要件のみ、実装手段は builder 判断）
- 完了判定:
  - Playwright モバイルエミュレーション（w360）で 2 シナリオが動作: (1) タイル本体縦スワイプでスクロール量 100px 以上、(2) ドラッグハンドル長押し + 移動で `dragstart` イベントが発火する
  - 移動ボタンの動作（順序変更・disabled 制御）が w360 / w1280 両方で動作
  - small サイズの移動操作 overlay が展開・閉じる・ESC で動作。AddTileModal が開いている間は同時に開けない（排他制御）
  - **Playwright performance trace**: 50 個タイル DnD 中のパフォーマンス基準は「ドラッグ開始から次フレーム描画まで 100ms 以内、かつ 16ms を超えるフレームが連続しない」（既存 2.2.6 完了判定 cycle-175.md L398 と同一基準）。再レンダー回数による評価は採用しない
  - DnD 中は localStorage 書き込みが発生せず、DnD 終了時に 1 回だけ書き込まれる
  - 中間帯 transform 検証が pass している
  - AddTileModal の背景フォーカストラップが Playwright 実機で動作する（jsdom では検証不能）
- trace データ・スクリーンショットはサイクルに紐付けてアーカイブし、ファイル名と主要数値を cycle-175.md `## 補足事項` セクションに転記する（具体ディレクトリ名は builder 判断）

#### 2.2.10（視覚検証 / E2E）への追記

- モバイル E2E シナリオ追加: 編集モード → 末尾タイルを「先頭へ」操作で移動 → 完了 → リロード → 配置復元（w360 で自動化）
- 小サイズ移動操作 overlay の E2E: w360 で展開 → 1 操作 → 閉じる。AddTileModal との排他検証も含む
- モバイル縦スクロール動作確認: 編集モード中、タイル本体縦スワイプでページがスクロールする（ドラッグ開始しない）
- Tab フォーカス順序検証:
  - 使用モード: 編集ボタン → 各タイル（タイトルリンク） → ...
  - 編集モード: 編集ボタン →（タイトルリンクは除外）→ 各タイル（ハンドル → 移動操作 → 削除）→ EmptySlot → 完了ボタン
  - 編集モード中に Tab でタイトルへフォーカスが入らないこと、Enter で navigation しないことを Playwright で検証
- スクリーンショット拡張: 既存 4 枚に加え、(i) w360 編集モード、(ii) w1280 編集モード × hover、(iii) ダークモード × 編集モード × focus-visible の 3 枚を追加。サイクル紐付けディレクトリにアーカイブ、ファイル名一覧を `## 補足事項` に転記
- AddTileModal の a11y 検証: focus trap（Playwright 実機必須）、role 正しさ、ESC 動作

### DESIGN.md / docs/anti-patterns/ への追記内容案（最終形）

#### DESIGN.md §4 レイアウト ドラッグ規定への追記

要件:

- ドラッグ中の視覚表現は規定の影トークンのみで行い、半透明（opacity）・色相変化・スケール変化など規定外の表現を加えてはならない（物理的隠喩「持ち上げて運ぶ」を保つため）
- 編集モードのタイルはアクセント色で「触れる状態」を示す
- 「掴める」カーソル表現はドラッグハンドル要素にのみ適用し、タイル本体には適用しない（実際にドラッグできる領域とカーソル表現を一致させるため）
- タイル本体内のクリックを禁止する場合は `pointer-events: none` を使う（既存規約の延長）

具体の文面と挿入位置は builder が DESIGN.md 既存セクション構造に合わせて決定する。

#### docs/anti-patterns/ への追記

- DESIGN.md §4 規定外表現の追加事案を再発防止策として記録（cycle-175 で発生）
- PM 直接対応の境界条件を再発防止策として記録（許容範囲と禁止範囲、機械的＝設計判断を伴わないの定義）

具体の追記文面・追加場所（implementation.md / workflow.md 等）は builder が既存ファイルの書式とスコープに整合する形で決定する。本サイクル内で追加完了させる。

### スコープ確認

本対応は cycle-175 の Phase 2.2 基盤実装スコープ内で完結する。既存サブタスク #4 / #5 / #6 / #10 の延長で吸収するため、B-312（ペルソナプリセット）/ B-313（シェア）/ B-314（既存タイル化）等のスコープ外項目を巻き込まない。本サイクル中に紛れ込んだ DESIGN.md §4 違反 / constitution rule 4 違反は本サイクル内で必ず解消する責務がある。

### 参考にした情報

- DESIGN.md（§1 ビジュアルテーマ、§2 アクセント、§4 ドラッグ規定、§6 Do/Don't）
- `.claude/skills/frontend-design/SKILL.md`
- docs/constitution.md rule 4「best quality in every aspect for visitors」
- docs/site-concept.md「日常の傍にある道具」「物理的隠喩」
- docs/targets/気に入った道具を繰り返し使っている人.yaml（M1b の likes / dislikes）
- @dnd-kit Touch Sensor 公式ドキュメント — `activationConstraint: { delay, tolerance }` と `touch-action: none` 推奨
- NN/g「Drag-and-Drop UX」、Microsoft Mobile Engineering「Accessible Reordering For Touch Devices」、Smashing Magazine「Dragon Drop」— 「up/down ボタンが最も accessible」「先頭/末尾ボタンで長距離移動を補助」
- 既存実装: `src/components/Tile/Tile.tsx`, `Tile.module.css`, `src/components/TileGrid/TileGrid.tsx`, `src/components/ToolboxShell/ToolboxShell.tsx`
- docs/anti-patterns/implementation.md / workflow.md（既存項目の構造に整合する形で再発防止策を追加。具体の追記文面・追加位置は builder 判断）

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
