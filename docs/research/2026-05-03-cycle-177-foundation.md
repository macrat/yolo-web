# cycle-177 前提整理レポート

作成日: 2026-05-03  
対象: cycle-177 planner（B-309 ダッシュボード機能フェーズ1 の継続）

---

## 1. 保持されている基盤層（A 分類）の現在の状態

### 1.1 ファイル一覧と役割

cycle-176 事故報告（`docs/cycles/cycle-176.md` L474-499）で「A. そのまま使える」に分類された成果物が現在 `src/` に存在することを実体確認済み。

#### B-1: registry codegen 拡張

| ファイルパス                                          | 役割                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| `scripts/generate-toolbox-registry.ts`                | tools / cheatsheets 用 generated registry も生成するよう拡張されたスクリプト   |
| `scripts/__tests__/generate-toolbox-registry.test.ts` | 27 テスト                                                                      |
| `src/tools/generated/tools-registry.ts`               | 自動生成（tools 全34種の ToolMeta + ToolDefinition）                           |
| `src/cheatsheets/generated/cheatsheets-registry.ts`   | 自動生成（cheatsheets 全7種の CheatsheetMeta）                                 |
| `src/tools/registry.ts`                               | thin re-export 化（`getAllToolSlugs` 等を generated から再エクスポート）       |
| `src/cheatsheets/registry.ts`                         | thin re-export 化（`getAllCheatsheetSlugs` 等を generated から再エクスポート） |

設計: tools / cheatsheets の手書き registry が解消され、codegen が SSoT になっている。既存 caller の export API は維持されており破壊的変更なし。

#### B-2: TileDefinition の slug ベース lazy loader

| ファイルパス                                    | 役割                                                     |
| ----------------------------------------------- | -------------------------------------------------------- |
| `src/lib/toolbox/tile-loader.ts`                | slug → next/dynamic コンポーネントローダー本体           |
| `src/lib/toolbox/FallbackTile.tsx`              | Phase 2 での全タイル向けフォールバック表示コンポーネント |
| `src/lib/toolbox/__tests__/tile-loader.test.ts` | variant 拡張テストを含む tile-loader の単体テスト        |

設計ポイント（`tile-loader.ts` 実装確認済み）:

- `TileComponentLoader` 型が `React.ComponentType<TileComponentProps>` として定義されている
- `TileLoaderOptions.variantId?` フィールドにより Phase 7 の 1 対多サポート拡張ポイントが確保されている
- `DEFAULT_VARIANT_ID = "default"` が Phase 2 の全タイルに適用される
- `loaderCache` により同一 slug + variantId の再 import を防いでいる
- `ssr: false` で FallbackTile をロードしている（dnd-kit hydration mismatch 対策）
- Phase 2 では全 slug に対して FallbackTile を返す設計で、Phase 3 以降で slug ごとの動的 import に切り替える想定

`tmp/cycle-176-bundle-baseline.md` に First Load JS 計測値のベースラインが記録されている。

#### B-3: scroll-lock MobileNav 移行

| ファイルパス                            | 役割                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `src/lib/scroll-lock.ts`                | 参照カウンタ式スクロールロックヘルパ（`acquireScrollLock` / `releaseScrollLock`） |
| `src/components/common/MobileNav.tsx`   | `acquireScrollLock` / `releaseScrollLock` 経由に統一済み                          |
| `src/lib/__tests__/scroll-lock.test.ts` | scroll-lock の単体テスト                                                          |

設計ポイント（実装確認済み）:

- MobileNav は `isOpen` 変化を `useEffect` で監視し、open 時に `acquireScrollLock()`、cleanup 時に `releaseScrollLock()` を呼ぶ
- 独自の `overflow` 操作は一切ない（AP-I07 準拠）
- 旧実装の二重管理は解消済み

#### B-4: useToolboxConfig SSR throw

| ファイルパス                                         | 役割                                          |
| ---------------------------------------------------- | --------------------------------------------- |
| `src/lib/toolbox/useToolboxConfig.ts`                | SSR 環境での throw + JSDoc 警告で契約を明示化 |
| `src/lib/toolbox/__tests__/useToolboxConfig.test.ts` | SSR 誤用検出テストを含む                      |

設計ポイント（実装確認済み）:

- `typeof window === "undefined"` の環境で `throw new Error(...)` を発火させ誤用を早期検出
- JSDoc に `@example` で正しい使用パターン（`dynamic({ ssr: false })`）を明示
- `notifyChange()` 関数を export して B-313 シェア URL 復元でも同一タブフックに通知できる設計

#### B-5: storage 整合性救済

| ファイルパス                                | 役割                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `src/lib/toolbox/storage.ts`                | `repairTiles` 関数追加（slug 重複先勝ち dedupe + order 連番振り直し） |
| `src/lib/toolbox/__tests__/storage.test.ts` | 救済ロジックテスト 14 件追加                                          |

設計ポイント（実装確認済み）:

- `isSchemaV1Shape`（型チェック）と `isSchemaV1TilesConsistent`（整合性チェック）を分離
- 型チェック通過 + 整合性 NG の場合のみ `repairTiles` で自動救済
- 救済時に `console.warn` を出力（DevTools で検知可能）
- `repairTiles` は純粋関数として export 可能な設計で B-313 でも再利用できる
- `saveConfig` / `loadConfig` / `TOOLBOX_CONFIG_STORAGE_KEY` が公開 API

### 1.2 Tileable 基底型（types.ts）と toolbox registry

| ファイルパス                                    | 役割                                                     |
| ----------------------------------------------- | -------------------------------------------------------- |
| `src/lib/toolbox/types.ts`                      | Tileable 型 + toTileable adapter 関数                    |
| `src/lib/toolbox/registry.ts`                   | `getAllTileables()` / `getTileableBySlug()` 公開 API     |
| `src/lib/toolbox/generated/toolbox-registry.ts` | 自動生成（全 tool/play/cheatsheet を Tileable[] に変換） |
| `src/lib/toolbox/initial-default-layout.ts`     | `INITIAL_DEFAULT_LAYOUT` 定数（fixture slug 5 件）       |

`Tileable` 型のフィールド構成（`types.ts` 実装確認済み）:

- `slug`, `displayName`, `shortDescription`, `contentKind`, `icon?`, `accentColor?`, `publishedAt`, `trustLevel`, `href?`
- コンポーネント参照フィールドは持たない（slug ベース lazy loader との分離設計）

toolbox-registry の生成内容（自動生成ファイル確認済み）:

- tools 34 種、play 20 種（allPlayContents 経由）、cheatsheets 7 種 を統合

### 1.3 cycle-177 PM が依存できる A 分類の範囲

以下は cycle-177 で UI 設計を変更しても影響を受けない確立した API・契約:

- `getAllTileables(): Tileable[]` — 全コンテンツを統合して返す（`src/lib/toolbox/registry.ts`）
- `getTileableBySlug(slug): Tileable | undefined` — slug → Tileable ルックアップ
- `getTileComponent(slug, options?): TileComponentLoader` — slug → lazy loader（`src/lib/toolbox/tile-loader.ts`）
- `TileComponentProps` インターフェース（`slug`, `isEditing?`）
- `TileLoaderOptions.variantId?` — Phase 7 の拡張ポイント
- `useToolboxConfig(): UseToolboxConfigReturn` — `{ tiles, setTiles, resetToDefault }` フック（SSR 環境では throw する契約）
- `loadConfig()` / `saveConfig(tiles)` / `TOOLBOX_CONFIG_STORAGE_KEY` — storage 層 API
- `repairTiles` — 整合性救済（B-313 で再利用可能な純粋関数設計）
- `acquireScrollLock()` / `releaseScrollLock()` — scroll-lock ヘルパ（`src/lib/scroll-lock.ts`）

---

## 2. 削除されている UI/UX 層（C 分類）の範囲

cycle-176 事故認定コミット `3e9a3e9f` で復元された。git show で変更ファイルを確認済み。

### 2.1 削除済みファイル（cycle-176 開始前状態に復元）

cycle-176.md L518-523（C 分類）および事故対応セクション（L641-643）から引用:

- `src/lib/toolbox/Tile.tsx` / `Tile.module.css` / `__tests__/Tile.test.tsx`（C-1）
- `src/lib/toolbox/TileGrid.tsx` / `TileGrid.module.css` / `__tests__/TileGrid.test.tsx`（C-2）
- `src/lib/toolbox/ToolboxShell.tsx` / `ToolboxShell.module.css` / `__tests__/ToolboxShell.test.tsx`（C-3）
- `src/lib/toolbox/AddTileModal.tsx` / `AddTileModal.module.css` / `__tests__/AddTileModal.test.tsx`（C-4）

