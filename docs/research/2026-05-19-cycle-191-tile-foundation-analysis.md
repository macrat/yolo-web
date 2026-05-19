# cycle-191 タイル基盤実装の調査報告

作成日: 2026-05-19（cycle-195 Phase 7 設計判断材料）

---

## 1. cycle-191 の関連 commit 一覧

### タイル基盤に直接関係する commit（時系列順）

| commit hash | タイトル                                                              | 日時             |
| ----------- | --------------------------------------------------------------------- | ---------------- |
| `0b22d007`  | T-C-事例発散: 3 ツールからタイル共通要素 5 個を帰納                   | 2026-05-14 16:59 |
| `0b5143d4`  | T-C-型契約: TileVariant 型新設 + 設計ドキュメント追記                 | 2026-05-14 17:12 |
| `68536a18`  | T-C-検証場所: /internal/tiles 配置 + 13 バリアントプレースホルダ      | 2026-05-14 17:45 |
| `a94659d9`  | T-B-実装: 新版 9 コンポーネント新規実装                               | 2026-05-14 16:34 |
| `e9d72b58`  | T-D-実装: keigo-reference medium-search + small-daily-pick タイル実装 | 2026-05-14 18:xx |
| `fb2a0e16`  | cycle-191 完了                                                        | 2026-05-14 19:30 |

### 全 revert 系 commit

| commit hash | タイトル                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| `685cfe9c`  | cycle-192/cycle-191 全コード成果物を破棄し cycle-191 着手前 (e5bb6bce) に復元 |
| `758bcc39`  | cycle-193 後処理: 全コードを着手前 (f5ab12fe) に revert                       |

BASE_REF = `f5ab12fe`（cycle-193 着手前 = cycle-191/192 成果物すべてを含む状態）

---

## 2. pre-revert 状態からの実装内容復元

### 2-1. TileVariant 型（`src/lib/toolbox/tile-variant-types.ts`）

**参照**: `git show 0b5143d4:src/lib/toolbox/tile-variant-types.ts`

設計判断: **判断 B（新型新設）** を採用。

- cycle-191 は `Tileable` 型を拡張しなかった。理由: Tileable は「1 コンテンツ = 1 エントリ」のメタデータ型（slug / displayName 等）であり、TileVariant は「1 コンテンツ = N バリアント」のバリアント表示仕様型（サイズ / 機能説明 / ローダー参照）という別概念。
- 既存 Tileable を参照する 84 箇所以上のコードへの後方互換性を保つため分離。
- **新設ファイル**: `src/lib/toolbox/tile-variant-types.ts`

型構造（5 フィールド）:

| フィールド         | 型           | 説明                                                   |
| ------------------ | ------------ | ------------------------------------------------------ |
| `variantId`        | string       | バリアント識別子。命名規則 `{slug}-{size}-{feature}`   |
| `gridSpan`         | TileGridSpan | 推奨グリッドスパン（`{ cols: number, rows: number }`） |
| `tileDescription`  | string       | visitor 向け機能説明（30〜60 文字）                    |
| `loaderId`         | string       | tile-loader.ts への間接参照 ID（D-3 案採用）           |
| `isDefaultVariant` | boolean      | デフォルトバリアントフラグ                             |

コンポーネント参照方式（**D-3: loaderId 採用**）:

- D-1（React.ComponentType 直保持）: bundle 肥大化で不採用
- D-2（パス文字列）: Next.js の static analysis 要件で不採用
- D-3（loaderId 間接参照）: 既存 tile-loader.ts の slug ベース lazy loader 方式と整合

サイズ規格: cycle-191 時点では `small=1×1 / medium=2×1 / large=2×2` の数値を型（TileGridSpan）に記録。cycle-194 で `128px × 128px + 8px マージン` の物理定数が確定し、Phase 7.2 の責務として design-migration-plan.md に反映済み。

**テスト**: `src/lib/toolbox/__tests__/tile-variant-types.test.ts`（300 行 / 3 事例全バリアントで値埋め確認）

