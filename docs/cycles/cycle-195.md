---
id: 195
description: B-426（P1、移行計画 Phase 7 = タイル基盤実装）に取り組む。タイル登録の型契約 / サイズ枠規格の定数化 / レジストリの仕組みと hidden 検証ルートを整備し、B-314（Phase 8）が安全に着手できる状態にする。来訪者から見える変化はない。
started_at: 2026-05-19T16:30:48+0900
completed_at: null
---

<!-- このファイルはサイクルドキュメントのテンプレートです。`<>`で囲まれた部分を適切な内容に置き換えて使用してください。内容は作業が進むごとに都度更新してください。 -->

# サイクル-195

このサイクルでは B-426（P1、移行計画 **Phase 7 = タイル基盤実装**）に取り組む。`docs/design-migration-plan.md` の Phase 7 で定義された通り、(7.1) タイル登録の型契約、(7.2) サイズ枠規格の定数化（1 セル 128px × 128px + マージン 8px）、(7.3) レジストリの仕組み + hidden 検証ルート（`/internal/tiles` 等）の 3 サブタスクを完遂する。

本サイクルは「タイル基盤のみ」の小規模な整備に集中する。Tile コンポーネント本体・DnD・編集モード・モーダル・Undo・多タイル管理機構・useToolStorage・PrivacyBadge 等の個別コンポーネントは含めない（Phase 8 で実利用発生時、または Phase 10 で実装する）。来訪者から見える変化は発生しない。

cycle-191/192/193 の 3 連続失敗の核心は「タイル基盤と詳細移行を同時にやろうとした過大スコープ」であり、cycle-194 でこれを分解した結果として新 Phase 7（基盤のみ）が新設された経緯がある。本サイクルではその意図を活かしてスコープを「タイル基盤のみ」に厳密に保つ。

## 実施する作業

<!-- 7.1 / 7.2 / 7.3 を各 1 サブエージェントで独立実装する。各サブタスクは「型契約・定数・レジストリ + hidden ルート」とスコープが完全に分離しており、相互依存は最小限。実装順は **T-6a（正本先行訂正）→ T-1（7.2 定数）→ T-2（7.1 型契約）→ T-3（7.3 レジストリ）→ T-4（7.3 検証ルート）→ T-5（全体検証）→ T-6b（B-365 副次的）**（運用R8、r2-IMP-3 対応で T-6a を先頭に移動）。定数は他の依存元、型契約はレジストリの依存元、レジストリ + hidden ルートは集約成果。各タスクの詳細は後続「作業計画 / 作業内容」セクション参照。 -->

- [ ] **T-1（7.2 サイズ枠定数）**: `TILE_CELL_PX = 128` / `TILE_GAP_PX = 8` と多セル対応ヘルパーを TS 定数として `src/lib/toolbox/tile-grid.ts`（**配置先確定**、CRIT-3 対応）に整備し、CSS 側へ CSS Custom Properties で 1 方向同期する仕組みを `globals.css` に追加する。単位テスト（vitest）でヘルパー出力を検証する。
- [ ] **T-2（7.1 型契約）**: 既存 `Tileable` および既存 `TileComponentProps`（`src/lib/toolbox/tile-loader.ts` で定義済 = `{ slug: string }`）を**そのまま流用**し、追加で「サイズ仕様型」と「タイルコンポーネント型エイリアス」のみを 1 ファイルに新設する（**props 型は新設しない**、CRIT-1 対応の方針A）。`ToolMeta` / `PlayContentMeta` / `GameMeta` / `QuizMeta` への必須フィールド追加は行わず、後続フェーズ（Phase 8 各サイクル）が個別タイルファイル経由でこの型を満たす構造とする。`tsc` で型レベル検証する。
- [ ] **T-3（7.3 レジストリ）**: 既存 `scripts/generate-toolbox-registry.ts` を拡張し、各コンテンツディレクトリにオプショナルな「タイル定義ファイル」が存在する場合のみ収集する形式に変更する。**タイル定義 0 件を許容し、本 Phase では件数強制サニティチェック（≥1）は導入しない**（CRIT-5 対応、Phase 8 で最初のタイル実装時に PM が ≥1 の `assertMinCount` を追加する）。`tsc` と既存テストが全通過することを保証する。
- [ ] **T-4（7.3 hidden 検証ルート）**: `src/app/(new)/internal/tiles/page.tsx`（**物理パス確定**、IMP-1 対応）に noindex なルートを新設し、T-3 のレジストリを一覧表示する最小実装を行う。`metadata.robots = { index: false, follow: false }` と、`app/robots.ts` の `disallow` を文字列 `"/api/"` から配列 `["/api/", "/internal/"]` に変更する追記で二重防御する（IMP-2 対応、`MetadataRoute.Robots` 型が string | string[] 双方を許容することを確認済）。表示するタイルが 0 件でも空状態を視認できる UI とする（本 Phase 完了時点ではレジストリは空）。
- [ ] **T-5（検証）**: `npm run lint && npm run format:check && npm run test && npm run build` を本サイクル中の各 T 完了時と最後にそれぞれ実行し、`tsc` 通過・vitest 通過・next build 通過を確認する。Playwright での視覚検証は実タイルが存在しないため本 Phase の対象外（Phase 8 各サイクルで実施）。
- [ ] **T-6（design-migration-plan.md 訂正）**: 以下の整合化訂正を実施する（CRIT-2 / CRIT-3 / r2-CRIT-2 / r2-CRIT-3 対応）。(a) **「入出力 placeholder 等」記述の全箇所訂正**（L104 + L142 の 2 箇所、`grep -n "入出力 placeholder" docs/design-migration-plan.md` で網羅的に確認済）を Phase 10.4 の責務として明示する形に揃える。(b) **L110 の配置先パス + 後半の手法記述訂正**: 例示パス `src/tools/_constants/tile-grid.ts` を本サイクル採用先 `src/lib/toolbox/tile-grid.ts` に書き換え、後半「CSS Module 側で参照する場合は `:export` または CSS 変数経由で同じ値を共有する」を「CSS Module 側で参照する場合は `globals.css` の CSS Custom Properties（`--tile-cell-px` / `--tile-gap-px`）経由で共有する（Turbopack で `:export` / `@value` は未サポートのため）」に書き換える。(c) 7.1 / 7.2 / 7.3 の作業中に発見した数値ズレ（B-365）があれば併せて訂正。これらは B-424 完了サイクル内で正本側に同期する責務として実施する。
- [ ] **サイクル終了時チェックリスト**: `npm run lint && npm run format:check && npm run test && npm run build` が全成功することを確認

### 全タスクに適用する運用ルール（cycle-193/194 から継承する制約）

cycle-194 で「Phase 7 実装サイクルでも引き続き有効」と整理された運用R1〜R7（`docs/cycles/cycle-194.md` の運用ルールセクション、L33-44）を本サイクルでも能動的に発火させる。新規 AP の追加は禁止（cycle-193.md L20「**（新規 AP 追加はしない。AP-P11 が既存）**」および L22「新規 AP 追加禁止の Owner 指示」に明記、cycle-194.md L33「新規 AP の追加は禁止（Owner 指示）」で継承確定）。

- **運用R1**: plan doc 改変履歴の確認を判断前に必ず行う（`git log -- docs/design-migration-plan.md`）
- **運用R2**: AP-P11 同型の警戒（「前サイクル PM がこう決めたから」を変更不可制約として継承しない。cycle-191 で実装された 9 コンポーネントの責務粒度は cycle-194 で再評価済み）
- **運用R3**: Owner 指摘の即時受容禁止（一次資料確認 → 対応案）
- **運用R4**: 本サイクル PM が独断で次サイクルのスコープを起票しない（B-314 や Phase 8 第 1 弾の起票は次サイクル kickoff PM の責務）
- **運用R5**: backlog.md の Notes は短く保ち、判断経緯・スコープ案・参照ドキュメントなどの詳細はサイクル md に書く
- **運用R6**: 巨大サイクル md（cycle-193 / cycle-194 等）の Read 対象を必要セクションに限定（PM コンテキスト保護）
- **運用R7**: 能動的に発火すべき既存 AP — AP-P11 / AP-P16 / AP-P17 / AP-P20（各タスク着手前に再点検）
- **運用R8（r2-IMP-3 対応、本サイクル新設）**: **T-6a（正本訂正の必須項目）を T-1 着手前に先行実施**する。理由: T-6 を最後に置くと T-1〜T-4 実装中に design-migration-plan.md L110 が旧パス例示（`src/tools/_constants/tile-grid.ts`）+ `:export` 言及のままになり、実装エージェントが正本を起点に作業を始めた場合に誤誘導される経路が残る。T-6a を先行実施することで正本と計画書の整合期間を最大化する。T-6b（B-365 副次的）は最後でよい。実装順は **T-6a → T-1 → T-2 → T-3 → T-4 → T-5 → T-6b** に更新する（旧順: T-1 → T-2 → T-3 → T-4 → T-5 → T-6）。

## 作業計画

本サイクルでは以下のように、上記サブタスク（7.1 / 7.2 / 7.3）の実施手順、サブエージェント分担、検証方法、品質保証ステップを具体化した。参照材料は design-migration-plan.md の Phase 7 セクション、cycle-194.md の T-3 / T-4 結果、cycle-191/192/193 の失敗経緯（運用R6 に従って限定 Read）。

### 目的

「Phase 7 完了 = B-314（Phase 8）が着手可能な状態」を達成する。具体的には：

- タイルメタ型の型契約が確定し、Phase 8 各サイクルで個別ツール / 遊びがタイル定義を埋められる構造になる
- サイズ枠規格（128px × 128px、8px マージン）が定数として確定し、Phase 8 で各タイル、Phase 10 でダッシュボード本体が同じ定数を参照できる
- レジストリ仕組みと hidden 検証ルートが整備され、Phase 8 各サイクルで実装したタイルが単独表示で視覚検証できる

#### 誰のためにやるのか

- **直接受益者**: 次サイクル以降の PM（サブエージェント）。本サイクルが Phase 7 を完遂することで、B-314（Phase 8 = 34 ツール + 20 遊び）の各サイクルが「型契約・サイズ定数・検証ルート」という共通基盤の上に立てる状態になる。これにより停滞している Phase 7 → Phase 8 → Phase 10 → 道具箱公開のラインが動き出す
- **本来の受益者（来訪者）**: `docs/targets/` の M1a「特定の作業に使えるツールをさっと探している人」と M1b「気に入った道具を繰り返し使っている人」。本サイクル単体では来訪者から見える変化はなく、来訪者向けの直接的価値は発生しない。本サイクルは「停滞している移行ラインを動かすための前提条件」として位置づけられる

### 完了基準（IMP-5 対応）

design-migration-plan.md L126 を引用: 「7.1〜7.3 が実装され、`tsc` と vitest テストが通る。Phase 8 で各コンテンツがこの規格に従ってタイル定義を埋められる状態。」

これに加えて、本サイクル固有の完了判定基準を以下に明示する:

1. **7.1（型契約）**: 新設した型ファイル（サイズ仕様型 + タイルコンポーネント型エイリアス）が `tsc` で型エラー 0 件で通過する。既存 `Tileable` / `toTileable()` / `TileComponentProps` への変更が無い（git diff で確認）。
2. **7.2（サイズ枠定数）**: `src/lib/toolbox/tile-grid.ts` から `TILE_CELL_PX` / `TILE_GAP_PX` / ヘルパー関数が export されている。`globals.css` に `--tile-cell-px` / `--tile-gap-px` が定義されている。ヘルパー関数の vitest 単体テストが通過する。
3. **7.3（レジストリ + 検証ルート）**: 既存 `generate-toolbox-registry.ts` の拡張により、タイル定義ファイル収集が機能する（タイル定義 0 件でも `tsc` / vitest / `next build` が通過する）。レジストリ API 経由でタイル定義一覧（空配列でよい）を取得できる。`/internal/tiles` が HTTP 200 を返し、レスポンス HTML に `<meta name="robots" content="noindex, nofollow">` が含まれる。`/robots.txt` レスポンスに `Disallow: /internal/` が含まれる。
4. **整合化（T-6 必須項目 = T-6a、r2-CRIT-2 / r2-CRIT-3 対応で範囲拡張済）**: design-migration-plan.md の以下 4 訂正がすべて反映されている。(i) L104 「入出力 placeholder 等」を Phase 10.4 注記化、(ii) **L142 「入出力 placeholder 等」も同方式で Phase 10.4 注記化**（r2-CRIT-2 で追加）、(iii) L110 前半の配置先を `src/lib/toolbox/tile-grid.ts` に書き換え、(iv) **L110 後半の `:export` / CSS 変数言及を `globals.css` の CSS Custom Properties 経由（Turbopack 制約注記つき）に書き換え**（r2-CRIT-3 で追加）。T-6 (c) B-365 副次的解消は完了基準には含めない（スキップ可）。
5. **検証コマンド**: `npm run lint && npm run format:check && npm run test && npm run build` の 4 コマンドが全成功する。

### 作業内容

本サイクルは Phase 7 の 3 サブタスク（7.1 / 7.2 / 7.3）を 5 つの作業単位（T-1〜T-5）に分解して逐次実施する。各サブエージェントへの delegation は 1 タスク = 1 サブエージェントを基本とする。

#### T-1: サイズ枠規格の定数化（design-migration-plan.md 7.2 に対応）

**アウトプット**:

- TS 定数ファイル 1 つ: `TILE_CELL_PX`（= 128）、`TILE_GAP_PX`（= 8）、および `tileSizeStyle(w, h)` 相当の多セル対応ヘルパー（実体の wide / height を返す）の 3 シンボルを export する 1 ファイル
- CSS 側からの参照経路: `globals.css` の `:root` に対応する CSS Custom Properties（`--tile-cell-px`、`--tile-gap-px`）を追記する
- 単体テスト（vitest）: ヘルパー関数 `tileSizeStyle(w, h)` が `(128n + 8(n-1)) × (128m + 8(m-1))` の式と整合することを境界含む数ケースで検証

**実装単位の判断は実装エージェントに委ねる事項**:

- ヘルパー関数の戻り値型（`React.CSSProperties` か数値オブジェクト `{ width, height }` か）。CSS Custom Property 注入と通常スタイルのどちらでも使える形が望ましいが、最終形は実装時判断