これらは cycle-176 開始前状態へ復元済み。lint / test / build の exit 0 を確認済み（cycle-176.md L523）。

### 2.2 未着手のため存在しないもの（C-5 / C-6 / D / E 群）

以下は cycle-176 の事故認定により着手していない:

- C-5: 検証ルート（noindex）+ 初期デフォルトプリセット
- C-6: `/storybook` セクション追加（Tile / TileGrid / ToolboxShell / AddTileModal 状態網羅）

なお `/storybook` ページ自体は既存（他のコンポーネントのカタログとして機能）。道具箱関連のセクションは cycle-177 で追加する必要がある。

### 2.3 cycle-176 コミット履歴の参照禁止

`4c024dab`（C-3 完了）などのコミットに C 分類実装内容が残るが、cycle-176.md L657 の通り「cycle-177 で参考にしてはならない（cycle-176 PM の派生規則化を前提にしている）」。

---

## 3. docs/design-migration-plan.md Phase 2 の完了基準

`docs/design-migration-plan.md` L89 から引用:

> **完了基準**: 道具箱の URL が 1 つに決まっている。メタ型構造（統合 / 分離）が決まっている。ツールとタイルが 1 対多になり得るかが決まっている。決定に応じたタイル対応インタフェースがメタ型に入っている。基盤コードと検証用環境で動作確認できる。来訪者向けの道具箱ページはまだ公開しない。

### 3.1 cycle-176 で確定済みの事項（A 分類成果物として保持）

| 完了基準項目                                                 | 確定済み内容                                                | 根拠                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------- |
| **道具箱の URL が 1 つに決まっている**                       | URL = `/`（トップ）                                         | cycle-175 で α-2 採用、cycle-176 でも維持（前提 A-URL） |
| **メタ型構造（統合 / 分離）が決まっている**                  | 統合（Tileable 基底型）                                     | cycle-175 採用、`src/lib/toolbox/types.ts` に存在       |
| **ツールとタイルが 1 対多になり得るかが決まっている**        | 枠あり（`TileLoaderOptions.variantId?` で拡張ポイント確保） | B-2 成果物（`tile-loader.ts`）                          |
| **決定に応じたタイル対応インタフェースがメタ型に入っている** | `getTileComponent()` + `TileComponentProps`                 | B-2 成果物                                              |

### 3.2 cycle-177 で達成すべき事項

| 完了基準項目                                 | cycle-177 での到達目標                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **基盤コードと検証用環境で動作確認できる**   | C 群実装（Tile / TileGrid / ToolboxShell / AddTileModal）+ C-5 検証ルート + C-6 storybook セクション |
| **来訪者向けの道具箱ページはまだ公開しない** | 検証ルートを noindex / nofollow で非公開に保つことの PM 確認                                         |

---

## 4. cycle-176 計画書「前提として固定する設計判断」14 項目の分類

### 4.1 前提セクションの出典と範囲

`docs/cycles/cycle-176.md` L70-110 が「前提として固定する設計判断」セクション。性質別に A / B / C の 3 区分で記載されている。

### 4.2 分類: (a) cycle-177 でも有効性確認の上で再採用可能

UI 設計と独立した技術基盤・過去の決定で、cycle-177 でも採用してよい前提:

| 識別子（計画書の呼称）        | 内容要旨                                                | 根拠                                                                                                   |
| ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **前提 A-URL** (L78)          | 道具箱の URL = `/`                                      | cycle-175 で α-2 採用済み、site-concept.md との整合                                                    |
| **前提 A-メタ型統合** (L79)   | Tileable 基底型（静的フィールド + adapter）を変更しない | cycle-175 採用済み、A 分類保持                                                                         |
| **前提 A-枠** (L80)           | 1 対多サポート = 「枠」を持つ（Phase 7 で実装）         | B-2 で型レベルに確保済み                                                                               |
| **前提 A-自動学習禁止** (L82) | 自動学習機能は採用しない                                | `docs/research/2026-05-03-toolbox-auto-learning-vs-manual-ux-research.md` で M1b dislikes との矛盾確定 |
| **前提 A-メタファ** (L83)     | 道具箱メタファの再検証はしない                          | cycle-175 で疑義 4 項目すべて根拠不十分と判明済み                                                      |
| **前提 C-codegen** (L106)     | registry codegen の二重管理解消                         | B-1 完了済み（A 分類保持）                                                                             |
| **前提 C-scroll-lock** (L107) | scroll-lock の MobileNav 移行完了                       | B-3 完了済み（A 分類保持）                                                                             |
| **前提 C-契約明示** (L108)    | useToolboxConfig の暗黙契約明示化                       | B-4 完了済み（A 分類保持）                                                                             |
| **前提 C-救済** (L109)        | storage 整合性救済の実装                                | B-5 完了済み（A 分類保持）                                                                             |