---

### 2-2. `/internal/tiles` 検証ルート

**参照**:

- `git show 68536a18:src/app/(new)/internal/tiles/page.tsx`
- `git show 68536a18:src/app/(new)/internal/tiles/TilesPreviewContent.tsx`
- `git show 68536a18:src/app/(new)/internal/tiles/page.module.css`

**実装内容**:

- Next.js のルートとして `src/app/(new)/internal/tiles/` に配置
- `metadata.robots = { index: false, follow: false }` で noindex（visitor に意図せず公開されない）
- `/storybook` は共通コンポーネント専用（design-migration-plan.md の規定）のため、コンテンツ固有タイルには別ルートを新設

**TILE_REGISTRY 構造（TilesPreviewContent.tsx 内に定義）**:

```typescript
interface TileRegistryEntry {
  slug: string;          // コンテンツ slug
  displayName: string;   // 表示名
  variants: TileVariant[]; // バリアント一覧
}
const TILE_REGISTRY: TileRegistryEntry[] = [...]
```

登録内容（T-C-検証場所 時点、プレースホルダ）:

- `keigo-reference`: 6 バリアント（large-full / medium-search / medium-category-business / medium-mistakes / small-daily-pick / small-quick-search）
- `sql-formatter`: 3 バリアント（large-full / medium-format / medium-minify）
- `char-count`: 4 バリアント（large-full / medium-text-volume / medium-text-structure / small-char-only）

**設計上の特徴**:

- `TILE_REGISTRY` 配列にエントリを追加するだけで検証ページに自動反映
- 本サイクル（T-C 時点）はプレースホルダ表示のみ（Tile.tsx 本体未実装）
- T-D-実装 で keigo-reference の small + medium タイルが実装され、loaderId に対応する実コンポーネントを表示する予定だった

**重要**: cycle-194 の Phase 7.3 定義では `/internal/tiles` の責務を「タイル単独表示の検証場所」に限定し、「CSS Grid サイズ規格の検証」「ダッシュボード本体のグリッド検証」は Phase 10（道具箱本体）の責務と明確に分離している。

---

### 2-3. 9 コンポーネントのうち「タイル基盤関連」のもの

**参照**: cycle-194.md T-3 実施結果（L720〜838）

9 コンポーネント全体:

| コンポーネント   | 配置先                                        | Phase 7 スコープとの関係                                |
| ---------------- | --------------------------------------------- | ------------------------------------------------------- |
| AccordionItem    | `src/components/AccordionItem/`               | (γ) 両方の境界 → Phase 7 昇格待ち                       |
| PrivacyBadge     | `src/components/PrivacyBadge/`                | (γ) 両方の境界 → **Phase 2.3 対象**（現状 main に不在） |
| ResultCopyArea   | `src/components/ResultCopyArea/`              | (γ) 両方の境界 → Phase 7 昇格待ち                       |
| ToolDetailLayout | `src/tools/_new-components/ToolDetailLayout/` | (β) ツール詳細専用 → Phase 7 各サイクル                 |
| IdentityHeader   | `src/tools/_new-components/IdentityHeader/`   | (β) ツール詳細専用 → Phase 7 各サイクル                 |
| TrustSection     | `src/tools/_new-components/TrustSection/`     | (β) ツール詳細専用 → Phase 7 各サイクル                 |
| LifecycleSection | `src/tools/_new-components/LifecycleSection/` | (β) ツール詳細専用 → Phase 7 各サイクル                 |
| ToolInputArea    | `src/tools/_new-components/ToolInputArea/`    | (β) ツール詳細専用 → Phase 7 各サイクル                 |
| useToolStorage   | `src/lib/use-tool-storage.ts`                 | (α) 道具箱基盤 → **Phase 2.3 対象**（現状 main に不在） |

**Phase 7 スコープ（今サイクル）に直接含まれるもの**:

- `TileVariant` 型（`src/lib/toolbox/tile-variant-types.ts`）— 新規実装
- サイズ枠規格定数（`src/tools/_constants/tile-grid.ts` 相当）— 新規実装
- `/internal/tiles` 検証ルート — 新規実装
- レジストリの仕組み（codegen 連携 or TILE_REGISTRY 直定義）— 新規実装

**Phase 7 スコープに含まれない（cycle-194 T-3/T-4 確定）**:

- useToolStorage → Phase 2.3（先行整備済み or 本サイクル前に整備）
- PrivacyBadge → Phase 2.3
- ToolDetailLayout / IdentityHeader / TrustSection / LifecycleSection / ToolInputArea → Phase 8 各サイクルで feature-private 実装
- AccordionItem / ResultCopyArea → Phase 7 第 1 弾で実利用発生時に昇格

---

## 3. cycle-191 の設計意図と cycle-193 で全 revert になった理由

### cycle-191 の設計意図

cycle-190 失敗（旧コンセプト構造の盲目踏襲）を受けて、cycle-191 は「後続 53 サイクルが乗る基盤」としてゼロベース再設計を行った。以下を達成目標として掲げた:

1. 新コンセプト「日常の傍にある道具」下での詳細ページ階層設計（4 階層 = 識別/使用/信頼透明性/生活組込）
2. 新版共通コンポーネント 9 個の新規実装
3. タイルシステム整備（TileVariant 型 / 3 事例 13 バリアント / /internal/tiles 検証場所）
4. keigo-reference の small + medium タイル 2 件の実装（設計検証ミニ適用）

### cycle-191 で問題になった設計判断

1. **TileVariant 型の 4 値 union 設計**: `small/medium/large/large-full` の 4 値 union を TileVariant 型に導入。cycle-179 でサブ判断 3-a として `variantId` 系が撤去確定済だったが、cycle-191 PM はこれを参照せず再導入した（AP-P11 同型発火）。
2. **3 バリアント並列実装**: cycle-179 の「(b) 1 対多採用 = タイルは 1 つの軽量版のみ」という確定を知らずに複数バリアント体系を構築。
3. **ディレクトリ配置の混在**: ToolDetailLayout 等の「ツール詳細専用」コンポーネントを `src/components/` 直下に配置（feature-based directory structure 違反）。
4. **Tile.large-full.tsx 概念**: 詳細ページ本体をタイルとして扱う発想が cycle-179 の「タイル = 詳細ページとは別の軽量版 UI」と矛盾。

### cycle-192 での問題

cycle-192 は cycle-191 の成果物の上で keigo-reference の (legacy)→(new) 移行を実施したが、「コンパイル通過・200 OK・テキスト表示」を「動く」と判定して design 要件を一切満たしていなかった（cycle-192.md 事故報告）。全コード成果物を cycle-191 着手前（e5bb6bce）に revert。

### cycle-193 での問題と全 revert の理由

cycle-193 は cycle-191/192 全 revert 後のクリーンな状態から「Phase 7 第 1 弾 = keigo-reference 移行 + Phase 7 基盤モジュール 9 個」を再実装した。しかし：

**(a) Phase 9 全体留意違反**: 実物観察前に Phase 7 基盤モジュール 9 個を固定実装した（design-migration-plan.md L218-222「実物観察前にダッシュボード本体の形式を計画書で固定すれば投機的拡張を再生産する」違反）

**(b) cycle-178 縮小経緯の未確認**: Phase 2 が「概念定義 + 型契約のみ」に縮小された経緯（cycle-178 commit `82c7335e`）を確認せず、Phase 7 が構造的過負荷状態であることを認識しなかった。

**(c) AP-P11 同型発火**: cycle-178 縮小判断を「変更不可の制約」として継承した。

**(d) Owner 指摘の無批判採用**: 一次資料確認なしに失敗認定 + 部分 revert 案を出した。