**計画段階で確定した事項（CRIT-3 対応）**: TS 定数の配置先は **`src/lib/toolbox/tile-grid.ts`** とする。理由：(1) Phase 10 でダッシュボード本体（toolbox 層）が参照する。toolbox 層が tools 層を import する方向は **既に `src/lib/toolbox/types.ts` が `@/tools/types` を import する形で発生済** のため新規依存ではないが、サイズ枠定数は「ダッシュボードレイアウト規格 = toolbox 機構固有の概念」であり tools 層配下に置く論理的根拠がない。(2) `src/lib/` 直下は範囲が広すぎる（サイズ枠は toolbox 機構専用）。(3) design-migration-plan.md L110 は「`src/tools/_constants/tile-grid.ts`（または同等の単一ファイル）」と例示しているが、**本サイクル T-6 で `src/lib/toolbox/tile-grid.ts` に書き換える**ことで正本との整合を確保する。

**やらないこと**:

- タイル本体コンポーネントへの当該定数の組み込み（Phase 8 各サイクルの責務）
- グリッドレイアウトコンポーネントの実装（Phase 10 の責務）
- 旧コード（cycle-191 の `gridSpan` 等）からの数値継承（cycle-179 確定の物理定数 128 / 8 を所与として、ゼロベースで定数化する）

**検証**: `tsc`（型）+ vitest（ヘルパー単体）+ `next build`（CSS Custom Properties の構文）。

**注意**: 調査 C 結論の通り Turbopack では CSS Module `:export` / `@value` / Sass 変数 export が未サポート。TS 定数 + CSS Custom Properties の二重管理が現実的に唯一の解。

#### T-2: タイル登録の型契約整備（7.1 に対応）

**アウトプット**（CRIT-1 対応、方針A = 既存 `TileComponentProps` をそのまま流用、props 型は本サイクルで新設しない）:

- 1 ファイルの新設で完結する。最小セットとして以下の型・型エイリアスを export する:
  - サイズ仕様型（colSpan / rowSpan 等のセル単位サイズを表すインタフェース）
  - タイルコンポーネント型エイリアス（`React.ComponentType<TileComponentProps>` 形式の型エイリアス。**既存 `TileComponentProps` を再利用**し、新規 props 型は定義しない）
- 既存 `Tileable` 型・`toTileable()` adapter・既存 `TileComponentProps`（`src/lib/toolbox/tile-loader.ts` の `{ slug: string }`）は触らない。Phase 2.2 確定済の型契約への破壊的変更を避けつつ、cycle-176/179 の「投機的基盤層」と同型の「同一責務の型が 2 つ並走」リスクを回避する。
- design-migration-plan.md L101「Tileable / **TileComponent** 等のインタフェースを整備」の **TileComponent** 部分は本サイクルの「タイルコンポーネント型エイリアス」として実体化する（既存 `TileComponentLoader` 型と意味的に重複するが、design-migration-plan.md の用語「TileComponent」を一級型エイリアスとして固定する位置づけ）。実装エージェントは既存 `TileComponentLoader` との関係（再 export か別名追加か）を判断する。

**やらないこと（cycle-191 失敗の構造的継承防止）**:

- **variantId / バリアント識別子の再導入禁止**: cycle-179 サブ判断 3-a で「variantId 系撤去」が確定済。タイル = 1 詳細ページに対し 1 軽量版（cycle-179 (b)(c) の確定）。複数バリアント体系を支える型（`TileVariant`、`isDefaultVariant` 等）は型契約に含めない
- **コンポーネント参照の型契約への埋め込み禁止**: コンポーネント参照は引き続き `tile-loader.ts` の slug ベース lazy loader 経由（既存パターンを温存）。型契約にコンポーネント参照フィールドを持たせると bundle 肥大化や static analysis 不整合の懸念があり、調査 B にある cycle-191 D-1 / D-2 案と同型の失敗を招く
- **`ToolMeta` / `PlayContentMeta` / `GameMeta` / `QuizMeta` への必須フィールド追加禁止**: これらメタ型を全件改修すると Phase 8 各サイクルが本サイクル成果の上に乗る前にコンテンツ側の影響範囲が拡大する。タイル定義は「コンテンツ側の別ファイル（オプショナル）」として導入し、メタ型本体は触らない
- 入出力 placeholder（タイル間連携用フィールド）の先行定義禁止: Phase 10.4（タイル間入出力連携）の責務であり、現時点での需要は不明確。先行定義は調査 C の指摘どおりオーバーエンジニアリング。**CRIT-2 対応**: design-migration-plan.md L104 が現状「入出力 placeholder 等」を Phase 7.1 のフィールド要件に含めているため、本サイクル T-6 で「入出力 placeholder は Phase 10.4 で追加」と注記する訂正を行い、正本同士の整合を本サイクル内で完結させる（後続 PM が L104 を読んで「placeholder が無い」状態に手戻りする経路を塞ぐ）。

**実装単位の判断は実装エージェントに委ねる事項**:

- 型の配置先（`src/lib/toolbox/types.ts` への追記か、`src/lib/toolbox/tile-types.ts` 等の別ファイルか）
- サイズ仕様型の名称（`TileSize` / `TileGridSpan` / `TileFootprint` 等。cycle-191 の `TileGridSpan` 命名は継承しなくてよい）

**検証**: `tsc` のみ（実体のないインタフェース定義のため）。

#### T-3: レジストリの仕組み（7.3 のレジストリ部分）

**アウトプット**:

- 既存 `scripts/generate-toolbox-registry.ts` を拡張し、各コンテンツディレクトリにオプショナルな「タイル定義ファイル」が存在する場合のみそれを収集する仕組みに変更する
- 生成物の出力ファイル（`src/lib/toolbox/generated/` 配下が候補）には、現状タイル定義 0 件を反映した空のエントリ配列を含める。**本 Phase では件数強制サニティチェック（既存 `assertMinCount(_, 1)` 同型のチェック）を導入しない**（CRIT-5 対応）。タイル定義 0 件で `tsc` / vitest / `next build` が通過する設計を確保する。
- レジストリ公開 API（`src/lib/toolbox/registry.ts` 経由）への新規 export を追加して、hidden 検証ルートが「登録されたタイル定義一覧」を取得できる状態にする

**実装単位の判断は実装エージェントに委ねる事項**:

- 「タイル定義ファイル」の規約（ファイル名 `tile.ts` か別名か、tools / play / cheatsheets / dictionary のどのスコープに置けるか）
  - 第一候補は `src/tools/{slug}/` と `src/play/{games|quiz|fortune}/{slug}/` 配下の `tile.ts` だが、play は per-slug ディレクトリのないコンテンツがあり（games / quiz は registry に集約、daily は registry 直書き）、その扱いは実装時判断
- 既存 codegen への統合方式（同一スクリプト内で完結させるか、新規スクリプトに分離するか — 判断理由は「検討した他の選択肢」参照）

**やらないこと**:

- 個別タイルの実装（Phase 8 各サイクルの責務）
- 個別コンテンツメタ型 / レジストリの破壊的変更（既存 `toolsBySlug` / `allToolMetas` / `getAllToolSlugs` 等の API は維持）
- cheatsheets / dictionary のタイル定義（Phase 9.2 / 9.3 のスコープ。本 Phase の Tileable 集計には cheatsheets / dictionary は含めない）
- レジストリへ「N 件（N≥1）以上ある」サニティチェックの本 Phase 内追加: タイル定義 0 件で `npm run build` を通すため、本 Phase では 1 件以上を強制するチェックは書かない（CRIT-5 対応、上記アウトプットと一致）。Phase 8 で最初のタイル実装サイクルの PM が、その時点の件数に応じて `assertMinCount(tileEntries, 1)` 同型のチェックを追加する（B-314 着手 PM の責務）

**検証**: `tsc` + 既存 vitest 通過 + `next build` 通過。

#### T-4: hidden 検証ルートの整備（7.3 の検証ルート部分）

**アウトプット**:

- `/internal/tiles` URL に対応するページを **`src/app/(new)/internal/tiles/page.tsx`** に新設する（IMP-1 対応で物理パスを計画段階で確定。理由: 既存 `(new)/storybook` の robots:noindex 適用パターンと完全整合し、Phase 11.2 の `(legacy)` 撤去フローと干渉しない。`(new)` Route Group は「新デザイン」を表すが、hidden 検証ルートも本サイト全体の新ルーティング体系に含まれる扱いとする = 既存 storybook と同型）
- ページ自体は server component を保ち、`metadata.robots = { index: false, follow: false }` を export する（既存 `(new)/storybook` パターンと整合）
- インタラクティブ部分が必要な場合は子 client component に分離（既存 storybook + StorybookContent 構成と整合）
- T-3 で公開されるレジストリ API から「登録されたタイル定義一覧」を取得し、各エントリを最小情報（slug / 表示名 / サイズ仕様）で 1 行ずつ表示する。タイル本体のレンダリングはコンポーネント実体がないため行わない（本 Phase 完了時点ではレジストリは空であり「タイルはまだ 0 件です」相当の空状態のみが表示される）
- `app/robots.ts` の `disallow` を現状の文字列 `"/api/"` から配列 `["/api/", "/internal/"]` に**配列化して追記**する（IMP-2 対応。現状 `src/app/robots.ts` L10 が `disallow: "/api/"` の文字列であることを実体確認済。`MetadataRoute.Robots` 型は `string | string[]` 双方を許容する）。これにより meta + robots.txt の二重防御を成立させる

**実装単位の判断は実装エージェントに委ねる事項**:

- 空状態時の表示文言（最小限の見出し + 「タイル未登録」相当のメッセージで十分。Phase 8 着手時に PM が明示的に拡張する余地を残す）
- 一覧の表示形式（テーブル / リスト等。本 Phase は機能性のみ要求）

ルート配置の物理パス（`src/app/(new)/internal/tiles/page.tsx`）と URL（`/internal/tiles`）は計画段階で確定済（上記アウトプット参照、IMP-1 対応）。

**やらないこと**:

- 個別タイルのレンダリング検証（タイル本体がないため）
- グリッドレイアウト・DnD・編集モード・モーダル（Phase 10）
- 検証ルートの本番公開（robots.txt と metadata.robots の二重防御で実質非公開を維持する。本番デプロイ自体は通常通り含めて構わない — noindex なルートが本番に存在することは storybook と同型のため許容済み）

**検証**: `npm run build` + Playwright（任意）で `/internal/tiles` が 200 を返し、レスポンス HTML に `<meta name="robots" content="noindex, nofollow">` が含まれることを確認。Playwright の視覚検証は本 Phase 必須項目とせず（タイル本体が 0 件のため）、Phase 8 第 1 弾サイクルでタイルが実装された時点で初回検証する。

#### T-5: 全体検証 + サイクル終了時チェック

T-1〜T-4 完了後、`npm run lint && npm run format:check && npm run test && npm run build` の 4 コマンドを通過させる。`generate-toolbox-registry.ts` は `prebuild` / `predev` / `pretest` の各フックで実行されるため、生成物の git 上の状態と生成スクリプトの実行結果が一致することも確認する（既存と同方針）。

#### T-6: design-migration-plan.md の整合化訂正（CRIT-2 / CRIT-3 / r2-CRIT-2 / r2-CRIT-3 対応 + B-365 副次的解消）

**スコープ整理（r2-IMP-2 対応）**: 本 T-6 は (a)(b) を **本サイクル Done の必須条件** とし、(c) は **副次的でスキップ可** の構造を持つ。完了基準（L60-69 の項目 4）は (a)(b) のみを参照する。

**必須実施項目（T-6a: CRIT-2 / CRIT-3 / r2-CRIT-2 / r2-CRIT-3 由来、本サイクル Done 必須）**:

- (a) **「入出力 placeholder 等」記述の全箇所訂正（CRIT-2 + r2-CRIT-2）**: `grep -n "入出力 placeholder" docs/design-migration-plan.md` で網羅的に確認した結果、当該表現は **L104（Phase 7.1 のフィールド要件）** と **L142（Phase 8.1 各サイクルで実施する内容 #4）** の 2 箇所に存在する。本サイクル T-2 で「入出力 placeholder は Phase 10.4 責務」と確定したため、両箇所とも Phase 10.4 へのポインタを含む形に書き換える（例: 「（タイル用コンポーネント参照、推奨サイズ ※ 入出力 placeholder は Phase 10.4 で追加）」）。L104 のみ訂正して L142 を残すと、後続 Phase 8 PM が L142 を起点に作業を始めた場合「タイル定義に入出力 placeholder を埋めなければ」と解釈する経路が残るため、両箇所一括訂正が必須。
- (b) **L110 配置先パス + 後半手法記述の同時訂正（CRIT-3 + r2-CRIT-3）**:
  - L110 前半「`src/tools/_constants/tile-grid.ts`（または同等の単一ファイル）」を本サイクル T-1 採用先 `src/lib/toolbox/tile-grid.ts` に書き換える。
  - L110 後半「CSS Module 側で参照する場合は `:export` または CSS 変数経由で同じ値を共有する」を「CSS Module 側で参照する場合は `globals.css` の CSS Custom Properties（`--tile-cell-px` / `--tile-gap-px`）経由で共有する（Turbopack で `:export` / `@value` は未サポートのため）」に書き換える。本サイクル計画書 L97 / T-1 値共有方式 3 案比較で確定済の Turbopack 制約に整合させ、後続 Phase 8 で個別タイル CSS Module から `:export` を試行する経路を塞ぐ。

**副次的実施項目（T-6b: 訂正対象がなければスキップ可）**:

- (c) **数値ズレ訂正（B-365 副次的解消）**: 7.1 / 7.2 / 7.3 の作業中に数値ズレが見つかった場合のみ訂正。「34 ツール・20 遊び」は調査 A で plan doc と一致確認済。訂正対象がなければスキップ可。

B-365 は backlog 上は独立タスクとして残してよい（本サイクルの主目的ではないため副次的解消の位置づけ）。

### 検討した他の選択肢と判断理由

cycle-kickoff で Owner と相談した結果、以下の候補から **Phase 7（タイル基盤実装）を新規起票して着手** を選択した。

