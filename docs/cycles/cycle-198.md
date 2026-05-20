---
id: 198
description: B-426（タイル基盤実装 / 移行計画 Phase 7）への再着手。cycle-191/192/193/195 の 4 連敗からの再挑戦で、Phase 8（B-314）の前提となる Phase 7 をやり切ることを目指す。
started_at: 2026-05-20T23:07:39+0900
completed_at: null
---

# サイクル-198

このサイクルでは、`docs/design-migration-plan.md` の Phase 7（タイル基盤実装、B-426）に再着手する。cycle-191/192/193/195 で 4 連続失敗しており、cycle-197 の振り返りでも「cycle-198 は Phase 7 または Phase 8 に戻る」と方向確定している。Phase 8（B-314 = ツール・遊び詳細ページの新デザイン移行 + タイル化）はこの Phase 7 完了を前提としているため、ここをやり切らないと Phase 8 以降には進めない構造になっている。

cycle-197 振り返りで明示された必須前提に従う:

1. `docs/design-migration-plan.md` Phase 2.2 / Phase 7.1 / Phase 8.1 を PM 自身が直接 Read する（過去サイクルの解釈を経由しない）
2. Phase 2.2 の 3 形態想定（1 対 1 / 1 対多 / 複数バリエーション）を型契約に反映する（cycle-195 のように 1 形態に絞らない）
3. Phase 7.1 の「入出力 placeholder 等」要件を Phase 7.1 のスコープに含める
4. Phase 8.1 #3 が各サイクルで (a)/(b)/(c) いずれかを採れる前提を codegen 規約で表現する
5. robots.txt には hidden URL を載せない（cycle-175 / cycle-195 同型事故防止）

また `docs/cycles/cycle-195.md` 事故報告 A-1〜A-6 を `/cycle-planning` 段階で直接 Read してから着手計画を立てる。

## 実施する作業

- [x] `/cycle-planning` で作業計画を立てる。その際、以下を必ず planner が PM 自身で直接 Read してから計画する:
  - [x] `docs/design-migration-plan.md` の Phase 2.1 / Phase 2.2 / Phase 7.1 / Phase 7.2 / Phase 7.3 / Phase 8.1（過去サイクル解釈を経由しない）
  - [x] `docs/cycles/cycle-195.md` の事故報告 A-1〜A-6
  - [x] `docs/cycles/cycle-191.md` / `cycle-192.md` / `cycle-193.md` の事故報告・キャリーオーバー
  - [x] 現存している成果物（cycle-195 で保存された `src/lib/toolbox/tile-grid.ts` の物理定数、`src/app/globals.css` の CSS Custom Properties、`src/app/robots.ts` のコメント等）の実体を Read で確認
- [x] B-426 = Phase 7 のスコープを「再着手必須前提 (i)〜(v) を踏まえた最小実装」として再定義する
- [x] サイクル内で完了可能な単位までスコープを絞り込む（一括で全 Phase 7 をやろうとして膨張させない）
- [ ] `/cycle-execution` で実装する（T-2 型契約 → T-3 codegen → T-4 hidden ルート → T-5 全体検証）
- [ ] `/cycle-completion` で完了させる

## 作業計画

### 目的

#### 誰のために / 何の価値を提供するか

- **直接受益者（このサイクル単体）**: 次サイクル以降の PM（Phase 8 着手者）。Phase 7 を完遂することで、停滞している Phase 7 → Phase 8 → Phase 10 → 道具箱公開のラインが動き出す。
- **本来の受益者（来訪者）**: `docs/targets/` の M1a（特定の作業に使えるツールをさっと探している人）/ M1b（気に入った道具を繰り返し使っている人）。本サイクル単体では来訪者から見える変化はない。「日常の傍にある道具」というコンセプトの土台を 5 サイクル目の挑戦で完成させる前提条件。
- **失敗の連鎖を断ち切ること自体の価値**: cycle-191/192/193/195 の 4 連敗で「Phase 7 = 鬼門」化している。スコープを正本に厳密に合わせきり 1 サイクルで Done にすることで、この連鎖を断つ。

#### 完了基準

正本 `docs/design-migration-plan.md` L126 を引用：「7.1〜7.3 が実装され、`tsc` と vitest テストが通る。Phase 8 で各コンテンツがこの規格に従ってタイル定義を埋められる状態」。

本サイクル固有の判定基準（既存成果物との差分）：