さらに、cycle-193 の failure クローズ後に Playwright 実機検証で `/tools/keigo-reference` の Panel に `max-width` 設定が欠如し w1280/w1900 でレイアウト破綻が発覚（Header/Footer は max-width: 1200px で中央寄せだがツール詳細ページの Panel だけ全幅）。これが最終的な全 revert（commit `758bcc39`）の直接の契機となった。

---

## 4. メタ型へのタイル定義追加方式の比較（cycle-191 の判断）

### 前提: Phase 2.1 #3 の確定内容（cycle-179）

cycle-179 B-309-3 #3 / サブ判断 3-a で以下が確定済:

- **(b) 1 対多採用**: 1 詳細ページ対多タイル（タイルは詳細ページの軽量版）
- **(c) 複数バリエーション不採用**: variantId 系は撤去
- `variantId` 系撤去: tile-loader.ts の `getTileComponent(slug)` 引数は slug 単独を維持

### cycle-191 の実際の判断（AP-P11 発火で問題視された部分）

cycle-191 PM は cycle-179 確定文を参照せず、以下を独自に設計した:

| 判断事項           | cycle-191 の選択                                                          | cycle-179 確定との関係                                                                           |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| メタ型への追加方式 | **判断 B（新型新設）**: Tileable 型を拡張せず `TileVariant` を独立新設    | (b) 1 対多採用と形式上は矛盾しないが、複数バリアント体系（3〜6 バリアント）は (c) 不採用に反する |
| バリアント識別     | `variantId` を `TileVariant.variantId` と `TileVariant.loaderId` で再導入 | cycle-179 サブ判断 3-a「variantId 系撤去」に直接反する                                           |
| バリアント数       | keigo-reference に 6 バリアント（small×2/medium×4/large×1）を定義         | (c) 複数バリエーション不採用を無視                                                               |
| サイズ規格         | gridSpan = `{ cols: number, rows: number }` で数値直書き                  | cycle-194 で 128px × 128px + 8px の物理定数として確定                                            |

### Phase 2.1 #3 と整合する方式（cycle-193 屋台骨の確認）

cycle-193 屋台骨（L271）が撤回した内容:

- `TileVariant` 型 4 値 union
- 3 バリアント並列実装
- tile-loader.ts の拡張（variantId 引数 / loader cache キー変更）
- CSS Grid サイズ規格を本サイクルで実装

cycle-193 が採用すべきだったとした屋台骨（L268-275）:

- **タイルは「1 つの軽量版タイル」のみ**（cycle-179 (b) 1 対多採用）
- tile-loader.ts は「slug === "keigo-reference" の if 分岐を 1 件追加するのみ」

### cycle-194 で確定した Phase 7 の設計方針（design-migration-plan.md Phase 7）

- **7.1**: Tileable / TileComponent 等のインタフェース整備。Phase 2.1 #3 の判断に従う
- **7.2**: 基本セル 128px × 128px / マージン 8px を `src/tools/_constants/tile-grid.ts` に定数化
- **7.3**: codegen でタイル一覧を集約 + `/internal/tiles` 等の hidden URL 整備

---

## 5. Phase 7 で「残すべきもの」と「撤回すべきもの」の輪郭

### Phase 7（今サイクル）で実装すべきもの

以下は cycle-193 屋台骨の撤回対象にならず、かつ cycle-194 design-migration-plan.md Phase 7 で明示されているもの:

1. **型契約（7.1）**: Tileable / TileComponent 等のインタフェース整備（Phase 2.1 #3 に従う）
2. **サイズ枠規格定数（7.2）**: `tile-grid.ts` に `TILE_CELL_PX = 128 / TILE_GAP_PX = 8` を定数化
3. **レジストリの仕組み（7.3）**: codegen による一覧集約 + `/internal/tiles` 検証ルート整備

### Phase 7 で採用してはいけないもの（cycle-191 からの反面教師）