| 候補                                                          | 判断         | 理由                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Phase 7（タイル基盤実装）を新規起票して着手**            | **採用**     | B-314（Phase 8）の着手条件「Phase 7 完了」を解消する前提条件。cycle-191/192/193 で 3 連続失敗した「タイル基盤 + 詳細移行の同時実施」を cycle-194 で分解した結果として新 Phase 7 が新設された。本 Phase は「タイル基盤のみ」に明確にスコープを絞っており、来訪者から見える変化なし。 |
| B. B-425（about/privacy max-width 既存破綻修正）              | 不採用       | P2、GA4 で about/privacy の PV 比率を確認してから優先度を再評価する余地あり。Phase 7 完了の方が「停滞している移行ライン全体を動かす」という来訪者価値への波及効果が大きい。                                                                                                         |
| C. B-355（実績システムの存続検討）                            | 不採用       | P2、独立タスク。Phase 9.1 のスコープ決定に必要だが、Phase 7 → Phase 8 の停滞が解消されるまで Phase 9 着手は遠い。優先度は Phase 7 より低い。                                                                                                                                        |
| D. B-365（design-migration-plan.md Phase 7.1/7.2 の数値訂正） | 部分的に併用 | P3。Phase 7 着手時にまとめて訂正してよい性質。本サイクル内で 7.1 / 7.2 / 7.3 の作業中に該当箇所を見つけたら同時訂正する（独立 backlog としては残しつつ、副次的に解消する可能性）。                                                                                                  |

#### T-2（7.1 型契約）の設計判断: タイル定義追加方式 4 案比較（IMP-3 対応）

Phase 2.1 で確定済の「(b) 1 対多採用 / (c) 複数バリエーション不採用 / variantId 系撤去（cycle-179 サブ判断 3-a）」を所与とし、メタ型へのタイル定義追加方式を 4 案で比較する（IMP-3 指摘により optional 統合案 A' を独立軸として明示）。

| 案                                                                                                    | 概要                                                                                                                          | 採否     | 理由                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 A: メタ型統合（**必須**）（ToolMeta / PlayContentMeta / GameMeta / QuizMeta に必須フィールド追加） | サイズ仕様・コンポーネント参照・タイル説明をメタ型本体に必須フィールドとして追加                                              | 不採用   | (1) メタ型 4 種を全件改修する必要があり、本サイクル単体の影響範囲が拡大。(2) 「タイル化に馴染まないコンテンツ」（Phase 8.2 で明記された遊びの一部）の存在で必須化が成立しない。(3) cycle-191 D-1 案と同型のコンポーネント参照組込みは bundle 肥大化リスクあり                                                                                                                                 |
| 案 A': メタ型統合（**optional**）                                                                     | サイズ仕様・コンポーネント参照を **optional フィールド**としてメタ型本体に追加                                                | 不採用   | (1) 必須化による型エラー連鎖は回避できるが、メタ型 4 種に共通フィールドを追加する方法論的負担は残る。(2) optional フィールドは未指定可能なので「タイル化したコンテンツ / していないコンテンツ」の判定が「フィールドが埋まっているか否か」になり、レジストリ集約時の判定ロジックが分散する。(3) 案 B（別ファイル新設）の方が「存在する = タイル化済」という存在判定が単純で codegen 集約に向く |
| 案 B: タイル定義を別ファイル新設（採用）                                                              | 各コンテンツディレクトリにオプショナルな `tile.ts`（暫定名、実装時確定）を置く。メタ型本体は触らない。型契約 1 ファイルで完結 | **採用** | (1) 既存メタ型と registry API を温存できる。(2) タイル化対象のコンテンツのみ `tile.ts` を持てばよく、未対応は素通し。(3) cycle-191 失敗の構造的原因「メタ型本体への variantId 等の侵食」を防げる。(4) 「存在する = タイル化済」の単純判定で codegen フィルタリングが容易。(5) 調査 C 推奨方針と整合                                                                                           |
| 案 C: Tileable 型の拡張（既存 Tileable に必須 size を追加）                                           | 既存 `Tileable` interface にサイズ / コンポーネント参照フィールドを必須追加                                                   | 不採用   | (1) `Tileable` は Phase 2.2 で「Phase 9 / 10 のダッシュボード全タイル列挙に使う共通基底型」として確定済（toTileable() adapter 経由で 54 件の Tileable を構築している）。サイズ必須化すると 54 件全てがサイズ未指定で型エラーになる。(2) Tileable のメタ列挙責務とタイル表示仕様責務を分離する Phase 2.2 設計と矛盾                                                                            |

→ **採用: 案 B**。

#### T-2 補助判断: 「タイルコンポーネント props 型」の扱い（CRIT-1 対応 3 案比較）

既存 `src/lib/toolbox/tile-loader.ts` に `TileComponentProps { slug: string }` が定義済である事実を踏まえ、T-2 における「props 型」の扱いを 3 案で比較する。

| 案                                                              | 概要                                                                                                                                                                                            | 採否     | 理由                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 方針A: 既存 `TileComponentProps` をそのまま流用（採用）         | 本サイクルでは props 型を新設せず、既存 `{ slug: string }` を継続利用。新設するのは「サイズ仕様型」と「タイルコンポーネント型エイリアス」（`React.ComponentType<TileComponentProps>` 形式）のみ | **採用** | (1) 同一責務の型が並走するリスクを構造的に排除（cycle-176/179 が排除した「投機的基盤層」と同型のリスク回避）。(2) Phase 2.1 で B-2 として整備済のコンポーネント参照経路（slug ベース lazy loader）と完全整合。(3) Phase 8 で実 props 追加需要が出た時点で既存型を拡張すればよく、現時点では `{ slug: string }` で十分。(4) 計画書 L98「既存 `TileComponentProps` は触らない」原則と論理的に一貫 |
| 方針B: 既存 `TileComponentProps` を拡張（推奨フィールド追加）   | 既存型に `size` / `tileable` 等のフィールドを追加し、新規型は作らない                                                                                                                           | 不採用   | (1) Phase 7 の段階で「props にどんなフィールドが必要か」が未確定。Phase 8 / 9 / 10 で具体的な需要が出てから拡張する方が妥当。(2) 先行追加は AP-P20（過度に具体的な計画）に該当                                                                                                                                                                                                                  |
| 方針C: 既存 `TileComponentProps` を deprecated 化し新規型に置換 | 新規 `TileProps` を新設し、既存型に `@deprecated` JSDoc を付与                                                                                                                                  | 不採用   | (1) `TileComponentProps` は Phase 2.1 で確定済（cycle-179）。代替手段が成立する前から deprecated 化するのは AP-P11 警戒対象（前サイクルの確定を独断で塗り替える）。(2) 並行期間中の二重定義リスクが顕在化する                                                                                                                                                                                   |

→ **採用: 方針A**。design-migration-plan.md L101「Tileable / **TileComponent** 等のインタフェースを整備」の **TileComponent** 部分は「コンポーネント型エイリアス（`React.ComponentType<TileComponentProps>` の型エイリアス）」として実体化する。

#### T-1（7.2 サイズ枠定数化）の値共有方式: 3 案比較

| 案                                                                   | 概要                                                                                                   | 採否     | 理由                                                                                                                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 X: CSS Module `:export` / `@value` 構文で JS から import          | CSS Module 側で値を定義、JS から `import styles from '...'` 経由で参照                                 | 不採用   | 調査 C 確認のとおり Turbopack で `:export` の動作保証がなく `@value` は未サポート（Next.js Issue #85173）。本プロジェクトは Turbopack 移行済のため将来リスクあり                                               |
| 案 Y: TS 定数 + CSS Custom Properties 二重管理（採用）               | TS 側に `TILE_CELL_PX` / `TILE_GAP_PX` / ヘルパー、CSS 側に `--tile-cell-px` 等を `globals.css` で定義 | **採用** | (1) Turbopack 完全対応。(2) 既存 `globals.css` への追記のみで CSS 側参照が完結。(3) 値変更は 128 / 8 という根幹仕様で滅多に起きない。(4) コメントで両箇所をリンクすれば二重管理コストは軽微。調査 C の推奨方針 |
| 案 Z: TS 定数からインライン `style={{ '--tile-cell-px': ... }}` 注入 | TS 1 ヶ所に集約し、ルート要素で CSS variable を注入                                                    | 不採用   | (1) CSS variable の到達範囲がインライン注入箇所のサブツリーに限定され、グローバル参照には不向き。(2) 検証ルート以外でも参照されるためグローバル定義（案 Y）の方がシンプル。(3) 案 Y との差分は将来でも転換可能 |

→ **採用: 案 Y**。

#### T-3（7.3 レジストリ）の実装方式: 3 案比較

| 案                                                       | 概要                                                                                                              | 採否     | 理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 P: 既存 `generate-toolbox-registry.ts` を拡張（採用） | 既存スクリプトで fast-glob による探索対象に `tile.ts`（仮名）を追加し、同一出力ディレクトリに別ファイルとして集約 | **採用** | (1) 既存パターン踏襲（fast-glob + 既存件数サニティ（tools / cheatsheets 用 `assertMinCount` は維持、**本 Phase で導入する tile 用配列には適用しない** = CRIT-5 / r2-IMP-1 対応）+ prebuild/predev/pretest フック）。(2) caller compatibility 設計（tools-registry.ts の re-export）を継承できる。(3) スクリプト 1 本に集約することで「タイル登録忘れ」のクラス・オブ・バグを既存と同様に排除。(4) 調査 C 推奨方針。なお tile 用配列の件数サニティは Phase 8 第 1 弾サイクル PM が時点件数に応じて `assertMinCount(tileEntries, 1)` 同型を追加する責務（CRIT-5 対応と一貫）。 |
| 案 Q: 新規 codegen スクリプトを別ファイルに新設          | `scripts/generate-tile-registry.ts` 等を新設し、既存と分離                                                        | 不採用   | (1) 既存スクリプトと走るタイミング・依存解決が同じなのに分離する利益が乏しい。(2) `prebuild` / `predev` / `pretest` の package.json フック追加が必要で、漏れた場合に「タイル定義を追加したのに反映されない」事故が起きやすい。(3) コード分散のデメリットが上回る                                                                                                                                                                                                                                                                                                             |
| 案 R: 手書き中央レジストリ（codegen を使わない）         | `src/lib/toolbox/tile-entries.ts` 等に開発者が手書きで配列を追加                                                  | 不採用   | (1) Phase 8 で 54 件（34 tools + 20 play）の追加が想定され、手書きは追加忘れのクラス・オブ・バグが必発。(2) 既存 codegen が排除した失敗パターンに自ら戻ることになる                                                                                                                                                                                                                                                                                                                                                                                                          |

→ **採用: 案 P**。

#### T-4（7.3 hidden 検証ルート）の設計判断: 3 案比較

| 案                                                                                                  | 概要                                                                                               | 採否     | 理由                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 案 K: `/internal/tiles`（URL に internal を含む）+ robots.txt の `/internal/` disallow 追加（採用） | URL を `/internal/tiles` とし、`metadata.robots` で noindex + `robots.ts` でクローラ拒否を二重防御 | **採用** | (1) URL と robots.txt の disallow パターンが文字列一致し、運用上の認知整合が高い。(2) 将来 `/internal/` 配下に検証ルートを追加した場合も同一の disallow ルールでカバーできる。(3) 調査 C の Next.js 公式パターンと整合。(4) 既存 `/storybook` は noindex のみだが「将来公開する可能性」がある点で性質が異なる |
| 案 L: `/storybook` 配下に追加（`/storybook/tiles`）                                                 | 既存 storybook ルートのサブ階層に統合                                                              | 不採用   | (1) `/storybook` は共通コンポーネント専用（design-migration-plan.md の規定）。タイルはコンテンツ固有のため責務が異なる。(2) storybook 側のナビゲーション設計が変わる影響範囲が大きい                                                                                                                          |
| 案 M: `(internal)/tiles` Route Group（URL は `/tiles`）+ metadata.robots のみ                       | URL は `/tiles` となり、本番デプロイから除外せず noindex のみで運用                                | 不採用   | (1) `/tiles` という URL は Phase 10 の本公開時に道具箱ページの URL 候補と衝突する可能性がある（Phase 2.1 の URL 構成判断と非整合）。(2) robots.txt との文字列一致が取れないため二重防御が弱い。(3) URL からの「内部用途」可読性が低い                                                                         |

→ **採用: 案 K**。本番デプロイ自体は含めるが、metadata.robots + robots.ts disallow の二重防御で実質非公開状態を維持する（既存 storybook と同型の運用）。

### 計画にあたって参考にした情報

- `docs/design-migration-plan.md` Phase 7 セクション（L95-126）: 新 Phase 7 の正本定義
- `docs/design-migration-plan.md` Phase 2 セクション（L40-55）: Phase 2.2 でタイル概念定義 + 型契約（`Tileable` / `toTileable()` adapter）整備完了済みの事実確認
- `docs/design-migration-plan.md` Phase 8 セクション（L128-156）: 後続フェーズが本 Phase に何を期待しているかの確認（型契約・サイズ定数・hidden 検証ルートを各タイルが利用する）
- `docs/design-migration-plan.md` Phase 10 セクション（L190-229）: サイズ枠規格 / 型契約が Phase 10 ダッシュボード本体でどう使われるか
- `docs/cycles/cycle-194.md`: 新 Phase 7 新設の経緯、T-3 / T-4 結果、運用R1〜R7 の整理（L33-44）。次サイクル PM 向け誘導とチェックリストも cycle-194.md 本体に記載済
- `docs/cycles/cycle-193.md` 冒頭の失敗の核心 (a)〜(d)、事故報告 1〜5、屋台骨セクション（L266-282）: cycle-191/192/193 連続失敗の構造的原因（運用R6 に従って限定 Read）
- **調査 A（メタ型構造）**: `docs/research/2026-05-19-cycle-195-phase7-meta-types-survey.md` — 既存メタ型構造、Phase 2.2 で実装済の Tileable 型と toTileable() adapter、scripts/generate-toolbox-registry.ts の codegen 仕組み、ツール 34 件 / 遊び 20 件の実体一致確認（r2-CRIT-1 対応で `tmp/research/` から `docs/research/` に昇格）
- **調査 B（cycle-191 タイル基盤コード復元）**: `docs/research/2026-05-19-cycle-191-tile-foundation-analysis.md` — cycle-191 の TileVariant 型 / `/internal/tiles` / 9 コンポーネント実装の構造と失敗の構造的原因（AP-P11 違反 = cycle-179 確定の「variantId 撤去 / タイル 1 軽量版」を未参照）（r2-CRIT-1 対応で `tmp/research/` から `docs/research/` に昇格）
- **調査 C（Next.js ベストプラクティス）**: `docs/research/2026-05-19-phase7-tile-foundation-best-practices.md` — hidden 検証ルートの metadata.robots + robots.ts disallow 二重防御 / Turbopack 制約下の CSS 定数共有 / 既存 codegen 拡張方針 / 型契約最小化
- `docs/backlog.md` B-314 / B-365 / B-425 Notes: Phase 8 着手条件と関連 backlog
- `docs/constitution.md`、`CLAUDE.md`: プロジェクト基本ルール
- `docs/anti-patterns/`: 能動的に発火させる AP-P11 / AP-P16 / AP-P17 / AP-P20