1. **3 形態 ((a)/(b)/(c)) を表現可能な型契約が存在する**：Phase 8 第 1 弾 PM が「1 ツール = 複数タイル」「複数バリエーション」のどれを採っても、本サイクル成果物の型エイリアス / インタフェースだけで表現できる。
2. **「入出力 placeholder 等」のフィールド枠が型契約に存在する**：Phase 7.1 L104 明記要件。実機構（Phase 10.4）は本サイクル対象外。「型として placeholder が表現できる」までを満たす。
3. **タイル定義収集 codegen 拡張が存在する**：タイル定義 0 件でも `tsc` / vitest / `next build` が通る。Phase 8 で 1 件目のタイル定義ファイルが置かれたら自動収集される。
4. **hidden 検証ルート枠が存在する**：`/internal/tiles` のページ枠（中身は「タイル未登録」相当の最小表示でよい）。robots.txt には `Disallow: /internal/` を書かない（cycle-175 / cycle-195 同型事故防止）。
5. **正本 `design-migration-plan.md` を本サイクルで書き換えていない**：cycle-195 A-3 の越権行為（正本側を改変して整合を取る）を再発させない。本サイクル内の判断はすべて正本と整合する形で完結させる。
6. **検証コマンド**: `npm run lint && npm run format:check && npm run test && npm run build` の 4 コマンドが全成功。Playwright での視覚検証は実タイル不在のため本 Phase 対象外（正本 L117 明記）。

### スコープ確定

#### 含めるもの（本サイクル）

- **Phase 7.1 = タイル登録の型契約**
  - 3 形態 ((a)/(b)/(c)) を表現可能な「タイル ID」概念を型レベルで導入する。「1 slug = 1 タイル」前提を取らない。具体的なフィールド名 / 命名は実装エージェントに委ねる。
  - 「サイズ仕様」「タイルコンポーネント型エイリアス」「入出力 placeholder 等」のフィールド枠（型のみ）を 1 ファイルに集約する。
  - 既存 `Tileable` 型 / `toTileable()` adapter / 既存 `TileComponentProps` / 既存 `getTileComponent(slug)` は **そのままに保つ**（後方互換）。本サイクルで新規追加するのは「タイル定義（TileDefinition 相当）」という別レイヤー。既存の「コンテンツ indexer 用 Tileable」とは責務が異なる。
- **Phase 7.3 = レジストリ + hidden 検証ルート**
  - 既存 `scripts/generate-toolbox-registry.ts` を拡張し、コンテンツディレクトリにオプショナルなタイル定義ファイル群（複数ファイルを許容）が存在する場合に収集する。タイル定義 0 件を許容。
  - レジストリ公開 API（`registry.ts`）に「タイル定義一覧」を取得する関数を追加する。
  - `/internal/tiles` の hidden ルート枠を `src/app/(new)/internal/tiles/page.tsx` に新設し、`metadata.robots = { index: false, follow: false }` を export する。本サイクルではタイル定義が 0 件なので「タイル未登録」相当の最小表示。
- **Phase 7.1 / 7.3 のための単体テスト（vitest）**：型レベル + 関数単体テストのみ。

#### 含めないもの（本サイクル）

- Phase 7.2（サイズ枠定数）：cycle-195 で残存している `tile-grid.ts` + `globals.css` Custom Properties で既に完成済。差分なし。
- 個別タイル本体の実装：Phase 8 各サイクルの責務。
- ダッシュボード本体 / DnD / 編集モード / Undo / モーダル / 多タイル管理機構：Phase 10 の責務。
- タイル間入出力連携の **実機構**：Phase 10.4 の責務。本サイクルは型枠（フィールドの存在）のみ。
- robots.txt への `/internal/` 追記：cycle-175 / cycle-195 の確立済方針により書かない（noindex meta + ナビ動線なしで隠す）。
- `ToolMeta` / `PlayContentMeta` / `GameMeta` / `QuizMeta` への必須フィールド追加：タイル定義は別ファイル経由でメタ型本体は触らない。
- 正本 `design-migration-plan.md` の改変：本サイクル判断はすべて正本と整合する形で完結させる（cycle-195 A-3 防止）。

#### スコープから外したものを Phase 7 のどのサイクルで仕上げるか

本サイクルで Phase 7（7.1 / 7.3）はすべて Done にする。続く Phase 8 第 1 弾サイクルで「最初のタイル定義ファイルを 1 件置く」ことで初めて codegen 集約が機能する状態を作る（assertMinCount ≥1 への昇格は Phase 8 第 1 弾 PM の責務）。Phase 7 自体に追加サブサイクル（B-XXX）は起票しない。

### 作業内容

#### T-1: 既存成果物の Read 確認 + 型契約スコープの確定（プランナー = 自分が完了済）

cycle-198 計画立案にあたり以下を Read 済（再掲）：