### 4.3 分類: (b) cycle-176 PM の派生規則で、cycle-177 には持ち込まない

| 識別子                                                         | 派生規則の内容                             | 持ち込まない理由                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **前提 A-視覚規約**（L81）の「揺れアニメーションは採用しない」 | DESIGN.md §4 に存在しない派生規則          | §4 は「ドラッグ中」の `box-shadow` 規定のみで揺れアニメについて沈黙している（cycle-176.md L384） |
| **前提 B-モード分離**（L88）の「揺れアニメ不採用の暗黙合意」   | 「検討した他の選択肢」セクションでも誤参照 | 同上                                                                                             |
| **前提 B-調査充足**（L102）の「UI/UX 調査の追加実施はしない」  | アニメーション採否を「調査充足」と見なした | アニメーション採否は未調査（cycle-176.md L563-568）                                              |

DESIGN.md §4（cycle-175 追記の 11 行、DESIGN.md L69-78）が実際に定める内容:

- ドラッグ中の視覚表現: `box-shadow: var(--shadow-dragging)` のみ。半透明・色相変化・スケール変化禁止
- 編集モードのタイル: アクセント色で「触れる状態」を示すことができる（許可規定）
- grab/grabbing カーソル: ドラッグハンドル要素のみ
- 編集モード中のタイル本体クリック禁止: `pointer-events: none`
- SSoT メタ規約（コードコメントへの重複禁止）

「揺れアニメーション」「アニメーション全般」「transition」については **沈黙**（禁止条文なし）。

### 4.4 分類: (c) cycle-177 PM が独立検証してから採否を決める

| 識別子（計画書の呼称）                           | 内容要旨                                            | 独立検証が必要な理由                                                                             |
| ------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **前提 B-Undo**（L99）                           | 削除安全策 = Undo バナー方式（数秒程度）            | 根拠の NN/g 研究・Trello 事例は有効だが、cycle-176 PM のコンテキスト下での判断のため独立検証推奨 |
| **前提 B-単一削除**（L100）                      | 本サイクルでは単一削除のみ採用                      | 範囲設定の判断根拠を独立評価する                                                                 |
| **前提 B-密度**（L94）                           | モバイル w360 で 8 タイル以上が成立すること         | 業界調査レポートは有効だが cycle-176 PM の解釈経由のため独立確認推奨                             |
| **前提 B-bundle-budget**（L101）                 | 上限を override しない                              | 判断自体は cycle-175 失敗の教訓から妥当性が高い                                                  |
| **前提 B-モード分離**（L88）の派生規則以外の部分 | Edit / Done モード分離 + DnD + Undo + a11y 代替経路 | 研究レポートの引用は有効。ただし c(b) と混在していたため cycle-177 PM が切り分けて採用する       |

### 4.5 cycle-176.md「次サイクルで同じ轍を踏まないための留意点」の要点

`docs/cycles/cycle-176.md` L538-609 より。cycle-177 planner が特に参照すべき点:

1. **規約の沈黙領域を独自規則で埋めない**（L542-545）: DESIGN.md が沈黙している領域をそのまま builder に委ねるか、独立タスクで規約改定するか。PM が計画書で派生規則化するのは禁止
2. **派生規則の根拠を結びつける前に妥当性検証**（L547-550）: 「研究レポートX → 派生規則Y」の論理的接続を独立検証する
3. **観点リストに「前提の根拠妥当性」を独立観点として加える**（L552-554）: §4 規約の遵守観点だけでなく「計画書が §4 と呼んでいるものが §4 本文と一致するか」のメタ観点
4. **アニメーション採否の独立 UI/UX 調査**（L562-568）: 以下 3 点が未調査
   - 編集モード入りの視覚フィードバック（揺れ / 浮き上がり / アクセント色 / 段階的な複合）の各案を来訪者目線で比較
   - アニメーション採用時の `prefers-reduced-motion` 対応
   - 多数のタイル同時アニメーション時のパフォーマンス影響