## レビュー結果

### レビュー r1 (2026-05-19)

レビュー対象: `## 実施する作業` / `## 作業計画` セクション全体。
レビュアは以下を実体確認した上で所見を出した:

- 既存ソース（`src/lib/toolbox/types.ts` / `tile-loader.ts` / `registry.ts` / `generated/toolbox-registry.ts`、`scripts/generate-toolbox-registry.ts`、`src/app/robots.ts`、`src/app/(new)/storybook/page.tsx`）の現状を Read で確認
- `docs/design-migration-plan.md` 全文（特に Phase 2 / Phase 7 / Phase 8 / Phase 10）を Read
- `docs/cycles/cycle-179.md` のサブ判断 3-a（variantId 系撤去）の一次資料を Read
- `docs/anti-patterns/planning.md` の AP-P11 / AP-P16 / AP-P17 / AP-P20 を Read
- `src/tools/*/` の ls により 34 ツール、`src/play/{games,quiz}/registry.ts` + `src/play/fortune/` により 20 遊びを実体確認
- 計画書冒頭の commit 履歴（`d8850cf9` cycle-194 訂正 + 再完了）で Phase 2.3 が削除済であることを確認

#### Critical（必ず対応）

- **CRIT-1: T-2 の「やること」と「やらないこと」の論理矛盾**
  - L94 で T-2 のアウトプットとして「タイルコンポーネントが受け取る props 型（タイルのサイズと Tileable メタを受け取るための共通 props）」を新設すると書いている。
  - 一方 L96 で「既存 `TileComponentProps` は触らない」と明示している。
  - しかし既存 `src/lib/toolbox/tile-loader.ts:37-40` には `TileComponentProps { slug: string }` が既に定義済み。新規に「タイルコンポーネントが受け取る共通 props 型」を別名で増設すると、**同じ責務の型が 2 つ並走する状態**を Phase 7 が起点で生む。これは cycle-176 / 179 が排除した「投機的基盤層」と同型のリスク。
  - 一方で「既存 `TileComponentProps` を拡張する」のなら L96 の「触らない」と矛盾する。
  - 指示: 「新 props 型を作る／既存 `TileComponentProps` を拡張する／props 型は本サイクルで定義しない」のいずれかを明示的に選び、その判断根拠を 3 案比較に組み込むこと。design-migration-plan.md L101 「Tileable / **TileComponent** 等のインタフェースを整備」との対応関係も併記すること。

- **CRIT-2: design-migration-plan.md L104「入出力 placeholder 等」との不整合を計画書で吸収していない**
  - design-migration-plan.md L104（Phase 7.1 の正本定義）は「必要なフィールド（タイル用コンポーネント参照、推奨サイズ、**入出力 placeholder 等**）を定義」と書いている。
  - cycle-195 計画 L103 は「入出力 placeholder（タイル間連携用フィールド）の先行定義禁止: Phase 10.4 の責務」と書いており、**正本である design-migration-plan.md と直接衝突**している。
  - この衝突は「計画書側を sub-judgement で上書きする」運用になっており、AP-P11 警戒対象（前サイクル PM の判断を無批判継承しないが、その逆として **正本 plan doc を本サイクル PM が独断で塗り替える**ことも同型リスク）。
  - 指示: いずれかを選ぶこと:
    1. design-migration-plan.md L104 を本サイクル内で訂正（「入出力 placeholder 等」を削除 or 「Phase 10.4 で追加」と明示）し、その訂正を T-6 のスコープに含めて Done 条件化する
    2. 「入出力 placeholder 用フィールド枠だけ先取りで定義する（実態は空でよい）」案を 3 案比較で評価して採用 / 不採用を明示する
  - 「Phase 10.4 責務だから本サイクル対象外」だけで処理すると、後続サイクル PM が L104 を読んで本サイクル PM の判断を知らないまま Phase 8 で「placeholder が無い」状態に気付き手戻りする経路ができる。

- **CRIT-3: T-1 の配置先案 (`src/tools/_constants/` / `src/lib/toolbox/` / `src/lib/`) が design-migration-plan.md L110 の指定と整合せず、整合化判断が無い**
  - design-migration-plan.md L110 は「上記値を `src/tools/_constants/tile-grid.ts`（または同等の単一ファイル）に定数として定義」と **既に配置先を例示**している。
  - cycle-195 計画 L75 は「`src/tools/_constants/` 配下か `src/lib/toolbox/` 配下か `src/lib/` 直下か」と 3 候補を列挙し、「実装エージェントに委ねる」としている。
  - だが「Phase 10 でダッシュボード本体も参照」する設計を考えると `src/tools/_constants/` 配下に置くと「ダッシュボード本体（toolbox 層）が tools 層に物理依存する」逆方向依存が発生する。これは設計判断であり、実装エージェント任せにすると後で `git mv` が必要になる。
  - 指示: 配置先を計画書側で確定する（理由は「toolbox 層 / tools 層のどちらにも属さない中立な場所 = `src/lib/` 直下、または toolbox 層が tools 層を import しないために `src/lib/toolbox/` 配下が妥当」等の論理を明示）。または design-migration-plan.md L110 の例示 `src/tools/_constants/` を採用するなら、その理由（「Phase 10 で toolbox 層が tools 層を import するのは ToolMeta 経由で既に発生済 = 新規依存ではない」等）を明示する。

- **CRIT-4: ルール違反 — `tmp-directory` rule に反して `./tmp/cycle-194-hand-off.md` を計画書本文から参照している**
  - `.claude/rules/tmp-directory.md`「Don't: 他のディレクトリにあるファイルから `./tmp/` に保存したファイルについて言及またはリンクする」に反する。
  - 該当箇所: L32（「`./tmp/cycle-194-hand-off.md` §1」）, L46（参照材料リスト）, L226（参考にした情報リスト）。
  - `./tmp/` は本サイクルでだけ利用する一時保存。cycle-195 計画書本文（コミット対象 = `docs/cycles/cycle-195.md`）から参照すると、`./tmp/` が削除された時点で計画書のリンクが壊れる。
  - 指示: 計画書から `./tmp/cycle-194-hand-off.md` への直接参照を全て削除し、必要な情報（運用R1〜R7）は cycle-195 計画書本文内に転記するか、cycle-194.md 本体（コミット済）を参照するように書き換えること。

- **CRIT-5: T-3 の生成物 0 件運用と「件数サニティチェック」の関係に整合性破綻がある**
  - L117「生成物の出力ファイル（...）には、現状タイル定義 0 件を反映した空のエントリ配列 + 件数サニティチェック（最低 0 件可）を含める」と L131「**レジストリへ「N 件以上ある」サニティチェックの追加（タイル定義が 0 件の状態で `npm run build` を通すため、最低 0 件を許容する。Phase 8 進行に応じてエージェントが本数値を引き上げる）**」が両立している。
  - 「サニティチェックを含める（L117）」 vs 「サニティチェックを追加しない（L131）」の意味的衝突。読み手は「最低 0 件のサニティチェックを書く（実質意味なし）」と「サニティチェック自体を Phase 8 まで導入しない」のどちらか判断できない。
  - 既存 `generate-toolbox-registry.ts:66-72` の `assertMinCount` は ≥ 1 を強制している。仕様上 0 件を許容するなら既存パターンの破壊変更になる。
  - 指示: 「サニティチェックの取り扱い」を 1 文に統一する。具体例:「タイル定義は 0 件を許容する（既存 `assertMinCount` とは別系統のチェック対象として扱い、本 Phase では 1 件以上の強制サニティチェックを書かない）」など、L117 と L131 が同じ事実を述べるよう統一すること。

#### Important（強く推奨）

- **IMP-1: T-4 の検証ルート Route Group 選択が「実装エージェント判断」になっており、調査 C の推奨と矛盾している**
  - L147「ルート配置の Route Group 選択（`(new)/internal/tiles/` か `(internal)/tiles/` か）」が実装エージェント判断とされている。
  - 一方、L213 の 3 案比較表で **案 K「`/internal/tiles`（URL に internal を含む）」が採用** と明記されている。
  - 採用済の案 K であれば、URL は `/internal/tiles` であり、Route Group `(new)` 配下に置くか・置かないかが残された変数。これを「実装エージェント判断」に流すと、URL レベルでは確定済なのに物理パスは未確定という状態になる。
  - 既存パターンを踏襲するなら `(new)/internal/tiles/` だが、これは「Route Group 名 `(new)` は『新デザイン』を表す（CLAUDE.md Notes）」「新デザイン未適用の hidden 検証用は `(new)` に含めるべきか不明」という別軸の判断を生む。
  - 指示: 物理パスも計画書側で 1 案に確定する（推奨: 既存 storybook と同じ `src/app/(new)/internal/tiles/page.tsx`、理由は「既存 robots:noindex 適用パターンと完全整合 + Phase 11 撤去時の Route Group 解除フローに乗る」）。

- **IMP-2: 「`app/robots.ts` の disallow 配列に `/internal/` を追記」記述が現状の robots.ts 実体と齟齬**
  - L143「`app/robots.ts` の `disallow` 配列に `/internal/` を追記」とあるが、現状 `src/app/robots.ts` の `disallow` は **配列ではなく文字列** `disallow: "/api/"`。
  - 配列化を含めて追記するのか、文字列のままにするのかが不明。Next.js `MetadataRoute.Robots` 型は string | string[] を許容するので両方可能だが、計画書側で前提を明示しないと実装エージェントが選択肢を持ってしまう。
  - 指示: 「`disallow` を `["/api/", "/internal/"]` に配列化して追記」など、現状の型構造を踏まえた書き方に修正する。AP-P16（一次情報確認）の発火対象。

- **IMP-3: T-2 の 3 案比較表で「案 A vs 案 B」「案 B vs 案 C」が独立しすぎており、現実的に最有力な「メタ型に optional フィールドを追加する」中間案が無い**
  - 案 A（メタ型に **必須** フィールド追加）、案 B（別ファイル `tile.ts` 新設）、案 C（Tileable 型に **必須 size** 追加）の 3 案が並ぶ。
  - 「メタ型に **optional** な tile フィールドを追加する（タイル化対象のみ埋める）」案が抜けている。これは案 A の派生だが「必須化による型エラー連鎖」を回避できる現実的な選択肢。
  - 案 A 不採用理由「(1) メタ型 4 種を全件改修」「(2) 必須化が成立しない」は **必須化** だから成立する不採用理由であり、optional 化案には当てはまらない。
  - 指示: 3 案を「必須統合 / 別ファイル / optional 統合」または同等の独立軸で再構成し、AP-P17（実質的な 3 案比較）を満たすこと。または「optional 案を案 A に含めて検討した上で不採用とした」根拠を 1〜2 文で追記。

- **IMP-4: 「実施する作業」リストと「作業計画」セクション見出しのスコープが微妙にズレている**
  - 「実施する作業」T-1 の説明（L22）は「`TILE_CELL_PX = 128` / `TILE_GAP_PX = 8` と多セル対応ヘルパーを TS 定数として整備し、CSS 側へ CSS Custom Properties で 1 方向同期する仕組みを `globals.css` に追加する」と「CSS Custom Properties は globals.css に追加する」を含む。
  - 一方「作業計画」T-1 アウトプット（L70）は「`globals.css` の `:root` に対応する CSS Custom Properties...を追記する」と同等。整合は取れている。
  - ただし「実施する作業」T-2 の説明（L23）に「タイルコンポーネント型エイリアス」が含まれていないのに、「作業計画」T-2 アウトプット（L94）には「タイルコンポーネント型エイリアス（`React.ComponentType<...>` の型エイリアス）」が含まれる。実施する作業セクションを後で確認する PM が見落とすリスクあり。
  - 指示: 「実施する作業」T-2 の 1 行説明にコンポーネント型エイリアスも追記し、両セクションのスコープを完全に一致させる。

- **IMP-5: 完了基準が design-migration-plan.md L126 と整合確認できる形で明記されていない**
  - 計画書 L50-54「目的」は適切だが、「完了基準」がそのまま明記されていない。
  - design-migration-plan.md L126 は「7.1〜7.3 が実装され、`tsc` と vitest テストが通る。Phase 8 で各コンテンツがこの規格に従ってタイル定義を埋められる状態。」と完了基準を明示。
  - 「実施する作業」のチェックリスト完了 = 完了基準達成、と暗黙的に運用する設計だが、レビュー時に「Phase 8 で各コンテンツがタイル定義を埋められる」が達成されたかを判定する明示的指標が無い。
  - 指示:「### 完了基準」サブセクションを新設し、design-migration-plan.md L126 を引用 + 本サイクル固有の追加基準（hidden 検証ルートが 200 を返す、registry API 経由でタイル定義 0 件配列を取得できる、等）を明記すること。

#### Minor（任意）

- **MIN-1: 用語ゆれ「タイル定義ファイル」「`tile.ts`（仮名）」**
  - L116, L122 で「`tile.ts`（仮名）」、L184 で「`tile.ts`（仮名）」と表記。実装時にどう命名されるか確定していないが、「仮名」を毎回つけているのは妥当。ただし L102「タイル定義は『コンテンツ側の別ファイル（オプショナル）』として導入し」のように仮名すらつかない箇所もある。
  - 指示: 全箇所で同一の仮名表記（例: `tile.ts`（暫定名、実装時確定））を統一すると読みやすい。

- **MIN-2: L41「新規 AP の追加は禁止」根拠が cycle-193 Owner 指示の継承だが、出典明記が薄い**
  - 「cycle-193 Owner 指示の継承」とだけ書かれているが、どのコメント / どの行で示されたかが明示されていない。
  - 指示: cycle-193.md の該当箇所行番号、または cycle-194.md 引用箇所を脚注的に追記。読み手が即時 traceable になる。