- 正本 `docs/design-migration-plan.md` 全文（Phase 2.1 / 2.2 / 7.1 / 7.2 / 7.3 / 8.1 / 10.4 該当）
- `docs/cycles/cycle-195.md` A-1〜A-6 / §D 申し送り
- 現存成果物：`src/lib/toolbox/{types,tile-grid,tile-loader,FallbackTile,registry}.ts`、`src/lib/toolbox/generated/toolbox-registry.ts`、`src/lib/toolbox/__tests__/types.test.ts`、`src/app/robots.ts`、`scripts/generate-toolbox-registry.ts`
- `docs/anti-patterns/planning.md`（AP-P11/16/17/20）

#### T-2: タイル定義の型契約整備（Phase 7.1）

**アウトプット**：

- 新規 1 ファイル（配置先候補：`src/lib/toolbox/` 配下、ファイル名は実装エージェント判断）に以下を集約する：
  - **タイル定義インタフェース**：1 ツール / 1 遊びに対して 0 個以上のタイル定義をひも付けられる構造。タイル定義は固有 ID（タイル ID）を持ち、parent slug（所属コンテンツの slug）を参照する。**1 slug : N タイル定義** の関係を型レベルで表現する（形態 (b)(c) 対応）。
  - **タイルサイズ仕様**：`colSpan` / `rowSpan` 相当の整数フィールドを持つインタフェース。Phase 7.2 `tile-grid.ts` の `tileSizeStyle(w, h)` 引数と意味的に対応させる（実装エージェントが命名 / フィールド名を選択）。
  - **タイルコンポーネント型エイリアス**：正本 Phase 7.1 L101「TileComponent」を一級型エイリアスとして固定する。既存 `tile-loader.ts` の `TileComponentLoader` / `TileComponentProps` を再利用してよい（新規 props 型は作らない）。
  - **入出力 placeholder 等のフィールド枠**：正本 Phase 7.1 L104 明記要件。型として「タイル間連携で用いる入出力 placeholder の宣言枠」を表現できる構造を作る。**実機構（Phase 10.4）は本サイクル対象外**だが、型枠が存在しないと Phase 8 でタイル定義を書くときに「placeholder を入れるべき場所が型上にない」状態になる。具体的なフィールド名 / 構造（optional フィールド or 別インタフェース）は実装エージェントが選択する。
- 既存 `Tileable` / `toTileable()` / `TileComponentProps` / `getTileComponent(slug)` は **そのまま保つ**。本サイクルで導入する「タイル定義」は別レイヤー（責務が異なる：indexer vs 配置定義）。
- 型レベルの単体テスト（vitest）：3 形態 ((a)/(b)/(c)) のそれぞれを表現する型レベルのフィクスチャが「型エラーなく書ける」ことをテストとして書く（実体値は最小限のスタブ）。テストファイルは `src/lib/toolbox/__tests__/` 配下。

**判断は実装エージェントに委ねる事項**：

- ファイル名（例: `tile-definition.ts` 等）。**cycle-195 で `tile-types.ts` が汚染認定済**のため同名は避ける（A-3 違反の再生産になる構造的リスクではないが、git 履歴上の混乱回避のため）。
- 型エイリアス vs インタフェース vs union type の選択（coding-rules §5 に従い interface 優先）。
- 「タイル ID」の表現（string / branded type / template literal type）。
- 「入出力 placeholder」フィールドの構造（optional フィールド or sub-interface）。

**やらないこと**：

- `ToolMeta` / `PlayContentMeta` / `GameMeta` / `QuizMeta` の改変。
- 既存 `Tileable` 型 / `toTileable()` adapter の改変。
- variantId / バリアント識別子の禁止：cycle-179 サブ判断 3-a を所与にしない。3 形態のうち (c) 複数バリエーションを「タイル ID 1 個ずつで分離」で表現するか、「親 1 個 + バリエーション識別子」で表現するかは実装エージェント判断（**ただし変更可能であることを認識した上で選択**、AP-P11 への対処）。
- 入出力 placeholder の実機構実装：型枠のみ。

**検証**：`tsc` + vitest（型レベル fixture テスト）。

#### T-3: codegen 拡張（Phase 7.3 レジストリ）

**アウトプット**：

- 既存 `scripts/generate-toolbox-registry.ts` を拡張：各コンテンツディレクトリ（`src/tools/{slug}/` / `src/play/{games|quiz|fortune}/{slug}/` 等）から「タイル定義ファイル群」（複数ファイル / 0 件を許容）を fast-glob で発見し、生成ファイルに集約する。
- 集約先：`src/lib/toolbox/generated/` 配下に新規生成ファイル 1 つ（既存 `toolbox-registry.ts` とは別ファイルが望ましい：責務分離 + git diff 最小化。実装エージェント判断）。
- 既存 `registry.ts` 経由で公開 API（タイル定義一覧を返す関数）を追加。
- 既存 `assertMinCount("tools", _, 10)` パターンに揃え、**タイル定義は ≥0 を許容**（≥1 強制を本サイクルで導入しない、cycle-195 CRIT-5 確定方針継承）。Phase 8 第 1 弾サイクルが ≥1 への昇格判断を行う。
- 関連 vitest 単体テスト：codegen 出力（`buildTileDefinitionsContent` 相当の pure function）の単体テスト。