5. **cycle-176 計画書の前提セクションをそのまま継承しない**（L570-574）

---

## 5. B 分類資産の検証ポイント

### 5.1 B 分類資産の一覧と場所

`docs/cycles/cycle-176.md` L501-512（B 分類）:

| ファイルパス                                | 内容                                        | 既知の欠陥                           |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------ |
| `tmp/cycle-176-review-criteria.md`          | A-1 観点リスト 14 観点 + 検証手段マッピング | **観点 12 に派生規則が含まれている** |
| `tmp/cycle-176-d2-instruction.md`           | D-2 指示書テンプレート                      | cycle-176 PM のコンテキスト下で作成  |
| `tmp/cycle-176-reviewer-prompt-template.md` | reviewer プロンプトテンプレート             | cycle-176 PM のコンテキスト下で作成  |

cycle-176.md L510-512 より、「計画フェーズで採用された設計判断のうち UI 設計と独立して有効なもの（URL=`/`、メタ型統合、1 対多サポート枠）」もB分類として扱うよう申し送られている。

### 5.2 観点 12 の派生規則部分の特定

`tmp/cycle-176-review-criteria.md` L47（実体確認済み）:

> **12. DESIGN.md §4 視覚表現規約（box-shadow のみ / 半透明禁止 / 揺れアニメ不採用）の遵守【視覚】**

「揺れアニメ不採用」が §4 規約として記載されているが、DESIGN.md §4（DESIGN.md L69-78）を `Read` で全文確認した結果、「揺れアニメ不採用」の記述は §4 本文に存在しない。これが cycle-176 PM の派生規則部分。

cycle-177 PM の対応方針（cycle-176.md L505-506）:

> cycle-177 PM は派生規則部分を除いた上で参照するか、ゼロから再起草する

観点 12 を修正する場合の代替案:

- 「DESIGN.md §4 視覚表現規約の遵守: ドラッグ中は `box-shadow: var(--shadow-dragging)` のみ / opacity 変化禁止 / アクセント色許可 / ポインターイベント制御」のように §4 本文の規定のみを記述する
- アニメーション採否は独立調査後に観点に追加するかを判断する

---

## 6. アンチパターン AP-P01 / AP-WF06 の内容と適用示唆

### 6.1 AP-P01（`docs/anti-patterns/planning.md` L5-7）

> AP-P01: 計画の根幹にある仮定（検索ボリューム、PV推計、改善効果など）を定量的に実測せず、「実装フェーズで検証する」と先送りしていないか？  
> → 前提が崩れると計画全体が無意味になる。（cycle-155, 157, 159, 162, 175で実際に発生）

cycle-176 での発生パターン（cycle-176.md L400-423）:

- 派生規則「揺れアニメーション不採用」を研究レポートと M1b dislikes に結びつける際に、論理的接続の検証を省略した
- 「ジグル批評 = 揺れ批評」「アニメ → 操作手順変化」の 2 件が連想ベースの誤接続だった

**cycle-177 への適用**:

- 計画書の「前提として固定する設計判断」セクションを起草する際、各前提の根拠（研究レポート・規約・targets）との論理的接続を独立検証してから書く
- 「同じカテゴリの言葉だから」「同じ場面だから」という連想接続を採用前に確認する
- UI/UX 層の視覚表現に関する前提（特にアニメーション採否）は、既存研究 6 件で「充足済み」とせず、視覚フィードバック設計の専用調査を行う

### 6.2 AP-WF06（`docs/anti-patterns/workflow.md` L20-22）

> AP-WF06: サブエージェントに渡す事実情報（数値・日付・コンテンツ内容等）をファイルやコマンドで事前に確認したか？推測や記憶で伝えていないか？  
> → 未確認の情報がサブエージェントに渡ると、調査レポートや計画が誤った前提で作成され、将来のサイクルにも誤りが伝播する。（cycle-162, 163, 169, 171で実際に発生）

cycle-176 での発生パターン（cycle-176.md L418-423）:

- 研究レポート内容を未確認のまま「ジグル批評 = 揺れ批評」と要約して C 群 builder への指示書に流し込んだ
- 事実情報の正確性確認を省略した結果、誤前提が builder 実装に流入した

**cycle-177 への適用**:

- C 群 builder への指示書を起草する前に、引用元の研究レポートを `Read` で実際に確認する
- 「research で〇〇と言っている」と書く前に、その記述が研究レポートのどの箇所に何と書かれているかを確認する
- DESIGN.md §4 の規約内容を builder に伝える際は、§4 本文（DESIGN.md L69-78）を直接引用する

### 6.3 AP-P01 / AP-WF06 の両面チェック構造

cycle-177 PM は両 AP が「同じ事実誤認の両面を捉えている」点を認識する（cycle-176.md L418-423）:

- AP-P01: 計画段階で前提の根拠妥当性を検証しなかった（planning フェーズの問題）
- AP-WF06: builder への指示書で事実情報を確認なしに流し込んだ（execution フェーズの問題）

cycle-176 の派生規則化は計画書に入り込んだ時点（AP-P01）で発生し、builder 指示書に流れた時点（AP-WF06）でさらに固定化された。両フェーズで独立チェックを行う二重化が必要。

---

## 7. 追加参照: DESIGN.md §4 の正確な内容

cycle-177 PM が §4 を参照する際の原文（DESIGN.md L69-78、`Read` で実体確認済み）:

```
### ドラッグ・編集モードの視覚表現ルール

ドラッグ中・編集モード時の視覚表現に関して以下のルールを守る。このルールは「持ち上げて運ぶ道具」という物理的隠喩を保つために設けられている。

- **ドラッグ中の視覚表現は `box-shadow: var(--shadow-dragging)` のみ**。半透明（opacity）・色相変化・スケール変化など規定外の表現を加えてはならない
- 編集モードのタイルはアクセント色（`--accent` 系トークン）で「触れる状態」を示すことができる
- **「掴める」カーソル（`grab` / `grabbing`）表現はドラッグハンドル要素にのみ適用し、タイル本体には適用しない**。実際にドラッグ操作を開始できる領域とカーソル表現を一致させることで来訪者の誤誘導を防ぐ
- タイル本体内のクリックを編集モード中に禁止する場合は `pointer-events: none` を使う

このルールはデザインの単一情報源（Single Source of Truth）として DESIGN.md のみに記述する。コード側のコメントにこのルールの内容を重複記述してはならない。コードからこのルールに言及するときは DESIGN.md への参照を書く。
```

§4 は「ドラッグ中」の box-shadow 規定と「編集モード」のアクセント色許可を分けて記述している。アニメーション・transition・揺れについての記述は一切ない（沈黙領域）。

---

## 8. 参照すべき一次情報のパス一覧

cycle-177 planner が計画書を起草する際に `Read` で直接参照すべきファイル:

| ファイルパス                            | 参照目的                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `docs/cycles/cycle-176.md`              | 全体把握（前提セクション L70-110、事故報告 L366-636、申し送り L625-636） |
| `docs/design-migration-plan.md` L55-89  | Phase 2 のスコープ・完了基準の原文                                       |
| `DESIGN.md` L69-78                      | §4 の正確な内容（沈黙領域の確認）                                        |
| `src/lib/toolbox/types.ts`              | Tileable 型の現状（フィールド構成）                                      |
| `src/lib/toolbox/tile-loader.ts`        | slug ベース lazy loader の API・拡張ポイント                             |
| `src/lib/toolbox/storage.ts`            | storage API（TileLayoutEntry 型・repairTiles）                           |
| `src/lib/toolbox/useToolboxConfig.ts`   | フック API・SSR throw の契約                                             |
| `src/lib/toolbox/registry.ts`           | getAllTileables / getTileableBySlug の公開 API                           |
| `tmp/cycle-176-review-criteria.md`      | B 分類観点リスト（観点 12 の派生規則部分に注意）                         |
| `docs/anti-patterns/planning.md` L5-7   | AP-P01                                                                   |
| `docs/anti-patterns/workflow.md` L20-22 | AP-WF06                                                                  |
| `docs/cycles/cycle-176.md` L538-609     | 「次サイクルで同じ轍を踏まないための留意点」11 項目                      |
| `docs/cycles/cycle-177.md` L18-25       | cycle-177 の注意事項（スタート地点の確認）                               |