- **MIN-3: L42-46 のプレースホルダ的記述が一部残存**
  - L44「<!-- /cycle-planning フェーズで記入する。 -->」コメントが残っている。L46「次の /cycle-planning フェーズで、上記サブタスク（7.1 / 7.2 / 7.3）の実施手順、サブエージェント分担、検証方法、ロールバック条件、品質保証ステップを具体化する。」も「次の /cycle-planning フェーズで...具体化する」と未来形で書かれているが、本セクション以降に既に具体化が記述済。
  - 指示: L44 のテンプレートコメントを削除し、L46 を「本サイクルでは以下のように具体化した」など現在形に書き換える、あるいは削除する。

- **MIN-4: 補足事項 L249 の「9 コンポーネントを Phase 7 から分離する判定が確定済み」が cycle-194 commit `d8850cf9` の Phase 2.3 削除と整合確認できる形で書かれていない**
  - L249「cycle-194 で 9 コンポーネントを Phase 7 から分離する判定が確定済み」とあるが、当初 cycle-194 採用案では PrivacyBadge / useToolStorage は Phase 2.3 で先行整備対象とされていた（commit `b2a0281e`）。その後 commit `d8850cf9` で Phase 2.3 自体が AP-P11 同型のメタレベル発火として削除済。
  - 本サイクル計画書は「9 コンポーネント全て Phase 7 対象外（= Phase 8 以降昇格判断）」という Phase 2.3 削除後の解釈で書かれていて、それ自体は正しい。だが補足事項に「cycle-194 commit `d8850cf9` で Phase 2.3 削除済 → PrivacyBadge / useToolStorage も他の 7 件と同じく Phase 8 以降の昇格判断対象になった」という直近の経緯が書かれていないため、cycle-194 hand-off.md（古い情報、Phase 2.3 がまだ生きている前提で書かれている）を読んだ実装エージェントが混乱するリスクあり。
  - 指示: 補足事項に「cycle-194 commit `d8850cf9`（2026-05-19）以降の正本では Phase 2.3 は撤去済」を 1 行追記。

- **MIN-5: 「`disallow`：配列化」「sanity check 0 件許容」のような細部実装記述が AP-P20 ボーダーライン**
  - L143 の robots.ts disallow 追記、L117 の「件数サニティチェック（最低 0 件可）」など、実装詳細寄りの記述が混じる。design-migration-plan.md L126 の完了基準は「7.1〜7.3 が実装され `tsc` と vitest が通る」程度の粒度。
  - これらは「Phase 8 が満たすべき制約」を超えるか超えないかのボーダーラインで、AP-P20 違反とまでは言えないが、改善余地がある。
  - 指示（任意）: 計画書では「robots.txt と metadata の両方で noindex を保証する仕組みを整備する」「タイル登録 0 件でも build/test が通る運用にする」程度のレベルに留め、配列化の判断・実装方式は実装エージェント判断にしてもよい。CRIT-5 と IMP-2 で「明示せよ」と指摘した部分との兼ね合いで判断すること（明示するなら正確に書く / 明示しないなら抽象度を上げる）。

- **MIN-6: 計画書のサイズが小規模 Phase の割に長い（263 行）**
  - 「Phase 7 = 基盤のみ」の小規模 Phase に対して 263 行はやや長い。運用R6（PM コンテキスト保護）を本サイクル PM 自身が発火させる前提なら、計画書サイズが過大だと次サイクル PM の Read 負荷が増える。
  - ただし 800 行制限内であり、cycle-193 / cycle-194 と比べれば大幅短縮されている。許容範囲。
  - 指示（任意）: 「検討した他の選択肢」テーブル 4 件のうち、3 案比較が独立して別セクションにある（L177〜L217）。テーブル 4 件と 3 案比較セクションで内容が一部重複しているため、「Phase 7 採用 → 関連 3 案比較は後述」と切り出しを明確化すると圧縮できる。

#### Pass（問題なし）

- **観点 1（スコープの妥当性）部分 Pass**: 「やらないこと」リスト（L78-83, L98-103, L126-131, L150-154）は cycle-191/192/193 の失敗パターン（TileVariant / 9 コンポーネント先行実装 / グリッドレイアウト先行実装等）を網羅的にカバーしている。T-1〜T-6 の作業単位は 1 サブエージェント = 1 タスクとして独立性が保たれており、CLAUDE.md「Keep task smaller」と整合。ただし CRIT-1〜CRIT-5 の整合性破綻が残るため完全 Pass ではない。
- **観点 2（cycle-191/192/193 失敗の構造的継承防止）Pass**: 「やらないこと」L100-103 で TileVariant / variantId / コンポーネント参照型契約埋め込み / メタ型必須フィールド追加 / 入出力 placeholder 先行定義 をすべて明示禁止としている。AP-P11 発火（L248）も具体的に 9 コンポーネント名を列挙して「復元しない」を明示。十分。
- **観点 3（3 案比較 AP-P17）部分 Pass**: T-1 / T-3 / T-4 の 3 案比較は独立性・採用理由が妥当。T-2 のみ IMP-3 で指摘したように optional 案が抜けており要再構成。
- **観点 4（AP-P20 過度な実装詳細）部分 Pass**: 大半の記述は「アウトプット仕様」レベルで実装エージェントに判断を委ねている。ただし MIN-5 で指摘した一部の細部記述は要見直し。
- **観点 5（検証方法の妥当性）Pass**: 各 T の検証手段（tsc / vitest / next build / Playwright 任意）は成果物の性質に合っている。「実タイル 0 件のため Playwright 視覚検証は本 Phase 対象外」の判断は design-migration-plan.md L117 と整合確認済。レジストリが 0 件でも build が通る設計の根拠は L131 で明示。
- **観点 6（数値・事実情報の確認 AP-P16）部分 Pass**: 「34 ツール / 20 遊び」は本レビュアが `ls src/tools/` + `src/play/{games,quiz}/registry.ts` で実測確認（34 / 4+15+1=20）一致。Phase 2.2 で `Tileable` + `toTileable()` が実装済の事実は `src/lib/toolbox/types.ts` で実測確認一致。既存 `generate-toolbox-registry.ts` の存在と運用は実測確認一致。**ただし IMP-2 で指摘した robots.ts の disallow 構造（配列でなく文字列）は実体未確認の誤記**。
- **観点 7（800 行制限）Pass**: 263 行。MIN-6 で軽い改善余地あり。
- **観点 8（design-migration-plan.md との整合）部分 Pass**: T-1〜T-4 は概ね 7.1 / 7.2 / 7.3 に対応。ただし CRIT-2（L104 「入出力 placeholder 等」）と CRIT-3（L110 配置先指定）で正本との明示的衝突あり。「本 Phase に含めないもの」リストは design-migration-plan.md L119-124 と整合確認一致。
- **観点 9（形式的な点）部分 Pass**: MIN-3 で指摘した L44 のテンプレートコメント / L46 のプレースホルダ表現が残っている。

---

#### 判定: 改善指示

Critical 5 件 / Important 5 件 / Minor 6 件。Critical 5 件はすべて「型契約 / 配置先 / 計画書 vs 正本の整合 / ルール違反 / サニティチェックの自己矛盾」というスコープ確定に関わる問題で、これらが残ったまま implementation に流すと cycle-191/192/193 と同型の「実装エージェントが計画書解釈で迷い → 投機的選択 → revert」経路を再生する。Important 5 件も同型リスクの予兆。次サイクル PM 役 / planner は CRIT-1〜CRIT-5 を最優先で解消した上で、IMP-1〜IMP-5、Minor 任意対応の順に修正のこと。再レビュー時は本指摘事項だけでなく全体の見直しを含めること。

### r1 指摘への対応（2026-05-19）

#### Critical 対応（5/5 件）

- **CRIT-1**: 対応完了 — T-2 のアウトプットを「方針A = 既存 `TileComponentProps` をそのまま流用、新規 props 型は定義しない」に確定。新設対象は「サイズ仕様型」と「タイルコンポーネント型エイリアス（`React.ComponentType<TileComponentProps>`）」のみ。「T-2 補助判断: タイルコンポーネント props 型の扱い（CRIT-1 対応 3 案比較）」を新設して方針A/B/C を比較し方針A 採用を明示。design-migration-plan.md L101「TileComponent」との対応関係も併記。
- **CRIT-2**: 対応完了 — design-migration-plan.md L104「入出力 placeholder 等」は本サイクル T-6 で「入出力 placeholder は Phase 10.4 で追加」と注記する正本訂正を必須化（方針A 採用）。T-2 やらないこと記述にも CRIT-2 対応理由を明記し、正本同士の整合を本サイクル内で完結させる責務を明示。
- **CRIT-3**: 対応完了 — T-1 の TS 定数配置先を `src/lib/toolbox/tile-grid.ts` に計画段階で確定。「実装エージェントに委ねる事項」から配置先を削除し、確定理由（toolbox 機構固有の概念であり tools 層配下に置く論理的根拠がない、`src/lib/` 直下は範囲が広すぎる、L110 は本サイクル T-6 で実採用パスに書き換える）を 3 点明示。
- **CRIT-4**: 対応完了 — 計画書本文から `tmp-directory.md` ルール違反となる一時ファイル参照を 3 箇所（運用ルール導入文 L32 / 作業計画導入文 L46 / 参考にした情報リスト L246）全件撤去。代替として cycle-194.md L33-44 / cycle-193.md L20, L22 など `docs/` 配下のコミット済ファイルを参照する形に書き換え。
- **CRIT-5**: 対応完了 — 本 Phase では件数強制サニティチェック（≥1）を導入しない方針（方針A）に統一。T-3 「実施する作業」「アウトプット」「やらないこと」3 箇所全てで意味的に一致する記述に書き換え。Phase 8 で最初のタイル実装サイクル PM が `assertMinCount` を追加する責務を明示。

#### Important 対応（5/5 件）

- **IMP-1**: 対応完了 — T-4 hidden 検証ルートの物理パスを `src/app/(new)/internal/tiles/page.tsx` に計画段階で確定。「実装エージェントに委ねる事項」から Route Group 選択を削除し、確定理由（既存 storybook の robots:noindex 適用パターンと完全整合、Phase 11.2 `(legacy)` 撤去フローと干渉しない）を明示。
- **IMP-2**: 対応完了 — `app/robots.ts` の現状 `disallow: "/api/"`（文字列）を配列 `["/api/", "/internal/"]` に変更する具体的な追記方式に修正。`MetadataRoute.Robots` 型が `string | string[]` 双方を許容することを確認済と明記し、AP-P16 発火に応えた一次情報確認を反映。
- **IMP-3**: 対応完了 — T-2 タイル定義追加方式の比較を「3 案」から「4 案」に再構成し、optional 統合案（案 A'）を独立軸として新設。案 A' 不採用理由（メタ型 4 種への共通フィールド追加負担 / 「存在する = タイル化済」の単純判定が案 B の方が codegen 集約に向く）を明示。
- **IMP-4**: 対応完了 — T-2 の 1 行説明（L23）に「サイズ仕様型・タイルコンポーネント型エイリアス」を明記し、「作業内容」セクション T-2 アウトプット記述とスコープを一致させた。
- **IMP-5**: 対応完了 — 「### 完了基準（IMP-5 対応）」サブセクションを「目的」と「作業内容」の間に新設。design-migration-plan.md L126 を引用 + 本サイクル固有の判定基準を 5 点（型契約 / サイズ定数 / レジストリ + 検証ルート / 整合化 / 検証コマンド）明記。

#### Minor 対応（任意、未対応で残置）

MIN-1〜MIN-6 は任意対応。本サイクルの r1 修正範囲では未対応。MIN-3 のテンプレートコメント `<!-- /cycle-planning フェーズで記入する。 -->` は副次的に「作業計画」セクション導入文書き換え時に削除済。それ以外は次回レビューラウンドで必要に応じて対応。

### レビュー r2 (2026-05-19)

レビュー対象: r1 対応後の `## 実施する作業` / `## 作業計画` セクション全体、および r1 で見落としていた論点。
レビュアは以下を実体確認した上で所見を出した:

- `docs/cycles/cycle-195.md` 全文（441 行）を Read
- `docs/design-migration-plan.md` Phase 2 / 7 / 8 / 10 全文を Read（L95-156, L190-229, L272-285）
- `src/lib/toolbox/tile-loader.ts`、`src/lib/toolbox/types.ts`、`src/app/robots.ts`、`scripts/generate-toolbox-registry.ts` を Read
- `docs/anti-patterns/planning.md` の AP-P11 / AP-P16 / AP-P17 / AP-P20 を Read
- `docs/cycles/cycle-194.md` L33-44 で運用R1〜R7 と「新規 AP 追加禁止」の継承根拠を確認
- `.claude/rules/tmp-directory.md` を Read（Don't「他のディレクトリにあるファイルから `./tmp/` に保存したファイルについて言及またはリンクする」を確認）
- `docs/research/` 配下の存在ファイル確認（調査 A `2026-05-19-cycle-195-phase7-meta-types-survey.md`、調査 B `2026-05-19-cycle-191-tile-foundation-analysis.md`、調査 C `2026-05-19-phase7-tile-foundation-best-practices.md` の 3 件すべて `docs/research/` に存在）

#### Critical（必ず対応）

- **r2-CRIT-1: CRIT-4 対応が不完全 — 計画書本文 L259/L260 に `./tmp/research/` への参照が残存している**
  - r1-CRIT-4 で指摘した `./tmp/cycle-194-hand-off.md` 参照は撤去されたが、L259「`/mnt/data/yolo-web/tmp/research/2026-05-19-cycle-195-phase7-meta-types-survey.md`」と L260「`/mnt/data/yolo-web/tmp/research/2026-05-19-cycle-191-tile-foundation-analysis.md`」の 2 件が **計画書本文「計画にあたって参考にした情報」セクション内で残存**している。
  - `.claude/rules/tmp-directory.md` の Don't「他のディレクトリにあるファイルから `./tmp/` に保存したファイルについて言及またはリンクする」に直接違反。**絶対パス表記（`/mnt/data/yolo-web/tmp/`）であっても、本質は `./tmp/` 配下への参照であり禁止対象に該当**。
  - r1 reviewer 自身が CRIT-4 として指摘した「`./tmp/` が削除された時点で計画書のリンクが壊れる」リスクが、絶対パス表記の 2 件に対して未解消のまま残っている。
  - **実害確認**: 調査 A / 調査 B の同名ファイルは既に `docs/research/2026-05-19-cycle-195-phase7-meta-types-survey.md` および `docs/research/2026-05-19-cycle-191-tile-foundation-analysis.md` に存在する（`ls docs/research/` で実測確認）。したがって参照先を `docs/research/` 配下に書き換えるだけで解消する。
  - 指示: L259/L260 の `/mnt/data/yolo-web/tmp/research/` を `docs/research/` に書き換える。または `docs/research/` 配下のファイルが Read 可能なのでそちらを正本参照とする。