**判断は実装エージェントに委ねる事項**：

- タイル定義ファイル名規約（`tile.ts` 単数 / `tiles.ts` 複数 / `*.tile.ts` パターン等）。**「1 slug = 1 tile.ts 単数形」は形態 (b)(c) を表現できないため避ける**。複数タイル定義を 1 ファイルから export する形（例：`export const tiles: TileDefinition[]`）または複数ファイル glob のいずれかを選択する。
- play 配下のディレクトリ規約（games / quiz / fortune がさらに分かれる構造）への対応方針。

**やらないこと**：

- 既存 `toolsBySlug` / `allToolMetas` / `getAllToolSlugs` 等の破壊的変更。
- cheatsheets / dictionary のタイル定義（Phase 9.2 / 9.3 のスコープ）。
- `assertMinCount(tileDefinitions, 1)` の本 Phase 内追加。

**検証**：`tsc` + vitest + `next build`。

#### T-4: hidden 検証ルート枠の整備（Phase 7.3 検証ルート部分）

**アウトプット**：

- `src/app/(new)/internal/tiles/page.tsx` を新設。server component を保ち、`metadata.robots = { index: false, follow: false }` を export する（既存 `(new)/storybook` パターンと整合）。
- T-3 のレジストリ API からタイル定義一覧（空配列）を取得し、空状態の最小表示（「タイル未登録」相当）を行う。Phase 8 第 1 弾サイクルで内容が拡張される前提。
- インタラクティブ部分が必要なら子 client component に分離（既存 `(new)/storybook/StorybookContent.tsx` パターン）。
- **`robots.ts` には何も追記しない**：cycle-175 / cycle-195 確立済方針に従い、`/internal/` を robots.txt に書かない（書くと公開ファイルから URL が漏れて逆効果）。
- 関連テスト：必要に応じて bundle-budget テストの whitelist 確認（既存 `src/__tests__/bundle-budget.test.ts`）。実装エージェントが既存テストの動作を確認し、必要なら追加。

**判断は実装エージェントに委ねる事項**：

- 空状態時の表示文言。
- 一覧の表示形式（タイル定義 0 件の本サイクルでは最小）。

**やらないこと**：

- robots.txt への `/internal/` 追記。
- 個別タイルのレンダリング検証（タイル本体不在）。
- グリッドレイアウト / DnD / 編集モード（Phase 10）。

**検証**：`next build`（ルートが正しく生成される）+ レスポンス HTML に `<meta name="robots" content="noindex, nofollow">` が含まれることを確認（Playwright 任意、必須は build と型のみ）。

#### T-5: 全体検証

T-2〜T-4 完了後、`npm run lint && npm run format:check && npm run test && npm run build` の 4 コマンドを通過させる。`generate-toolbox-registry.ts` は `prebuild` / `predev` / `pretest` で実行されるため、生成物の git 上の状態と生成スクリプトの実行結果が一致することも確認する（既存方針継承）。

### 検討した他の選択肢と判断理由

#### 判断 A: 3 形態をどう型契約で表現するか（中核判断）

| 案                                             | 概要                                                                             | 採否       | 理由                                                                                                                                                                                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A-1: 1 slug = 1 タイル**（cycle-195 採用案） | `TileDefinition` が slug を一意キーとして持つ。1 ツールに 1 タイルのみ           | **不採用** | 正本 Phase 2.2 L49 が明記する 3 形態のうち (b)(c) を表現不可能。cycle-195 で全 revert に至った中核違反。                                                                                                                                                         |
| **A-2: 「タイル ID」で 1:N 表現（採用候補）**  | 各タイル定義が独立した tile ID を持ち、parent slug を参照。1 slug : N タイル定義 | **採用**   | (b) は「親 slug 1 個 + タイル ID 複数」、(c) は「同 slug の異なる variation を別 tile ID で並列」、(a) は「1 slug : 1 tile ID」として 3 形態すべて自然に表現可能。cycle-195 申し送り §D-6 と整合。                                                               |
| A-3: variant 識別子内包型                      | `TileDefinition` が `variantId?` を持ち、同一 slug で variant を区別             | 不採用     | (b)(c) は表現できるが、「タイル ID」案より概念が増える（slug × variantId の複合キー）。Phase 10 でダッシュボード本体が「タイル個別の配置情報」を保存するときに「キーは何か」が複雑化（slug or slug+variantId の場合分け）。「タイル ID」案ならキーが単一になる。 |
| A-4: union type で 3 形態を別型として分離      | 形態 (a)(b)(c) ごとに別 interface を作り union で結合                            | 不採用     | 形態を計画段階で確定させてしまい、Phase 8 各サイクルで「途中で形態を変える」「同時に複数形態」が表現しづらい。型分岐の判定コードも増える。「タイル ID」案ならフラットに扱える。                                                                                  |