| 撤回対象                                                            | 撤回理由                                                                       | 出典                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| `TileVariant` 型の 4 値 union（small/medium/large/large-full）      | cycle-179 サブ判断 3-a で variantId 系撤去確定済                               | cycle-193 屋台骨 L271                            |
| 複数バリアント並列体系（keigo-reference に 6 バリアント等）         | (c) 複数バリエーション不採用（cycle-179 確定）、投機的拡張                     | cycle-193 屋台骨 L271 / 撤回判断サマリ           |
| tile-loader.ts の variantId 引数 / loader cache キー拡張            | cycle-179 B-309-5 で撤去済の状態を維持                                         | cycle-193 屋台骨 L272                            |
| CSS Grid サイズ規格を検証ルートで実装（ダッシュボード本体グリッド） | Phase 10（道具箱本体）の責務                                                   | cycle-193 屋台骨 L271 / cycle-194 Phase 7.3 説明 |
| ToolDetailLayout 等 9 コンポーネントを Phase 7 で固定実装           | 実物観察前の投機的基盤（Phase 9 全体留意違反）、(β) は Phase 8 feature-private | cycle-193 失敗の核心 (a) / cycle-194 T-3 結果    |
| useToolStorage / PrivacyBadge を Phase 7 で実装                     | Phase 2.3 で先行整備済みのはず（現在 main に不在のため Phase 2.3 着手が先）    | cycle-194 T-4 結果                               |

### 現状（main）の確認

現在 main に **存在しないもの**（cycle-193 revert により）:

- `src/lib/toolbox/tile-variant-types.ts` — 不在
- `src/app/(new)/internal/` ディレクトリ全体 — 不在
- `src/components/PrivacyBadge/` — 不在
- `src/components/AccordionItem/` — 不在
- `src/components/ResultCopyArea/` — 不在
- `src/tools/_new-components/` ディレクトリ — 不在
- `src/lib/use-tool-storage.ts` — 不在

Phase 7 実装の参照元（pre-revert コード）:

```
git show f5ab12fe^:<path>
```

または各 commit を直接参照:

- TileVariant 型: `git show 0b5143d4:src/lib/toolbox/tile-variant-types.ts`
- /internal/tiles ページ: `git show 68536a18:src/app/(new)/internal/tiles/TilesPreviewContent.tsx`
- /internal/tiles page.tsx: `git show 68536a18:src/app/(new)/internal/tiles/page.tsx`
- /internal/tiles CSS: `git show 68536a18:src/app/(new)/internal/tiles/page.module.css`

---

## 6. 一次資料参照先まとめ

| 調査対象                                       | 参照先                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| TileVariant 型定義（コード実体）               | `git show 0b5143d4:src/lib/toolbox/tile-variant-types.ts`                |
| TileVariant 型テスト                           | `git show 0b5143d4:src/lib/toolbox/__tests__/tile-variant-types.test.ts` |
| /internal/tiles ページ実装                     | `git show 68536a18:src/app/(new)/internal/tiles/TilesPreviewContent.tsx` |
| /internal/tiles page.tsx + metadata            | `git show 68536a18:src/app/(new)/internal/tiles/page.tsx`                |
| cycle-191 設計意図（屋台骨・Done 条件）        | `docs/cycles/cycle-191.md` L1〜68                                        |
| cycle-193 失敗の核心 4 点                      | `docs/cycles/cycle-193.md` L14〜42                                       |
| cycle-193 屋台骨（撤回判断）                   | `docs/cycles/cycle-193.md` L266〜296                                     |
| cycle-194 T-3 実施結果（9 コンポーネント分類） | `docs/cycles/cycle-194.md` L720〜838                                     |
| cycle-194 T-4 実施結果（Phase 2 取り扱い）     | `docs/cycles/cycle-194.md` L965〜1065                                    |
| Phase 7 現行定義（行動指示書）                 | `docs/design-migration-plan.md` L95〜127                                 |
| Phase 2.3 現行定義                             | `docs/design-migration-plan.md` （grep "Phase 2.3" で特定）              |