- **r2-CRIT-2: CRIT-2 対応が L142 まで波及していない — design-migration-plan.md の「入出力 placeholder 等」は L104 と L142 の 2 箇所に存在**
  - T-6 (a) は「L104『入出力 placeholder 等』を訂正」のみを必須項目化しているが、design-migration-plan.md L142（Phase 8.1 各サイクルで実施する内容 #4）にも **同一の表現「タイル用コンポーネント参照、推奨サイズ、入出力 placeholder 等」が記述されている**（`grep -n "入出力" docs/design-migration-plan.md` で実体確認、L104 / L142 の 2 件のみヒット）。
  - L104 のみ訂正しても L142 は同表現が残るため、後続 Phase 8 PM が L142 を起点に作業を始めた場合「タイル定義に入出力 placeholder を埋めなければ」と解釈する経路が成立する。
  - これは r1-CRIT-2 で指摘した「後続 PM が L104 を読んで本サイクル PM の判断を知らないまま手戻りする経路」と同型のリスクを **L142 が独立に持っている** ことを意味し、CRIT-2 対応の整合性破綻に該当。
  - 指示: T-6 (a) の必須実施項目に「L142 の『入出力 placeholder 等』も L104 と同方式（『※ 入出力 placeholder は Phase 10.4 で追加』注記）で訂正」を追記する。L104 だけでなく L142 を含む全 2 箇所を訂正対象として明示すること。

- **r2-CRIT-3: T-6 (b) 配置先訂正の波及が不十分 — design-migration-plan.md L110 の `:export` / CSS 変数経由言及が Turbopack 制約と齟齬している**
  - T-6 (b) で L110 の配置先パス `src/tools/_constants/tile-grid.ts` → `src/lib/toolbox/tile-grid.ts` の書き換えが必須化されたが、**L110 の後半「CSS Module 側で参照する場合は `:export` または CSS 変数経由で同じ値を共有する」も同時に訂正対象に含めるべき**。
  - 本サイクル計画書 L97 / L226-228（T-1 値共有方式 3 案比較）で「Turbopack では CSS Module `:export` / `@value` / Sass 変数 export が未サポート」と確定しており、案 X（`:export`）は不採用、案 Y（TS 定数 + CSS Custom Properties 二重管理）が採用された。
  - L110 の「`:export` または CSS 変数経由」のうち、`:export` 言及は Turbopack 移行済の現プロジェクトで実装エージェントを誤誘導する恐れがある。
  - 指示: T-6 (b) の必須実施項目に「L110 の『CSS Module 側で参照する場合は `:export` または CSS 変数経由で同じ値を共有する』を『CSS Module 側で参照する場合は `globals.css` の CSS Custom Properties（`--tile-cell-px` / `--tile-gap-px`）経由で共有する（Turbopack で `:export` / `@value` は未サポートのため）』に書き換え」を追記する。配置先パスだけ訂正して `:export` 言及を残すと、後続 Phase 8 で個別タイル CSS Module から `:export` を試行する経路が再生される。

#### Important（強く推奨）

- **r2-IMP-1: T-3「実装方式 3 案比較」L235 の採用理由に『件数サニティ』が含まれており CRIT-5 対応と読み手認知が衝突**
  - L235「採用理由 (1) 既存パターン踏襲（fast-glob + **件数サニティ** + prebuild/predev/pretest フック）」と、L24 / L128 / L142 の「本 Phase では件数強制サニティチェック（≥1）は導入しない」が、字面で衝突しているように読める。
  - 厳密には「既存ツール / cheatsheets には件数サニティが残る（既存 `assertMinCount("tools", _, 10)` は維持）」「タイル定義配列には件数サニティを書かない」という 2 系統の区別であり、L235 は前者を指すが、読み手にこの区別を即時に理解させる文脈情報が L235 単体には無い。
  - r1-CRIT-5 で「サニティチェックの取り扱いを 1 文に統一する」と指示されたが、L235 が独立して採用理由として「件数サニティ」を列挙しているため、CRIT-5 対応の 3 箇所統一が **L235 を含めて完全には達成されていない**。
  - 指示: L235 の採用理由 (1) を「既存パターン踏襲（fast-glob + 既存件数サニティ（tools / cheatsheets 用、本 Phase で導入する tile 用配列には適用しない）+ prebuild/predev/pretest フック）」に書き換えるか、注釈で「tile 用配列の件数サニティは Phase 8 第 1 弾サイクルで追加（CRIT-5 対応）」を補う。

- **r2-IMP-2: T-6 のスコープが「数値ズレ訂正（B-365）」と「正本訂正の必須項目（L104 / L110）」の 2 系統を含むようになり、Done 判定が複雑化**
  - r1 では T-6 = 「数値訂正、訂正対象がなければスキップ可」だったが、r1 対応で T-6 が「(a) L104 必須 / (b) L110 必須 / (c) B-365 副次的（訂正対象がなければスキップ可）」の 3 項目を持つようになった。
  - (a) (b) は必須、(c) は任意というスコープ混在のため、T-6 完了判定で「(a) (b) のみ実施で Done か / (c) も実施しないと Done でないか」が読み手に曖昧。
  - 完了基準（L60-69）の項目 4 では「L104（入出力 placeholder → Phase 10.4 注記）および L110（配置先 → `src/lib/toolbox/tile-grid.ts`）の訂正が反映されている」と (a)(b) のみ明示、(c) は完了基準に含まれない構造になっている。意図と一致しているが、T-6 セクション内（L175-184）の見出しが「必須実施項目（CRIT-2 / CRIT-3 由来）」と「(c) B-365 副次的解消」で分節されており、Done 判定者が必須範囲を読み違えるリスクはある。
  - 指示: T-6 を「**T-6a: 正本訂正の必須項目（L104 / L110 + r2-CRIT-2 / r2-CRIT-3 で追加される項目）**」と「**T-6b: 数値ズレ訂正（B-365 副次的、訂正対象がなければスキップ可）**」の 2 タスクに分離するか、T-6 セクション冒頭に「(a)(b)(さらに r2 で追加される L142 / L110 後半) は本サイクル Done の必須条件、(c) は副次的でスキップ可」と明記すること。

- **r2-IMP-3: 作業順序 T-1 → T-2 → T-3 → T-4 → T-5 → T-6 で、T-6（正本訂正）が最後にあるため実装中に正本未訂正状態が長く続く**
  - 計画書 L20 のコメントで「実装順は 7.2 → 7.1 → 7.3」と書かれているのは T-1 → T-2 → T-3 と一致しており、依存関係上妥当。
  - しかし T-6（正本訂正）が最後にあるため、T-1 着手時点では design-migration-plan.md L110 がまだ「src/tools/\_constants/tile-grid.ts」を例示している状態。実装エージェントが計画書ではなく **正本 design-migration-plan.md を起点に作業を始めた場合**、計画書 L87 の確定理由を見落として L110 の例示パスに従う経路が発生する。
  - リスク自体は低い（実装エージェントは通常サイクル md を起点とする）が、T-6 を T-1 着手**前**に実施しておけば、正本との不整合期間を短縮できる。
  - 指示: T-6 (a)(b) の必須項目だけでも T-1 着手前に実施する案を検討するか、もしくは「実装エージェントは必ず計画書 L87（T-1 配置先確定理由）を Read してから着手する」を運用ルールとして明示。スコープ最小化のために変更しない判断もあり得る（任意対応）。

#### Minor（任意）

- **r2-MIN-1: 計画書サイズが 441 行に増加し、運用R6（巨大サイクル md の認知負荷回避）の趣旨と摩擦**
  - r1 時点で 263 行だった計画書が r1 対応で 441 行に増加（約 1.7 倍）。Phase 7 = 基盤のみの小規模性に対し、計画書サイズは過大の兆候あり。
  - cycle-193（2400 行）/ cycle-194（2170 行）に比べれば許容範囲内だが、本サイクル PM 自身が運用R6（Read 対象を必要セクションに限定）を発火させる前提なら、計画書サイズが拡大すると次サイクル PM の Read 負荷も増える。
  - 増加の主要因は r1 指摘へのレスポンスとして 4 案比較 / 3 案比較が追加されたこと（IMP-3 / CRIT-1 対応で 4 案表 + 3 案表が増えた）と、確定理由の冗長な記述（L87 等）。
  - 指示（任意）: T-2 の 4 案比較表（L196-207）と T-2 補助判断の 3 案比較表（L209-217）を統合できるか検討、または確定理由の冗長な記述を 2-3 行に圧縮する。任意対応。

- **r2-MIN-2: r1 指摘 MIN-1〜MIN-6 のうち MIN-2 / MIN-4 が未対応で残置されており、形式上の整合性に小さな摩擦**
  - r1 対応セクションで「Minor 対応（任意、未対応で残置）」と明記されており運用上は問題ない。
  - MIN-4「cycle-194 commit `d8850cf9` 以降の Phase 2.3 撤去経緯」は補足事項セクションに 1 行追記すれば実装エージェントの混乱回避に寄与する。
  - 指示（任意）: 補足事項セクションに「cycle-194 commit `d8850cf9`（2026-05-19）以降の正本では Phase 2.3 は撤去済」を 1 行追記。任意対応。

- **r2-MIN-3: 完了基準セクション（L60-69）に「robots.txt の Disallow 確認」が含まれるが、Playwright 検証が任意扱いとされている**
  - 完了基準 3 では「`/robots.txt` レスポンスに `Disallow: /internal/` が含まれる」と明示。
  - 一方 T-4 検証セクション L169 では Playwright 検証は「任意」とされている。
  - 完了基準として明示する以上、検証手段（curl / fetch / Playwright のいずれか）は実装エージェントに委ねるが「実施は必須」を明示する方が一貫性が増す。
  - 指示（任意）: T-4 検証セクションの Playwright 記述を「`/robots.txt` 確認は curl 等で実施（手段は問わないが完了基準項目 3 の達成を保証する）」と書き換える。任意対応。

#### Pass（問題なし）

- **観点 A-1 (CRIT-1 対応の妥当性)**: r1 で CRIT-1 として指摘した「props 型の論理矛盾」を、T-2 補助判断の 3 案比較（方針A/B/C、L209-217）で方針A 採用として明示的に解消した。L23 / L101 / L106 / L215 の記述が一貫しており、新規 props 型を作らず既存 `TileComponentProps` をそのまま流用する方針が全体で揃っている。`src/lib/toolbox/tile-loader.ts:37-40` の既存 `TileComponentProps { slug: string }` を実体確認し、計画書記述と一致を確認。**Pass**。
- **観点 A-2 (CRIT-2 対応の妥当性)**: r1 で CRIT-2 として指摘した「L104 入出力 placeholder の不整合」に対し方針A（正本訂正必須化）を採用し、T-6 (a) に組み込んだ。**ただし r2-CRIT-2 で指摘した通り L142 が訂正対象から漏れているため Pass ではなく Critical 改善指示**。
- **観点 A-3 (CRIT-3 対応の妥当性)**: r1 で CRIT-3 として指摘した「配置先候補の不確定」を、計画書 L87 で `src/lib/toolbox/tile-grid.ts` 確定 + 3 点の確定理由明示で解消。toolbox 層 / tools 層の依存方向の検討も妥当（既存 `types.ts` が `@/tools/types` を import している事実を確認、Read で一致）。**ただし r2-CRIT-3 で指摘した通り L110 後半の `:export` 言及訂正が漏れているため、T-6 (b) のスコープ拡張が必要**。
- **観点 A-4 (CRIT-4 対応の妥当性)**: r1 で CRIT-4 として指摘した `./tmp/cycle-194-hand-off.md` 参照は L32 / L46 / L226 から撤去された。**ただし r2-CRIT-1 で指摘した通り L259/L260 の `tmp/research/` 参照が新たに発覚したため、Pass ではなく Critical 改善指示**。
- **観点 A-5 (CRIT-5 対応の妥当性)**: 件数サニティチェック方針が L24 / L128 / L142 の 3 箇所で「導入しない」に統一されており、Phase 8 第 1 弾サイクルが追加する責務も明示。**ただし r2-IMP-1 で指摘した通り L235 の採用理由 (1) が読み手認知で衝突するため、Important 改善指示**。
- **観点 A-6 (IMP-1 対応)**: T-4 hidden 検証ルートの物理パスを `src/app/(new)/internal/tiles/page.tsx` で確定済。既存 `src/app/(new)/storybook/page.tsx` パターンと整合確認 (実体確認: `storybook/` 配下に `StorybookContent.tsx` + `page.module.css` + `page.tsx` が存在)。**Pass**。
- **観点 A-7 (IMP-2 対応)**: `app/robots.ts` の現状 `disallow: "/api/"`（文字列）を `["/api/", "/internal/"]` 配列化する方針が L25 / L154 で明示。`MetadataRoute.Robots` 型の string | string[] 両対応も確認済記述あり。`src/app/robots.ts` を Read で実体確認、現状が L10 で `disallow: "/api/"` 文字列であることを確認。**Pass**。
- **観点 A-8 (IMP-3 対応)**: T-2 タイル定義追加方式の比較が「3 案」から「4 案」に再構成され、optional 統合案 A' が独立軸として新設。案 A' 不採用理由（メタ型 4 種への共通フィールド追加負担 / 「存在する = タイル化済」の単純判定が案 B の方が codegen 集約に向く）が妥当。**Pass**。
- **観点 A-9 (IMP-4 対応)**: T-2 の 1 行説明 L23 に「サイズ仕様型」と「タイルコンポーネント型エイリアス」が明記され、作業内容 T-2 アウトプット L103-104 とスコープが一致。**Pass**。
- **観点 A-10 (IMP-5 対応)**: 「完了基準」サブセクション L60-69 が新設され、design-migration-plan.md L126 引用 + 本サイクル固有判定基準 5 点（型契約 / サイズ定数 / レジストリ + 検証ルート / 整合化 / 検証コマンド）が明記。**Pass**。
- **観点 B-1 (CRIT-2 波及検証 — design-migration-plan.md Phase 10 セクション)**: L221「10.4 ツール間の入出力連携」が独立サブタスクとして既に明示されており、L142 訂正後も Phase 10.4 への移管経路は一貫。Phase 10.4 セクション自体に変更不要。**Pass**。
- **観点 B-2 (CRIT-3 波及検証 — Phase 7 完了基準 L126)**: 「7.1〜7.3 が実装され、`tsc` と vitest テストが通る。Phase 8 で各コンテンツがこの規格に従ってタイル定義を埋められる状態」は配置先パスに依存しないため、L110 訂正による Phase 7 完了基準への波及はない。**Pass**。
- **観点 C-1 (AP-P11 / AP-P16 / AP-P17 / AP-P20 の能動発火)**: r1 対応後も維持。L40「能動的に発火すべき既存 AP」、L264「能動的に発火させる AP-P11 / AP-P16 / AP-P17 / AP-P20」、L426-428 補足事項で各 AP の発火対象が明示。**Pass**。
- **観点 C-2 (「やらないこと」リストの維持)**: r1 対応で弱体化していない。L89-93 / L109-114 / L137-142 / L163-167 の 4 箇所で「やらないこと」が網羅され、cycle-191/192/193 の失敗パターン（TileVariant / 9 コンポーネント先行実装 / グリッドレイアウト先行実装 / 入出力 placeholder 先行定義 / メタ型必須フィールド追加）を引き続きカバー。**Pass**。
- **観点 C-3 (「Phase 8 が満たすべき制約」を超えた実装詳細の混入チェック)**: 大半は「アウトプット仕様」レベルで実装エージェント判断に委ねている。`disallow` 配列化（CRIT-3 / IMP-2 対応の必然）と `assertMinCount` 言及（CRIT-5 対応の必然）は r1 reviewer 自身が「明示せよ」と指示した結果であり、AP-P20 違反とまでは言えない。**Pass**。
- **観点 C-4 (検証方法の妥当性)**: tsc / vitest / next build / Playwright（任意）の組み合わせは、実タイル 0 件状態に対して妥当。Phase 8 第 1 弾サイクルでタイル本体実装と同時に Playwright 視覚検証を行う方針も整合。**Pass**。
- **観点 C-5 (design-migration-plan.md の完了基準と本計画の完了基準の整合)**: L61 で L126 を引用 + 本サイクル固有基準 5 点を追加する構成であり、design-migration-plan.md の完了基準を満たしつつ本サイクル固有の検証項目を上積みする形。**Pass**。