**判断**: A-2「タイル ID で 1:N 表現」を採用。フィールド名 / branded type 化等の細部は実装エージェント判断。

#### 判断 B: 入出力 placeholder のスコープ

| 案                                                           | 概要                                                                                              | 採否     | 理由                                                                                                                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B-1: 型枠を本サイクル含める、実機構は Phase 10.4**（採用） | 型レベルで「入出力 placeholder を宣言できるフィールド」を持つが、DnD 連携 / API 実装は Phase 10.4 | **採用** | 正本 Phase 7.1 L104 が明示する責務分離。cycle-195 が先送りして A-3 越権行為に至った経緯あり、再発防止。                                                                           |
| B-2: 型枠も実機構も Phase 10.4 で一括                        | 本サイクルは type だけ最小限、placeholder は Phase 10.4 で型 + 実機構を一括                       | 不採用   | 正本 L104 を書き換える必要が出る（cycle-195 A-3 と同型）。Phase 8 で各タイル定義を書くときに「placeholder の置き場所が型上にない」状態になり Phase 8 各サイクルでの型変更が連鎖。 |
| B-3: 型 + 簡易実機構を本サイクルに含める                     | 本サイクルで「入出力 placeholder 宣言 → ダッシュボードがそれを読む」までを実装                    | 不採用   | スコープ膨張（4 連敗の核心パターン）。実機構は実タイルが揃った Phase 10.4 で観察 → 実装が妥当。                                                                                   |

**判断**: B-1。

#### 判断 C: 検証ルートの作り方

| 案                                           | 概要                                     | 採否     | 理由                                                                                                           |
| -------------------------------------------- | ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| **C-1: `(new)/internal/tiles/`（採用）**     | `(new)` Route Group 配下に hidden ルート | **採用** | 既存 `(new)/storybook/` の noindex メタパターンと完全整合。Phase 11.2 の `(legacy)` 撤去フローと干渉しない。   |
| C-2: `(legacy)/internal/tiles/`              | legacy 側に置く                          | 不採用   | Phase 11.2 で legacy ごと削除される予定。検証ルートが消える。                                                  |
| C-3: 別 Route Group `(internal)/tiles/` 新設 | 専用 Route Group                         | 不採用   | 既存 storybook が `(new)` 配下にあり、別 Route Group 新設の正当性が薄い。layout.tsx 等の重複コストのみ増える。 |

**判断**: C-1。

#### 判断 D: robots.txt の取扱い

| 案                                                           | 概要                                                                          | 採否     | 理由                                                                                                                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D-1: robots.txt に書かない、noindex meta のみ（採用）**    | `/internal/tiles` を robots.txt に載せず、ページの metadata.robots で noindex | **採用** | cycle-175 commit `44f32754` で確立済方針。cycle-195 でこれに違反した「二重防御」が事後修正コミット必要となった。本サイクルでも同方針継続。                       |
| D-2: robots.txt の disallow に `/internal/` 追記             | meta + robots.txt の二重防御                                                  | 不採用   | robots.txt は公開ファイル。disallow に書くと URL が漏れて逆効果。Google の挙動「Disallow があると noindex を読めない」もリスク（cycle-195 事故後修正で確認済）。 |
| D-3: robots.txt の disallow に書き、ページの metadata は通常 | robots.txt のみで隠す                                                         | 不採用   | D-2 と同じ問題 + ページ自体に noindex がないので、robots.txt から外したときに即時公開リスクあり。                                                                |

**判断**: D-1。`src/app/robots.ts` には何も変更を加えない（cycle-195 で残存している cycle-175 事故防止コメント部分はそのまま）。

#### 判断 E: 本サイクルのスコープ切り分け

| 案                                           | 概要                                                    | 採否     | 理由                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E-1: 7.1 + 7.3 を本サイクル一括（採用）**  | 7.2 は完成済のため、残る 7.1 + 7.3 を 1 サイクルで Done | **採用** | 7.1（型契約）と 7.3（codegen + hidden ルート）は内容的に密に連携（codegen が型を import する）。分割する意味が薄い。「Phase 7 を 5 サイクル目に挑む」前提でこれ以上分割すると Phase 8 開始がさらに遅れる。スコープ膨張リスクは判断 B-1 / D-1 で抑える。 |
| E-2: 本サイクルは 7.1 のみ、7.3 は次サイクル | 型契約だけで一旦区切る                                  | 不採用   | 7.3 を分けると hidden ルートが Phase 8 第 1 弾サイクル開始時にも存在しない状態になり、Phase 8 で「タイル単独表示検証 → そもそも検証ルートが無い」と気付いて手戻り。codegen も 7.1 と分けるとレジストリ API を未確定のまま Phase 8 着手することになる。  |
| E-3: 本サイクルは 7.3 のみ、7.1 は次サイクル | 既存 Tileable を使い続けて codegen を先に拡張           | 不採用   | 既存 Tileable は 1:N 表現できないため、codegen 拡張する型が無い。順序として 7.1 → 7.3。                                                                                                                                                                 |

**判断**: E-1。

### 計画にあたって参考にした情報

- `/mnt/data/yolo-web/docs/design-migration-plan.md`（Phase 2.1 / 2.2 / 7.1 / 7.2 / 7.3 / 8.1 / 10.4 該当箇所、全文 Read 済）
- `/mnt/data/yolo-web/docs/cycles/cycle-195.md`（事故報告 §A-1〜§A-6 + §D 次サイクル PM 申し送り Read 済）
- `/mnt/data/yolo-web/src/lib/toolbox/types.ts`（既存 Tileable 型 / toTileable adapter）
- `/mnt/data/yolo-web/src/lib/toolbox/tile-loader.ts`（既存 TileComponentProps / TileComponentLoader / getTileComponent）
- `/mnt/data/yolo-web/src/lib/toolbox/tile-grid.ts`（Phase 7.2 完成済成果物）
- `/mnt/data/yolo-web/src/lib/toolbox/registry.ts`（既存公開 API）
- `/mnt/data/yolo-web/src/lib/toolbox/FallbackTile.tsx`（既存フォールバック表示）
- `/mnt/data/yolo-web/src/lib/toolbox/generated/toolbox-registry.ts`（既存 codegen 出力）
- `/mnt/data/yolo-web/src/lib/toolbox/__tests__/types.test.ts`（既存 vitest 規模感参考）
- `/mnt/data/yolo-web/scripts/generate-toolbox-registry.ts`（既存 codegen スクリプト）
- `/mnt/data/yolo-web/src/app/robots.ts`（cycle-175 事故防止コメント残存箇所）
- `/mnt/data/yolo-web/docs/anti-patterns/planning.md`（AP-P11 / P16 / P17 / P20）
- `/mnt/data/yolo-web/.claude/rules/coding-rules.md`（interface 優先 / マジックナンバー回避 / 型安全）
- `/mnt/data/yolo-web/.claude/rules/testing.md`（vitest + jsdom + **tests**/ 配置）

## レビュー結果

<作業完了後、別のサブエージェントにレビューさせ、改善項目が無くなるまで改善とレビューを繰り返す。ここには、そのレビューの回数や指摘事項・対応結果などを記載する。>

### レビュー r1 (2026-05-20)

#### Pass / Fail 判定: Pass

#### 観点別所見

##### 観点 1: 原典との整合性

reviewer 自身が以下を直接 Read した上で照合：

- `docs/design-migration-plan.md` 全文（特に Phase 2.1/2.2/7.1/7.2/7.3/8.1/10.4）
- `docs/cycles/cycle-195.md` §A-1〜§A-6 と §D（L1〜L163）
- 現存成果物 `src/lib/toolbox/{types,tile-loader,registry}.ts`、`src/app/robots.ts`、`scripts/generate-toolbox-registry.ts`（冒頭部）
- `docs/anti-patterns/planning.md` AP-P11/16/17/20

照合結果：