#### 総合判定

**Fail**（改善指示）

- Critical 3 件: r2-CRIT-1（`tmp/research/` 参照残存）、r2-CRIT-2（L142 訂正漏れ）、r2-CRIT-3（L110 後半 `:export` 言及訂正漏れ）
- Important 3 件: r2-IMP-1（L235 サニティチェック表記の読み手認知衝突）、r2-IMP-2（T-6 スコープ複雑化）、r2-IMP-3（T-6 を最後に置くことの正本未訂正期間リスク）
- Minor 3 件: r2-MIN-1（計画書サイズ 441 行）、r2-MIN-2（r1-MIN 一部未対応）、r2-MIN-3（完了基準と検証手段の表現整合）

r2-CRIT-1〜CRIT-3 はいずれも「r1 対応の徹底が不十分」型の指摘であり、根本的な計画方針の誤りではない。r1 対応で「正本訂正を本サイクル内で完結させる責務を負う」と planner が明示した以上、正本訂正の波及範囲（L104 → L142、L110 配置先 → L110 後半 `:export`）を漏れなく拾わないと、後続 Phase 8 PM が訂正されていない箇所を起点に手戻りする経路が残る。これは r1-CRIT-2 と同型のリスクを訂正範囲不足という形で再生してしまう。

次サイクル PM 役 / planner は r2-CRIT-1 〜 r2-CRIT-3 を最優先で解消し、r2-IMP-1 〜 r2-IMP-3 を順次対応のこと。Minor は任意。再レビュー時は本指摘事項だけでなく全体の見直しを含めること。

---

#### 判定: 改善指示

### r2 指摘への対応（2026-05-19）

#### Critical 対応（3/3 件）

- **r2-CRIT-1**: 対応完了 — `tmp/research/` 配下にあった調査 A / 調査 B の 2 ファイルを `mv` で `docs/research/` 配下に昇格（`docs/research/2026-05-19-cycle-195-phase7-meta-types-survey.md` / `docs/research/2026-05-19-cycle-191-tile-foundation-analysis.md`）。`tmp/` は git 管理外のため `git mv` ではなく plain `mv` を使用。計画書「計画にあたって参考にした情報」セクションの調査 A / B / C 全 3 件のパス表記を `docs/research/` 相対パスに統一（調査 C の絶対パス表記も併せて正規化）。
- **r2-CRIT-2**: 対応完了 — `grep -n "入出力 placeholder" docs/design-migration-plan.md` で L104 と L142 の 2 箇所を網羅的に確認。T-6 (a) のスコープを「L104 固定」から「L104 + L142 の 2 箇所一括訂正」に拡張。完了基準（項目 4）にも「L142 の Phase 10.4 注記化」を含む 4 訂正項目 (i)〜(iv) を明示。実施する作業 L22（T-6 概要）にも全箇所訂正であることを明記。
- **r2-CRIT-3**: 対応完了 — T-6 (b) のスコープを「L110 配置先パスのみ」から「L110 前半（配置先パス）+ L110 後半（`:export` / CSS 変数言及）の同時訂正」に拡張。後半訂正の具体的書き換え文言（`globals.css` の CSS Custom Properties 経由 + Turbopack 制約注記）を明示。完了基準項目 4 (iv) にも反映。

#### Important 対応（3/3 件）

- **r2-IMP-1**: 対応完了 — T-3 案 P（L242）の採用理由 (1) を「既存パターン踏襲（fast-glob + **既存件数サニティ（tools / cheatsheets 用 `assertMinCount` は維持、本 Phase で導入する tile 用配列には適用しない**）+ prebuild/predev/pretest フック）」に書き換え、CRIT-5 対応との読み手認知衝突を解消。tile 用配列の件数サニティ追加が Phase 8 第 1 弾サイクル PM の責務であることも同表内に明記。
- **r2-IMP-2**: 対応完了 — T-6 セクションを「**T-6a: 正本訂正の必須項目（本サイクル Done 必須）**」と「**T-6b: 数値ズレ訂正（B-365 副次的、スキップ可）**」に分節構造化。冒頭に「(a)(b) は本サイクル Done の必須条件、(c) はスキップ可」のスコープ整理ブロックを追加し、Done 判定者が必須範囲を読み違えないようにした。完了基準項目 4 にも T-6 (c) は含めない旨を明記。
- **r2-IMP-3**: 対応完了 — 「運用R8（r2-IMP-3 対応、本サイクル新設）」を追加し、**T-6a を T-1 着手前に先行実施**する方針に変更。実装順を「T-6a → T-1 → T-2 → T-3 → T-4 → T-5 → T-6b」に更新（実施する作業セクション冒頭コメントも同順に書き換え）。これにより正本（design-migration-plan.md）と計画書の整合期間を最大化し、実装エージェントが正本を起点に作業を始めた場合の誤誘導経路を塞ぐ。

#### Minor 対応（任意、未対応で残置）

r2-MIN-1（計画書サイズ）/ r2-MIN-2（r1-MIN 一部未対応）/ r2-MIN-3（完了基準と検証手段の表現整合）は任意対応で本ラウンドでは未対応。次回レビューラウンドで必要に応じて対応。

### レビュー r3 (2026-05-19)

レビュー対象: r2 対応後の `## 実施する作業` / `## 作業計画` セクション全体（r2 指摘事項への対応の妥当性 + 全体再見直し）。

レビュアは以下を実体確認した上で所見を出した:

- `docs/cycles/cycle-195.md` 全文（576 行）を Read（chunk 分割）
- `docs/design-migration-plan.md` 全文（370 行）を Read
- `docs/design-migration-plan.md` L104 / L110 / L142 の現状を `grep` 確認（L104 / L142 が「入出力 placeholder 等」を含む、L110 が「`src/tools/_constants/tile-grid.ts`」「`:export` または CSS 変数経由」を含むことを実測確認）
- `docs/research/` 配下の調査 A / B / C 全 3 ファイルの存在を実測確認（`docs/research/2026-05-19-cycle-195-phase7-meta-types-survey.md` 11827 bytes、`docs/research/2026-05-19-cycle-191-tile-foundation-analysis.md` 17324 bytes、`docs/research/2026-05-19-phase7-tile-foundation-best-practices.md` 16751 bytes）
- `./tmp/research/` の現状を `ls` 確認（同名ファイルは存在せず、mv 完了を確認）
- `src/app/robots.ts` を Read（現状 L10 が `disallow: "/api/"` 文字列であることを確認）
- `src/lib/toolbox/tile-loader.ts` を Read（`TileComponentProps { slug: string }` が L37-40 に既存することを確認）
- `.claude/rules/doc-directory.md`、`.claude/rules/tmp-directory.md`（r2 引用）、`docs/anti-patterns/planning.md` の AP-P11 / AP-P16 / AP-P17 / AP-P20 を Read
- 計画書 L1-200 / L200-400 / L400-576 を全範囲 Read してライブセクションとレビュー履歴セクションを区別

#### Critical（必ず対応）

指摘なし。

#### Important（強く推奨）

指摘なし。

#### Minor（任意）

- **r3-MIN-1: L267 / L268 に「`tmp/research/` から `docs/research/` に昇格」の文字列が残存している（影響軽微）**
  - L267 「（r2-CRIT-1 対応で `tmp/research/` から `docs/research/` に昇格）」と L268 同型の注記は r2-CRIT-1 対応の経緯を説明するためのもので、現実のファイル参照先は `docs/research/` 配下に正規化済（実測一致）。
  - `.claude/rules/tmp-directory.md` の Don't「他のディレクトリにあるファイルから `./tmp/` に保存したファイルについて言及またはリンクする」を厳格に読むと、注釈中の `tmp/research/` 言及も「言及」に該当しうる。ただし参照ファイル自体は既に `tmp/` に存在せず、文脈上「過去にこのパスにあった」の歴史記述であり、リンク切れリスクは生じない。
  - 指示（任意）: 経緯注記を「（r2-CRIT-1 対応で `docs/research/` 配下に昇格済）」のように、過去の所在を明記しない表現に圧縮する。任意対応。

- **r3-MIN-2: 計画書サイズが 576 行に拡大し、運用R6 と継続的に摩擦**
  - r1 263 行 → r2 441 行 → r3 576 行と段階的に増加。r2-MIN-1 で指摘されたサイズ拡大が r3 対応でさらに進行（運用R8 新設 / T-6 分節化 / 完了基準項目 4 拡張 / r2 対応セクション追加が主因）。
  - 800 行制限内かつレビュー履歴（r1 / r2 / r1 対応 / r2 対応）の蓄積が主因なので、純粋な計画本体（L1-273）は約 273 行に収まっており実害は限定的。次サイクル PM が「実施する作業 / 作業計画 / 完了基準 / 補足事項」を Read すれば 270 行程度で完結する構造になっている点も評価できる。
  - 指示（任意）: 次のサイクル md テンプレートでは「レビュー履歴を別ファイル `docs/cycles/cycle-XXX-review-history.md` に分離する」運用を検討してもよい。本サイクルでの対応は不要。

- **r3-MIN-3: 運用R8 の名称が R1〜R7 と並列されているが「本サイクル限定の新設」であり継承運用ルールではない**
  - L41「運用R8（r2-IMP-3 対応、本サイクル新設）」と明記されており、cycle-194 で確定した R1〜R7（継承運用ルール）とは性質が異なる（本サイクル限定の作業順序ルール）。
  - 次サイクル PM が運用ルール継承を判断する際、R1〜R8 を一括継承して「R8 = 正本訂正先行実施」を Phase 8 サイクルにも自動継承する誤解が生じる可能性が極めて低いが残る。
  - 指示（任意）: R8 の説明を「**本サイクル限定**（T-6a を T-1 着手前に先行実施）」と冒頭で 1 語強調するか、運用ルールセクション末尾に「R1〜R7 は継承運用ルール / R8 は本サイクル限定」と注記。任意対応。

#### Pass（問題なし）

##### A. r2 指摘事項への対応の妥当性

- **A-r2-CRIT-1（`tmp/research/` 参照残存）への対応**: 計画ライブセクション（L1-273）内で `grep -nE "tmp/"` を実行し、L267 / L268 の経緯注記中の `tmp/research/` 文字列以外に tmp 参照が残っていないことを確認。`ls docs/research/` で調査 A / B の同名ファイル（11827 / 17324 bytes）が存在することを実測確認。`ls tmp/research/` で `cycle-195-phase7-meta-types-survey.md` / `cycle-191-tile-foundation-analysis.md` が存在しないことを実測確認 = `mv` 完了。L267 / L268 / L269 の調査参照先は `docs/research/` 配下に統一済。**設計判断としても妥当**（次サイクル PM が `tmp/` 削除後も計画書から調査資料にアクセスできる）。経緯注記の文字列 `tmp/research/` 残存は r3-MIN-1 として軽微指摘。**Pass**。
- **A-r2-CRIT-2（L142 訂正漏れ）への対応**: T-6 (a) のスコープが L24 / L69 / L181-183 で「L104 + L142 の 2 箇所一括訂正」に拡張されている。完了基準項目 4 で (i) L104 / (ii) L142 / (iii) L110 前半 / (iv) L110 後半の 4 訂正項目が明示。`grep -n "入出力" docs/design-migration-plan.md` で L104 / L142 の 2 箇所のみヒット（L221 の Phase 10.4 見出しは別文脈で訂正不要）を実測確認 → 訂正対象の網羅性は完全。**設計判断としても妥当**（後続 Phase 8 PM が L142 を起点に作業開始した場合の手戻り経路が塞がれる）。**Pass**。
- **A-r2-CRIT-3（L110 後半 `:export` 言及訂正漏れ）への対応**: T-6 (b) のスコープが L25 / L69 / L184-185 で「L110 前半（配置先パス）+ L110 後半（`:export` / CSS 変数言及）」に拡張。書き換え文言が L185 で具体的に明示（「`globals.css` の CSS Custom Properties（`--tile-cell-px` / `--tile-gap-px`）経由で共有する（Turbopack で `:export` / `@value` は未サポートのため）」）。本サイクル計画書 L97 / L233-235（案 X 不採用、案 Y 採用）と整合確認。`grep -n ":export" docs/design-migration-plan.md` で L110 のみヒット → 訂正対象の網羅性は完全。**設計判断としても妥当**（後続 Phase 8 PM が `:export` を試行する経路が塞がれ、Turbopack 制約が正本で明示される）。**Pass**。
- **A-r2-IMP-1（L235 サニティチェック表記）への対応**: L243（T-3 案 P 採用理由）が「既存パターン踏襲（fast-glob + **既存件数サニティ（tools / cheatsheets 用 `assertMinCount` は維持、本 Phase で導入する tile 用配列には適用しない**）+ prebuild/predev/pretest フック）」に書き換え済。CRIT-5 対応との読み手認知衝突が解消されている。tile 用配列の件数サニティ追加が Phase 8 第 1 弾サイクル PM の責務であることも同箇所で明記。L24 / L128-129 / L142-143 と L243 の 4 箇所で記述が一貫している。**Pass**。
- **A-r2-IMP-2（T-6 スコープ複雑化）への対応**: T-6 セクション冒頭（L178）に「(a)(b) は本サイクル Done 必須 / (c) はスキップ可」のスコープ整理ブロックを追加。T-6a「必須実施項目」L180-185 と T-6b「副次的実施項目」L187-191 に分節構造化。完了基準項目 4（L69）に「T-6 (c) は完了基準には含めない（スキップ可）」と明記。Done 判定者が必須範囲を読み違えるリスクが解消されている。**Pass**。
- **A-r2-IMP-3（T-6 を最後に置く正本未訂正期間リスク）への対応**: 運用R8（L41）新設で T-6a を T-1 着手前に先行実施。実装順を「T-6a → T-1 → T-2 → T-3 → T-4 → T-5 → T-6b」に更新（L20 コメント / L41 / L546）。R8 の判断根拠（正本との不整合期間の最大短縮）も L41 で明示。R8 名称の継承性ニュアンスは r3-MIN-3 で軽微指摘。**Pass**。