- **Phase 2.2 L49 の 3 形態 ((a)/(b)/(c))**: 計画書 判断 A は A-2「タイル ID で 1:N 表現」を採用し、(a)「1 slug : 1 tile ID」/ (b)「親 slug 1 個 + タイル ID 複数」/ (c)「同 slug の異なる variation を別 tile ID で並列」のそれぞれを表現する道筋が L181 に明示されている。さらに完了基準 (1) で型レベル fixture テストでの検証を要求しており、cycle-195 A-3 違反（1 slug = 1 タイル前提）の再発防止として実効的。Yes（整合）。
- **Phase 7.1 L104「入出力 placeholder 等」**: 計画書 判断 B-1（採用）/ T-2 アウトプット (L104) / 完了基準 (2) で「型枠を本サイクルに含める / 実機構は Phase 10.4」という責務分離が明示。正本 L104 と Phase 10.4 の責務分担と完全に一致。cycle-195 が先送りして A-3 越権行為に至った経緯への直接の対処になっている。Yes（整合）。
- **cycle-175 robots.txt 運用方針**: 判断 D-1（採用）で「robots.txt に書かない、noindex meta のみ」と明記。cycle-175 commit `44f32754` を根拠引用しており、現存する `src/app/robots.ts` L10-14 のコメント（cycle-175 事故防止記述）とも整合。T-4「やらないこと」にも「robots.txt への `/internal/` 追記」が明示。Yes（整合）。
- **正本書き換え禁止（cycle-195 A-3 再発防止）**: 完了基準 (5) と「含めないもの」L79 で「正本を本サイクルで書き換えていない」が明示。git diff `docs/design-migration-plan.md` で機械検証可能。Yes（整合）。
- **Phase 8.1 #3 が (a)(b)(c) いずれかを採れる前提**: 判断 A-2 採用により codegen 規約が「1 slug : N タイル定義」を許容するため、Phase 8 各サイクルが 3 形態のどれを採っても表現可能。T-3 で「`{slug}/tile.ts` 単数形は形態 (b)(c) を表現できないため避ける」と禁止条件を明記。Yes（整合）。

##### 観点 2: スコープ膨張防止

- **T-2 / T-3 / T-4 の粒度**: T-2 = 新規 1 ファイル + fixture テスト、T-3 = 既存 codegen スクリプト 1 つの拡張 + 出力ファイル 1 つ + テスト、T-4 = page.tsx 1 ファイル新設のみ。1 サイクル内で完了可能な粒度に収まっている。
- **「やらないこと」の具体性**: 各 T セクションに「やらないこと」が箇条書きで列挙されており、特に T-2 で `ToolMeta` 等メタ型本体改変禁止、既存 `Tileable` 改変禁止、実機構実装禁止が明示されている。cycle-195 で曖昧だった点が具体化されている。
- **既存成果物保持**: 既存 `Tileable` / `toTileable()` / `getTileComponent(slug)` をそのまま保つ（責務分離：indexer vs 配置定義）と明示。実際の `src/lib/toolbox/types.ts` / `tile-loader.ts` / `registry.ts` を Read で確認した限り、新規追加レイヤーが既存と干渉しない構造で、保持可能。
- **判断 E の妥当性**: 7.1 と 7.3 を一括する根拠（密連携・分割の意義薄・Phase 8 開始遅延回避）が示されており、スコープ膨張リスクは判断 B-1 / D-1 で抑える設計。妥当。

##### 観点 3: 判断のゼロベース性

- **判断 A**: 4 案を列挙。「cycle-195 採用案を避ける」だけでなく、「3 形態を表現可能」「Phase 10 ダッシュボードキー単一性」「形態切替柔軟性」という本質根拠で A-2 採用。A-3「variant 識別子内包」も独立評価されており、cycle-179 サブ判断 3-a を所与にしない旨が L119 で明示（AP-P11 への対処）。ゼロベース。
- **判断 B**: 「型枠のみ含める / 一括含める / 全部 Phase 10.4」の 3 案。正本 L104 と Phase 10.4 の責務分離 + cycle-195 A-3 再発防止という本質根拠。ゼロベース。
- **判断 D**: 「meta のみ / robots.txt のみ / 両方」の 3 案。cycle-175 commit 根拠 + Google 挙動という本質根拠。ゼロベース。
- **判断 C / E**: 採否理由が「既存パターン整合性」「Phase 11.2 撤去フローとの干渉回避」「Phase 8 開始遅延回避」など本質に基づく。

##### 観点 4: 完了基準の検証可能性

- **(1) 3 形態表現可能**: T-2 L106 で「3 形態それぞれを表現する型レベル fixture が型エラーなく書ける」を vitest で検証する旨が明記。Yes/No 判定可能。
- **(2) 入出力 placeholder 型枠**: T-2 アウトプットに「入出力 placeholder 宣言枠」が含まれ、tsc + vitest で検証。Yes/No 判定可能。
- **(3) codegen 拡張**: T-3 で codegen 出力の pure function 単体テスト + `tsc` + `next build` で検証。Yes/No 判定可能。
- **(4) hidden ルート枠**: T-4 で `next build` でルート生成確認 + レスポンス HTML の noindex meta 確認。Yes/No 判定可能。
- **(5) 正本未書換**: `git diff docs/design-migration-plan.md` 1 コマンドで検証可能。
- **(6) 検証コマンド**: 4 コマンド明示。
- すべて客観的に判定可能。

##### 観点 5: 来訪者価値の連結

- 計画書 L36-42 で本サイクル単体では来訪者から見える変化がないことを正直に認めつつ、Phase 7 → 8 → 10 → 道具箱公開ラインが動き出す土台として位置付けている。
- T-2 の型契約 → Phase 8 第 1 弾サイクル PM がタイル定義 1 件を「1 slug : N タイル定義」のどの形態でも書ける状態になる。
- T-3 の codegen → Phase 8 でタイル定義ファイルを 1 件置けば自動収集される状態になる。
- T-4 の hidden ルート → Phase 8 各サイクルで「タイル単独表示の視覚検証」が即実施可能になる。
- 次以降のサイクルで来訪者価値に転化される基盤として連結している。今サイクル内で完結してしまう「孤立した成果物」ではない。

#### 指摘事項

- **CRIT-N（致命）**: なし
- **MAJOR-N（重要）**: なし
- **MINOR-N（軽微）**: なし

  補足：完了基準 (4) の hidden ルートで `sharedMetadata` の `robots: index=true` を `page.tsx` 側 `metadata` export で上書きする実装パターン（正本 metadata 管理ルール L335-336 / 既存 `(new)/storybook` パターンと整合）は計画書 T-4 L151 で既に言及済み、過不足なし。

#### 結論

Pass。PM に planner へ Pass 報告を行うよう依頼してください。本計画書は cycle-195 §A-1〜§A-6 で言語化された 6 つの構造的失敗（CLAUDE.md「Verify facts」違反 / AP-P11/16/17 違反 / 正本矛盾 / cycle-175 同型矛盾 / Rule 4 違反 / 運用ルール形式的発火）すべてに対して具体的な対処が組み込まれており、原典との照合も reviewer 自身の Read で確認済み。次フェーズ（`/cycle-execution`）への移行を支持する。

## キャリーオーバー

- <このサイクルで完了できなかった作業や、次のサイクルに持ち越す必要のある作業があれば、ここと /docs/backlog.md の両方に記載する。>

## 補足事項

### kickoff 時の選定判断

- **B-426 を選んだ理由**: cycle-197 振り返り（`docs/cycles/cycle-197.md` 「次サイクルの方向性」セクション）で、cycle-198 は Phase 7（B-426）または Phase 8（B-314）に戻ることが Owner 指摘経由で確定している。Phase 8 = B-314 は Phase 7 = B-426 の完了が前提（B-314 の Notes に明記）のため、選択肢は実質 B-426 のみ。Phase 7 を 5 サイクル目に挑むことになるが、`design-migration-plan.md` という具体計画書を無視し続けることのほうが visitor 価値最大化から遠ざかる。
- **検討した他の選択肢**:
  - 独立 P3 タスク（B-388 Pagination 44px / B-393 Header 44px / B-390 AP 集監査 等）: cycle-197 で「成功体験を継続するための独立・低リスクタスク」を選んだ判断が **Owner 指摘で計画違反と認定** されたため、同じ路線は採れない。
  - Phase 7 を回避して Phase 8 のうち Phase 7 非依存の部分だけやる: Phase 8 全体が Phase 7 のタイル基盤に依存するため不可。
- **キャンセル条件**: なし。Phase 7 をやり切るまで他のフェーズには進めない構造。

### 4 連敗を踏まえた歯止め策（cycle-planning に渡す指針）

- **過去判定の所与継承を絶つ**: planner / builder 共に `cycle-193.md` / `cycle-195.md` の「結論」を再利用しない。原典である `docs/design-migration-plan.md` を Read で直接読み、そこから出発する。
- **スコープを膨張させない**: cycle-191/192/193/195 はいずれも「Phase 7 を一括で完成させる」前提で膨張して破綻している。1 サイクルでは Phase 7.1（型契約）/ Phase 7.2（サイズ枠規格）/ Phase 7.3（レジストリ）/ Phase 7.x（タイル placeholder 等）のうちどれを完成させるかを planner が明示的に切り分ける。
- **robots.txt に hidden URL を書かない**: cycle-175 / cycle-195 で同型事故が起きており、cycle-195 では事後修正コミット（`fe687675 cycle-195 事後修正: robots.txt 重大事故対応`）が必要になった。本サイクルでは hidden URL の存在自体を sitemap / robots に出さない方針を計画段階で確定する。
- **計画立案後にレビューを必ず通す**: planner が立てた計画に対し、別の reviewer エージェントに「`design-migration-plan.md` Phase 2.2 / Phase 7.1 / Phase 8.1 と整合しているか」を検証させる。レビューで否定された場合は再計画する。

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