##### B. r3 で新規視点による全体再見直し

- **B-1（T-6a 先行実施の妥当性）**: 「正本訂正を実装前に先行する」フローの優劣判断が運用R8 内（L41）で明示されている。「実装エージェントが正本を起点に作業を始めた場合の誤誘導経路を塞ぐ」が判断根拠として書かれており、本来「正本 Read → 実装 → 矛盾発見 → 訂正」の逆方向フローが採用されている理由が了解可能。先行訂正のリスク（T-1 実装中に L110 配置先が後段で不適切と判明した場合）については、計画書 L87 で配置先 `src/lib/toolbox/tile-grid.ts` を 3 点の論理根拠で確定済かつ T-1 実装で「TS 定数を export する」だけのシンプル構造なので、後段判明リスクは実質ゼロ。**Pass**（リスク評価まで含めて妥当）。
- **B-2（T-6a 正本訂正範囲の妥当性 — Phase 7 完結に必要不可欠か）**: L104（Phase 7.1 のフィールド要件）/ L142（Phase 8.1 各サイクル #4）/ L110（Phase 7.2 サイズ枠の配置先 + CSS 共有方式）の 4 訂正項目はいずれも Phase 7 のスコープに直接関連（型契約・サイズ枠定数）。L142 は名目上 Phase 8 セクションだが「Phase 7 で確定した型契約のフィールド要件」を Phase 8 PM に伝える経路として Phase 7 完結に必要。Phase 10.4 への注記化は Phase 10 セクション本体の変更を含まず、Phase 10.4 セクション L221 はそのまま機能する（観点 A-r2-CRIT-2 B-1 で確認済）。**範囲は適切**（Phase 7 完結の必要範囲のみで、Phase 10 本体に踏み込まない）。**Pass**。
- **B-3（調査 A / B の `docs/research/` 移動の妥当性）**: `.claude/rules/doc-directory.md` の `docs/research/` 用途定義「調査や分析の結果。計画や提案などは保存しないでください」と一致（メタ型サーベイ・コード復元分析はまさに「調査・分析」）。「サイクル内で完結する補助資料」と「将来も参照する調査結果」の境界判断について、調査 A は cycle-195 計画立案の前提（既存メタ型構造の現状記録）として将来 Phase 8 / 9 / 10 でも参照価値があり、調査 B は cycle-191 失敗の構造的原因記録として AP-P11 発火事例として将来も参照価値がある。`docs/research/` 昇格は妥当。**Pass**。
- **B-4（計画書のサイズと運用R6）**: 576 行（r3 時点）。レビュー履歴セクション（L274-550 = 277 行）を除いた純粋計画本体は約 273 行で運用R6 と整合。**Pass**（軽微指摘 r3-MIN-2）。
- **B-5（AP-P11 / AP-P16 / AP-P17 / AP-P20 の能動発火）**: 補足事項セクション（L556-563）で 4 AP すべての発火対象が明示されている。AP-P11（9 コンポーネント復元しない、cycle-194 確定継承）、AP-P16（一次情報確認 = robots.ts 文字列 / 配列の実体確認、L24 / L154）、AP-P17（3 案以上比較 = T-1 / T-2 / T-2 補助 / T-3 / T-4 で計 5 つの 3〜4 案比較表）、AP-P20（過度な実装詳細を書かない、補足事項 L563 で明示）。r2 対応で新設された T-2 補助判断 3 案表もこの基準を満たす。**Pass**。
- **B-6（「やらないこと」リストの完全性）**: T-1（L90-94）/ T-2（L110-115）/ T-3（L139-143）/ T-4（L164-168）の 4 箇所に「やらないこと」が網羅。r1 / r2 対応で弱体化していない。cycle-191 失敗の構造的原因（TileVariant 再導入 / コンポーネント参照型契約埋め込み / メタ型必須フィールド追加 / 入出力 placeholder 先行定義 / 個別タイル実装 / Phase 9 dictionary / Phase 8 cheatsheets / N≥1 件数サニティ）がすべて明示禁止。**Pass**。
- **B-7（T-1〜T-6 の依存関係と作業順序）**: r2 対応で実装順が「T-6a → T-1 → T-2 → T-3 → T-4 → T-5 → T-6b」に変更。依存関係チェック: (1) T-6a は計画書 / 正本の整合化のみで他 T に影響を与えず先行可能、(2) T-1（サイズ定数）は T-2 / T-3 / T-4 のいずれも参照しないので順序自由（早めに片付ける合理性あり）、(3) T-2（型契約）は T-3（レジストリが型契約を export する）の前提、(4) T-3（レジストリ）は T-4（hidden ルートがレジストリ API を呼ぶ）の前提、(5) T-5 は最終検証、(6) T-6b は副次的。**依存関係は整合**。**Pass**。
- **B-8（検証方法）**: 各 T の検証手段（T-1: tsc + vitest + next build / T-2: tsc / T-3: tsc + vitest + next build / T-4: next build + curl or Playwright / T-5: lint + format:check + test + build）が成果物性質と整合。r2 対応で `robots.txt` Disallow 確認が完了基準 3（L68）に明示され、検証手段が手段不問（curl / fetch / Playwright）扱いに整理（r2-MIN-3 で軽微指摘済、本サイクルでは未対応で許容範囲）。実タイル 0 件のため Playwright 視覚検証は本 Phase 必須化されない判断も Phase 8 第 1 弾サイクルへの移管が明示されており妥当。**Pass**。
- **B-9（design-migration-plan.md との整合）**: 完了基準（L60-69）が L126 を引用 + 本サイクル固有 5 基準を明示。スコープ境界（「本 Phase に含めないもの」L119-124）が計画書側の「やらないこと」と整合。T-6a で正本の L104 / L142 / L110（前後半）を訂正することで実装後の整合も担保される設計。Phase 10.4 への入出力 placeholder 移管が Phase 10.4 セクション本体（L221）と整合（B-1 で確認済）。**Pass**。
- **B-10（次サイクル PM への可読性）**: 「実施する作業」L20-28 のチェックリスト 7 行に T-1〜T-6 + 終了時チェックリストの全体像が圧縮されている。各 T の詳細は「作業内容」L72-191 で参照可能。完了基準（L60-69）が独立サブセクションとして明示。補足事項（L556-563）で「やらないこと」サマリと AP 発火対象が再掲。次サイクル PM が **「実施する作業」L18-41 + 「完了基準」L60-69 + 「補足事項」L556-563 の 3 ブロック（合計 約 50 行）を Read すれば「何を着手し、何を着手しないか」が即座に判別可能**。**Pass**。

##### C. r1 / r2 指摘の最終確認

- **C-r1-CRIT-1〜5 / IMP-1〜5 / MIN-1〜6 の解消確認**:
  - r1-CRIT-1（props 型矛盾）: T-2 補助判断 3 案比較（L219-225）で方針A 採用、L23 / L101 / L106 が一貫。Read で確認 → **解消**。
  - r1-CRIT-2（L104 入出力 placeholder 不整合）: T-6a で訂正必須化、L142 まで波及済（r2-CRIT-2 対応）。**解消**。
  - r1-CRIT-3（配置先未確定）: L88（L87 ではなく L88 が実数値）で `src/lib/toolbox/tile-grid.ts` 確定 + 3 点の論理根拠明示。**解消**。
  - r1-CRIT-4（`./tmp/cycle-194-hand-off.md` 参照）: L32 / L46 / L226 から撤去、`docs/research/` への昇格と参照書き換え済（r2-CRIT-1 対応）。**解消**。
  - r1-CRIT-5（サニティチェック自己矛盾）: L24 / L128-129 / L142-143 / L243 の 4 箇所で記述統一。**解消**。
  - r1-IMP-1（hidden ルート物理パス未確定）: L25 / L151 で `src/app/(new)/internal/tiles/page.tsx` 確定。**解消**。
  - r1-IMP-2（robots.ts disallow 構造誤記）: L25 / L155 で「文字列 `"/api/"` → 配列 `["/api/", "/internal/"]`」明示。**解消**。
  - r1-IMP-3（T-2 比較表の optional 中間案抜け）: L210 で案 A'（optional 統合）追加、4 案比較化。**解消**。
  - r1-IMP-4（実施する作業 / 作業計画スコープ不一致）: L23 にサイズ仕様型 + タイルコンポーネント型エイリアス追記。**解消**。
  - r1-IMP-5（完了基準明記なし）: L60-69 完了基準サブセクション新設。**解消**。
  - r1-MIN-1〜MIN-6: r1 対応セクション L421-423 で「任意対応で本ラウンドでは未対応」と明記、r2 / r3 でも残置許容。r1-MIN-3 は副次的に解消済。残置の MIN-1 / MIN-2 / MIN-4 / MIN-5 / MIN-6 は本サイクル全体への影響軽微で許容。**運用上 Pass**。
- **C-r2-CRIT-1〜3 / IMP-1〜3 / MIN-1〜3 の解消確認**:
  - r2-CRIT-1（`tmp/research/` 参照残存）: 観点 A-r2-CRIT-1 で実測確認済 → **解消**。
  - r2-CRIT-2（L142 訂正漏れ）: 観点 A-r2-CRIT-2 で確認済 → **解消**。
  - r2-CRIT-3（L110 後半 `:export` 言及訂正漏れ）: 観点 A-r2-CRIT-3 で確認済 → **解消**。
  - r2-IMP-1（L235 サニティチェック表記衝突）: 観点 A-r2-IMP-1 で確認済 → **解消**。
  - r2-IMP-2（T-6 スコープ複雑化）: 観点 A-r2-IMP-2 で確認済 → **解消**。
  - r2-IMP-3（T-6 を最後に置くリスク）: 観点 A-r2-IMP-3 で確認済 → **解消**。
  - r2-MIN-1（計画書サイズ拡大）: r3-MIN-2 として継続軽微指摘。許容範囲。
  - r2-MIN-2（r1-MIN 一部未対応）: 任意対応継続。許容範囲。
  - r2-MIN-3（完了基準と検証手段の表現整合）: 任意対応継続。許容範囲。

#### 総合判定

**Pass**（承認）

- Critical 0 件 / Important 0 件 / Minor 3 件（いずれも任意対応で本サイクル Done に必須でない）。
- r2 指摘の Critical 3 件 / Important 3 件すべてが完全解消されていることを実測確認。
- r1 指摘 Critical 5 件 / Important 5 件すべてが完全解消されていることを実測確認。
- 計画スコープ・依存関係・正本との整合・次サイクル PM への可読性のいずれも妥当。
- AP-P11 / AP-P16 / AP-P17 / AP-P20 の能動発火が維持されており、cycle-191/192/193 で発生した「タイル基盤 + 詳細移行の同時実施」型失敗・「AI 過去判断を変更不可制約として扱う」型失敗・「単案で計画化」型失敗・「過度な実装詳細」型失敗のいずれも構造的に予防されている。

**次の /cycle-execution に進んでよい**。r3-MIN-1〜MIN-3 はいずれも実装着手の障害にならず、cycle-execution 中または将来サイクルで余裕があれば対応する任意項目。

---

#### 判定: 承認

## キャリーオーバー

<!-- サイクル完了時に記入する。 -->

## 補足事項

cycle-191/192/193 の 3 連続失敗（全コード revert）の構造的原因が cycle-194 で「Phase 7 のスコープ過大化」と認定された経緯を踏まえ、本サイクルでは以下の歯止めを徹底する：

- **スコープ厳守**: 「Tile コンポーネント本体」「個別ツールの詳細ページ移行」「個別タイル実装」は本サイクル対象外。これらは Phase 8 各サイクルの責務。
- **AP-P11 発火**: cycle-191 で実装された 9 コンポーネント（AccordionItem / PrivacyBadge / ResultCopyArea / ToolDetailLayout / IdentityHeader / TrustSection / LifecycleSection / ToolInputArea / useToolStorage）は cycle-193 で全 revert 済み。これらを「Phase 7 で復元する」判断は本サイクルでは行わない（cycle-194 で 9 コンポーネントを Phase 7 から分離する判定が確定済み）。
- **AP-P17 発火**: 実装方式（型契約の置き場所、レジストリの集約方法、検証ルートのパス）はゼロベースで 3 案以上比較してから決定する。
- **AP-P20 発火**: 計画書側に過度に具体的な実装詳細を書かない。サブタスクのインタフェース定義（7.1 / 7.2 / 7.3）は design-migration-plan.md に既に書かれている水準を超えない。

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
